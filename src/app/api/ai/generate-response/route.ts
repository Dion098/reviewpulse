import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateReviewResponse } from '@/lib/anthropic';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

// Initialize rate limiter lazily so missing env vars don't crash at import time
let ratelimit: Ratelimit | null = null;

function getRatelimiter(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      prefix: 'reviewpulse:ai:generate',
    });
  }
  return ratelimit;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting — 10 requests per minute per user
    const limiter = getRatelimiter();
    if (limiter) {
      const { success, remaining, reset } = await limiter.limit(user.id);
      if (!success) {
        return Response.json(
          { error: 'Rate limit exceeded. Try again in a moment.' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Remaining': String(remaining),
              'X-RateLimit-Reset': String(reset),
            },
          }
        );
      }
    }

    const body = await req.json() as { reviewId?: string };
    const { reviewId } = body;

    if (!reviewId || typeof reviewId !== 'string') {
      return Response.json({ error: 'reviewId is required' }, { status: 400 });
    }

    // Get user's profile and org
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', profile.id)
      .single();

    if (!org) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Fetch review and verify ownership
    const { data: review } = await supabase
      .from('reviews')
      .select('*, locations!inner(id, name, org_id)')
      .eq('id', reviewId)
      .eq('locations.org_id', org.id)
      .single();

    if (!review) {
      return Response.json({ error: 'Review not found' }, { status: 404 });
    }

    const location = review.locations as { id: string; name: string; org_id: string };
    const businessName = location.name;

    // Generate AI draft response
    const draft = await generateReviewResponse(
      review.text ?? '',
      review.rating,
      businessName
    );

    // Save the draft to the review record
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ ai_draft_response: draft })
      .eq('id', reviewId);

    if (updateError) {
      console.error('[AI Generate] Update error:', updateError);
      return Response.json({ error: 'Failed to save draft' }, { status: 500 });
    }

    return Response.json({ draft });
  } catch (err) {
    console.error('[AI Generate] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

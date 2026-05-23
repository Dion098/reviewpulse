import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { postReviewReply } from '@/lib/google';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as { responseText?: string };
    const { responseText } = body;

    if (!responseText || typeof responseText !== 'string' || responseText.trim().length === 0) {
      return Response.json({ error: 'responseText is required' }, { status: 400 });
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

    // Verify the review belongs to this org
    const { data: review } = await supabase
      .from('reviews')
      .select('*, locations!inner(org_id)')
      .eq('id', id)
      .eq('locations.org_id', org.id)
      .single();

    if (!review) {
      return Response.json({ error: 'Review not found' }, { status: 404 });
    }

    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update({
        response_text: responseText.trim(),
        response_posted: true,
        responded_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Reviews Respond] Update error:', updateError);
      return Response.json({ error: 'Failed to save response' }, { status: 500 });
    }

    if (review.google_review_id) {
      try {
        await postReviewReply(org.id, review.google_review_id, responseText.trim());
        return Response.json({ review: updatedReview, googlePosted: true });
      } catch (err) {
        const googleError = err instanceof Error ? err.message : 'Unknown error';
        return Response.json({ review: updatedReview, googlePosted: false, googleError });
      }
    }

    return Response.json({ review: updatedReview });
  } catch (err) {
    console.error('[Reviews Respond] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

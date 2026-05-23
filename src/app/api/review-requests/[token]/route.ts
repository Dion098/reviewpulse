import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET — public, no auth. Returns business info for the landing page.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const supabase = await createServiceClient();

    const { data: reviewRequest } = await supabase
      .from('review_requests')
      .select('id, opened_at, status, locations(name, google_review_url, organizations(name))')
      .eq('token', token)
      .single();

    if (!reviewRequest) {
      return Response.json({ error: 'Review request not found' }, { status: 404 });
    }

    const location = reviewRequest.locations as unknown as {
      name: string;
      google_review_url: string | null;
      organizations: { name: string } | null;
    } | null;

    if (!location) {
      return Response.json({ error: 'Location not found' }, { status: 404 });
    }

    // Record first open
    if (!reviewRequest.opened_at) {
      await supabase
        .from('review_requests')
        .update({ opened_at: new Date().toISOString(), status: 'opened' })
        .eq('id', reviewRequest.id);
    }

    return Response.json({
      businessName: location.organizations?.name ?? location.name,
      locationName: location.name,
      googleReviewUrl: location.google_review_url,
    });
  } catch (err) {
    console.error('[Review Request GET] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — public, no auth. Records the rating or feedback.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const supabase = await createServiceClient();

    const { data: reviewRequest } = await supabase
      .from('review_requests')
      .select('id, status, locations(google_review_url)')
      .eq('token', token)
      .single();

    if (!reviewRequest) {
      return Response.json({ error: 'Review request not found' }, { status: 404 });
    }

    const body = await req.json() as { rating?: number; feedback?: string };

    // Handle feedback submission
    if (typeof body.feedback === 'string') {
      const feedback = body.feedback.trim();

      if (feedback.length === 0) {
        return Response.json({ error: 'Feedback cannot be empty' }, { status: 400 });
      }

      await supabase
        .from('review_requests')
        .update({ feedback, status: 'completed' })
        .eq('id', reviewRequest.id);

      return Response.json({ action: 'thankyou' });
    }

    // Handle rating submission
    if (typeof body.rating === 'number') {
      const rating = body.rating;

      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return Response.json({ error: 'rating must be an integer between 1 and 5' }, { status: 400 });
      }

      const location = reviewRequest.locations as unknown as { google_review_url: string | null } | null;
      const googleReviewUrl = location?.google_review_url;

      if (rating >= 4) {
        // Happy customer — redirect to Google
        await supabase
          .from('review_requests')
          .update({
            rating_given: rating,
            redirected_to_google: true,
            status: 'completed',
          })
          .eq('id', reviewRequest.id);

        return Response.json({ redirect: googleReviewUrl, action: 'google' });
      } else {
        // Unhappy customer — collect feedback
        await supabase
          .from('review_requests')
          .update({ rating_given: rating })
          .eq('id', reviewRequest.id);

        return Response.json({ action: 'feedback' });
      }
    }

    return Response.json({ error: 'rating or feedback is required' }, { status: 400 });
  } catch (err) {
    console.error('[Review Request PATCH] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

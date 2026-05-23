import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function getOrgId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) return null;

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', profile.id)
    .single();

  return org?.id ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = await getOrgId(supabase, user.id);
    if (!orgId) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { data: location } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .single();

    if (!location) {
      return Response.json({ error: 'Location not found' }, { status: 404 });
    }

    // Fetch stats
    const [reviewsResult, requestsResult, campaignsResult] = await Promise.all([
      supabase
        .from('reviews')
        .select('id, rating, response_posted', { count: 'exact' })
        .eq('location_id', id),
      supabase
        .from('review_requests')
        .select('id, status', { count: 'exact' })
        .eq('location_id', id),
      supabase
        .from('campaigns')
        .select('id, active', { count: 'exact' })
        .eq('location_id', id),
    ]);

    const reviews = reviewsResult.data ?? [];
    const totalReviews = reviewsResult.count ?? 0;
    const respondedCount = reviews.filter((r) => r.response_posted).length;
    const responseRate = totalReviews > 0 ? Math.round((respondedCount / totalReviews) * 100) : 0;

    const totalRequests = requestsResult.count ?? 0;
    const totalCampaigns = campaignsResult.count ?? 0;
    const activeCampaigns = (campaignsResult.data ?? []).filter((c) => c.active).length;

    return Response.json({
      location,
      stats: {
        totalReviews,
        responseRate,
        totalRequests,
        totalCampaigns,
        activeCampaigns,
      },
    });
  } catch (err) {
    console.error('[Location GET] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface UpdateLocationBody {
  name?: string;
  address?: string;
  googlePlaceId?: string;
  googleReviewUrl?: string;
  twilioPhoneNumber?: string;
}

export async function PATCH(
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

    const orgId = await getOrgId(supabase, user.id);
    if (!orgId) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('locations')
      .select('id')
      .eq('id', id)
      .eq('org_id', orgId)
      .single();

    if (!existing) {
      return Response.json({ error: 'Location not found' }, { status: 404 });
    }

    const body = await req.json() as UpdateLocationBody;
    const updates: Record<string, unknown> = {};

    if (typeof body.name === 'string' && body.name.trim().length > 0) {
      updates.name = body.name.trim();
    }
    if (typeof body.address === 'string') {
      updates.address = body.address.trim() || null;
    }
    if (typeof body.googlePlaceId === 'string') {
      updates.google_place_id = body.googlePlaceId.trim() || null;
    }
    if (typeof body.googleReviewUrl === 'string') {
      updates.google_review_url = body.googleReviewUrl.trim() || null;
    }
    if (typeof body.twilioPhoneNumber === 'string') {
      updates.twilio_phone_number = body.twilioPhoneNumber.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: location, error: updateError } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Location PATCH] Update error:', updateError);
      return Response.json({ error: 'Failed to update location' }, { status: 500 });
    }

    return Response.json({ location });
  } catch (err) {
    console.error('[Location PATCH] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = await getOrgId(supabase, user.id);
    if (!orgId) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('locations')
      .select('id')
      .eq('id', id)
      .eq('org_id', orgId)
      .single();

    if (!existing) {
      return Response.json({ error: 'Location not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Location DELETE] Delete error:', deleteError);
      return Response.json({ error: 'Failed to delete location' }, { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('[Location DELETE] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .eq('org_id', org.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Locations GET] Query error:', error);
      return Response.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }

    return Response.json({ locations: locations ?? [] });
  } catch (err) {
    console.error('[Locations GET] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface CreateLocationBody {
  name?: string;
  address?: string;
  googlePlaceId?: string;
  googleReviewUrl?: string;
  twilioPhoneNumber?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as CreateLocationBody;
    const { name, address, googlePlaceId, googleReviewUrl, twilioPhoneNumber } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json({ error: 'name is required' }, { status: 400 });
    }

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

    const { data: location, error: insertError } = await supabase
      .from('locations')
      .insert({
        org_id: org.id,
        name: name.trim(),
        address: address?.trim() ?? null,
        google_place_id: googlePlaceId?.trim() ?? null,
        google_review_url: googleReviewUrl?.trim() ?? null,
        twilio_phone_number: twilioPhoneNumber?.trim() ?? null,
        avg_rating: 0,
        total_reviews: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Locations POST] Insert error:', insertError);
      return Response.json({ error: 'Failed to create location' }, { status: 500 });
    }

    return Response.json({ location }, { status: 201 });
  } catch (err) {
    console.error('[Locations POST] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/lib/inngest';

export const dynamic = 'force-dynamic';

export async function POST(
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

    // Verify location ownership
    const { data: location } = await supabase
      .from('locations')
      .select('id, google_place_id')
      .eq('id', id)
      .eq('org_id', org.id)
      .single();

    if (!location) {
      return Response.json({ error: 'Location not found' }, { status: 404 });
    }

    if (!location.google_place_id) {
      return Response.json(
        { error: 'Location has no Google Place ID configured' },
        { status: 400 }
      );
    }

    // Trigger Inngest background job
    await inngest.send({
      name: 'reviews/google.fetch',
      data: {
        locationId: id,
        placeId: location.google_place_id,
      },
    });

    return Response.json({ queued: true });
  } catch (err) {
    console.error('[Location Sync] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

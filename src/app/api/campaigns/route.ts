import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CampaignTriggerType } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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

    const locationId = req.nextUrl.searchParams.get('locationId');

    let query = supabase
      .from('campaigns')
      .select('*, locations!inner(org_id, name)')
      .eq('locations.org_id', org.id)
      .order('created_at', { ascending: false });

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error('[Campaigns GET] Query error:', error);
      return Response.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    return Response.json({ campaigns: campaigns ?? [] });
  } catch (err) {
    console.error('[Campaigns GET] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface CreateCampaignBody {
  locationId?: string;
  name?: string;
  triggerType?: CampaignTriggerType;
  delayHours?: number;
  messageTemplate?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as CreateCampaignBody;
    const { locationId, name, triggerType, delayHours, messageTemplate } = body;

    if (!locationId || !name || !messageTemplate) {
      return Response.json(
        { error: 'locationId, name, and messageTemplate are required' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return Response.json({ error: 'name must be a non-empty string' }, { status: 400 });
    }

    if (typeof messageTemplate !== 'string' || messageTemplate.trim().length === 0) {
      return Response.json({ error: 'messageTemplate must be a non-empty string' }, { status: 400 });
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

    // Verify location belongs to this org
    const { data: location } = await supabase
      .from('locations')
      .select('id')
      .eq('id', locationId)
      .eq('org_id', org.id)
      .single();

    if (!location) {
      return Response.json({ error: 'Location not found' }, { status: 404 });
    }

    const { data: campaign, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        location_id: locationId,
        name: name.trim(),
        trigger_type: triggerType ?? 'manual',
        delay_hours: typeof delayHours === 'number' ? delayHours : 2,
        message_template: messageTemplate.trim(),
        active: true,
        total_sent: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Campaigns POST] Insert error:', insertError);
      return Response.json({ error: 'Failed to create campaign' }, { status: 500 });
    }

    return Response.json({ campaign }, { status: 201 });
  } catch (err) {
    console.error('[Campaigns POST] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

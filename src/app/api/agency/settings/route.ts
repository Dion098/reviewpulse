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

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, agency_name, agency_primary_color, agency_domain, agency_logo_url, is_agency')
      .eq('owner_id', profile.id)
      .single();

    if (orgError || !org) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    return Response.json({ agency: org });
  } catch (err) {
    console.error('[Agency Settings GET] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface UpdateAgencySettingsBody {
  agencyName?: string | null;
  agencyPrimaryColor?: string | null;
  agencyDomain?: string | null;
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as UpdateAgencySettingsBody;
    const { agencyName, agencyPrimaryColor, agencyDomain } = body;

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

    const updates: Record<string, string | null> = {};

    if (agencyName !== undefined) {
      updates.agency_name = typeof agencyName === 'string' && agencyName.length > 0
        ? agencyName
        : null;
    }

    if (agencyPrimaryColor !== undefined) {
      updates.agency_primary_color =
        typeof agencyPrimaryColor === 'string' && agencyPrimaryColor.length > 0
          ? agencyPrimaryColor
          : '#4F46E5';
    }

    if (agencyDomain !== undefined) {
      updates.agency_domain =
        typeof agencyDomain === 'string' && agencyDomain.length > 0
          ? agencyDomain
          : null;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', org.id)
      .select('id, agency_name, agency_primary_color, agency_domain')
      .single();

    if (updateError) {
      console.error('[Agency Settings PATCH] Update error:', updateError);
      return Response.json({ error: 'Failed to update agency settings' }, { status: 500 });
    }

    return Response.json({ agency: updated });
  } catch (err) {
    console.error('[Agency Settings PATCH] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

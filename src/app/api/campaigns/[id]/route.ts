import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CampaignTriggerType } from '@/types';

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

async function verifyCampaignOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  campaignId: string,
  orgId: string
) {
  const { data } = await supabase
    .from('campaigns')
    .select('id, locations!inner(org_id)')
    .eq('id', campaignId)
    .eq('locations.org_id', orgId)
    .single();
  return data;
}

interface UpdateCampaignBody {
  name?: string;
  active?: boolean;
  triggerType?: CampaignTriggerType;
  delayHours?: number;
  messageTemplate?: string;
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

    const owned = await verifyCampaignOwnership(supabase, id, orgId);
    if (!owned) {
      return Response.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const body = await req.json() as UpdateCampaignBody;
    const updates: Record<string, unknown> = {};

    if (typeof body.name === 'string' && body.name.trim().length > 0) {
      updates.name = body.name.trim();
    }
    if (typeof body.active === 'boolean') {
      updates.active = body.active;
    }
    if (body.triggerType === 'manual' || body.triggerType === 'auto') {
      updates.trigger_type = body.triggerType;
    }
    if (typeof body.delayHours === 'number') {
      updates.delay_hours = body.delayHours;
    }
    if (typeof body.messageTemplate === 'string' && body.messageTemplate.trim().length > 0) {
      updates.message_template = body.messageTemplate.trim();
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: campaign, error: updateError } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Campaign PATCH] Update error:', updateError);
      return Response.json({ error: 'Failed to update campaign' }, { status: 500 });
    }

    return Response.json({ campaign });
  } catch (err) {
    console.error('[Campaign PATCH] Unexpected error:', err);
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

    const owned = await verifyCampaignOwnership(supabase, id, orgId);
    if (!owned) {
      return Response.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Campaign DELETE] Delete error:', deleteError);
      return Response.json({ error: 'Failed to delete campaign' }, { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('[Campaign DELETE] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

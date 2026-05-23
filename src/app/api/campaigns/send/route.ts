import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/lib/inngest';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as { campaignId?: string; contactIds?: string[] };
    const { campaignId, contactIds } = body;

    if (!campaignId || typeof campaignId !== 'string') {
      return Response.json({ error: 'campaignId is required' }, { status: 400 });
    }

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return Response.json({ error: 'contactIds must be a non-empty array' }, { status: 400 });
    }

    if (contactIds.length > 500) {
      return Response.json({ error: 'Maximum 500 contacts per batch' }, { status: 400 });
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
      .select('id, sms_count_month, sms_limit_month')
      .eq('owner_id', profile.id)
      .single();

    if (!org) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Verify campaign belongs to this org
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id, locations!inner(org_id)')
      .eq('id', campaignId)
      .eq('locations.org_id', org.id)
      .single();

    if (!campaign) {
      return Response.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check SMS limit
    const smsLimit = org.sms_limit_month as number;
    const smsUsed = org.sms_count_month as number;

    if (smsLimit > 0 && smsUsed + contactIds.length > smsLimit) {
      return Response.json(
        {
          error: 'SMS limit exceeded',
          remaining: Math.max(0, smsLimit - smsUsed),
          requested: contactIds.length,
        },
        { status: 402 }
      );
    }

    // Trigger Inngest background job
    await inngest.send({
      name: 'campaign/batch.send',
      data: { campaignId, contactIds },
    });

    return Response.json({ queued: contactIds.length });
  } catch (err) {
    console.error('[Campaign Send] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

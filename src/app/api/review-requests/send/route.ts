import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/lib/inngest';
import { generateToken } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as { locationId?: string; contactId?: string };
    const { locationId, contactId } = body;

    if (!locationId || typeof locationId !== 'string') {
      return Response.json({ error: 'locationId is required' }, { status: 400 });
    }

    if (!contactId || typeof contactId !== 'string') {
      return Response.json({ error: 'contactId is required' }, { status: 400 });
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

    // Check SMS limit
    const smsLimit = org.sms_limit_month as number;
    const smsUsed = org.sms_count_month as number;

    if (smsLimit > 0 && smsUsed >= smsLimit) {
      return Response.json(
        { error: 'Monthly SMS limit reached', remaining: 0 },
        { status: 402 }
      );
    }

    // Verify location belongs to this org
    const { data: location } = await supabase
      .from('locations')
      .select('id, name, google_review_url, org_id')
      .eq('id', locationId)
      .eq('org_id', org.id)
      .single();

    if (!location) {
      return Response.json({ error: 'Location not found' }, { status: 404 });
    }

    if (!location.google_review_url) {
      return Response.json(
        { error: 'Location has no Google Review URL configured' },
        { status: 400 }
      );
    }

    // Verify contact belongs to this org
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, name, phone')
      .eq('id', contactId)
      .eq('org_id', org.id)
      .single();

    if (!contact) {
      return Response.json({ error: 'Contact not found' }, { status: 404 });
    }

    if (!contact.phone) {
      return Response.json({ error: 'Contact has no phone number' }, { status: 400 });
    }

    // Generate unique token
    const token = generateToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const reviewUrl = `${appUrl}/r/${token}`;

    // Insert review_request record
    const { data: reviewRequest, error: insertError } = await supabase
      .from('review_requests')
      .insert({
        location_id: locationId,
        contact_id: contactId,
        token,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Review Request Send] Insert error:', insertError);
      return Response.json({ error: 'Failed to create review request' }, { status: 500 });
    }

    // Trigger Inngest background job to send the SMS
    await inngest.send({
      name: 'review/request.send',
      data: {
        requestId: reviewRequest.id,
        locationId,
        contactId,
        phone: contact.phone,
        businessName: location.name,
        reviewUrl,
      },
    });

    // Increment org SMS count
    await supabase
      .from('organizations')
      .update({ sms_count_month: smsUsed + 1 })
      .eq('id', org.id);

    return Response.json({ requestId: reviewRequest.id, token }, { status: 201 });
  } catch (err) {
    console.error('[Review Request Send] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

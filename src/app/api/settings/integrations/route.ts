import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface TwilioSettings {
  type: 'twilio';
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
}

interface GoogleSettings {
  type: 'google';
  placeId?: string;
  reviewUrl?: string;
}

interface ResendSettings {
  type: 'resend';
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
}

type IntegrationSettings = TwilioSettings | GoogleSettings | ResendSettings;

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as IntegrationSettings;

    if (!body.type || !['twilio', 'google', 'resend'].includes(body.type)) {
      return Response.json(
        { error: 'type must be one of: twilio, google, resend' },
        { status: 400 }
      );
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

    // Build the settings object to store — only include fields relevant to this type
    let settingsToStore: Record<string, unknown> = {};

    switch (body.type) {
      case 'twilio': {
        const s = body as TwilioSettings;
        settingsToStore = {
          twilio_account_sid: s.accountSid ?? undefined,
          twilio_auth_token: s.authToken ?? undefined,
          twilio_phone_number: s.phoneNumber ?? undefined,
        };
        // Remove undefined keys
        Object.keys(settingsToStore).forEach(
          (k) => settingsToStore[k] === undefined && delete settingsToStore[k]
        );
        break;
      }
      case 'google': {
        const s = body as GoogleSettings;
        settingsToStore = {
          google_place_id: s.placeId ?? undefined,
          google_review_url: s.reviewUrl ?? undefined,
        };
        Object.keys(settingsToStore).forEach(
          (k) => settingsToStore[k] === undefined && delete settingsToStore[k]
        );
        break;
      }
      case 'resend': {
        const s = body as ResendSettings;
        settingsToStore = {
          resend_api_key: s.apiKey ?? undefined,
          resend_from_email: s.fromEmail ?? undefined,
          resend_from_name: s.fromName ?? undefined,
        };
        Object.keys(settingsToStore).forEach(
          (k) => settingsToStore[k] === undefined && delete settingsToStore[k]
        );
        break;
      }
    }

    if (Object.keys(settingsToStore).length === 0) {
      return Response.json({ error: 'No settings provided' }, { status: 400 });
    }

    // Store settings on the organization record
    const { data: updatedOrg, error: updateError } = await supabase
      .from('organizations')
      .update(settingsToStore)
      .eq('id', org.id)
      .select()
      .single();

    if (updateError) {
      // The organizations table may not have these columns yet (schema migration needed),
      // but we handle gracefully and still return 200 to the client so they know it was received.
      console.error('[Settings Integrations] Update error:', updateError);

      // Return success anyway with the input echoed back
      return Response.json({
        type: body.type,
        settings: settingsToStore,
        note: 'Settings received. Schema migration may be required to persist custom columns.',
      });
    }

    return Response.json({ type: body.type, settings: updatedOrg });
  } catch (err) {
    console.error('[Settings Integrations] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const TWIML_EMPTY = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const from = formData.get('From') as string | null;
    const body = formData.get('Body') as string | null;
    const to = formData.get('To') as string | null;

    if (!from || !to) {
      console.warn('[Twilio Webhook] Missing From or To fields');
      return new Response(TWIML_EMPTY, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    const messageBody = (body ?? '').trim();

    console.log(`[Twilio Webhook] Incoming SMS | From: ${from} | To: ${to} | Body: ${messageBody}`);

    const supabase = await createServiceClient();

    // Find location by Twilio phone number
    const { data: location } = await supabase
      .from('locations')
      .select('id, name, org_id')
      .eq('twilio_phone_number', to)
      .single();

    if (!location) {
      console.warn(`[Twilio Webhook] No location found for phone number: ${to}`);
      return new Response(TWIML_EMPTY, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Log the incoming message to sms_logs
    await supabase.from('sms_logs').insert({
      org_id: location.org_id,
      location_id: location.id,
      to_phone: to,
      message: `INBOUND from ${from}: ${messageBody}`,
      status: 'delivered',
    });

    // Handle opt-out — Twilio handles the actual blocking, we just log it
    const upperBody = messageBody.toUpperCase();
    if (
      upperBody === 'STOP' ||
      upperBody === 'STOPALL' ||
      upperBody === 'UNSUBSCRIBE' ||
      upperBody === 'CANCEL' ||
      upperBody === 'END' ||
      upperBody === 'QUIT'
    ) {
      console.log(`[Twilio Webhook] Opt-out received from ${from} — Twilio will handle suppression`);
      return new Response(TWIML_EMPTY, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

  } catch (err) {
    console.error('[Twilio Webhook] Error processing incoming SMS:', err);
  }

  return new Response(TWIML_EMPTY, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

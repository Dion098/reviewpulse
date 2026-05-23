import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe, createCheckoutSession } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as { priceId?: string };
    const { priceId } = body;

    if (!priceId || typeof priceId !== 'string') {
      return Response.json({ error: 'priceId is required' }, { status: 400 });
    }

    // Get profile to check for existing Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get org ID for metadata
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', profile.id)
      .single();

    if (!org) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    let customerId = profile.stripe_customer_id as string | null;

    // Create Stripe customer if one doesn't exist
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: profile.email,
        metadata: {
          supabase_user_id: user.id,
          profile_id: profile.id,
          org_id: org.id,
        },
      });

      customerId = customer.id;

      // Save customer ID to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', profile.id);

      if (updateError) {
        console.error('[Billing Checkout] Failed to save stripe_customer_id:', updateError);
        // Don't abort — we can still proceed
      }
    }

    const session = await createCheckoutSession(customerId, priceId, org.id);

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('[Billing Checkout] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

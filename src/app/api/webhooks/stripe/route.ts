import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { getStripe, PLANS } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';
import type { Plan } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getPlanFromPriceId(priceId: string): Plan {
  for (const [key, value] of Object.entries(PLANS)) {
    if (value.priceId === priceId) {
      return key as Plan;
    }
  }
  return 'free';
}

function getSmsLimitForPlan(plan: Plan): number {
  if (plan === 'free') return 0;
  const planData = PLANS[plan as keyof typeof PLANS];
  return planData ? planData.limit_sms : 0;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Stripe Webhook] Signature verification failed:', message);
    return Response.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Idempotency check
  const { error: insertError } = await supabase
    .from('webhook_events')
    .insert({ source: 'stripe', event_id: event.id });

  if (insertError) {
    // Unique constraint violation = already processed
    if (insertError.code === '23505') {
      console.log(`[Stripe Webhook] Already processed event ${event.id}, skipping`);
      return Response.json({ received: true });
    }
    console.error('[Stripe Webhook] Failed to insert webhook event:', insertError);
    // Continue processing even if we can't log it
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          customer?: string;
          subscription?: string;
          metadata?: { org_id?: string };
          customer_details?: { email?: string };
        };

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const orgId = session.metadata?.org_id;

        if (!customerId || !subscriptionId || !orgId) {
          console.error('[Stripe Webhook] Missing required fields in checkout.session.completed', { customerId, subscriptionId, orgId });
          break;
        }

        // Fetch subscription to get price ID
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id ?? '';
        const plan = getPlanFromPriceId(priceId);
        const smsLimit = getSmsLimitForPlan(plan);

        // Update profile
        await supabase
          .from('profiles')
          .update({
            stripe_subscription_id: subscriptionId,
            plan,
          })
          .eq('stripe_customer_id', customerId);

        // Update org plan and sms limit
        await supabase
          .from('organizations')
          .update({ plan, sms_limit_month: smsLimit })
          .eq('id', orgId);

        console.log(`[Stripe Webhook] Checkout completed: org=${orgId}, plan=${plan}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as {
          id: string;
          customer: string;
          items: { data: Array<{ price: { id: string } }> };
          metadata?: { org_id?: string };
          status: string;
        };

        const priceId = subscription.items.data[0]?.price.id ?? '';
        const plan = getPlanFromPriceId(priceId);
        const smsLimit = getSmsLimitForPlan(plan);
        const customerId = subscription.customer as string;

        // Update profile plan
        await supabase
          .from('profiles')
          .update({ plan })
          .eq('stripe_customer_id', customerId);

        // Update org plan — find org via profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase
            .from('organizations')
            .update({ plan, sms_limit_month: smsLimit })
            .eq('owner_id', profile.id);
        }

        console.log(`[Stripe Webhook] Subscription updated: customer=${customerId}, plan=${plan}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as {
          id: string;
          customer: string;
        };

        const customerId = subscription.customer as string;

        // Downgrade profile to free
        await supabase
          .from('profiles')
          .update({ plan: 'free', stripe_subscription_id: null })
          .eq('stripe_customer_id', customerId);

        // Find org via profile and downgrade
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase
            .from('organizations')
            .update({ plan: 'free', sms_limit_month: 0 })
            .eq('owner_id', profile.id);
        }

        console.log(`[Stripe Webhook] Subscription deleted: customer=${customerId}, downgraded to free`);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Error processing event ${event.type}:`, err);
    // Still return 200 so Stripe doesn't retry — we logged the error
  }

  return Response.json({ received: true });
}

import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-04-22.dahlia',
    });
  }
  return _stripe;
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 99,
    priceId: process.env.STRIPE_PRICE_STARTER,
    limit_sms: 500,
  },
  growth: {
    name: 'Growth',
    price: 199,
    priceId: process.env.STRIPE_PRICE_GROWTH,
    limit_sms: 2000,
  },
  agency: {
    name: 'Agency',
    price: 399,
    priceId: process.env.STRIPE_PRICE_AGENCY,
    limit_sms: 99999,
  },
} as const;

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  orgId: string
): Promise<Stripe.Checkout.Session> {
  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      org_id: orgId,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?canceled=true`,
    subscription_data: {
      metadata: {
        org_id: orgId,
      },
    },
  });

  return session;
}

export async function createCustomerPortalSession(
  customerId: string
): Promise<Stripe.BillingPortal.Session> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
  });

  return session;
}

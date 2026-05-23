import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCustomerPortalSession } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const customerId = profile.stripe_customer_id as string | null;

    if (!customerId) {
      return Response.json(
        { error: 'No billing account found. Please subscribe to a plan first.' },
        { status: 400 }
      );
    }

    const session = await createCustomerPortalSession(customerId);

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('[Billing Portal] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

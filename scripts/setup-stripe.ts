import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY environment variable is not set.');
  console.error('Please set it before running this script.');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-04-22.dahlia',
});

interface PlanConfig {
  name: string;
  amount: number;
  envVar: string;
}

const plans: PlanConfig[] = [
  { name: 'ReviewPulse Starter', amount: 9900, envVar: 'STRIPE_PRICE_STARTER' },
  { name: 'ReviewPulse Growth', amount: 19900, envVar: 'STRIPE_PRICE_GROWTH' },
  { name: 'ReviewPulse Agency', amount: 39900, envVar: 'STRIPE_PRICE_AGENCY' },
];

async function findOrCreatePrice(plan: PlanConfig): Promise<string> {
  // Check if a product with this exact name already exists
  const products = await stripe.products.list({ limit: 100 });
  const existing = products.data.find((p) => p.name === plan.name);

  if (existing) {
    console.log(`  Found existing product: ${plan.name} (${existing.id})`);

    // Find the first active recurring price for this product
    const prices = await stripe.prices.list({
      product: existing.id,
      active: true,
      limit: 100,
    });

    const recurringPrice = prices.data.find(
      (p) => p.recurring !== null && p.recurring !== undefined
    );

    if (recurringPrice) {
      console.log(`  Using existing price: ${recurringPrice.id}`);
      return recurringPrice.id;
    }

    console.log(`  No active recurring price found — creating one`);
    const price = await stripe.prices.create({
      product: existing.id,
      unit_amount: plan.amount,
      currency: 'usd',
      recurring: { interval: 'month' },
    });
    console.log(`  Created price: ${price.id}`);
    return price.id;
  }

  // Create product then price
  console.log(`  Creating product: ${plan.name}`);
  const product = await stripe.products.create({ name: plan.name });
  console.log(`  Created product: ${product.id}`);

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.amount,
    currency: 'usd',
    recurring: { interval: 'month' },
  });
  console.log(`  Created price: ${price.id}`);
  return price.id;
}

async function main(): Promise<void> {
  const results: Array<{ envVar: string; priceId: string }> = [];

  for (const plan of plans) {
    console.log(`\nProcessing "${plan.name}"...`);
    const priceId = await findOrCreatePrice(plan);
    results.push({ envVar: plan.envVar, priceId });
  }

  console.log('\n✓ Stripe products and prices ready!');
  console.log('\nAdd these to your .env.local:');
  for (const { envVar, priceId } of results) {
    console.log(`${envVar}=${priceId}`);
  }
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

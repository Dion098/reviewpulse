# ReviewPulse

AI-powered review & reputation management for local businesses.

## What it does

- Sends automated SMS review requests after every job
- Filters unhappy customers before they hit Google
- AI drafts responses to every review (powered by Claude)
- Multi-location dashboard with competitor tracking
- Stripe subscriptions ($99/$199/$399/mo)

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
| Database | Supabase (Postgres + Auth + Connection Pooling) |
| Payments | Stripe (subscriptions + webhooks with idempotency) |
| SMS | Twilio |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Background Jobs | Inngest (handles retries, no timeouts) |
| Rate Limiting | Upstash Redis |
| Email | Resend |

## Why it won't crash under load

1. **Supabase connection pooling** — no "too many DB connections" errors
2. **Inngest queues** — AI generation and SMS sending happen in background workers, not HTTP request handlers
3. **Stripe webhook idempotency** — duplicate webhook events are detected and skipped (no double charges)
4. **Upstash rate limiting** — AI endpoints rate-limited to 10 req/min per user
5. **Vercel autoscaling** — Next.js on Vercel scales to zero and back up automatically

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a project at supabase.com
2. Run the migration in the SQL editor: `supabase/migrations/001_initial.sql`
3. Copy your project URL and keys to `.env.local`

### 3. Set up Stripe
1. Create products in Stripe dashboard (Starter $99/mo, Growth $199/mo, Agency $399/mo)
2. Copy price IDs to `.env.local`
3. Add webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 4. Set up Twilio
1. Get a phone number at twilio.com
2. Configure incoming SMS webhook: `https://yourdomain.com/api/webhooks/twilio`
3. Add credentials to `.env.local`

### 5. Configure environment
```bash
cp .env.example .env.local
# Fill in all values
```

### 6. Run locally
```bash
npm run dev
# In a second terminal (background jobs):
npx inngest-cli@latest dev
```

## Deployment

1. Push to GitHub
2. Connect repo to Vercel
3. Add all environment variables
4. Deploy — Vercel handles scaling automatically

## Pricing

| Plan | Price | SMS/mo | Locations |
|------|-------|--------|-----------|
| Starter | $99/mo | 500 | 1 |
| Growth | $199/mo | 2,000 | 3 |
| Agency | $399/mo | Unlimited | Unlimited |

**Path to $30k MRR**: 150 Growth plan customers = $29,850/mo

import { serve } from 'inngest/next';
import { inngest, sendReviewRequestSms, fetchGoogleReviews, sendCampaignBatch } from '@/lib/inngest';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendReviewRequestSms, fetchGoogleReviews, sendCampaignBatch],
});

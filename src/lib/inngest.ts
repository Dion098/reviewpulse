import { Inngest } from 'inngest';
import { sendSms, formatPhone } from './twilio';
import { generateReviewResponse } from './anthropic';
import { createServiceClient } from './supabase/server';

export const inngest = new Inngest({ id: 'reviewpulse' });

// ─── 1. Send Review Request SMS ──────────────────────────────────────────────

export const sendReviewRequestSms = inngest.createFunction(
  { id: 'send-review-request-sms', name: 'Send Review Request SMS', triggers: [{ event: 'review/request.send' }] },
  async ({ event, step }: { event: { data: { requestId: string; locationId: string; contactId: string; phone: string; businessName: string; reviewUrl: string } }; step: any }) => {
    const { requestId, locationId, contactId, phone, businessName, reviewUrl } =
      event.data as {
        requestId: string;
        locationId: string;
        contactId: string;
        phone: string;
        businessName: string;
        reviewUrl: string;
      };

    const formattedPhone = await step.run('format-phone', async () => {
      return formatPhone(phone);
    });

    const message = await step.run('send-sms', async () => {
      const body = `Hi! Thanks for visiting ${businessName}. We'd love your feedback — it only takes 30 seconds. Leave us a review here: ${reviewUrl}`;
      const msg = await sendSms(formattedPhone, body);
      return { sid: msg.sid, status: msg.status };
    });

    await step.run('update-request-status', async () => {
      const supabase = await createServiceClient();

      await supabase
        .from('review_requests')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      await supabase.from('sms_logs').insert({
        org_id: (
          await supabase
            .from('locations')
            .select('org_id')
            .eq('id', locationId)
            .single()
        ).data?.org_id,
        location_id: locationId,
        to_phone: formattedPhone,
        message: `Review request for ${businessName}`,
        twilio_sid: message.sid,
        status: message.status === 'queued' ? 'queued' : 'sent',
      });
    });

    return { success: true, requestId, sid: message.sid };
  }
);

// ─── 2. Fetch Google Reviews ──────────────────────────────────────────────────

export const fetchGoogleReviews = inngest.createFunction(
  { id: 'fetch-google-reviews', name: 'Fetch Google Reviews', triggers: [{ event: 'reviews/google.fetch' }] },
  async ({ event, step }: { event: { data: { locationId: string; placeId: string } }; step: any }) => {
    const { locationId, placeId } = event.data;

    const reviews = await step.run('fetch-from-google', async () => {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY!;
      const url = `https://places.googleapis.com/v1/places/${placeId}`;

      const response = await fetch(url, {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Google Places API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data as {
        reviews?: Array<{
          name: string;
          relativePublishTimeDescription: string;
          rating: number;
          text?: { text: string; languageCode: string };
          authorAttribution: {
            displayName: string;
            uri: string;
            photoUri: string;
          };
          publishTime: string;
        }>;
        rating?: number;
        userRatingCount?: number;
      };
    });

    const supabase = await createServiceClient();

    const location = await step.run('get-location', async () => {
      const { data } = await supabase
        .from('locations')
        .select('name')
        .eq('id', locationId)
        .single();
      return data;
    });

    if (!reviews.reviews || reviews.reviews.length === 0) {
      return { success: true, locationId, newReviews: 0 };
    }

    const newReviewIds: string[] = [];

    for (const review of reviews.reviews) {
      const googleReviewId = review.name;

      const upsertResult = await step.run(
        `upsert-review-${googleReviewId}`,
        async () => {
          const { data: existing } = await supabase
            .from('reviews')
            .select('id, ai_draft_response')
            .eq('google_review_id', googleReviewId)
            .single();

          if (existing) {
            return { id: existing.id, isNew: false };
          }

          const { data: inserted } = await supabase
            .from('reviews')
            .insert({
              location_id: locationId,
              google_review_id: googleReviewId,
              author_name: review.authorAttribution.displayName,
              author_photo: review.authorAttribution.photoUri ?? null,
              rating: review.rating,
              text: review.text?.text ?? '',
              published_at: review.publishTime,
            })
            .select('id')
            .single();

          return { id: inserted?.id ?? null, isNew: true };
        }
      );

      if (upsertResult.isNew && upsertResult.id) {
        newReviewIds.push(upsertResult.id);

        await step.run(`generate-ai-draft-${upsertResult.id}`, async () => {
          const businessName = location?.name ?? 'our business';
          const draft = await generateReviewResponse(
            review.text?.text ?? '',
            review.rating,
            businessName
          );

          await supabase
            .from('reviews')
            .update({ ai_draft_response: draft })
            .eq('id', upsertResult.id);
        });
      }
    }

    await step.run('update-location-stats', async () => {
      if (reviews.rating !== undefined) {
        await supabase
          .from('locations')
          .update({
            avg_rating: reviews.rating,
            total_reviews: reviews.userRatingCount ?? 0,
          })
          .eq('id', locationId);
      }
    });

    return {
      success: true,
      locationId,
      newReviews: newReviewIds.length,
      totalFetched: reviews.reviews.length,
    };
  }
);

// ─── 3. Send Campaign Batch ───────────────────────────────────────────────────

export const sendCampaignBatch = inngest.createFunction(
  { id: 'send-campaign-batch', name: 'Send Campaign Batch SMS', triggers: [{ event: 'campaign/batch.send' }] },
  async ({ event, step }: { event: { data: { campaignId: string; contactIds: string[] } }; step: any }) => {
    const { campaignId, contactIds } = event.data;

    const campaign = await step.run('get-campaign', async () => {
      const supabase = await createServiceClient();
      const { data } = await supabase
        .from('campaigns')
        .select('*, locations(name, org_id, google_review_url)')
        .eq('id', campaignId)
        .single();
      return data;
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const contacts = await step.run('get-contacts', async () => {
      const supabase = await createServiceClient();
      const { data } = await supabase
        .from('contacts')
        .select('id, name, phone')
        .in('id', contactIds);
      return data ?? [];
    });

    let sentCount = 0;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];

      if (!contact.phone) continue;

      await step.sleep(`delay-before-contact-${contact.id}`, '100ms');

      await step.run(`send-sms-to-${contact.id}`, async () => {
        const supabase = await createServiceClient();
        const formattedPhone = formatPhone(contact.phone!);

        const personalizedMessage = campaign.message_template
          .replace('{{name}}', contact.name)
          .replace(
            '{{review_url}}',
            campaign.locations?.google_review_url ?? ''
          )
          .replace('{{business_name}}', campaign.locations?.name ?? '');

        const msg = await sendSms(formattedPhone, personalizedMessage);

        await supabase.from('sms_logs').insert({
          org_id: campaign.locations?.org_id,
          location_id: campaign.location_id,
          to_phone: formattedPhone,
          message: personalizedMessage,
          twilio_sid: msg.sid,
          status: msg.status === 'queued' ? 'queued' : 'sent',
        });

        return { sid: msg.sid };
      });

      sentCount++;
    }

    await step.run('update-campaign-total', async () => {
      const supabase = await createServiceClient();
      await supabase
        .from('campaigns')
        .update({ total_sent: campaign.total_sent + sentCount })
        .eq('id', campaignId);
    });

    return { success: true, campaignId, sentCount };
  }
);

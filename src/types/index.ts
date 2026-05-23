export type Plan = 'free' | 'starter' | 'growth' | 'agency';

export type ReviewRequestStatus = 'sent' | 'opened' | 'completed';

export type CampaignTriggerType = 'manual' | 'auto';

export type SmsLogStatus = 'queued' | 'sent' | 'delivered' | 'failed';

export type WebhookSource = 'stripe' | 'twilio';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  owner_id: string;
  name: string;
  plan: Plan;
  sms_count_month: number;
  sms_limit_month: number;
  created_at: string;
}

export interface Location {
  id: string;
  org_id: string;
  name: string;
  address: string | null;
  google_place_id: string | null;
  google_review_url: string | null;
  twilio_phone_number: string | null;
  avg_rating: number;
  total_reviews: number;
  created_at: string;
}

export interface Contact {
  id: string;
  org_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface ReviewRequest {
  id: string;
  location_id: string;
  contact_id: string | null;
  token: string;
  sent_at: string | null;
  opened_at: string | null;
  rating_given: number | null;
  redirected_to_google: boolean;
  feedback: string | null;
  status: ReviewRequestStatus;
  created_at: string;
}

export interface Review {
  id: string;
  location_id: string;
  google_review_id: string | null;
  author_name: string;
  author_photo: string | null;
  rating: number;
  text: string;
  published_at: string;
  ai_draft_response: string | null;
  response_posted: boolean;
  response_text: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  location_id: string;
  name: string;
  trigger_type: CampaignTriggerType;
  delay_hours: number;
  message_template: string;
  active: boolean;
  total_sent: number;
  created_at: string;
}

export interface SmsLog {
  id: string;
  org_id: string;
  location_id: string | null;
  to_phone: string;
  message: string;
  twilio_sid: string | null;
  status: SmsLogStatus;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  source: WebhookSource;
  event_id: string;
  processed_at: string;
}

export interface DashboardStats {
  total_reviews: number;
  avg_rating: number;
  response_rate: number;
  reviews_this_month: number;
  five_star_count: number;
  positive_redirect_rate: number;
  sms_sent_month: number;
}

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  full_name text,
  email text not null,
  plan text not null default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

-- Organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  plan text not null default 'free',
  sms_count_month integer not null default 0,
  sms_limit_month integer not null default 0,
  created_at timestamptz default now()
);

-- Locations (business locations)
create table locations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  address text,
  google_place_id text,
  google_review_url text,
  twilio_phone_number text,
  avg_rating numeric(3,2) default 0,
  total_reviews integer default 0,
  created_at timestamptz default now()
);

-- Contacts (customers of the business)
create table contacts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- Review requests (SMS sent to customers)
create table review_requests (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete set null,
  token text unique not null default gen_random_uuid()::text,
  sent_at timestamptz,
  opened_at timestamptz,
  rating_given integer,
  redirected_to_google boolean default false,
  feedback text,
  status text not null default 'pending',
  created_at timestamptz default now()
);

-- Reviews (fetched from Google)
create table reviews (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations(id) on delete cascade not null,
  google_review_id text unique,
  author_name text not null,
  author_photo text,
  rating integer not null check (rating between 1 and 5),
  text text,
  published_at timestamptz not null,
  ai_draft_response text,
  response_posted boolean default false,
  response_text text,
  responded_at timestamptz,
  created_at timestamptz default now()
);

-- Campaigns (SMS automation rules)
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations(id) on delete cascade not null,
  name text not null,
  trigger_type text not null default 'manual',
  delay_hours integer not null default 2,
  message_template text not null,
  active boolean default true,
  total_sent integer default 0,
  created_at timestamptz default now()
);

-- SMS logs
create table sms_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  location_id uuid references locations(id) on delete set null,
  to_phone text not null,
  message text not null,
  twilio_sid text,
  status text not null default 'queued',
  created_at timestamptz default now()
);

-- Webhook events (idempotency)
create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  event_id text not null,
  processed_at timestamptz default now(),
  unique(source, event_id)
);

-- RLS Policies
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table locations enable row level security;
alter table contacts enable row level security;
alter table review_requests enable row level security;
alter table reviews enable row level security;
alter table campaigns enable row level security;
alter table sms_logs enable row level security;

create policy "Users can manage their own profile" on profiles
  for all using (auth.uid() = user_id);

create policy "Org owners can manage their org" on organizations
  for all using (
    owner_id in (select id from profiles where user_id = auth.uid())
  );

create policy "Org members can manage locations" on locations
  for all using (
    org_id in (select id from organizations where owner_id in (
      select id from profiles where user_id = auth.uid()
    ))
  );

create policy "Org members can manage contacts" on contacts
  for all using (
    org_id in (select id from organizations where owner_id in (
      select id from profiles where user_id = auth.uid()
    ))
  );

create policy "Org members can manage review requests" on review_requests
  for all using (
    location_id in (select id from locations where org_id in (
      select id from organizations where owner_id in (
        select id from profiles where user_id = auth.uid()
      )
    ))
  );

create policy "Org members can manage reviews" on reviews
  for all using (
    location_id in (select id from locations where org_id in (
      select id from organizations where owner_id in (
        select id from profiles where user_id = auth.uid()
      )
    ))
  );

create policy "Org members can manage campaigns" on campaigns
  for all using (
    location_id in (select id from locations where org_id in (
      select id from organizations where owner_id in (
        select id from profiles where user_id = auth.uid()
      )
    ))
  );

create policy "Org members can view sms logs" on sms_logs
  for select using (
    org_id in (select id from organizations where owner_id in (
      select id from profiles where user_id = auth.uid()
    ))
  );

-- Trigger to auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (user_id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Indexes for performance
create index idx_reviews_location_id on reviews(location_id);
create index idx_review_requests_token on review_requests(token);
create index idx_review_requests_location_id on review_requests(location_id);
create index idx_contacts_org_id on contacts(org_id);
create index idx_sms_logs_org_id on sms_logs(org_id);
create index idx_locations_org_id on locations(org_id);

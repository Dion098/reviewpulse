-- Agency columns on organizations
alter table organizations
  add column if not exists is_agency boolean default false,
  add column if not exists agency_name text,
  add column if not exists agency_logo_url text,
  add column if not exists agency_primary_color text default '#4F46E5',
  add column if not exists agency_domain text,
  add column if not exists client_count integer default 0;

-- Agency clients table
create table agency_clients (
  id uuid primary key default gen_random_uuid(),
  agency_org_id uuid references organizations(id) on delete cascade not null,
  client_name text not null,
  client_email text,
  client_phone text,
  location_id uuid references locations(id) on delete set null,
  plan text not null default 'starter',
  status text not null default 'active',
  monthly_revenue numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- RLS
alter table agency_clients enable row level security;

create policy "Agency owners can manage their clients" on agency_clients
  for all using (
    agency_org_id in (
      select id from organizations where owner_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

-- Index for performance
create index idx_agency_clients_agency_org_id on agency_clients(agency_org_id);
create index idx_agency_clients_status on agency_clients(status);

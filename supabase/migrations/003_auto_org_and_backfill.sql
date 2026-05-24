-- Update trigger to also auto-create org on signup
create or replace function handle_new_user()
returns trigger as $$
declare
  new_profile_id uuid;
begin
  insert into profiles (user_id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  returning id into new_profile_id;

  insert into organizations (owner_id, name, plan, sms_limit_month)
  values (new_profile_id, 'My Business', 'free', 50);

  return new;
exception when others then
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Backfill: create org for any existing profiles that don't have one
insert into organizations (owner_id, name, plan, sms_limit_month)
select p.id, 'My Business', 'free', 50
from profiles p
where not exists (
  select 1 from organizations o where o.owner_id = p.id
);

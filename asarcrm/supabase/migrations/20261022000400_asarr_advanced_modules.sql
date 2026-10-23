-- ==============================================================================
-- 3. ASARR AGENCYOS - MIGRATION 4: ADVANCED MODULES (IDEMPOTENT)
-- Adds Multi-Admin Team Management, Client Onboarding, Tele-Calling Outreach CRM,
-- User UI Preferences, Form Submissions & Webhook Event Tracking.
-- ==============================================================================

-- 1. Multi-Admin Memberships and Invitations
create table if not exists public.admin_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('owner', 'admin', 'team_member')),
  invited_by uuid references auth.users(id),
  status text not null default 'active' check (status in ('pending', 'active', 'deactivated')),
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'team_member')),
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Helper functions for admin access
create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if public.is_installation_owner() then
    return true;
  end if;

  return exists (
    select 1 from public.admin_memberships
    where user_id = auth.uid()
      and status = 'active'
      and role in ('owner', 'admin')
  );
end;
$$;

create or replace function public.is_team_member()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return true;
  end if;

  return exists (
    select 1 from public.admin_memberships
    where user_id = auth.uid()
      and status = 'active'
  );
end;
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_team_member() to authenticated;

-- 2. Client Onboarding Invitations
create table if not exists public.client_onboarding_invitations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  email text not null,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'sent', 'accepted', 'expired', 'revoked')),
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- 3. User UI Preferences (per-admin display settings)
create table if not exists public.user_ui_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  projects_view text not null default 'grid' check (projects_view in ('grid', 'table', 'compact', 'kanban')),
  tasks_view text not null default 'list',
  visible_columns jsonb not null default '{"client":true,"status":true,"progress":true,"budget":true,"deadline":true}'::jsonb,
  page_size integer not null default 20,
  theme_preference text not null default 'system',
  updated_at timestamptz not null default now()
);

-- 4. Form Submissions
create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  answers jsonb not null default '{}'::jsonb,
  ip_hash text,
  user_agent text,
  submitted_at timestamptz not null default now()
);

-- 5. Extend Tasks for Multi-Admin Operations
alter table public.tasks add column if not exists assigned_to uuid references auth.users(id);
alter table public.tasks add column if not exists is_group_task boolean not null default false;
alter table public.tasks add column if not exists lead_id uuid references public.leads(id) on delete set null;
alter table public.tasks add column if not exists status text not null default 'todo';
alter table public.tasks add column if not exists start_date date;

-- 6. Extend Events for Shared Agency Calendar
alter table public.events add column if not exists start_time timestamptz;
alter table public.events add column if not exists end_time timestamptz;
alter table public.events add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.events add column if not exists meeting_url text;
alter table public.events add column if not exists assigned_to uuid references auth.users(id);
alter table public.events add column if not exists visibility text not null default 'agency_public';

-- 7. Tele-Calling CRM: Niches and Campaigns
create table if not exists public.telecalling_niches (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  color text default '#7A1B28',
  display_order integer default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.telecalling_campaigns (
  id uuid primary key default gen_random_uuid(),
  niche_id uuid not null references public.telecalling_niches(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  target_goal integer default 100,
  assigned_admins jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 8. Tele-Calling CRM: Contacts & Calling Workspace
create table if not exists public.telecalling_contacts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.telecalling_campaigns(id) on delete set null,
  niche_id uuid references public.telecalling_niches(id) on delete set null,
  business_name text not null,
  contact_name text,
  phone text not null,
  alternate_phone text,
  email text,
  website text,
  instagram_handle text,
  instagram_url text,
  google_maps_url text,
  address text,
  city text,
  state text,
  country text default 'India',
  status text not null default 'new' check (status in ('new', 'assigned', 'contacted', 'follow_up', 'interested', 'not_interested', 'converted', 'do_not_contact', 'archived')),
  assigned_admin_id uuid references auth.users(id),
  created_by uuid references auth.users(id),
  call_count integer not null default 0,
  last_called_at timestamptz,
  next_follow_up timestamptz,
  converted_client_id uuid references public.clients(id) on delete set null,
  converted_lead_id uuid references public.leads(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.telecalling_call_logs (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.telecalling_contacts(id) on delete cascade,
  admin_id uuid not null references auth.users(id),
  outcome text not null check (outcome in ('connected', 'no_answer', 'busy', 'call_back_requested', 'interested', 'not_interested', 'wrong_number', 'converted')),
  duration_seconds integer default 0,
  notes text,
  next_follow_up timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.telecalling_follow_ups (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.telecalling_contacts(id) on delete cascade,
  admin_id uuid not null references auth.users(id),
  due_date timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'overdue', 'cancelled')),
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 9. Razorpay Webhook Event Store
create table if not exists public.razorpay_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

-- 10. Enable Row Level Security
alter table public.admin_memberships enable row level security;
alter table public.admin_invitations enable row level security;
alter table public.client_onboarding_invitations enable row level security;
alter table public.user_ui_preferences enable row level security;
alter table public.form_submissions enable row level security;
alter table public.telecalling_niches enable row level security;
alter table public.telecalling_campaigns enable row level security;
alter table public.telecalling_contacts enable row level security;
alter table public.telecalling_call_logs enable row level security;
alter table public.telecalling_follow_ups enable row level security;
alter table public.razorpay_webhook_events enable row level security;

-- 11. Policies for Admin Team (Safe drop before create)
drop policy if exists "admin manages admin_memberships" on public.admin_memberships;
create policy "admin manages admin_memberships" on public.admin_memberships for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team reads admin_memberships" on public.admin_memberships;
create policy "team reads admin_memberships" on public.admin_memberships for select to authenticated
  using (public.is_team_member());

drop policy if exists "admin manages admin_invitations" on public.admin_invitations;
create policy "admin manages admin_invitations" on public.admin_invitations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manages onboarding invitations" on public.client_onboarding_invitations;
create policy "admin manages onboarding invitations" on public.client_onboarding_invitations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public validates onboarding token" on public.client_onboarding_invitations;
create policy "public validates onboarding token" on public.client_onboarding_invitations for select to anon
  using (status = 'sent' or status = 'pending');

drop policy if exists "user manages own ui preferences" on public.user_ui_preferences;
create policy "user manages own ui preferences" on public.user_ui_preferences for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "admin reads form submissions" on public.form_submissions;
create policy "admin reads form submissions" on public.form_submissions for select to authenticated
  using (public.is_team_member());

drop policy if exists "public inserts form submissions" on public.form_submissions;
create policy "public inserts form submissions" on public.form_submissions for insert to anon with check (true);

drop policy if exists "team manages telecalling niches" on public.telecalling_niches;
create policy "team manages telecalling niches" on public.telecalling_niches for all to authenticated
  using (public.is_team_member()) with check (public.is_admin());

drop policy if exists "team manages telecalling campaigns" on public.telecalling_campaigns;
create policy "team manages telecalling campaigns" on public.telecalling_campaigns for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());

drop policy if exists "team manages telecalling contacts" on public.telecalling_contacts;
create policy "team manages telecalling contacts" on public.telecalling_contacts for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());

drop policy if exists "team manages telecalling call logs" on public.telecalling_call_logs;
create policy "team manages telecalling call logs" on public.telecalling_call_logs for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());

drop policy if exists "team manages telecalling follow ups" on public.telecalling_follow_ups;
create policy "team manages telecalling follow ups" on public.telecalling_follow_ups for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());

-- 12. Seed Default ASARR Tele-Calling Niches
insert into public.telecalling_niches (name, description, color, display_order)
values
  ('Restaurants & Cafés', 'F&B establishments needing modern web ordering & brand presence', '#7A1B28', 1),
  ('Salons & Beauty Parlors', 'Spas, grooming lounges, and skincare clinics', '#8E2838', 2),
  ('Clothing & Fashion Boutiques', 'Apparel brands requiring custom e-commerce stores', '#601420', 3),
  ('Healthcare & Clinics', 'Dental practices, specialty doctors, and diagnostic labs', '#7A1B28', 4),
  ('Real Estate & Developers', 'Property consultancies, luxury builders, and brokers', '#9B2A3B', 5),
  ('Educational Institutions', 'Private academies, coaching centers, and colleges', '#54101A', 6),
  ('E-Commerce & D2C Brands', 'Direct-to-consumer lifestyle, jewelry, and gadget stores', '#7A1B28', 7),
  ('Local Professional Services', 'Architects, chartered accountants, and legal firms', '#601420', 8)
on conflict do nothing;

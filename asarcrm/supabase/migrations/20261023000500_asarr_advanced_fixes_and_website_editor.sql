-- ==============================================================================
-- ASARR AGENCYOS - MIGRATION 5: ADVANCED FIXES, SECURITY & LIVE WEBSITE EDITOR
-- ==============================================================================

-- 1. Extend public.profiles with comprehensive business, tax, and billing columns
alter table public.profiles add column if not exists legal_business_name text;
alter table public.profiles add column if not exists gstin text;
alter table public.profiles add column if not exists pan text;
alter table public.profiles add column if not exists default_currency text default 'INR';
alter table public.profiles add column if not exists invoice_prefix text default 'INV-ASARR-';
alter table public.profiles add column if not exists default_tax_rate numeric(5,2) default 18.00;
alter table public.profiles add column if not exists payment_terms text default 'Due on Receipt';
alter table public.profiles add column if not exists bank_name text;
alter table public.profiles add column if not exists account_name text;
alter table public.profiles add column if not exists account_number text;
alter table public.profiles add column if not exists ifsc_code text;
alter table public.profiles add column if not exists upi_id text;
alter table public.profiles add column if not exists payment_instructions text;
alter table public.profiles add column if not exists representative_name text;
alter table public.profiles add column if not exists representative_title text;
alter table public.profiles add column if not exists representative_email text;
alter table public.profiles add column if not exists representative_phone text;
alter table public.profiles add column if not exists postal_code text;
alter table public.profiles add column if not exists state text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists country text default 'India';
alter table public.profiles add column if not exists billing_settings jsonb default '{}'::jsonb;

-- 2. Website Content Store (Live Published vs Draft) & Version History
create table if not exists public.website_content (
  id text primary key, -- 'published' or 'draft'
  version integer not null default 1,
  hero jsonb not null default '{}'::jsonb,
  what_we_do jsonb not null default '{}'::jsonb,
  services jsonb not null default '[]'::jsonb,
  selected_work jsonb not null default '[]'::jsonb,
  philosophy jsonb not null default '[]'::jsonb,
  process jsonb not null default '[]'::jsonb,
  final_cta jsonb not null default '{}'::jsonb,
  footer jsonb not null default '{}'::jsonb,
  brand_tokens jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.website_content_history (
  id uuid primary key default gen_random_uuid(),
  version integer not null,
  content_snapshot jsonb not null,
  published_by uuid references auth.users(id),
  published_at timestamptz not null default now(),
  changelog text
);

-- Enable RLS on website content tables
alter table public.website_content enable row level security;
alter table public.website_content_history enable row level security;

-- Policies for website content:
-- Public visitors can read the published live website content
drop policy if exists "public reads published website content" on public.website_content;
create policy "public reads published website content" on public.website_content
  for select to public
  using (id = 'published');

-- Admins and owners can view and edit all website content (both draft and published)
drop policy if exists "admins manage website content" on public.website_content;
create policy "admins manage website content" on public.website_content
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admins and owners can manage website content history
drop policy if exists "admins manage website history" on public.website_content_history;
create policy "admins manage website history" on public.website_content_history
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3. Extend form_submissions table with form_title and metadata
alter table public.form_submissions add column if not exists form_title text;
alter table public.form_submissions add column if not exists submitter_name text;
alter table public.form_submissions add column if not exists submitter_email text;
alter table public.form_submissions add column if not exists submitter_phone text;

-- 4. Fix RLS on public.forms so any admin can manage forms
drop policy if exists "owner manages forms" on public.forms;
create policy "admin manages forms" on public.forms
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Allow public visitors to read any active form
drop policy if exists "public reads active forms" on public.forms;
create policy "public reads active forms" on public.forms
  for select to public
  using (is_active = true);

-- Allow public visitors to submit form submissions
drop policy if exists "public inserts form submissions" on public.form_submissions;
create policy "public inserts form submissions" on public.form_submissions
  for insert to public
  with check (true);

-- Allow admins to read, update, or delete submissions
drop policy if exists "admin reads form submissions" on public.form_submissions;
drop policy if exists "admin manages form submissions" on public.form_submissions;
create policy "admin manages form submissions" on public.form_submissions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Fix Profiles RLS so admins can manage the agency profile and settings
drop policy if exists "owner manages profiles" on public.profiles;
drop policy if exists "users manage own profile" on public.profiles;
create policy "users manage own profile" on public.profiles
  for all to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "public reads agency profile" on public.profiles;
create policy "public reads agency profile" on public.profiles
  for select to public
  using (true);

-- 6. Storage Policies: Allow admins to upload and update brand & website assets
drop policy if exists "owner uploads agency files" on storage.objects;
create policy "admin uploads agency files" on storage.objects
  for insert to authenticated
  with check (public.is_admin() and bucket_id in ('brand-assets', 'project-images', 'lead-attachments', 'client-deliverables', 'client-documents'));

drop policy if exists "owner updates agency files" on storage.objects;
create policy "admin updates agency files" on storage.objects
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "owner deletes agency files" on storage.objects;
create policy "admin deletes agency files" on storage.objects
  for delete to authenticated
  using (public.is_admin());

-- 7. Secure Server-Side Function: Claim Client Invitation with Strict Email Binding
create or replace function public.claim_client_invitation(invite_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inv record;
  current_user_email text;
  caller_id uuid;
begin
  caller_id := auth.uid();
  if caller_id is null then
    raise exception 'Authentication required to activate invitation.';
  end if;

  select email into current_user_email from auth.users where id = caller_id;
  if current_user_email is null then
    raise exception 'Authenticated user email could not be resolved.';
  end if;

  -- Locate valid invitation
  select * into inv from public.client_onboarding_invitations
  where token = invite_token
  limit 1;

  if inv is null then
    raise exception 'Invitation link is invalid.';
  end if;

  if inv.status = 'revoked' then
    raise exception 'This invitation has been revoked by the administrator.';
  end if;

  if inv.status = 'accepted' then
    raise exception 'This invitation has already been accepted.';
  end if;

  if inv.expires_at < now() then
    update public.client_onboarding_invitations
    set status = 'expired'
    where id = inv.id;
    raise exception 'This invitation link has expired. Please contact ASARR for a new invitation.';
  end if;

  -- STRICT EMAIL BINDING ENFORCEMENT
  if lower(trim(inv.email)) <> lower(trim(current_user_email)) then
    raise exception 'This invitation is strictly bound to %. Your authenticated email (%) does not match.', inv.email, current_user_email;
  end if;

  -- Mark invitation as accepted (single-use consumption)
  update public.client_onboarding_invitations
  set status = 'accepted', accepted_at = now()
  where id = inv.id;

  -- Create or update client_users association
  insert into public.client_users (client_id, user_id, role, created_at)
  values (inv.client_id, caller_id, 'client', now())
  on conflict (user_id) do update
  set client_id = inv.client_id, role = 'client';

  return jsonb_build_object(
    'success', true,
    'client_id', inv.client_id,
    'email', inv.email
  );
end;
$$;

grant execute on function public.claim_client_invitation(text) to authenticated;

-- 8. Secure Server-Side Function: Claim Admin Team Invitation with Strict Email Binding
create or replace function public.claim_admin_invitation(invite_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inv record;
  current_user_email text;
  caller_id uuid;
  assigned_role text;
begin
  caller_id := auth.uid();
  if caller_id is null then
    raise exception 'Authentication required to activate admin invitation.';
  end if;

  select email into current_user_email from auth.users where id = caller_id;
  if current_user_email is null then
    raise exception 'Authenticated user email could not be resolved.';
  end if;

  select * into inv from public.admin_invitations
  where token = invite_token
  limit 1;

  if inv is null then
    raise exception 'Invitation link is invalid.';
  end if;

  if inv.status = 'revoked' then
    raise exception 'This administrator invitation has been revoked.';
  end if;

  if inv.status = 'accepted' then
    raise exception 'This invitation has already been accepted.';
  end if;

  if inv.expires_at < now() then
    update public.admin_invitations
    set status = 'expired'
    where id = inv.id;
    raise exception 'This invitation link has expired. Please contact the agency owner for a new invitation.';
  end if;

  -- STRICT EMAIL BINDING ENFORCEMENT
  if lower(trim(inv.email)) <> lower(trim(current_user_email)) then
    raise exception 'This invitation is strictly bound to %. Your authenticated email (%) does not match.', inv.email, current_user_email;
  end if;

  assigned_role := inv.role;
  if assigned_role not in ('admin', 'team_member') then
    assigned_role := 'team_member';
  end if;

  -- Mark invitation as accepted (single-use consumption)
  update public.admin_invitations
  set status = 'accepted'
  where id = inv.id;

  -- Add to admin_memberships
  insert into public.admin_memberships (user_id, role, invited_by, status, created_at)
  values (caller_id, assigned_role, inv.invited_by, 'active', now())
  on conflict (user_id) do update
  set role = assigned_role, status = 'active';

  return jsonb_build_object(
    'success', true,
    'role', assigned_role,
    'email', inv.email
  );
end;
$$;

grant execute on function public.claim_admin_invitation(text) to authenticated;

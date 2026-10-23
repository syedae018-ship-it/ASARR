-- ==============================================================================
-- ASARR AGENCYOS - MIGRATION 7: FIX ADMIN & CLIENT INVITATIONS AND PROFILES
-- ==============================================================================
-- Safe, idempotent migration to fix:
-- 1. admin_memberships missing email column and synchronization
-- 2. admin_invitations RLS policy permitting validation by invited recipients
-- 3. Trusted server-side validate_invitation_token RPC with strict 24-hour expiration
-- 4. claim_admin_invitation & claim_client_invitation profile creation & single-use consumption
-- 5. public.profiles RLS insert policy for self-service user profiles

-- ------------------------------------------------------------------------------
-- 1. ADD EMAIL TO ADMIN_MEMBERSHIPS
-- ------------------------------------------------------------------------------
alter table public.admin_memberships add column if not exists email text;

-- Backfill emails from auth.users if available
do $$
begin
  update public.admin_memberships m
  set email = u.email
  from auth.users u
  where m.user_id = u.id and (m.email is null or m.email = '');
exception when others then
  -- Ignore if permission restricted in migration runner
  null;
end $$;

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY ON INVITATIONS
-- ------------------------------------------------------------------------------
-- Allow public/anon and authenticated users to validate pending invitation tokens
drop policy if exists "public validates admin invitation token" on public.admin_invitations;
create policy "public validates admin invitation token" on public.admin_invitations
  for select to anon, authenticated
  using (status in ('pending', 'sent'));

drop policy if exists "public validates onboarding token" on public.client_onboarding_invitations;
create policy "public validates onboarding token" on public.client_onboarding_invitations
  for select to anon, authenticated
  using (status in ('pending', 'sent'));

-- Ensure profiles allows users to insert their own profile (needed for upsert)
drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles
  for insert to authenticated
  with check (id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. SERVER-SIDE RPC: VALIDATE INVITATION TOKEN (TRUSTED TIME & METADATA)
-- ------------------------------------------------------------------------------
create or replace function public.validate_invitation_token(invite_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  client_inv record;
  admin_inv record;
begin
  if invite_token is null or trim(invite_token) = '' then
    return jsonb_build_object('valid', false, 'error', 'Invitation token is missing.');
  end if;

  -- 1. Check Client Onboarding Invitations
  select * into client_inv from public.client_onboarding_invitations
  where token = trim(invite_token)
  limit 1;

  if client_inv is not null then
    if client_inv.status = 'revoked' then
      return jsonb_build_object('valid', false, 'error', 'This invitation has been revoked by an administrator.');
    end if;

    if client_inv.status = 'accepted' then
      return jsonb_build_object('valid', false, 'error', 'This invitation has already been accepted and consumed.');
    end if;

    if client_inv.expires_at < now() then
      update public.client_onboarding_invitations
      set status = 'expired'
      where id = client_inv.id;
      return jsonb_build_object('valid', false, 'error', 'This invitation link has expired (24-hour limit). Please contact ASARR for a new invitation.');
    end if;

    return jsonb_build_object(
      'valid', true,
      'type', 'client',
      'email', client_inv.email,
      'full_name', client_inv.full_name,
      'client_name', client_inv.client_name,
      'client_id', client_inv.client_id,
      'expires_at', client_inv.expires_at,
      'created_at', client_inv.created_at
    );
  end if;

  -- 2. Check Admin Invitations
  select * into admin_inv from public.admin_invitations
  where token = trim(invite_token)
  limit 1;

  if admin_inv is not null then
    if admin_inv.status = 'revoked' then
      return jsonb_build_object('valid', false, 'error', 'This administrator invitation has been revoked.');
    end if;

    if admin_inv.status = 'accepted' then
      return jsonb_build_object('valid', false, 'error', 'This invitation has already been accepted and consumed.');
    end if;

    if admin_inv.expires_at < now() then
      update public.admin_invitations
      set status = 'expired'
      where id = admin_inv.id;
      return jsonb_build_object('valid', false, 'error', 'This invitation link has expired (24-hour limit). Please contact the agency owner for a new invitation.');
    end if;

    return jsonb_build_object(
      'valid', true,
      'type', 'admin',
      'email', admin_inv.email,
      'role', admin_inv.role,
      'expires_at', admin_inv.expires_at,
      'created_at', admin_inv.created_at
    );
  end if;

  return jsonb_build_object('valid', false, 'error', 'Invitation link is invalid or was not found.');
end;
$$;

grant execute on function public.validate_invitation_token(text) to anon, authenticated;

-- ------------------------------------------------------------------------------
-- 4. REFINED CLAIM CLIENT INVITATION RPC
-- ------------------------------------------------------------------------------
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
  where token = trim(invite_token)
  limit 1;

  if inv is null then
    raise exception 'Invitation link is invalid.';
  end if;

  if inv.status = 'revoked' then
    raise exception 'This invitation has been revoked by an administrator.';
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

  -- Revoke any other pending invitations for this exact email to enforce single valid link
  update public.client_onboarding_invitations
  set status = 'revoked'
  where lower(trim(email)) = lower(trim(inv.email))
    and id <> inv.id
    and status = 'pending';

  -- Create or update client_users association
  insert into public.client_users (client_id, user_id, role, created_at)
  values (inv.client_id, caller_id, 'client', now())
  on conflict (client_id, user_id) do update
  set role = 'client';

  -- Ensure public.profiles has personal record for caller
  insert into public.profiles (id, email, full_name, mobile_number, role, updated_at)
  values (
    caller_id,
    inv.email,
    coalesce(inv.full_name, inv.client_name, 'Client Representative'),
    inv.phone,
    'client',
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    mobile_number = coalesce(public.profiles.mobile_number, excluded.mobile_number),
    role = 'client',
    updated_at = now();

  return jsonb_build_object(
    'success', true,
    'client_id', inv.client_id,
    'email', inv.email
  );
end;
$$;

grant execute on function public.claim_client_invitation(text) to authenticated;

-- ------------------------------------------------------------------------------
-- 5. REFINED CLAIM ADMIN INVITATION RPC
-- ------------------------------------------------------------------------------
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
  where token = trim(invite_token)
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

  -- Revoke any other pending invitations for this email
  update public.admin_invitations
  set status = 'revoked'
  where lower(trim(email)) = lower(trim(inv.email))
    and id <> inv.id
    and status = 'pending';

  -- Add to admin_memberships with email
  insert into public.admin_memberships (user_id, role, invited_by, status, email, created_at)
  values (caller_id, assigned_role, inv.invited_by, 'active', inv.email, now())
  on conflict (user_id) do update
  set role = assigned_role, status = 'active', email = inv.email;

  -- Ensure public.profiles has personal record for caller
  insert into public.profiles (id, email, full_name, role, updated_at)
  values (
    caller_id,
    inv.email,
    'Team Member',
    assigned_role,
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    role = assigned_role,
    updated_at = now();

  return jsonb_build_object(
    'success', true,
    'role', assigned_role,
    'email', inv.email
  );
end;
$$;

grant execute on function public.claim_admin_invitation(text) to authenticated;

-- ==============================================================================
-- ASARR AGENCYOS - MIGRATION 6: COMPLETE RECONCILIATION, PROFILES, EXPENSES & SECURITY
-- ==============================================================================
-- Idempotent, safe, and production-ready migration.
-- No existing business records are truncated or deleted.
-- Preserves existing data while adding required columns, tables, constraints,
-- RLS policies, storage buckets, and secure server-side RPC functions.

-- ------------------------------------------------------------------------------
-- 1. EXTEND PUBLIC.PROFILES (Individual Admin/Client Profile & Agency Settings)
-- ------------------------------------------------------------------------------
alter table public.profiles add column if not exists job_title text;
alter table public.profiles add column if not exists department text;
alter table public.profiles add column if not exists mobile_number text;
alter table public.profiles add column if not exists timezone text default 'Asia/Kolkata';
alter table public.profiles add column if not exists role text default 'owner';

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

-- ------------------------------------------------------------------------------
-- 2. EXTEND PUBLIC.CLIENTS (Address, Website, Tags)
-- ------------------------------------------------------------------------------
alter table public.clients add column if not exists address text;
alter table public.clients add column if not exists website text;
alter table public.clients add column if not exists tags text[] default '{}'::text[];

-- ------------------------------------------------------------------------------
-- 3. EXTEND PUBLIC.CLIENT_ONBOARDING_INVITATIONS (Full Name, Phone, Notes)
-- ------------------------------------------------------------------------------
alter table public.client_onboarding_invitations add column if not exists client_name text;
alter table public.client_onboarding_invitations add column if not exists full_name text;
alter table public.client_onboarding_invitations add column if not exists phone text;
alter table public.client_onboarding_invitations add column if not exists notes text;

-- ------------------------------------------------------------------------------
-- 4. EXTEND PUBLIC.PROJECTS & TASKS
-- ------------------------------------------------------------------------------
alter table public.projects add column if not exists start_date date;
alter table public.projects add column if not exists end_date date;
alter table public.projects add column if not exists staging_url text;
alter table public.projects add column if not exists production_url text;
alter table public.projects add column if not exists category text;

alter table public.tasks add column if not exists assigned_to uuid references auth.users(id) on delete set null;
alter table public.tasks add column if not exists assigned_name text;
alter table public.tasks add column if not exists is_group_task boolean not null default false;
alter table public.tasks add column if not exists lead_id uuid references public.leads(id) on delete set null;
alter table public.tasks add column if not exists status text not null default 'todo';
alter table public.tasks add column if not exists start_date date;

-- ------------------------------------------------------------------------------
-- 5. EXTEND PUBLIC.INVOICES
-- ------------------------------------------------------------------------------
alter table public.invoices add column if not exists currency text default 'INR';
alter table public.invoices add column if not exists tax numeric(12,2) default 0;
alter table public.invoices add column if not exists items jsonb default '[]'::jsonb;
alter table public.invoices add column if not exists notes text;
alter table public.invoices add column if not exists pdf_url text;

-- ------------------------------------------------------------------------------
-- 6. EXTEND PUBLIC.FORM_SUBMISSIONS
-- ------------------------------------------------------------------------------
alter table public.form_submissions add column if not exists form_title text;
alter table public.form_submissions add column if not exists submitter_name text;
alter table public.form_submissions add column if not exists submitter_email text;
alter table public.form_submissions add column if not exists submitter_phone text;
alter table public.form_submissions add column if not exists data jsonb default '{}'::jsonb;

-- ------------------------------------------------------------------------------
-- 7. WEBSITE CONTENT STORE (Live Published vs Draft) & Schema Fix
-- ------------------------------------------------------------------------------
create table if not exists public.website_content (
  id text primary key, -- 'published' or 'draft'
  version integer not null default 1,
  hero jsonb not null default '{}'::jsonb,
  what_we_do jsonb not null default '{}'::jsonb,
  services jsonb not null default '[]'::jsonb,
  selected_work jsonb not null default '[]'::jsonb,
  selected_work_meta jsonb not null default '{}'::jsonb,
  philosophy jsonb not null default '[]'::jsonb,
  process jsonb not null default '[]'::jsonb,
  final_cta jsonb not null default '{}'::jsonb,
  footer jsonb not null default '{}'::jsonb,
  brand_tokens jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- Ensure all jsonb columns exist even if table was created in an earlier migration
alter table public.website_content add column if not exists selected_work_meta jsonb default '{}'::jsonb;
alter table public.website_content add column if not exists philosophy jsonb default '[]'::jsonb;
alter table public.website_content add column if not exists process jsonb default '[]'::jsonb;

create table if not exists public.website_content_history (
  id uuid primary key default gen_random_uuid(),
  version integer not null,
  content_snapshot jsonb not null,
  published_by uuid references auth.users(id),
  published_at timestamptz not null default now(),
  changelog text
);

alter table public.website_content enable row level security;
alter table public.website_content_history enable row level security;

-- ------------------------------------------------------------------------------
-- 8. EXPENSES AND REIMBURSEMENTS MODULE
-- ------------------------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  voucher_number text unique,
  title text not null,
  description text,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'INR',
  expense_date date not null default current_date,
  category text not null check (category in (
    'software_subscription',
    'travel_transit',
    'office_supplies',
    'meals_entertainment',
    'contractor_freelance',
    'hardware_equipment',
    'advertising_marketing',
    'telecom_internet',
    'utilities',
    'other'
  )),
  vendor text not null,
  payment_method text not null check (payment_method in (
    'corporate_card',
    'personal_card',
    'upi',
    'bank_transfer',
    'cash',
    'other'
  )),
  paid_by uuid not null references auth.users(id),
  paid_by_name text,
  created_by uuid not null references auth.users(id),
  receipt_url text,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  notes text,
  reimbursement_status text not null default 'draft' check (reimbursement_status in (
    'draft',
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'reimbursed'
  )),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  reimbursed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expense_receipts (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_size integer,
  file_type text,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- Indexing for expense reporting performance
create index if not exists expenses_expense_date_idx on public.expenses(expense_date desc);
create index if not exists expenses_category_idx on public.expenses(category);
create index if not exists expenses_reimbursement_status_idx on public.expenses(reimbursement_status);
create index if not exists expenses_paid_by_idx on public.expenses(paid_by);
create index if not exists expenses_client_id_idx on public.expenses(client_id);
create index if not exists expenses_project_id_idx on public.expenses(project_id);

-- Sequence / Function for Unique Expense Voucher Numbers
create sequence if not exists public.expense_voucher_seq start 1001;

create or replace function public.set_expense_voucher_number()
returns trigger
language plpgsql
as $$
declare
  prefix text;
begin
  if new.voucher_number is null or new.voucher_number = '' then
    prefix := 'EXP-' || to_char(coalesce(new.expense_date, current_date), 'YYYYMM') || '-';
    new.voucher_number := prefix || lpad(nextval('public.expense_voucher_seq')::text, 4, '0');
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_set_expense_voucher_number on public.expenses;
create trigger trg_set_expense_voucher_number
  before insert or update on public.expenses
  for each row
  execute function public.set_expense_voucher_number();

-- ------------------------------------------------------------------------------
-- 9. SECURITY FUNCTIONS REFINEMENT (Installation Owner & Admin Checks)
-- ------------------------------------------------------------------------------
-- Ensure primary installation owner is always recognized even before DB writes
create or replace function public.is_installation_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.installation_settings
    where id = true and owner_id = auth.uid()
  ) or (
    auth.uid() = '77308899-8657-4ce4-907c-b56e33c8f760'::uuid
  );
$$;

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
      and role in ('owner', 'admin', 'team_member')
  );
end;
$$;

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- A. Profiles RLS
alter table public.profiles enable row level security;

drop policy if exists "users manage own profile" on public.profiles;
drop policy if exists "users select own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "admins manage all profiles" on public.profiles;
drop policy if exists "public reads agency profile" on public.profiles;

create policy "users select own profile" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "users update own profile" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "admins manage all profiles" on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public reads agency profile" on public.profiles
  for select to public
  using (id = '77308899-8657-4ce4-907c-b56e33c8f760'::uuid or id = public.installation_owner_id());

-- B. Website Content RLS
drop policy if exists "public reads published website content" on public.website_content;
create policy "public reads published website content" on public.website_content
  for select to public
  using (id = 'published');

drop policy if exists "admins manage website content" on public.website_content;
create policy "admins manage website content" on public.website_content
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins manage website history" on public.website_content_history;
create policy "admins manage website history" on public.website_content_history
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- C. Forms & Submissions RLS
alter table public.forms enable row level security;
alter table public.form_submissions enable row level security;

drop policy if exists "admin manages forms" on public.forms;
create policy "admin manages forms" on public.forms
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "public reads active forms" on public.forms;
create policy "public reads active forms" on public.forms
  for select to public
  using (is_active = true);

drop policy if exists "public inserts form submissions" on public.form_submissions;
create policy "public inserts form submissions" on public.form_submissions
  for insert to public
  with check (true);

drop policy if exists "admin manages form submissions" on public.form_submissions;
create policy "admin manages form submissions" on public.form_submissions
  for all to authenticated
  using (public.is_team_member())
  with check (public.is_admin());

-- D. Expenses RLS
alter table public.expenses enable row level security;
alter table public.expense_receipts enable row level security;

drop policy if exists "team reads own or all expenses" on public.expenses;
create policy "team reads own or all expenses" on public.expenses
  for select to authenticated
  using (
    public.is_admin() or
    (public.is_team_member() and (paid_by = auth.uid() or created_by = auth.uid()))
  );

drop policy if exists "team creates expenses" on public.expenses;
create policy "team creates expenses" on public.expenses
  for insert to authenticated
  with check (
    public.is_admin() or
    (public.is_team_member() and paid_by = auth.uid())
  );

drop policy if exists "team updates draft expenses" on public.expenses;
create policy "team updates draft expenses" on public.expenses
  for update to authenticated
  using (
    public.is_admin() or
    (public.is_team_member() and paid_by = auth.uid() and reimbursement_status in ('draft', 'rejected'))
  )
  with check (
    public.is_admin() or
    (public.is_team_member() and paid_by = auth.uid() and reimbursement_status in ('draft', 'submitted'))
  );

drop policy if exists "admin deletes expenses" on public.expenses;
create policy "admin deletes expenses" on public.expenses
  for delete to authenticated
  using (
    public.is_admin() or
    (public.is_team_member() and paid_by = auth.uid() and reimbursement_status = 'draft')
  );

-- E. Expense Receipts RLS
drop policy if exists "team reads expense receipts" on public.expense_receipts;
create policy "team reads expense receipts" on public.expense_receipts
  for select to authenticated
  using (
    public.is_admin() or
    uploaded_by = auth.uid() or
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and (e.paid_by = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "team inserts expense receipts" on public.expense_receipts;
create policy "team inserts expense receipts" on public.expense_receipts
  for insert to authenticated
  with check (public.is_team_member());

drop policy if exists "admin deletes expense receipts" on public.expense_receipts;
create policy "admin deletes expense receipts" on public.expense_receipts
  for delete to authenticated
  using (public.is_admin() or uploaded_by = auth.uid());

-- ------------------------------------------------------------------------------
-- 11. STORAGE BUCKETS & STORAGE POLICIES
-- ------------------------------------------------------------------------------
-- Create expense-receipts bucket if missing
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'expense-receipts',
  'expense-receipts',
  false,
  26214400, -- 25MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'];

-- Storage RLS policies for expense receipts
drop policy if exists "team uploads expense receipts" on storage.objects;
create policy "team uploads expense receipts" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'expense-receipts' and public.is_team_member());

drop policy if exists "team reads expense receipts storage" on storage.objects;
create policy "team reads expense receipts storage" on storage.objects
  for select to authenticated
  using (bucket_id = 'expense-receipts' and public.is_team_member());

drop policy if exists "admin deletes expense receipts storage" on storage.objects;
create policy "admin deletes expense receipts storage" on storage.objects
  for delete to authenticated
  using (bucket_id = 'expense-receipts' and public.is_admin());

-- General admin storage uploads for agency assets
drop policy if exists "admin uploads agency files" on storage.objects;
create policy "admin uploads agency files" on storage.objects
  for insert to authenticated
  with check (
    public.is_admin() and
    bucket_id in ('brand-assets', 'project-images', 'lead-attachments', 'client-deliverables', 'client-documents')
  );

drop policy if exists "admin updates agency files" on storage.objects;
create policy "admin updates agency files" on storage.objects
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin deletes agency files" on storage.objects;
create policy "admin deletes agency files" on storage.objects
  for delete to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------------------------
-- 12. SECURE SERVER-SIDE RPCs: CLAIM CLIENT & ADMIN INVITATIONS
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
  on conflict (client_id, user_id) do update
  set role = 'client';

  return jsonb_build_object(
    'success', true,
    'client_id', inv.client_id,
    'email', inv.email
  );
end;
$$;

grant execute on function public.claim_client_invitation(text) to authenticated;

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

-- ------------------------------------------------------------------------------
-- 13. SEED DEFAULT OWNER PRIVILEGES & INITIAL WEBSITE CONTENT
-- ------------------------------------------------------------------------------
alter table public.installation_settings add column if not exists agency_name text default 'ASARR Agency';
alter table public.installation_settings add column if not exists updated_at timestamptz default now();

-- Ensure installation_settings row has owner ID
insert into public.installation_settings (id, owner_id)
values (true, '77308899-8657-4ce4-907c-b56e33c8f760'::uuid)
on conflict (id) do update
set owner_id = '77308899-8657-4ce4-907c-b56e33c8f760'::uuid;

-- Ensure admin_memberships has owner row
insert into public.admin_memberships (user_id, role, status, created_at)
values ('77308899-8657-4ce4-907c-b56e33c8f760'::uuid, 'owner', 'active', now())
on conflict (user_id) do update
set role = 'owner', status = 'active';

-- Seed draft row for website content if not present
insert into public.website_content (
  id, version, hero, what_we_do, services, selected_work, selected_work_meta,
  philosophy, process, final_cta, footer, brand_tokens, updated_at
)
select
  'draft', version, hero, what_we_do, services, selected_work,
  coalesce(selected_work_meta, '{}'::jsonb),
  coalesce(philosophy, '[]'::jsonb),
  coalesce(process, '[]'::jsonb),
  final_cta, footer, brand_tokens, now()
from public.website_content
where id = 'published'
on conflict (id) do nothing;

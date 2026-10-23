-- ==============================================================================
-- 2. ASARR AGENCYOS CUSTOMIZATION MIGRATION (IDEMPOTENT)
-- Adds Client Organization access, Project Milestones, Deliverable Approvals,
-- Quotation Versioning & Auditing, Support Tickets, and Invoice Payment Records.
-- ==============================================================================

-- 1. Client User Membership (Auth User to Client relationship)
create table if not exists public.client_users (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'client_contact',
  created_at timestamptz not null default now()
);

-- 2. Helper function to identify the current client account
create or replace function public.client_user_client_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  select client_id into cid from public.client_users where user_id = auth.uid() limit 1;
  return cid;
end;
$$;

grant execute on function public.client_user_client_id() to authenticated;

-- 3. Project Milestones
create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  order_index integer default 0,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  created_at timestamptz not null default now()
);

-- 4. Project Deliverables & Approval Requests
create table if not exists public.project_deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  deliverable_type text not null default 'design' check (deliverable_type in ('design', 'video', 'software', 'content', 'marketing', 'other')),
  file_url text,
  preview_url text,
  version text not null default 'v1.0',
  status text not null default 'pending_review' check (status in ('in_production', 'pending_review', 'approved', 'revision_requested')),
  client_feedback text,
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Quotation Versions & Acceptance Auditing
create table if not exists public.quotation_versions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references public.proposals(id) on delete set null,
  client_id uuid references public.clients(id) on delete cascade,
  quote_number text not null,
  version_number integer not null default 1,
  title text not null,
  scope_of_work text,
  line_items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  currency text not null default 'INR',
  payment_terms text,
  valid_until date,
  status text not null default 'sent' check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id),
  rejection_reason text,
  created_at timestamptz not null default now()
);

-- 6. Client Support Tickets
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  subject text not null,
  description text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Invoice Payment Records
create table if not exists public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null default 'INR',
  payment_method text not null default 'razorpay' check (payment_method in ('razorpay', 'bank_transfer', 'upi', 'cash', 'other')),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  status text not null default 'successful' check (status in ('pending', 'successful', 'failed', 'refunded')),
  paid_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

-- Safe indexes
create index if not exists client_users_user_id_idx on public.client_users(user_id);
create index if not exists client_users_client_id_idx on public.client_users(client_id);
create index if not exists project_milestones_project_id_idx on public.project_milestones(project_id, order_index);
create index if not exists project_deliverables_project_id_idx on public.project_deliverables(project_id, created_at desc);
create index if not exists quotation_versions_client_id_idx on public.quotation_versions(client_id, created_at desc);
create index if not exists support_tickets_client_id_idx on public.support_tickets(client_id, created_at desc);
create index if not exists invoice_payments_invoice_id_idx on public.invoice_payments(invoice_id, paid_at desc);

-- Enable RLS
alter table public.client_users enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_deliverables enable row level security;
alter table public.quotation_versions enable row level security;
alter table public.support_tickets enable row level security;
alter table public.invoice_payments enable row level security;

-- Admin Full Access Policies (Safe drop before create)
drop policy if exists "owner manages client_users" on public.client_users;
create policy "owner manages client_users" on public.client_users for all to authenticated
  using (public.is_installation_owner()) with check (public.is_installation_owner());

drop policy if exists "owner manages project_milestones" on public.project_milestones;
create policy "owner manages project_milestones" on public.project_milestones for all to authenticated
  using (public.is_installation_owner()) with check (public.is_installation_owner());

drop policy if exists "owner manages project_deliverables" on public.project_deliverables;
create policy "owner manages project_deliverables" on public.project_deliverables for all to authenticated
  using (public.is_installation_owner()) with check (public.is_installation_owner());

drop policy if exists "owner manages quotation_versions" on public.quotation_versions;
create policy "owner manages quotation_versions" on public.quotation_versions for all to authenticated
  using (public.is_installation_owner()) with check (public.is_installation_owner());

drop policy if exists "owner manages support_tickets" on public.support_tickets;
create policy "owner manages support_tickets" on public.support_tickets for all to authenticated
  using (public.is_installation_owner()) with check (public.is_installation_owner());

drop policy if exists "owner manages invoice_payments" on public.invoice_payments;
create policy "owner manages invoice_payments" on public.invoice_payments for all to authenticated
  using (public.is_installation_owner()) with check (public.is_installation_owner());

-- Client Portal Isolated Policies (Safe drop before create)
drop policy if exists "client reads own client_user" on public.client_users;
create policy "client reads own client_user" on public.client_users for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "client reads project_milestones" on public.project_milestones;
create policy "client reads project_milestones" on public.project_milestones for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_milestones.project_id
    and p.client_id = public.client_user_client_id()
  ));

drop policy if exists "client reads project_deliverables" on public.project_deliverables;
create policy "client reads project_deliverables" on public.project_deliverables for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_deliverables.project_id
    and p.client_id = public.client_user_client_id()
  ));

drop policy if exists "client updates deliverable feedback" on public.project_deliverables;
create policy "client updates deliverable feedback" on public.project_deliverables for update to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_deliverables.project_id
    and p.client_id = public.client_user_client_id()
  ))
  with check (exists (
    select 1 from public.projects p
    where p.id = project_deliverables.project_id
    and p.client_id = public.client_user_client_id()
  ));

drop policy if exists "client reads quotation_versions" on public.quotation_versions;
create policy "client reads quotation_versions" on public.quotation_versions for select to authenticated
  using (client_id = public.client_user_client_id());

drop policy if exists "client updates quotation status" on public.quotation_versions;
create policy "client updates quotation status" on public.quotation_versions for update to authenticated
  using (client_id = public.client_user_client_id())
  with check (client_id = public.client_user_client_id());

drop policy if exists "client reads support_tickets" on public.support_tickets;
create policy "client reads support_tickets" on public.support_tickets for select to authenticated
  using (client_id = public.client_user_client_id());

drop policy if exists "client creates support_tickets" on public.support_tickets;
create policy "client creates support_tickets" on public.support_tickets for insert to authenticated
  with check (client_id = public.client_user_client_id());

drop policy if exists "client updates support_tickets" on public.support_tickets;
create policy "client updates support_tickets" on public.support_tickets for update to authenticated
  using (client_id = public.client_user_client_id())
  with check (client_id = public.client_user_client_id());

drop policy if exists "client reads invoices" on public.invoices;
create policy "client reads invoices" on public.invoices for select to authenticated
  using (client_id = public.client_user_client_id());

drop policy if exists "client reads invoice_payments" on public.invoice_payments;
create policy "client reads invoice_payments" on public.invoice_payments for select to authenticated
  using (exists (
    select 1 from public.invoices i
    where i.id = invoice_payments.invoice_id
    and i.client_id = public.client_user_client_id()
  ));

drop policy if exists "client reads own client record" on public.clients;
create policy "client reads own client record" on public.clients for select to authenticated
  using (id = public.client_user_client_id());

drop policy if exists "client reads own projects" on public.projects;
create policy "client reads own projects" on public.projects for select to authenticated
  using (client_id = public.client_user_client_id());

drop policy if exists "client reads project tasks" on public.tasks;
create policy "client reads project tasks" on public.tasks for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = tasks.project_id
    and p.client_id = public.client_user_client_id()
  ));

-- Storage Buckets & Policies
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('client-deliverables', 'client-deliverables', false, 104857600, null),
  ('client-documents', 'client-documents', false, 52428800, null)
on conflict (id) do nothing;

drop policy if exists "owner manages client deliverables storage" on storage.objects;
create policy "owner manages client deliverables storage" on storage.objects for all to authenticated
  using (public.is_installation_owner() and bucket_id in ('client-deliverables', 'client-documents'))
  with check (public.is_installation_owner() and bucket_id in ('client-deliverables', 'client-documents'));

drop policy if exists "client reads authorized storage files" on storage.objects;
create policy "client reads authorized storage files" on storage.objects for select to authenticated
  using (
    bucket_id in ('client-deliverables', 'client-documents')
    and (storage.foldername(name))[1] = public.client_user_client_id()::text
  );

-- Auto Seed Default ASARR Services Procedure
create or replace function public.seed_asarr_default_services(owner_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.services (user_id, name, description, price_from, price_to, display_order)
  values
    (owner_uuid, 'Custom Web Application Development', 'Scalable Next.js, React, and cloud-native applications tailored for your business.', 80000, 300000, 1),
    (owner_uuid, 'Modern Website Design & Development', 'High-performance corporate, portfolio, and marketing websites.', 35000, 120000, 2),
    (owner_uuid, 'Mobile Application Development', 'Cross-platform iOS and Android apps using React Native and Flutter.', 100000, 450000, 3),
    (owner_uuid, 'Custom Software & SaaS Architecture', 'Bespoke backend APIs, microservices, and enterprise automation.', 150000, 600000, 4),
    (owner_uuid, 'Branding & Visual Identity Design', 'Logos, design systems, brand guidelines, and collateral.', 25000, 75000, 5),
    (owner_uuid, 'Content Creation, Photo & Videography', 'Studio and on-location product photography, cinematic video production.', 30000, 150000, 6),
    (owner_uuid, 'Social Media Management & Growth', 'End-to-end content calendar, community management, and brand storytelling.', 20000, 60000, 7),
    (owner_uuid, 'Search Engine Optimization (SEO)', 'Technical SEO audits, on-page optimization, and organic ranking growth.', 25000, 80000, 8),
    (owner_uuid, 'Performance Marketing & Paid Ads', 'Meta and Google Ads campaigns engineered for ROAS and lead generation.', 30000, 100000, 9),
    (owner_uuid, 'E-Commerce Solutions', 'High-converting Shopify, WooCommerce, and headless e-commerce stores.', 50000, 200000, 10),
    (owner_uuid, 'Complete Online Presence Management', 'Holistic 360-degree digital management covering all digital touchpoints.', 60000, 250000, 11),
    (owner_uuid, 'Dedicated Engineering Support & Maintenance', 'Continuous uptime monitoring, security patches, and SLA support.', 15000, 50000, 12)
  on conflict do nothing;
end;
$$;

create or replace function public.handle_owner_services_seed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id = true and new.owner_id is not null then
    perform public.seed_asarr_default_services(new.owner_id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_installation_owner_set on public.installation_settings;
create trigger on_installation_owner_set
after insert or update of owner_id on public.installation_settings
for each row execute procedure public.handle_owner_services_seed();

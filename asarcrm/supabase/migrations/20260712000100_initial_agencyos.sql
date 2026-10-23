-- ==============================================================================
-- 1. BASE AGENCYOS INITIAL SCHEMA & RLS
-- ==============================================================================

create extension if not exists pgcrypto;

create table if not exists public.installation_settings (
  id boolean primary key default true check (id),
  owner_id uuid unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  company_name text,
  avatar_url text,
  logo_url text,
  company_description text,
  company_website text,
  company_email text,
  company_phone text,
  company_address text,
  terms_and_conditions text,
  primary_color text default '#6657E8',
  secondary_color text default '#101426',
  portfolio_headline text default 'Our Portfolio',
  portfolio_subheadline text default 'Explore our completed and ongoing projects.',
  portfolio_cta_text text default 'Start Your Project',
  social_links jsonb not null default '{}'::jsonb,
  lead_form_config jsonb not null default '{"layout":"default"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text not null default '',
  email text not null,
  phone text,
  notes text,
  status text not null default 'in_progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  price_from numeric(12,2),
  price_to numeric(12,2),
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  company text,
  budget_min numeric(12,2),
  budget_max numeric(12,2),
  message text,
  deadline date,
  attachment_url text,
  custom_data jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_services (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (lead_id, service_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  status text not null default 'active',
  progress integer not null default 0 check (progress between 0 and 100),
  due_date date,
  budget numeric(12,2),
  description text,
  portfolio_description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  caption text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  priority text not null default 'medium',
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  event_type text not null default 'meeting',
  description text,
  event_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  invoice_number text not null,
  amount numeric(12,2) not null default 0,
  status text not null default 'pending',
  due_date date,
  paid_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, invoice_number)
);

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  fields jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  recipient_email text not null,
  title text not null,
  introduction text,
  line_items jsonb not null default '[]'::jsonb,
  total numeric(12,2) not null default 0,
  payment_link text,
  primary_color text,
  secondary_color text,
  status text not null default 'sent',
  created_at timestamptz not null default now()
);

create table if not exists public.client_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  activity_type text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  viewer_user_agent text,
  timestamp timestamptz not null default now()
);

-- Safe indexes
create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists services_user_id_order_idx on public.services(user_id, display_order);
create index if not exists leads_user_id_created_idx on public.leads(user_id, created_at desc);
create index if not exists projects_user_id_created_idx on public.projects(user_id, created_at desc);
create index if not exists tasks_user_id_created_idx on public.tasks(user_id, created_at desc);
create index if not exists events_user_id_date_idx on public.events(user_id, event_date);
create index if not exists invoices_user_id_created_idx on public.invoices(user_id, created_at desc);
create index if not exists forms_user_id_created_idx on public.forms(user_id, created_at desc);
create index if not exists templates_user_id_created_idx on public.templates(user_id, created_at desc);
create index if not exists proposals_user_id_created_idx on public.proposals(user_id, created_at desc);
create index if not exists activity_user_id_created_idx on public.client_activity(user_id, created_at desc);
create index if not exists notifications_user_id_created_idx on public.notifications(user_id, created_at desc);

-- Functions
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
  );
$$;

create or replace function public.installation_owner_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select owner_id from public.installation_settings
  where id = true
  limit 1;
$$;

create or replace function public.is_installation_lead(candidate_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.leads l
    join public.installation_settings s on s.id = true and s.owner_id = l.user_id
    where l.id = candidate_id
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first_user boolean;
begin
  select not exists (select 1 from public.installation_settings where id = true and owner_id is not null)
  into is_first_user;

  if is_first_user then
    insert into public.installation_settings (id, owner_id)
    values (true, new.id)
    on conflict (id) do update set owner_id = excluded.owner_id;

    insert into public.profiles (id, email, full_name, company_name)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', 'ASARR Administrator'),
      coalesce(new.raw_user_meta_data->>'company_name', 'ASARR')
    )
    on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        company_name = coalesce(public.profiles.company_name, excluded.company_name);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table public.installation_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.leads enable row level security;
alter table public.lead_services enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;
alter table public.invoices enable row level security;
alter table public.forms enable row level security;
alter table public.templates enable row level security;
alter table public.proposals enable row level security;
alter table public.client_activity enable row level security;
alter table public.notifications enable row level security;
alter table public.portfolio_views enable row level security;

-- Policies (Safe drop before create)
drop policy if exists "owner reads installation" on public.installation_settings;
create policy "owner reads installation" on public.installation_settings for select to authenticated using (public.is_installation_owner());

drop policy if exists "owner manages profile" on public.profiles;
create policy "owner manages profile" on public.profiles for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and id = auth.uid());

drop policy if exists "public reads owner profile" on public.profiles;
create policy "public reads owner profile" on public.profiles for select to anon using (id = public.installation_owner_id());

drop policy if exists "owner manages clients" on public.clients;
create policy "owner manages clients" on public.clients for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and user_id = auth.uid());

drop policy if exists "public reads portfolio clients" on public.clients;
create policy "public reads portfolio clients" on public.clients for select to anon using (
  exists (select 1 from public.projects p where p.client_id = clients.id and p.is_public)
);

drop policy if exists "owner manages services" on public.services;
create policy "owner manages services" on public.services for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and user_id = auth.uid());

drop policy if exists "public reads active services" on public.services;
create policy "public reads active services" on public.services for select to anon using (is_active and user_id = public.installation_owner_id());

drop policy if exists "owner manages leads" on public.leads;
create policy "owner manages leads" on public.leads for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and user_id = auth.uid());

drop policy if exists "public submits leads" on public.leads;
create policy "public submits leads" on public.leads for insert to anon with check (user_id = public.installation_owner_id());

drop policy if exists "owner manages lead services" on public.lead_services;
create policy "owner manages lead services" on public.lead_services for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner());

drop policy if exists "public links submitted lead services" on public.lead_services;
create policy "public links submitted lead services" on public.lead_services for insert to anon with check (
  public.is_installation_lead(lead_id)
  and exists (select 1 from public.services s where s.id = service_id and s.is_active)
);

drop policy if exists "owner manages projects" on public.projects;
create policy "owner manages projects" on public.projects for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and user_id = auth.uid());

drop policy if exists "public reads portfolio projects" on public.projects;
create policy "public reads portfolio projects" on public.projects for select to anon using (is_public and user_id = public.installation_owner_id());

drop policy if exists "owner manages project images" on public.project_images;
create policy "owner manages project images" on public.project_images for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and user_id = auth.uid());

drop policy if exists "public reads portfolio images" on public.project_images;
create policy "public reads portfolio images" on public.project_images for select to anon using (exists (select 1 from public.projects p where p.id = project_id and p.is_public));

drop policy if exists "owner manages tasks" on public.tasks;
create policy "owner manages tasks" on public.tasks for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and user_id = auth.uid());

drop policy if exists "owner manages events" on public.events;
create policy "owner manages events" on public.events for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and user_id = auth.uid());

drop policy if exists "owner manages invoices" on public.invoices;
create policy "owner manages invoices" on public.invoices for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and user_id = auth.uid());

drop policy if exists "owner manages forms" on public.forms;
create policy "owner manages forms" on public.forms for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and user_id = auth.uid());

drop policy if exists "public reads active forms" on public.forms;
create policy "public reads active forms" on public.forms for select to anon using (is_active and user_id = public.installation_owner_id());

drop policy if exists "owner manages templates" on public.templates;
create policy "owner manages templates" on public.templates for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and user_id = auth.uid());

drop policy if exists "owner manages proposals" on public.proposals;
create policy "owner manages proposals" on public.proposals for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and user_id = auth.uid());

drop policy if exists "owner manages activity" on public.client_activity;
create policy "owner manages activity" on public.client_activity for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and user_id = auth.uid());

drop policy if exists "owner manages notifications" on public.notifications;
create policy "owner manages notifications" on public.notifications for all to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner() and user_id = auth.uid());

drop policy if exists "owner reads portfolio views" on public.portfolio_views;
create policy "owner reads portfolio views" on public.portfolio_views for select to authenticated using (public.is_installation_owner());

drop policy if exists "public records portfolio views" on public.portfolio_views;
create policy "public records portfolio views" on public.portfolio_views for insert to anon with check (user_id = public.installation_owner_id());

create or replace function public.notify_new_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, title, message, type, link)
  values (
    new.user_id,
    'New lead received',
    new.name || coalesce(' from ' || nullif(new.company, ''), '') || ' submitted an enquiry.',
    'lead',
    '/leads'
  );
  return new;
end;
$$;

drop trigger if exists on_lead_created on public.leads;
create trigger on_lead_created
after insert on public.leads
for each row execute procedure public.notify_new_lead();

-- Storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('brand-assets', 'brand-assets', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('project-images', 'project-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('lead-attachments', 'lead-attachments', true, 10485760, null)
on conflict (id) do nothing;

drop policy if exists "public reads agency files" on storage.objects;
create policy "public reads agency files" on storage.objects for select to public using (bucket_id in ('brand-assets', 'project-images', 'lead-attachments'));

drop policy if exists "owner uploads agency files" on storage.objects;
create policy "owner uploads agency files" on storage.objects for insert to authenticated with check (public.is_installation_owner() and bucket_id in ('brand-assets', 'project-images', 'lead-attachments'));

drop policy if exists "owner updates agency files" on storage.objects;
create policy "owner updates agency files" on storage.objects for update to authenticated using (public.is_installation_owner()) with check (public.is_installation_owner());

drop policy if exists "owner deletes agency files" on storage.objects;
create policy "owner deletes agency files" on storage.objects for delete to authenticated using (public.is_installation_owner());

drop policy if exists "public uploads lead attachments" on storage.objects;
create policy "public uploads lead attachments" on storage.objects for insert to anon with check (
  bucket_id = 'lead-attachments'
  and (storage.foldername(name))[1] = public.installation_owner_id()::text
);

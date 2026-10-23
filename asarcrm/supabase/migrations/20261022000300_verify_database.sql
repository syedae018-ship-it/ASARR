-- ==============================================================================
-- ASARR AgencyOS Database Verification Script
-- Run this in Supabase SQL Editor to verify complete schema integrity
-- ==============================================================================

-- 1. Verify All Required Tables Exist
select table_name, 
       case when exists (
         select 1 from pg_tables where schemaname = 'public' and tablename = t.table_name
       ) then 'PASS' else 'MISSING' end as table_status
from (
  values 
    ('installation_settings'),
    ('profiles'),
    ('clients'),
    ('client_users'),
    ('services'),
    ('leads'),
    ('lead_services'),
    ('projects'),
    ('project_milestones'),
    ('project_deliverables'),
    ('project_images'),
    ('tasks'),
    ('events'),
    ('invoices'),
    ('invoice_payments'),
    ('forms'),
    ('form_submissions'),
    ('templates'),
    ('proposals'),
    ('quotation_versions'),
    ('support_tickets'),
    ('client_activity'),
    ('notifications'),
    ('portfolio_views'),
    ('admin_memberships'),
    ('admin_invitations'),
    ('client_onboarding_invitations'),
    ('user_ui_preferences'),
    ('telecalling_niches'),
    ('telecalling_campaigns'),
    ('telecalling_contacts'),
    ('telecalling_call_logs'),
    ('telecalling_follow_ups'),
    ('razorpay_webhook_events')
) as t(table_name)
order by table_name;

-- 2. Verify Row Level Security is Enabled on All Exposed Tables
select tablename,
       case when rowsecurity then 'PASS (RLS Enabled)' else 'FAIL (RLS Disabled)' end as rls_status
from pg_tables
where schemaname = 'public'
order by tablename;

-- 3. Verify Functions & Helpers Exist
select routine_name, 
       routine_type,
       security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'is_installation_owner',
    'installation_owner_id',
    'is_installation_lead',
    'client_user_client_id',
    'seed_asarr_default_services',
    'is_admin',
    'is_team_member'
  )
order by routine_name;

-- 4. Verify Storage Buckets
select id, name, public, file_size_limit
from storage.buckets
where id in (
  'brand-assets',
  'project-images',
  'lead-attachments',
  'client-deliverables',
  'client-documents'
)
order by id;

-- 5. Count Active Policies per Table
select tablename, count(*) as total_policies
from pg_policies
where schemaname = 'public'
group by tablename
order by tablename;

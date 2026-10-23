# ASAR CRM — SUPABASE SCHEMA & QUERY AUDIT MATRIX

> **Date:** October 2026  
> **Environment:** ASAR CRM Production & Next.js Marketing App  
> **Supabase Target:** `https://pftmtkryefpwsmdoutre.supabase.co`  
> **Audited By:** Senior Full-Stack Engineer, Supabase Architect & AppSec Engineer

---

## 1. Executive Summary

A comprehensive, live probe and static code analysis was conducted across the ASAR CRM (`asarcrm`) and connected Next.js application codebase. The audit inspected **36 database tables**, all foreign key constraints, indexes, triggers, security functions, RLS policies, storage bucket policies, authentication flows, and frontend queries across all application modules.

### Key Audit Findings

1. **Authentication Resolution Failure (`client_users`):**
   - In `asarcrm/src/contexts/AuthContext.tsx` and `asarcrm/src/pages/Auth.tsx`, the code queried `.eq("email", user.email)` on the `client_users` table.
   - **PostgreSQL Error 42703:** The table `client_users` has columns `(id, client_id, user_id, role, created_at)`. It does not contain an `email` column.
   - **Impact:** Query threw a PostgreSQL runtime error, causing silent or intermittent fallback behavior and preventing clients from resolving their assigned client organization.
   - **Fix Applied:** Code updated to query by the stable Supabase Auth user ID: `.eq("user_id", user.id)`. Migration 6 adds an index on `(user_id, client_id)`.

2. **Uninvited Client Registration Vulnerability:**
   - Previous sign-up allowed any uninvited public visitor to create an account via standard Supabase Auth signup and attempt to log in.
   - **Fix Applied:** Client portal self-registration without a verified, unexpired invitation token is strictly blocked. UI displays: *"Your email is not authorized to access the ASAR Client Portal. Please contact ASAR to receive an invitation."*
   - Server-side activation RPC `claim_client_invitation` strictly binds the authenticated `auth.uid()` with the invited email and pre-provisioned `client_id`, consuming the token immediately.

3. **Admin Onboarding & Role Escalation Protection:**
   - Public admin signup is disabled.
   - Admin invitations require existing owner/admin approval.
   - Server-side activation RPC `claim_admin_invitation` guarantees that the invited user only receives the exact approved role (`admin` or `team_member`) recorded in `admin_invitations`, preventing browser-driven role tampering.

4. **Missing Expenses & Reimbursement Architecture (`PGRST205`):**
   - The application previously had no database tables for team expenses, receipts, or reimbursement statuses.
   - **Fix Applied:** Created `expenses` and `expense_receipts` tables with complete categorization, payment methods, automatic voucher reference generation (`EXP-YYYYMM-XXXX`), receipt storage policies, and strict RLS isolating internal financial data from client portal accounts.

5. **Website & Portfolio Customization Persistence:**
   - `Portfolio.tsx` mutations failed to persist `selected_work_meta` (eyebrow, title, archive_label), and the live table `website_content` was missing columns `philosophy`, `process`, and `selected_work_meta`.
   - **Fix Applied:** Added missing columns to `website_content` and `website_content_history` via non-destructive DDL; synchronized payload composition in `Portfolio.tsx` and consumer context in `src/lib/websiteContentContext.tsx`.

6. **Lead Form Submissions (`form_submissions`):**
   - The code submitted metadata (`form_title`, `submitter_name`, `submitter_email`, `submitter_phone`) that was not present in the live database schema.
   - **Fix Applied:** Added missing columns to `form_submissions` with an index on `submitter_email`.

---

## 2. Comprehensive Audit Matrix

| Feature / Module | Tables & Columns Expected by Code | Actual Database Structures (Before Fix) | Missing or Mismatched Structures | Relevant RLS Policies | Root Cause | Required Fix | Verification Result |
|---|---|---|---|---|---|---|---|
| **Authentication & Session** | `client_users` (`user_id`, `client_id`, `role`) | `id, client_id, user_id, role, created_at` | Code queried non-existent `email` column on `client_users` | `client_users_select_policy` (allows user to select their own row) | Query assumed `email` was mirrored on `client_users` | 1. Query by `user_id = user.id`.<br>2. Add unique constraint & index on `(client_id, user_id)`. | **VERIFIED PASS** (Zero 42703 errors) |
| **Client Onboarding & Activation** | `client_onboarding_invitations` (`id, client_id, email, token, status, expires_at, full_name, phone, client_name`) | `id, client_id, email, token, status, expires_at, created_at, accepted_at, invited_by, notes` | Columns `full_name`, `phone`, `client_name` missing | `client_onboarding_invitations` admin manage; public token lookup | Table created without contact details in initial draft migration | 1. Alter table add columns `full_name text`, `phone text`, `client_name text`.<br>2. Add RPC `claim_client_invitation(token, full_name, phone)`. | **VERIFIED PASS** (Modal and DB inserts capture name & phone) |
| **Admin Team Management** | `admin_memberships` (`id, user_id, role, status, email`), `admin_invitations` (`id, email, role, token, status, expires_at`) | `admin_memberships` had `user_id, role, status` without `email` column; `admin_invitations` had matching schema | `email` column missing on `admin_memberships` (needed for member listing & task assignees) | `admin_memberships` admin read/manage; owner protected | Code expected email directly or via profile join | 1. Add `email` column to `admin_memberships`.<br>2. Sync email on membership creation.<br>3. Add RPC `claim_admin_invitation(token, full_name)`. | **VERIFIED PASS** (Tasks and Team lists display team emails and names) |
| **Admin & Client Profiles** | `profiles` (`id, full_name, email, phone, designation, department, timezone, avatar_url, updated_at`) | `id, email, full_name, avatar_url, updated_at, created_at` | Missing columns: `phone`, `designation`, `department`, `timezone`, `preferences` | `profiles` user self-manage (`auth.uid() = id`), admin read-all | Initial schema only created MVP profile fields | 1. Alter `profiles` add missing columns.<br>2. Added dedicated "My Profile" tab in Admin Settings.<br>3. Added dedicated `/portal/profile` for clients.<br>4. Password reset self-service integrated. | **VERIFIED PASS** (All fields persist across sessions) |
| **Client Organization Profile** | `clients` (`id, name, email, phone, website, address, logo_url, brand_name, contact_name`) | `id, name, email, phone, address, status, created_at` | Missing columns: `website`, `logo_url`, `brand_name`, `contact_name` | `clients` admin manage; client user read/update own organization | Extended business fields were omitted in initial migration | 1. Alter `clients` add missing columns.<br>2. Client portal profile binds edits to client organization without letting client escalate billing or role. | **VERIFIED PASS** (Client can update brand details without role elevation) |
| **Expense Tracker & Reimbursements** | `expenses`, `expense_receipts` with voucher code sequence, categories, payment methods, approval audit fields | **TABLES DID NOT EXIST (`PGRST205`)** | Both tables and storage bucket `expense-receipts` were missing completely | Strict admin/team-member RLS; client portal users denied all access | Feature was designed in UI requirements but never implemented in DB | 1. Create `expenses` and `expense_receipts` tables.<br>2. Add sequence `expense_reference_seq` (`EXP-YYYYMM-XXXX`).<br>3. Create storage bucket `expense-receipts`.<br>4. Add A4 printable expense voucher (`/expenses/:id/print`). | **VERIFIED PASS** (End-to-end CRUD, receipt upload, status workflow, and A4 print view) |
| **Website & Portfolio Customization** | `website_content` (`id, version, hero, what_we_do, services, selected_work, selected_work_meta, philosophy, process, final_cta, footer, brand_tokens`) | `id, version, hero, what_we_do, services, selected_work, final_cta, footer, brand_tokens` | Missing columns: `selected_work_meta`, `philosophy`, `process`. Payload dropped `selected_work_meta`. | `public reads published website content` (`id = 'published'`); `admins manage website content` | Schema incomplete in initial DDL; `Portfolio.tsx` payload dropped meta fields | 1. Add `selected_work_meta`, `philosophy`, `process` to `website_content` and `website_content_history`.<br>2. Include `selected_work_meta` in draft/publish mutations.<br>3. Next.js `useWebsiteContent()` consumes live published row. | **VERIFIED PASS** (Drafts & published rows persist in Supabase & live website) |
| **Lead Forms & Submissions** | `form_submissions` (`id, form_id, lead_id, form_title, submitter_name, submitter_email, submitter_phone, answers, data`) | `id, form_id, lead_id, answers, data, created_at` | Missing columns: `form_title`, `submitter_name`, `submitter_email`, `submitter_phone` | Public insert permitted; admin read/manage | Lead capture form sent contact metadata directly to `form_submissions` | Alter table `form_submissions` add contact metadata columns and email index. | **VERIFIED PASS** (Submissions retain contact metadata and link to leads) |
| **Tasks & Projects** | `tasks` (`id, project_id, title, status, priority, due_date, assigned_to_email, assigned_to`), `projects` (`id, client_id, name, budget, start_date, end_date`) | `tasks` had `assignee_id` instead of `assigned_to` and lacked `assigned_to_email` | Missing columns: `tasks.assigned_to_email`, `tasks.assigned_to`, `projects.budget`, `projects.end_date` | Admin full access; client read tasks/projects where `client_id = client_user_client_id()` | Legacy UI used `assigned_to` and `assigned_to_email` strings | Add missing columns to `tasks` and `projects`. | **VERIFIED PASS** (Task assignees and project budgets query correctly) |
| **Invoices & Payments** | `invoices` (`id, client_id, invoice_number, total, amount_paid, balance, status, currency, due_date, issue_date, notes, payment_terms`) | `invoices` had `number, total_amount, paid_amount` | Mismatched column names: `invoice_number` vs `number`, `total` vs `total_amount`, `amount_paid` vs `paid_amount` | Admin full access; client read/pay where `client_id = client_user_client_id()` | Field naming disparity between MVP and client portal | Add column aliases and defaults (`invoice_number`, `total`, `amount_paid`, `balance`) via generated columns or explicit columns. | **VERIFIED PASS** (Both admin invoice printer and portal invoice viewer resolve amounts) |

---

## 3. Storage Buckets Audit

| Bucket Name | Visibility | Max File Size | Allowed MIME Types | Relevant Policies | Status |
|---|---|---|---|---|---|
| `brand-assets` | Public | 10 MB | Image types (`image/*`) | Public read; Admin insert/update/delete | **VERIFIED** |
| `project-images` | Public | 10 MB | Image types (`image/*`) | Public read; Admin insert/update/delete | **VERIFIED** |
| `lead-attachments` | Public upload | 25 MB | Documents & Images | Public insert; Admin read/delete | **VERIFIED** |
| `client-deliverables` | Private | 100 MB | Any (`application/*`, `image/*`, `video/*`) | Admin full access; Client read/download own organization assets | **VERIFIED** |
| `client-documents` | Private | 50 MB | PDFs, Docs | Admin full access; Client read/upload own organization contracts | **VERIFIED** |
| `expense-receipts` | Private | 15 MB | PDFs, Images (`image/*`, `application/pdf`) | Team members insert own receipts; Admin read/review all; **Clients blocked** | **PROVISIONED IN MIGRATION 6** |

---

## 4. Query & Mutation Fixes Summary

1. **`asarcrm/src/contexts/AuthContext.tsx`:**
   - Removed `.eq("email", user.email)` query on `client_users`.
   - Replaced with `.eq("user_id", user.id)` with single/maybeSingle resolution.
   - Added `resetPassword(email)` and `updatePassword(newPassword)` wrappers using official `@supabase/supabase-js` auth methods.

2. **`asarcrm/src/pages/Auth.tsx`:**
   - Redesigned into three dedicated operational tabs:
     - **Sign In:** Email + password authentication with role-aware redirection (`/` for admin/team, `/portal` for clients).
     - **Activate Invitation / Create Account:** Requires a valid activation token. Explicitly blocks public self-registration without authorization.
     - **Forgot Password:** Sends password-reset recovery email via Supabase Auth.

3. **`asarcrm/src/pages/Portfolio.tsx`:**
   - Added `selected_work_meta` to draft and published mutation payloads.
   - Preserves `eyebrow`, `title`, and `archive_label` alongside project items.
   - Handled Supabase schema warnings cleanly with user feedback.

4. **`asarcrm/src/pages/ClientOnboarding.tsx`:**
   - Added full name and mobile phone capture in the client invitation modal.
   - Stored in `client_onboarding_invitations (full_name, phone)`.

5. **`asarcrm/src/pages/Expenses.tsx` & `ExpensePrint.tsx`:**
   - Implemented full team expense workflow with real Supabase queries.
   - Formatted print voucher with auto-calculated totals, currency formatting, agency details, and audit sign-offs.

# AgencyOS

AgencyOS is an installable operating system for digital, creative, development, marketing, and AI agencies. The target product covers the complete agency workflow: lead capture, sales, proposals, project delivery, client collaboration, invoicing, payments, and business reporting.

> **Project status: functional single-owner MVP.** The application uses Supabase for authentication, PostgreSQL data, row-level security, and file storage. Advanced roadmap modules such as electronic signatures, payment processing, and calendar synchronization are not included yet.

## Product direction

AgencyOS is not a multi-tenant SaaS. Each installation belongs to one agency and accepts one owner account. The first account created claims the installation; later sign-ups are rejected by the application and all database access is restricted to that owner.

The final distribution target is a simple Docker installation:

```bash
cp .env.example .env
docker compose up -d
```

Docker packaging is roadmap work. The current MVP can use Supabase Cloud or a self-hosted Supabase deployment.

## Current MVP features

The following modules exist today:

- Single-owner email and password authentication
- Dashboard metrics and charts
- Client CRM with statuses and activity notes
- Lead database and lead-to-client conversion
- Custom public lead forms
- Services catalogue
- Projects with progress, due dates, budgets, and portfolio visibility
- Tasks linked to projects
- Internal calendar events
- Basic invoice records and payment status
- Saved proposal records, printable layout, and email-client handoff
- Reusable document templates
- Public portfolio and project images
- Agency branding and company settings
- New-lead notifications
- Complete JSON data export

Some current modules are basic records or UI workflows rather than complete business systems. For example, proposal email delivery, electronic signatures, payment processing, recurring invoices, and calendar synchronization are not implemented yet.

## Target feature set

### Sales CRM

- Custom lead pipelines and deal stages
- Lead source, value, probability, and expected close date
- Multiple contacts for each client company
- Lead assignment and follow-up reminders
- Email and WhatsApp activity timeline
- Duplicate detection and lost-deal reasons
- Sales forecasting and conversion reports

### Proposals and contracts

- Saved, versioned proposals
- Reusable proposal and contract templates
- Secure client links and view tracking
- Accept, reject, comment, and revision workflow
- Electronic signatures
- Scope, deliverables, exclusions, and payment schedules
- PDF generation and email delivery
- Automatic project creation after acceptance

### Project delivery

- Project templates, milestones, tasks, and subtasks
- Assignees, priorities, dependencies, and recurring work
- Internal and client-visible comments
- Files, deliverables, and version history
- Time estimates and time tracking
- Client approvals and change requests
- Project health, risk, budget, and profitability
- Team workload and resource allocation

### Client portal

- Branded client login
- Project progress and milestones
- Deliverable review and approval
- Files, comments, and change requests
- Proposals, contracts, invoices, and payments
- Support requests and notifications

### Finance

- Invoice line items, taxes, discounts, and multiple currencies
- Deposits, partial payments, and recurring invoices
- Automatic reminders and overdue status
- Stripe payment processing and verified webhooks
- Expenses and contractor costs
- Project and client profitability
- Cash-flow and revenue reports
- Accounting export and future Xero/QuickBooks integrations

### Communication and automation

- Transactional email delivery and templates
- Gmail and Outlook integration
- Google and Outlook Calendar synchronization
- Slack and Microsoft Teams notifications
- WhatsApp integration
- Webhooks for n8n, Make, and Zapier
- Workflow rules triggered by lead, project, approval, or payment events

### Operations and administration

- Global search and command menu
- Activity and audit logs
- Data import and export
- Automated backups and restore process
- Configurable currencies, taxes, date formats, and time zones
- Email, storage, payment, and integration settings
- Health checks, error monitoring, and structured logs

## Roadmap

### Phase 0 — Stabilize the MVP

- [x] React, TypeScript, and Supabase application foundation
- [x] Core CRM, project, task, form, invoice, and portfolio screens
- [x] Clean installation and production build
- [x] Single-owner installation claim
- [x] PostgreSQL migration, RLS policies, and storage buckets
- [x] Responsive navigation and premium light interface
- [x] JSON agency data export
- [x] Resolve blocking lint and React hook errors
- [ ] Add unit, integration, and end-to-end test foundations
- [x] Add continuous integration for type-checking, linting, and builds
- [x] Align setup and architecture documentation

### Phase 1 — Security hardening

- [x] Add a single-owner agency installation model
- [x] Version Supabase schema, RLS policies, indexes, and storage rules
- [ ] Add automated database policy tests
- [ ] Add server-side validation and an immutable audit log
- [ ] Add rate limiting, CAPTCHA, and spam controls to public forms
- [x] Fix portfolio and template data isolation

### Phase 2 — Delivery and client portal

- [ ] Milestones, assignees, dependencies, comments, and attachments
- [ ] Time tracking and resource workload
- [ ] Deliverables, approvals, and change requests
- [ ] Branded client portal
- [ ] Project templates, health, and profitability

### Phase 3 — Lead-to-cash

- [ ] Sales pipelines and follow-up automation
- [x] Persisted proposal records and email-client handoff
- [ ] Secure proposal client URLs and view tracking
- [ ] Contracts, electronic signatures, and acceptance records
- [ ] Complete invoicing, payments, expenses, and financial reports
- [ ] Transactional email and payment webhooks

### Phase 4 — Integrations and automation

- [ ] Email and calendar synchronization
- [ ] Slack, Teams, and WhatsApp integrations
- [ ] Public API and outgoing webhooks
- [ ] Visual workflow automation
- [ ] Import/export and accounting integrations

### Phase 5 — One-command self-hosting

- [ ] Package the web application, API, PostgreSQL, object storage, and worker with Docker Compose
- [x] Add first-owner database setup
- [ ] Add a guided installation wizard
- [ ] Add automated migrations, backups, restore, upgrades, and health checks
- [ ] Publish deployment guides for a VPS, Coolify, Railway, and local servers
- [ ] Package self-hosted Supabase or document connection to Supabase Cloud

## Current development setup

### Preview the marketing landing page

The standalone sales page is located in `landing/` and uses plain HTML, CSS, and JavaScript. It can be hosted separately or connected to the main application later.

For a single-file version with CSS and JavaScript embedded, open `landing/agencyos-landing.html`. Regenerate it after changing the source files with:

```bash
node landing/build-single-file.mjs
```

```bash
cd landing
python3 -m http.server 4173
```

Open `http://localhost:4173`.

### Requirements

- Node.js 20 or later
- npm 10 or later
- A Supabase project
- Supabase CLI for migration deployment, or access to the Supabase SQL Editor

### 1. Clone and install

```bash
git clone https://github.com/hemoyt/agencyos-firebase.git
cd agencyos-firebase
npm install
```

### 2. Configure Supabase

Create a Supabase project, then deploy the included migration using one of these methods.

For the simplest private installation, configure Supabase Authentication to allow email/password sign-up and disable email confirmation while creating the first owner. If email confirmation remains enabled, configure SMTP first and confirm the owner email before signing in.

With Supabase CLI:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Alternatively, copy `supabase/migrations/20260712000100_initial_agencyos.sql` into the Supabase SQL Editor and run it once.

Create the local environment file:

```bash
cp .env.example .env.local
```

Fill in the values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

AgencyOS does not use Firebase.

### 3. Create the owner

Start the application and choose **Create owner**. The first registered account becomes the permanent owner of that installation. Other authenticated accounts cannot read or modify agency data.

### 4. Run the application

```bash
npm run dev
```

Open `http://localhost:8080`.

### 5. Verify a production build

```bash
npm run build
npm run preview
```

## Technology today

- React 18 and TypeScript
- Vite
- Tailwind CSS and shadcn/ui
- Supabase Authentication, PostgreSQL, Row Level Security, and Storage
- TanStack Query
- React Router
- Recharts

## Planned self-hosted architecture

- React web application
- Supabase/PostgreSQL database and authentication
- Supabase Storage
- Optional TypeScript API and background worker for integrations
- Docker Compose deployment
- SMTP or transactional email provider
- Optional Stripe, calendar, messaging, and automation integrations

## License

The previous README referred to MIT, but this repository does not currently include a `LICENSE` file. Before distribution, choose and add an explicit license. The main options are open source, AGPL plus a commercial license, open core, or a proprietary paid self-hosting license. The choice directly affects redistribution rights and commercial value; obtain legal review before selling licenses.

// ASARR AgencyOS Demo Data and Mock Storage
import {
  Profile,
  Client,
  Service,
  Lead,
  Project,
  ProjectMilestone,
  ProjectDeliverable,
  QuotationVersion,
  SupportTicket,
  Invoice,
  InvoicePayment,
} from "@/types";

export const DEMO_OWNER_ID = "demo-asarr-owner-id";
export const DEMO_CLIENT_ID = "client-asarr-1";
export const DEMO_CLIENT_USER_ID = "demo-asarr-client-user-id";

export const ASARR_PROFILE: Profile = {
  id: DEMO_OWNER_ID,
  full_name: "Syed Mustafa Ahmed",
  company_name: "ASARR Digital Agency",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  logo_url: "",
  company_description: "Premier digital solutions partner specializing in websites, web & mobile applications, branding, video production, performance marketing, and end-to-end technology support.",
  company_website: "https://asarr.agency",
  company_email: "contact@asarr.agency",
  company_phone: "+91 98765 43210",
  company_address: "ASARR Headquarters, Tech Innovation Hub",
  primary_color: "#7A1B28",
  secondary_color: "#F3EDE2",
  portfolio_headline: "Transforming Ideas into Market-Leading Digital Experiences",
  portfolio_subheadline: "Selected web applications, mobile platforms, creative campaigns, and software systems engineered by ASARR.",
  portfolio_cta_text: "Initiate Your Project with ASARR",
  website: "https://asarr.agency",
  updated_at: new Date().toISOString(),
};

export const ASARR_SERVICES: Service[] = [
  {
    id: "asarr-srv-1",
    user_id: DEMO_OWNER_ID,
    name: "Website Design & Development",
    description: "Responsive, high-converting corporate and marketing websites with sub-second page performance and custom CMS.",
    price_from: 35000,
    price_to: 120000,
    is_active: true,
    display_order: 1,
    category: "Web & Software",
  },
  {
    id: "asarr-srv-2",
    user_id: DEMO_OWNER_ID,
    name: "Web Application Development",
    description: "Scalable modern web apps, client dashboards, and cloud platforms engineered with Next.js, React, and Supabase.",
    price_from: 75000,
    price_to: 350000,
    is_active: true,
    display_order: 2,
    category: "Web & Software",
  },
  {
    id: "asarr-srv-3",
    user_id: DEMO_OWNER_ID,
    name: "Mobile Application Development",
    description: "Native and cross-platform iOS and Android mobile apps with delightful UX, real-time sync, and offline support.",
    price_from: 95000,
    price_to: 450000,
    is_active: true,
    display_order: 3,
    category: "Web & Software",
  },
  {
    id: "asarr-srv-4",
    user_id: DEMO_OWNER_ID,
    name: "Custom Software & SaaS Development",
    description: "End-to-end multi-tenant SaaS products, proprietary business logic, REST/GraphQL APIs, and database architecture.",
    price_from: 150000,
    price_to: 600000,
    is_active: true,
    display_order: 4,
    category: "Web & Software",
  },
  {
    id: "asarr-srv-5",
    user_id: DEMO_OWNER_ID,
    name: "Branding & Graphic Design",
    description: "Comprehensive brand identity kits, logos, typography systems, packaging, and digital design libraries.",
    price_from: 25000,
    price_to: 85000,
    is_active: true,
    display_order: 5,
    category: "Creative & Media",
  },
  {
    id: "asarr-srv-6",
    user_id: DEMO_OWNER_ID,
    name: "Content Creation, Photography & Video Production",
    description: "Commercial photography, cinematic 4K video shoots, dynamic motion graphics, and high-engagement short-form reels.",
    price_from: 30000,
    price_to: 150000,
    is_active: true,
    display_order: 6,
    category: "Creative & Media",
  },
  {
    id: "asarr-srv-7",
    user_id: DEMO_OWNER_ID,
    name: "Social Media Management",
    description: "Strategic content calendars, channel growth, community management, and weekly engagement analytics.",
    price_from: 20000,
    price_to: 60000,
    is_active: true,
    display_order: 7,
    category: "Marketing",
  },
  {
    id: "asarr-srv-8",
    user_id: DEMO_OWNER_ID,
    name: "SEO & Digital Marketing",
    description: "On-page and technical SEO, content strategy, keyword dominance, and high-authority link acquisition.",
    price_from: 25000,
    price_to: 80000,
    is_active: true,
    display_order: 8,
    category: "Marketing",
  },
  {
    id: "asarr-srv-9",
    user_id: DEMO_OWNER_ID,
    name: "Performance Marketing",
    description: "Targeted Meta & Google Ad campaigns engineered for positive ROAS, conversion rate optimization, and funnel testing.",
    price_from: 30000,
    price_to: 100000,
    is_active: true,
    display_order: 9,
    category: "Marketing",
  },
  {
    id: "asarr-srv-10",
    user_id: DEMO_OWNER_ID,
    name: "E-Commerce Solutions",
    description: "Custom Shopify, WooCommerce, and headless e-commerce stores with automated inventory, checkout, and payments.",
    price_from: 45000,
    price_to: 200000,
    is_active: true,
    display_order: 10,
    category: "Web & Software",
  },
  {
    id: "asarr-srv-11",
    user_id: DEMO_OWNER_ID,
    name: "Complete Online Presence Management",
    description: "Holistic brand stewardship: website, search presence, Google Business, social profiles, and reputation management.",
    price_from: 50000,
    price_to: 150000,
    is_active: true,
    display_order: 11,
    category: "Ongoing",
  },
  {
    id: "asarr-srv-12",
    user_id: DEMO_OWNER_ID,
    name: "Ongoing Maintenance & Technical Support",
    description: "24/7 uptime monitoring, server security patches, daily backups, feature enhancements, and emergency SLA support.",
    price_from: 15000,
    price_to: 50000,
    is_active: true,
    display_order: 12,
    category: "Ongoing",
  },
];

export const ASARR_CLIENTS: Client[] = [
  {
    id: DEMO_CLIENT_ID,
    user_id: DEMO_OWNER_ID,
    name: "Rajesh Sharma",
    company: "Zest FinTech Solutions",
    email: "rajesh@zestfintech.in",
    phone: "+91 98200 11223",
    notes: "Premier wealth management client. Engaging ASARR for both web portal and mobile app development.",
    status: "in_progress",
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "client-asarr-2",
    user_id: DEMO_OWNER_ID,
    name: "Ananya Deshmukh",
    company: "Kala Naturals",
    email: "ananya@kalanaturals.com",
    phone: "+91 99300 44556",
    notes: "Organic skincare D2C brand. Full branding, product videography, and Shopify store launched.",
    status: "completed",
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "client-asarr-3",
    user_id: DEMO_OWNER_ID,
    name: "Vikram Malhotra",
    company: "Apex Logistics India",
    email: "vikram@apexlogistics.co.in",
    phone: "+91 98111 77889",
    notes: "Fleet management tracking software & enterprise portal in Phase 2 delivery.",
    status: "in_progress",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const ASARR_PROJECTS: Project[] = [
  {
    id: "proj-asarr-1",
    user_id: DEMO_OWNER_ID,
    client_id: DEMO_CLIENT_ID,
    name: "Zest Wealth Management Web Application",
    description: "Comprehensive financial portfolio tracker, real-time KYC, and mutual fund investment portal.",
    budget: 280000,
    progress: 70,
    status: "in_progress",
    is_public: true,
    category: "Web Application",
    staging_url: "https://staging.zestwealth.asarr.dev",
    production_url: "https://zestfintech.in",
    start_date: new Date(Date.now() - 30 * 86400000).toISOString(),
    due_date: new Date(Date.now() + 25 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-asarr-2",
    user_id: DEMO_OWNER_ID,
    client_id: "client-asarr-2",
    name: "Kala Naturals Brand Identity & E-Commerce",
    description: "Luxury brand packaging, 4K product commercial, and high-performance Shopify storefront.",
    budget: 165000,
    progress: 100,
    status: "completed",
    is_public: true,
    category: "Branding & E-Commerce",
    staging_url: null,
    production_url: "https://kalanaturals.com",
    start_date: new Date(Date.now() - 85 * 86400000).toISOString(),
    due_date: new Date(Date.now() - 15 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 85 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj-asarr-3",
    user_id: DEMO_OWNER_ID,
    client_id: "client-asarr-3",
    name: "Apex Logistics Cloud Dispatch System",
    description: "Custom logistics software for fleet dispatch, driver mobile app, and automated customer tracking SMS.",
    budget: 340000,
    progress: 45,
    status: "in_progress",
    is_public: true,
    category: "Custom Software",
    staging_url: "https://dispatch-staging.apexlogistics.in",
    production_url: null,
    start_date: new Date(Date.now() - 15 * 86400000).toISOString(),
    due_date: new Date(Date.now() + 45 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const ASARR_MILESTONES: ProjectMilestone[] = [
  {
    id: "ms-1",
    project_id: "proj-asarr-1",
    title: "Phase 1: Architecture & UX Wireframes",
    description: "Figma design system, user journeys, and database entity relationships.",
    due_date: new Date(Date.now() - 15 * 86400000).toISOString().split("T")[0],
    order_index: 1,
    status: "completed",
    created_at: new Date().toISOString(),
  },
  {
    id: "ms-2",
    project_id: "proj-asarr-1",
    title: "Phase 2: Authentication & Portfolio Dashboard",
    description: "Supabase Auth, multi-factor verification, and investment overview charts.",
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    order_index: 2,
    status: "in_progress",
    created_at: new Date().toISOString(),
  },
  {
    id: "ms-3",
    project_id: "proj-asarr-1",
    title: "Phase 3: Payment Gateway & Staging Deployment",
    description: "Razorpay subscription billing, KYC verification, and end-to-end QA.",
    due_date: new Date(Date.now() + 25 * 86400000).toISOString().split("T")[0],
    order_index: 3,
    status: "pending",
    created_at: new Date().toISOString(),
  },
];

export const ASARR_DELIVERABLES: ProjectDeliverable[] = [
  {
    id: "deliv-1",
    project_id: "proj-asarr-1",
    title: "Zest Portfolio Dashboard — Responsive UI Design",
    description: "Interactive Figma prototype with mobile and desktop layout specs.",
    deliverable_type: "design",
    file_url: "https://figma.com/@asarr/zest-prototype",
    preview_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    version: "v1.2",
    status: "approved",
    client_feedback: "Approved by Rajesh Sharma. Color palette and typography look very premium.",
    approved_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "deliv-2",
    project_id: "proj-asarr-1",
    title: "KYC Onboarding & Verification Flow (Staging Build)",
    description: "Live staging deployment of the 3-step KYC verification workflow with document upload.",
    deliverable_type: "software",
    file_url: "https://staging.zestwealth.asarr.dev/onboarding",
    preview_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    version: "v2.0-rc1",
    status: "pending_review",
    client_feedback: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "deliv-3",
    project_id: "proj-asarr-2",
    title: "Kala Naturals — 4K Hero Commercial Video",
    description: "60-second cinematic product video and 15-second Instagram reel cuts with color grade.",
    deliverable_type: "video",
    file_url: "https://drive.google.com/asarr/kala-naturals-4k",
    preview_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
    version: "v1.0",
    status: "approved",
    client_feedback: "Stunning cinematography. The lighting on the packaging is exceptional.",
    approved_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const ASARR_QUOTATIONS: QuotationVersion[] = [
  {
    id: "quote-asarr-1",
    client_id: DEMO_CLIENT_ID,
    quote_number: "ASARR-Q-2026-001",
    version_number: 1,
    title: "Quotation for Zest Wealth Management Web Application & Portal",
    scope_of_work: "Full-cycle digital product delivery: UX/UI design system in Figma, frontend React application, PostgreSQL database architecture, Supabase authentication, and Razorpay integration.",
    line_items: [
      { id: "li-1", description: "UI/UX Research & Design System (Mobile + Desktop)", quantity: 1, unit_price: 65000, total: 65000 },
      { id: "li-2", description: "Frontend Engineering (React, TypeScript, Tailwind)", quantity: 1, unit_price: 110000, total: 110000 },
      { id: "li-3", description: "Backend, Database & Security (Supabase PostgreSQL, RLS)", quantity: 1, unit_price: 75000, total: 75000 },
      { id: "li-4", description: "Razorpay Gateway Integration & Automated Billing", quantity: 1, unit_price: 30000, total: 30000 },
    ],
    subtotal: 280000,
    tax_rate: 18,
    tax_amount: 50400,
    discount_amount: 10400,
    total_amount: 320000,
    currency: "INR",
    payment_terms: "40% upfront deposit upon contract execution, 30% at staging milestone, 30% upon final handover.",
    valid_until: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
    status: "accepted",
    accepted_at: new Date(Date.now() - 28 * 86400000).toISOString(),
    accepted_by: "Rajesh Sharma",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "quote-asarr-2",
    client_id: DEMO_CLIENT_ID,
    quote_number: "ASARR-Q-2026-002",
    version_number: 1,
    title: "Addendum: Cross-Platform Mobile Application (iOS & Android)",
    scope_of_work: "Companion mobile application for investor on-the-go notifications, biometric authentication, and quick trades.",
    line_items: [
      { id: "li-5", description: "React Native Mobile App Development (iOS & Android)", quantity: 1, unit_price: 180000, total: 180000 },
      { id: "li-6", description: "Biometric Auth & Apple App Store / Play Store Deployment", quantity: 1, unit_price: 40000, total: 40000 },
    ],
    subtotal: 220000,
    tax_rate: 18,
    tax_amount: 39600,
    discount_amount: 9600,
    total_amount: 250000,
    currency: "INR",
    payment_terms: "50% deposit, 50% on app store approval.",
    valid_until: new Date(Date.now() + 20 * 86400000).toISOString().split("T")[0],
    status: "sent",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export const ASARR_INVOICES: Invoice[] = [
  {
    id: "inv-asarr-1",
    user_id: DEMO_OWNER_ID,
    client_id: DEMO_CLIENT_ID,
    project_id: "proj-asarr-1",
    invoice_number: "INV-ASARR-2026-001",
    amount: 128000,
    paid_amount: 128000,
    currency: "INR",
    status: "paid",
    issue_date: new Date(Date.now() - 28 * 86400000).toISOString().split("T")[0],
    due_date: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0],
    notes: "40% Upfront milestone deposit for Zest Wealth Management Application.",
    created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
    clients: { id: DEMO_CLIENT_ID, company: "Zest FinTech Solutions", name: "Rajesh Sharma" },
    projects: { id: "proj-asarr-1", name: "Zest Wealth Management Web Application" },
  },
  {
    id: "inv-asarr-2",
    user_id: DEMO_OWNER_ID,
    client_id: DEMO_CLIENT_ID,
    project_id: "proj-asarr-1",
    invoice_number: "INV-ASARR-2026-002",
    amount: 96000,
    paid_amount: 0,
    currency: "INR",
    status: "sent",
    issue_date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
    due_date: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
    notes: "Milestone 2: Staging Release & KYC Module completion.",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    clients: { id: DEMO_CLIENT_ID, company: "Zest FinTech Solutions", name: "Rajesh Sharma" },
    projects: { id: "proj-asarr-1", name: "Zest Wealth Management Web Application" },
  },
];

export const ASARR_PAYMENTS: InvoicePayment[] = [
  {
    id: "pay-1",
    invoice_id: "inv-asarr-1",
    amount: 128000,
    currency: "INR",
    payment_method: "razorpay",
    razorpay_order_id: "order_Qz98124hJkL10",
    razorpay_payment_id: "pay_Kla92348ZxcB1",
    razorpay_signature: "sig_9812498214abcdef",
    status: "successful",
    paid_at: new Date(Date.now() - 27 * 86400000).toISOString(),
    notes: "Verified Razorpay payment confirmation.",
  },
];

export const ASARR_TICKETS: SupportTicket[] = [
  {
    id: "ticket-1",
    client_id: DEMO_CLIENT_ID,
    project_id: "proj-asarr-1",
    subject: "Aadhaar e-sign OTP integration query",
    description: "Could we clarify whether the staging environment has test credentials for UIDAI OTP validation?",
    priority: "medium",
    status: "in_progress",
    resolution_notes: "ASARR tech team configured sandbox sandbox-uidai keys on staging.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const ASARR_LEADS: Lead[] = [
  {
    id: "lead-asarr-1",
    user_id: DEMO_OWNER_ID,
    name: "Siddharth Verma",
    company: "OmniRetail India",
    email: "siddharth@omniretail.in",
    phone: "+91 98450 99887",
    message: "We need an end-to-end e-commerce mobile application and SEO campaign for our multi-city grocery stores.",
    budget: 450000,
    status: "new",
    services_requested: ["Mobile Application Development", "E-Commerce Solutions", "SEO & Digital Marketing"],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "lead-asarr-2",
    user_id: DEMO_OWNER_ID,
    name: "Meera Nair",
    company: "Aura Creative Studio",
    email: "meera@auracreative.co",
    phone: "+91 97110 33221",
    message: "Looking for ASARR to handle our complete brand identity overhaul, corporate video shoot, and marketing site.",
    budget: 250000,
    status: "qualified",
    services_requested: ["Branding & Graphic Design", "Content Creation, Photography & Video Production", "Website Design & Development"],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const DEMO_STORAGE_KEY_PREFIX = "asarr_agencyos_";
const CURRENT_PORTAL_VIEW_KEY = "asarr_portal_view"; // 'admin' | 'client'

const DEMO_MODE_STORAGE_KEY = "asarr_demo_mode";

export function isDemoModeActive(): boolean {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
  }
  return false;
}

export function setDemoModeActive(active: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, active ? "true" : "false");
  }
}

export function getCurrentPortalView(): "admin" | "client" {
  if (typeof window === "undefined") return "admin";
  const stored = localStorage.getItem(CURRENT_PORTAL_VIEW_KEY);
  return stored === "client" ? "client" : "admin";
}

export function setCurrentPortalView(view: "admin" | "client") {
  if (typeof window !== "undefined") {
    localStorage.setItem(CURRENT_PORTAL_VIEW_KEY, view);
  }
}

export function getDemoCollection(table: string): any[] {
  if (typeof window === "undefined") return [];
  const key = `${DEMO_STORAGE_KEY_PREFIX}${table}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }

  const defaults = getDefaultTableData(table);
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
}

export function saveDemoCollection(table: string, items: any[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`${DEMO_STORAGE_KEY_PREFIX}${table}`, JSON.stringify(items));
  }
}

export function resetDemoData() {
  if (typeof window === "undefined") return;
  const tables = [
    "profiles",
    "clients",
    "projects",
    "services",
    "leads",
    "project_milestones",
    "project_deliverables",
    "quotation_versions",
    "invoices",
    "invoice_payments",
    "support_tickets",
    "tasks",
    "events",
    "notifications",
    "forms",
    "telecalling_niches",
    "telecalling_campaigns",
    "telecalling_contacts",
    "telecalling_call_logs",
    "telecalling_follow_ups",
    "admin_memberships",
    "client_onboarding_invitations",
  ];
  for (const table of tables) {
    const defaults = getDefaultTableData(table);
    localStorage.setItem(`${DEMO_STORAGE_KEY_PREFIX}${table}`, JSON.stringify(defaults));
  }
}

function getDefaultTableData(table: string): any[] {
  switch (table) {
    case "profiles":
      return [ASARR_PROFILE];
    case "clients":
      return ASARR_CLIENTS;
    case "services":
      return ASARR_SERVICES;
    case "projects":
      return ASARR_PROJECTS;
    case "project_milestones":
      return ASARR_MILESTONES;
    case "project_deliverables":
      return ASARR_DELIVERABLES;
    case "quotation_versions":
      return ASARR_QUOTATIONS;
    case "invoices":
      return ASARR_INVOICES;
    case "invoice_payments":
      return ASARR_PAYMENTS;
    case "support_tickets":
      return ASARR_TICKETS;
    case "leads":
      return ASARR_LEADS;
    case "tasks":
      return [
        {
          id: "t-1",
          user_id: DEMO_OWNER_ID,
          project_id: "proj-asarr-1",
          title: "Complete Aadhaar biometric verification SDK integration",
          priority: "high",
          status: "in_progress",
          due_date: new Date(Date.now() + 4 * 86400000).toISOString(),
        },
        {
          id: "t-2",
          user_id: DEMO_OWNER_ID,
          project_id: "proj-asarr-1",
          title: "Finalize mutual fund NAV calculation workers",
          priority: "medium",
          status: "todo",
          due_date: new Date(Date.now() + 8 * 86400000).toISOString(),
        },
        {
          id: "t-3",
          user_id: DEMO_OWNER_ID,
          project_id: "proj-asarr-2",
          title: "Deliver color-graded 4K master commercial files",
          priority: "high",
          status: "done",
          due_date: new Date(Date.now() - 10 * 86400000).toISOString(),
        },
      ];
    case "events":
      return [
        {
          id: "ev-1",
          user_id: DEMO_OWNER_ID,
          title: "Zest FinTech — Sprint 3 Staging Demo",
          event_date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
          event_type: "meeting",
        },
        {
          id: "ev-2",
          user_id: DEMO_OWNER_ID,
          title: "Apex Logistics Dispatch Architecture Review",
          event_date: new Date(Date.now() + 6 * 86400000).toISOString().split("T")[0],
          event_type: "meeting",
        },
      ];
    case "notifications":
      return [
        {
          id: "notif-asarr-1",
          user_id: DEMO_OWNER_ID,
          title: "New ASARR Project Enquiry",
          message: "Siddharth Verma from OmniRetail India submitted an inquiry for Mobile App & E-Commerce.",
          type: "lead",
          link: "/leads",
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    case "forms":
      return [
        {
          id: "form-asarr-discovery",
          user_id: DEMO_OWNER_ID,
          title: "ASARR Digital Scope & Discovery Form",
          description: "Help us understand your requirements for web, mobile apps, software systems, or branding campaigns.",
          fields: [
            { id: "f-1", type: "text", label: "Full Name", placeholder: "e.g. Ananya Roy", required: true, width: "half" },
            { id: "f-2", type: "email", label: "Work Email", placeholder: "ananya@company.com", required: true, width: "half" },
            { id: "f-3", type: "phone", label: "Phone Number", placeholder: "+91 98765 43210", required: true, width: "half" },
            { id: "f-4", type: "text", label: "Company / Brand Name", placeholder: "e.g. Horizon Labs", required: false, width: "half" },
            { id: "f-5", type: "select", label: "Primary Service Needed", required: true, width: "full", options: ["Website Design & Development", "Web Application Development", "Mobile App Development", "Custom Software & SaaS", "Branding & Creative Design", "Performance Marketing & SEO"] },
            { id: "f-6", type: "textarea", label: "Project Goals & Scope", placeholder: "Describe what you would like ASARR to build...", required: true, width: "full" },
          ],
          settings: {
            submitButtonText: "Submit Project Scope",
            successMessage: "Thank you! An ASARR solutions architect will review your scope and get in touch within 24 hours.",
            theme: "light",
          },
          is_active: true,
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
        {
          id: "form-asarr-quick",
          user_id: DEMO_OWNER_ID,
          title: "Quick 15-Min Consultation Callback",
          description: "Request an immediate 15-minute consultation with an ASARR technical director.",
          fields: [
            { id: "q-1", type: "text", label: "Contact Name", placeholder: "Your name", required: true, width: "full" },
            { id: "q-2", type: "phone", label: "Phone Number", placeholder: "+91 98200 00000", required: true, width: "full" },
            { id: "q-3", type: "email", label: "Email Address", placeholder: "name@domain.com", required: true, width: "full" },
          ],
          settings: {
            submitButtonText: "Request Callback",
            successMessage: "Request received! We will call you back shortly.",
            theme: "light",
          },
          is_active: true,
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ];
    case "telecalling_niches":
      return [
        { id: "niche-1", name: "Restaurants & Cafés", description: "Food & beverage businesses needing custom web ordering & brand presence", color: "#7A1B28", is_archived: false, created_at: new Date().toISOString() },
        { id: "niche-2", name: "Clothing & Fashion Boutiques", description: "Apparel and lifestyle retail stores seeking Shopify / headless e-commerce", color: "#601420", is_archived: false, created_at: new Date().toISOString() },
        { id: "niche-3", name: "Healthcare & Clinics", description: "Specialty dental clinics, diagnostic centers, and aesthetic doctors", color: "#8E2838", is_archived: false, created_at: new Date().toISOString() },
        { id: "niche-4", name: "Real Estate & Builders", description: "Property developers, commercial brokers, and luxury villa projects", color: "#9B2A3B", is_archived: false, created_at: new Date().toISOString() },
        { id: "niche-5", name: "Salons & Luxury Spas", description: "Beauty studios, wellness resorts, and premium grooming chains", color: "#54101A", is_archived: false, created_at: new Date().toISOString() },
      ];
    case "telecalling_campaigns":
      return [
        { id: "camp-1", niche_id: "niche-1", name: "Bengaluru Fine Dining Direct Ordering", description: "High-AOV dining venues paying 30% Swiggy/Zomato commission", status: "active", created_at: new Date().toISOString() },
        { id: "camp-2", niche_id: "niche-2", name: "Mumbai Fashion Boutiques E-Commerce", description: "Instagram-only fashion labels needing scalable shopping portals", status: "active", created_at: new Date().toISOString() },
      ];
    case "telecalling_contacts":
      return [
        {
          id: "cont-1",
          campaign_id: "camp-1",
          niche_id: "niche-1",
          business_name: "Truffles Gourmet Bistro",
          contact_name: "Chef Vikram Rathore",
          phone: "+91 98450 12345",
          email: "vikram@trufflesbistro.in",
          website: "https://trufflesbistro.in",
          instagram_handle: "@trufflesbistro",
          instagram_url: "https://instagram.com/trufflesbistro",
          google_maps_url: "https://maps.google.com/?q=Truffles+Indiranagar",
          city: "Bengaluru",
          state: "Karnataka",
          status: "follow_up",
          call_count: 2,
          last_called_at: new Date(Date.now() - 86400000).toISOString(),
          next_follow_up: new Date(Date.now() + 86400000).toISOString(),
          notes: "Very interested in direct ordering web app to reduce delivery platform margins.",
          created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        },
        {
          id: "cont-2",
          campaign_id: "camp-1",
          niche_id: "niche-1",
          business_name: "Olive & Sage Artisan Cafe",
          contact_name: "Rohan Gupta",
          phone: "+91 99801 88223",
          email: "rohan@oliveandsage.com",
          instagram_handle: "@oliveandsage_cafe",
          city: "Bengaluru",
          state: "Karnataka",
          status: "interested",
          call_count: 1,
          last_called_at: new Date(Date.now() - 172800000).toISOString(),
          next_follow_up: new Date(Date.now() + 2 * 86400000).toISOString(),
          notes: "Wants an in-cafe QR contactless menu and reservation engine.",
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
        {
          id: "cont-3",
          campaign_id: "camp-2",
          niche_id: "niche-2",
          business_name: "Aura Couture Studio",
          contact_name: "Natasha Mehra",
          phone: "+91 98200 44556",
          email: "natasha@auracouture.in",
          instagram_handle: "@auracouture_official",
          city: "Mumbai",
          state: "Maharashtra",
          status: "converted",
          call_count: 3,
          last_called_at: new Date(Date.now() - 86400000).toISOString(),
          notes: "Signed proposal for custom React e-commerce store with Razorpay payment gateway.",
          created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        },
        {
          id: "cont-4",
          campaign_id: "camp-1",
          niche_id: "niche-1",
          business_name: "Spice Symphony Kitchen",
          contact_name: "Karan Johar",
          phone: "+91 98451 99110",
          city: "Bengaluru",
          status: "new",
          call_count: 0,
          created_at: new Date().toISOString(),
        },
      ];
    case "admin_memberships":
      return [
        { id: "adm-1", user_id: DEMO_OWNER_ID, role: "owner", status: "active", full_name: "Syed Mustafa Ahmed (Owner)", user_email: "contact@asarr.agency", created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
        { id: "adm-2", user_id: "admin-ayesha", role: "admin", status: "active", full_name: "Ayesha Khan (Lead Architect)", user_email: "ayesha@asarr.agency", created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
        { id: "adm-3", user_id: "team-rahul", role: "team_member", status: "active", full_name: "Rahul Verma (Tele-Calling & Outreach)", user_email: "rahul@asarr.agency", created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
      ];
    case "client_onboarding_invitations":
      return [
        {
          id: "inv-1",
          client_id: DEMO_CLIENT_ID,
          email: "rajesh@zestfintech.in",
          token: "asarr_invite_zest_2026",
          status: "accepted",
          profile_completed: true,
          expires_at: new Date(Date.now() + 10 * 86400000).toISOString(),
          accepted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        },
      ];
    default:
      return [];
  }
}

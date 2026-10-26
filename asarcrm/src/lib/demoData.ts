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

export const ASARR_CLIENTS: Client[] = [];
export const ASARR_PROJECTS: Project[] = [];
export const ASARR_MILESTONES: ProjectMilestone[] = [];
export const ASARR_DELIVERABLES: ProjectDeliverable[] = [];
export const ASARR_QUOTATIONS: QuotationVersion[] = [];
export const ASARR_INVOICES: Invoice[] = [];
export const ASARR_PAYMENTS: InvoicePayment[] = [];
export const ASARR_TICKETS: SupportTicket[] = [];
export const ASARR_LEADS: Lead[] = [];

const DEMO_STORAGE_KEY_PREFIX = "asarr_agencyos_";
const CURRENT_PORTAL_VIEW_KEY = "asarr_portal_view"; // 'admin' | 'client'

const DEMO_MODE_STORAGE_KEY = "asarr_demo_mode";

// In production, demo mode is permanently disabled
export function isDemoModeActive(): boolean {
  return false;
}

export function setDemoModeActive(_active: boolean) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
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
    case "services":
      return ASARR_SERVICES;
    default:
      return [];
  }
}

// Purge any legacy demo or cached agency data from localStorage for clean production
if (typeof window !== "undefined") {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("asarr_agencyos_") || k.startsWith("asarr_demo_") || k.startsWith("demo_"))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}


export interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color?: string | null;
  company_description?: string | null;
  company_website?: string | null;
  company_email?: string | null;
  company_phone?: string | null;
  company_address?: string | null;
  portfolio_headline?: string | null;
  portfolio_subheadline?: string | null;
  portfolio_cta_text?: string | null;
  website?: string | null;
  lead_form_config?: any;
  job_title?: string | null;
  department?: string | null;
  mobile_number?: string | null;
  timezone?: string | null;
  role?: string | null;
  legal_business_name?: string | null;
  gstin?: string | null;
  pan?: string | null;
  default_currency?: string | null;
  invoice_prefix?: string | null;
  default_tax_rate?: number | null;
  payment_terms?: string | null;
  bank_name?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  upi_id?: string | null;
  payment_instructions?: string | null;
  representative_name?: string | null;
  representative_title?: string | null;
  representative_email?: string | null;
  representative_phone?: string | null;
  postal_code?: string | null;
  state?: string | null;
  city?: string | null;
  country?: string | null;
  terms_and_conditions?: string | null;
  social_links?: Record<string, string>;
  billing_settings?: Record<string, any>;
  updated_at: string | null;
}

export interface Client {
  id: string;
  user_id?: string;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  tags?: string[];
  notes?: string | null;
  status: "lead" | "onboarding" | "in_progress" | "completed" | "on_hold" | "active";
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  user_id: string;
  name: string;
  description: string;
  price_from: number;
  price_to: number;
  is_active: boolean;
  display_order: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  budget?: number | null;
  status: "new" | "contacted" | "qualified" | "proposal_sent" | "lost" | "converted";
  services_requested?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  user_id: string;
  client_id?: string | null;
  name: string;
  description?: string | null;
  budget?: number;
  progress: number;
  status: "planning" | "in_progress" | "in_review" | "on_hold" | "completed" | "cancelled" | "active";
  is_public: boolean;
  category?: string;
  staging_url?: string | null;
  production_url?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
  clients?: {
    id?: string;
    company?: string;
    name?: string;
    email?: string;
  };
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  order_index: number;
  status: "pending" | "in_progress" | "completed";
  created_at?: string;
}

export interface ProjectDeliverable {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  deliverable_type: "design" | "video" | "software" | "content" | "marketing" | "other";
  file_url?: string | null;
  preview_url?: string | null;
  version: string;
  status: "in_production" | "pending_review" | "approved" | "revision_requested";
  client_feedback?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface QuotationLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface QuotationVersion {
  id: string;
  proposal_id?: string | null;
  client_id: string;
  quote_number: string;
  version_number: number;
  title: string;
  scope_of_work?: string | null;
  line_items: QuotationLineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  payment_terms?: string | null;
  valid_until?: string | null;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  accepted_at?: string | null;
  accepted_by?: string | null;
  rejection_reason?: string | null;
  created_at?: string;
}

export interface SupportTicket {
  id: string;
  client_id: string;
  project_id?: string | null;
  user_id?: string | null;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  resolution_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  user_id?: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  priority: "low" | "medium" | "high";
  due_date?: string | null;
  start_date?: string | null;
  status?: "todo" | "in_progress" | "done";
  completed?: boolean;
  assigned_to?: string | null;
  assigned_name?: string | null;
  is_group_task?: boolean;
  lead_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id?: string | null;
  project_id?: string | null;
  invoice_number: string;
  amount: number;
  tax?: number;
  items?: InvoiceItem[];
  paid_amount?: number;
  currency?: string;
  status: "draft" | "sent" | "paid" | "pending" | "partially_paid" | "overdue";
  issue_date?: string | null;
  due_date?: string | null;
  paid_date?: string | null;
  notes?: string | null;
  pdf_url?: string | null;
  created_at?: string;
  updated_at?: string;
  clients?: {
    id?: string;
    company?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  projects?: {
    id?: string;
    name?: string;
  };
}

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  status: "pending" | "successful" | "failed" | "refunded";
  paid_at: string;
  notes?: string | null;
}

export interface AdminMembership {
  id: string;
  user_id: string;
  role: "owner" | "admin" | "team_member";
  invited_by?: string | null;
  status: "pending" | "active" | "deactivated";
  created_at: string;
  updated_at?: string;
  email?: string;
  user_email?: string;
  full_name?: string;
}

export interface AdminInvitation {
  id: string;
  email: string;
  role: "admin" | "team_member";
  invited_by: string;
  token: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  created_at: string;
}

export interface ClientOnboardingInvitation {
  id: string;
  client_id: string;
  client_name?: string;
  full_name?: string | null;
  phone?: string | null;
  lead_id?: string | null;
  email: string;
  token: string;
  status: "pending" | "sent" | "accepted" | "expired" | "revoked";
  invited_by?: string | null;
  profile_completed?: boolean;
  notes?: string | null;
  expires_at: string;
  accepted_at?: string | null;
  created_at: string;
  client?: Client;
}

// ------------------------------------------------------------------------------
// Expense & Reimbursement Module Types
// ------------------------------------------------------------------------------
export type ExpenseCategory =
  | "software_subscription"
  | "travel_transit"
  | "office_supplies"
  | "meals_entertainment"
  | "contractor_freelance"
  | "hardware_equipment"
  | "advertising_marketing"
  | "telecom_internet"
  | "utilities"
  | "other";

export type PaymentMethod =
  | "corporate_card"
  | "personal_card"
  | "upi"
  | "bank_transfer"
  | "cash"
  | "other";

export type ReimbursementStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "reimbursed";

export interface ExpenseReceipt {
  id: string;
  expense_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  uploaded_by: string;
  created_at: string;
}

export interface Expense {
  id: string;
  voucher_number?: string;
  title: string;
  description?: string | null;
  amount: number;
  currency: string;
  expense_date: string;
  category: ExpenseCategory;
  vendor: string;
  payment_method: PaymentMethod;
  paid_by: string;
  paid_by_name?: string | null;
  created_by: string;
  receipt_url?: string | null;
  client_id?: string | null;
  project_id?: string | null;
  task_id?: string | null;
  notes?: string | null;
  reimbursement_status: ReimbursementStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  reimbursed_at?: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    id?: string;
    company?: string;
    name?: string;
  };
  projects?: {
    id?: string;
    name?: string;
  };
  receipts?: ExpenseReceipt[];
}

export interface TelecallingNiche {
  id: string;
  name: string;
  description?: string | null;
  color?: string;
  display_order?: number;
  is_archived?: boolean;
  is_active?: boolean;
  created_at: string;
}

export interface TelecallingCampaign {
  id: string;
  niche_id: string;
  name: string;
  description?: string | null;
  status: "active" | "paused" | "completed" | "archived" | "draft";
  assigned_admin_id?: string | null;
  target_goal?: number;
  total_contacts?: number;
  assigned_admins?: string[];
  created_at: string;
  niche?: TelecallingNiche;
}

export interface TelecallingContact {
  id: string;
  campaign_id: string;
  niche_id: string;
  business_name: string;
  contact_name?: string | null;
  phone: string;
  alternate_phone?: string | null;
  email?: string | null;
  website?: string | null;
  instagram_handle?: string | null;
  instagram_url?: string | null;
  google_maps_url?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  status: "new" | "assigned" | "contacted" | "follow_up" | "interested" | "not_interested" | "converted" | "do_not_contact" | "archived";
  assigned_admin_id?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  call_count: number;
  last_called_at?: string | null;
  last_outcome?: string | null;
  next_follow_up?: string | null;
  next_follow_up_date?: string | null;
  converted_client_id?: string | null;
  converted_lead_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  campaign?: TelecallingCampaign;
  niche?: TelecallingNiche;
}

export interface TelecallingCallLog {
  id: string;
  contact_id: string;
  admin_id: string;
  outcome: "connected" | "no_answer" | "busy" | "call_back_requested" | "interested" | "not_interested" | "wrong_number" | "converted";
  call_outcome?: string;
  duration_seconds: number;
  notes?: string | null;
  next_follow_up?: string | null;
  called_at?: string;
  created_at: string;
  admin_name?: string;
}

export interface TelecallingFollowUp {
  id: string;
  contact_id: string;
  admin_id: string;
  due_date: string;
  scheduled_date?: string;
  scheduled_time?: string;
  business_name?: string;
  phone?: string;
  admin_name?: string;
  status: "pending" | "completed" | "overdue" | "cancelled";
  notes?: string | null;
  completed_at?: string | null;
  created_at: string;
  contact?: TelecallingContact;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  lead_id?: string | null;
  form_title?: string;
  submitter_name?: string | null;
  submitter_email?: string | null;
  submitter_phone?: string | null;
  submission_data?: Record<string, any>;
  answers?: Record<string, any>;
  data?: Record<string, any>;
  submitted_at?: string;
  created_at: string;
}

export interface UserUiPreferences {
  id: string;
  user_id: string;
  preference_key: string;
  preferences: Record<string, any>;
  updated_at: string;
}

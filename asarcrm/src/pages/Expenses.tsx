import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  Upload,
  User,
  Building2,
  FolderKanban,
  CreditCard,
  Banknote,
  Sparkles,
  Download,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Expense,
  ExpenseCategory,
  PaymentMethod,
  ReimbursementStatus,
  Project,
  Client,
  AdminMembership,
} from "@/types";

const CATEGORY_LABELS: Record<ExpenseCategory, { label: string; color: string }> = {
  software_subscription: { label: "Software & SaaS", color: "bg-primary/10 text-primary border-primary/20" },
  travel_transit: { label: "Travel & Transit", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  office_supplies: { label: "Office Supplies", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  meals_entertainment: { label: "Meals & Hosting", color: "bg-primary/15 text-primary border-primary/30" },
  contractor_freelance: { label: "Contractor / Freelance", color: "bg-secondary text-secondary-foreground border-border" },
  hardware_equipment: { label: "Hardware & Gear", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  advertising_marketing: { label: "Ads & Marketing", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  telecom_internet: { label: "Telecom & Internet", color: "bg-primary/10 text-primary border-primary/20" },
  utilities: { label: "Utilities", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  other: { label: "Other Business", color: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20" },
};

const STATUS_CONFIG: Record<ReimbursementStatus, { label: string; badge: string; icon: any }> = {
  draft: { label: "Draft", badge: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", icon: Clock },
  submitted: { label: "Submitted", badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40", icon: AlertCircle },
  under_review: { label: "Under Review", badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", icon: Clock },
  approved: { label: "Approved", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300", icon: CheckCircle2 },
  rejected: { label: "Rejected", badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300", icon: X },
  reimbursed: { label: "Reimbursed", badge: "bg-primary/10 text-primary border border-primary/20", icon: Banknote },
};

export default function Expenses() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAdminOrOwner = role === "owner" || role === "admin";

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [memberFilter, setMemberFilter] = useState<string>("all");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedExpenseForReview, setSelectedExpenseForReview] = useState<Expense | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState<number | "">("");
  const [formCurrency, setFormCurrency] = useState("INR");
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formCategory, setFormCategory] = useState<ExpenseCategory>("software_subscription");
  const [formVendor, setFormVendor] = useState("");
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>("corporate_card");
  const [formPaidBy, setFormPaidBy] = useState(user?.id || "");
  const [formClientId, setFormClientId] = useState<string>("");
  const [formProjectId, setFormProjectId] = useState<string>("");
  const [formDescription, setFormDescription] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formReceiptUrl, setFormReceiptUrl] = useState("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // 1. Fetch Expenses
  const { data: expenses = [], isLoading: isExpensesLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("expenses")
          .select("*, clients(id, company, name), projects(id, name)")
          .order("expense_date", { ascending: false });

        if (error) {
          console.warn("Could not query expenses table:", error.message);
          return [];
        }
        return data as Expense[];
      } catch (err) {
        console.warn("Expenses query exception:", err);
        return [];
      }
    },
  });

  // 2. Fetch Team Members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team_members_expenses"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("admin_memberships")
          .select("user_id, role, status")
          .eq("status", "active");

        if (error) return [];
        return data as AdminMembership[];
      } catch {
        return [];
      }
    },
  });

  // 3. Fetch Projects & Clients for linking
  const { data: projects = [] } = useQuery({
    queryKey: ["projects_dropdown"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id, name, client_id").order("name");
      return (data || []) as Project[];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients_dropdown"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("id, company, name").order("name");
      return (data || []) as Client[];
    },
  });

  // Handle Receipt File Upload
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("Receipt file must be under 25MB.");
      return;
    }

    setUploadingReceipt(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `receipts/${user?.id || "team"}-${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage.from("expense-receipts").upload(path, file, {
        upsert: true,
      });

      if (error) {
        // Fallback to brand-assets if private bucket is being provisioned
        const { data: fbData, error: fbError } = await supabase.storage
          .from("brand-assets")
          .upload(path, file, { upsert: true });

        if (fbError) throw fbError;
        const { data: pubData } = supabase.storage.from("brand-assets").getPublicUrl(fbData.path);
        setFormReceiptUrl(pubData.publicUrl);
      } else {
        const { data: signedData } = await supabase.storage
          .from("expense-receipts")
          .createSignedUrl(data.path, 60 * 60 * 24 * 365); // 1 year signed access
        setFormReceiptUrl(signedData?.signedUrl || data.path);
      }

      toast.success("Receipt uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload receipt.");
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Create Expense Mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (submitForReview: boolean = false) => {
      if (!formTitle.trim()) throw new Error("Expense title is required.");
      if (!formAmount || Number(formAmount) <= 0) throw new Error("A valid expense amount is required.");
      if (!formVendor.trim()) throw new Error("Vendor or merchant name is required.");

      const targetPaidBy = isAdminOrOwner && formPaidBy ? formPaidBy : user?.id;
      const finalPaidBy = targetPaidBy || user?.id || profile?.id;
      if (!finalPaidBy) throw new Error("Payer identity required. Please log in.");

      const payload = {
        title: formTitle.trim(),
        amount: Number(formAmount),
        currency: formCurrency,
        expense_date: formDate,
        category: formCategory,
        vendor: formVendor.trim(),
        payment_method: formPaymentMethod,
        paid_by: finalPaidBy,
        created_by: user?.id || finalPaidBy,
        client_id: formClientId && formClientId !== "none" ? formClientId : null,
        project_id: formProjectId && formProjectId !== "none" ? formProjectId : null,
        description: formDescription.trim() || null,
        notes: formNotes.trim() || null,
        receipt_url: formReceiptUrl || null,
        reimbursement_status: submitForReview ? "submitted" : "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from("expenses").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, submitForReview) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(
        submitForReview
          ? "Expense submitted for reimbursement review!"
          : "Expense saved as draft!"
      );
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create expense.");
    },
  });

  // Review Status Mutation (Admins only)
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      expenseId,
      status,
      reason,
    }: {
      expenseId: string;
      status: ReimbursementStatus;
      reason?: string;
    }) => {
      const now = new Date().toISOString();
      const updates: Record<string, any> = {
        reimbursement_status: status,
        reviewed_by: user?.id,
        reviewed_at: now,
        updated_at: now,
      };

      if (status === "rejected") {
        updates.rejection_reason = reason || "Rejected by administrator";
      } else if (status === "reimbursed") {
        updates.reimbursed_at = now;
      }

      const { error } = await supabase.from("expenses").update(updates).eq("id", expenseId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(`Expense marked as ${vars.status.replace("_", " ")}!`);
      setIsReviewModalOpen(false);
      setSelectedExpenseForReview(null);
      setRejectionReason("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update expense status.");
    },
  });

  // Delete Draft Expense Mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete expense.");
    },
  });

  const resetForm = () => {
    setFormTitle("");
    setFormAmount("");
    setFormCurrency("INR");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormCategory("software_subscription");
    setFormVendor("");
    setFormPaymentMethod("corporate_card");
    setFormPaidBy(user?.id || "");
    setFormClientId("");
    setFormProjectId("");
    setFormDescription("");
    setFormNotes("");
    setFormReceiptUrl("");
  };

  // Calculated Metrics
  const metrics = useMemo(() => {
    let totalAll = 0;
    let pendingReimbursement = 0;
    let approvedTotal = 0;
    let reimbursedTotal = 0;

    expenses.forEach((e) => {
      const amt = Number(e.amount) || 0;
      totalAll += amt;
      if (e.reimbursement_status === "submitted" || e.reimbursement_status === "under_review") {
        pendingReimbursement += amt;
      } else if (e.reimbursement_status === "approved") {
        approvedTotal += amt;
      } else if (e.reimbursement_status === "reimbursed") {
        reimbursedTotal += amt;
      }
    });

    return { totalAll, pendingReimbursement, approvedTotal, reimbursedTotal };
  }, [expenses]);

  // Filtered List
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.vendor.toLowerCase().includes(q) ||
        (e.voucher_number && e.voucher_number.toLowerCase().includes(q));

      const matchesCat = categoryFilter === "all" || e.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || e.reimbursement_status === statusFilter;
      const matchesMember = memberFilter === "all" || e.paid_by === memberFilter;

      return matchesSearch && matchesCat && matchesStatus && matchesMember;
    });
  }, [expenses, searchQuery, categoryFilter, statusFilter, memberFilter]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Expense Management & Reimbursements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track business expenditures, attach receipts, manage reimbursement approvals, and generate printable expense vouchers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddModalOpen(true)} className="min-w-[140px]">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Expenses</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">
              ₹{metrics.totalAll.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {expenses.length} tracked items
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Pending Review</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-2">
              ₹{metrics.pendingReimbursement.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Submitted for approval
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Approved for Pay</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-2">
              ₹{metrics.approvedTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Ready for disbursement
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Reimbursed Paid</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              ₹{metrics.reimbursedTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Settled reimbursements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-card border-border/80">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses by title, merchant, or voucher number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px] text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, item]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, item]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchQuery || categoryFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
                }}
                className="text-xs text-muted-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Listing Table / Responsive Cards */}
      <Card className="border-border/80 bg-card overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Voucher #</th>
                <th className="px-4 py-3">Expense & Merchant</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Expense Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <Receipt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="font-medium text-sm">No expense records found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Click "Add Expense" to record business expenditures or adjust your search filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => {
                  const statusConf = STATUS_CONFIG[expense.reimbursement_status] || STATUS_CONFIG.draft;
                  const catConf = CATEGORY_LABELS[expense.category] || CATEGORY_LABELS.other;
                  const isOwnerOfExpense = expense.paid_by === user?.id || expense.created_by === user?.id;

                  return (
                    <tr key={expense.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary font-medium whitespace-nowrap">
                        {expense.voucher_number || "EXP-PENDING"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground text-xs sm:text-sm">
                          {expense.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{expense.vendor}</span>
                          {expense.projects?.name && (
                            <span className="text-[11px] text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                              {expense.projects.name}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium", catConf.color)}>
                          {catConf.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap text-sm">
                        ₹{Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {format(parseISO(expense.expense_date), "dd MMM yyyy")}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1", statusConf.badge)}>
                          <statusConf.icon className="w-3 h-3" />
                          {statusConf.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {expense.receipt_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-primary hover:bg-primary/10"
                            onClick={() => window.open(expense.receipt_url!, "_blank")}
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            View
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Printable Voucher Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-border"
                            title="Print Expense Voucher"
                            onClick={() => navigate(`/expenses/${expense.id}/print`)}
                          >
                            <Printer className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                            Voucher
                          </Button>

                          {/* Submit Draft Button */}
                          {expense.reimbursement_status === "draft" && isOwnerOfExpense && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 text-xs"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  expenseId: expense.id,
                                  status: "submitted",
                                })
                              }
                            >
                              Submit
                            </Button>
                          )}

                          {/* Admin Review Action */}
                          {isAdminOrOwner && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-primary hover:bg-primary/10"
                              onClick={() => {
                                setSelectedExpenseForReview(expense);
                                setIsReviewModalOpen(true);
                              }}
                            >
                              Review
                            </Button>
                          )}

                          {/* Delete Draft Button */}
                          {expense.reimbursement_status === "draft" && (isOwnerOfExpense || isAdminOrOwner) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-rose-600 hover:bg-rose-50"
                              onClick={() => {
                                if (confirm(`Delete draft expense "${expense.title}"?`)) {
                                  deleteExpenseMutation.mutate(expense.id);
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Zero-Swipe Cards View */}
        <div className="block md:hidden divide-y divide-border/60">
          {filteredExpenses.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground">
              <Receipt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="font-medium text-sm">No expense records found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click "Add Expense" to record business expenditures.
              </p>
            </div>
          ) : (
            filteredExpenses.map((expense) => {
              const statusConf = STATUS_CONFIG[expense.reimbursement_status] || STATUS_CONFIG.draft;
              const catConf = CATEGORY_LABELS[expense.category] || CATEGORY_LABELS.other;
              const isOwnerOfExpense = expense.paid_by === user?.id || expense.created_by === user?.id;

              return (
                <div key={expense.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary font-semibold">
                          {expense.voucher_number || "EXP-PENDING"}
                        </span>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", catConf.color)}>
                          {catConf.label}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-foreground">{expense.title}</h4>
                      <p className="text-xs text-muted-foreground">{expense.vendor}</p>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-base text-foreground">
                        ₹{Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 mt-1", statusConf.badge)}>
                        <statusConf.icon className="w-3 h-3" />
                        {statusConf.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span>Date: {format(parseISO(expense.expense_date), "dd MMM yyyy")}</span>
                    {expense.receipt_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
                        onClick={() => window.open(expense.receipt_url!, "_blank")}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Receipt
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs flex-1 border-border"
                      onClick={() => navigate(`/expenses/${expense.id}/print`)}
                    >
                      <Printer className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                      Voucher
                    </Button>

                    {expense.reimbursement_status === "draft" && isOwnerOfExpense && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs flex-1"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            expenseId: expense.id,
                            status: "submitted",
                          })
                        }
                      >
                        Submit
                      </Button>
                    )}

                    {isAdminOrOwner && (
                      <Button
                        size="sm"
                        className="h-8 text-xs flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => {
                          setSelectedExpenseForReview(expense);
                          setIsReviewModalOpen(true);
                        }}
                      >
                        Review
                      </Button>
                    )}

                    {expense.reimbursement_status === "draft" && (isOwnerOfExpense || isAdminOrOwner) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50"
                        onClick={() => {
                          if (confirm(`Delete draft expense "${expense.title}"?`)) {
                            deleteExpenseMutation.mutate(expense.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* CREATE EXPENSE MODAL */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Record New Team Expense
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add corporate expenditure details, attach proof of purchase, and request reimbursement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Expense Title *</Label>
                <Input
                  placeholder="e.g. AWS Cloud Hosting Subscription"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Vendor / Merchant *</Label>
                <Input
                  placeholder="e.g. Amazon Web Services Inc."
                  value={formVendor}
                  onChange={(e) => setFormVendor(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Amount (₹) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="4500.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="text-xs font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Expense Date *</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category *</Label>
                <Select value={formCategory} onValueChange={(val) => setFormCategory(val as ExpenseCategory)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, item]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Payment Method *</Label>
                <Select value={formPaymentMethod} onValueChange={(val) => setFormPaymentMethod(val as PaymentMethod)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate_card">Corporate Credit Card</SelectItem>
                    <SelectItem value="personal_card">Personal Card (Reimbursable)</SelectItem>
                    <SelectItem value="upi">UPI / Instant Transfer</SelectItem>
                    <SelectItem value="bank_transfer">Net Banking / NEFT</SelectItem>
                    <SelectItem value="cash">Petty Cash</SelectItem>
                    <SelectItem value="other">Other Method</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Related Project (Optional)</Label>
                <Select value={formProjectId || "none"} onValueChange={(val) => setFormProjectId(val === "none" ? "" : val)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select linked project..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project Linked</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Business Purpose / Description</Label>
              <Textarea
                placeholder="Describe the business rationale for this expenditure..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="text-xs min-h-[60px]"
              />
            </div>

            {/* Receipt Upload Box */}
            <div className="space-y-1.5 p-3 rounded-xl border border-dashed border-border bg-muted/20">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Receipt or Invoice Attachment</span>
                <span className="text-[11px] text-muted-foreground font-normal">PDF, PNG, JPG (Max 25MB)</span>
              </Label>
              <div className="flex items-center gap-3 pt-1">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleReceiptUpload}
                    disabled={uploadingReceipt}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs pointer-events-none"
                    disabled={uploadingReceipt}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    {uploadingReceipt ? "Uploading Receipt..." : "Upload Receipt"}
                  </Button>
                </label>
                {formReceiptUrl && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Receipt Attached
                  </span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={createExpenseMutation.isPending}
              onClick={() => createExpenseMutation.mutate(false)}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={createExpenseMutation.isPending}
              onClick={() => createExpenseMutation.mutate(true)}
            >
              {createExpenseMutation.isPending ? "Submitting..." : "Submit for Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REVIEW & APPROVE MODAL (ADMIN ONLY) */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              Review Expense & Reimbursement
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Verify expenditure documentation and update reimbursement disbursement status.
            </DialogDescription>
          </DialogHeader>

          {selectedExpenseForReview && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-2">
                <div className="flex justify-between font-semibold text-sm text-foreground">
                  <span>{selectedExpenseForReview.title}</span>
                  <span>₹{Number(selectedExpenseForReview.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Vendor: {selectedExpenseForReview.vendor}</span>
                  <span>{format(parseISO(selectedExpenseForReview.expense_date), "dd MMM yyyy")}</span>
                </div>
                {selectedExpenseForReview.receipt_url && (
                  <div className="pt-1">
                    <a
                      href={selectedExpenseForReview.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> View Submitted Receipt &rarr;
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Adjustment or Rejection Reason (If rejecting)</Label>
                <Input
                  placeholder="e.g. Receipt unreadable or unauthorized personal item"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() =>
                    updateStatusMutation.mutate({
                      expenseId: selectedExpenseForReview.id,
                      status: "rejected",
                      reason: rejectionReason,
                    })
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Reject Expense
                </Button>

                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() =>
                    updateStatusMutation.mutate({
                      expenseId: selectedExpenseForReview.id,
                      status: "approved",
                    })
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Approve Reimbursement
                </Button>
              </div>

              {selectedExpenseForReview.reimbursement_status === "approved" && (
                <div className="pt-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-purple-700 bg-purple-100 hover:bg-purple-200"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        expenseId: selectedExpenseForReview.id,
                        status: "reimbursed",
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <Banknote className="w-3.5 h-3.5 mr-1.5" />
                    Mark Disbursed & Reimbursed
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

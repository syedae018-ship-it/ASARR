import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Receipt, CheckCircle2, Building2, Calendar, User, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Expense, Profile } from "@/types";

export default function ExpensePrint() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. Fetch Expense Record
  const { data: expense, isLoading: isExpenseLoading } = useQuery({
    queryKey: ["expense_print", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("expenses")
        .select("*, clients(id, company, name), projects(id, name)")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.warn("Could not fetch expense:", error.message);
        return null;
      }
      return data as Expense;
    },
    enabled: Boolean(id),
  });

  // 2. Fetch Agency Profile for Formal Header Details
  const { data: agencyProfile } = useQuery({
    queryKey: ["agency_profile_for_print"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").limit(1).maybeSingle();
      return (data || null) as Profile | null;
    },
  });

  const handlePrint = () => {
    window.print();
  };

  if (isExpenseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-muted-foreground animate-pulse text-sm">Loading expense voucher...</div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 space-y-4">
        <p className="text-muted-foreground">Expense voucher record not found.</p>
        <Button variant="outline" onClick={() => navigate("/expenses")}>
          &larr; Back to Expenses
        </Button>
      </div>
    );
  }

  const agencyName = agencyProfile?.company_name || "ASARR Digital Agency";
  const legalName = agencyProfile?.legal_business_name || agencyName;
  const gstin = agencyProfile?.gstin;
  const address = agencyProfile?.company_address || "Bangalore, Karnataka, India";
  const phone = agencyProfile?.company_phone || agencyProfile?.mobile_number;
  const email = agencyProfile?.company_email || "contact@asarr.agency";

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 py-8 px-4 sm:px-6">
      {/* Top Action Bar (Hidden during window.print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate("/expenses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Expenses
        </Button>
        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} className="bg-primary text-primary-foreground">
            <Printer className="w-4 h-4 mr-2" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* A4 Printable Document Container */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full text-zinc-900 dark:text-zinc-100">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-zinc-200 dark:border-zinc-800 pb-8 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {agencyProfile?.logo_url ? (
                <img src={agencyProfile.logo_url} alt="Logo" className="w-10 h-10 object-contain rounded" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">
                  A
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{agencyName}</h1>
                <p className="text-xs text-zinc-500">{legalName}</p>
              </div>
            </div>
            <div className="text-xs text-zinc-500 space-y-0.5 pt-1">
              <p>{address}</p>
              {gstin && <p>GSTIN: <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">{gstin}</span></p>}
              <p>{email} {phone ? `• ${phone}` : ""}</p>
            </div>
          </div>

          <div className="sm:text-right space-y-1.5">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              Official Expense Voucher
            </span>
            <p className="text-xl font-mono font-bold text-primary">
              {expense.voucher_number || "EXP-VOUCHER"}
            </p>
            <p className="text-xs text-zinc-500">
              Voucher Date: <strong className="text-zinc-800 dark:text-zinc-200">{format(parseISO(expense.expense_date), "dd MMMM yyyy")}</strong>
            </p>
            <p className="text-xs text-zinc-500">
              Status: <span className="font-semibold capitalize">{expense.reimbursement_status.replace("_", " ")}</span>
            </p>
          </div>
        </div>

        {/* Voucher Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-zinc-200 dark:border-zinc-800 text-xs">
          <div>
            <span className="text-zinc-400 uppercase font-semibold text-[10px] block">Vendor / Merchant</span>
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5 block">
              {expense.vendor}
            </span>
          </div>

          <div>
            <span className="text-zinc-400 uppercase font-semibold text-[10px] block">Payment Method</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5 block capitalize">
              {expense.payment_method.replace("_", " ")}
            </span>
          </div>

          <div>
            <span className="text-zinc-400 uppercase font-semibold text-[10px] block">Category</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5 block capitalize">
              {expense.category.replace("_", " ")}
            </span>
          </div>

          <div>
            <span className="text-zinc-400 uppercase font-semibold text-[10px] block">Linked Project</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5 block">
              {expense.projects?.name || "General Agency Operations"}
            </span>
          </div>
        </div>

        {/* Expense Breakdown Table */}
        <div className="py-6 border-b border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-semibold text-zinc-400">
                <th className="py-2.5">Expenditure Description</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <tr>
                <td className="py-4">
                  <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{expense.title}</p>
                  {expense.description && (
                    <p className="text-zinc-500 mt-1 leading-relaxed text-xs">{expense.description}</p>
                  )}
                  {expense.clients?.company && (
                    <p className="text-[11px] text-zinc-400 mt-1">Client: {expense.clients.company}</p>
                  )}
                </td>
                <td className="py-4 capitalize text-zinc-600 dark:text-zinc-400">
                  {expense.category.replace("_", " ")}
                </td>
                <td className="py-4 text-right font-mono font-bold text-base text-zinc-900 dark:text-zinc-100">
                  ₹{Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-zinc-900 dark:border-zinc-100 font-bold text-sm">
                <td colSpan={2} className="py-3 uppercase tracking-wider text-xs">Total Voucher Amount</td>
                <td className="py-3 text-right font-mono text-lg text-primary">
                  ₹{Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Approval & Audit Sign-Off Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-zinc-200 dark:border-zinc-800 text-xs">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2 border border-zinc-200/60 dark:border-zinc-800">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-500 block">
              1. Claimant & Payment Record
            </span>
            <p>
              Paid By User ID: <span className="font-mono text-zinc-700 dark:text-zinc-300">{expense.paid_by}</span>
            </p>
            <p>
              Submission Date: <strong className="text-zinc-800 dark:text-zinc-200">{format(parseISO(expense.created_at), "dd MMM yyyy, hh:mm a")}</strong>
            </p>
            {expense.notes && (
              <p className="text-zinc-500 pt-1">
                Notes: <span className="italic">{expense.notes}</span>
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2 border border-zinc-200/60 dark:border-zinc-800">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-500 block">
              2. Reviewer & Audit Trail
            </span>
            <p>
              Reimbursement Decision: <strong className="capitalize text-zinc-900 dark:text-zinc-100">{expense.reimbursement_status.replace("_", " ")}</strong>
            </p>
            {expense.reviewed_at && (
              <p>
                Reviewed At: <span className="text-zinc-700 dark:text-zinc-300">{format(parseISO(expense.reviewed_at), "dd MMM yyyy, hh:mm a")}</span>
              </p>
            )}
            {expense.reimbursed_at && (
              <p className="text-emerald-600 font-medium">
                Disbursed At: {format(parseISO(expense.reimbursed_at), "dd MMM yyyy, hh:mm a")}
              </p>
            )}
            {expense.rejection_reason && (
              <p className="text-rose-600">
                Adjustment Note: {expense.rejection_reason}
              </p>
            )}
          </div>
        </div>

        {/* Attached Proof of Purchase */}
        {expense.receipt_url && (
          <div className="pt-6 text-xs">
            <h3 className="font-semibold uppercase tracking-wider text-[11px] text-zinc-500 mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              Attached Proof of Purchase / Receipt
            </h3>
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50 dark:bg-zinc-800/40">
              {expense.receipt_url.match(/\.(jpeg|jpg|png|webp|avif)/i) ? (
                <div className="max-w-md mx-auto">
                  <img
                    src={expense.receipt_url}
                    alt="Receipt"
                    className="w-full h-auto rounded-lg shadow-sm border border-zinc-200"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="font-medium">Digital Receipt Document</span>
                  </div>
                  <a
                    href={expense.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold print:hidden"
                  >
                    Open Document Link &rarr;
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Notice */}
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-[10px] text-zinc-400">
          <p>This is an internal agency expense voucher generated by {agencyName} AgencyOS.</p>
          <p className="mt-0.5">Verified electronic document. Retain for agency accounting and financial audits.</p>
        </div>
      </div>
    </div>
  );
}

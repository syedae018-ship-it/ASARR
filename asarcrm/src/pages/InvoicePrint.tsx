import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, ArrowLeft, Download, ShieldCheck, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { db, doc, getDoc } from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";

export default function InvoicePrint() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [agencyProfile, setAgencyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoiceData() {
      if (!id) return;

      try {
        // Fetch agency profile for dynamic billing, GSTIN, and bank details
        const { data: prof } = await supabase.from("profiles").select("*").limit(1).maybeSingle();
        if (prof) setAgencyProfile(prof);

        const invSnap = await getDoc(doc(db, "invoices", id));
        if (invSnap.exists()) {
          const invData = invSnap.data();
          setInvoice({ id: invSnap.id, ...invData });

          if (invData.client_id) {
            const clientSnap = await getDoc(doc(db, "clients", invData.client_id));
            if (clientSnap.exists()) {
              setClient(clientSnap.data());
            }
          }

          if (invData.project_id) {
            const projectSnap = await getDoc(doc(db, "projects", invData.project_id));
            if (projectSnap.exists()) {
              setProject(projectSnap.data());
            }
          }
        }
      } catch (err) {
        console.error("Error loading invoice:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInvoiceData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Preparing print layout...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium text-foreground">Invoice not found</p>
          <Button onClick={() => navigate("/invoices")}>Back to Invoices</Button>
        </div>
      </div>
    );
  }

  const amount = Number(invoice.amount) || 0;
  const isPaid = invoice.status === "paid";
  const tax = Math.round(amount * 0.18);
  const total = amount + tax;
  const amountPaid = isPaid ? total : 0;
  const balanceDue = total - amountPaid;

  // Preserve historical billing details snapshot from invoice if already issued/paid, otherwise fallback to current agency settings
  const agency = invoice.billing_snapshot || {
    company_name: agencyProfile?.company_name || "ASARR",
    company_description: agencyProfile?.company_description || "Digital Agency & Engineering",
    legal_business_name: agencyProfile?.legal_business_name || agencyProfile?.company_name || "ASARR Technologies Private Limited",
    company_address: agencyProfile?.company_address || [agencyProfile?.city, agencyProfile?.state, agencyProfile?.country].filter(Boolean).join(", ") || "Indiranagar, 100 Feet Road, Bengaluru, KA 560038",
    gstin: agencyProfile?.gstin || "29AABCU9603R1ZM",
    company_email: agencyProfile?.company_email || "contact@asarr.com",
    company_phone: agencyProfile?.company_phone || "+91 98765 43210",
    bank_name: agencyProfile?.bank_name || "HDFC Bank Ltd",
    account_name: agencyProfile?.account_name || agencyProfile?.legal_business_name || "ASARR Technologies Pvt Ltd",
    account_number: agencyProfile?.account_number || "50200088921445",
    ifsc_code: agencyProfile?.ifsc_code || "HDFC0001755",
    upi_id: agencyProfile?.upi_id || "asarr@hdfcbank",
    payment_instructions: agencyProfile?.payment_instructions || null,
    logo_url: agencyProfile?.logo_url || null,
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 print:p-0 print:bg-white text-foreground">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Action Toolbar (Hidden during Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/invoices")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* A4 Printable Document Container */}
      <div className="print-container max-w-4xl mx-auto bg-card print:bg-white rounded-xl shadow-lg border border-border/60 print:border-none print:shadow-none p-8 md:p-12 print:p-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-border/80 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-3">
              {agency.logo_url ? (
                <img
                  src={agency.logo_url}
                  alt={agency.company_name}
                  className="w-10 h-10 rounded-xl object-contain border p-1"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg">
                  {agency.company_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  {agency.company_name}
                </h1>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  {agency.company_description}
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              <p>{agency.legal_business_name}</p>
              <p>{agency.company_address}</p>
              <p>
                GSTIN: {agency.gstin} | {agency.company_email}
              </p>
              <p>Phone: {agency.company_phone}</p>
            </div>
          </div>

          <div className="text-left md:text-right space-y-1.5">
            <h2 className="text-3xl font-extrabold uppercase tracking-tight text-foreground">
              TAX INVOICE
            </h2>
            <p className="text-sm font-mono font-semibold text-primary">
              #{invoice.invoice_number}
            </p>
            <div className="pt-2">
              <Badge
                className={isPaid ? "bg-emerald-100 text-emerald-800 border-0" : "bg-amber-100 text-amber-800 border-0"}
              >
                {invoice.status?.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Invoice Meta & Billed To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-border/80 text-xs">
          <div>
            <span className="font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Billed To:
            </span>
            <div className="space-y-1 text-foreground">
              <p className="text-base font-bold">{client?.company || client?.name || "Client Business"}</p>
              <p className="text-muted-foreground">Attn: {client?.name || "Accounts Dept"}</p>
              {client?.email && <p className="text-muted-foreground">{client.email}</p>}
              {client?.phone && <p className="text-muted-foreground">{client.phone}</p>}
              <p className="text-muted-foreground">{client?.address || "Bengaluru, Karnataka, India"}</p>
            </div>
          </div>

          <div className="md:text-right space-y-2">
            <div className="flex justify-between md:justify-end gap-6">
              <span className="text-muted-foreground">Invoice Date:</span>
              <span className="font-medium text-foreground">
                {invoice.created_at ? format(new Date(invoice.created_at), "dd MMMM yyyy") : format(new Date(), "dd MMMM yyyy")}
              </span>
            </div>
            <div className="flex justify-between md:justify-end gap-6">
              <span className="text-muted-foreground">Due Date:</span>
              <span className="font-medium text-foreground">
                {invoice.due_date ? format(new Date(invoice.due_date), "dd MMMM yyyy") : "Due on receipt"}
              </span>
            </div>
            {project?.name && (
              <div className="flex justify-between md:justify-end gap-6">
                <span className="text-muted-foreground">Linked Project:</span>
                <span className="font-semibold text-primary">{project.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="py-3 px-4 font-semibold text-muted-foreground uppercase">Item Description</th>
                <th className="py-3 px-4 font-semibold text-muted-foreground uppercase text-center">Qty</th>
                <th className="py-3 px-4 font-semibold text-muted-foreground uppercase text-right">Rate</th>
                <th className="py-3 px-4 font-semibold text-muted-foreground uppercase text-right">Tax (18%)</th>
                <th className="py-3 px-4 font-semibold text-muted-foreground uppercase text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-4 px-4">
                  <p className="font-bold text-foreground text-sm">
                    {project?.name ? `${project.name} — Agency Engineering & Digital Services` : "Digital Agency & Development Services"}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    Includes design system, frontend development, database integrations, responsive QA, and deployment.
                  </p>
                </td>
                <td className="py-4 px-4 text-center">1</td>
                <td className="py-4 px-4 text-right font-mono">₹{amount.toLocaleString("en-IN")}</td>
                <td className="py-4 px-4 text-right font-mono">₹{tax.toLocaleString("en-IN")}</td>
                <td className="py-4 px-4 text-right font-mono font-bold text-foreground">
                  ₹{total.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="border-t border-border pt-4 pb-8 flex flex-col md:flex-row justify-between gap-6 text-xs">
          <div className="max-w-xs space-y-2">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground block">
              Payment Instructions
            </span>
            <div className="p-3 bg-muted/40 rounded-lg text-muted-foreground text-[11px] space-y-1">
              <p><strong>Bank:</strong> {agency.bank_name}</p>
              <p><strong>Account Name:</strong> {agency.account_name}</p>
              <p><strong>Account No:</strong> {agency.account_number}</p>
              <p><strong>IFSC:</strong> {agency.ifsc_code}</p>
              {agency.upi_id && <p><strong>UPI ID:</strong> {agency.upi_id}</p>}
              {agency.payment_instructions && (
                <p className="mt-1 pt-1 border-t border-border/50 text-[10px] text-foreground font-medium">
                  {agency.payment_instructions}
                </p>
              )}
            </div>
          </div>

          <div className="w-full md:w-72 space-y-2 self-end">
            <div className="flex justify-between py-1 text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono text-foreground">₹{amount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-1 text-muted-foreground">
              <span>GST (18%):</span>
              <span className="font-mono text-foreground">₹{tax.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-border text-sm font-bold text-foreground">
              <span>Total Payable:</span>
              <span className="font-mono text-primary">₹{total.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-1 text-xs text-muted-foreground">
              <span>Amount Paid:</span>
              <span className="font-mono text-emerald-600">₹{amountPaid.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-dashed border-border text-sm font-bold text-foreground">
              <span>Balance Due:</span>
              <span className="font-mono text-foreground">₹{balanceDue.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-border pt-6 text-[11px] text-muted-foreground text-center space-y-1">
          <p>Thank you for partnering with ASARR. For any inquiries, reach us at billing@asarr.com.</p>
          <p className="italic">This is a computer-generated tax invoice and requires no physical signature.</p>
        </div>
      </div>
    </div>
  );
}

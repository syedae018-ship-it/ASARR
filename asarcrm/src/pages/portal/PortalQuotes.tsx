import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, doc, updateDoc } from "@/lib/database";
import { QuotationVersion } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Printer, Calendar, ShieldCheck, FileText } from "lucide-react";

export default function PortalQuotes() {
  const { clientId, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedQuote, setSelectedQuote] = useState<QuotationVersion | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: quotations = [] } = useQuery<QuotationVersion[]>({
    queryKey: ["portal-quotations", clientId],
    queryFn: async () => {
      const q = query(collection(db, "quotation_versions"), where("client_id", "==", clientId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as QuotationVersion[];
    },
    enabled: !!clientId,
  });

  const acceptMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const payload = {
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_by: user?.user_metadata?.full_name || "Authorized Client",
      };
      await updateDoc(doc(db, "quotation_versions", quoteId), payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-quotations"] });
      queryClient.invalidateQueries({ queryKey: ["portal-quotes"] });
      toast.success("Quotation accepted successfully! ASARR team notified.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ quoteId, reason }: { quoteId: string; reason: string }) => {
      const payload = {
        status: "rejected",
        rejection_reason: reason,
      };
      await updateDoc(doc(db, "quotation_versions", quoteId), payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-quotations"] });
      queryClient.invalidateQueries({ queryKey: ["portal-quotes"] });
      setRejectDialogOpen(false);
      setRejectionReason("");
      toast.info("Change request / rejection recorded.");
    },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quotations & Commercial Proposals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review scope of work, deliverable milestones, and commercial terms issued by ASARR Digital Agency.
        </p>
      </div>

      <div className="space-y-6">
        {quotations.map((quote) => {
          const isPending = quote.status === "sent";

          return (
            <Card key={quote.id} className="border-border/80 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-border/60 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800">
                        {quote.quote_number} (v{quote.version_number})
                      </span>
                      <Badge
                        variant={
                          quote.status === "accepted"
                            ? "default"
                            : quote.status === "sent"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          quote.status === "accepted"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : ""
                        }
                      >
                        {quote.status.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{quote.title}</CardTitle>
                    <CardDescription className="text-xs mt-1 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" /> Valid Until: {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : "30 days"}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print / PDF
                    </Button>

                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedQuote(quote);
                            setRejectDialogOpen(true);
                          }}
                          className="text-xs h-8 text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Request Changes
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => acceptMutation.mutate(quote.id)}
                          className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept Quotation
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Scope of Work */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Scope of Work & Deliverables
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/40">
                    {quote.scope_of_work}
                  </p>
                </div>

                {/* Line Items Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Commercial Breakdown
                  </h4>
                  <div className="border border-border/70 rounded-lg overflow-hidden">
                    <table className="w-full text-xs sm:text-sm text-left">
                      <thead className="bg-muted/40 border-b border-border text-muted-foreground text-xs uppercase font-semibold">
                        <tr>
                          <th className="p-3">Description</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Unit Price</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {quote.line_items.map((item) => (
                          <tr key={item.id}>
                            <td className="p-3 font-medium text-foreground">{item.description}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-right">₹{item.unit_price.toLocaleString("en-IN")}</td>
                            <td className="p-3 text-right font-semibold">₹{item.total.toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals */}
                    <div className="bg-muted/20 p-4 border-t border-border flex justify-end">
                      <div className="w-64 space-y-1.5 text-xs sm:text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal:</span>
                          <span>₹{quote.subtotal.toLocaleString("en-IN")}</span>
                        </div>
                        {quote.discount_amount > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Special Discount:</span>
                            <span>-₹{quote.discount_amount.toLocaleString("en-IN")}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                          <span>GST / Taxes ({quote.tax_rate}%):</span>
                          <span>₹{quote.tax_amount.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
                          <span>Final Total:</span>
                          <span className="text-primary font-bold">
                            ₹{quote.total_amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acceptance Record / Audit Log */}
                {quote.status === "accepted" && (
                  <div className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-semibold">Quotation Accepted & Legally Executed</p>
                      <p className="text-[11px] opacity-90">
                        Accepted by: <strong>{quote.accepted_by}</strong> on {quote.accepted_at ? new Date(quote.accepted_at).toLocaleString() : ""}
                      </p>
                    </div>
                  </div>
                )}

                {quote.status === "rejected" && (
                  <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                    <p className="font-semibold">Changes Requested</p>
                    <p className="text-[11px] mt-0.5">{quote.rejection_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reject / Change Request Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes to Quotation</DialogTitle>
            <DialogDescription>
              Please specify the revisions or changes required in the project scope, timeline, or pricing.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              placeholder="e.g. We would like to add an iOS widget feature and extend the delivery deadline by 2 weeks..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectionReason.trim()}
              onClick={() => {
                if (selectedQuote) {
                  rejectMutation.mutate({ quoteId: selectedQuote.id, reason: rejectionReason });
                }
              }}
            >
              Submit Change Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

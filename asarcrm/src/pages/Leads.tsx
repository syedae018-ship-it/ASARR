import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Mail, Phone, Building2, DollarSign, Calendar, Paperclip,
  UserPlus, Trash2, ExternalLink, Copy, Link2, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProposalGenerator } from "@/components/lead/ProposalGenerator";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, getDoc } from "@/lib/database";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  budget_min: number | null;
  budget_max: number | null;
  message: string | null;
  deadline: string | null;
  status: string;
  attachment_url: string | null;
  created_at: string;
  lead_services: { service_id: string; services: { name: string } | null }[];
}

const statusConfig = {
  new: { label: "New", color: "bg-primary/20 text-primary" },
  contacted: { label: "Contacted", color: "bg-info/20 text-info" },
  qualified: { label: "Qualified", color: "bg-success/20 text-success" },
  converted: { label: "Converted", color: "bg-accent/20 text-accent-foreground" },
  rejected: { label: "Rejected", color: "bg-destructive/20 text-destructive" },
};

export default function Leads() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const formLink = `${window.location.origin}/contact/${user?.id}`;

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(
        collection(db, "leads"),
        where("user_id", "==", user.id),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);

      const leadsWithServices = await Promise.all(snapshot.docs.map(async (leadDoc) => {
        const leadData = leadDoc.data();
        // Fetch lead_services
        const lsQ = query(collection(db, "lead_services"), where("lead_id", "==", leadDoc.id));
        const lsSnap = await getDocs(lsQ);

        const leadServices = await Promise.all(lsSnap.docs.map(async (lsDoc) => {
          const lsData = lsDoc.data();
          const serviceDoc = await getDoc(doc(db, "services", lsData.service_id));
          const serviceData = serviceDoc.exists() ? serviceDoc.data() : null;
          return {
            service_id: lsData.service_id,
            services: serviceData ? { name: serviceData.name } : null
          };
        }));

        return {
          id: leadDoc.id,
          ...leadData,
          lead_services: leadServices
        };
      }));

      return leadsWithServices as Lead[];
    },
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await updateDoc(doc(db, "leads", id), { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead status updated");
    },
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "leads", id));
      // Also delete lead_services? Optional but good practice.
      const q = query(collection(db, "lead_services"), where("lead_id", "==", id));
      const snap = await getDocs(q);
      snap.docs.forEach(d => deleteDoc(d.ref));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setSelectedLead(null);
      toast.success("Lead deleted");
    },
  });

  const convertToClient = useMutation({
    mutationFn: async (lead: Lead) => {
      // Safe conversion: Prevent duplicate client records if already converted
      const existingQuery = query(
        collection(db, "clients"),
        where("user_id", "==", user!.id),
        where("email", "==", lead.email)
      );
      const existingSnap = await getDocs(existingQuery);
      if (!existingSnap.empty) {
        await updateDoc(doc(db, "leads", lead.id), { status: "converted" });
        return;
      }

      // Create client
      await addDoc(collection(db, "clients"), {
        user_id: user!.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company || "Unknown",
        status: "in_progress",
        notes: `Converted from lead. Original message: ${lead.message || "N/A"}`,
        created_at: new Date().toISOString()
      });

      // Update lead status
      await updateDoc(doc(db, "leads", lead.id), { status: "converted" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setSelectedLead(null);
      toast.success("Lead converted to client!");
    },
    onError: () => {
      toast.error("Failed to convert lead");
    },
  });

  const copyFormLink = () => {
    navigator.clipboard.writeText(formLink);
    toast.success("Form link copied to clipboard!");
  };

  const filteredLeads = statusFilter === "all"
    ? leads
    : leads.filter((l) => l.status === statusFilter);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <PageHeader title="Leads" description="Manage incoming leads and convert them to clients." />
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Leads"
        description="Manage incoming leads and convert them to clients."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyFormLink} className="gap-2">
              <Copy className="w-4 h-4" />
              Copy Form Link
            </Button>
            <Button asChild className="gap-2">
              <a href={formLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Preview Form
              </a>
            </Button>
          </div>
        }
      />

      {/* Form Link Banner */}
      <div className="glass rounded-xl p-4 mb-6 flex items-center gap-3">
        <Link2 className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1">Share this link to collect leads:</p>
          <code className="text-sm bg-muted px-2 py-1 rounded text-foreground block truncate">
            {formLink}
          </code>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leads ({leads.length})</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label} ({leads.filter((l) => l.status === key).length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">No leads yet</h3>
          <p className="text-muted-foreground mb-4">
            Share your form link to start collecting leads.
          </p>
          <Button onClick={copyFormLink}>Copy Form Link</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead, index) => (
            <div
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className="glass rounded-xl p-5 cursor-pointer hover:shadow-md transition-all animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{lead.name}</h3>
                    <Badge className={cn("text-xs", statusConfig[lead.status as keyof typeof statusConfig]?.color)}>
                      {statusConfig[lead.status as keyof typeof statusConfig]?.label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {lead.email}
                    </span>
                    {lead.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {lead.company}
                      </span>
                    )}
                    {(lead.budget_min || lead.budget_max) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {lead.budget_min && lead.budget_max
                          ? `$${lead.budget_min.toLocaleString()} - $${lead.budget_max.toLocaleString()}`
                          : lead.budget_min
                            ? `From $${lead.budget_min.toLocaleString()}`
                            : `Up to $${lead.budget_max?.toLocaleString()}`}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(lead.created_at), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedLead.name}
                  <Badge className={cn("text-xs", statusConfig[selectedLead.status as keyof typeof statusConfig]?.color)}>
                    {statusConfig[selectedLead.status as keyof typeof statusConfig]?.label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline">
                      {selectedLead.email}
                    </a>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${selectedLead.phone}`} className="text-primary hover:underline">
                        {selectedLead.phone}
                      </a>
                    </div>
                  )}
                  {selectedLead.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedLead.company}</span>
                    </div>
                  )}
                  {selectedLead.deadline && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Deadline: {format(new Date(selectedLead.deadline), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>

                {/* Budget */}
                {(selectedLead.budget_min || selectedLead.budget_max) && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Budget</h4>
                    <p className="text-muted-foreground">
                      {selectedLead.budget_min && selectedLead.budget_max
                        ? `$${selectedLead.budget_min.toLocaleString()} - $${selectedLead.budget_max.toLocaleString()}`
                        : selectedLead.budget_min
                          ? `From $${selectedLead.budget_min.toLocaleString()}`
                          : `Up to $${selectedLead.budget_max?.toLocaleString()}`}
                    </p>
                  </div>
                )}

                {/* Services */}
                {selectedLead.lead_services?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Interested In</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.lead_services.map((ls) => (
                        <Badge key={ls.service_id} variant="secondary">
                          {ls.services?.name || "Unknown Service"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                {selectedLead.message && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Message</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedLead.message}</p>
                  </div>
                )}

                {/* Attachment */}
                {selectedLead.attachment_url && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Attachment</h4>
                    <a
                      href={selectedLead.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      <Paperclip className="w-4 h-4" />
                      View Attachment
                    </a>
                  </div>
                )}

                {/* Status Update */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Update Status</h4>
                  <Select
                    value={selectedLead.status}
                    onValueChange={(status) => updateStatus.mutate({ id: selectedLead.id, status })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  {selectedLead.status !== "converted" && (
                    <Button
                      onClick={() => convertToClient.mutate(selectedLead)}
                      disabled={convertToClient.isPending}
                      className="gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Convert to Client
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setIsProposalOpen(true)}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Create Proposal
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteLead.mutate(selectedLead.id)}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {selectedLead && (
        <ProposalGenerator
          lead={selectedLead}
          open={isProposalOpen}
          onOpenChange={setIsProposalOpen}
        />
      )}
    </div>
  );
}
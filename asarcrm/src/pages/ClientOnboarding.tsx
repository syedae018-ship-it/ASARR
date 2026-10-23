import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  UserPlus,
  Mail,
  ShieldCheck,
  Copy,
  Check,
  Clock,
  RefreshCw,
  AlertTriangle,
  Send,
  CheckCircle2,
  XCircle,
  Building2,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ClientOnboardingInvitation, Client } from "@/types";

export default function ClientOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Invite Mode: 'existing' | 'new'
  const [inviteMode, setInviteMode] = useState<"existing" | "new">("existing");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [newBrandName, setNewBrandName] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [invitePhone, setInvitePhone] = useState<string>("");
  const [inviteNotes, setInviteNotes] = useState<string>("");

  // Queries
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.warn("Failed to fetch clients:", error.message);
        return [];
      }
      return data as Client[];
    }
  });

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["client_onboarding_invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_onboarding_invitations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Failed to fetch client onboarding invitations:", error.message);
        return [];
      }
      return (data || []).map((row: any) => ({
        ...row,
        status: row.expires_at && new Date(row.expires_at) < new Date() && row.status === 'pending'
          ? 'expired'
          : row.status
      })) as ClientOnboardingInvitation[];
    }
  });

  // Create Invitation Mutation
  const createInviteMutation = useMutation({
    mutationFn: async () => {
      const email = inviteEmail.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        throw new Error("A valid recipient email address is required.");
      }

      let clientId = selectedClientId;
      let brandName = "";

      if (inviteMode === "new") {
        if (!newBrandName.trim()) {
          throw new Error("Brand or business name is required.");
        }

        const newId = crypto.randomUUID();
        const { error: clientErr } = await supabase.from("clients").insert({
          id: newId,
          user_id: user?.id,
          name: newClientName.trim() || newBrandName.trim(),
          company: newBrandName.trim(),
          email: email,
          phone: invitePhone.trim() || null,
          status: "active",
          created_at: new Date().toISOString()
        });

        if (clientErr) throw clientErr;
        clientId = newId;
        brandName = newBrandName.trim();
      } else {
        if (!selectedClientId) {
          throw new Error("Please select an approved client organization.");
        }
        const client = clients.find(c => c.id === selectedClientId);
        brandName = client?.company || client?.name || "Client Organization";
      }

      // Revoke any previous unused pending invitation for this recipient email
      await supabase
        .from("client_onboarding_invitations")
        .update({ status: "revoked" })
        .eq("email", email)
        .eq("status", "pending");

      // Generate cryptographically secure token
      const token = "inv_" + crypto.randomUUID().replace(/-/g, "") + Date.now().toString(36);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Exactly 24 hours expiration

      const { data, error } = await supabase.from("client_onboarding_invitations").insert({
        client_id: clientId,
        client_name: brandName,
        full_name: newClientName.trim() || null,
        phone: invitePhone.trim() || null,
        email: email,
        token,
        status: "pending",
        invited_by: user?.id || "admin-system",
        expires_at: expiresAt,
        created_at: now.toISOString(),
        notes: inviteNotes.trim() || null
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client_onboarding_invitations"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Single-use 24-hour client invitation link generated!");
      setIsInviteModalOpen(false);
      setInviteEmail("");
      setInvitePhone("");
      setSelectedClientId("");
      setNewBrandName("");
      setNewClientName("");
      setInviteNotes("");

      if (data?.token) {
        copyActivationLink(data.token, data.id);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate invitation");
    }
  });

  // Revoke Mutation
  const revokeInviteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("client_onboarding_invitations")
        .update({ status: "revoked" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_onboarding_invitations"] });
      toast.info("Invitation revoked successfully.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to revoke invitation");
    }
  });

  // Regenerate / Resend Mutation
  const regenerateInviteMutation = useMutation({
    mutationFn: async (inv: ClientOnboardingInvitation) => {
      const newToken = "inv_" + crypto.randomUUID().replace(/-/g, "") + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Exactly 24 hours

      const { error } = await supabase
        .from("client_onboarding_invitations")
        .update({
          token: newToken,
          status: "pending",
          expires_at: expiresAt,
          created_at: new Date().toISOString()
        })
        .eq("id", inv.id);

      if (error) throw error;
      return newToken;
    },
    onSuccess: (newToken, inv) => {
      queryClient.invalidateQueries({ queryKey: ["client_onboarding_invitations"] });
      copyActivationLink(newToken, inv.id);
      toast.success("Invitation refreshed with a new secure token!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to regenerate invitation");
    }
  });

  const getActivationUrl = (token: string) => {
    const origin = window.location.origin;
    return `${origin}/portal/activate/${token}`;
  };

  const copyActivationLink = (token: string, id: string) => {
    const url = getActivationUrl(token);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Activation link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      <PageHeader
        title="Client Onboarding & Invitations"
        subtitle="Issue secure, single-use, email-bound invitations for approved clients to establish portal credentials."
      >
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          onClick={() => setIsInviteModalOpen(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Client
        </Button>
      </PageHeader>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Invitations</p>
              <p className="text-2xl font-bold text-foreground mt-1">{invitations.length}</p>
            </div>
            <Mail className="w-8 h-8 text-primary/40" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Pending Activation</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {invitations.filter(i => i.status === "pending" || i.status === "sent").length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-amber-500/40" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Activated Clients</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {invitations.filter(i => i.status === "accepted").length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-emerald-500/40" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Client Accounts in CRM</p>
              <p className="text-2xl font-bold text-foreground mt-1">{clients.length}</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-primary/40" />
          </CardContent>
        </Card>
      </div>

      {/* Invitations Table */}
      <Card className="border-border/60 shadow-sm overflow-hidden bg-card">
        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Authorized Client Invitations</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Strictly email-bound activation links that consume upon account creation
            </p>
          </div>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Invite Client
          </Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Client Organization</th>
                <th className="px-4 py-3">Recipient Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sent Date</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground animate-pulse text-xs">
                    Loading invitation ledger...
                  </td>
                </tr>
              ) : invitations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-40 text-primary" />
                    <p className="font-semibold text-foreground text-sm">No client invitations issued</p>
                    <p className="text-xs mt-1 text-muted-foreground max-w-sm mx-auto">
                      Generate a secure activation link for an approved client organization so they can establish credentials and access their portal.
                    </p>
                    <div className="mt-4">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                        onClick={() => setIsInviteModalOpen(true)}
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                        Invite Client
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {inv.client_name || "Client Entity"}
                    </td>

                    <td className="px-4 py-3 text-foreground font-mono text-xs">
                      {inv.email}
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        className={cn(
                          "text-[10px] font-medium border-0 capitalize",
                          inv.status === "accepted" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                          inv.status === "pending" && "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
                          inv.status === "revoked" && "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
                          inv.status === "expired" && "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        )}
                      >
                        {inv.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {inv.created_at ? format(parseISO(inv.created_at), "dd MMM yyyy, hh:mm a") : "—"}
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {inv.expires_at ? format(parseISO(inv.expires_at), "dd MMM yyyy, hh:mm a") : "24 hours"}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status !== "accepted" && inv.status !== "revoked" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-primary/20 text-primary hover:bg-primary/5"
                              onClick={() => copyActivationLink(inv.token, inv.id)}
                            >
                              {copiedId === inv.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 mr-1" />
                                  Copy Link
                                </>
                              )}
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-muted-foreground hover:text-primary"
                              onClick={() => regenerateInviteMutation.mutate(inv)}
                              title="Regenerate single-use token"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Resend
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => {
                                if (confirm(`Revoke invitation for ${inv.email}?`)) {
                                  revokeInviteMutation.mutate(inv.id);
                                }
                              }}
                            >
                              Revoke
                            </Button>
                          </>
                        )}

                        {inv.status === "accepted" && (
                          <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active in Portal
                          </span>
                        )}

                        {inv.status === "revoked" && (
                          <span className="text-xs text-muted-foreground">
                            Revoked
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Invite Client to Portal
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Generate a single-purpose, email-bound activation link. Uninvited visitors cannot register.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={inviteMode}
            onValueChange={(val) => setInviteMode(val as any)}
            className="w-full py-1"
          >
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="existing">Existing Client Record</TabsTrigger>
              <TabsTrigger value="new">Create New Client</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-3 m-0">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Select Client Organization *</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Choose existing client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="new" className="space-y-3 m-0">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Brand / Business Name *</Label>
                <Input
                  placeholder="e.g. Acme Studio Paris"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Client Representative Name</Label>
                <Input
                  placeholder="e.g. Marc Jacobs"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="text-xs"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Authorized Recipient Email *</Label>
              <Input
                type="email"
                placeholder="client@brand.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="text-xs"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                The invitation is strictly bound to this email. The recipient cannot activate with another address.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Client Mobile Number</Label>
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notes / Purpose (Optional)</Label>
              <Input
                placeholder="e.g. Deliverables & Quote Sign-off"
                value={inviteNotes}
                onChange={(e) => setInviteNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={createInviteMutation.isPending}
              onClick={() => createInviteMutation.mutate()}
            >
              {createInviteMutation.isPending ? "Generating..." : "Generate & Copy Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

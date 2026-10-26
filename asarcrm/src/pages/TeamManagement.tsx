import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  Users, UserPlus, Shield, ShieldAlert, ShieldCheck, Mail,
  Copy, Check, Trash2, UserX, CheckCircle2, Crown, Sparkles,
  CheckSquare, Calendar, Clock, ListTodo, Plus, CheckCircle, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { db, collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy, getInstallationOwnerId } from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";
import { AdminMembership, AdminInvitation } from "@/types";

export default function TeamManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "team_member">("admin");
  const [inviteFullName, setInviteFullName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Task Assignment State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskDueDate, setTaskDueDate] = useState("");

  // Queries
  const { data: members = [] } = useQuery({
    queryKey: ["admin_memberships"],
    queryFn: async () => {
      const [membersSnap, profilesRes] = await Promise.all([
        getDocs(collection(db, "admin_memberships")),
        supabase.from("profiles").select("id, email, full_name, role"),
      ]);

      const profileMap = new Map((profilesRes.data || []).map((p) => [p.id, p]));

      return membersSnap.docs.map((d) => {
        const data = d.data();
        const prof = profileMap.get(data.user_id);
        return {
          id: d.id,
          ...data,
          email: data.email || prof?.email || "team@asarr.in",
          full_name: data.full_name || prof?.full_name || "Agency Admin",
        };
      }) as AdminMembership[];
    },
  });

  const { data: teamTasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ["team_tasks"],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, "tasks"), orderBy("created_at", "desc")));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      if (!taskTitle.trim()) throw new Error("Task title is required");
      const assignedMember = members.find(m => m.user_id === taskAssignee);
      await addDoc(collection(db, "tasks"), {
        user_id: user?.id,
        title: taskTitle.trim(),
        description: taskDescription.trim() || null,
        status: "todo",
        priority: taskPriority,
        assigned_to: taskAssignee || user?.id,
        assigned_name: assignedMember?.full_name || assignedMember?.email || (taskAssignee === user?.id ? "Me" : "Unassigned"),
        due_date: taskDueDate ? new Date(taskDueDate).toISOString() : null,
        created_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task assigned successfully!");
      setIsTaskModalOpen(false);
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate("");
      setTaskAssignee("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to assign task");
    }
  });

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === "done" ? "todo" : "done";
      await updateDoc(doc(db, "tasks", taskId), { status: nextStatus });
      queryClient.invalidateQueries({ queryKey: ["team_tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(`Task marked as ${nextStatus}!`);
    } catch (err: any) {
      toast.error("Failed to update task: " + err.message);
    }
  };

  const handleOpenTaskModal = (memberUserId?: string) => {
    if (memberUserId) {
      setTaskAssignee(memberUserId);
    } else if (members.length > 0) {
      setTaskAssignee(members[0].user_id);
    }
    setIsTaskModalOpen(true);
  };

  const { data: invitations = [] } = useQuery({
    queryKey: ["admin_invitations"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "admin_invitations"));
      return snap.docs.map((d) => {
        const item = d.data() as AdminInvitation;
        const isExpired = item.expires_at && new Date(item.expires_at) < new Date() && item.status === "pending";
        return {
          id: d.id,
          ...item,
          status: isExpired ? "expired" : item.status,
        };
      }) as AdminInvitation[];
    },
  });

  // Create Invitation Mutation (Strict 24-hour expiration)
  const inviteAdminMutation = useMutation({
    mutationFn: async () => {
      const targetEmail = inviteEmail.trim().toLowerCase();
      if (!targetEmail || !targetEmail.includes("@")) {
        throw new Error("A valid email is required.");
      }

      // Revoke any previous unused pending invitation for this recipient email
      await supabase
        .from("admin_invitations")
        .update({ status: "revoked" })
        .eq("email", targetEmail)
        .eq("status", "pending");

      const token = "adm_" + crypto.randomUUID().replace(/-/g, "") + Date.now().toString(36);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Exactly 24 hours

      const ownerId = await getInstallationOwnerId();
      const inviterId = user?.id || ownerId || "77308899-8657-4ce4-907c-b56e33c8f760";

      await addDoc(collection(db, "admin_invitations"), {
        email: targetEmail,
        role: inviteRole,
        token,
        status: "pending",
        invited_by: inviterId,
        expires_at: expiresAt,
        created_at: now.toISOString(),
      });

      return { token };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin_invitations"] });
      toast.success("Administrator invitation link generated (valid 24 hours)!");
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteFullName("");
      if (data?.token) {
        copyInvitationToken(data.token, "new");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to invite administrator");
    },
  });

  // Regenerate / Refresh Admin Invitation Mutation
  const regenerateAdminInviteMutation = useMutation({
    mutationFn: async (inv: AdminInvitation) => {
      const newToken = "adm_" + crypto.randomUUID().replace(/-/g, "") + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Exactly 24 hours

      const { error } = await supabase
        .from("admin_invitations")
        .update({
          token: newToken,
          status: "pending",
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
        })
        .eq("id", inv.id);

      if (error) throw error;
      return newToken;
    },
    onSuccess: (newToken, inv) => {
      queryClient.invalidateQueries({ queryKey: ["admin_invitations"] });
      copyInvitationToken(newToken, inv.id);
      toast.success("Invitation refreshed with a new 24-hour token!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to refresh invitation");
    },
  });

  // Change Role Mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ id, newRole }: { id: string; newRole: string }) => {
      await updateDoc(doc(db, "admin_memberships", id), {
        role: newRole,
        updated_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_memberships"] });
      toast.success("Role updated successfully.");
    }
  });

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      await updateDoc(doc(db, "admin_memberships", id), {
        status: newStatus,
        updated_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_memberships"] });
      toast.success("Team member status updated.");
    }
  });

  // Delete / Revoke Single Invitation Mutation
  const deleteInviteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_invitations").delete().eq("id", id);
      if (error) {
        await deleteDoc(doc(db, "admin_invitations", id));
        await updateDoc(doc(db, "admin_invitations", id), { status: "revoked" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_invitations"] });
      toast.success("Invitation deleted permanently.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete invitation");
    }
  });

  // Delete All Pending Admin Invitations
  const deleteAllInvitesMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("admin_invitations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) {
        const snap = await getDocs(collection(db, "admin_invitations"));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, "admin_invitations", d.id));
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_invitations"] });
      toast.success("All previous invitations deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete invitations");
    }
  });

  // Remove Member Mutation (Non-Owners only)
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from("admin_memberships").delete().eq("id", memberId);
      if (error) {
        await deleteDoc(doc(db, "admin_memberships", memberId));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_memberships"] });
      toast.success("Team member removed successfully.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to remove member");
    }
  });

  const copyInvitationToken = (token: string, id: string) => {
    const url = `${window.location.origin}/portal/activate/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Admin activation link copied!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Admin & Team Management"
        subtitle="Manage agency administrators, assign operational roles, and coordinate team tasks and delivery privileges."
      >
        <Button
          variant="outline"
          className="border-primary/20 hover:bg-primary/5"
          onClick={() => handleOpenTaskModal()}
        >
          <CheckSquare className="w-4 h-4 mr-2 text-primary" />
          Assign Task
        </Button>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setIsInviteOpen(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Admin / Team Member
        </Button>
      </PageHeader>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Agency Owner</p>
              <p className="text-xl font-bold text-foreground mt-1 flex items-center gap-1.5">
                <Crown className="w-5 h-5 text-amber-500" />
                Protected Primary
              </p>
            </div>
            <ShieldAlert className="w-8 h-8 text-amber-500/40" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Administrators</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {members.filter(m => m.status === "active").length}
              </p>
            </div>
            <Users className="w-8 h-8 text-primary/40" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Pending Admin Invites</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {invitations.filter(i => i.status === "pending").length}
              </p>
            </div>
            <Mail className="w-8 h-8 text-amber-500/40" />
          </CardContent>
        </Card>
      </div>

      {/* Active Team Members Table */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Active Agency Administrators & Team
          </CardTitle>
        </CardHeader>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined Date</th>
                <th className="px-4 py-3 text-right">Role & Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => {
                const isOwner = member.role === "owner";

                return (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {member.full_name || "Agency Admin"}
                        {isOwner && (
                          <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-0 text-[10px] py-0">
                            OWNER
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-foreground">
                      {member.email}
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge
                        className={cn(
                          "text-[10px] font-medium border-0 capitalize",
                          member.role === "owner" && "bg-amber-100 text-amber-800",
                          member.role === "admin" && "bg-primary/20 text-primary font-semibold",
                          member.role === "team_member" && "bg-slate-100 text-slate-800"
                        )}
                      >
                        {member.role?.replace("_", " ")}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge
                        className={cn(
                          "text-[10px] font-medium border-0 capitalize",
                          member.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        )}
                      >
                        {member.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {member.created_at ? format(parseISO(member.created_at), "dd MMM yyyy") : "Foundation"}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-primary/20 hover:bg-primary/5"
                          onClick={() => handleOpenTaskModal(member.user_id)}
                        >
                          <CheckSquare className="w-3.5 h-3.5 mr-1 text-primary" />
                          Assign Task
                        </Button>

                        {isOwner ? (
                          <span className="text-xs text-muted-foreground italic ml-2">Protected Owner</span>
                        ) : (
                          <>
                            <Select
                              value={member.role}
                              onValueChange={(newRole) => changeRoleMutation.mutate({ id: member.id, newRole })}
                            >
                              <SelectTrigger className="h-7 text-xs w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="team_member">Team Member</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              size="sm"
                              variant="ghost"
                              className={cn(
                                "h-7 text-xs",
                                member.status === "active" ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"
                              )}
                              onClick={() => toggleStatusMutation.mutate({
                                id: member.id,
                                newStatus: member.status === "active" ? "inactive" : "active"
                              })}
                            >
                              {member.status === "active" ? "Deactivate" : "Activate"}
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-rose-600 hover:bg-rose-50 px-2"
                              title="Permanently remove team member"
                              onClick={() => {
                                if (window.confirm(`Permanently remove ${member.full_name || member.email} from agency admins?`)) {
                                  removeMemberMutation.mutate(member.id);
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Zero-Swipe Cards View */}
        <div className="block md:hidden divide-y divide-border">
          {members.map((member) => {
            const isOwner = member.role === "owner";

            return (
              <div key={member.id} className="p-4 space-y-3 bg-card">
                {/* Header: Name, Owner Badge, Role Badge, Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-foreground text-sm">
                        {member.full_name || "Agency Admin"}
                      </span>
                      {isOwner && (
                        <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-0 text-[10px] py-0">
                          OWNER
                        </Badge>
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5 break-all">
                      {member.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge
                      className={cn(
                        "text-[10px] font-medium border-0 capitalize",
                        member.role === "owner" && "bg-amber-100 text-amber-800",
                        member.role === "admin" && "bg-primary/20 text-primary font-semibold",
                        member.role === "team_member" && "bg-slate-100 text-slate-800"
                      )}
                    >
                      {member.role?.replace("_", " ")}
                    </Badge>
                    <Badge
                      className={cn(
                        "text-[10px] font-medium border-0 capitalize",
                        member.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      )}
                    >
                      {member.status}
                    </Badge>
                  </div>
                </div>

                {/* Joined Date */}
                <div className="text-xs text-muted-foreground">
                  Joined: <span className="text-foreground">{member.created_at ? format(parseISO(member.created_at), "dd MMM yyyy") : "Foundation"}</span>
                </div>

                {/* Mobile Zero-Swipe Actions */}
                <div className="flex flex-col gap-2 pt-1 border-t border-border/50">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs border-primary/20 hover:bg-primary/5"
                    onClick={() => handleOpenTaskModal(member.user_id)}
                  >
                    <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    Assign Task
                  </Button>

                  {!isOwner && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role}
                        onValueChange={(newRole) => changeRoleMutation.mutate({ id: member.id, newRole })}
                      >
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="team_member">Team Member</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "h-8 text-xs flex-1",
                          member.status === "active" ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"
                        )}
                        onClick={() => toggleStatusMutation.mutate({
                          id: member.id,
                          newStatus: member.status === "active" ? "inactive" : "active"
                        })}
                      >
                        {member.status === "active" ? "Deactivate" : "Activate"}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-rose-600 hover:bg-rose-50 px-2 shrink-0"
                        title="Permanently remove member"
                        onClick={() => {
                          if (window.confirm(`Permanently remove ${member.full_name || member.email} from agency admins?`)) {
                            removeMemberMutation.mutate(member.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pending Invitations Table */}
      {invitations.length > 0 && (
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Pending Admin Invitations</CardTitle>
              <CardDescription className="text-xs">Active onboarding invitation links awaiting activation.</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 self-start sm:self-auto"
              onClick={() => {
                if (window.confirm("Permanently delete all previous pending admin invitations?")) {
                  deleteAllInvitesMutation.mutate();
                }
              }}
              disabled={deleteAllInvitesMutation.isPending}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete All Invites
            </Button>
          </CardHeader>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Invited Email</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {inv.email}
                    </td>
                    <td className="px-4 py-3 capitalize text-xs font-medium">
                      {inv.role?.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="text-[10px] bg-amber-100 text-amber-800 border-0">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {inv.expires_at ? format(parseISO(inv.expires_at), "dd MMM yyyy, hh:mm a") : "24 hours"}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-primary/20 text-primary hover:bg-primary/5"
                            onClick={() => copyInvitationToken(inv.token, inv.id)}
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
                        )}

                        {inv.status !== "accepted" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => regenerateAdminInviteMutation.mutate(inv)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Refresh Link
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => deleteInviteMutation.mutate(inv.id)}
                          disabled={deleteInviteMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Zero-Swipe Cards */}
          <div className="block md:hidden divide-y divide-border">
            {invitations.map((inv) => (
              <div key={inv.id} className="p-4 space-y-2.5 bg-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-foreground break-all">
                      {inv.email}
                    </p>
                    <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
                      Role: {inv.role?.replace("_", " ")}
                    </p>
                  </div>
                  <Badge className="text-[10px] bg-amber-100 text-amber-800 border-0 shrink-0">
                    {inv.status}
                  </Badge>
                </div>

                <div className="text-[11px] font-mono text-muted-foreground">
                  Expires: {inv.expires_at ? format(parseISO(inv.expires_at), "dd MMM yyyy, hh:mm a") : "24 hours"}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  {inv.status === "pending" && (
                    <Button
                      size="sm"
                      className="flex-1 h-8 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                      onClick={() => copyInvitationToken(inv.token, inv.id)}
                    >
                      {copiedId === inv.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  )}

                  {inv.status !== "accepted" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs border-primary/20 text-primary hover:bg-primary/5"
                      onClick={() => regenerateAdminInviteMutation.mutate(inv)}
                      title="Refresh invitation token"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => deleteInviteMutation.mutate(inv.id)}
                    disabled={deleteInviteMutation.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Team Tasks & Assignments Section */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-primary" />
              Team Tasks & Deliverables
            </CardTitle>
            <CardDescription className="text-xs">
              Directly assign, track, and manage client deliverables and internal agency responsibilities across team members.
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
            onClick={() => handleOpenTaskModal()}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Assign Task
          </Button>
        </CardHeader>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3">Task Title & Description</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teamTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <CheckSquare className="w-7 h-7 mx-auto mb-2 opacity-30 text-primary" />
                    <p className="font-medium text-foreground text-xs">No team tasks assigned yet</p>
                    <p className="text-[11px] mt-0.5">Click "Assign Task" above to delegate a task to any team member or admin.</p>
                  </td>
                </tr>
              ) : (
                teamTasks.map((t: any) => {
                  const assignedMember = members.find(m => m.user_id === t.assigned_to);
                  const isDone = t.status === "done";

                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className={cn("font-medium text-foreground text-xs", isDone && "line-through text-muted-foreground")}>
                          {t.title}
                        </div>
                        {t.description && (
                          <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            {t.description}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-foreground">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{assignedMember?.full_name || t.assigned_name || assignedMember?.email || "Team Member"}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          className={cn(
                            "text-[10px] font-medium border-0 capitalize",
                            t.priority === "urgent" && "bg-rose-100 text-rose-800",
                            t.priority === "high" && "bg-amber-100 text-amber-800",
                            t.priority === "medium" && "bg-primary/10 text-primary border border-primary/20",
                            t.priority === "low" && "bg-slate-100 text-slate-800"
                          )}
                        >
                          {t.priority || "medium"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {t.due_date ? format(parseISO(t.due_date), "dd MMM yyyy") : "No deadline"}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          className={cn(
                            "text-[10px] font-medium border-0 capitalize",
                            isDone ? "bg-emerald-100 text-emerald-800" : "bg-primary/10 text-primary"
                          )}
                        >
                          {isDone ? "Completed" : "In Progress"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            "h-7 text-xs",
                            isDone ? "text-muted-foreground hover:bg-muted" : "text-emerald-600 hover:bg-emerald-50"
                          )}
                          onClick={() => toggleTaskStatus(t.id, t.status)}
                        >
                          {isDone ? "Reopen" : "Mark Done"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Zero-Swipe Cards View */}
        <div className="block md:hidden divide-y divide-border">
          {teamTasks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground p-4">
              <CheckSquare className="w-7 h-7 mx-auto mb-2 opacity-30 text-primary" />
              <p className="font-medium text-foreground text-xs">No team tasks assigned yet</p>
              <p className="text-[11px] mt-0.5">Click "Assign Task" above to delegate a task.</p>
            </div>
          ) : (
            teamTasks.map((t: any) => {
              const assignedMember = members.find(m => m.user_id === t.assigned_to);
              const isDone = t.status === "done";

              return (
                <div key={t.id} className="p-4 space-y-2.5 bg-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className={cn("font-medium text-foreground text-xs", isDone && "line-through text-muted-foreground")}>
                        {t.title}
                      </div>
                      {t.description && (
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                          {t.description}
                        </div>
                      )}
                    </div>
                    <Badge
                      className={cn(
                        "text-[10px] font-medium border-0 capitalize shrink-0",
                        isDone ? "bg-emerald-100 text-emerald-800" : "bg-primary/10 text-primary"
                      )}
                    >
                      {isDone ? "Completed" : "In Progress"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      {assignedMember?.full_name || t.assigned_name || assignedMember?.email || "Team Member"}
                    </span>
                    <span>•</span>
                    <Badge
                      className={cn(
                        "text-[9px] font-medium border-0 capitalize py-0",
                        t.priority === "urgent" && "bg-rose-100 text-rose-800",
                        t.priority === "high" && "bg-amber-100 text-amber-800",
                        t.priority === "medium" && "bg-primary/10 text-primary",
                        t.priority === "low" && "bg-slate-100 text-slate-800"
                      )}
                    >
                      {t.priority || "medium"}
                    </Badge>
                    <span>•</span>
                    <span className="font-mono">
                      {t.due_date ? format(parseISO(t.due_date), "dd MMM yyyy") : "No deadline"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <Button
                      size="sm"
                      variant={isDone ? "outline" : "default"}
                      className={cn(
                        "w-full h-8 text-xs font-semibold",
                        isDone ? "text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      onClick={() => toggleTaskStatus(t.id, t.status)}
                    >
                      {isDone ? "Reopen Task" : "Mark as Done"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Invite Modal */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Invite Administrator
            </DialogTitle>
            <DialogDescription>
              Grant access to the ASARR agency operations portal. New admins cannot modify the primary owner account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Administrator Email *</Label>
              <Input
                type="email"
                placeholder="colleague@asarr.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assigned Role *</Label>
              <Select value={inviteRole} onValueChange={(val: any) => setInviteRole(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator (Full CRM & Delivery Access)</SelectItem>
                  <SelectItem value="team_member">Team Member (Task & Calendar Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={inviteAdminMutation.isPending}
              onClick={() => inviteAdminMutation.mutate()}
            >
              {inviteAdminMutation.isPending ? "Generating..." : "Generate Admin Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              Assign Team Task
            </DialogTitle>
            <DialogDescription>
              Create a task and assign it directly to a team member or administrator.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Task Title *</Label>
              <Input
                placeholder="e.g. Complete client website wireframes"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assign To *</Label>
              <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={user?.id || "admin"}>Assigned to Me (Self)</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.user_id}>
                      {m.full_name || m.email} ({m.role?.replace("_", " ")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Priority</Label>
                <Select value={taskPriority} onValueChange={(val: any) => setTaskPriority(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Due Date</Label>
                <Input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description / Notes (Optional)</Label>
              <Textarea
                placeholder="Provide task requirements, deliverables, or checklist details..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={createTaskMutation.isPending}
              onClick={() => createTaskMutation.mutate()}
            >
              {createTaskMutation.isPending ? "Assigning..." : "Assign Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

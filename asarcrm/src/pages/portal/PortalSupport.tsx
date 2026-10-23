import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, addDoc } from "@/lib/database";
import { SupportTicket } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { LifeBuoy, Plus, Clock, CheckCircle2, MessageSquare } from "lucide-react";

export default function PortalSupport() {
  const { clientId, user } = useAuth();
  const queryClient = useQueryClient();
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

  const { data: tickets = [] } = useQuery<SupportTicket[]>({
    queryKey: ["portal-tickets", clientId],
    queryFn: async () => {
      const q = query(collection(db, "support_tickets"), where("client_id", "==", clientId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SupportTicket[];
    },
    enabled: !!clientId,
  });

  const createTicketMutation = useMutation({
    mutationFn: async () => {
      if (!subject.trim() || !description.trim()) {
        throw new Error("Subject and description are required.");
      }

      await addDoc(collection(db, "support_tickets"), {
        client_id: clientId,
        user_id: user?.id,
        subject,
        description,
        priority,
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-tickets"] });
      setNewTicketOpen(false);
      setSubject("");
      setDescription("");
      toast.success("Support ticket created. ASARR support assigned.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create ticket");
    },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Support & Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit technical questions, staging bug reports, or feature change requests directly to the ASARR engineering desk.
          </p>
        </div>

        <Button
          onClick={() => setNewTicketOpen(!newTicketOpen)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Support Request
        </Button>
      </div>

      {/* New Ticket Form */}
      {newTicketOpen && (
        <Card className="border-primary/30 bg-accent/30 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-primary" />
              Open a New Support Ticket
            </CardTitle>
            <CardDescription className="text-xs">
              Our engineering team responds to priority issues within our 4-hour SLA window.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Subject / Issue Summary</label>
                <Input
                  placeholder="e.g. Question regarding staging payment webhook testing..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Priority Level</label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (General Query)</SelectItem>
                    <SelectItem value="medium">Medium (Standard)</SelectItem>
                    <SelectItem value="high">High (Urgent Bug)</SelectItem>
                    <SelectItem value="urgent">Critical (Production Blocker)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Detailed Description & Steps</label>
              <Textarea
                placeholder="Describe what occurred, include reproduction steps or staging URLs..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setNewTicketOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => createTicketMutation.mutate()}
                disabled={createTicketMutation.isPending}
              >
                {createTicketMutation.isPending ? "Submitting..." : "Submit Ticket"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            <LifeBuoy className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
            No open support requests. Everything is operating smoothly!
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="border-border/80 shadow-sm">
              <CardHeader className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ticket.priority === "urgent" || ticket.priority === "high"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    <Badge
                      variant={ticket.status === "resolved" ? "default" : "secondary"}
                      className={ticket.status === "resolved" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                    >
                      {ticket.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Created: {new Date(ticket.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-base mt-2">{ticket.subject}</CardTitle>
                <CardDescription className="text-xs mt-1">{ticket.description}</CardDescription>
              </CardHeader>

              {ticket.resolution_notes && (
                <CardContent className="pt-0 pb-4">
                  <div className="p-3 rounded-lg bg-accent/40 border border-primary/20 text-xs">
                    <strong className="block text-primary font-semibold mb-0.5 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> ASARR Team Response:
                    </strong>
                    <p className="text-foreground">{ticket.resolution_notes}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

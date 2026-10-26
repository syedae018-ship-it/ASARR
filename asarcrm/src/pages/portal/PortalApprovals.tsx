import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/database";
import { collection, getDocs, doc, updateDoc } from "@/lib/database";
import { ProjectDeliverable } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, MessageSquare, ExternalLink, ShieldCheck, Clock, FileCode2, Video, Palette } from "lucide-react";

export default function PortalApprovals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeItem, setActiveItem] = useState<ProjectDeliverable | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const { data: deliverables = [] } = useQuery<ProjectDeliverable[]>({
    queryKey: ["portal-deliverables-all"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "project_deliverables"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ProjectDeliverable[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await updateDoc(doc(db, "project_deliverables", id), {
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: user?.id,
        client_feedback: `Approved by ${user?.user_metadata?.full_name || "Client"}.`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-deliverables-all"] });
      queryClient.invalidateQueries({ queryKey: ["portal-deliverables"] });
      toast.success("Deliverable approved! ASARR engineering and creative team notified.");
    },
  });

  const revisionMutation = useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback: string }) => {
      await updateDoc(doc(db, "project_deliverables", id), {
        status: "revision_requested",
        client_feedback: feedback,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-deliverables-all"] });
      queryClient.invalidateQueries({ queryKey: ["portal-deliverables"] });
      setFeedbackOpen(false);
      setFeedbackText("");
      toast.info("Revision feedback submitted to ASARR team.");
    },
  });

  const getDeliverableIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4 text-rose-500" />;
      case "software":
        return <FileCode2 className="w-4 h-4 text-primary" />;
      default:
        return <Palette className="w-4 h-4 text-primary/80" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Creative & Software Deliverables</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review design prototypes, staging builds, video cuts, and sign off on project sprint releases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deliverables.map((item) => {
          const isPending = item.status === "pending_review";
          const isApproved = item.status === "approved";
          const isRevision = item.status === "revision_requested";

          return (
            <Card key={item.id} className="border-border/80 shadow-sm flex flex-col justify-between overflow-hidden">
              <div>
                {/* Visual Preview */}
                {item.preview_url && (
                  <div className="h-44 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden group">
                    <img
                      src={item.preview_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm flex items-center gap-1.5">
                        {getDeliverableIcon(item.deliverable_type)}
                        <span className="capitalize">{item.deliverable_type}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-black/70 text-white">
                        {item.version}
                      </span>
                    </div>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge
                      variant={isApproved ? "default" : isPending ? "secondary" : "destructive"}
                      className={isApproved ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                    >
                      {item.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Updated: {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">{item.description}</CardDescription>
                </CardHeader>
              </div>

              <CardContent className="pt-0 space-y-4">
                {/* Feedback note if any */}
                {item.client_feedback && (
                  <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-foreground">
                    <strong className="block text-muted-foreground mb-0.5 text-[11px] uppercase tracking-wider">
                      Feedback / Approval Notes:
                    </strong>
                    {item.client_feedback}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                  {item.file_url ? (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                    >
                      Open Live Deliverable <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : <span />}

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveItem(item);
                            setFeedbackOpen(true);
                          }}
                          className="text-xs h-8 gap-1.5 text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Request Revisions
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(item.id)}
                          className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </Button>
                      </>
                    )}

                    {isApproved && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-4 h-4" /> Approved & Locked
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revision Dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revisions</DialogTitle>
            <DialogDescription>
              Provide specific feedback, timestamps (for video), or responsive screen requirements for the ASARR team.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              placeholder="e.g. Please adjust the hero font size on mobile view and make the primary CTA button indigo..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!feedbackText.trim()}
              onClick={() => {
                if (activeItem) {
                  revisionMutation.mutate({ id: activeItem.id, feedback: feedbackText });
                }
              }}
            >
              Send Revision Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

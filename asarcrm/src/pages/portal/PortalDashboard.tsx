import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/database";
import { collection, query, where, getDocs } from "@/lib/database";
import { Project, ProjectDeliverable, QuotationVersion, Invoice } from "@/types";
import {
  FolderKanban,
  FileCheck2,
  CheckCircle2,
  Receipt,
  ArrowRight,
  ExternalLink,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PortalDashboard() {
  const { user, clientId } = useAuth();

  // 1. Projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["portal-projects", clientId],
    queryFn: async () => {
      const q = query(collection(db, "projects"), where("client_id", "==", clientId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Project[];
    },
    enabled: !!clientId,
  });

  // 2. Quotations
  const { data: quotations = [] } = useQuery<QuotationVersion[]>({
    queryKey: ["portal-quotes", clientId],
    queryFn: async () => {
      const q = query(collection(db, "quotation_versions"), where("client_id", "==", clientId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as QuotationVersion[];
    },
    enabled: !!clientId,
  });

  // 3. Deliverables
  const { data: deliverables = [] } = useQuery<ProjectDeliverable[]>({
    queryKey: ["portal-deliverables", clientId],
    queryFn: async () => {
      // Get all deliverables for client's projects
      const snap = await getDocs(collection(db, "project_deliverables"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ProjectDeliverable[];
    },
    enabled: !!clientId,
  });

  // 4. Invoices
  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["portal-invoices", clientId],
    queryFn: async () => {
      const q = query(collection(db, "invoices"), where("client_id", "==", clientId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Invoice[];
    },
    enabled: !!clientId,
  });

  const pendingApprovals = deliverables.filter((d) => d.status === "pending_review");
  const pendingQuotes = quotations.filter((q) => q.status === "sent");
  const unpaidInvoices = invoices.filter((i) => i.status !== "paid");
  const activeProjects = projects.filter((p) => p.status === "in_progress");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-[#4A0E17] via-[#5C131E] to-[#2D0A10] rounded-2xl p-6 sm:p-8 text-[#FAF7F2] shadow-md border border-[#7A1B28]/30 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F7EFE4] text-xs font-medium border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            Verified ASARR Client Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
          </h1>
          <p className="text-[#F3EDE2]/90 text-sm sm:text-base leading-relaxed">
            Track your digital product delivery, review creative and software milestones, approve sprint deliverables, and manage invoices securely.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Active Projects
            </CardTitle>
            <FolderKanban className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">In active development</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pending Approvals
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
              {pendingApprovals.length > 0 ? "Awaiting your review" : "All caught up"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pending Quotes
            </CardTitle>
            <FileCheck2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingQuotes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">New project addendums</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Outstanding Invoices
            </CardTitle>
            <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidInvoices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for online settlement</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Projects & Deliverables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Project Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Current Projects & Delivery</h2>
            <Link to="/portal/projects" className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-2 border-border/80">
                <FolderKanban className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-foreground">Your projects will appear here.</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  No active projects yet. Your assigned projects and live deliverables will display here.
                </p>
              </Card>
            ) : (
              projects.map((project) => (
              <Card key={project.id} className="overflow-hidden border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[11px] font-normal border-primary/20 text-primary">
                          {project.category || "Web App"}
                        </Badge>
                        <Badge
                          variant={project.status === "completed" ? "default" : "secondary"}
                          className="text-[11px]"
                        >
                          {project.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-semibold">{project.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2 mt-1">
                        {project.description}
                      </CardDescription>
                    </div>

                    {project.staging_url && (
                      <a
                        href={project.staging_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-accent text-primary font-medium hover:bg-accent/80 shrink-0 border border-primary/20"
                      >
                        Preview Staging <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Milestone Progress</span>
                      <span className="font-semibold text-foreground">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" /> Target Delivery: {project.due_date ? new Date(project.due_date).toLocaleDateString() : "TBD"}
                    </span>
                    <Link
                      to="/portal/projects"
                      className="font-medium text-primary hover:underline"
                    >
                      View Milestones →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          </div>
        </div>

        {/* Right Col: Items Needing Attention */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Awaiting Your Action</h2>
            <Link to="/portal/approvals" className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
              Review all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {pendingApprovals.length === 0 ? (
              <Card className="p-6 text-center text-xs text-muted-foreground border-border/80">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
                No pending deliverable reviews. All sprint items are up to date!
              </Card>
            ) : (
              pendingApprovals.map((item) => (
                <Card key={item.id} className="p-4 border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        {item.deliverable_type} • {item.version}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground mt-0.5">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link to="/portal/approvals" className="w-full">
                      <Button size="sm" className="w-full text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                        Review & Approve
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}

            {/* Quick Quotation Card */}
            {pendingQuotes.map((q) => (
              <Card key={q.id} className="p-4 border-primary/30 bg-accent/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  New Quotation: {q.quote_number}
                </span>
                <h3 className="text-sm font-semibold text-foreground mt-0.5">{q.title}</h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                  <span>Total Amount:</span>
                  <span className="font-bold text-foreground">₹{q.total_amount.toLocaleString("en-IN")}</span>
                </div>
                <Link to="/portal/quotes" className="mt-3 block">
                  <Button size="sm" variant="outline" className="w-full text-xs h-8 border-primary/30 text-primary hover:bg-primary/10">
                    Review Quotation
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

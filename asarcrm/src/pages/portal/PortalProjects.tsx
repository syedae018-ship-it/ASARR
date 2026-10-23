import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/database";
import { collection, query, where, getDocs } from "@/lib/database";
import { Project, ProjectMilestone } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, ExternalLink, Milestone } from "lucide-react";

export default function PortalProjects() {
  const { clientId } = useAuth();

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["portal-projects-detailed", clientId],
    queryFn: async () => {
      const q = query(collection(db, "projects"), where("client_id", "==", clientId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Project[];
    },
    enabled: !!clientId,
  });

  const { data: milestones = [] } = useQuery<ProjectMilestone[]>({
    queryKey: ["portal-milestones", clientId],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "project_milestones"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ProjectMilestone[];
    },
    enabled: !!clientId,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assigned Projects & Milestones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed sprint roadmaps, staging environments, and milestone delivery schedules managed by ASARR.
        </p>
      </div>

      <div className="space-y-8">
        {projects.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-border/80">
            <Milestone className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">Your projects will appear here.</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Once the ASARR engineering team schedules your sprints and assigns projects to your organization, they will be listed here.
            </p>
          </Card>
        ) : (
          projects.map((project) => {
            const projectMilestones = milestones.filter((m) => m.project_id === project.id);

          return (
            <Card key={project.id} className="border-border/80 shadow-sm">
              <CardHeader className="border-b border-border/50 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{project.category || "Web App"}</Badge>
                      <Badge
                        variant={project.status === "completed" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {project.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription className="mt-1 text-sm">{project.description}</CardDescription>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {project.staging_url && (
                      <a
                        href={project.staging_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-accent text-primary font-medium hover:bg-accent/80 border border-primary/20"
                      >
                        Staging URL <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {project.production_url && (
                      <a
                        href={project.production_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-500/20 border border-emerald-500/30"
                      >
                        Production URL <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Overall Completion</span>
                    <span className="font-semibold text-foreground">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground">
                  <Milestone className="w-4 h-4 text-primary" />
                  <span>Delivery Milestones</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projectMilestones.length === 0 ? (
                    <div className="col-span-full p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                      Milestones will be added soon.
                    </div>
                  ) : (
                    projectMilestones.map((milestone, idx) => (
                    <div
                      key={milestone.id}
                      className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-semibold text-muted-foreground">Milestone {idx + 1}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              milestone.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                : milestone.status === "in_progress"
                                ? "bg-accent text-primary border border-primary/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {milestone.status.replace("_", " ")}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">{milestone.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                          {milestone.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : "TBD"}
                        </span>
                        {milestone.status === "completed" ? (
                          <span className="text-emerald-600 flex items-center gap-1 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Done
                          </span>
                        ) : (
                          <span className="text-indigo-600 flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
      </div>
    </div>
  );
}

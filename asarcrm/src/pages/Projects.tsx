import { useState } from "react";
import { Plus, Trash2, Pencil, ChevronRight, Globe, Lock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ProjectImageGallery } from "@/components/dashboard/ProjectImageGallery";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, getDoc } from "@/lib/database";

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  due_date: string | null;
  budget: number | null;
  description: string | null;
  portfolio_description: string | null;
  is_public: boolean;
  client_id: string | null;
  clients?: { name: string; company: string } | null;
  created_at?: string;
}

interface ProjectFormData {
  id?: string;
  name: string;
  client_id: string;
  status: string;
  progress: number;
  due_date: string;
  budget: string;
  description: string;
  portfolio_description: string;
  is_public: boolean;
}

const initialFormData: ProjectFormData = {
  name: '', client_id: '', status: 'active', progress: 0, due_date: '', budget: '', description: '', portfolio_description: '', is_public: false
};

const statusColors = {
  active: "bg-success/20 text-success",
  completed: "bg-primary/20 text-primary",
  "on-hold": "bg-warning/20 text-warning",
};

const milestones = [
  { value: 0, label: "Not Started" },
  { value: 25, label: "Planning" },
  { value: 50, label: "In Progress" },
  { value: 75, label: "Review" },
  { value: 100, label: "Complete" },
];

export default function Projects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(
        collection(db, "projects"),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);

      const projectsWithClients = await Promise.all(snapshot.docs.map(async (projectDoc) => {
        const data = projectDoc.data();
        let clientData = { name: "Unknown", company: "No client" };
        if (data.client_id) {
          const clientSnap = await getDoc(doc(db, "clients", data.client_id));
          if (clientSnap.exists()) {
            clientData = clientSnap.data() as any;
          }
        }
        return {
          id: projectDoc.id,
          ...data,
          clients: clientData
        };
      }));

      return projectsWithClients as Project[];
    },
    enabled: !!user
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(collection(db, "clients"), orderBy("name"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as { id: string; name: string; company?: string }[];
    },
    enabled: !!user
  });

  const saveProject = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const projectData = {
        name: data.name,
        client_id: data.client_id || null,
        status: data.status,
        progress: data.progress,
        due_date: data.due_date || null,
        budget: data.budget ? parseFloat(data.budget) : null,
        description: data.description || null,
        portfolio_description: data.portfolio_description || null,
        is_public: data.is_public,
        user_id: user?.id,
        updated_at: new Date().toISOString()
      };

      if (isEditing && data.id) {
        await updateDoc(doc(db, "projects", data.id), projectData);
      } else {
        await addDoc(collection(db, "projects"), {
          ...projectData,
          created_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDialogOpen(false);
      setFormData(initialFormData);
      setIsEditing(false);
      toast.success(isEditing ? "Project updated" : "Project created");
    },
    onError: (error: any) => {
      toast.error("Failed to save project: " + error.message);
    }
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "projects", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success("Project deleted");
    },
    onError: (error: any) => {
      toast.error("Failed to delete project: " + error.message);
    }
  });

  const updateProgress = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      await updateDoc(doc(db, "projects", id), {
        progress,
        status: progress === 100 ? 'completed' : 'active',
        updated_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success("Progress updated");
    }
  });

  const openEditDialog = (project: Project) => {
    setFormData({
      id: project.id,
      name: project.name,
      client_id: project.client_id || '',
      status: project.status,
      progress: project.progress || 0,
      due_date: project.due_date ? project.due_date.split('T')[0] : '',
      budget: project.budget ? project.budget.toString() : '',
      description: project.description || '',
      portfolio_description: project.portfolio_description || '',
      is_public: project.is_public || false
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Projects"
        description="Manage client projects and track milestone deliverables."
        action={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setFormData(initialFormData); setIsEditing(false); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />New Project</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Project" : "Create New Project"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); saveProject.mutate(formData); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., E-Commerce Redesign" required className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select value={formData.client_id} onValueChange={(v) => setFormData({ ...formData, client_id: v })}>
                    <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ""}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Progress: {formData.progress}%</Label>
                  <Slider value={[formData.progress]} onValueChange={([v]) => setFormData({ ...formData, progress: v })} max={100} step={5} className="py-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {milestones.map((m) => (<span key={m.value} className={cn(formData.progress >= m.value && "text-primary font-medium")}>{m.label}</span>))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Budget (₹)</Label>
                    <Input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="0.00" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="bg-muted/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description (internal)</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Internal project notes..." className="bg-muted/50 min-h-[60px]" />
                </div>

                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Public Portfolio</Label>
                      <p className="text-sm text-muted-foreground">Show this project on your public portfolio</p>
                    </div>
                    <Switch checked={formData.is_public} onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })} />
                  </div>
                  {formData.is_public && (
                    <div className="space-y-2 animate-fade-in">
                      <Label>Portfolio Description</Label>
                      <Textarea
                        value={formData.portfolio_description}
                        onChange={(e) => setFormData({ ...formData, portfolio_description: e.target.value })}
                        placeholder="Describe this project for your public portfolio..."
                        className="bg-muted/50 min-h-[80px]"
                      />
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={saveProject.isPending}>
                  {saveProject.isPending ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {projects.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">Create your first project to get started.</p>
          <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />New Project</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div key={project.id} className="glass rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", statusColors[project.status as keyof typeof statusColors])}>
                        {project.status}
                      </span>
                      {project.is_public ? (
                        <span title="Public"><Globe className="w-4 h-4 text-success" /></span>
                      ) : (
                        <span title="Private"><Lock className="w-4 h-4 text-muted-foreground" /></span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{project.clients?.company || "No client"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProjectImageGallery projectId={project.id} projectName={project.name} />
                    <button onClick={() => openEditDialog(project)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteProject.mutate(project.id)} className="p-2 rounded-lg hover:bg-destructive/20 transition-colors text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                      <ChevronRight className={cn("w-4 h-4 transition-transform", expandedProject === project.id && "rotate-90")} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{project.progress || 0}%</span>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                  <div className="flex justify-between">
                    {milestones.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => updateProgress.mutate({ id: project.id, progress: m.value })}
                        className={cn(
                          "text-xs px-2 py-1 rounded transition-colors",
                          (project.progress || 0) >= m.value ? "text-primary font-medium bg-primary/10" : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {expandedProject === project.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="ml-2 font-medium text-foreground">{project.budget ? `₹${Number(project.budget).toLocaleString('en-IN')}` : '-'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="ml-2 font-medium text-foreground">{project.due_date ? format(new Date(project.due_date), 'MMM d, yyyy') : '-'}</span>
                      </div>
                    </div>
                    {project.description && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Description:</span>
                        <p className="mt-1 text-foreground">{project.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

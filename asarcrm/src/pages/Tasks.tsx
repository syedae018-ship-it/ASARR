import { useState, useMemo } from "react";
import { Plus, Trash2, CheckCircle2, Clock, Users, User, AlertCircle, Filter } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, isPast, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, getDoc } from "@/lib/database";
import { AdminMembership } from "@/types";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status?: string;
  completed: boolean;
  user_id: string;
  assigned_to?: string;
  assigned_name?: string;
  is_group_task?: boolean;
  due_date?: string | null;
  projects?: { name: string } | null;
}

const priorityColors: Record<string, string> = {
  urgent: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 font-bold",
  high: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  medium: "bg-primary/10 text-primary border border-primary/20",
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function Tasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "mine" | "team" | "overdue" | "done">("mine");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    project_id: "",
    priority: "medium",
    assigned_to: "",
    is_group_task: false,
    due_date: ""
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["admin_memberships"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "admin_memberships"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as AdminMembership[];
    }
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(
        collection(db, "tasks"),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);

      const tasksWithProjects = await Promise.all(snapshot.docs.map(async (taskDoc) => {
        const data = taskDoc.data();
        let projectName = "General Task";
        if (data.project_id) {
          const pSnap = await getDoc(doc(db, "projects", data.project_id));
          if (pSnap.exists()) {
            projectName = pSnap.data().name;
          }
        }
        return {
          id: taskDoc.id,
          ...data,
          projects: { name: projectName }
        };
      }));

      return tasksWithProjects as Task[];
    },
    enabled: !!user
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects-list", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(collection(db, "projects"), orderBy("name"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, name: d.data().name }));
    },
    enabled: !!user
  });

  const createTask = useMutation({
    mutationFn: async () => {
      if (!user?.id || !newTask.title.trim()) return;

      const assignedMember = teamMembers.find(m => m.user_id === newTask.assigned_to);

      await addDoc(collection(db, "tasks"), {
        user_id: user.id,
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        project_id: newTask.project_id || null,
        priority: newTask.priority,
        assigned_to: newTask.assigned_to || user.id,
        assigned_name: assignedMember?.full_name || user.email?.split("@")[0] || "Admin",
        is_group_task: newTask.is_group_task,
        status: "todo",
        due_date: newTask.due_date || null,
        completed: false,
        created_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
      setNewTask({
        title: "",
        description: "",
        project_id: "",
        priority: "medium",
        assigned_to: "",
        is_group_task: false,
        due_date: ""
      });
      toast.success("Task created and assigned!");
    },
    onError: (error) => {
      toast.error("Failed to create task");
      console.error(error);
    }
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      await updateDoc(doc(db, "tasks", id), {
        completed: !completed,
        status: !completed ? "done" : "todo",
        updated_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "tasks", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    }
  });

  // Filter Tasks by Active Tab
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (activeTab === "done") return t.completed;
      if (t.completed && activeTab !== "all") return false;

      if (activeTab === "mine") {
        return t.assigned_to === user?.id || (!t.assigned_to && t.user_id === user?.id);
      }
      if (activeTab === "team") {
        return t.is_group_task || t.assigned_to !== user?.id;
      }
      if (activeTab === "overdue") {
        return t.due_date && isPast(parseISO(t.due_date)) && !t.completed;
      }
      return true; // "all"
    });
  }, [tasks, activeTab, user]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Tasks"
        subtitle="Coordinate individual assignments and shared agency deliverables across team members."
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createTask.mutate(); }} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs">Task Title *</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Design homepage hero mockups"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Assignee</Label>
                <Select
                  value={newTask.assigned_to}
                  onValueChange={(val) => setNewTask({ ...newTask, assigned_to: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to team member..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={user?.id || "admin"}>Assigned to Me (Self)</SelectItem>
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.user_id}>
                        {m.full_name || m.email} ({m.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(val) => setNewTask({ ...newTask, priority: val })}
                  >
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
                  <Label className="text-xs">Due Date</Label>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Related Project</Label>
                <Select
                  value={newTask.project_id}
                  onValueChange={(val) => setNewTask({ ...newTask, project_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project (optional)..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <Label className="text-xs font-semibold">Shared Group Task</Label>
                  <p className="text-[11px] text-muted-foreground">Visible to the whole agency team</p>
                </div>
                <Switch
                  checked={newTask.is_group_task}
                  onCheckedChange={(checked) => setNewTask({ ...newTask, is_group_task: checked })}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2"
                disabled={createTask.isPending}
              >
                {createTask.isPending ? "Creating..." : "Save & Assign Task"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-5 h-auto gap-1 bg-muted/70 p-1 rounded-xl">
          <TabsTrigger value="mine" className="gap-1.5 rounded-lg data-[state=active]:bg-card text-xs py-2">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">My Tasks ({tasks.filter(t => !t.completed && (t.assigned_to === user?.id || (!t.assigned_to && t.user_id === user?.id))).length})</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 rounded-lg data-[state=active]:bg-card text-xs py-2">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Team ({tasks.filter(t => !t.completed && (t.is_group_task || t.assigned_to !== user?.id)).length})</span>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="gap-1.5 rounded-lg data-[state=active]:bg-card text-xs py-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">Overdue</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5 rounded-lg data-[state=active]:bg-card text-xs py-2">
            <span className="truncate">All Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="done" className="gap-1.5 rounded-lg data-[state=active]:bg-card text-xs py-2 col-span-2 sm:col-span-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">Completed</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="glass rounded-xl p-8 sm:p-10 text-center text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
            <p className="font-medium text-foreground">No tasks in this view</p>
            <p className="text-xs mt-1">All clear or no tasks match this filter tab.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all bg-card/60 hover:bg-card shadow-xs",
                task.completed && "opacity-60 bg-muted/20"
              )}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask.mutate({ id: task.id, completed: task.completed })}
                  className="w-4 h-4 mt-0.5 sm:mt-0 rounded text-primary border-border focus:ring-primary cursor-pointer shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className={cn("text-xs sm:text-sm font-semibold text-foreground break-words", task.completed && "line-through text-muted-foreground")}>
                    {task.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span className="font-medium text-foreground/80">{task.projects?.name || "General"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {task.assigned_name || "Admin"}
                    </span>
                    {task.is_group_task && (
                      <>
                        <span>•</span>
                        <span className="text-primary font-medium">Team Shared</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-[10px] font-medium border-0 capitalize", priorityColors[task.priority] || priorityColors.medium)}>
                    {task.priority}
                  </Badge>

                  {task.due_date && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {format(parseISO(task.due_date), "dd MMM")}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => deleteTask.mutate(task.id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors ml-auto sm:ml-0"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

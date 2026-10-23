import { DollarSign, Users, FolderKanban, CheckSquare } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { TaskItem } from "@/components/dashboard/TaskItem";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RevenueChart } from "@/components/dashboard/charts/RevenueChart";
import { ProjectStatusChart } from "@/components/dashboard/charts/ProjectStatusChart";
import { TaskCompletionChart } from "@/components/dashboard/charts/TaskCompletionChart";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, orderBy, limit, getCountFromServer, getDoc, doc } from "@/lib/database";

export default function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: clientsCount = 0 } = useQuery({
    queryKey: ['clients-count', userId],
    queryFn: async () => {
      if (!userId) return 0;
      const coll = collection(db, "clients");
      // For simplicity in this demo, we might get all clients or just count. 
      // Firestore count requires a specific query if we want to filter by user_id
      const q = query(coll, where("user_id", "==", userId));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    },
    enabled: !!userId
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-summary', userId],
    queryFn: async () => {
      if (!userId) return [];
      const q = query(
        collection(db, "projects"),
        where("user_id", "==", userId),
        orderBy("created_at", "desc"),
        limit(3)
      );
      const snapshot = await getDocs(q);

      // We need to fetch client names manually for join-like behavior
      const projectsWithClients = await Promise.all(snapshot.docs.map(async (projectDoc) => {
        const data = projectDoc.data();
        let clientData = { company: "No client" };
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
      return projectsWithClients as any[];
    },
    enabled: !!userId
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ['projects-all', userId],
    queryFn: async () => {
      if (!userId) return [];
      const q = query(collection(db, "projects"), where("user_id", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data());
    },
    enabled: !!userId
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-summary', userId],
    queryFn: async () => {
      if (!userId) return [];
      const q = query(
        collection(db, "tasks"),
        where("user_id", "==", userId),
        where("completed", "==", false),
        orderBy("created_at", "desc"),
        limit(4)
      );
      const snapshot = await getDocs(q);

      const tasksWithProjects = await Promise.all(snapshot.docs.map(async (taskDoc) => {
        const data = taskDoc.data();
        let projectData = { name: "No project" };
        if (data.project_id) {
          const pSnap = await getDoc(doc(db, "projects", data.project_id));
          if (pSnap.exists()) {
            projectData = pSnap.data() as any;
          }
        }
        return {
          id: taskDoc.id,
          ...data,
          projects: projectData
        };
      }));
      return tasksWithProjects as any[];
    },
    enabled: !!userId
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks-all', userId],
    queryFn: async () => {
      if (!userId) return [];
      const q = query(collection(db, "tasks"), where("user_id", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data());
    },
    enabled: !!userId
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices-summary', userId],
    queryFn: async () => {
      if (!userId) return [];
      const q = query(collection(db, "invoices"), where("user_id", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data());
    },
    enabled: !!userId
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events-summary', userId],
    queryFn: async () => {
      if (!userId) return [];
      const q = query(collection(db, "events"), where("user_id", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((item) => item.data());
    },
    enabled: !!userId
  });

  const { data: outreachLogs = [] } = useQuery({
    queryKey: ['telecalling-logs-summary'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "telecalling_call_logs"));
      return snap.docs.map(d => d.data());
    }
  });

  const { data: outreachContacts = [] } = useQuery({
    queryKey: ['telecalling-contacts-summary'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "telecalling_contacts"));
      return snap.docs.map(d => d.data());
    }
  });

  const totalRevenue = invoices
    .filter((i: any) => i.status === 'paid')
    .reduce((sum: number, i: any) => sum + Number(i.amount), 0);

  const activeProjects = allProjects.filter((p: any) => p.status === 'active' || p.status === 'in_progress').length;
  const completedTasks = allTasks.filter((t: any) => t.completed || t.status === 'done').length;
  const completionRate = allTasks.length > 0
    ? Math.round((completedTasks / allTasks.length) * 100)
    : 0;

  const metrics = [
    { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, change: "From paid invoices", changeType: "positive" as const, icon: DollarSign },
    { title: "Active Clients", value: String(clientsCount), change: "Total clients", changeType: "neutral" as const, icon: Users },
    { title: "Active Projects", value: String(activeProjects), change: `${allProjects.length} total`, changeType: "neutral" as const, icon: FolderKanban },
    { title: "Completed Tasks", value: String(completedTasks), change: `${completionRate}% completion rate`, changeType: "positive" as const, icon: CheckSquare },
  ];

  const calendarEvents = [
    ...events.filter((event: any) => event.event_date || event.start_time).map((event: any) => ({
      id: `event-${event.id}`,
      title: event.title,
      date: new Date(event.event_date ? `${event.event_date}T00:00:00` : event.start_time),
      type: event.event_type === 'deadline' ? 'deadline' as const : 'meeting' as const,
    })),
    ...allTasks.filter((task: any) => task.due_date && !task.completed && task.status !== 'done').map((task: any) => ({
      id: `task-${task.id}`,
      title: task.title,
      date: new Date(task.due_date.includes('T') ? task.due_date : `${task.due_date}T00:00:00`),
      type: 'task' as const,
    })),
    ...allProjects.filter((project: any) => project.due_date && project.status !== 'completed').map((project: any) => ({
      id: `project-${project.id}`,
      title: `${project.name} due`,
      date: new Date(project.due_date.includes('T') ? project.due_date : `${project.due_date}T00:00:00`),
      type: 'deadline' as const,
    })),
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening today."
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} delay={index * 100} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart invoices={invoices} />
        </div>
        <ProjectStatusChart projects={allProjects} />
      </div>

      {/* Stats + Task Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <StatCard label="Total Projects" value={String(allProjects.length)} trend="neutral" trendValue="" delay={350} />
            <StatCard label="Pending Tasks" value={String(allTasks.length - completedTasks)} trend="neutral" trendValue="" delay={400} />
            <StatCard label="Pending Invoices" value={String(invoices.filter(i => i.status === 'pending').length)} trend="neutral" trendValue="" delay={450} />
            <StatCard label="Outreach Calls" value={String(outreachLogs.length)} trend="up" trendValue="Calls" delay={500} />
            <StatCard label="Leads Converted" value={String(outreachContacts.filter(c => c.status === 'converted').length)} trend="up" trendValue="Won" delay={550} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <TaskCompletionChart tasks={allTasks} />
        </div>
      </div>

      {/* Calendar + Projects + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <DashboardCalendar events={calendarEvents} />

        {/* Recent Projects */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Projects</h2>
          {projects.length === 0 ? (
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-muted-foreground">No projects yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  name={project.name}
                  client={project.clients?.company || "No client"}
                  status={project.status}
                  progress={project.progress || 0}
                  dueDate={project.due_date ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                  delay={500 + index * 100}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Pending Tasks</h2>
          {tasks.length === 0 ? (
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-muted-foreground">No pending tasks. Add some to track your work!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  title={task.title}
                  project={task.projects?.name || "No project"}
                  priority={task.priority}
                  completed={task.completed}
                  delay={500 + index * 100}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

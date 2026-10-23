import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TaskCompletionChartProps {
  tasks: Array<{ priority?: string; completed?: boolean }>;
}

export function TaskCompletionChart({ tasks }: TaskCompletionChartProps) {
  const data = ['high', 'medium', 'low'].map((priority) => ({
    priority: priority[0].toUpperCase() + priority.slice(1),
    completed: tasks.filter((task) => task.priority === priority && task.completed).length,
    pending: tasks.filter((task) => task.priority === priority && !task.completed).length,
  }));

  return (
    <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
      <h3 className="text-lg font-semibold text-foreground mb-1">Task completion</h3>
      <p className="text-sm text-muted-foreground mb-4">Completed and pending work by priority</p>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="priority" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(var(--border))', borderRadius: '10px', color: 'hsl(var(--foreground))' }} />
            <Bar dataKey="completed" fill="hsl(160, 65%, 40%)" radius={[4, 4, 0, 0]} name="Completed" />
            <Bar dataKey="pending" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

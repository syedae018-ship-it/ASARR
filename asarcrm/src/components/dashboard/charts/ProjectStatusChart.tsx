import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ProjectStatusChartProps {
  projects: Array<{ status?: string }>;
}

export function ProjectStatusChart({ projects }: ProjectStatusChartProps) {
  const data = [
    { name: 'Active', value: projects.filter((project) => project.status === 'active').length, color: 'hsl(160, 65%, 40%)' },
    { name: 'On hold', value: projects.filter((project) => project.status === 'on-hold').length, color: 'hsl(38, 85%, 55%)' },
    { name: 'Completed', value: projects.filter((project) => project.status === 'completed').length, color: 'hsl(var(--primary))' },
  ];

  return (
    <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
      <h3 className="text-lg font-semibold text-foreground mb-1">Project status</h3>
      <p className="text-sm text-muted-foreground">Live distribution across your projects</p>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={78} paddingAngle={4} dataKey="value">
              {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(var(--border))', borderRadius: '10px', color: 'hsl(var(--foreground))' }} formatter={(value: number) => [`${value} projects`, '']} />
            <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

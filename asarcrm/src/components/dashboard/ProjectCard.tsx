import { cn } from "@/lib/utils";

interface ProjectCardProps {
  name: string;
  client: string;
  status: "active" | "completed" | "on-hold";
  progress: number;
  dueDate: string;
  delay?: number;
}

const statusStyles = {
  active: "bg-success/20 text-success",
  completed: "bg-info/20 text-info",
  "on-hold": "bg-warning/20 text-warning",
};

const statusLabels = {
  active: "Active",
  completed: "Completed",
  "on-hold": "On Hold",
};

export function ProjectCard({ name, client, status, progress, dueDate, delay = 0 }: ProjectCardProps) {
  return (
    <div 
      className="glass rounded-xl p-5 hover-lift animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{client}</p>
        </div>
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusStyles[status])}>
          {statusLabels[status]}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Due: {dueDate}</span>
      </div>
    </div>
  );
}

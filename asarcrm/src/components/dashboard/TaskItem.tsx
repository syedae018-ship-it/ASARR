import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  title: string;
  project: string;
  priority: "high" | "medium" | "low";
  completed?: boolean;
  delay?: number;
}

const priorityStyles = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-warning/20 text-warning",
  low: "bg-muted text-muted-foreground",
};

export function TaskItem({ title, project, priority, completed = false, delay = 0 }: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(completed);

  return (
    <div 
      className="flex items-center gap-4 p-4 glass rounded-xl hover-lift animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={() => setIsCompleted(!isCompleted)}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          isCompleted 
            ? "bg-success border-success" 
            : "border-muted-foreground hover:border-primary"
        )}
      >
        {isCompleted ? (
          <Check className="w-4 h-4 text-success-foreground" />
        ) : (
          <Circle className="w-4 h-4 text-transparent" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-foreground transition-all",
          isCompleted && "line-through text-muted-foreground"
        )}>
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{project}</p>
      </div>

      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium capitalize", priorityStyles[priority])}>
        {priority}
      </span>
    </div>
  );
}

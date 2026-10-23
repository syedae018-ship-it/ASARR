import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  delay?: number;
}

export function StatCard({ label, value, trend, trendValue, delay = 0 }: StatCardProps) {
  return (
    <div 
      className="p-4 rounded-lg bg-muted/30 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        <div className={cn(
          "flex items-center gap-1 text-sm",
          trend === "up" && "text-success",
          trend === "down" && "text-destructive",
          trend === "neutral" && "text-muted-foreground"
        )}>
          {trend === "up" && <TrendingUp className="w-4 h-4" />}
          {trend === "down" && <TrendingDown className="w-4 h-4" />}
          {trend === "neutral" && <Minus className="w-4 h-4" />}
          <span>{trendValue}</span>
        </div>
      </div>
    </div>
  );
}

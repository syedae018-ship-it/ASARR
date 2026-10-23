import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "deadline" | "task" | "meeting";
}

interface DashboardCalendarProps {
  events?: CalendarEvent[];
}

const eventTypeColors = {
  deadline: "bg-destructive/80",
  task: "bg-primary/80",
  meeting: "bg-info/80",
};

export function DashboardCalendar({ events = [] }: DashboardCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startPadding = monthStart.getDay();
  const paddedDays = [...Array(startPadding).fill(null), ...days];

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {paddedDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayEvents = getEventsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-colors relative",
                !isSameMonth(day, currentMonth) && "text-muted-foreground/50",
                isToday(day) && "bg-primary/20",
                isSelected && "ring-2 ring-primary",
                "hover:bg-muted"
              )}
            >
              <span className={cn(
                "text-sm",
                isToday(day) && "font-bold text-primary"
              )}>
                {format(day, "d")}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={cn("w-1.5 h-1.5 rounded-full", eventTypeColors[event.type])}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">
            {format(selectedDate, "MMMM d, yyyy")}
          </h4>
          {selectedEvents.length > 0 ? (
            <div className="space-y-2">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <div className={cn("w-2 h-2 rounded-full", eventTypeColors[event.type])} />
                  <span className="text-sm text-foreground">{event.title}</span>
                  <span className="text-xs text-muted-foreground capitalize ml-auto">
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No events for this date</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive/80" />
          <span className="text-xs text-muted-foreground">Deadline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/80" />
          <span className="text-xs text-muted-foreground">Task</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-info/80" />
          <span className="text-xs text-muted-foreground">Meeting</span>
        </div>
      </div>
    </div>
  );
}

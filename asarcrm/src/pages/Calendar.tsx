import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, getDoc } from "@/lib/database";

const eventTypeColors: Record<string, string> = {
  deadline: "bg-destructive text-destructive-foreground",
  task: "bg-primary text-primary-foreground",
  meeting: "bg-info text-info-foreground",
  shoot: "bg-rose-800 text-white",
  call: "bg-emerald-600 text-white",
  internal: "bg-amber-600 text-white",
};

const eventTypeBorders: Record<string, string> = {
  deadline: "border-l-destructive",
  task: "border-l-primary",
  meeting: "border-l-info",
  shoot: "border-l-rose-800",
  call: "border-l-emerald-600",
  internal: "border-l-amber-600",
};

interface EventFormData {
  id?: string;
  title: string;
  event_type: string;
  description: string;
  project_id: string;
  event_date?: Date;
}

const initialFormData: EventFormData = {
  title: "",
  event_type: "meeting",
  description: "",
  project_id: "",
};

export default function Calendar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(
        collection(db, "events"),
        orderBy("event_date", "asc")
      );
      const snapshot = await getDocs(q);

      const eventsWithProjects = await Promise.all(snapshot.docs.map(async (eventDoc) => {
        const data = eventDoc.data();
        let projectName = null;
        if (data.project_id) {
          const pSnap = await getDoc(doc(db, "projects", data.project_id));
          if (pSnap.exists()) {
            projectName = pSnap.data().name;
          }
        }
        return {
          id: eventDoc.id,
          ...data,
          projects: projectName ? { name: projectName } : null
        };
      }));

      return eventsWithProjects as any[];
    },
    enabled: !!user
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(collection(db, "projects"), where("user_id", "==", user.id), orderBy("name"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, name: d.data().name }));
    },
    enabled: !!user
  });

  const saveEvent = useMutation({
    mutationFn: async () => {
      if (!user || !formData.event_date || !formData.title.trim()) return;
      const payload = {
        title: formData.title.trim(),
        event_date: format(formData.event_date, 'yyyy-MM-dd'),
        event_type: formData.event_type,
        description: formData.description.trim() || null,
        project_id: formData.project_id || null,
        user_id: user.id
      };
      if (isEditing && formData.id) {
        await updateDoc(doc(db, "events", formData.id), payload);
      } else {
        await addDoc(collection(db, "events"), {
          ...payload,
          created_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(isEditing ? "Event updated" : "Event created");
      closeDialog();
    },
    onError: () => toast.error(isEditing ? "Failed to update event" : "Failed to create event")
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      await deleteDoc(doc(db, "events", eventId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Event deleted");
    }
  });

  const openEditDialog = (event: any) => {
    setFormData({
      id: event.id,
      title: event.title,
      event_type: event.event_type,
      description: event.description || "",
      project_id: event.project_id || "",
      event_date: new Date(event.event_date)
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setIsDialogOpen(false);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date: Date) => events.filter((event) => isSameDay(new Date(event.event_date), date));
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const upcomingEvents = events
    .filter((event) => new Date(event.event_date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <PageHeader title="Calendar" description="View project deadlines and upcoming events." />
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Calendar"
        description="View project deadlines and upcoming events."
        action={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" />Add Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Event" : "Add Event"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Event title" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.event_date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.event_date ? format(formData.event_date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker mode="single" selected={formData.event_date} onSelect={(d) => setFormData({ ...formData, event_date: d })} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Client Meeting</SelectItem>
                      <SelectItem value="shoot">Content Shoot / Production</SelectItem>
                      <SelectItem value="call">Outreach / Follow-Up Call</SelectItem>
                      <SelectItem value="deadline">Project Deadline</SelectItem>
                      <SelectItem value="internal">Internal Team Sync</SelectItem>
                      <SelectItem value="task">General Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Project (optional)</Label>
                  <Select value={formData.project_id} onValueChange={(v) => setFormData({ ...formData, project_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (<SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Add details..." />
                </div>
                <Button onClick={() => saveEvent.mutate()} disabled={!formData.title.trim() || !formData.event_date} className="w-full">
                  {isEditing ? "Update Event" : "Create Event"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-foreground">{format(currentMonth, "MMMM yyyy")}</h3>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
              <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-muted-foreground">Today</button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronRight className="w-5 h-5 text-muted-foreground" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-3">{day.slice(0, 3)}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayEvents = getEventsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn("min-h-[100px] rounded-lg p-2 flex flex-col items-start transition-colors text-left", !isCurrentMonth && "opacity-40", isToday(day) && "bg-primary/10", isSelected && "ring-2 ring-primary bg-muted/50", !isSelected && "hover:bg-muted/30")}
                >
                  <span className={cn("text-sm font-medium mb-1", isToday(day) && "text-primary font-bold", !isCurrentMonth && "text-muted-foreground")}>{format(day, "d")}</span>
                  <div className="space-y-1 w-full">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div key={event.id} className={cn("text-xs px-1.5 py-0.5 rounded truncate w-full", eventTypeColors[event.event_type as keyof typeof eventTypeColors])}>{event.title}</div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-xs text-muted-foreground px-1">+{dayEvents.length - 2} more</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-xl p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">{selectedDate ? format(selectedDate, "EEEE, MMM d") : "Select a date"}</h3>
            {selectedEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedEvents.map((event) => (
                  <div key={event.id} className={cn("p-3 rounded-lg bg-muted/50 border-l-4 group relative", eventTypeBorders[event.event_type as keyof typeof eventTypeBorders])}>
                    <p className="font-medium text-foreground text-sm pr-12">{event.title}</p>
                    {event.projects?.name && <p className="text-xs text-muted-foreground mt-1">{event.projects.name}</p>}
                    {event.description && <p className="text-xs text-muted-foreground mt-1">{event.description}</p>}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditDialog(event)} className="text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteEvent.mutate(event.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No events scheduled</p>
            )}
          </div>
          <div className="glass rounded-xl p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming</h3>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", eventTypeColors[event.event_type as keyof typeof eventTypeColors].split(' ')[0])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(event.event_date), "MMM d, yyyy")}</p>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && <p className="text-sm text-muted-foreground">No upcoming events</p>}
            </div>
          </div>
          <div className="glass rounded-xl p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-sm font-semibold text-foreground mb-3">Event Types</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-destructive" /><span className="text-sm text-muted-foreground">Deadline</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary" /><span className="text-sm text-muted-foreground">Task</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-info" /><span className="text-sm text-muted-foreground">Meeting</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

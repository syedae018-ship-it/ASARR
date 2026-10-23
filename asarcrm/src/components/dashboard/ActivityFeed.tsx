import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Eye, Mail, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, orderBy, limit, getDoc, doc } from "@/lib/database";

interface Activity {
  id: string;
  activity_type: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  projects?: { name: string } | null;
  clients?: { name: string; company: string } | null;
}

const activityIcons = {
  project_viewed: Eye,
  invoice_viewed: FileText,
  invoice_paid: CheckCircle,
  project_update: AlertCircle,
  email_sent: Mail,
  deadline_reminder: Clock,
};

const activityColors = {
  project_viewed: "bg-primary/20 text-primary",
  invoice_viewed: "bg-warning/20 text-warning",
  invoice_paid: "bg-success/20 text-success",
  project_update: "bg-accent/20 text-accent-foreground",
  email_sent: "bg-muted text-muted-foreground",
  deadline_reminder: "bg-destructive/20 text-destructive",
};

export function ActivityFeed() {
  const { user } = useAuth();

  const { data: activities = [] } = useQuery({
    queryKey: ['client-activity', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(
        collection(db, "client_activity"),
        where("user_id", "==", user.id),
        orderBy("created_at", "desc"),
        limit(20)
      );
      const snapshot = await getDocs(q);

      const activitiesWithRelations = await Promise.all(snapshot.docs.map(async (actDoc) => {
        const data = actDoc.data();
        let clientData = null;
        let projectData = null;

        if (data.client_id) {
          const cSnap = await getDoc(doc(db, "clients", data.client_id));
          if (cSnap.exists()) clientData = cSnap.data();
        }

        if (data.project_id) {
          const pSnap = await getDoc(doc(db, "projects", data.project_id));
          if (pSnap.exists()) projectData = pSnap.data();
        }

        return {
          id: actDoc.id,
          ...data,
          clients: clientData,
          projects: projectData
        };
      }));

      return activitiesWithRelations as Activity[];
    },
    enabled: !!user
  });

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No activity yet. Activity will appear here when clients interact with your projects and invoices.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.activity_type as keyof typeof activityIcons] || Eye;
          const colorClass = activityColors[activity.activity_type as keyof typeof activityColors] || "bg-muted text-muted-foreground";

          return (
            <div key={activity.id} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", colorClass)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  {activity.clients && <span>{activity.clients.name}</span>}
                  {activity.projects && (
                    <>
                      <span>•</span>
                      <span>{activity.projects.name}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
import { useState } from "react";
import { Bell, Check, X, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc, orderBy, limit, writeBatch } from "@/lib/database";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

const typeIcons = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const typeColors = {
  warning: "text-warning",
  info: "text-primary",
  success: "text-success",
};

export function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(
        collection(db, "notifications"),
        where("user_id", "==", user.id),
        orderBy("created_at", "desc"),
        limit(20)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Notification[];
    },
    enabled: !!user,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await updateDoc(doc(db, "notifications", id), { read: true });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const q = query(
        collection(db, "notifications"),
        where("user_id", "==", user.id),
        where("read", "==", false)
      );
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => {
        batch.update(d.ref, { read: true });
      });
      await batch.commit();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "notifications", id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              className="text-xs h-7"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type as keyof typeof typeIcons] || Info;
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 hover:bg-muted/50 transition-colors relative group",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex gap-3">
                      <Icon className={cn(
                        "w-5 h-5 shrink-0 mt-0.5",
                        typeColors[notification.type as keyof typeof typeColors] || "text-muted-foreground"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead.mutate(notification.id)}
                            className="p-1 rounded hover:bg-muted"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3 text-muted-foreground" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification.mutate(notification.id)}
                          className="p-1 rounded hover:bg-destructive/20"
                          title="Delete"
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </button>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
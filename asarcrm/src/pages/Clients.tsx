import { Plus, Trash2, FileText, MessageSquare, Phone, Mail, Calendar, Building2, Columns, List, ArrowRight } from "lucide-react";
import { ProposalGenerator } from "@/components/lead/ProposalGenerator";
import { format } from "date-fns";
import { ClientCard } from "@/components/dashboard/ClientCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from "@/lib/database";

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  status: string | null;
  projects: { id: string }[];
}

const statusConfig = {
  need_follow_up: { label: "Need Follow Up", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
  waiting_payment: { label: "Waiting Payment", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-600 border-green-200" },
};

export default function Clients() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [newClient, setNewClient] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    notes: '',
    status: 'in_progress'
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [activityNote, setActivityNote] = useState('');
  const [activityType, setActivityType] = useState('call');

  // Fetch client activity
  const { data: activities = [] } = useQuery({
    queryKey: ['client-activity', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient?.id) return [];
      const q = query(
        collection(db, "client_activity"),
        where("client_id", "==", selectedClient.id),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
    enabled: !!selectedClient?.id
  });

  const logActivity = useMutation({
    mutationFn: async () => {
      if (!selectedClient || !user?.id) return;
      await addDoc(collection(db, "client_activity"), {
        user_id: user.id,
        client_id: selectedClient.id,
        activity_type: activityType,
        description: activityNote,
        created_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-activity'] });
      setActivityNote('');
      toast.success("Activity logged");
    },
    onError: () => toast.error("Failed to log activity")
  });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch clients
      const clientsQ = query(
        collection(db, "clients"),
        where("user_id", "==", user.id)
      );
      const clientsSnapshot = await getDocs(clientsQ);

      // Fetch all projects for this user to count per client
      // Optimization: Could index or denormalize, but for now this is fine
      const projectsQ = query(
        collection(db, "projects"),
        where("user_id", "==", user.id)
      );
      const projectsSnapshot = await getDocs(projectsQ);
      const projects = projectsSnapshot.docs.map(d => d.data());

      const clientsData = clientsSnapshot.docs.map(docData => {
        const client = { id: docData.id, ...docData.data() } as any;
        // Find projects for this client
        const clientProjects = projects.filter((p: any) => p.client_id === client.id);
        return {
          ...client,
          projects: clientProjects.map(() => ({ id: 'mock' })) // Just length matters for now based on interface
        };
      });

      return clientsData.sort((a: any, b: any) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      ) as Client[];
    },
    enabled: !!user
  });

  const updateClientStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await updateDoc(doc(db, "clients", id), { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("Client status updated");
    }
  });

  const createClient = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await addDoc(collection(db, "clients"), {
        user_id: user.id,
        name: newClient.name,
        company: newClient.company,
        email: newClient.email,
        phone: newClient.phone || null,
        notes: newClient.notes || null,
        status: newClient.status,
        created_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setOpen(false);
      setNewClient({ name: '', company: '', email: '', phone: '', notes: '', status: 'in_progress' });
      toast.success("Client added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add client");
      console.error(error);
    }
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "clients", id));
    },
    onSuccess: () => {
      if (selectedClient) setSelectedClient(null);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("Client deleted");
    }
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <PageHeader title="Clients" description="View and manage your client relationships." />
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Clients"
        description="View and manage your client relationships."
        action={
          <div className="flex items-center gap-2">
            <div className="bg-muted p-1 rounded-lg flex gap-1 mr-2">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('kanban')}
              >
                <Columns className="h-4 w-4" />
              </Button>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-border">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); createClient.mutate(); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Name</Label>
                      <Input
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        required
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={newClient.company}
                        onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                        required
                        className="bg-muted/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        required
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        className="bg-muted/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newClient.status}
                      onValueChange={(val) => setNewClient({ ...newClient, status: val })}
                    >
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={newClient.notes}
                      onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                      className="bg-muted/50"
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createClient.isPending}>
                    {createClient.isPending ? "Adding..." : "Add Client"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {clients.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">No clients yet</h3>
          <p className="text-muted-foreground mb-4">Add your first client to get started.</p>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client, index) => (
                <div key={client.id} className="relative group flex flex-col h-full">
                  <div
                    className="absolute inset-0 z-0 cursor-pointer rounded-xl"
                    onClick={() => setSelectedClient(client)}
                  />
                  <div className="relative z-10 pointer-events-none"> {/* Wrapper to pass clicks through but allow buttons */}
                    <ClientCard
                      name={client.name}
                      company={client.company}
                      email={client.email}
                      phone={client.phone || '-'}
                      projectCount={client.projects?.length || 0}
                      delay={index * 100}
                    />
                    <div className="absolute top-4 right-4 z-20 flex gap-2 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge variant="outline" className={cn("bg-background",
                        statusConfig[client.status as keyof typeof statusConfig]?.color
                      )}>
                        {statusConfig[client.status as keyof typeof statusConfig]?.label || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto pb-4 gap-6 h-[calc(100vh-200px)]">
              {Object.entries(statusConfig).map(([statusKey, config]) => (
                <div key={statusKey} className="w-[300px] shrink-0 flex flex-col bg-muted/30 rounded-xl border border-border">
                  <div className={`p-3 border-b border-border text-sm font-medium flex items-center gap-2 ${config.color.split(' ')[0]} bg-opacity-20`}>
                    <div className={`w-2 h-2 rounded-full ${config.color.split(' ')[1].replace('text-', 'bg-')}`} />
                    {config.label}
                    <span className="ml-auto text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                      {clients.filter(c => (c.status || 'in_progress') === statusKey).length}
                    </span>
                  </div>
                  <div className="p-3 space-y-3 overflow-y-auto flex-1">
                    {clients.filter(c => (c.status || 'in_progress') === statusKey).map(client => (
                      <div
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className="bg-background border border-border p-3 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-primary/50 group"
                      >
                        <div className="font-medium text-sm text-foreground mb-1">{client.company}</div>
                        <div className="text-xs text-muted-foreground mb-2">{client.name}</div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Email
                          </div>
                          <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Client Detail Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <DialogContent className="glass border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between mr-8">
              <DialogTitle className="text-xl">{selectedClient?.name}</DialogTitle>
              <Select
                value={selectedClient?.status || 'in_progress'}
                onValueChange={(val) => {
                  if (selectedClient) {
                    updateClientStatus.mutate({ id: selectedClient.id, status: val });
                    setSelectedClient({ ...selectedClient, status: val });
                  }
                }}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${config.color.split(' ')[1].replace('text-', 'bg-')}`} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{selectedClient?.company}</p>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{selectedClient?.company}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${selectedClient?.email}`} className="hover:underline text-primary">
                  {selectedClient?.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{selectedClient?.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {selectedClient?.projects.length} Projects
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-border pt-4">
              <Button onClick={() => setIsProposalOpen(true)} className="gap-2 flex-1">
                <FileText className="w-4 h-4" /> Create Proposal
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this client?')) {
                    deleteClient.mutate(selectedClient!.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Activity Log
              </h3>

              <div className="flex gap-2">
                <Select
                  value={activityType}
                  onValueChange={setActivityType}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Log a note..."
                  value={activityNote}
                  onChange={(e) => setActivityNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      logActivity.mutate();
                    }
                  }}
                />
                <Button onClick={() => logActivity.mutate()} disabled={!activityNote || logActivity.isPending}>
                  {logActivity.isPending ? '...' : 'Log'}
                </Button>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {activities.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-4">No activity recorded</div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="text-sm border-l-2 border-primary pl-4 py-1 relative">
                      <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-primary" />
                      <div className="flex justify-between items-start">
                        <span className="font-medium capitalize text-foreground">{activity.activity_type}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1">{activity.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedClient && (
        <ProposalGenerator
          client={selectedClient}
          open={isProposalOpen}
          onOpenChange={setIsProposalOpen}
        />
      )}
    </div>
  );
}
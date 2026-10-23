import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, DollarSign } from "lucide-react";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from "@/lib/database";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_from: number | null;
  price_to: number | null;
  is_active: boolean;
  display_order: number;
}

export default function Services() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price_from: "",
    price_to: "",
    is_active: true,
  });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(
        collection(db, "services"),
        where("user_id", "==", user.id),
        orderBy("display_order")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Service[];
    },
    enabled: !!user,
  });

  const createService = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await addDoc(collection(db, "services"), {
        user_id: user.id,
        name: form.name,
        description: form.description || null,
        price_from: form.price_from ? Number(form.price_from) : null,
        price_to: form.price_to ? Number(form.price_to) : null,
        is_active: form.is_active,
        display_order: services.length,
        created_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      resetForm();
      toast.success("Service created");
    },
    onError: () => toast.error("Failed to create service"),
  });

  const updateService = useMutation({
    mutationFn: async () => {
      if (!editingService) return;
      await updateDoc(doc(db, "services", editingService.id), {
        name: form.name,
        description: form.description || null,
        price_from: form.price_from ? Number(form.price_from) : null,
        price_to: form.price_to ? Number(form.price_to) : null,
        is_active: form.is_active,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      resetForm();
      toast.success("Service updated");
    },
    onError: () => toast.error("Failed to update service"),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "services", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service deleted");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await updateDoc(doc(db, "services", id), { is_active });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });

  const resetForm = () => {
    setOpen(false);
    setEditingService(null);
    setForm({ name: "", description: "", price_from: "", price_to: "", is_active: true });
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description || "",
      price_from: service.price_from?.toString() || "",
      price_to: service.price_to?.toString() || "",
      is_active: service.is_active,
    });
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <PageHeader title="Services" description="Manage the services you offer to clients." />
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Services"
        description="Manage the services you offer to clients."
        action={
          <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); else setOpen(v); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingService) updateService.mutate();
                  else createService.mutate();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Service Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Web Development"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of this service..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price From ($)</Label>
                    <Input
                      type="number"
                      value={form.price_from}
                      onChange={(e) => setForm({ ...form, price_from: e.target.value })}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price To ($)</Label>
                    <Input
                      type="number"
                      value={form.price_to}
                      onChange={(e) => setForm({ ...form, price_to: e.target.value })}
                      placeholder="5000"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active (visible on form)</Label>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createService.isPending || updateService.isPending}
                >
                  {editingService ? "Update Service" : "Create Service"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {services.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">No services yet</h3>
          <p className="text-muted-foreground mb-4">
            Add services that clients can select when submitting the lead form.
          </p>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="glass rounded-xl p-5 flex items-center gap-4 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-foreground">{service.name}</h3>
                  {!service.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      Hidden
                    </span>
                  )}
                </div>
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
                )}
                {(service.price_from || service.price_to) && (
                  <p className="text-sm text-primary mt-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {service.price_from && service.price_to
                      ? `${service.price_from.toLocaleString()} - ${service.price_to.toLocaleString()}`
                      : service.price_from
                        ? `From ${service.price_from.toLocaleString()}`
                        : `Up to ${service.price_to?.toLocaleString()}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={service.is_active}
                  onCheckedChange={(checked) => toggleActive.mutate({ id: service.id, is_active: checked })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(service)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteService.mutate(service.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

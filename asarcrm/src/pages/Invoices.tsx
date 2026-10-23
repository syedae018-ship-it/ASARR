import { useState } from "react";
import { Plus, FileText, DollarSign, Pencil, Trash2, Printer } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { db } from "@/lib/database";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, getDoc } from "@/lib/database";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_date: string | null;
  created_at: string;
  client_id: string | null;
  project_id: string | null;
  clients?: { name: string; company: string } | null;
  projects?: { name: string } | null;
}

interface InvoiceFormData {
  id?: string;
  invoice_number?: string;
  client_id: string;
  project_id: string;
  amount: string;
  due_date?: Date;
}

interface ClientOption {
  id: string;
  name: string;
  company?: string | null;
}

interface ProjectOption {
  id: string;
  name: string;
}

const initialFormData: InvoiceFormData = { client_id: "", project_id: "", amount: "" };

const statusStyles = {
  pending: "bg-warning/20 text-warning",
  paid: "bg-success/20 text-success",
  overdue: "bg-destructive/20 text-destructive",
};

export default function Invoices() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(
        collection(db, "invoices"),
        where("user_id", "==", user.id),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);

      const invoicesWithRelations = await Promise.all(snapshot.docs.map(async (invDoc) => {
        const data = invDoc.data();
        let clientData = { name: "", company: "Unknown" };
        let projectData = { name: "No project" };

        if (data.client_id) {
          const cSnap = await getDoc(doc(db, "clients", data.client_id));
          if (cSnap.exists()) clientData = cSnap.data() as any;
        }

        if (data.project_id) {
          const pSnap = await getDoc(doc(db, "projects", data.project_id));
          if (pSnap.exists()) projectData = pSnap.data() as any;
        }

        return {
          id: invDoc.id,
          ...data,
          clients: clientData,
          projects: projectData
        };
      }));

      return invoicesWithRelations as Invoice[];
    },
    enabled: !!user
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(collection(db, "clients"), where("user_id", "==", user.id));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ClientOption[];
    },
    enabled: !!user
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const q = query(collection(db, "projects"), where("user_id", "==", user.id));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ProjectOption[];
    },
    enabled: !!user
  });

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.filter(i => i.invoice_number.startsWith(`INV-${year}`)).length + 1;
    return `INV-${year}-${String(count).padStart(4, '0')}`;
  };

  const saveInvoice = useMutation({
    mutationFn: async () => {
      if (!user || !formData.amount) return;
      const payload = {
        amount: parseFloat(formData.amount),
        due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
        client_id: formData.client_id || null,
        project_id: formData.project_id || null,
        user_id: user.id
      };
      if (isEditing && formData.id) {
        await updateDoc(doc(db, "invoices", formData.id), payload);
      } else {
        await addDoc(collection(db, "invoices"), {
          ...payload,
          invoice_number: generateInvoiceNumber(),
          status: 'pending',
          created_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(isEditing ? "Invoice updated" : "Invoice created");
      closeDialog();
    },
    onError: () => toast.error(isEditing ? "Failed to update invoice" : "Failed to create invoice")
  });

  const markAsPaid = useMutation({
    mutationFn: async (invoiceId: string) => {
      await updateDoc(doc(db, "invoices", invoiceId), {
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success("Invoice marked as paid");
    }
  });

  const deleteInvoice = useMutation({
    mutationFn: async (invoiceId: string) => {
      await deleteDoc(doc(db, "invoices", invoiceId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success("Invoice deleted");
    }
  });

  const openEditDialog = (invoice: Invoice) => {
    setFormData({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      client_id: invoice.client_id || "",
      project_id: invoice.project_id || "",
      amount: String(invoice.amount),
      due_date: invoice.due_date ? new Date(invoice.due_date) : undefined
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setIsDialogOpen(false);
  };

  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + Number(i.amount), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.amount), 0);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <PageHeader title="Invoices" description="Track payments and billing." />
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Invoices"
        description="Track payments and billing."
        action={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" />New Invoice</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="glass rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="text-lg font-semibold text-foreground">{isEditing ? formData.invoice_number : generateInvoiceNumber()}</p>
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select value={formData.client_id} onValueChange={(v) => setFormData({ ...formData, client_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (<SelectItem key={client.id} value={client.id}>{client.company} - {client.name}</SelectItem>))}
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
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input id="amount" type="number" min="0" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.due_date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.due_date ? format(formData.due_date, "PPP") : "Select due date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={formData.due_date} onSelect={(d) => setFormData({ ...formData, due_date: d })} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button onClick={() => saveInvoice.mutate()} disabled={!formData.amount || parseFloat(formData.amount) <= 0} className="w-full">
                  {isEditing ? "Update Invoice" : "Create Invoice"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-xl p-5 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center"><FileText className="w-5 h-5 text-warning" /></div>
            <div><p className="text-sm text-muted-foreground">Pending</p><p className="text-xl font-semibold text-foreground">${totalPending.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="glass rounded-xl p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center"><DollarSign className="w-5 h-5 text-success" /></div>
            <div><p className="text-sm text-muted-foreground">Paid</p><p className="text-xl font-semibold text-foreground">${totalPaid.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="glass rounded-xl p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">Total Invoices</p><p className="text-xl font-semibold text-foreground">{invoices.length}</p></div>
          </div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No invoices yet</h3>
          <p className="text-muted-foreground mb-4">Create your first invoice to start tracking payments.</p>
          <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />New Invoice</Button>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Invoice</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Project</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Due Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{invoice.invoice_number}</td>
                  <td className="p-4 text-muted-foreground">{invoice.clients?.company || '-'}</td>
                  <td className="p-4 text-muted-foreground">{invoice.projects?.name || '-'}</td>
                  <td className="p-4 font-medium text-foreground">${Number(invoice.amount).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium capitalize", statusStyles[invoice.status as keyof typeof statusStyles])}>{invoice.status}</span>
                  </td>
                  <td className="p-4 text-muted-foreground">{invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '-'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {invoice.status === 'pending' && (
                        <Button variant="ghost" size="sm" onClick={() => markAsPaid.mutate(invoice.id)} className="text-success hover:text-success">Mark Paid</Button>
                      )}
                      <button onClick={() => window.open(`/invoices/${invoice.id}/print`, '_blank')} className="p-1 text-muted-foreground hover:text-foreground" title="Print Invoice"><Printer className="w-4 h-4" /></button>
                      <button onClick={() => openEditDialog(invoice)} className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteInvoice.mutate(invoice.id)} className="p-1 text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { db, uploadPublicFile } from "@/lib/database";
import { collection, query, where, getDocs, addDoc, orderBy } from "@/lib/database";

interface LeadCaptureFormProps {
  agencyUserId: string;
  className?: string;
  onSuccess?: () => void;
  leadConfig?: {
    layout: 'default' | 'split' | 'minimal';
  };
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_from: number | null;
  price_to: number | null;
}

export function LeadCaptureForm({ agencyUserId, className, onSuccess, leadConfig }: LeadCaptureFormProps) {
  const layout = leadConfig?.layout || 'default';
  const containerClasses = layout === 'split'
    ? 'grid grid-cols-1 lg:grid-cols-2 gap-8'
    : layout === 'minimal'
      ? 'space-y-4 max-w-xl mx-auto'
      : 'space-y-6';
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    budget_min: "",
    budget_max: "",
    message: "",
    deadline: "",
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ["services", agencyUserId],
    queryFn: async () => {
      const q = query(
        collection(db, "services"),
        where("user_id", "==", agencyUserId),
        where("is_active", "==", true),
        orderBy("display_order")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Service[];
    },
  });

  const submitLead = useMutation({
    mutationFn: async () => {
      let attachmentUrl = null;

      // Upload file if present
      if (file) {
        setUploading(true);
        const fileExt = file.name.split(".").pop();
        const fileName = `${agencyUserId}/${Date.now()}.${fileExt}`;
        attachmentUrl = await uploadPublicFile("lead-attachments", fileName, file);
        setUploading(false);
      }

      // Create lead
      const leadDoc = await addDoc(collection(db, "leads"), {
        user_id: agencyUserId,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        company: form.company || null,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        message: form.message || null,
        deadline: form.deadline || null,
        attachment_url: attachmentUrl,
        status: 'new',
        created_at: new Date().toISOString()
      });

      // Link services
      if (selectedServices.length > 0) {
        await Promise.all(selectedServices.map(serviceId =>
          addDoc(collection(db, "lead_services"), {
            lead_id: leadDoc.id,
            service_id: serviceId
          })
        ));
      }

      return leadDoc.id;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Your request has been submitted!");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to submit. Please try again.");
      console.error(error);
    },
  });

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  if (submitted) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-foreground mb-2">Thank you!</h3>
        <p className="text-muted-foreground">
          We've received your request and will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitLead.mutate();
      }}
      className={`${containerClasses} ${className || ''}`}
    >
      {/* Services Selection - Full Width on Split */}
      {services.length > 0 && (
        <div className={`space-y-3 ${layout === 'split' ? 'lg:col-span-2' : ''}`}>
          <Label className="text-base font-semibold">What services are you interested in?</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((service) => (
              <label
                key={service.id}
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${selectedServices.includes(service.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
                  }`}
              >
                <Checkbox
                  checked={selectedServices.includes(service.id)}
                  onCheckedChange={() => handleServiceToggle(service.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{service.name}</p>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                  )}
                  {(service.price_from || service.price_to) && (
                    <p className="text-sm text-primary mt-1">
                      {service.price_from && service.price_to
                        ? `$${service.price_from.toLocaleString()} - $${service.price_to.toLocaleString()}`
                        : service.price_from
                          ? `From $${service.price_from.toLocaleString()}`
                          : `Up to $${service.price_to?.toLocaleString()}`}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="john@company.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder="Company Name"
          />
        </div>
      </div>

      {/* Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget_min">Budget Min ($)</Label>
          <Input
            id="budget_min"
            type="number"
            value={form.budget_min}
            onChange={(e) => setForm({ ...form, budget_min: e.target.value })}
            placeholder="5000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget_max">Budget Max ($)</Label>
          <Input
            id="budget_max"
            type="number"
            value={form.budget_max}
            onChange={(e) => setForm({ ...form, budget_max: e.target.value })}
            placeholder="15000"
          />
        </div>
      </div>

      {/* Deadline */}
      <div className="space-y-2">
        <Label htmlFor="deadline">Project Deadline</Label>
        <Input
          id="deadline"
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Tell us about your project</Label>
        <Textarea
          id="message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Describe your project, goals, and any specific requirements..."
          rows={4}
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label>Attach Files (Optional)</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-muted-foreground transition-colors">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            {file ? (
              <p className="text-sm text-foreground">{file.name}</p>
            ) : (
              <>
                <p className="text-sm text-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOC, PNG, JPG (max 10MB)</p>
              </>
            )}
          </label>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className={`w-full ${layout === 'split' ? 'lg:col-span-2' : ''}`}
        disabled={submitLead.isPending || uploading}
      >
        {submitLead.isPending || uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Request"
        )}
      </Button>
    </form>
  );
}

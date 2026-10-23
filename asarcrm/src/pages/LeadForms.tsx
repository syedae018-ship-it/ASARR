import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Settings,
  Code,
  FileText,
  Calendar,
  AlignLeft,
  List,
  CheckSquare,
  Mail,
  Phone,
  Hash,
  Radio,
  Eye,
  Inbox,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { DynamicFormRenderer, FormField, LeadFormRecord } from "@/components/lead/DynamicFormRenderer";

export interface LeadForm {
  id: string;
  user_id?: string;
  title: string;
  description: string | null;
  fields: FormField[];
  settings: {
    submitButtonText?: string;
    successMessage?: string;
    notificationEmail?: string;
    theme?: 'light' | 'dark' | 'system';
  };
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface FormSubmission {
  id: string;
  form_id: string;
  form_title?: string;
  submitter_name?: string | null;
  submitter_email?: string | null;
  submitter_phone?: string | null;
  answers: Record<string, any>;
  submitted_at: string;
}

const FIELD_TYPES: { type: FormField['type']; label: string; icon: any; description: string }[] = [
  { type: 'text', label: 'Text Input', icon: Code, description: 'Single line text (Name, company, etc.)' },
  { type: 'email', label: 'Email Address', icon: Mail, description: 'Validated email input' },
  { type: 'phone', label: 'Phone Number', icon: Phone, description: 'International or local phone format' },
  { type: 'number', label: 'Numeric Value', icon: Hash, description: 'Budget, quantity, or team size' },
  { type: 'textarea', label: 'Multi-Line Message', icon: AlignLeft, description: 'Paragraph / project scope' },
  { type: 'select', label: 'Dropdown Select', icon: List, description: 'Pick one option from a list' },
  { type: 'radio', label: 'Radio Choice', icon: Radio, description: 'Single-select choice chips' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Terms agreement or multi-select' },
  { type: 'date', label: 'Date Picker', icon: Calendar, description: 'Target deadline or kickoff date' },
];

export default function LeadForms() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedForm, setSelectedForm] = useState<LeadForm | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"fields" | "settings" | "preview">("fields");
  const [activeEditingFieldId, setActiveEditingFieldId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Submissions Modal State
  const [submissionsForm, setSubmissionsForm] = useState<LeadForm | null>(null);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);

  // Fetch Forms
  const { data: forms = [], isLoading } = useQuery({
    queryKey: ["lead-forms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Failed to fetch forms directly from supabase:", error.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: String(row.id),
        user_id: row.user_id,
        title: row.title || "Untitled Form",
        description: row.description || null,
        fields: Array.isArray(row.fields) ? row.fields : [],
        settings: typeof row.settings === 'object' && row.settings !== null ? row.settings : {
          submitButtonText: "Submit Inquiry",
          successMessage: "Thank you for reaching out! Our team will get back to you shortly."
        },
        is_active: Boolean(row.is_active),
        created_at: row.created_at,
        updated_at: row.updated_at
      })) as LeadForm[];
    },
    enabled: !!user,
  });

  // Fetch Submissions for active modal
  const { data: submissions = [], isLoading: isSubmissionsLoading } = useQuery({
    queryKey: ["form-submissions", submissionsForm?.id],
    queryFn: async () => {
      if (!submissionsForm?.id) return [];
      const { data, error } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("form_id", submissionsForm.id)
        .order("submitted_at", { ascending: false });

      if (error) {
        console.warn("Could not query form_submissions:", error.message);
        return [];
      }

      return (data || []).map((s: any) => ({
        id: s.id,
        form_id: s.form_id,
        form_title: s.form_title || submissionsForm.title,
        submitter_name: s.submitter_name,
        submitter_email: s.submitter_email,
        submitter_phone: s.submitter_phone,
        answers: typeof s.answers === 'object' && s.answers !== null ? s.answers : {},
        submitted_at: s.submitted_at
      })) as FormSubmission[];
    },
    enabled: !!submissionsForm?.id && isSubmissionsOpen,
  });

  // Create Form Mutation
  const createFormMutation = useMutation({
    mutationFn: async (form: LeadForm) => {
      if (!user?.id) throw new Error("Authentication required to create forms.");

      const payload = {
        user_id: user.id,
        title: form.title.trim() || "Untitled Lead Form",
        description: form.description?.trim() || null,
        fields: form.fields || [],
        settings: form.settings || {
          submitButtonText: "Submit Inquiry",
          successMessage: "Thank you! We will get in touch shortly."
        },
        is_active: form.is_active !== undefined ? form.is_active : true,
      };

      const { data, error } = await supabase
        .from("forms")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-forms"] });
      toast.success("Lead form created successfully");
      setIsEditorOpen(false);
      setIsDirty(false);
    },
    onError: (err: any) => {
      console.error("Create form failed:", err);
      toast.error(err?.message || "Failed to create lead form");
    }
  });

  // Update Form Mutation
  const updateFormMutation = useMutation({
    mutationFn: async (form: LeadForm) => {
      if (!form.id) throw new Error("Missing form identifier");

      const payload = {
        title: form.title.trim() || "Untitled Lead Form",
        description: form.description?.trim() || null,
        fields: form.fields || [],
        settings: form.settings,
        is_active: form.is_active,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("forms")
        .update(payload)
        .eq("id", form.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-forms"] });
      toast.success("Lead form updated successfully");
      setIsEditorOpen(false);
      setIsDirty(false);
    },
    onError: (err: any) => {
      console.error("Update form failed:", err);
      toast.error(err?.message || "Failed to update lead form");
    }
  });

  // Delete Form Mutation
  const deleteFormMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("forms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-forms"] });
      toast.success("Form deleted");
    },
    onError: (err: any) => {
      console.error("Delete form failed:", err);
      toast.error(err?.message || "Failed to delete form");
    }
  });

  // Toggle Active Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("forms")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lead-forms"] });
      toast.success(variables.is_active ? "Form activated" : "Form deactivated");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to toggle form status");
    }
  });

  const handleCreateNew = () => {
    setSelectedForm({
      id: '',
      title: 'New Client Inquiry Form',
      description: 'Please provide details regarding your requirements and brand goals.',
      fields: [
        { id: 'f_name', type: 'text', label: 'Full Name', placeholder: 'e.g. John Doe', required: true, width: 'half' },
        { id: 'f_email', type: 'email', label: 'Work Email', placeholder: 'john@brand.com', required: true, width: 'half' },
        { id: 'f_phone', type: 'phone', label: 'Phone / WhatsApp', placeholder: '+91 98765 43210', required: false, width: 'half' },
        { id: 'f_budget', type: 'select', label: 'Estimated Budget', options: ['Under ₹1,00,000', '₹1,00,000 - ₹3,00,000', '₹3,00,000 - ₹5,00,000', '₹5,00,000+'], required: false, width: 'half' },
        { id: 'f_message', type: 'textarea', label: 'Project Scope & Goals', placeholder: 'Tell us about your brand vision, target timeline, and deliverables...', required: true, width: 'full' }
      ],
      settings: {
        submitButtonText: 'Send Inquiry',
        successMessage: 'Thank you! Your inquiry has been received. Our team will reach out within 24 hours.',
        theme: 'light'
      },
      is_active: true
    });
    setActiveEditingFieldId(null);
    setActiveTab("fields");
    setIsDirty(false);
    setIsEditorOpen(true);
  };

  const handleEdit = (form: LeadForm) => {
    setSelectedForm(JSON.parse(JSON.stringify(form)));
    setActiveEditingFieldId(null);
    setActiveTab("fields");
    setIsDirty(false);
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    if (!selectedForm) return;

    if (!selectedForm.title.trim()) {
      toast.error("Please provide a form title");
      return;
    }

    if (selectedForm.fields.length === 0) {
      toast.error("Please add at least one field to the form");
      return;
    }

    if (selectedForm.id) {
      updateFormMutation.mutate(selectedForm);
    } else {
      createFormMutation.mutate(selectedForm);
    }
  };

  const addField = (type: FormField['type']) => {
    if (!selectedForm) return;
    const newId = 'f_' + Math.random().toString(36).substring(2, 8);
    const typeMeta = FIELD_TYPES.find(ft => ft.type === type);
    const newField: FormField = {
      id: newId,
      type,
      label: typeMeta?.label || 'New Field',
      placeholder: type === 'email' ? 'name@company.com' : type === 'phone' ? '+91 ...' : 'Enter value...',
      required: false,
      width: type === 'textarea' ? 'full' : 'half',
      options: (type === 'select' || type === 'radio') ? ['Option 1', 'Option 2', 'Option 3'] : undefined
    };

    setSelectedForm({
      ...selectedForm,
      fields: [...selectedForm.fields, newField]
    });
    setActiveEditingFieldId(newId);
    setIsDirty(true);
  };

  const removeField = (id: string) => {
    if (!selectedForm) return;
    setSelectedForm({
      ...selectedForm,
      fields: selectedForm.fields.filter(f => f.id !== id)
    });
    if (activeEditingFieldId === id) setActiveEditingFieldId(null);
    setIsDirty(true);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    if (!selectedForm) return;
    setSelectedForm({
      ...selectedForm,
      fields: selectedForm.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    });
    setIsDirty(true);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (!selectedForm) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedForm.fields.length) return;

    const newFields = [...selectedForm.fields];
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;

    setSelectedForm({
      ...selectedForm,
      fields: newFields
    });
    setIsDirty(true);
  };

  const getPublicLink = (formId: string) => {
    const origin = window.location.origin;
    return `${origin}/portal/forms/${formId}`;
  };

  const copyLink = (formId: string) => {
    const link = getPublicLink(formId);
    navigator.clipboard.writeText(link);
    toast.success("Public form link copied to clipboard!");
  };

  const openSubmissions = (form: LeadForm) => {
    setSubmissionsForm(form);
    setIsSubmissionsOpen(true);
  };

  const isSaving = createFormMutation.isPending || updateFormMutation.isPending;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-200">
      <PageHeader
        title="Lead Capture Forms"
        subtitle="Create, customize, and deploy dynamic lead generation forms connected directly to your ASARR CRM inbox."
      >
        <Button
          onClick={handleCreateNew}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Form
        </Button>
      </PageHeader>

      {/* Forms Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl border border-border/60 bg-card p-6 animate-pulse space-y-4">
              <div className="h-6 w-1/3 bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-20 w-full bg-muted/40 rounded mt-6" />
            </div>
          ))}
        </div>
      ) : forms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card
              key={form.id}
              className="group flex flex-col justify-between border-border/70 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg bg-card"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {form.is_active ? "Active" : "Inactive"}
                    </span>
                    <Switch
                      checked={form.is_active}
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({ id: form.id, is_active: checked })
                      }
                      aria-label="Toggle active status"
                    />
                  </div>
                </div>

                <CardTitle className="text-lg font-bold text-foreground leading-snug line-clamp-1">
                  {form.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px] text-xs leading-relaxed text-muted-foreground mt-1">
                  {form.description || "Custom inquiries and lead qualification intake form."}
                </CardDescription>
              </CardHeader>

              <CardContent className="py-2 text-xs text-muted-foreground space-y-2 border-t border-border/40 mt-2 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Configured Fields:</span>
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {form.fields?.length || 0} fields
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>Status:</span>
                  <span className={cn("font-medium", form.is_active ? "text-emerald-600" : "text-amber-600")}>
                    {form.is_active ? "● Accepting Submissions" : "○ Paused"}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-border/50 pt-3 pb-3 bg-muted/20 gap-2">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 border-border/70 hover:bg-background"
                    onClick={() => copyLink(form.id)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 text-primary hover:bg-primary/10"
                    onClick={() => openSubmissions(form)}
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    Submissions
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-background hover:text-primary"
                    onClick={() => handleEdit(form)}
                    title="Edit Form"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${form.title}"?`)) {
                        deleteFormMutation.mutate(form.id);
                      }
                    }}
                    title="Delete Form"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/70 rounded-2xl bg-card text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary shadow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-foreground">No Lead Forms Created</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Build custom lead qualification forms with tailored fields, validation, and automated CRM submission handling.
            </p>
          </div>
          <Button onClick={handleCreateNew} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Lead Form
          </Button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORM BUILDER DIALOG                                                       */}
      {/* ========================================================================= */}
      <Dialog
        open={isEditorOpen}
        onOpenChange={(open) => {
          if (!open && isDirty) {
            if (confirm("You have unsaved changes. Discard and close editor?")) {
              setIsEditorOpen(false);
              setIsDirty(false);
            }
          } else {
            setIsEditorOpen(open);
          }
        }}
      >
        <DialogContent className="max-w-5xl w-[95vw] h-[92vh] max-h-[92vh] flex flex-col p-0 gap-0 bg-background overflow-hidden border border-border shadow-2xl rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 px-6 border-b border-border shrink-0 bg-muted/30">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {selectedForm?.id ? "Edit Lead Form" : "Create New Lead Form"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Design fields, configure submission triggers, and preview the live visitor experience.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!isDirty || confirm("Discard unsaved changes?")) {
                    setIsEditorOpen(false);
                    setIsDirty(false);
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground shadow-sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Form"}
              </Button>
            </div>
          </div>

          {/* Body Tabs */}
          {selectedForm && (
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as any)}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              <div className="border-b border-border px-6 bg-background flex items-center justify-between shrink-0">
                <TabsList className="bg-transparent h-12 gap-6 p-0">
                  <TabsTrigger
                    value="fields"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-1 h-full text-sm font-semibold"
                  >
                    1. Form Fields ({selectedForm.fields.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-1 h-full text-sm font-semibold"
                  >
                    2. Settings & Feedback
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-1 h-full text-sm font-semibold flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    3. Live Preview
                  </TabsTrigger>
                </TabsList>

                {selectedForm.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground gap-1.5"
                    onClick={() => window.open(getPublicLink(selectedForm.id), '_blank')}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Public URL
                  </Button>
                )}
              </div>

              {/* TAB 1: FORM FIELDS BUILDER */}
              <TabsContent value="fields" className="flex-1 min-h-0 overflow-hidden m-0 mt-0 flex flex-col md:flex-row bg-muted/10">
                {/* Left Palette */}
                <div className="w-full md:w-80 shrink-0 border-r border-border bg-card p-4 h-full overflow-y-auto space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Add Form Element
                    </h4>
                    <p className="text-[11px] text-muted-foreground">Click any field to append to your form layout.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {FIELD_TYPES.map((ft) => (
                      <button
                        key={ft.type}
                        type="button"
                        onClick={() => addField(ft.type)}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-background hover:bg-muted/60 text-left hover:border-primary/50 transition-all group"
                      >
                        <div className="p-2 rounded-md bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <ft.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground">{ft.label}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{ft.description}</div>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Canvas & Field Configurator */}
                <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 space-y-6">
                  {/* Form Meta Box */}
                  <div className="max-w-3xl mx-auto bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Form Title</Label>
                      <Input
                        value={selectedForm.title}
                        onChange={(e) => {
                          setSelectedForm({ ...selectedForm, title: e.target.value });
                          setIsDirty(true);
                        }}
                        placeholder="Enter form title..."
                        className="text-lg font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Form Subtitle / Intro</Label>
                      <Textarea
                        value={selectedForm.description || ''}
                        onChange={(e) => {
                          setSelectedForm({ ...selectedForm, description: e.target.value });
                          setIsDirty(true);
                        }}
                        placeholder="Explain the purpose of this form to visitors..."
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Fields Stack */}
                  <div className="max-w-3xl mx-auto space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Configured Form Fields ({selectedForm.fields.length})
                      </h4>
                      <span className="text-[11px] text-muted-foreground">
                        Use arrows to reorder • Click gear to configure
                      </span>
                    </div>

                    {selectedForm.fields.length === 0 ? (
                      <div className="p-8 border-2 border-dashed border-border/80 rounded-xl text-center space-y-3 bg-card/50">
                        <GripVertical className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
                        <p className="text-sm font-medium text-foreground">No fields in this form yet.</p>
                        <p className="text-xs text-muted-foreground">Select an element from the left panel to begin.</p>
                      </div>
                    ) : (
                      selectedForm.fields.map((field, idx) => {
                        const isExpanded = activeEditingFieldId === field.id;
                        const typeMeta = FIELD_TYPES.find(f => f.type === field.type);

                        return (
                          <div
                            key={field.id}
                            className={cn(
                              "border rounded-xl bg-card transition-all shadow-sm",
                              isExpanded ? "border-primary ring-1 ring-primary/30" : "border-border/70 hover:border-border"
                            )}
                          >
                            {/* Summary Bar */}
                            <div className="flex items-center gap-3 p-3.5">
                              {/* Reorder Buttons */}
                              <div className="flex flex-col gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveField(idx, 'up')}
                                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                                  title="Move Up"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === selectedForm.fields.length - 1}
                                  onClick={() => moveField(idx, 'down')}
                                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                                  title="Move Down"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Field Icon & Type */}
                              <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                                {typeMeta?.icon && <typeMeta.icon className="w-4 h-4" />}
                              </div>

                              {/* Label / Summary */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-foreground truncate">
                                    {field.label}
                                  </span>
                                  {field.required && (
                                    <Badge variant="destructive" className="text-[10px] py-0 px-1.5 h-4">
                                      Required
                                    </Badge>
                                  )}
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    [{field.width === 'half' ? 'Half Width' : 'Full Width'}]
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  Placeholder: {field.placeholder || "(none)"}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant={isExpanded ? "secondary" : "ghost"}
                                  size="sm"
                                  className="h-8 text-xs gap-1"
                                  onClick={() => setActiveEditingFieldId(isExpanded ? null : field.id)}
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                  {isExpanded ? "Close" : "Configure"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeField(field.id)}
                                  title="Remove Field"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Expanded Config Panel */}
                            {isExpanded && (
                              <div className="p-4 border-t border-border/60 bg-muted/20 space-y-4 animate-in fade-in-50 duration-150">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <Label className="text-xs">Field Label</Label>
                                    <Input
                                      value={field.label}
                                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                                      placeholder="e.g. Work Email"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs">Placeholder Text</Label>
                                    <Input
                                      value={field.placeholder || ''}
                                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                      placeholder="e.g. name@brand.com"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 pt-2">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`req-${field.id}`}
                                      checked={field.required}
                                      onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                                    />
                                    <Label htmlFor={`req-${field.id}`} className="text-xs cursor-pointer">
                                      Mandatory Required Field
                                    </Label>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`w-${field.id}`}
                                      checked={field.width === 'full'}
                                      onCheckedChange={(checked) => updateField(field.id, { width: checked ? 'full' : 'half' })}
                                    />
                                    <Label htmlFor={`w-${field.id}`} className="text-xs cursor-pointer">
                                      Span Full Width (2 Columns)
                                    </Label>
                                  </div>
                                </div>

                                {(field.type === 'select' || field.type === 'radio') && (
                                  <div className="space-y-1.5 pt-2">
                                    <Label className="text-xs">
                                      Options List (Comma-separated)
                                    </Label>
                                    <Input
                                      value={field.options?.join(', ') || ''}
                                      onChange={(e) =>
                                        updateField(field.id, {
                                          options: e.target.value
                                            .split(',')
                                            .map((s) => s.trim())
                                            .filter(Boolean)
                                        })
                                      }
                                      placeholder="e.g. Under ₹1L, ₹1L - ₹3L, ₹3L - ₹5L, ₹5L+"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                      Separate choices with commas. Each entry becomes a selectable choice.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: SETTINGS */}
              <TabsContent value="settings" className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 bg-muted/10 mt-0">
                <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Form Behavior & Responses</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Configure button labels, confirmation messaging, and administrative alerts.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Submit Button Text</Label>
                      <Input
                        value={selectedForm.settings?.submitButtonText || ''}
                        onChange={(e) => {
                          setSelectedForm({
                            ...selectedForm,
                            settings: { ...selectedForm.settings, submitButtonText: e.target.value }
                          });
                          setIsDirty(true);
                        }}
                        placeholder="e.g. Send Request, Schedule Call, Get Proposal"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Post-Submission Success Message</Label>
                      <Textarea
                        value={selectedForm.settings?.successMessage || ''}
                        onChange={(e) => {
                          setSelectedForm({
                            ...selectedForm,
                            settings: { ...selectedForm.settings, successMessage: e.target.value }
                          });
                          setIsDirty(true);
                        }}
                        rows={3}
                        placeholder="Message displayed to the visitor immediately after form submission..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Notification Recipient Email (Optional)</Label>
                      <Input
                        type="email"
                        value={selectedForm.settings?.notificationEmail || ''}
                        onChange={(e) => {
                          setSelectedForm({
                            ...selectedForm,
                            settings: { ...selectedForm.settings, notificationEmail: e.target.value }
                          });
                          setIsDirty(true);
                        }}
                        placeholder="notifications@asarr.agency"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Incoming submissions automatically create a new lead in your CRM. You can also specify an alert email.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-semibold">Form Status</Label>
                        <p className="text-xs text-muted-foreground">
                          When active, the public link accepts visitor inquiries.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono">{selectedForm.is_active ? "Active" : "Paused"}</span>
                        <Switch
                          checked={selectedForm.is_active}
                          onCheckedChange={(checked) => {
                            setSelectedForm({ ...selectedForm, is_active: checked });
                            setIsDirty(true);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: LIVE PREVIEW */}
              <TabsContent value="preview" className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 bg-muted/20 flex flex-col items-center mt-0">
                <div className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-xl p-8 space-y-6">
                  <div className="text-center pb-4 border-b border-border/50">
                    <h2 className="text-2xl font-bold text-foreground">{selectedForm.title}</h2>
                    {selectedForm.description && (
                      <p className="text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
                        {selectedForm.description}
                      </p>
                    )}
                  </div>

                  <DynamicFormRenderer
                    form={selectedForm as LeadFormRecord}
                    isInteractivePreview={true}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* FORM SUBMISSIONS VIEWER DIALOG                                            */}
      {/* ========================================================================= */}
      <Dialog open={isSubmissionsOpen} onOpenChange={setIsSubmissionsOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 bg-background overflow-hidden border border-border shadow-2xl rounded-xl">
          <div className="p-4 px-6 border-b border-border shrink-0 bg-muted/30 flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Inbox className="w-5 h-5 text-primary" />
                Submissions: {submissionsForm?.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Total received submissions: {submissions.length}
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsSubmissionsOpen(false)}>
              Close
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isSubmissionsLoading ? (
              <div className="p-12 text-center text-muted-foreground animate-pulse">
                Loading submission records...
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-border/60 rounded-xl text-center space-y-3">
                <Inbox className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
                <h4 className="text-base font-semibold text-foreground">No Submissions Yet</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  When visitors complete and submit this form, their contact details and answered questions will appear here and in your Leads CRM.
                </p>
                {submissionsForm?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => copyLink(submissionsForm.id)}
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Public Form Link
                  </Button>
                )}
              </div>
            ) : (
              submissions.map((sub) => (
                <Card key={sub.id} className="border-border/70 shadow-sm bg-card overflow-hidden">
                  <CardHeader className="p-4 pb-2 bg-muted/20 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">
                        {sub.submitter_name || "Visitor Inquiry"}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {sub.submitter_email && <span>{sub.submitter_email}</span>}
                        {sub.submitter_phone && <span>• {sub.submitter_phone}</span>}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[11px] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(sub.submitted_at).toLocaleString()}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 pt-3 text-xs space-y-2">
                    <p className="font-semibold text-foreground/80 mb-1">Answers:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-muted/30 p-3 rounded-lg border border-border/40">
                      {Object.entries(sub.answers || {}).map(([question, answer]) => (
                        <div key={question} className="space-y-0.5">
                          <span className="font-medium text-muted-foreground">{question}:</span>
                          <p className="text-foreground font-medium">{String(answer)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

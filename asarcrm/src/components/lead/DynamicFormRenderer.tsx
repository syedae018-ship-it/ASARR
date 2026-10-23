import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  width?: 'full' | 'half';
}

export interface LeadFormRecord {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  fields: FormField[];
  settings: {
    submitButtonText?: string;
    successMessage?: string;
    notificationEmail?: string;
    theme?: 'light' | 'dark' | 'system';
  };
  is_active?: boolean;
}

interface DynamicFormRendererProps {
  form: LeadFormRecord;
  className?: string;
  isInteractivePreview?: boolean;
}

export function DynamicFormRenderer({ form, className = "", isInteractivePreview = false }: DynamicFormRendererProps) {
  const fields: FormField[] = Array.isArray(form.fields) ? form.fields : [];
  const settings = form.settings || {};
  const submitButtonText = settings.submitButtonText || "Submit";
  const successMessage = settings.successMessage || "Thank you for reaching out! We have received your message.";

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (isInteractivePreview) {
        // In preview mode, simply show success feedback
        return;
      }

      // 1. Extract standard contact fields
      let name = "";
      let email = "";
      let phone = "";
      let message = "";
      const answersMap: Record<string, any> = {};

      fields.forEach(field => {
        const val = formData[field.id];
        if (val !== undefined && val !== null && val !== "") {
          answersMap[field.label] = val;
          const lower = field.label.toLowerCase();

          if (field.type === 'email' || lower.includes('email')) {
            if (!email) email = String(val).trim();
          } else if (field.type === 'phone' || lower.includes('phone') || lower.includes('mobile')) {
            if (!phone) phone = String(val).trim();
          } else if (lower.includes('name') && !name) {
            name = String(val).trim();
          } else if (field.type === 'textarea' || lower.includes('message') || lower.includes('details')) {
            message += (message ? "\n" : "") + `${field.label}: ${val}`;
          }
        }
      });

      // Default name fallback if absent
      if (!name) {
        const firstText = fields.find(f => f.type === 'text' && formData[f.id]);
        name = firstText ? String(formData[firstText.id]) : (email || "Anonymous Inquiry");
      }

      // 2. Insert into form_submissions (publicly allowed for all forms)
      const submissionId = crypto.randomUUID();
      const { error: subErr } = await supabase.from('form_submissions').insert({
        id: submissionId,
        form_id: form.id,
        form_title: form.title,
        submitter_name: name || null,
        submitter_email: email || null,
        submitter_phone: phone || null,
        answers: answersMap,
        submitted_at: new Date().toISOString()
      });

      if (subErr) {
        console.warn("Could not insert form_submission directly:", subErr.message);
      }

      // 3. Attempt to create a linked lead in public.leads for CRM inbox
      try {
        const leadId = crypto.randomUUID();
        await supabase.from('leads').insert({
          id: leadId,
          user_id: form.user_id,
          name: name || "Website Lead",
          email: email || "unknown@inquiry.com",
          phone: phone || null,
          message: message || `Form submission from "${form.title}"`,
          status: 'new',
          custom_data: {
            form_id: form.id,
            form_title: form.title,
            submission_id: submissionId,
            answers: answersMap,
            submitted_at: new Date().toISOString()
          }
        });
      } catch (leadErr) {
        console.warn("Notice: Lead entry could not be created from public submission:", leadErr);
      }
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Form submitted successfully!");
    },
    onError: (err: any) => {
      console.error("Submission failed:", err);
      toast.error(err.message || "Failed to submit form. Please try again.");
    }
  });

  if (submitted) {
    return (
      <div className={`text-center py-12 px-4 space-y-4 ${className}`}>
        <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-600 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">Submission Received</h3>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          {successMessage}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSubmitted(false);
            setFormData({});
          }}
          className="mt-4"
        >
          Submit Another Response
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitMutation.mutate();
      }}
      className={`space-y-6 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fields.map((field) => {
          const isFullWidth = field.width === 'full' || field.type === 'textarea';

          return (
            <div
              key={field.id}
              className={`space-y-2 ${isFullWidth ? "col-span-1 md:col-span-2" : "col-span-1"}`}
            >
              <Label htmlFor={`field-${field.id}`} className="text-sm font-medium text-foreground flex items-center justify-between">
                <span>
                  {field.label} {field.required && <span className="text-destructive font-bold">*</span>}
                </span>
              </Label>

              {field.type === 'textarea' ? (
                <Textarea
                  id={`field-${field.id}`}
                  placeholder={field.placeholder || "Enter details..."}
                  required={field.required}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  rows={4}
                  className="bg-background/80 resize-none"
                />
              ) : field.type === 'select' ? (
                <Select
                  value={formData[field.id] || ""}
                  onValueChange={(val) => handleInputChange(field.id, val)}
                  required={field.required}
                >
                  <SelectTrigger id={`field-${field.id}`} className="bg-background/80">
                    <SelectValue placeholder={field.placeholder || "Select an option..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options && field.options.length > 0
                      ? field.options
                      : ["Option 1", "Option 2", "Option 3"]
                    ).map((opt, i) => (
                      <SelectItem key={i} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/60 bg-background/50">
                  <Checkbox
                    id={`field-${field.id}`}
                    checked={Boolean(formData[field.id])}
                    onCheckedChange={(checked) => handleInputChange(field.id, Boolean(checked))}
                    required={field.required}
                  />
                  <Label
                    htmlFor={`field-${field.id}`}
                    className="text-sm font-normal cursor-pointer text-foreground select-none"
                  >
                    {field.placeholder || "I agree to the terms"}
                  </Label>
                </div>
              ) : field.type === 'radio' ? (
                <RadioGroup
                  value={formData[field.id] || ""}
                  onValueChange={(val) => handleInputChange(field.id, val)}
                  className="space-y-2 pt-1"
                >
                  {(field.options && field.options.length > 0
                    ? field.options
                    : ["Option 1", "Option 2"]
                  ).map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`field-${field.id}-${i}`} />
                      <Label htmlFor={`field-${field.id}-${i}`} className="text-sm font-normal cursor-pointer">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Input
                  id={`field-${field.id}`}
                  type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  placeholder={field.placeholder || (field.type === 'email' ? 'name@company.com' : field.type === 'phone' ? '+91 98765 43210' : '')}
                  required={field.required}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="bg-background/80"
                />
              )}
            </div>
          );
        })}
      </div>

      <Button
        type="submit"
        className="w-full h-11 text-base font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
        disabled={submitMutation.isPending}
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          submitButtonText
        )}
      </Button>
    </form>
  );
}

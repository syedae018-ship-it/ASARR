import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DynamicFormRenderer, LeadFormRecord } from "@/components/lead/DynamicFormRenderer";
import { Zap, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function PublicForm() {
  const { formId } = useParams<{ formId: string }>();

  const { data: form, isLoading, error } = useQuery({
    queryKey: ["public-form", formId],
    queryFn: async () => {
      if (!formId) return null;
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .maybeSingle();

      if (error) {
        console.warn("Public form query error:", error.message);
        throw error;
      }
      if (!data) return null;

      return {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        description: data.description,
        fields: Array.isArray(data.fields) ? data.fields : [],
        settings: data.settings || {},
        is_active: data.is_active !== undefined ? Boolean(data.is_active) : true
      } as LeadFormRecord;
    },
    enabled: !!formId,
  });

  const { data: profile } = useQuery({
    queryKey: ["form-owner-profile", form?.user_id],
    queryFn: async () => {
      if (!form?.user_id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("company_name, full_name, logo_url, primary_color")
        .eq("id", form.user_id)
        .maybeSingle();

      return data;
    },
    enabled: !!form?.user_id
  });

  useEffect(() => {
    if (form?.title) {
      const companyName = profile?.company_name || profile?.full_name || "ASARR";
      document.title = `${form.title} | ${companyName}`;
    }
  }, [form, profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-sm">Loading form...</div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Form Not Found</h1>
          <p className="text-sm text-muted-foreground">
            This form does not exist or may have been removed. Please verify the URL or contact ASARR.
          </p>
        </div>
      </div>
    );
  }

  if (form.is_active === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-card border border-border p-8 rounded-2xl shadow-lg space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Submissions Paused</h1>
          <p className="text-sm text-muted-foreground">
            This form is currently not accepting new submissions. Please contact ASARR directly for inquiries.
          </p>
        </div>
      </div>
    );
  }

  const primaryHex = profile?.primary_color || '#7A1B28';
  const primaryColorHsl = hexToHsl(primaryHex);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col justify-between"
      style={{ '--primary': primaryColorHsl } as React.CSSProperties}
    >
      {/* Header */}
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt="Logo" className="w-9 h-9 rounded-lg object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                A
              </div>
            )}
            <div>
              <h1 className="font-semibold text-foreground text-sm sm:text-base leading-tight">
                {profile?.company_name || profile?.full_name || "ASARR Digital Agency"}
              </h1>
              <p className="text-xs text-muted-foreground">Inquiry Intake</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Box */}
      <main className="container max-w-2xl mx-auto px-4 py-10 sm:py-14 my-auto">
        <div className="rounded-2xl p-6 sm:p-10 border border-border/80 shadow-xl bg-card/95 backdrop-blur-md space-y-6">
          <div className="text-center space-y-2 border-b border-border/60 pb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {form.title}
            </h2>
            {form.description && (
              <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {form.description}
              </p>
            )}
          </div>

          <DynamicFormRenderer form={form} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Powered by ASARR AgencyOS
      </footer>
    </div>
  );
}

function hexToHsl(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '351 64% 29%';

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Bell, Shield, LogOut, HelpCircle, FileText, Building2,
  Palette, Upload, Globe, Mail, Phone, MapPin, Image, FileEdit, LayoutTemplate,
  Save, Check, Download, CreditCard, Lock, KeyRound
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { db, uploadPublicFile } from "@/lib/database";
import { doc, getDoc, setDoc } from "@/lib/database";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

// Helper for live preview
function hexToHsl(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '262.1 83.3% 57.8%'; // Default
  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h: number = 0, s: number;
  const l: number = (max + min) / 2;
  if (max == min) { h = s = 0; } else {
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

interface BrandSettings {
  full_name: string;
  company_name: string;
  logo_url: string;
  company_description: string;
  company_website: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  terms_and_conditions: string;
  primary_color: string;
  secondary_color: string;
  portfolio_headline: string;
  portfolio_subheadline: string;
  portfolio_cta_text: string;
  social_links: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  lead_form_config?: {
    layout: 'default' | 'split' | 'minimal';
  };
  legal_business_name?: string;
  gstin?: string;
  pan?: string;
  default_currency?: string;
  invoice_prefix?: string;
  default_tax_rate?: number;
  payment_terms?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  payment_instructions?: string;
  representative_name?: string;
  representative_title?: string;
  representative_email?: string;
  representative_phone?: string;
  postal_code?: string;
  state?: string;
  city?: string;
  country?: string;
  job_title?: string;
  department?: string;
  mobile_number?: string;
  timezone?: string;
  avatar_url?: string;
  role?: string;
}

export default function Settings() {
  const { user, signOut, role, updatePassword } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password Management State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    full_name: '',
    company_name: 'ASARR Agency',
    logo_url: '',
    avatar_url: '',
    job_title: 'Agency Principal',
    department: 'Management & Strategy',
    mobile_number: '+91 98765 43210',
    timezone: 'Asia/Kolkata',
    company_description: 'Strategic Design & Technology Partner',
    company_website: 'https://asarr.agency',
    company_email: 'contact@asarr.agency',
    company_phone: '+91 98765 43210',
    company_address: 'Bangalore, Karnataka, India',
    terms_and_conditions: '',
    primary_color: '#7A1B28',
    secondary_color: '#330A11',
    portfolio_headline: 'Selected Works',
    portfolio_subheadline: 'Crafted digital experiences, brand identities, and high-performance applications.',
    portfolio_cta_text: 'Start Your Project',
    social_links: {},
    lead_form_config: { layout: 'default' }
  });

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.warn("Could not fetch user profile from Supabase:", error.message);
          return null;
        }

        if (data) {
          setBrandSettings({
            full_name: data.full_name || '',
            company_name: data.company_name || 'ASARR Agency',
            logo_url: data.logo_url || '',
            company_description: data.company_description || '',
            company_website: data.company_website || 'https://asarr.agency',
            company_email: data.company_email || 'contact@asarr.agency',
            company_phone: data.company_phone || '',
            company_address: data.company_address || '',
            terms_and_conditions: data.terms_and_conditions || '',
            primary_color: (data.primary_color && !['#2563eb', '#1e3a8a', '#3b82f6', '#6657e8'].includes(data.primary_color.toLowerCase())) ? data.primary_color : '#7A1B28',
            secondary_color: data.secondary_color || '#330A11',
            portfolio_headline: data.portfolio_headline || 'Selected Works',
            portfolio_subheadline: data.portfolio_subheadline || 'Crafted digital experiences, brand identities, and high-performance applications.',
            portfolio_cta_text: data.portfolio_cta_text || 'Start Your Project',
            social_links: data.social_links || {},
            lead_form_config: data.lead_form_config || { layout: 'default' },
            legal_business_name: data.legal_business_name || '',
            gstin: data.gstin || '',
            pan: data.pan || '',
            default_currency: data.default_currency || 'INR',
            invoice_prefix: data.invoice_prefix || 'INV-ASARR-',
            default_tax_rate: data.default_tax_rate || 18,
            payment_terms: data.payment_terms || 'Due on Receipt',
            bank_name: data.bank_name || '',
            account_name: data.account_name || '',
            account_number: data.account_number || '',
            ifsc_code: data.ifsc_code || '',
            upi_id: data.upi_id || '',
            payment_instructions: data.payment_instructions || '',
            representative_name: data.representative_name || '',
            representative_title: data.representative_title || '',
            representative_email: data.representative_email || '',
            representative_phone: data.representative_phone || '',
            postal_code: data.postal_code || '',
            state: data.state || '',
            city: data.city || '',
            country: data.country || 'India',
            job_title: data.job_title || 'Agency Principal',
            department: data.department || 'Management & Strategy',
            mobile_number: data.mobile_number || data.company_phone || '',
            timezone: data.timezone || 'Asia/Kolkata',
            avatar_url: data.avatar_url || ''
          });
          return data as BrandSettings;
        }
      } catch (err) {
        console.warn("Profile query error:", err);
      }
      return null;
    },
    enabled: !!user
  });

  // Real-time color preview (enforcing ASARR Royal Maroon & Beige monochrome)
  useEffect(() => {
    const root = document.documentElement;
    const color = (brandSettings.primary_color && !['#2563eb', '#1e3a8a', '#3b82f6', '#6657e8'].includes(brandSettings.primary_color.toLowerCase()))
      ? brandSettings.primary_color
      : '#7A1B28';
    root.style.setProperty('--primary', hexToHsl(color));
    root.style.setProperty('--ring', hexToHsl(color));
  }, [brandSettings.primary_color]);

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<BrandSettings>) => {
      if (!user?.id) throw new Error("No user authenticated");
      
      const payload: Record<string, any> = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // 1. Try full upsert into profiles
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...payload }, { onConflict: 'id' });

      if (error) {
        console.warn("Full profile upsert hit schema constraint, falling back to base columns:", error.message);
        
        // 2. Fallback to base columns if migration 5 has not yet been executed in Supabase
        const coreKeys = [
          'full_name', 'company_name', 'logo_url', 'company_description',
          'company_website', 'company_email', 'company_phone', 'company_address',
          'terms_and_conditions', 'primary_color', 'secondary_color',
          'portfolio_headline', 'portfolio_subheadline', 'portfolio_cta_text',
          'social_links', 'lead_form_config'
        ];
        
        const corePayload: Record<string, any> = { id: user.id, updated_at: new Date().toISOString() };
        for (const k of coreKeys) {
          if (payload[k] !== undefined) corePayload[k] = payload[k];
        }

        const { error: coreError } = await supabase
          .from('profiles')
          .upsert(corePayload, { onConflict: 'id' });

        if (coreError) {
          throw coreError;
        }

        toast.info("Branding & company profile saved! (Run Supabase Migration 5 to enable extended tax & billing columns)");
        return;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['profile', user?.id], (oldData: any) => ({
        ...oldData,
        ...variables
      }));

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success("Settings saved and verified in Supabase");
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(`Failed to update settings: ${error?.message || "Unknown error"}`);
    }
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}-logo-${Date.now()}.${fileExt}`;
      const publicUrl = await uploadPublicFile("brand-assets", fileName, file);

      setBrandSettings(prev => ({ ...prev, logo_url: publicUrl }));
      await updateProfile.mutateAsync({ logo_url: publicUrl });
      toast.success("Logo uploaded and saved");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be under 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}-avatar-${Date.now()}.${fileExt}`;
      const publicUrl = await uploadPublicFile("brand-assets", fileName, file);

      setBrandSettings(prev => ({ ...prev, avatar_url: publicUrl }));
      await updateProfile.mutateAsync({ avatar_url: publicUrl });
      toast.success("Profile avatar uploaded and saved");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setPasswordUpdating(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      toast.success("Password updated successfully via Supabase Auth!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleSaveAll = () => {
    updateProfile.mutate({
      ...brandSettings
    } as any);
  };

  const exportAgencyData = async () => {
    const tables = [
      'profiles', 'clients', 'client_activity', 'leads', 'lead_services',
      'services', 'projects', 'project_images', 'tasks', 'events', 'invoices',
      'forms', 'templates', 'proposals', 'notifications', 'portfolio_views'
    ];

    try {
      const results = await Promise.all(
        tables.map(async (table) => {
          const { data, error } = await supabase.from(table).select('*');
          if (error) throw error;
          return [table, data] as const;
        })
      );

      const backup = {
        exported_at: new Date().toISOString(),
        agencyos_version: 'mvp-supabase',
        data: Object.fromEntries(results),
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `agencyos-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Agency data exported');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Unable to export agency data');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground animate-pulse">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings & Branding</h1>
          <p className="text-muted-foreground mt-1">Manage your agency's brand identity, profile, and system preferences.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportAgencyData}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="outline" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
          <Button onClick={handleSaveAll} disabled={updateProfile.isPending} className="min-w-[120px]">
            {updateProfile.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 bg-muted/50 p-1 h-auto mb-8">
          <TabsTrigger value="personal" className="data-[state=active]:bg-background py-3 font-semibold">
            <User className="w-4 h-4 mr-2 text-primary" /> My Profile
          </TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-background py-3">
            <Palette className="w-4 h-4 mr-2" /> Branding
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-background py-3">
            <Building2 className="w-4 h-4 mr-2" /> Company Info
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-background py-3">
            <CreditCard className="w-4 h-4 mr-2" /> Billing & Banking
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-background py-3">
            <Image className="w-4 h-4 mr-2" /> Portfolio
          </TabsTrigger>
          <TabsTrigger value="forms" className="data-[state=active]:bg-background py-3">
            <LayoutTemplate className="w-4 h-4 mr-2" /> Forms
          </TabsTrigger>
          <TabsTrigger value="terms" className="data-[state=active]:bg-background py-3">
            <FileText className="w-4 h-4 mr-2" /> Terms
          </TabsTrigger>
        </TabsList>

        {/* PERSONAL ADMIN PROFILE & SECURITY TAB */}
        <TabsContent value="personal" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Avatar & Role Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Profile Photo</CardTitle>
                <CardDescription className="text-xs">Your personal agency photo</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <div className="relative w-36 h-36 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/20 group">
                  {brandSettings.avatar_url ? (
                    <img src={brandSettings.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-14 h-14 text-muted-foreground/40" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => avatarInputRef.current?.click()}
                      className="text-xs"
                    >
                      Change Photo
                    </Button>
                  </div>
                </div>

                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="w-full pt-2 border-t border-border/60 text-center space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Assigned Workspace Role
                  </span>
                  <div>
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary capitalize text-xs">
                      {role === "owner" ? "Primary Installation Owner" : role === "admin" ? "Administrator" : "Team Member"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Role permissions are strictly managed by agency owners.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Right: Personal Details */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
                <CardDescription className="text-xs">
                  Your identity across projects, task assignments, and internal communications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-full-name" className="text-xs font-medium">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="admin-full-name"
                        value={brandSettings.full_name}
                        onChange={(e) => setBrandSettings(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Syed Mustafa Ahmed"
                        className="pl-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-email" className="text-xs font-medium">Account Email (Verified)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="admin-email"
                        value={user?.email || ""}
                        disabled
                        className="pl-9 text-xs bg-muted/40 cursor-not-allowed opacity-80"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-phone" className="text-xs font-medium">Direct Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="admin-phone"
                        value={brandSettings.mobile_number || ""}
                        onChange={(e) => setBrandSettings(prev => ({ ...prev, mobile_number: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="pl-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-job-title" className="text-xs font-medium">Job Title / Designation</Label>
                    <Input
                      id="admin-job-title"
                      value={brandSettings.job_title || ""}
                      onChange={(e) => setBrandSettings(prev => ({ ...prev, job_title: e.target.value }))}
                      placeholder="e.g. Lead Architect / Creative Director"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-department" className="text-xs font-medium">Department</Label>
                    <Input
                      id="admin-department"
                      value={brandSettings.department || ""}
                      onChange={(e) => setBrandSettings(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="e.g. Design & Development"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-timezone" className="text-xs font-medium">Preferred Timezone</Label>
                    <Input
                      id="admin-timezone"
                      value={brandSettings.timezone || "Asia/Kolkata"}
                      onChange={(e) => setBrandSettings(prev => ({ ...prev, timezone: e.target.value }))}
                      placeholder="e.g. Asia/Kolkata (IST)"
                      className="text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Password Management Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Password & Authentication Security</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Update your account password securely using Supabase Auth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminPasswordChange} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-new-password" className="text-xs font-medium">New Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="admin-new-password"
                        type="password"
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="pl-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-confirm-password" className="text-xs font-medium">Confirm New Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="admin-confirm-password"
                        type="password"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="pl-9 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={passwordUpdating || !newPassword || !confirmPassword}
                  className="text-xs"
                >
                  {passwordUpdating ? "Updating Password..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BRANDING TAB */}
        <TabsContent value="branding" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Logo</CardTitle>
                <CardDescription>Your brand's visual identity</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                <div className="relative w-40 h-40 group">
                  {brandSettings.logo_url ? (
                    <img
                      src={brandSettings.logo_url}
                      alt="Logo"
                      className="w-full h-full object-contain rounded-xl border-2 border-dashed border-muted p-2"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl border-2 border-dashed border-muted flex items-center justify-center bg-muted/10 text-muted-foreground">
                      <Upload className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Change Logo
                    </Button>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Recommended dimension: 200x200px.<br />Supports PNG, JPG.
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
                <CardDescription>Define your agency's color palette</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Color Presets</Label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { name: 'ASARR Royal Maroon', primary: '#7A1B28', secondary: '#F3EDE2' },
                      { name: 'ASARR Burgundy Noir', primary: '#5C0612', secondary: '#FAF7F2' },
                      { name: 'ASARR Crimson Silk', primary: '#8B1E2E', secondary: '#F3EDE2' },
                      { name: 'ASARR Warm Terracotta', primary: '#B93246', secondary: '#F7EFE4' },
                      { name: 'ASARR Velvet Espresso', primary: '#330A11', secondary: '#FAF7F2' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setBrandSettings({
                          ...brandSettings,
                          primary_color: preset.primary,
                          secondary_color: preset.secondary
                        })}
                        className="group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all"
                      >
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: preset.primary }} />
                          <div className="w-8 h-8 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: preset.secondary }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                          {preset.name}
                        </span>
                        {brandSettings.primary_color === preset.primary && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl border shadow-sm shrink-0 transition-transform hover:scale-105" style={{ backgroundColor: brandSettings.primary_color }} />
                      <div className="flex-1 space-y-2">
                        <Input
                          value={brandSettings.primary_color}
                          onChange={(e) => setBrandSettings({ ...brandSettings, primary_color: e.target.value })}
                          className="font-mono"
                        />
                        <Input
                          type="color"
                          value={brandSettings.primary_color}
                          onChange={(e) => setBrandSettings({ ...brandSettings, primary_color: e.target.value })}
                          className="p-1 h-8 w-full cursor-pointer"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Used for buttons, links, and major accents.</p>
                  </div>

                  <div className="space-y-3">
                    <Label>Secondary Color</Label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl border shadow-sm shrink-0 transition-transform hover:scale-105" style={{ backgroundColor: brandSettings.secondary_color }} />
                      <div className="flex-1 space-y-2">
                        <Input
                          value={brandSettings.secondary_color}
                          onChange={(e) => setBrandSettings({ ...brandSettings, secondary_color: e.target.value })}
                          className="font-mono"
                        />
                        <Input
                          type="color"
                          value={brandSettings.secondary_color}
                          onChange={(e) => setBrandSettings({ ...brandSettings, secondary_color: e.target.value })}
                          className="p-1 h-8 w-full cursor-pointer"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Used for headings, dark backgrounds, and footer.</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="mb-4 block">Preview</Label>
                  <div className="rounded-xl border p-6 flex flex-col gap-4" style={{ backgroundColor: '#ffffff' }}>
                    <div className="h-4 w-1/3 rounded" style={{ backgroundColor: brandSettings.primary_color }}></div>
                    <div className="h-32 w-full rounded-lg bg-muted/20 border-2 border-dashed flex items-center justify-center text-sm text-muted-foreground">
                      Content Area
                    </div>
                    <Button style={{ backgroundColor: brandSettings.primary_color, color: 'white' }} className="w-fit">
                      Primary Color Button
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* COMPANY INFO TAB */}
        <TabsContent value="profile" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Your business information displayed on proposals and invoices.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={brandSettings.company_name}
                  onChange={(e) => setBrandSettings({ ...brandSettings, company_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name (My Name)</Label>
                <Input
                  value={brandSettings.full_name}
                  onChange={(e) => setBrandSettings({ ...brandSettings, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Company Description</Label>
                <Textarea
                  rows={3}
                  value={brandSettings.company_description}
                  onChange={(e) => setBrandSettings({ ...brandSettings, company_description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <div className="relative">
                  <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" value={brandSettings.company_website} onChange={(e) => setBrandSettings({ ...brandSettings, company_website: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" value={brandSettings.company_email} onChange={(e) => setBrandSettings({ ...brandSettings, company_email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" value={brandSettings.company_phone} onChange={(e) => setBrandSettings({ ...brandSettings, company_phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" value={brandSettings.company_address} onChange={(e) => setBrandSettings({ ...brandSettings, company_address: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Connect your profiles.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input
                  value={brandSettings.social_links.facebook || ''}
                  onChange={(e) => setBrandSettings({ ...brandSettings, social_links: { ...brandSettings.social_links, facebook: e.target.value } })}
                  placeholder="facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Twitter / X</Label>
                <Input
                  value={brandSettings.social_links.twitter || ''}
                  onChange={(e) => setBrandSettings({ ...brandSettings, social_links: { ...brandSettings.social_links, twitter: e.target.value } })}
                  placeholder="twitter.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={brandSettings.social_links.linkedin || ''}
                  onChange={(e) => setBrandSettings({ ...brandSettings, social_links: { ...brandSettings.social_links, linkedin: e.target.value } })}
                  placeholder="linkedin.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input
                  value={brandSettings.social_links.instagram || ''}
                  onChange={(e) => setBrandSettings({ ...brandSettings, social_links: { ...brandSettings.social_links, instagram: e.target.value } })}
                  placeholder="instagram.com/..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BILLING & BANKING TAB */}
        <TabsContent value="billing" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Legal & Tax Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Legal & Tax Identification
                </CardTitle>
                <CardDescription>Official business credentials used on invoices and client proposals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Legal Registered Business Name</Label>
                  <Input
                    placeholder="e.g. ASARR Digital Solutions Pvt. Ltd."
                    value={brandSettings.legal_business_name}
                    onChange={(e) => setBrandSettings({ ...brandSettings, legal_business_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>GSTIN</Label>
                    <Input
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      value={brandSettings.gstin}
                      onChange={(e) => setBrandSettings({ ...brandSettings, gstin: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PAN</Label>
                    <Input
                      placeholder="e.g. ABCDE1234F"
                      value={brandSettings.pan}
                      onChange={(e) => setBrandSettings({ ...brandSettings, pan: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      placeholder="Bangalore"
                      value={brandSettings.city}
                      onChange={(e) => setBrandSettings({ ...brandSettings, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State / Region</Label>
                    <Input
                      placeholder="Karnataka"
                      value={brandSettings.state}
                      onChange={(e) => setBrandSettings({ ...brandSettings, state: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input
                      placeholder="560038"
                      value={brandSettings.postal_code}
                      onChange={(e) => setBrandSettings({ ...brandSettings, postal_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      placeholder="India"
                      value={brandSettings.country}
                      onChange={(e) => setBrandSettings({ ...brandSettings, country: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoicing Defaults */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Invoice & Document Defaults
                </CardTitle>
                <CardDescription>Default numbering, currency, and tax applied to new invoices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Input
                      placeholder="INR"
                      value={brandSettings.default_currency}
                      onChange={(e) => setBrandSettings({ ...brandSettings, default_currency: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Invoice Number Prefix</Label>
                    <Input
                      placeholder="INV-ASARR-"
                      value={brandSettings.invoice_prefix}
                      onChange={(e) => setBrandSettings({ ...brandSettings, invoice_prefix: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Default Tax Rate (%)</Label>
                    <Input
                      type="number"
                      placeholder="18"
                      value={brandSettings.default_tax_rate}
                      onChange={(e) => setBrandSettings({ ...brandSettings, default_tax_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Terms</Label>
                    <Input
                      placeholder="Due on Receipt"
                      value={brandSettings.payment_terms}
                      onChange={(e) => setBrandSettings({ ...brandSettings, payment_terms: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Payment Instructions & Notes for Invoices</Label>
                  <Textarea
                    rows={3}
                    placeholder="e.g. Please wire funds with Invoice ID as reference. Send remittance advice to accounts@asarr.com"
                    value={brandSettings.payment_instructions}
                    onChange={(e) => setBrandSettings({ ...brandSettings, payment_instructions: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bank Transfer & UPI Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Bank Transfer & UPI Details
                </CardTitle>
                <CardDescription>Settlement coordinates printed on invoice footers for client payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    placeholder="e.g. HDFC Bank Ltd."
                    value={brandSettings.bank_name}
                    onChange={(e) => setBrandSettings({ ...brandSettings, bank_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Beneficiary Account Name</Label>
                  <Input
                    placeholder="e.g. ASARR DIGITAL AGENCY"
                    value={brandSettings.account_name}
                    onChange={(e) => setBrandSettings({ ...brandSettings, account_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      placeholder="50200012345678"
                      value={brandSettings.account_number}
                      onChange={(e) => setBrandSettings({ ...brandSettings, account_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC / SWIFT Code</Label>
                    <Input
                      placeholder="HDFC0001234"
                      value={brandSettings.ifsc_code}
                      onChange={(e) => setBrandSettings({ ...brandSettings, ifsc_code: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>UPI ID / VPA</Label>
                  <Input
                    placeholder="asarr@hdfcbank"
                    value={brandSettings.upi_id}
                    onChange={(e) => setBrandSettings({ ...brandSettings, upi_id: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Authorized Representative */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Authorized Representative
                </CardTitle>
                <CardDescription>Designated signing authority shown on agreements, quotes & contracts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Representative Name</Label>
                    <Input
                      placeholder="e.g. Syed Mustafa Ahmed"
                      value={brandSettings.representative_name}
                      onChange={(e) => setBrandSettings({ ...brandSettings, representative_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Designation / Title</Label>
                    <Input
                      placeholder="e.g. Managing Director / Founder"
                      value={brandSettings.representative_title}
                      onChange={(e) => setBrandSettings({ ...brandSettings, representative_title: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Official Contact Email</Label>
                    <Input
                      type="email"
                      placeholder="director@asarr.com"
                      value={brandSettings.representative_email}
                      onChange={(e) => setBrandSettings({ ...brandSettings, representative_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input
                      placeholder="+91 98765 43210"
                      value={brandSettings.representative_phone}
                      onChange={(e) => setBrandSettings({ ...brandSettings, representative_phone: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PORTFOLIO TAB */}
        <TabsContent value="portfolio" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Public Portfolio Settings</CardTitle>
              <CardDescription>Customize the appearance of your public portfolio page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input
                  value={brandSettings.portfolio_headline}
                  onChange={(e) => setBrandSettings({ ...brandSettings, portfolio_headline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sub-headline</Label>
                <Textarea
                  rows={3}
                  value={brandSettings.portfolio_subheadline}
                  onChange={(e) => setBrandSettings({ ...brandSettings, portfolio_subheadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Call to Action (Button Text)</Label>
                <Input
                  value={brandSettings.portfolio_cta_text}
                  onChange={(e) => setBrandSettings({ ...brandSettings, portfolio_cta_text: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FORM SETTINGS TAB */}
        <TabsContent value="forms" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Global Lead Form Layout</CardTitle>
              <CardDescription>Default layout for your lead capture forms.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['default', 'split', 'minimal'].map((layout) => (
                  <div
                    key={layout}
                    onClick={() => setBrandSettings({
                      ...brandSettings,
                      lead_form_config: { layout: layout as any }
                    })}
                    className={`
                            cursor-pointer rounded-xl border-2 p-6 transition-all hover:bg-muted/50 relative overflow-hidden group
                            ${brandSettings.lead_form_config?.layout === layout ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}
                        `}
                  >
                    <div className="mb-4 aspect-video rounded-lg bg-background border shadow-sm flex items-center justify-center p-4">
                      {layout === 'default' && <div className="w-1/2 h-3/4 bg-muted rounded flex flex-col gap-2 p-2"><div className="w-full h-2 bg-muted-foreground/20 rounded" /><div className="w-full h-2 bg-muted-foreground/20 rounded" /><div className="mt-auto w-full h-6 bg-primary/20 rounded" /></div>}
                      {layout === 'split' && <div className="flex gap-2 w-full h-full"><div className="w-1/2 bg-muted rounded p-2"><div className="w-full h-2 bg-muted-foreground/20 rounded" /></div><div className="w-1/2 bg-muted rounded p-2 flex flex-col justify-center"><div className="w-16 h-16 rounded-full bg-muted-foreground/10 mx-auto mb-2" /></div></div>}
                      {layout === 'minimal' && <div className="w-1/2 h-auto bg-muted rounded p-2 text-center"><div className="w-10 h-10 rounded-full bg-muted-foreground/10 mx-auto mb-2" /><div className="w-full h-2 bg-muted-foreground/20 rounded mb-2" /></div>}
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold capitalize">{layout} Layout</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {layout === 'default' && "Standard centered form"}
                        {layout === 'split' && "Side-by-side with details"}
                        {layout === 'minimal' && "Clean and simple"}
                      </p>
                    </div>
                    {brandSettings.lead_form_config?.layout === layout && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TERMS TAB */}
        <TabsContent value="terms" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
              <CardDescription>Default legal text for proposals and invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={brandSettings.terms_and_conditions}
                onChange={(e) => setBrandSettings({ ...brandSettings, terms_and_conditions: e.target.value })}
                placeholder="Enter your terms..."
                className="font-mono text-sm leading-relaxed min-h-[400px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

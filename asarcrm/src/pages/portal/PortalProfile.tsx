import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Lock,
  ShieldCheck,
  Save,
  CheckCircle2,
  KeyRound,
  Upload,
  LogOut,
} from "lucide-react";
import { Client, Profile } from "@/types";

export default function PortalProfile() {
  const { user, clientId, updatePassword, signOut } = useAuth();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password Management State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // 1. Fetch Client Organization details
  const { data: clientData, isLoading: isClientLoading } = useQuery({
    queryKey: ["client_portal_profile", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .maybeSingle();

      if (error) {
        console.warn("Could not fetch client record:", error.message);
        return null;
      }
      return data as Client;
    },
    enabled: Boolean(clientId),
  });

  // 2. Fetch User Personal Profile
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["user_personal_profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.warn("Could not fetch profile record:", error.message);
        return null;
      }
      return data as Profile;
    },
    enabled: Boolean(user?.id),
  });

  // Hydrate fields
  useEffect(() => {
    if (profileData) {
      setFullName(profileData.full_name || user?.user_metadata?.full_name || "");
      setPhone(profileData.mobile_number || profileData.company_phone || "");
      setAvatarUrl(profileData.avatar_url || profileData.logo_url || "");
    }
    if (clientData) {
      setCompanyName(clientData.company || clientData.name || "");
      if (clientData.phone) setPhone((prev) => prev || clientData.phone || "");
      if (clientData.website) setWebsite(clientData.website);
      if (clientData.address) setAddress(clientData.address);
    }
  }, [profileData, clientData, user]);

  // Save Profile Mutation
  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Authentication required.");

      // 1. Update personal profile in public.profiles (keyed by user.id)
      const { error: profileErr } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: fullName.trim(),
          mobile_number: phone.trim() || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (profileErr) throw profileErr;

      // 2. If client record is associated, update permitted client information
      if (clientId) {
        const { error: clientErr } = await supabase
          .from("clients")
          .update({
            company: companyName.trim() || undefined,
            name: fullName.trim() || undefined,
            phone: phone.trim() || null,
            website: website.trim() || null,
            address: address.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", clientId);

        if (clientErr) throw clientErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_portal_profile"] });
      queryClient.invalidateQueries({ queryKey: ["user_personal_profile"] });
      toast.success("Profile changes saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile.");
    },
  });

  // Handle Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be under 5MB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${user?.id}-${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage.from("brand-assets").upload(path, file, {
        upsert: true,
      });

      if (error) throw error;

      const { data: pubData } = supabase.storage.from("brand-assets").getPublicUrl(data.path);
      setAvatarUrl(pubData.publicUrl);
      toast.success("Avatar uploaded. Click 'Save Profile' to commit changes.");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
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

      toast.success("Password updated successfully! Your new password is now active.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setPasswordUpdating(false);
    }
  };

  const isLoading = isClientLoading || isProfileLoading;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Client Profile & Account Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal profile, company details, and authentication security.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => signOut()}
            className="text-xs border-destructive/20 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
          <Button
            onClick={() => saveProfileMutation.mutate()}
            disabled={saveProfileMutation.isPending || isLoading}
            className="min-w-[130px]"
          >
            {saveProfileMutation.isPending ? "Saving..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Account Authorization Badge */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Authorized Client Portal Account
              </p>
              <p className="text-sm font-medium text-foreground">
                Bound to: <span className="font-semibold">{user?.email}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-background text-xs border-primary/30 text-primary">
              Client Role
            </Badge>
            {clientId && (
              <Badge variant="secondary" className="text-[10px] font-mono text-muted-foreground">
                ID: {clientId.slice(0, 8)}...
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid: Personal Details & Company Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Avatar Upload */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Profile Photo / Logo</CardTitle>
            <CardDescription className="text-xs">Your personal or brand mark</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground/50" />
              )}
            </div>

            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs pointer-events-none"
                disabled={uploadingAvatar}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                {uploadingAvatar ? "Uploading..." : "Upload New Photo"}
              </Button>
            </label>
            <p className="text-[11px] text-muted-foreground text-center">
              PNG, JPG, or WEBP up to 5MB.
            </p>
          </CardContent>
        </Card>

        {/* Right: Personal & Business Fields */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Personal & Business Details</CardTitle>
            <CardDescription className="text-xs">
              Editable representative information and company contacts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client-fullname" className="text-xs">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="client-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client-company" className="text-xs">Company / Brand Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="client-company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Zest FinTech"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client-email" className="text-xs">Email Address (Read-Only)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="client-email"
                    value={user?.email || ""}
                    disabled
                    className="pl-9 text-xs bg-muted/40 cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client-phone" className="text-xs">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="client-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="client-website" className="text-xs">Business Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="client-website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourbrand.com"
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="client-address" className="text-xs">Business Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="client-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Office address, city, state, country"
                  className="pl-9 text-xs min-h-[70px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password & Security Management */}
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
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client-new-password" className="text-xs">New Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="client-new-password"
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
                <Label htmlFor="client-confirm-password" className="text-xs">Confirm New Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="client-confirm-password"
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
    </div>
  );
}

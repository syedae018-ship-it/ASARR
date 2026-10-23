import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Globe,
  Lock,
  Save,
  LogOut,
  Upload,
  KeyRound,
  ShieldAlert,
  Loader2,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { Profile } from "@/types";

export default function AdminProfile() {
  const { user, role, updatePassword, signOut } = useAuth();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Query Profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin_profile", user?.id],
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

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || user?.user_metadata?.full_name || "");
      setMobileNumber(profile.mobile_number || profile.company_phone || "");
      setJobTitle(profile.job_title || "");
      setDepartment(profile.department || "");
      setTimezone(profile.timezone || "Asia/Kolkata");
      setAvatarUrl(profile.avatar_url || profile.logo_url || "");
    } else if (user) {
      setFullName(user.user_metadata?.full_name || "");
    }
  }, [profile, user]);

  // Save Profile Details
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Authentication required.");

      const payload = {
        id: user.id,
        email: user.email,
        full_name: fullName.trim(),
        mobile_number: mobileNumber.trim() || null,
        job_title: jobTitle.trim() || null,
        department: department.trim() || null,
        timezone: timezone.trim() || "Asia/Kolkata",
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_profile"] });
      queryClient.invalidateQueries({ queryKey: ["admin_memberships"] });
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
      toast.success("Avatar photo uploaded. Click 'Save Profile' to commit.");
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
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setPasswordUpdating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal administrator identity, contact information, and authentication security."
      >
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
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || isLoading}
            className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Avatar Photo & Role Info */}
        <Card className="md:col-span-1 border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Profile Photo</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Your personal agency identification photo
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-36 h-36 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/20 group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-14 h-14 text-muted-foreground/40" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="text-xs"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  {uploadingAvatar ? "Uploading..." : "Change Photo"}
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

            {/* Role Badge (Strictly Protected / Non-Editable) */}
            <div className="w-full pt-3 border-t border-border/60 text-center space-y-2">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Assigned Workspace Role
              </span>
              <div>
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-primary/10 text-primary capitalize text-xs px-2.5 py-0.5 inline-flex items-center gap-1.5"
                >
                  {role === "owner" ? (
                    <>
                      <Crown className="w-3 h-3 text-amber-500" />
                      Primary Agency Owner
                    </>
                  ) : role === "admin" ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-primary" />
                      Agency Administrator
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3" />
                      Team Member
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed px-2">
                Privileged permissions and role assignments are controlled exclusively by agency ownership.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Personal Information */}
        <Card className="md:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Your identity across tasks, client communications, and agency operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-fullname" className="text-xs font-medium">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                    className="pl-9 text-xs bg-muted/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-email" className="text-xs font-medium">Account Email (Verified)</Label>
                  <span className="text-[10px] text-muted-foreground">Read-only</span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    value={user?.email || ""}
                    disabled
                    className="pl-9 text-xs bg-muted/40 cursor-not-allowed opacity-80 font-mono"
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
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="pl-9 text-xs bg-muted/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-jobtitle" className="text-xs font-medium">Job Title / Designation</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-jobtitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Lead Architect / Operations Director"
                    className="pl-9 text-xs bg-muted/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-dept" className="text-xs font-medium">Department</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Engineering & Design"
                    className="pl-9 text-xs bg-muted/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-tz" className="text-xs font-medium">Preferred Timezone</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-tz"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="e.g. Asia/Kolkata (IST)"
                    className="pl-9 text-xs bg-muted/20"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Management Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            <CardTitle className="text-base font-semibold">Password & Authentication Security</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Update your account password securely using Supabase Auth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
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
                    className="pl-9 text-xs bg-muted/20"
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
                    className="pl-9 text-xs bg-muted/20"
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
              {passwordUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

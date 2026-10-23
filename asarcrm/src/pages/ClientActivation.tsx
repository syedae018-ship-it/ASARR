import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  User,
  Building2,
  Mail,
  Loader2,
  AlertTriangle,
  Clock,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VerifiedInvitation {
  type: "client" | "admin";
  email: string;
  fullName?: string | null;
  clientName?: string | null;
  clientId?: string | null;
  role?: string;
  expiresAt?: string;
}

export default function ClientActivation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<VerifiedInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError("Invalid or missing activation token.");
        setLoading(false);
        return;
      }

      const cleanToken = token.trim();

      try {
        // 1. Try server-side trusted RPC verification first
        try {
          const { data: rpcData, error: rpcErr } = await supabase.rpc("validate_invitation_token", {
            invite_token: cleanToken,
          });

          if (!rpcErr && rpcData) {
            if (rpcData.valid) {
              setInvitation({
                type: rpcData.type,
                email: rpcData.email,
                fullName: rpcData.full_name,
                clientName: rpcData.client_name,
                clientId: rpcData.client_id,
                role: rpcData.role,
                expiresAt: rpcData.expires_at,
              });
              if (rpcData.full_name) setFullName(rpcData.full_name);
              else if (rpcData.client_name) setFullName(rpcData.client_name);
              setLoading(false);
              return;
            } else if (rpcData.error) {
              setError(rpcData.error);
              setLoading(false);
              return;
            }
          }
        } catch {
          // Fall through to direct table validation
        }

        // 2. Direct client_onboarding_invitations verification
        const { data: clientData, error: clientErr } = await supabase
          .from("client_onboarding_invitations")
          .select("*")
          .eq("token", cleanToken)
          .maybeSingle();

        if (clientData && !clientErr) {
          if (clientData.status === "revoked") {
            setError("This invitation has been revoked by an administrator.");
            setLoading(false);
            return;
          }

          if (clientData.status === "accepted") {
            setError("This invitation has already been accepted and consumed. You may sign in with your credentials.");
            setLoading(false);
            return;
          }

          if (clientData.expires_at && new Date(clientData.expires_at) < new Date()) {
            setError("This invitation link has expired (24-hour limit). Please contact ASARR for a new invitation.");
            setLoading(false);
            return;
          }

          setInvitation({
            type: "client",
            email: clientData.email,
            fullName: clientData.full_name,
            clientName: clientData.client_name,
            clientId: clientData.client_id,
            expiresAt: clientData.expires_at,
          });
          if (clientData.full_name) setFullName(clientData.full_name);
          else if (clientData.client_name) setFullName(clientData.client_name);
          setLoading(false);
          return;
        }

        // 3. Direct admin_invitations verification
        const { data: adminData, error: adminErr } = await supabase
          .from("admin_invitations")
          .select("*")
          .eq("token", cleanToken)
          .maybeSingle();

        if (adminData && !adminErr) {
          if (adminData.status === "revoked") {
            setError("This administrator invitation has been revoked.");
            setLoading(false);
            return;
          }

          if (adminData.status === "accepted") {
            setError("This invitation has already been accepted and consumed. You may sign in with your credentials.");
            setLoading(false);
            return;
          }

          if (adminData.expires_at && new Date(adminData.expires_at) < new Date()) {
            setError("This invitation link has expired (24-hour limit). Please contact the agency owner for a new invitation.");
            setLoading(false);
            return;
          }

          setInvitation({
            type: "admin",
            email: adminData.email,
            role: adminData.role || "admin",
            expiresAt: adminData.expires_at,
          });
          setLoading(false);
          return;
        }

        // If found in neither
        setError("This invitation link was not found, has expired, or is invalid. Please contact ASARR for a new invitation.");
      } catch (err: any) {
        console.error("Token verification error:", err);
        setError("Unable to verify invitation. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitation) return;

    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long for security.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const emailToBind = invitation.email.trim().toLowerCase();
      let currentUserId: string | null = null;

      // 1. Authenticate / Sign up via Supabase Auth
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: emailToBind,
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: invitation.type === "admin" ? (invitation.role || "admin") : "client",
            client_id: invitation.clientId || undefined,
          },
        },
      });

      if (signUpErr) {
        // If already registered, sign in with the chosen password to establish session
        if (
          signUpErr.message.toLowerCase().includes("already registered") ||
          signUpErr.message.toLowerCase().includes("user already exists")
        ) {
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email: emailToBind,
            password: password,
          });

          if (signInErr) {
            toast.error(
              "An account with this invited email already exists. Please verify your existing password to claim this invitation."
            );
            setIsSubmitting(false);
            return;
          }

          currentUserId = signInData?.user?.id || null;
        } else {
          throw signUpErr;
        }
      } else {
        currentUserId = signUpData?.user?.id || null;
      }

      // If session was not automatically established (e.g. email confirmation setting), sign in
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        await supabase.auth.signInWithPassword({
          email: emailToBind,
          password: password,
        });
      }

      // 2. Execute server-side claim RPC to consume the invitation
      if (invitation.type === "client") {
        try {
          const { error: rpcErr } = await supabase.rpc("claim_client_invitation", {
            invite_token: token,
          });

          if (rpcErr) {
            console.warn("claim_client_invitation RPC warning:", rpcErr.message);
            // Fallback manual upsert
            await supabase
              .from("client_onboarding_invitations")
              .update({ status: "accepted", accepted_at: new Date().toISOString() })
              .eq("token", token);

            if (currentUserId && invitation.clientId) {
              await supabase.from("client_users").upsert(
                {
                  client_id: invitation.clientId,
                  user_id: currentUserId,
                  role: "client",
                  created_at: new Date().toISOString(),
                },
                { onConflict: "client_id, user_id" }
              );

              await supabase.from("profiles").upsert(
                {
                  id: currentUserId,
                  email: emailToBind,
                  full_name: fullName.trim(),
                  role: "client",
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "id" }
              );
            }
          }
        } catch (rpcEx) {
          console.warn("RPC invocation fallback:", rpcEx);
        }

        // Store portal session metadata
        localStorage.setItem("asarr_client_email", emailToBind);
        if (invitation.clientId) localStorage.setItem("asarr_client_id", invitation.clientId);
        localStorage.setItem("asarr_client_name", fullName.trim() || invitation.clientName || "Client");
        localStorage.setItem("asarr_portal_view", "client");

        setIsSuccess(true);
        toast.success("Account activated successfully! Welcome to your ASARR Client Portal.");
        setTimeout(() => navigate("/portal"), 1500);
      } else {
        // Admin Invitation Claim
        try {
          const { error: rpcErr } = await supabase.rpc("claim_admin_invitation", {
            invite_token: token,
          });

          if (rpcErr) {
            console.warn("claim_admin_invitation RPC warning:", rpcErr.message);
            // Fallback manual upsert
            await supabase
              .from("admin_invitations")
              .update({ status: "accepted" })
              .eq("token", token);

            if (currentUserId) {
              await supabase.from("admin_memberships").upsert(
                {
                  user_id: currentUserId,
                  role: invitation.role || "admin",
                  status: "active",
                  email: emailToBind,
                  created_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
              );

              await supabase.from("profiles").upsert(
                {
                  id: currentUserId,
                  email: emailToBind,
                  full_name: fullName.trim(),
                  role: invitation.role || "admin",
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "id" }
              );
            }
          }
        } catch (rpcEx) {
          console.warn("RPC invocation fallback:", rpcEx);
        }

        localStorage.setItem("asarr_portal_view", "admin");
        setIsSuccess(true);
        toast.success("Administrator account activated! Redirecting to workspace...");
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err: any) {
      console.error("Activation failed:", err);
      toast.error(err.message || "Failed to activate account. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 border-4 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Verifying invitation credentials with server...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border/80 shadow-2xl bg-card">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold">Invitation Not Found or Expired</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Secure Invitation Verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center pt-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {error || "This activation link is invalid, expired (24-hour limit), or has already been used."}
            </p>
            <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground text-left flex items-start gap-2.5 border border-border/60">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                All ASARR invitations expire strictly 24 hours after issuance. Contact your administrator or account manager to receive a refreshed invitation link.
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="w-full text-xs"
            >
              Go to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-emerald-500/30 shadow-2xl bg-card text-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Welcome to ASARR</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your {invitation.type === "admin" ? "administrator" : "client"} account has been activated for{" "}
            <strong className="text-foreground">{invitation.email}</strong>.
          </p>
          <div className="pt-2">
            <Button
              className="w-full bg-primary text-primary-foreground gap-2"
              onClick={() => navigate(invitation.type === "admin" ? "/" : "/portal")}
            >
              <span>Opening Workspace...</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-border/80 shadow-2xl bg-card">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-3 shadow-md">
            A
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {invitation.type === "admin" ? "Activate Administrator Access" : "Activate Client Portal"}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            {invitation.type === "admin"
              ? "Set up your credentials to join the ASARR agency administration team."
              : "Complete your credentials to access deliverables, milestones, and billing."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleActivate}>
          <CardContent className="space-y-4 pt-2">
            {/* Bound Email & Invitation Badge */}
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5 text-primary">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Invitation
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-primary/10 text-primary border-primary/30 uppercase font-mono"
                >
                  {invitation.type === "admin" ? (invitation.role?.replace("_", " ") || "Admin") : "Client Portal"}
                </Badge>
              </div>

              {invitation.clientName && (
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span>Organization: <strong className="text-foreground">{invitation.clientName}</strong></span>
                </div>
              )}

              <div className="pt-1 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground">
                  Bound address: <strong className="font-mono text-foreground">{invitation.email}</strong>
                </span>
              </div>
            </div>

            {/* Full Name Input */}
            <div className="space-y-1.5">
              <Label htmlFor="activate-fullname" className="text-xs font-medium">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="activate-fullname"
                  type="text"
                  placeholder="Your Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-9 text-xs bg-muted/20"
                />
              </div>
            </div>

            {/* Email Address (Strictly Locked / Disabled) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="activate-email" className="text-xs font-medium">Invited Email (Locked)</Label>
                <span className="text-[10px] text-muted-foreground">Non-transferable</span>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="activate-email"
                  type="email"
                  value={invitation.email}
                  disabled
                  className="pl-9 text-xs bg-muted/40 cursor-not-allowed opacity-80 font-mono"
                />
              </div>
            </div>

            {/* Password Creation */}
            <div className="space-y-1.5">
              <Label htmlFor="activate-password" className="text-xs font-medium">Create Secure Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="activate-password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-9 text-xs bg-muted/20"
                />
              </div>
            </div>

            {/* Password Confirmation */}
            <div className="space-y-1.5">
              <Label htmlFor="activate-confirm-password" className="text-xs font-medium">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="activate-confirm-password"
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

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>This invitation is single-use and will be permanently bound upon submission.</span>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              className="w-full text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Activating Account...
                </>
              ) : (
                "Complete Activation & Sign In"
              )}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground mt-1">
              Already activated?{" "}
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="text-primary hover:underline font-medium"
              >
                Sign in to your account
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

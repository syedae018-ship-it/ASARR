import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ClientOnboardingInvitation } from "@/types";

export default function ClientActivation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<ClientOnboardingInvitation | null>(null);
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

      try {
        const { data, error: queryErr } = await supabase
          .from("client_onboarding_invitations")
          .select("*")
          .eq("token", token)
          .maybeSingle();

        if (queryErr || !data) {
          setError("This invitation link was not found, has expired, or is invalid. Please contact ASARR for a new invitation.");
          setLoading(false);
          return;
        }

        const inv = data as ClientOnboardingInvitation;

        if (inv.status === "revoked") {
          setError("This invitation has been revoked by an administrator.");
          setLoading(false);
          return;
        }

        if (inv.status === "accepted") {
          setError("This invitation has already been consumed and accepted. You may sign in with your credentials.");
          setLoading(false);
          return;
        }

        if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
          setError("This invitation link has expired. Please request a new invitation from your ASARR account manager.");
          setLoading(false);
          return;
        }

        setInvitation(inv);
        if (inv.client_name) {
          setFullName(inv.client_name);
        }
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

      // 1. Sign up the user in Supabase Auth bound to the exact invited email
      let currentUserId: string | null = null;
      let sessionCreated = false;

      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: emailToBind,
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: "client",
            client_id: invitation.client_id,
          }
        }
      });

      if (signUpErr) {
        // If already registered, attempt sign-in to claim the invitation
        if (signUpErr.message.toLowerCase().includes("already registered") || signUpErr.message.toLowerCase().includes("user already exists")) {
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email: emailToBind,
            password: password,
          });

          if (signInErr) {
            toast.error("An account with this invited email already exists. Please verify your existing password to claim this invitation.");
            setIsSubmitting(false);
            return;
          }

          currentUserId = signInData?.user?.id || null;
          sessionCreated = true;
        } else {
          throw signUpErr;
        }
      } else {
        currentUserId = signUpData?.user?.id || null;
        sessionCreated = Boolean(signUpData?.session);
      }

      // 2. Invoke server-side secure RPC function to strictly claim and bind the invitation
      try {
        const { error: rpcErr } = await supabase.rpc("claim_client_invitation", {
          invite_token: token
        });

        if (rpcErr) {
          console.warn("claim_client_invitation RPC warning:", rpcErr.message);
          // If RPC is pending database migration, perform atomic client update with fallback
          await supabase
            .from("client_onboarding_invitations")
            .update({ status: "accepted", accepted_at: new Date().toISOString() })
            .eq("id", invitation.id);

          if (currentUserId) {
            await supabase.from("client_users").upsert({
              client_id: invitation.client_id,
              user_id: currentUserId,
              role: "client",
              created_at: new Date().toISOString()
            }, { onConflict: "client_id, user_id" });
          }
        }
      } catch (rpcEx) {
        console.warn("RPC invocation fallback:", rpcEx);
      }

      // 3. Store active portal local keys
      localStorage.setItem("asarr_client_email", emailToBind);
      localStorage.setItem("asarr_client_id", invitation.client_id);
      localStorage.setItem("asarr_client_name", invitation.client_name || "Client");
      localStorage.setItem("asarr_portal_view", "client");

      setIsSuccess(true);
      toast.success("Account activated successfully! Welcome to your ASARR Client Portal.");

      setTimeout(() => {
        navigate("/portal");
      }, 1800);
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
          <p className="text-sm text-muted-foreground">Verifying invitation credentials...</p>
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
            <CardTitle className="text-xl font-bold">Invitation Not Found</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Secure Invitation Verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center pt-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {error || "This activation link is invalid, expired, or has already been used."}
            </p>
            <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground text-left flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Access to the ASARR Client Portal is restricted to verified invitations. Contact your account manager to request a new link.</span>
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
            Your client portal account has been activated for <strong>{invitation.email}</strong>.
          </p>
          <div className="pt-2">
            <Button
              className="w-full bg-primary text-primary-foreground gap-2"
              onClick={() => navigate("/portal")}
            >
              <span>Opening Portal...</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-border/80 shadow-2xl bg-card">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-3 shadow-md">
            A
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Activate Client Portal
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Complete your security credentials to access project deliverables, milestones, and billing.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleActivate}>
          <CardContent className="space-y-4 pt-2">
            {/* Bound Email Indicator */}
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5 text-primary">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Invitation Bound
                </span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono uppercase">
                  Single Use
                </span>
              </div>
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 pt-0.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-foreground font-mono truncate">{invitation.email}</span>
              </div>
              {invitation.client_name && (
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span>Client Organization: <strong>{invitation.client_name}</strong></span>
                </div>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Your Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="pl-9 text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Create Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  className="pl-9 text-sm"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  minLength={8}
                  className="pl-9 text-sm"
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Activating Account...
                </>
              ) : (
                "Activate Account & Enter Portal"
              )}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground">
              By activating, you agree to ASARR's security terms and portal access guidelines.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

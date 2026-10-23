import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Zap,
  Mail,
  Lock,
  User,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "activate" | "forgot";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite") || searchParams.get("token");
  const modeParam = searchParams.get("mode");

  const [mode, setMode] = useState<AuthMode>(() => {
    if (modeParam === "reset" || modeParam === "forgot") return "forgot";
    if (inviteToken) return "activate";
    return "signin";
  });

  const [invitation, setInvitation] = useState<any>(null);
  const [tokenInput, setTokenInput] = useState(inviteToken || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { signIn, signUp, resetPassword, loginAsDemoAdmin, loginAsDemoClient } = useAuth();
  const navigate = useNavigate();

  // Verify invitation token if present
  useEffect(() => {
    const activeToken = inviteToken || tokenInput.trim();
    if (!activeToken) return;

    let cancelled = false;

    async function checkToken() {
      // 1. Check client_onboarding_invitations
      const { data: clientInv } = await supabase
        .from("client_onboarding_invitations")
        .select("*")
        .eq("token", activeToken)
        .eq("status", "pending")
        .maybeSingle();

      if (!cancelled && clientInv) {
        setInvitation({ ...clientInv, type: "client" });
        setEmail(clientInv.email);
        setMode("activate");
        toast.info(`Client invitation verified for ${clientInv.email}`);
        return;
      }

      // 2. Check admin_invitations
      const { data: adminInv } = await supabase
        .from("admin_invitations")
        .select("*")
        .eq("token", activeToken)
        .eq("status", "pending")
        .maybeSingle();

      if (!cancelled && adminInv) {
        setInvitation({ ...adminInv, type: "admin" });
        setEmail(adminInv.email);
        setMode("activate");
        toast.info(`Administrator invitation verified for ${adminInv.email}`);
        return;
      }

      if (!cancelled && inviteToken) {
        toast.error("This invitation link is invalid or has expired.");
      }
    }

    checkToken();

    return () => {
      cancelled = true;
    };
  }, [inviteToken]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email.trim().toLowerCase(), password);
      if (error) {
        toast.error(error.message || "Failed to sign in. Please verify your credentials.");
      } else {
        toast.success("Welcome back!");
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: member } = await supabase
            .from("client_users")
            .select("client_id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (member?.client_id) {
            navigate("/portal");
          } else {
            navigate("/");
          }
        } else {
          navigate("/");
        }
      }
    } catch {
      toast.error("An unexpected error occurred. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitation) {
      toast.error("Your email is not authorized to access the ASAR Client Portal. Please contact ASAR to receive an invitation.");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long for security.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const activeToken = inviteToken || tokenInput.trim();
      const targetEmail = invitation.email.trim().toLowerCase();

      // Sign up bound strictly to the invited email
      const { error: signUpError } = await signUp(targetEmail, password, fullName.trim(), activeToken);

      if (signUpError) {
        if (signUpError.message.includes("already registered") || signUpError.message.includes("already exists")) {
          // If already registered, attempt claim via sign in
          const { error: signInErr } = await signIn(targetEmail, password);
          if (signInErr) {
            toast.error("An account with this email exists. Please sign in with your existing password to accept the invitation.");
            return;
          }
        } else {
          toast.error(signUpError.message);
          return;
        }
      }

      // Execute trusted server-side RPC to consume invitation
      if (invitation.type === "client") {
        try {
          await supabase.rpc("claim_client_invitation", { invite_token: activeToken });
        } catch (rpcErr) {
          console.warn("Client claim notice:", rpcErr);
        }
        toast.success("Account activated successfully! Redirecting to client portal...");
        setTimeout(() => navigate("/portal"), 1200);
      } else {
        try {
          await supabase.rpc("claim_admin_invitation", { invite_token: activeToken });
        } catch (rpcErr) {
          console.warn("Admin claim notice:", rpcErr);
        }
        toast.success("Account activated successfully! Redirecting to admin workspace...");
        setTimeout(() => navigate("/"), 1200);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to activate account. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase());
      setResetSent(true);
      toast.success("Password recovery instructions sent if an account matches that email.");
    } catch (err: any) {
      toast.error(err.message || "Unable to request password recovery.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 animate-scale-in border border-border/80 shadow-2xl bg-card">
          {/* Brand Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <Zap className="w-7 h-7 text-primary-foreground fill-primary-foreground/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-2xl tracking-tight leading-none">ASARR</span>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest mt-1">
                AgencyOS Security
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-xl mb-6 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setResetSent(false);
              }}
              className={cn(
                "py-2 rounded-lg transition-all text-center",
                mode === "signin"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("activate");
                setResetSent(false);
              }}
              className={cn(
                "py-2 rounded-lg transition-all text-center",
                mode === "activate"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Activate
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setResetSent(false);
              }}
              className={cn(
                "py-2 rounded-lg transition-all text-center",
                mode === "forgot"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Forgot
            </button>
          </div>

          {/* MODE 1: SIGN IN */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="text-center mb-4">
                <h1 className="text-xl font-semibold text-foreground">Welcome Back</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Sign in to access your authorized ASARR workspace or portal
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 bg-muted/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 bg-muted/30"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Authenticating..." : "Sign In to Workspace"}
              </Button>
            </form>
          )}

          {/* MODE 2: ACTIVATE INVITATION / CREATE ACCOUNT */}
          {mode === "activate" && (
            <div className="space-y-4">
              <div className="text-center mb-3">
                <h1 className="text-xl font-semibold text-foreground">
                  {invitation ? "Complete Account Activation" : "Invitation-Only Access"}
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  {invitation
                    ? `Set your password to activate access for ${invitation.email}`
                    : "ASARR Portal access requires an authorized onboarding invitation."}
                </p>
              </div>

              {invitation ? (
                <form onSubmit={handleActivate} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs space-y-0.5">
                      <p className="font-semibold text-foreground">
                        Verified {invitation.type === "admin" ? "Administrative" : "Client"} Invitation
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Authorized email: <strong className="text-foreground">{invitation.email}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activate-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="activate-name"
                        type="text"
                        placeholder="Your Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="pl-9 bg-muted/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activate-password">Create Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="activate-password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="pl-9 bg-muted/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activate-confirm-password">Confirm Password</Label>
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
                        className="pl-9 bg-muted/30"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Activating..." : "Activate & Enter Portal"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Strict Notice for Uninvited Public Visitors */}
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-destructive mx-auto" />
                    <p className="text-xs font-semibold text-foreground">
                      Access is Restricted
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your email is not authorized to access the ASAR Client Portal. Please contact ASAR to receive an invitation.
                    </p>
                  </div>

                  {/* Manual Token Verification Box */}
                  <div className="pt-2 space-y-3">
                    <Label htmlFor="manual-token" className="text-xs text-muted-foreground">
                      Have an activation link or token? Paste it below:
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="manual-token"
                          type="text"
                          placeholder="Paste token or link..."
                          value={tokenInput}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            // If user pasted a full URL, extract token
                            if (val.includes("invite=")) {
                              const match = val.match(/invite=([a-zA-Z0-9_-]+)/);
                              setTokenInput(match ? match[1] : val);
                            } else if (val.includes("/activate/")) {
                              const match = val.match(/\/activate\/([a-zA-Z0-9_-]+)/);
                              setTokenInput(match ? match[1] : val);
                            } else {
                              setTokenInput(val);
                            }
                          }}
                          className="pl-9 text-xs font-mono bg-muted/30"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={!tokenInput.trim()}
                        onClick={() => {
                          const cleanToken = tokenInput.trim();
                          window.location.href = `/portal/auth?invite=${cleanToken}`;
                        }}
                      >
                        Verify
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 3: FORGOT PASSWORD */}
          {mode === "forgot" && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h1 className="text-xl font-semibold text-foreground">Password Recovery</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your email address to receive a secure password recovery link
                </p>
              </div>

              {resetSent ? (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center space-y-3">
                  <CheckCircle2 className="w-7 h-7 text-primary mx-auto" />
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    If an authorized account is associated with <strong className="text-foreground">{email}</strong>, password recovery instructions have been dispatched.
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Please check your inbox and spam folder.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMode("signin");
                      setResetSent(false);
                    }}
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Account Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-9 bg-muted/30"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending link..." : "Send Password Reset Link"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      &larr; Return to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Development / Preview Mode Switcher */}
          <div className="pt-4 mt-6 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Development Preview:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  loginAsDemoClient();
                  navigate("/portal");
                }}
                className="text-primary hover:underline font-semibold"
              >
                Demo Client
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  loginAsDemoAdmin();
                  navigate("/");
                }}
                className="text-primary hover:underline font-semibold"
              >
                Demo Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-6 mt-6 text-sm text-muted-foreground">
          <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="/faq" className="hover:text-foreground transition-colors">Security FAQ</a>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Sparkles,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite") || searchParams.get("token");
  const modeParam = searchParams.get("mode");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Compact Forgot Password State
  const [isForgotOpen, setIsForgotOpen] = useState(modeParam === "reset" || modeParam === "forgot");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Compact Activation Token Modal State
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [activationInput, setActivationInput] = useState("");

  const { signIn, resetPassword, loginAsDemoAdmin, loginAsDemoClient } = useAuth();
  const navigate = useNavigate();

  // If page was loaded with an invite token, forward straight to the activation page
  useEffect(() => {
    if (inviteToken) {
      navigate(`/activate/${inviteToken.trim()}`, { replace: true });
    }
  }, [inviteToken, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Please enter your account email.");
      return;
    }

    setForgotLoading(true);
    try {
      const { error } = await resetPassword(forgotEmail.trim().toLowerCase());
      if (error) throw error;
      setForgotSuccess(true);
      toast.success("Password recovery link sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = activationInput.trim();
    if (!val) return;

    let extractedToken = val;
    if (val.includes("invite=")) {
      const match = val.match(/invite=([a-zA-Z0-9_-]+)/);
      if (match) extractedToken = match[1];
    } else if (val.includes("/activate/")) {
      const match = val.match(/\/activate\/([a-zA-Z0-9_-]+)/);
      if (match) extractedToken = match[1];
    }

    setIsActivateModalOpen(false);
    navigate(`/activate/${extractedToken}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl p-6 sm:p-8 border border-border/80 shadow-2xl bg-card">
          {/* Brand Header - ASARR OS */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-3 border border-primary/20">
              <Zap className="w-7 h-7 text-primary-foreground fill-primary-foreground/20" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">ASARR OS</h1>
            <p className="text-xs font-medium text-muted-foreground mt-1 max-w-xs">
              Unified Agency Operating System & Client Collaboration Workspace
            </p>
          </div>

          {/* ONE-CLICK PRESENTATION DEMO CARDS - MAROON & BEIGE MONOCHROME */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                <Sparkles className="w-3 h-3 text-primary" />
                Instant Demo Access
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Executive Admin Demo Card */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  loginAsDemoAdmin();
                  toast.success("Welcome, ASARR Executive Admin");
                  navigate("/");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    loginAsDemoAdmin();
                    navigate("/");
                  }
                }}
                className="group relative p-3.5 rounded-xl border border-primary/20 hover:border-primary bg-gradient-to-br from-primary/5 via-card to-secondary/30 hover:shadow-md hover:shadow-primary/10 transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    Admin
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Agency Workspace
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                  Projects, clients, finance, telecalling & team
                </p>
                <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <span>Enter Admin</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Client Portal Demo Card */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  loginAsDemoClient();
                  toast.success("Welcome, Client Partner");
                  navigate("/portal");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    loginAsDemoClient();
                    navigate("/portal");
                  }
                }}
                className="group relative p-3.5 rounded-xl border border-primary/20 hover:border-primary bg-gradient-to-br from-primary/5 via-card to-secondary/30 hover:shadow-md hover:shadow-primary/10 transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    Client
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Client Portal
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                  Deliverables, milestones, approvals & billing
                </p>
                <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <span>Enter Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Header Divider */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Or Sign In with Credentials
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Clean Email & Password Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="signin-email" className="text-xs font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-9 text-xs bg-muted/20 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="signin-password" className="text-xs font-medium">Password</Label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSuccess(false);
                    setIsForgotOpen(true);
                  }}
                  className="text-[11px] text-primary hover:underline font-medium"
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
                  autoComplete="current-password"
                  className="pl-9 text-xs bg-muted/20 focus-visible:ring-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 mt-2 shadow-md shadow-primary/15"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In to Workspace"
              )}
            </Button>
          </form>

          {/* Invitation Activation Link */}
          <div className="mt-6 pt-5 border-t border-border/60 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Have an invitation link or token?{" "}
              <button
                type="button"
                onClick={() => setIsActivateModalOpen(true)}
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>Activate Account</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-6 mt-6 text-xs text-muted-foreground">
          <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="/faq" className="hover:text-foreground transition-colors">Security FAQ</a>
        </div>
      </div>

      {/* COMPACT MODAL: FORGOT PASSWORD */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Reset Your Password
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter your registered account email and we'll dispatch a secure recovery link.
            </DialogDescription>
          </DialogHeader>

          {forgotSuccess ? (
            <div className="py-4 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Instructions Dispatched
                </p>
                <p className="text-xs text-muted-foreground">
                  If an authorized account matches <strong className="text-foreground">{forgotEmail}</strong>, password reset instructions are on the way.
                </p>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="w-full text-xs"
                >
                  Return to Sign In
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-xs font-medium">Account Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="name@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="pl-9 text-xs bg-muted/20"
                  />
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsForgotOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* COMPACT MODAL: ENTER INVITATION TOKEN */}
      <Dialog open={isActivateModalOpen} onOpenChange={setIsActivateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Activate with Invitation
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Paste the activation token or invitation link you received from ASARR.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTokenSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="token-input" className="text-xs font-medium">Activation Token or Full Link</Label>
              <Input
                id="token-input"
                type="text"
                placeholder="Paste token or link (e.g. inv_... or adm_...)"
                value={activationInput}
                onChange={(e) => setActivationInput(e.target.value)}
                required
                className="text-xs font-mono bg-muted/20"
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsActivateModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!activationInput.trim()}
                className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Verify & Activate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

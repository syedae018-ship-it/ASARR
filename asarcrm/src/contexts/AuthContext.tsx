import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getInstallationOwnerId } from "@/lib/database";
import {
  isDemoModeActive,
  setDemoModeActive,
  DEMO_OWNER_ID,
  DEMO_CLIENT_ID,
  DEMO_CLIENT_USER_ID,
  resetDemoData,
  getCurrentPortalView,
  setCurrentPortalView,
} from "@/lib/demoData";

export type AuthUser = User & { id: string };

export type UserRole = "owner" | "admin" | "team_member" | "client" | "unauthorized";

interface AuthContextType {
  user: AuthUser | null;
  session: unknown | null;
  loading: boolean;
  registrationOpen: boolean;
  isDemo: boolean;
  role: UserRole;
  clientId: string | null;
  switchRole: (role: UserRole) => void;
  loginAsDemoAdmin: () => void;
  loginAsDemoClient: () => void;
  resetDemo: () => void;
  signUp: (email: string, password: string, fullName: string, inviteToken?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}

const DEMO_OWNER_USER: AuthUser = {
  id: DEMO_OWNER_ID,
  app_metadata: { provider: "email", providers: ["email"], role: "owner" },
  user_metadata: { full_name: "Syed Mustafa Ahmed (ASARR Admin)" },
  aud: "authenticated",
  confirmation_sent_at: new Date().toISOString(),
  recovery_sent_at: "",
  email_change_sent_at: "",
  new_email: "",
  invited_at: "",
  action_link: "",
  email: "syed.ae018@asarr.in",
  phone: "+91 98765 43210",
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  confirmed_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  email_confirmed_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  phone_confirmed_at: "",
  last_sign_in_at: new Date().toISOString(),
  role: "authenticated",
  updated_at: new Date().toISOString(),
  identities: [],
  factors: [],
};

const DEMO_CLIENT_USER: AuthUser = {
  id: DEMO_CLIENT_USER_ID,
  app_metadata: { provider: "email", providers: ["email"], role: "client" },
  user_metadata: { full_name: "Rajesh Sharma (Zest FinTech)", client_id: DEMO_CLIENT_ID },
  aud: "authenticated",
  confirmation_sent_at: new Date().toISOString(),
  recovery_sent_at: "",
  email_change_sent_at: "",
  new_email: "",
  invited_at: "",
  action_link: "",
  email: "rajesh@zestfintech.in",
  phone: "+91 98200 11223",
  created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  confirmed_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  email_confirmed_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  phone_confirmed_at: "",
  last_sign_in_at: new Date().toISOString(),
  role: "authenticated",
  updated_at: new Date().toISOString(),
  identities: [],
  factors: [],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);
  const [role, setRole] = useState<UserRole>(() => (getCurrentPortalView() === "client" ? "client" : "owner"));
  const [clientId, setClientId] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState(false);

  const switchRole = (newRole: UserRole) => {
    setCurrentPortalView(newRole === "client" ? "client" : "admin");
    setRole(newRole);
    if (newRole === "client") {
      setClientId(DEMO_CLIENT_ID);
      setUser(DEMO_CLIENT_USER);
      setSession({ user: DEMO_CLIENT_USER });
    } else {
      setClientId(null);
      setUser(DEMO_OWNER_USER);
      setSession({ user: DEMO_OWNER_USER });
    }
  };

  const resolveUserRole = async (authUser: AuthUser | null, ownerId: string | null) => {
    if (!authUser) {
      setRole("owner");
      setClientId(null);
      return;
    }

    if (authUser.email === "syed.ae018@asarr.in" || (ownerId && authUser.id === ownerId)) {
      setRole("owner");
      setClientId(null);
      setCurrentPortalView("admin");
      return;
    }

    // Check client_users membership by stable user_id
    try {
      const { data: member } = await supabase
        .from("client_users")
        .select("id, client_id, user_id, role")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (member?.client_id) {
        setRole("client");
        setClientId(member.client_id);
        setCurrentPortalView("client");
        return;
      }
    } catch (clientErr) {
      console.warn("Client membership check notice:", clientErr);
    }

    // Check admin_memberships by user_id
    try {
      const { data: adminMember } = await supabase
        .from("admin_memberships")
        .select("role")
        .eq("user_id", authUser.id)
        .eq("status", "active")
        .maybeSingle();

      if (adminMember?.role) {
        setRole(adminMember.role as UserRole);
        setClientId(null);
        setCurrentPortalView("admin");
        return;
      }
    } catch (adminErr) {
      console.warn("Admin membership check notice:", adminErr);
    }

    // Strict security: Uninvited / unassociated accounts receive unauthorized status
    setRole("unauthorized");
    setClientId(null);
  };

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const [{ data }, ownerId] = await Promise.all([
          supabase.auth.getSession(),
          getInstallationOwnerId(),
        ]);

        if (!active) return;
        setSession(data.session);
        const authUser = (data.session?.user as AuthUser | undefined) ?? null;
        setUser(authUser);

        if (authUser) {
          await resolveUserRole(authUser, ownerId);
        }

        setRegistrationOpen(!ownerId);
      } catch (error) {
        console.warn("Supabase auth check failed:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      const authUser = (nextSession?.user as AuthUser | undefined) ?? null;
      setUser(authUser);
      if (authUser) {
        const ownerId = await getInstallationOwnerId();
        await resolveUserRole(authUser, ownerId);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const loginAsDemoAdmin = () => {
    setDemoModeActive(true);
    setIsDemo(true);
    switchRole("owner");
  };

  const loginAsDemoClient = () => {
    setDemoModeActive(true);
    setIsDemo(true);
    switchRole("client");
  };

  const resetDemo = () => {
    resetDemoData();
    window.location.reload();
  };

  const signUp = async (email: string, password: string, fullName: string, inviteToken?: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      let invitedRole: UserRole = "admin";
      let invitationRecord: any = null;

      if (inviteToken) {
        const { data: inv, error: invError } = await supabase
          .from("admin_invitations")
          .select("*")
          .eq("token", inviteToken)
          .eq("status", "pending")
          .maybeSingle();

        if (invError || !inv) {
          return { error: new Error("This administrator invitation link is invalid or expired.") };
        }

        // STRICT EMAIL BINDING ENFORCEMENT
        if (inv.email.trim().toLowerCase() !== normalizedEmail) {
          return {
            error: new Error(
              `This invitation is strictly restricted to ${inv.email}. You cannot activate with a different email address.`
            )
          };
        }

        invitedRole = inv.role as UserRole;
        invitationRecord = inv;
      } else {
        const ownerId = await getInstallationOwnerId();
        if (ownerId && !isDemo) {
          return {
            error: new Error(
              "Access is available by invitation only. Please contact ASARR to receive an invitation."
            )
          };
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (error) return { error };

      if (invitationRecord && data.user) {
        try {
          await supabase.rpc("claim_admin_invitation", { invite_token: inviteToken });
        } catch {
          // Fallback if migration 5 pending
          await supabase.from("admin_memberships").upsert({
            user_id: data.user.id,
            role: invitedRole,
            invited_by: invitationRecord.invited_by,
            status: "active"
          }, { onConflict: "user_id" });

          await supabase
            .from("admin_invitations")
            .update({ status: "accepted" })
            .eq("id", invitationRecord.id);
        }
      }

      setDemoModeActive(false);
      setIsDemo(false);
      setRegistrationOpen(false);
      if (data.session?.user) {
        setUser(data.session.user as AuthUser);
        setSession(data.session);
        setRole(invitedRole);
      }
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Unable to create account.") };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // 1. Attempt live Supabase Authentication
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Fallback for offline demo accounts if user clicks demo credentials while in demo mode
        if (isDemo && (email.includes("admin") || email.includes("demo") || email.includes("asarr"))) {
          if (role === "client") {
            loginAsDemoClient();
          } else {
            loginAsDemoAdmin();
          }
          return { error: null };
        }
        return { error };
      }

      // Successfully authenticated via Supabase!
      setDemoModeActive(false);
      setIsDemo(false);
      setUser(data.user as AuthUser);
      setSession(data.session);

      const ownerId = await getInstallationOwnerId();
      await resolveUserRole(data.user as AuthUser, ownerId);

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Unable to sign in.") };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // offline/demo
    }
    setUser(null);
    setSession(null);
    setRole("owner");
    setClientId(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/portal/auth?mode=reset`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: redirectUrl,
      });
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Failed to send password reset email") };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Failed to update password") };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        registrationOpen,
        isDemo,
        role,
        clientId: clientId || (isDemo ? DEMO_CLIENT_ID : null),
        switchRole,
        loginAsDemoAdmin,
        loginAsDemoClient,
        resetDemo,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

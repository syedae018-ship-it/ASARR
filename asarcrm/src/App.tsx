import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PortalLayout } from "@/components/portal/PortalLayout";

// Admin / Owner Pages
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Portfolio from "./pages/Portfolio";
import Clients from "./pages/Clients";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Leads from "./pages/Leads";
import Services from "./pages/Services";
import LeadForm from "./pages/LeadForm";
import LeadForms from "./pages/LeadForms";
import Templates from "./pages/Templates";
import PublicForm from "./pages/PublicForm";
import Telecalling from "./pages/Telecalling";
import ClientOnboarding from "./pages/ClientOnboarding";
import ClientActivation from "./pages/ClientActivation";
import TeamManagement from "./pages/TeamManagement";
import InvoicePrint from "./pages/InvoicePrint";
import Expenses from "./pages/Expenses";
import ExpensePrint from "./pages/ExpensePrint";

// Client Portal Pages
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalProjects from "./pages/portal/PortalProjects";
import PortalQuotes from "./pages/portal/PortalQuotes";
import PortalApprovals from "./pages/portal/PortalApprovals";
import PortalInvoices from "./pages/portal/PortalInvoices";
import PortalSupport from "./pages/portal/PortalSupport";
import PortalProfile from "./pages/portal/PortalProfile";

const queryClient = new QueryClient();

import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-sm">Loading workspace...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If client tries to view admin screens, redirect to their secure portal
  if (role === "client") {
    return <Navigate to="/portal" replace />;
  }

  if (role === "unauthorized") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-destructive/30 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Access is available by invitation only. Please contact ASARR to receive an invitation.
          </p>
          <div className="pt-2">
            <Button variant="outline" onClick={() => signOut()} className="w-full">
              Sign Out & Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function ProtectedClientRoute({ children }: { children: React.ReactNode }) {
  const { user, role, clientId, loading, signOut, isDemo } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading client portal...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Enforce explicit onboarding authorization: if authenticated user is not mapped to an authorized client record
  if (role !== "client" && !isDemo && !clientId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-destructive/30 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Access is not authorized for this account. Please contact ASARR to receive a client invitation.
          </p>
          <div className="pt-2">
            <Button variant="outline" onClick={() => signOut()} className="w-full">
              Sign Out & Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={role === "client" ? "/portal" : "/"} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={
        <PublicRoute>
          <Auth />
        </PublicRoute>
      } />

      {/* Admin Workspace Routes */}
      <Route path="/" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <Index />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/projects" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <Projects />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/portfolio" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <Portfolio />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/contact/:userId" element={<LeadForm />} />
      <Route path="/forms/:formId" element={<PublicForm />} />
      <Route path="/activate/:token" element={<ClientActivation />} />
      <Route path="/invoices/:id/print" element={<InvoicePrint />} />
      <Route path="/telecalling" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <Telecalling />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/onboarding" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <ClientOnboarding />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/team" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <TeamManagement />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/leads" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <Leads />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/lead-forms" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <LeadForms />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/services" element={<Navigate to="/portfolio" replace />} />
      <Route path="/clients" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <Clients />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <Tasks />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <Calendar />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/invoices" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <Invoices />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/expenses" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <Expenses />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/expenses/:id/print" element={
        <ProtectedAdminRoute>
          <ExpensePrint />
        </ProtectedAdminRoute>
      } />
      <Route path="/settings" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/templates" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <Templates />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/faq" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <FAQ />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/terms" element={
        <ProtectedAdminRoute>
          <DashboardLayout>
            <Terms />
          </DashboardLayout>
        </ProtectedAdminRoute>
      } />

      {/* Client Portal Routes */}
      <Route path="/portal" element={
        <ProtectedClientRoute>
          <PortalLayout>
            <PortalDashboard />
          </PortalLayout>
        </ProtectedClientRoute>
      } />
      <Route path="/portal/projects" element={
        <ProtectedClientRoute>
          <PortalLayout>
            <PortalProjects />
          </PortalLayout>
        </ProtectedClientRoute>
      } />
      <Route path="/portal/quotes" element={
        <ProtectedClientRoute>
          <PortalLayout>
            <PortalQuotes />
          </PortalLayout>
        </ProtectedClientRoute>
      } />
      <Route path="/portal/approvals" element={
        <ProtectedClientRoute>
          <PortalLayout>
            <PortalApprovals />
          </PortalLayout>
        </ProtectedClientRoute>
      } />
      <Route path="/portal/invoices" element={
        <ProtectedClientRoute>
          <PortalLayout>
            <PortalInvoices />
          </PortalLayout>
        </ProtectedClientRoute>
      } />
      <Route path="/portal/support" element={
        <ProtectedClientRoute>
          <PortalLayout>
            <PortalSupport />
          </PortalLayout>
        </ProtectedClientRoute>
      } />
      <Route path="/portal/profile" element={
        <ProtectedClientRoute>
          <PortalLayout>
            <PortalProfile />
          </PortalLayout>
        </ProtectedClientRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const baseName = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={baseName}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

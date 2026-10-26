import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortalSidebar } from "./PortalSidebar";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { Menu, ArrowRightLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface PortalLayoutProps {
  children: ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const { user, isDemo, switchRole } = useAuth();
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
      <PortalSidebar
        mobileOpen={mobileNavigationOpen}
        onMobileClose={() => setMobileNavigationOpen(false)}
      />
      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-border px-4 md:px-6 flex items-center justify-between shrink-0 bg-card/90 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavigationOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  Zest FinTech Solutions
                </p>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Account
                </span>
              </div>
              <p className="hidden text-xs text-muted-foreground sm:block">
                ASARR Dedicated Client Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-background p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

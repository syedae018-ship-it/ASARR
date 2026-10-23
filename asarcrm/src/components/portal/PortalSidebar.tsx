import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck2,
  CheckCircle2,
  Receipt,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  Zap,
  ArrowRightLeft,
  Building2,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const clientNavItems = [
  { title: "Overview", url: "/portal", icon: LayoutDashboard },
  { title: "Projects & Milestones", url: "/portal/projects", icon: FolderKanban },
  { title: "Quotations & Contracts", url: "/portal/quotes", icon: FileCheck2 },
  { title: "Deliverables & Approvals", url: "/portal/approvals", icon: CheckCircle2 },
  { title: "Invoices & Payments", url: "/portal/invoices", icon: Receipt },
  { title: "Support Desk", url: "/portal/support", icon: LifeBuoy },
  { title: "My Profile", url: "/portal/profile", icon: User },
];

interface PortalSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function PortalSidebar({ mobileOpen = false, onMobileClose }: PortalSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { switchRole, signOut, isDemo, user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-screen w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 md:sticky md:top-0 md:z-auto shrink-0 shadow-lg md:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-16" : "md:w-64"
        )}
      >
        {/* Logo & Portal Header */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground/20" />
            </div>

            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sidebar-foreground text-base tracking-tight">
                  ASARR
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-primary/90">
                  Client Portal
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Client Organization Pill */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <div className="p-2.5 rounded-lg bg-sidebar-accent/50 border border-sidebar-border/60 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-sidebar-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">
                  {localStorage.getItem("asarr_client_name") || user?.user_metadata?.client_name || "Client Organization"}
                </p>
                <p className="text-[10px] text-sidebar-foreground/60 truncate">
                  {user?.user_metadata?.full_name || user?.email || "Authorized Account"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {clientNavItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/portal"}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all",
                collapsed && "justify-center"
              )}
              activeClassName="bg-sidebar-accent text-primary font-semibold shadow-sm"
              onClick={onMobileClose}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm">{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions & Role Switching */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          {isDemo && (
            <button
              onClick={() => {
                switchRole("owner");
                navigate("/");
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-sidebar-foreground/90 bg-sidebar-accent/60 hover:bg-sidebar-accent transition-colors",
                collapsed && "justify-center"
              )}
            >
              <ArrowRightLeft className="w-4 h-4 text-primary shrink-0" />
              {!collapsed && <span>Switch to Admin View</span>}
            </button>
          )}

          <button
            onClick={async () => {
              await signOut();
              navigate("/auth");
            }}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors mt-1"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

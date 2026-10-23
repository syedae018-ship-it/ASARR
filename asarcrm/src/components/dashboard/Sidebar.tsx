import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  CalendarDays,
  FileText,
  HelpCircle,
  Globe,
  Inbox,
  Briefcase,
  PhoneCall,
  UserPlus,
  Shield,
  Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Profile } from "@/types";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Tele-Calling", url: "/telecalling", icon: PhoneCall },
  { title: "Leads", url: "/leads", icon: Inbox },
  { title: "Lead Forms", url: "/lead-forms", icon: FileText },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Onboarding", url: "/onboarding", icon: UserPlus },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Invoices", url: "/invoices", icon: FileText },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Team", url: "/team", icon: Shield },
  { title: "Portfolio & Site", url: "/portfolio", icon: Globe },
];

const bottomNavItems = [
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "FAQ", url: "/faq", icon: HelpCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface SidebarProps {
  profile?: Profile | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ profile, mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-screen w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 md:sticky md:top-0 md:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-16" : "md:w-64"
        )}
      >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {profile?.logo_url ? (
            <img
              src={profile.logo_url}
              alt="Logo"
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
          )}

          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground text-lg truncate max-w-[170px]">
              {profile?.company_name || "ASARR Digital Agency"}
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
              collapsed && "justify-center"
            )}
            activeClassName="bg-sidebar-accent text-[#F3EDE2] font-semibold border-l-2 border-[#B93246] pl-2.5"
            onClick={onMobileClose}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
              collapsed && "justify-center"
            )}
            activeClassName="bg-sidebar-accent text-[#F3EDE2] font-semibold border-l-2 border-[#B93246] pl-2.5"
            onClick={onMobileClose}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
          </NavLink>
        ))}

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
      </aside>
    </>
  );
}

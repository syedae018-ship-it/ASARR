import { ReactNode, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { Menu, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/database";
import { doc, getDoc } from "@/lib/database";
import { Profile } from "@/types";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isDemo, resetDemo, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  // Smooth scroll reset on route change without jarring jumps
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  // Fetch brand colors to apply globally
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const docRef = doc(db, "profiles", user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Profile;
      }
      return null;
    },
    enabled: !!user?.id,
  });

  // ASARR Signature Palette: Uncompromising Royal Maroon (#7A1B28) & Warm Beige Monochrome
  const ASARR_MAROON_HSL = '351 64% 29%';
  const ASARR_BEIGE_HSL = '38 40% 96%';

  return (
    <div
      className="flex min-h-screen w-full bg-background"
      style={{
        '--primary': ASARR_MAROON_HSL,
        '--primary-foreground': ASARR_BEIGE_HSL,
        '--ring': ASARR_MAROON_HSL,
      } as React.CSSProperties}
    >
      <Sidebar
        profile={profile}
        mobileOpen={mobileNavigationOpen}
        onMobileClose={() => setMobileNavigationOpen(false)}
      />
      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border px-4 md:px-6 flex items-center justify-between shrink-0 bg-background/90 backdrop-blur-xl sticky top-0 z-30">
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
              <p className="text-sm font-semibold text-foreground">
                ASARR OS
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">Private workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>
        <main ref={mainRef} className="flex-1 overflow-auto bg-muted/25">
          <div key={location.pathname} className="animate-in fade-in-50 duration-200 ease-out motion-reduce:animate-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper to convert hex to HSL for shadcn compatibility (assuming shadcn uses HSL variables)
function hexToHsl(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '351 64% 29%'; // Default ASARR Maroon

  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h: number = 0, s: number;
  const l: number = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // format: H S% L%
  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

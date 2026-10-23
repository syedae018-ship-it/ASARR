import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Globe,
  Sparkles,
  Save,
  Send,
  RotateCcw,
  ExternalLink,
  Upload,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  CheckCircle2,
  AlertCircle,
  Palette,
  Image as ImageIcon,
  Layers,
  PhoneCall,
  LayoutTemplate,
  Sliders,
  History,
  Check,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { uploadPublicFile } from "@/lib/database";

export interface WebsiteContentData {
  hero: {
    eyebrow: string;
    heading: string;
    subtext: string;
    primary_cta_text: string;
    primary_cta_link: string;
    secondary_cta_text: string;
    secondary_cta_link: string;
    logo_url: string;
  };
  what_we_do: {
    eyebrow: string;
    title: string;
    description: string;
    services: Array<{
      id: string;
      number: string;
      title: string;
      description: string;
      capabilities: string;
      image: string;
      alt: string;
    }>;
  };
  selected_work: {
    eyebrow: string;
    title: string;
    archive_label: string;
    projects: Array<{
      id: string;
      number: string;
      name: string;
      category: string;
      description: string;
      details: string;
      tags: string[];
      image: string;
      alt: string;
      frameBg: string;
      objectFit: "cover" | "contain";
      isWide?: boolean;
    }>;
  };
  final_cta: {
    eyebrow: string;
    heading_line1: string;
    heading_line2_prefix: string;
    heading_line2_brand: string;
    description: string;
    primary_cta_text: string;
    secondary_cta_text: string;
    email: string;
    phone: string;
  };
  footer: {
    description: string;
    copyright: string;
    social_links: {
      instagram?: string;
      youtube?: string;
      linkedin?: string;
      twitter?: string;
    };
  };
  brand_tokens: {
    primary_color: string;
    secondary_color: string;
    background_color: string;
    foreground_color: string;
    accent_color: string;
  };
}

const DEFAULT_CONTENT: WebsiteContentData = {
  hero: {
    eyebrow: "IDEAS THAT LEAVE AN",
    heading: "Digital experiences that create Enduring Impact.",
    subtext: "A creative and tech agency helping brands grow through strategy, content, marketing, websites and apps. We turn ideas into experiences that people remember.",
    primary_cta_text: "Start a Project",
    primary_cta_link: "#contact",
    secondary_cta_text: "Explore Work",
    secondary_cta_link: "#work",
    logo_url: "/images/brand/asarr_logo_white.png",
  },
  what_we_do: {
    eyebrow: "WHAT WE DO",
    title: "Five Pillars of Production",
    description: "End-to-end strategic, creative, and technical capabilities designed to turn ambitious ideas into market-defining digital products.",
    services: [
      {
        id: "svc-websites",
        number: "01",
        title: "Websites",
        description: "Modern, high-performance websites that turn visitors into customers.",
        capabilities: "Next.js · E-commerce · Landing Pages · Web Apps",
        image: "/images/services/svc_websites.jpg",
        alt: "Premium website interface displayed on MacBook Pro",
      },
      {
        id: "svc-software",
        number: "02",
        title: "Custom Softwares",
        description: "Tailor-made solutions to simplify operations and scale your business.",
        capabilities: "SaaS Platforms · Dashboards · CRM · Business Tools",
        image: "/images/services/svc_software.jpg",
        alt: "Business analytics dashboard on iMac",
      },
      {
        id: "svc-apps",
        number: "03",
        title: "Apps",
        description: "Native and cross-platform apps built for real-world impact.",
        capabilities: "iOS · Android · React Native · Flutter",
        image: "/images/services/svc_apps.jpg",
        alt: "Three smartphones showcasing polished mobile app UI screens",
      },
      {
        id: "svc-content",
        number: "04",
        title: "Content Creation",
        description: "Scroll-stopping content that brings your brand to life across every platform.",
        capabilities: "Brand Films · Photography · Reels · Post-Production",
        image: "/images/services/svc_content.jpg",
        alt: "Professional cinema camera in production studio",
      },
      {
        id: "svc-marketing",
        number: "05",
        title: "Digital Marketing",
        description: "Strategy-driven marketing to grow your audience and revenue.",
        capabilities: "Performance Ads · SEO · Social Media · Analytics",
        image: "/images/services/svc_marketing.jpg",
        alt: "Digital marketing campaign metrics and growth charts",
      },
    ],
  },
  selected_work: {
    eyebrow: "SELECTED WORK",
    title: "Five Select Productions",
    archive_label: "2025 — 2026 ARCHIVE",
    projects: [
      {
        id: "star-kids-kingdom",
        number: "01",
        name: "STAR KIDS KINGDOM",
        category: "WEBSITE DESIGN & DEVELOPMENT · EDUCATION",
        description: "A custom website for an NTT and ECCE teacher-training academy that also offers preschool and daycare services.",
        details: "Built to establish institutional credibility in RT Nagar, Bengaluru. Features responsive program discovery, dynamic curriculum highlights, parent inquiry workflows, and direct admissions onboarding.",
        tags: ["Teacher Training Portal", "Preschool & Daycare", "Admissions Funnel", "Curriculum Showcase"],
        image: "/images/work/star-kids-kingdom.png",
        alt: "Star Kids Kingdom teacher-training academy, preschool and daycare website",
        frameBg: "#FAF6EF",
        objectFit: "cover",
      },
      {
        id: "tripmaster",
        number: "02",
        name: "TRIPMASTER",
        category: "CUSTOM SOFTWARE · TRAVEL MANAGEMENT",
        description: "An end-to-end travel booking and management system designed to bring travel experiences and booking workflows together.",
        details: "Architected for modern travelers and tour operators with sub-second package discovery, custom itinerary builders, trending destination portals, and automated reservation management.",
        tags: ["Custom Booking Engine", "Travel CRM", "Package Discovery", "Itinerary Builder"],
        image: "/images/work/tripmaster.png",
        alt: "Tripmaster end-to-end travel booking and management platform",
        frameBg: "#020616",
        objectFit: "contain",
      },
      {
        id: "kraftaura",
        number: "03",
        name: "KRAFTAURA",
        category: "CUSTOM SOFTWARE · E-COMMERCE SAAS",
        description: "A multi-tenant online store builder that enables businesses to create branded storefronts and receive a deployable store link.",
        details: "Engineered for direct-to-consumer merchants across India. Features automated catalog publishing, custom subdomain routing, WhatsApp commerce tools, and instant payment gateway integrations.",
        tags: ["Multi-Tenant SaaS", "Storefront Engine", "WhatsApp Commerce", "Payment Gateway"],
        image: "/images/work/kraftaura.png",
        alt: "KraftAURA multi-tenant online store builder preview",
        frameBg: "#170A0F",
        objectFit: "cover",
      },
      {
        id: "tripmaster-social",
        number: "04",
        name: "TRIPMASTER — SOCIAL MEDIA",
        category: "SOCIAL MEDIA MANAGEMENT · CONTENT CREATION",
        description: "Travel-focused social media content, destination storytelling and short-form video creative for Tripmaster.",
        details: "High-impact visual narratives filmed across Malaysia and the Maldives. Combining cinematic drone footage, energetic sound design, on-screen typography, and destination discovery to scale organic travel engagement.",
        tags: ["Short-Form Reels", "Destination Storytelling", "Cinematic Video", "Social Media Growth"],
        image: "/images/work/tripmaster-social-enhanced.webp",
        alt: "Tripmaster travel reels and destination storytelling creative",
        frameBg: "#07090D",
        objectFit: "cover",
        isWide: true,
      },
      {
        id: "shaik-sab",
        number: "05",
        name: "SHAIK SAB",
        category: "WEBSITE DESIGN & DEVELOPMENT · FRAGRANCE & E-COMMERCE",
        description: "A bespoke perfume-brand website featuring product discovery and a premium visual presentation.",
        details: "Crafted for artisanal Arabian perfumery and royal oud. Unites tactile sensory visuals, an interactive notes finder, luxury product carousels, and a sub-50ms headless shopping experience.",
        tags: ["Headless E-Commerce", "Luxury Fragrance", "Sensory Discovery", "Interactive Carousel"],
        image: "/images/work/shaik-sab.png",
        alt: "Shaik Sab bespoke luxury fragrance and royal oud storefront",
        frameBg: "#FFFFFF",
        objectFit: "cover",
      },
    ],
  },
  final_cta: {
    eyebrow: "LET'S BUILD TOGETHER",
    heading_line1: "READY TO CREATE",
    heading_line2_prefix: "YOUR NEXT",
    heading_line2_brand: "ASARR",
    description: "Let's bring your ideas to life with powerful content, marketing and technology. Reach out to schedule a consultation with our leadership.",
    primary_cta_text: "Start a Project",
    secondary_cta_text: "Schedule a Call",
    email: "contact@asarr.agency",
    phone: "+91 98765 43210",
  },
  footer: {
    description: "A creative and tech agency helping brands grow through content, marketing, websites and apps.",
    copyright: "© 2026 ASARR. All rights reserved.",
    social_links: {
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
  },
  brand_tokens: {
    primary_color: "#6F1420",
    secondary_color: "#E8DED3",
    background_color: "#F3EEE7",
    foreground_color: "#171515",
    accent_color: "#821827",
  },
};

const COLOR_PRESETS = [
  { name: "ASARR Royal Maroon", primary: "#6F1420", secondary: "#E8DED3", accent: "#821827", bg: "#F3EEE7", fg: "#171515" },
  { name: "Deep Oxblood & Cream", primary: "#7A1B28", secondary: "#F3EDE2", accent: "#B93246", bg: "#FAF6F0", fg: "#11100F" },
  { name: "Midnight Obsidian", primary: "#1E293B", secondary: "#94A3B8", accent: "#3B82F6", bg: "#0F172A", fg: "#F8FAFC" },
  { name: "Artisanal Terracotta", primary: "#C2410C", secondary: "#FFEDD5", accent: "#EA580C", bg: "#FFF7ED", fg: "#1C1917" },
  { name: "Emerald Studio", primary: "#047857", secondary: "#D1FAE5", accent: "#059669", bg: "#F0FDF4", fg: "#064E3B" },
];

export default function Portfolio() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("hero");
  const [isSchemaPending, setIsSchemaPending] = useState(false);
  const [draftContent, setDraftContent] = useState<WebsiteContentData>(() => {
    try {
      const saved = localStorage.getItem("asarr_local_website_draft");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CONTENT;
  });
  const [publishedVersion, setPublishedVersion] = useState<number>(1);
  const [isDirty, setIsDirty] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadTarget, setActiveUploadTarget] = useState<{
    section: "hero_logo" | "service" | "project";
    index?: number;
  } | null>(null);

  // Fetch Published and Draft records from Supabase
  const { data: serverContent, isLoading } = useQuery({
    queryKey: ["website_content_editor"],
    queryFn: async () => {
      try {
        const { data: rows, error } = await supabase
          .from("website_content")
          .select("*")
          .in("id", ["published", "draft"]);

        if (error) {
          if (error.message?.includes("Could not find the table") || error.code === "PGRST204" || error.code === "42P01") {
            setIsSchemaPending(true);
          }
          console.warn("Could not query website_content table (schema pending):", error.message);
          return null;
        }

        setIsSchemaPending(false);
        const draftRow = rows?.find((r: any) => r.id === "draft");
        const pubRow = rows?.find((r: any) => r.id === "published");

        return {
          draft: draftRow || pubRow || null,
          published: pubRow || null,
        };
      } catch (err: any) {
        if (err?.message?.includes("Could not find the table")) {
          setIsSchemaPending(true);
        }
        console.warn("website_content error:", err);
        return null;
      }
    },
  });

  useEffect(() => {
    if (serverContent?.draft) {
      const d = serverContent.draft;
      setDraftContent({
        hero: { ...DEFAULT_CONTENT.hero, ...(d.hero || {}) },
        what_we_do: {
          ...DEFAULT_CONTENT.what_we_do,
          ...(d.what_we_do || {}),
          services: Array.isArray(d.services) && d.services.length > 0 ? d.services : DEFAULT_CONTENT.what_we_do.services,
        },
        selected_work: {
          ...DEFAULT_CONTENT.selected_work,
          ...(d.selected_work_meta || {}),
          projects: Array.isArray(d.selected_work) && d.selected_work.length > 0 ? d.selected_work : DEFAULT_CONTENT.selected_work.projects,
        },
        final_cta: { ...DEFAULT_CONTENT.final_cta, ...(d.final_cta || {}) },
        footer: { ...DEFAULT_CONTENT.footer, ...(d.footer || {}) },
        brand_tokens: { ...DEFAULT_CONTENT.brand_tokens, ...(d.brand_tokens || {}) },
      });
      setPublishedVersion(serverContent.published?.version || d.version || 1);
    }
  }, [serverContent]);

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        id: "draft",
        version: publishedVersion,
        hero: draftContent.hero,
        what_we_do: {
          eyebrow: draftContent.what_we_do.eyebrow,
          title: draftContent.what_we_do.title,
          description: draftContent.what_we_do.description,
        },
        services: draftContent.what_we_do.services,
        selected_work: draftContent.selected_work.projects,
        selected_work_meta: {
          eyebrow: draftContent.selected_work.eyebrow,
          title: draftContent.selected_work.title,
          archive_label: draftContent.selected_work.archive_label,
        },
        final_cta: draftContent.final_cta,
        footer: draftContent.footer,
        brand_tokens: draftContent.brand_tokens,
        updated_by: user?.id || null,
        updated_at: new Date().toISOString(),
      };

      // Always save to localStorage so the user never loses work
      localStorage.setItem("asarr_local_website_draft", JSON.stringify(draftContent));

      const { error } = await supabase.from("website_content").upsert(payload, { onConflict: "id" });
      if (error) {
        if (error.message?.includes("Could not find the table") || error.code === "PGRST204" || error.code === "42P01") {
          setIsSchemaPending(true);
          return { localOnly: true };
        }
        throw error;
      }
      return { localOnly: false };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["website_content_editor"] });
      setIsDirty(false);
      if (result?.localOnly) {
        toast.info("Draft saved locally! Run the migration in Supabase SQL Editor to enable live cloud publishing.");
      } else {
        toast.success("Website changes saved as Draft in Supabase. Click 'Publish Changes' to update the live site.");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save draft.");
    },
  });

  // Publish Changes Mutation (Promotes Draft to Live 'published')
  const publishMutation = useMutation({
    mutationFn: async () => {
      const nextVersion = publishedVersion + 1;
      const now = new Date().toISOString();

      const payload = {
        id: "published",
        version: nextVersion,
        hero: draftContent.hero,
        what_we_do: {
          eyebrow: draftContent.what_we_do.eyebrow,
          title: draftContent.what_we_do.title,
          description: draftContent.what_we_do.description,
        },
        services: draftContent.what_we_do.services,
        selected_work: draftContent.selected_work.projects,
        selected_work_meta: {
          eyebrow: draftContent.selected_work.eyebrow,
          title: draftContent.selected_work.title,
          archive_label: draftContent.selected_work.archive_label,
        },
        final_cta: draftContent.final_cta,
        footer: draftContent.footer,
        brand_tokens: draftContent.brand_tokens,
        updated_by: user?.id || null,
        updated_at: now,
        published_at: now,
      };

      localStorage.setItem("asarr_local_website_draft", JSON.stringify(draftContent));

      // 1. Save published row
      const { error: pubErr } = await supabase.from("website_content").upsert(payload, { onConflict: "id" });
      if (pubErr) {
        if (pubErr.message?.includes("Could not find the table") || pubErr.code === "PGRST204" || pubErr.code === "42P01") {
          setIsSchemaPending(true);
          throw new Error("Supabase table 'public.website_content' does not exist yet. Please run the migration script in your Supabase SQL Editor.");
        }
        throw pubErr;
      }

      // 2. Also keep draft synchronized
      await supabase.from("website_content").upsert({ ...payload, id: "draft" }, { onConflict: "id" });

      // 3. Log into website_content_history for audit trail
      try {
        await supabase.from("website_content_history").insert({
          version: nextVersion,
          content_snapshot: payload,
          published_by: user?.id || null,
          published_at: now,
          changelog: `Published update v${nextVersion} via ASARR Portfolio Workspace`,
        });
      } catch (histErr) {
        console.warn("History snapshot notice:", histErr);
      }

      return nextVersion;
    },
    onSuccess: (ver) => {
      queryClient.invalidateQueries({ queryKey: ["website_content_editor"] });
      setPublishedVersion(ver);
      setIsDirty(false);
      toast.success(`Published v${ver} live to ASARR website in real-time!`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to publish live website update.");
    },
  });

  // Revert Draft to Published
  const handleRevert = () => {
    if (!confirm("Discard all unpublished changes and revert to the live published version?")) return;
    if (serverContent?.published) {
      const p = serverContent.published;
      setDraftContent({
        hero: { ...DEFAULT_CONTENT.hero, ...(p.hero || {}) },
        what_we_do: {
          ...DEFAULT_CONTENT.what_we_do,
          ...(p.what_we_do || {}),
          services: Array.isArray(p.services) && p.services.length > 0 ? p.services : DEFAULT_CONTENT.what_we_do.services,
        },
        selected_work: {
          ...DEFAULT_CONTENT.selected_work,
          projects: Array.isArray(p.selected_work) && p.selected_work.length > 0 ? p.selected_work : DEFAULT_CONTENT.selected_work.projects,
        },
        final_cta: { ...DEFAULT_CONTENT.final_cta, ...(p.final_cta || {}) },
        footer: { ...DEFAULT_CONTENT.footer, ...(p.footer || {}) },
        brand_tokens: { ...DEFAULT_CONTENT.brand_tokens, ...(p.brand_tokens || {}) },
      });
    } else {
      setDraftContent(DEFAULT_CONTENT);
    }
    setIsDirty(false);
    toast.info("Reverted back to published version.");
  };

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadTarget) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit. Please upload an optimized image.");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `web-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const bucket = activeUploadTarget.section === "hero_logo" ? "brand-assets" : "project-images";

      const publicUrl = await uploadPublicFile(bucket, fileName, file);

      if (activeUploadTarget.section === "hero_logo") {
        setDraftContent(prev => ({
          ...prev,
          hero: { ...prev.hero, logo_url: publicUrl }
        }));
      } else if (activeUploadTarget.section === "service" && activeUploadTarget.index !== undefined) {
        const updatedServices = [...draftContent.what_we_do.services];
        updatedServices[activeUploadTarget.index].image = publicUrl;
        setDraftContent(prev => ({
          ...prev,
          what_we_do: { ...prev.what_we_do, services: updatedServices }
        }));
      } else if (activeUploadTarget.section === "project" && activeUploadTarget.index !== undefined) {
        const updatedProjects = [...draftContent.selected_work.projects];
        updatedProjects[activeUploadTarget.index].image = publicUrl;
        setDraftContent(prev => ({
          ...prev,
          selected_work: { ...prev.selected_work, projects: updatedProjects }
        }));
      }

      setIsDirty(true);
      toast.success("Image uploaded and replaced successfully!");
    } catch (err: any) {
      console.error("Image upload failed:", err);
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      setActiveUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerImageUpload = (section: "hero_logo" | "service" | "project", index?: number) => {
    setActiveUploadTarget({ section, index });
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* Hidden File Input for Image Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
      />

      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Globe className="w-7 h-7 text-primary" />
              Website & Portfolio Customizer
            </h1>
            <Badge variant="outline" className="text-xs font-mono">
              v{publishedVersion} {isDirty ? "● Unsaved Draft" : "● Live Published"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Edit text, upload imagery, customize brand colors, and publish updates in real-time to the live ASARR marketing website.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5"
            onClick={() => window.open("/", "_blank")}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Live Website
          </Button>

          {isDirty && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1.5"
              onClick={handleRevert}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Revert
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            className="h-9 text-xs gap-1.5"
            onClick={() => saveDraftMutation.mutate()}
            disabled={saveDraftMutation.isPending || !isDirty}
          >
            <Save className="w-3.5 h-3.5" />
            {saveDraftMutation.isPending ? "Saving..." : "Save Draft"}
          </Button>

          <Button
            size="sm"
            className="h-9 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
          >
            <Send className="w-3.5 h-3.5" />
            {publishMutation.isPending ? "Publishing..." : "Publish Changes"}
          </Button>
        </div>
      </div>

      {/* Migration Notice Banner */}
      {isSchemaPending && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs md:text-sm animate-in fade-in-50 duration-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Supabase Database Migration Required</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                The cloud table <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">public.website_content</code> has not been executed in your Supabase project yet. Your edits are currently cached locally in this browser.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 text-xs border-amber-500/40 hover:bg-amber-500/15"
            onClick={() => {
              const sql = `-- Run in Supabase SQL Editor:
create table if not exists public.website_content (
  id text primary key,
  version integer not null default 1,
  hero jsonb not null default '{}'::jsonb,
  what_we_do jsonb not null default '{}'::jsonb,
  services jsonb not null default '[]'::jsonb,
  selected_work jsonb not null default '[]'::jsonb,
  final_cta jsonb not null default '{}'::jsonb,
  footer jsonb not null default '{}'::jsonb,
  brand_tokens jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.website_content_history (
  id uuid primary key default gen_random_uuid(),
  version integer not null,
  content_snapshot jsonb not null,
  published_by uuid references auth.users(id),
  published_at timestamptz not null default now(),
  changelog text
);

alter table public.website_content enable row level security;
alter table public.website_content_history enable row level security;

drop policy if exists "public reads published website content" on public.website_content;
create policy "public reads published website content" on public.website_content for select to public using (id = 'published');

drop policy if exists "admins manage website content" on public.website_content;
create policy "admins manage website content" on public.website_content for all to authenticated using (true) with check (true);

drop policy if exists "admins manage website history" on public.website_content_history;
create policy "admins manage website history" on public.website_content_history for all to authenticated using (true) with check (true);`;
              navigator.clipboard.writeText(sql);
              toast.success("SQL copied! Paste and run in your Supabase SQL Editor.");
            }}
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Migration SQL
          </Button>
        </div>
      )}

      {/* Main Tabs Workspace */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-card border border-border h-11 p-1 gap-1 min-w-max">
            <TabsTrigger value="hero" className="text-xs font-semibold gap-1.5 px-3">
              <Sparkles className="w-3.5 h-3.5" /> Hero & Narrative
            </TabsTrigger>
            <TabsTrigger value="what_we_do" className="text-xs font-semibold gap-1.5 px-3">
              <Layers className="w-3.5 h-3.5" /> What We Do (5 Pillars)
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-xs font-semibold gap-1.5 px-3">
              <LayoutTemplate className="w-3.5 h-3.5" /> Selected Work ({draftContent.selected_work.projects.length})
            </TabsTrigger>
            <TabsTrigger value="final_cta" className="text-xs font-semibold gap-1.5 px-3">
              <PhoneCall className="w-3.5 h-3.5" /> Final CTA & Contact
            </TabsTrigger>
            <TabsTrigger value="brand_tokens" className="text-xs font-semibold gap-1.5 px-3">
              <Palette className="w-3.5 h-3.5" /> Brand Colors & Tokens
            </TabsTrigger>
            <TabsTrigger value="footer" className="text-xs font-semibold gap-1.5 px-3">
              <Globe className="w-3.5 h-3.5" /> Footer & Socials
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: HERO & BRAND NARRATIVE                                             */}
        {/* ========================================================================= */}
        <TabsContent value="hero" className="space-y-6 m-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-border/80 shadow-sm bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Hero Typography & Studio Manifesto</CardTitle>
                  <CardDescription className="text-xs">
                    The prominent headline and studio manifesto seen by first-time visitors on the homepage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Eyebrow Tagline
                    </Label>
                    <Input
                      value={draftContent.hero.eyebrow}
                      onChange={(e) => {
                        setDraftContent(prev => ({
                          ...prev,
                          hero: { ...prev.hero, eyebrow: e.target.value }
                        }));
                        setIsDirty(true);
                      }}
                      placeholder="e.g. IDEAS THAT LEAVE AN"
                      className="font-mono text-xs uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Hero Monumental Headline (Italicized Subtext)
                    </Label>
                    <Input
                      value={draftContent.hero.heading}
                      onChange={(e) => {
                        setDraftContent(prev => ({
                          ...prev,
                          hero: { ...prev.hero, heading: e.target.value }
                        }));
                        setIsDirty(true);
                      }}
                      placeholder="Digital experiences that create Enduring Impact."
                      className="font-serif italic text-base"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Studio Manifesto / Supporting Subtext
                    </Label>
                    <Textarea
                      value={draftContent.hero.subtext}
                      onChange={(e) => {
                        setDraftContent(prev => ({
                          ...prev,
                          hero: { ...prev.hero, subtext: e.target.value }
                        }));
                        setIsDirty(true);
                      }}
                      rows={3}
                      className="text-xs leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Primary CTA Button Text</Label>
                      <Input
                        value={draftContent.hero.primary_cta_text}
                        onChange={(e) => {
                          setDraftContent(prev => ({
                            ...prev,
                            hero: { ...prev.hero, primary_cta_text: e.target.value }
                          }));
                          setIsDirty(true);
                        }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Primary CTA Link Target</Label>
                      <Input
                        value={draftContent.hero.primary_cta_link}
                        onChange={(e) => {
                          setDraftContent(prev => ({
                            ...prev,
                            hero: { ...prev.hero, primary_cta_link: e.target.value }
                          }));
                          setIsDirty(true);
                        }}
                        placeholder="#contact"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Logo / Asset Manager */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-border/80 shadow-sm bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Brand Logo Asset</CardTitle>
                  <CardDescription className="text-xs">
                    Rendered in hero, navigation, and global footer.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-col items-center">
                  <div className="w-full h-32 rounded-xl bg-[#11100F] border border-border flex items-center justify-center p-4 relative group overflow-hidden">
                    {draftContent.hero.logo_url ? (
                      <img
                        src={draftContent.hero.logo_url}
                        alt="Logo Preview"
                        className="max-h-16 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">ASARR</span>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs gap-1.5"
                        onClick={() => triggerImageUpload("hero_logo")}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Replace Logo
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5"
                    onClick={() => triggerImageUpload("hero_logo")}
                    disabled={uploadingImage}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImage ? "Uploading to Storage..." : "Upload New Logo Asset"}
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center">
                    Stored safely in Supabase <code className="text-primary font-mono">brand-assets</code>. Supports transparent PNG, SVG, WEBP.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: WHAT WE DO (5 PILLARS)                                             */}
        {/* ========================================================================= */}
        <TabsContent value="what_we_do" className="space-y-6 m-0">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold">Five Pillars of Production</CardTitle>
              <CardDescription className="text-xs">
                Customize titles, capabilities, descriptions, and thumbnail graphics rendered across the five desktop service columns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-border/60">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Section Eyebrow</Label>
                  <Input
                    value={draftContent.what_we_do.eyebrow}
                    onChange={(e) => {
                      setDraftContent(prev => ({
                        ...prev,
                        what_we_do: { ...prev.what_we_do, eyebrow: e.target.value }
                      }));
                      setIsDirty(true);
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Section Title</Label>
                  <Input
                    value={draftContent.what_we_do.title}
                    onChange={(e) => {
                      setDraftContent(prev => ({
                        ...prev,
                        what_we_do: { ...prev.what_we_do, title: e.target.value }
                      }));
                      setIsDirty(true);
                    }}
                  />
                </div>
              </div>

              {/* Service Modules Cards */}
              <div className="space-y-4">
                {draftContent.what_we_do.services.map((svc, idx) => (
                  <div
                    key={svc.id}
                    className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="font-mono text-xs">{svc.number}</Badge>
                        <h4 className="text-sm font-bold text-foreground">{svc.title}</h4>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1.5"
                        onClick={() => triggerImageUpload("service", idx)}
                      >
                        <Upload className="w-3 h-3" />
                        Replace Card Image
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Thumbnail Preview */}
                      <div className="md:col-span-3">
                        <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-border bg-black/10 relative">
                          <img
                            src={svc.image}
                            alt={svc.alt || svc.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="md:col-span-9 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Service Title</Label>
                            <Input
                              value={svc.title}
                              onChange={(e) => {
                                const list = [...draftContent.what_we_do.services];
                                list[idx].title = e.target.value;
                                setDraftContent(prev => ({
                                  ...prev,
                                  what_we_do: { ...prev.what_we_do, services: list }
                                }));
                                setIsDirty(true);
                              }}
                              className="text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Capabilities Tagline</Label>
                            <Input
                              value={svc.capabilities}
                              onChange={(e) => {
                                const list = [...draftContent.what_we_do.services];
                                list[idx].capabilities = e.target.value;
                                setDraftContent(prev => ({
                                  ...prev,
                                  what_we_do: { ...prev.what_we_do, services: list }
                                }));
                                setIsDirty(true);
                              }}
                              className="text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={svc.description}
                            onChange={(e) => {
                              const list = [...draftContent.what_we_do.services];
                              list[idx].description = e.target.value;
                              setDraftContent(prev => ({
                                ...prev,
                                what_we_do: { ...prev.what_we_do, services: list }
                              }));
                              setIsDirty(true);
                            }}
                            rows={2}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: SELECTED WORK / PORTFOLIO PROJECTS                                 */}
        {/* ========================================================================= */}
        <TabsContent value="projects" className="space-y-6 m-0">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-bold">Selected Work Showcase</CardTitle>
                <CardDescription className="text-xs">
                  Manage projects rendered in the high-impact editorial showcase on the ASARR live website.
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-primary text-primary-foreground"
                onClick={() => {
                  const newProj = {
                    id: "proj-" + Date.now(),
                    number: String(draftContent.selected_work.projects.length + 1).padStart(2, "0"),
                    name: "NEW CLIENT PRODUCTION",
                    category: "CUSTOM SOFTWARE · DIGITAL PRODUCT",
                    description: "High-performance digital platform crafted for ambitious growth.",
                    details: "Designed and engineered with bespoke aesthetics and modern infrastructure.",
                    tags: ["Web Platform", "AI Integration", "Performance"],
                    image: "/images/work/tripmaster.png",
                    alt: "Custom digital project showcase",
                    frameBg: "#11100F",
                    objectFit: "cover" as const,
                  };
                  setDraftContent(prev => ({
                    ...prev,
                    selected_work: {
                      ...prev.selected_work,
                      projects: [...prev.selected_work.projects, newProj]
                    }
                  }));
                  setIsDirty(true);
                  toast.success("New showcase project card appended!");
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Project
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              {draftContent.selected_work.projects.map((proj, pIdx) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl border border-border/80 bg-muted/20 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="font-mono text-xs">{proj.number}</Badge>
                      <h4 className="text-sm font-bold text-foreground">{proj.name}</h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={() => triggerImageUpload("project", pIdx)}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Replace Image
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Remove project "${proj.name}"?`)) {
                            const list = draftContent.selected_work.projects.filter((_, idx) => idx !== pIdx);
                            setDraftContent(prev => ({
                              ...prev,
                              selected_work: { ...prev.selected_work, projects: list }
                            }));
                            setIsDirty(true);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Media Preview Box */}
                    <div className="md:col-span-4">
                      <div
                        className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-border relative flex items-center justify-center p-2"
                        style={{ backgroundColor: proj.frameBg || "#FAF6EF" }}
                      >
                        <img
                          src={proj.image}
                          alt={proj.alt}
                          className={cn(
                            "w-full h-full",
                            proj.objectFit === "contain" ? "object-contain" : "object-cover"
                          )}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center mt-1.5 font-mono truncate">
                        {proj.image}
                      </p>
                    </div>

                    {/* Details Editor */}
                    <div className="md:col-span-8 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Project Name</Label>
                          <Input
                            value={proj.name}
                            onChange={(e) => {
                              const list = [...draftContent.selected_work.projects];
                              list[pIdx].name = e.target.value;
                              setDraftContent(prev => ({
                                ...prev,
                                selected_work: { ...prev.selected_work, projects: list }
                              }));
                              setIsDirty(true);
                            }}
                            className="font-bold text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Category Tagline</Label>
                          <Input
                            value={proj.category}
                            onChange={(e) => {
                              const list = [...draftContent.selected_work.projects];
                              list[pIdx].category = e.target.value;
                              setDraftContent(prev => ({
                                ...prev,
                                selected_work: { ...prev.selected_work, projects: list }
                              }));
                              setIsDirty(true);
                            }}
                            className="font-mono text-xs uppercase"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Short Description</Label>
                        <Input
                          value={proj.description}
                          onChange={(e) => {
                            const list = [...draftContent.selected_work.projects];
                            list[pIdx].description = e.target.value;
                            setDraftContent(prev => ({
                              ...prev,
                              selected_work: { ...prev.selected_work, projects: list }
                            }));
                            setIsDirty(true);
                          }}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Detailed Production Impact</Label>
                        <Textarea
                          value={proj.details}
                          onChange={(e) => {
                            const list = [...draftContent.selected_work.projects];
                            list[pIdx].details = e.target.value;
                            setDraftContent(prev => ({
                              ...prev,
                              selected_work: { ...prev.selected_work, projects: list }
                            }));
                            setIsDirty(true);
                          }}
                          rows={2}
                          className="text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <Label className="text-xs">Tags (Comma-separated)</Label>
                          <Input
                            value={proj.tags?.join(", ") || ""}
                            onChange={(e) => {
                              const list = [...draftContent.selected_work.projects];
                              list[pIdx].tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                              setDraftContent(prev => ({
                                ...prev,
                                selected_work: { ...prev.selected_work, projects: list }
                              }));
                              setIsDirty(true);
                            }}
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Frame Background Hex</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={proj.frameBg || "#11100F"}
                              onChange={(e) => {
                                const list = [...draftContent.selected_work.projects];
                                list[pIdx].frameBg = e.target.value;
                                setDraftContent(prev => ({
                                  ...prev,
                                  selected_work: { ...prev.selected_work, projects: list }
                                }));
                                setIsDirty(true);
                              }}
                              className="w-10 h-8 p-1 cursor-pointer shrink-0"
                            />
                            <Input
                              value={proj.frameBg || "#11100F"}
                              onChange={(e) => {
                                const list = [...draftContent.selected_work.projects];
                                list[pIdx].frameBg = e.target.value;
                                setDraftContent(prev => ({
                                  ...prev,
                                  selected_work: { ...prev.selected_work, projects: list }
                                }));
                                setIsDirty(true);
                              }}
                              className="font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: FINAL CTA & CONTACT                                                */}
        {/* ========================================================================= */}
        <TabsContent value="final_cta" className="space-y-6 m-0">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold">Contact & Conversion Section</CardTitle>
              <CardDescription className="text-xs">
                The high-converting burgundy conversion banner at the base of the homepage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Eyebrow Badge</Label>
                  <Input
                    value={draftContent.final_cta.eyebrow}
                    onChange={(e) => {
                      setDraftContent(prev => ({
                        ...prev,
                        final_cta: { ...prev.final_cta, eyebrow: e.target.value }
                      }));
                      setIsDirty(true);
                    }}
                    placeholder="LET'S BUILD TOGETHER"
                    className="font-mono text-xs uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Headline Line 1</Label>
                  <Input
                    value={draftContent.final_cta.heading_line1}
                    onChange={(e) => {
                      setDraftContent(prev => ({
                        ...prev,
                        final_cta: { ...prev.final_cta, heading_line1: e.target.value }
                      }));
                      setIsDirty(true);
                    }}
                    placeholder="READY TO CREATE"
                    className="font-sans font-bold text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Supporting Narrative</Label>
                <Textarea
                  value={draftContent.final_cta.description}
                  onChange={(e) => {
                    setDraftContent(prev => ({
                      ...prev,
                      final_cta: { ...prev.final_cta, description: e.target.value }
                    }));
                    setIsDirty(true);
                  }}
                  rows={3}
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Primary CTA Label</Label>
                  <Input
                    value={draftContent.final_cta.primary_cta_text}
                    onChange={(e) => {
                      setDraftContent(prev => ({
                        ...prev,
                        final_cta: { ...prev.final_cta, primary_cta_text: e.target.value }
                      }));
                      setIsDirty(true);
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Secondary CTA Label</Label>
                  <Input
                    value={draftContent.final_cta.secondary_cta_text}
                    onChange={(e) => {
                      setDraftContent(prev => ({
                        ...prev,
                        final_cta: { ...prev.final_cta, secondary_cta_text: e.target.value }
                      }));
                      setIsDirty(true);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Contact Email</Label>
                  <Input
                    value={draftContent.final_cta.email}
                    onChange={(e) => {
                      setDraftContent(prev => ({
                        ...prev,
                        final_cta: { ...prev.final_cta, email: e.target.value }
                      }));
                      setIsDirty(true);
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Contact Phone / WhatsApp</Label>
                  <Input
                    value={draftContent.final_cta.phone}
                    onChange={(e) => {
                      setDraftContent(prev => ({
                        ...prev,
                        final_cta: { ...prev.final_cta, phone: e.target.value }
                      }));
                      setIsDirty(true);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 5: BRAND COLORS & THEME TOKENS                                        */}
        {/* ========================================================================= */}
        <TabsContent value="brand_tokens" className="space-y-6 m-0">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold">Theme & Design Tokens</CardTitle>
              <CardDescription className="text-xs">
                Color settings persist directly to Supabase and propagate to the live website styles in real time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Presets */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Palette Presets
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setDraftContent(prev => ({
                          ...prev,
                          brand_tokens: {
                            ...prev.brand_tokens,
                            primary_color: preset.primary,
                            secondary_color: preset.secondary,
                            accent_color: preset.accent,
                            background_color: preset.bg,
                            foreground_color: preset.fg,
                          }
                        }));
                        setIsDirty(true);
                        toast.info(`Applied ${preset.name} palette`);
                      }}
                      className={cn(
                        "p-3 rounded-xl border text-left space-y-2 transition-all hover:border-primary/50",
                        draftContent.brand_tokens.primary_color === preset.primary
                          ? "border-primary ring-1 ring-primary/40 bg-muted/40"
                          : "border-border/60 bg-card"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: preset.primary }} />
                        <div className="w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: preset.secondary }} />
                        <div className="w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: preset.accent }} />
                      </div>
                      <div className="text-xs font-bold text-foreground truncate">{preset.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Token Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-4 border-t border-border/60">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Primary Brand Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={draftContent.brand_tokens.primary_color}
                      onChange={(e) => {
                        setDraftContent(prev => ({
                          ...prev,
                          brand_tokens: { ...prev.brand_tokens, primary_color: e.target.value }
                        }));
                        setIsDirty(true);
                      }}
                      className="w-12 h-9 p-1 cursor-pointer shrink-0"
                    />
                    <Input
                      value={draftContent.brand_tokens.primary_color}
                      onChange={(e) => {
                        setDraftContent(prev => ({
                          ...prev,
                          brand_tokens: { ...prev.brand_tokens, primary_color: e.target.value }
                        }));
                        setIsDirty(true);
                      }}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Secondary / Surface Tint</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={draftContent.brand_tokens.secondary_color}
                      onChange={(e) => {
                        setDraftContent(prev => ({
                          ...prev,
                          brand_tokens: { ...prev.brand_tokens, secondary_color: e.target.value }
                        }));
                        setIsDirty(true);
                      }}
                      className="w-12 h-9 p-1 cursor-pointer shrink-0"
                    />
                    <Input
                      value={draftContent.brand_tokens.secondary_color}
                      onChange={(e) => {
                        setDraftContent(prev => ({
                          ...prev,
                          brand_tokens: { ...prev.brand_tokens, secondary_color: e.target.value }
                        }));
                        setIsDirty(true);
                      }}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Background Canvas Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={draftContent.brand_tokens.background_color}
                      onChange={(e) => {
                        setDraftContent(prev => ({
                          ...prev,
                          brand_tokens: { ...prev.brand_tokens, background_color: e.target.value }
                        }));
                        setIsDirty(true);
                      }}
                      className="w-12 h-9 p-1 cursor-pointer shrink-0"
                    />
                    <Input
                      value={draftContent.brand_tokens.background_color}
                      onChange={(e) => {
                        setDraftContent(prev => ({
                          ...prev,
                          brand_tokens: { ...prev.brand_tokens, background_color: e.target.value }
                        }));
                        setIsDirty(true);
                      }}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Contrast / Token Live Preview */}
              <div className="p-6 rounded-2xl border border-border/80 space-y-3" style={{ backgroundColor: draftContent.brand_tokens.background_color }}>
                <p className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: draftContent.brand_tokens.primary_color }}>
                  LIVE TOKENS CONTRAST SAMPLE
                </p>
                <h3 className="text-2xl font-bold font-serif italic" style={{ color: draftContent.brand_tokens.primary_color }}>
                  Digital experiences that create Enduring Impact.
                </h3>
                <p className="text-xs max-w-lg leading-relaxed" style={{ color: draftContent.brand_tokens.foreground_color }}>
                  Sample typography rendered on the configured background surface with custom primary highlight.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-md"
                    style={{ backgroundColor: draftContent.brand_tokens.primary_color }}
                  >
                    Start a Project
                  </button>
                  <span className="text-xs font-mono" style={{ color: draftContent.brand_tokens.primary_color }}>
                    ← Primary Pill Action
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 6: FOOTER & SOCIALS                                                   */}
        {/* ========================================================================= */}
        <TabsContent value="footer" className="space-y-6 m-0">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold">Footer Content & Channels</CardTitle>
              <CardDescription className="text-xs">
                Copyright details, agency bio, and external social media links.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Footer Bio / Description</Label>
                <Textarea
                  value={draftContent.footer.description}
                  onChange={(e) => {
                    setDraftContent(prev => ({
                      ...prev,
                      footer: { ...prev.footer, description: e.target.value }
                    }));
                    setIsDirty(true);
                  }}
                  rows={2}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Copyright Line</Label>
                <Input
                  value={draftContent.footer.copyright}
                  onChange={(e) => {
                    setDraftContent(prev => ({
                      ...prev,
                      footer: { ...prev.footer, copyright: e.target.value }
                    }));
                    setIsDirty(true);
                  }}
                  className="text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Instagram URL</Label>
                  <Input
                    value={draftContent.footer.social_links.instagram || ""}
                    onChange={(e) => {
                      setDraftContent(prev => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          social_links: { ...prev.footer.social_links, instagram: e.target.value }
                        }
                      }));
                      setIsDirty(true);
                    }}
                    placeholder="https://instagram.com/asarr.agency"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">YouTube URL</Label>
                  <Input
                    value={draftContent.footer.social_links.youtube || ""}
                    onChange={(e) => {
                      setDraftContent(prev => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          social_links: { ...prev.footer.social_links, youtube: e.target.value }
                        }
                      }));
                      setIsDirty(true);
                    }}
                    placeholder="https://youtube.com/@asarr"
                    className="text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

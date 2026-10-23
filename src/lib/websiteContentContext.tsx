'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { defaultWebsiteContent, WebsiteContentData } from '@/data/websiteContent';
import { supabase } from '@/lib/supabaseClient';

interface WebsiteContentContextValue {
  content: WebsiteContentData;
  isLoading: boolean;
  refreshContent: () => Promise<void>;
}

const WebsiteContentContext = createContext<WebsiteContentContextValue>({
  content: defaultWebsiteContent,
  isLoading: false,
  refreshContent: async () => {},
});

export function WebsiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<WebsiteContentData>(defaultWebsiteContent);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPublishedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('id', 'published')
        .maybeSingle();

      if (!error && data) {
        setContent({
          hero: { ...defaultWebsiteContent.hero, ...(data.hero || {}) },
          what_we_do: {
            ...defaultWebsiteContent.what_we_do,
            ...(data.what_we_do || {}),
            services: Array.isArray(data.services) && data.services.length > 0
              ? data.services
              : defaultWebsiteContent.what_we_do.services,
          },
          selected_work: {
            ...defaultWebsiteContent.selected_work,
            ...(data.selected_work_meta || {}),
            projects: Array.isArray(data.selected_work) && data.selected_work.length > 0
              ? data.selected_work
              : defaultWebsiteContent.selected_work.projects,
          },
          final_cta: { ...defaultWebsiteContent.final_cta, ...(data.final_cta || {}) },
          footer: { ...defaultWebsiteContent.footer, ...(data.footer || {}) },
          brand_tokens: { ...defaultWebsiteContent.brand_tokens, ...(data.brand_tokens || {}) },
        });
      }
    } catch (err) {
      console.warn('[Website Content] Fallback to default website content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishedContent();
  }, []);

  // Real-time CSS tokens injection
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const tokens = content.brand_tokens;
    const root = document.documentElement;

    if (tokens.primary_color) {
      root.style.setProperty('--color-primary', tokens.primary_color);
      root.style.setProperty('--color-maroon', tokens.primary_color);
      root.style.setProperty('--primary', hexToHsl(tokens.primary_color));
    }
    if (tokens.secondary_color) {
      root.style.setProperty('--color-secondary', tokens.secondary_color);
    }
    if (tokens.background_color) {
      root.style.setProperty('--background', tokens.background_color);
      root.style.setProperty('--color-background', tokens.background_color);
    }
    if (tokens.foreground_color) {
      root.style.setProperty('--foreground', tokens.foreground_color);
      root.style.setProperty('--color-foreground', tokens.foreground_color);
    }
  }, [content.brand_tokens]);

  return (
    <WebsiteContentContext.Provider value={{ content, isLoading, refreshContent: fetchPublishedContent }}>
      {children}
    </WebsiteContentContext.Provider>
  );
}

export function useWebsiteContent() {
  return useContext(WebsiteContentContext);
}

function hexToHsl(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '351 64% 29%';

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

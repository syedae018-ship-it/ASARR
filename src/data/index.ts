import { Project, Service } from '@/types';

export const mockServices: Service[] = [
  {
    id: 's1',
    category: 'TECHNOLOGY',
    title: 'Website Development',
    description: 'High-performance, scalable web platforms.',
    icon: 'code',
    slug: 'website-development'
  },
  {
    id: 's2',
    category: 'CREATIVE',
    title: 'Brand Identity',
    description: 'Visual systems and brand guidelines.',
    icon: 'pen-tool',
    slug: 'brand-identity'
  }
];

// BACKEND INTEGRATION:
// Replace mockProjects with GET /api/projects
export const mockProjects: Project[] = [
  {
    id: 'p1',
    title: 'LUMINA AI RESEARCH',
    client: 'Lumina Labs',
    category: 'Full-Stack Web & AI Infrastructure',
    description: 'High-throughput intelligence portal with real-time vector inference and editorial dark-mode aesthetics.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop',
    year: 2026,
    slug: 'lumina-ai-research',
    challenge: 'Architecting an ultra-responsive visual workspace that translates complex high-dimensional AI model outputs into intuitive, sub-50ms user interactions.',
    approach: 'Engineered a Next.js App Router and WebAssembly-powered canvas rendering engine with bespoke typography, fluid micro-interactions, and instant vector search.',
    impact: 'Catalyzed a 280% increase in developer conversions and supported 1.4M monthly synthesis queries seamlessly.'
  },
  {
    id: 'p2',
    title: 'AURA HAUTE PARFUMERIE',
    client: 'Aura Group Paris',
    category: 'Creative Direction & Headless Commerce',
    description: 'Flagship luxury digital storefront featuring bespoke 3D fragrance notes and immersive scent storytelling.',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop',
    year: 2026,
    slug: 'aura-parfumerie',
    challenge: 'Capturing the sensory intimacy of artisanal royal oud and bespoke fragrances within a tactile, high-speed digital commerce interface.',
    approach: 'Devised a high-fashion editorial grid with Cormorant typography, buttery smooth scroll transitions, and an interactive notes fragrance finder.',
    impact: 'Drove a +68% lift in average order value and 3.4x session duration compared to legacy luxury benchmark stores.'
  },
  {
    id: 'p3',
    title: 'PULSE BIOMETRICS',
    client: 'Pulse Health Technologies',
    category: 'Mobile Application & Design System',
    description: 'Autonomous health telemetry mobile app built for peak athletic performance and continuous metabolic monitoring.',
    image: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=1974&auto=format&fit=crop',
    year: 2026,
    slug: 'pulse-biometrics',
    challenge: 'Synthesizing dense biometric sensor streams into an empowering, glanceable mobile dashboard that motivates daily behavioral change.',
    approach: 'Crafted a custom dark-mode design system with haptic feedback integration, fluid SVG charts, and edge-computed predictive analytics.',
    impact: 'Achieved an App Store rating of 4.9/5 stars with over 250,000 active daily athletes in 42 countries.'
  },
  {
    id: 'p4',
    title: 'CHROMA GLOBAL CAMPAIGN',
    client: 'Chroma Visual Syndicate',
    category: 'Growth Strategy & Content Ecosystem',
    description: 'Omnichannel creative rollout combining cinematic short-form video, programmatic ads, and viral social hooks.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
    year: 2026,
    slug: 'chroma-campaign',
    challenge: 'Cutting through digital noise across crowded social feeds while preserving a prestigious, high-end editorial reputation.',
    approach: 'Executed a precision-targeted content sprint comprising 40+ modular video formats, interactive reels, and real-time community engagement loops.',
    impact: 'Generated 14.8M organic social impressions, 42,000 email subscribers, and delivered a 4.2x ROAS in 90 days.'
  }
];

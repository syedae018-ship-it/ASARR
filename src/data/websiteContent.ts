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
      objectFit: 'cover' | 'contain';
      objectPosition?: string;
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

export const defaultWebsiteContent: WebsiteContentData = {
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

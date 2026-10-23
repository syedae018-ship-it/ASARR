'use client';

import Image from 'next/image';
import { useCursorStore } from '@/components/ui/CustomCursor';
import { useWebsiteContent } from '@/lib/websiteContentContext';

export interface SelectedProject {
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
}

export const approvedProjects: SelectedProject[] = [
  {
    id: 'star-kids-kingdom',
    number: '01',
    name: 'STAR KIDS KINGDOM',
    category: 'WEBSITE DESIGN & DEVELOPMENT · EDUCATION',
    description: 'A custom website for an NTT and ECCE teacher-training academy that also offers preschool and daycare services.',
    details: 'Built to establish institutional credibility in RT Nagar, Bengaluru. Features responsive program discovery, dynamic curriculum highlights, parent inquiry workflows, and direct admissions onboarding.',
    tags: ['Teacher Training Portal', 'Preschool & Daycare', 'Admissions Funnel', 'Curriculum Showcase'],
    image: '/images/work/star-kids-kingdom.png',
    alt: 'Star Kids Kingdom teacher-training academy, preschool and daycare website storefront',
    frameBg: '#FAF6EF',
    objectFit: 'cover',
    objectPosition: 'top',
  },
  {
    id: 'tripmaster',
    number: '02',
    name: 'TRIPMASTER',
    category: 'CUSTOM SOFTWARE · TRAVEL MANAGEMENT',
    description: 'An end-to-end travel booking and management system designed to bring travel experiences and booking workflows together.',
    details: 'Architected for modern travelers and tour operators with sub-second package discovery, custom itinerary builders, trending destination portals, and automated reservation management.',
    tags: ['Custom Booking Engine', 'Travel CRM', 'Package Discovery', 'Itinerary Builder'],
    image: '/images/work/tripmaster.png',
    alt: 'Tripmaster end-to-end travel booking and management platform with Trending Destinations',
    frameBg: '#020616',
    objectFit: 'contain',
  },
  {
    id: 'kraftaura',
    number: '03',
    name: 'KRAFTAURA',
    category: 'CUSTOM SOFTWARE · E-COMMERCE SAAS',
    description: 'A multi-tenant online store builder that enables businesses to create branded storefronts and receive a deployable store link.',
    details: 'Engineered for direct-to-consumer merchants across India. Features automated catalog publishing, custom subdomain routing, WhatsApp commerce tools, and instant payment gateway integrations.',
    tags: ['Multi-Tenant SaaS', 'Storefront Engine', 'WhatsApp Commerce', 'Payment Gateway'],
    image: '/images/work/kraftaura.png',
    alt: 'KraftAURA multi-tenant online store builder dark burgundy landing page preview',
    frameBg: '#170A0F',
    objectFit: 'cover',
    objectPosition: 'top',
  },
  {
    id: 'tripmaster-social',
    number: '04',
    name: 'TRIPMASTER — SOCIAL MEDIA',
    category: 'SOCIAL MEDIA MANAGEMENT · CONTENT CREATION',
    description: 'Travel-focused social media content, destination storytelling and short-form video creative for Tripmaster.',
    details: 'High-impact visual narratives filmed across Malaysia and the Maldives. Combining cinematic drone footage, energetic sound design, on-screen typography, and destination discovery to scale organic travel engagement.',
    tags: ['Short-Form Reels', 'Destination Storytelling', 'Cinematic Video', 'Social Media Growth', 'Content Strategy'],
    image: '/images/work/tripmaster-social-enhanced.webp',
    alt: 'Tripmaster travel reels and destination storytelling social media creative grid',
    frameBg: '#07090D',
    objectFit: 'cover',
    isWide: true,
  },
  {
    id: 'shaik-sab',
    number: '05',
    name: 'SHAIK SAB',
    category: 'WEBSITE DESIGN & DEVELOPMENT · FRAGRANCE & E-COMMERCE',
    description: 'A bespoke perfume-brand website featuring product discovery and a premium visual presentation.',
    details: 'Crafted for artisanal Arabian perfumery and royal oud. Unites tactile sensory visuals, an interactive notes finder, luxury product carousels, and a sub-50ms headless shopping experience.',
    tags: ['Headless E-Commerce', 'Luxury Fragrance', 'Sensory Discovery', 'Interactive Carousel'],
    image: '/images/work/shaik-sab.png',
    alt: 'Shaik Sab bespoke luxury fragrance and royal oud e-commerce storefront',
    frameBg: '#FFFFFF',
    objectFit: 'cover',
    objectPosition: 'top',
  },
];

export function SelectedWork() {
  const setVariant = useCursorStore((state) => state.setVariant);
  const { content } = useWebsiteContent();
  const selectedWork = content.selected_work;
  const projects = (selectedWork.projects && selectedWork.projects.length > 0)
    ? selectedWork.projects
    : approvedProjects;

  return (
    <section 
      id="work" 
      className="relative w-full bg-[#F3EEE7] text-[#171515] pt-20 sm:pt-28 pb-20 sm:pb-28 px-6 sm:px-10 lg:px-16 border-t border-black/[0.08] overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-[1550px] mx-auto">
        
        {/* ========================================================= */}
        {/* 1. EDITORIAL EYEBROW & META BAR                           */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 sm:pb-10 border-b border-black/[0.08]">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F1420]" />
            <span className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.16em] text-[#6E665E] font-semibold">
              {selectedWork.eyebrow || "SELECTED WORK"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10.5px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#6E665E]">
            <span>{selectedWork.title || "FIVE SELECT PRODUCTIONS"}</span>
            <span className="text-[#6F1420]">•</span>
            <span>{selectedWork.archive_label || "2025 — 2026 ARCHIVE"}</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. SECTION HEADING & SUPPORTING TEXT                      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end pt-10 sm:pt-12 pb-12 sm:pb-16">
          <div className="lg:col-span-7">
            <h2 className="text-4xl sm:text-5xl lg:text-[4.25rem] font-sans font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-[#171515]">
              <span>Work that</span>{' '}
              <span className="font-serif italic font-normal text-[#6F1420] block sm:inline">
                speaks for itself.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-end">
            <p className="font-sans text-sm sm:text-base text-[#524C46] leading-relaxed max-w-xl">
              A glimpse into the digital experiences, products and creative work we&apos;ve built.
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. 12-COLUMN RESPONSIVE GRID (DESKTOP: 4-4-4 / 8-4)       */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-7 w-full">
          {projects.map((project) => {
            const isWide = project.isWide;

            return (
              <article
                key={project.id}
                onMouseEnter={() => setVariant('button')}
                onMouseLeave={() => setVariant('default')}
                className={`group flex flex-col justify-between bg-white border border-black/[0.08] hover:border-black/25 rounded-2xl sm:rounded-[22px] p-4 sm:p-5 lg:p-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(23,21,21,0.06)] ${
                  isWide 
                    ? 'col-span-1 md:col-span-2 lg:col-span-8' 
                    : 'col-span-1 md:col-span-1 lg:col-span-4'
                }`}
              >
                {/* Media Container with Locked Aspect Ratio */}
                <div 
                  className={`relative w-full rounded-xl sm:rounded-[14px] overflow-hidden border border-black/[0.08] mb-4 sm:mb-5 shadow-sm ${
                    isWide 
                      ? 'aspect-[1024/230]' 
                      : 'aspect-[16/10]'
                  }`}
                  style={{ backgroundColor: project.frameBg }}
                >
                  <Image
                    src={project.image}
                    alt={project.alt}
                    fill
                    sizes={
                      isWide 
                        ? '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 66vw' 
                        : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    }
                    className={`transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01] ${
                      project.objectFit === 'contain' ? 'object-contain p-2 sm:p-2.5' : 'object-cover'
                    }`}
                    style={{
                      objectPosition: project.objectPosition || 'center',
                    }}
                  />

                  {/* Corner Index Tag */}
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-widest text-white uppercase select-none z-10">
                    {project.number}
                  </div>
                </div>

                {/* Card Text Content */}
                <div className="flex flex-col flex-grow justify-between">
                  {isWide ? (
                    /* Wide Card 04: Side-by-side balanced content filling the wide width */
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 pt-1">
                      <div className="md:col-span-7 flex flex-col">
                        <p className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.14em] text-[#7A746E] font-medium mb-1.5">
                          {project.category}
                        </p>
                        <h3 className="font-sans font-bold text-lg sm:text-xl tracking-tight uppercase text-[#11100F] group-hover:text-[#6F1420] transition-colors duration-200 mb-2">
                          {project.name}
                        </h3>
                        <p className="font-sans text-xs sm:text-[13px] text-[#2C2825] font-medium leading-relaxed mb-2">
                          {project.description}
                        </p>
                        <p className="font-sans text-xs sm:text-[12.5px] text-[#6B655F] leading-relaxed">
                          {project.details}
                        </p>
                      </div>

                      <div className="md:col-span-5 flex flex-col justify-between pt-1 md:border-l md:border-black/[0.06] md:pl-5">
                        <div>
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#8E877F] block mb-2 font-semibold">
                            KEY DELIVERABLES & SCOPE
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {project.tags.map((tag) => (
                              <span 
                                key={tag}
                                className="px-2.5 py-1 rounded-md bg-[#F4F0E8] border border-black/[0.05] text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#524C46]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-black/[0.06] flex items-center justify-between text-[10.5px] font-mono uppercase tracking-wider text-[#7A746E]">
                          <span>PRODUCTION</span>
                          <span className="font-semibold text-[#11100F]">MALAYSIA & MALDIVES</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Standard Cards: Filled, Rich, Editorial Spacing */
                    <div className="flex flex-col flex-grow justify-between pt-0.5">
                      <div>
                        <p className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.14em] text-[#7A746E] font-medium mb-1.5">
                          {project.category}
                        </p>
                        <h3 className="font-sans font-bold text-lg sm:text-xl tracking-tight uppercase text-[#11100F] group-hover:text-[#6F1420] transition-colors duration-200 mb-2">
                          {project.name}
                        </h3>
                        <p className="font-sans text-xs sm:text-[13px] text-[#2C2825] font-medium leading-relaxed mb-2">
                          {project.description}
                        </p>
                        <p className="font-sans text-xs sm:text-[12px] text-[#6B655F] leading-relaxed mb-3">
                          {project.details}
                        </p>
                      </div>

                      {/* Deliverable Tags filling the card bottom */}
                      <div className="pt-3 border-t border-black/[0.06]">
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags.map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-[#F4F0E8] border border-black/[0.05] text-[9.5px] sm:text-[10px] font-mono uppercase tracking-wider text-[#524C46]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}

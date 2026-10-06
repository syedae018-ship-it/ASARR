'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCursorStore } from '@/components/ui/CustomCursor';
import { useModalStore } from '@/lib/modalStore';

interface ProjectCaseStudy {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  quote: string;
  description: string;
  disciplines: string[];
  deliverables: string[];
  metric: string;
  metricLabel: string;
  heroImage: string;
  heroAlt: string;
  detailImage: string;
  detailAlt: string;
  year: string;
}

const projects: ProjectCaseStudy[] = [
  {
    id: 'p1',
    number: '01',
    name: 'Shaik Sab Perfumes',
    subtitle: 'Artisanal Arabian Fragrance & Headless Flagship',
    quote: '“Building an enduring visual identity around sensory intimacy, Arabian craftsmanship, and modern digital luxury.”',
    description: 'We directed the complete creative overhaul for Shaik Sab Perfumes — uniting bespoke 4K cinematic product films, raw volcanic stone product shoots, gold-foil packaging design, and a sub-50ms headless e-commerce flagship.',
    disciplines: ['Brand Strategy', 'Content Production', 'Packaging Design', 'Web Experience'],
    deliverables: [
      '4K Commercial Cinema Films',
      'Tactile Packaging & Bottle Art',
      'Headless Next.js Digital Flagship',
      'Omnichannel Social Media Rollout'
    ],
    metric: '+68%',
    metricLabel: 'LIFT IN AVERAGE ORDER VALUE',
    heroImage: '/images/hires_projects/perfume_main.jpg',
    heroAlt: 'Shaik Sab luxury perfume bottle on dark volcanic rock',
    detailImage: '/images/hires_projects/perfume_sub.jpg',
    detailAlt: 'Shaik Sab perfume packaging detail and crystal bottle cap',
    year: '2026',
  },
  {
    id: 'p2',
    number: '02',
    name: 'Aviora Atelier',
    subtitle: 'Haute Couture Editorial & Global E-Commerce',
    quote: '“Translating high-fashion atelier craftsmanship into a fluid, tactile digital commerce experience.”',
    description: 'For Aviora, we crafted a high-fashion editorial campaign and custom digital boutique. Featuring razor-sharp typography, immersive lookbooks, and frictionless global checkout tailored for high-discretion luxury clientele.',
    disciplines: ['Creative Direction', 'E-Commerce Engineering', 'Brand Systems', 'Video Production'],
    deliverables: [
      'Editorial Lookbook Production',
      'Custom Bespoke Web Storefront',
      'High-Speed Global CDN Deployment',
      'Digital Campaign Marketing'
    ],
    metric: '3.4X',
    metricLabel: 'SESSION DURATION INCREASE',
    heroImage: '/images/hires_projects/aviora_main.jpg',
    heroAlt: 'Aviora fashion model in curated luxury designer tailoring',
    detailImage: '/images/hires_projects/aviora_sub.jpg',
    detailAlt: 'Aviora minimalist boutique showroom interior with sleek garment rails',
    year: '2026',
  },
  {
    id: 'p3',
    number: '03',
    name: 'Pure & Herbs',
    subtitle: 'Organic Botanical System & Digital Ecosystem',
    quote: '“Bridging clinical purity with sensory natural aesthetics across physical bottles and digital screens.”',
    description: 'Developed an organic visual universe for clinical-grade botanical skincare. From custom glass container mockups and amber dropper packaging to an educational ingredient-finder platform and subscription checkout.',
    disciplines: ['Brand Identity', 'Product Photography', 'Interactive Web', 'SEO Strategy'],
    deliverables: [
      'Botanical Packaging Architecture',
      'Interactive Scent & Formula Finder',
      'Custom Shopify Headless Platform',
      'Automated Retention Funnel'
    ],
    metric: '4.2X',
    metricLabel: 'RETURN ON AD SPEND (ROAS)',
    heroImage: '/images/hires_projects/pure_main.jpg',
    heroAlt: 'Pure & Herbs botanical skincare bottles with fresh green leaves',
    detailImage: '/images/hires_projects/pure_sub.jpg',
    detailAlt: 'Pure & Herbs amber cosmetic jars on minimalist stone surface',
    year: '2026',
  },
  {
    id: 'p4',
    number: '04',
    name: 'Tripmaster',
    subtitle: 'Curated Island Hospitality & Mobile App',
    quote: '“Engineering an intuitive booking portal that captures the tranquility of private island retreats.”',
    description: 'Architected the brand identity, cinematic travel imagery, and native mobile booking application for Tripmaster’s luxury private island collection. Enabling guests to customize charters, suites, and private dining in seconds.',
    disciplines: ['Mobile App Design', 'Full-Stack Engineering', 'Media Production', 'Growth Strategy'],
    deliverables: [
      'iOS & Android Native Experience',
      'Drone & Underwater Cinematography',
      'Dynamic Real-Time Suite Concierge',
      'Global Targeted Media Strategy'
    ],
    metric: '4.9★',
    metricLabel: 'APP STORE RATING ACROSS 40K USERS',
    heroImage: '/images/hires_projects/travel_main.jpg',
    heroAlt: 'Tripmaster private island overwater bungalows and turquoise ocean',
    detailImage: '/images/hires_projects/travel_sub.jpg',
    detailAlt: 'Tripmaster scenic remote traveler journey on serene mountain lake',
    year: '2025',
  },
  {
    id: 'p5',
    number: '05',
    name: 'Lumina AI Research',
    subtitle: 'High-Throughput Intelligence & Vector Portal',
    quote: '“Demystifying cutting-edge AI inference through sub-50ms user interactions and editorial dark mode.”',
    description: 'Collaborated with AI research engineers to build a premier developer portal. Translating complex high-dimensional model telemetry into fluid canvas diagrams, instant documentation search, and an intuitive prompt studio.',
    disciplines: ['Full-Stack Web', 'AI Systems', 'Design Architecture', 'Brand Positioning'],
    deliverables: [
      'Next.js Turbopack Cloud Portal',
      'Real-Time Vector Inference Canvas',
      'Developer API Documentation Suite',
      'Technical Developer Conversion Funnel'
    ],
    metric: '1.4M',
    metricLabel: 'MONTHLY SYNTHESIS QUERIES SUPPORTED',
    heroImage: '/images/hires_projects/tech_main.jpg',
    heroAlt: 'Lumina developer workstation screen with modern code and vector interface',
    detailImage: '/images/hires_projects/tech_sub.jpg',
    detailAlt: 'Lumina cyber security code and dark mode data matrix',
    year: '2026',
  },
];

export function FeaturedWork() {
  const [activeIndex, setActiveIndex] = useState(0);
  const setVariant = useCursorStore((state) => state.setVariant);
  const { openProjectModal } = useModalStore();

  const current = projects[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  };

  return (
    <section 
      id="work"
      className="relative w-full bg-[#6F1420] text-[#FAF6F0] pt-24 sm:pt-32 pb-24 sm:pb-36 px-6 sm:px-12 lg:px-16 overflow-hidden select-none"
    >
      {/* Top Architectural Curve slicing into Deep Maroon */}
      <div 
        className="absolute top-0 inset-x-0 h-16 sm:h-24 pointer-events-none z-10"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 96"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full text-[#F3EEE7]"
        >
          <path
            d="M0,0 L1440,0 L1440,64 C1000,0 440,96 0,24 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Atmospheric Ambient Glows */}
      <div 
        className="absolute -top-40 right-10 w-[700px] h-[700px] rounded-full bg-[#821827]/40 blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[#4A0D15]/60 blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-20 w-full max-w-[1550px] mx-auto">
        
        {/* Top Header Row with Eyebrow and Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 sm:pb-10 border-b border-white/15">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5D5DA]" />
            <span className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.16em] text-[#F5D5DA] font-semibold">
              FEATURED WORK
            </span>
          </div>

          <div className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.14em] text-white/70">
            DIFFERENT INDUSTRIES. SAME RESULT — GROWTH.
          </div>
        </div>

        {/* Section Headline & Project Switcher Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-10 pb-12">
          <div>
            <h2 className="text-4xl sm:text-6xl lg:text-[4.8rem] font-sans font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-white">
              <span>Real Brands.</span>{' '}
              <span className="font-serif italic font-normal text-[#F5D5DA] block sm:inline">
                Real Impact.
              </span>
            </h2>
          </div>

          {/* Interactive Project Switcher Pill Tabs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {projects.map((proj, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setVariant('button')}
                  onMouseLeave={() => setVariant('default')}
                  className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-white text-[#6F1420] font-bold shadow-lg scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/15'
                  }`}
                >
                  <span className="text-[10px] opacity-70">{proj.number}</span>
                  <span>{proj.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* IMMERSIVE EDITORIAL CASE-STUDY COMPOSITION (75-85% VIEWPORT) */}
        {/* ======================================================== */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center bg-[#580F1A]/60 rounded-3xl p-6 sm:p-10 lg:p-12 border border-white/15 shadow-2xl backdrop-blur-sm"
          >
            {/* LEFT / CENTER: Multi-Layered Overlapping High-Res Imagery (Cols 1-7) */}
            <div className="lg:col-span-7 relative w-full flex flex-col items-start">
              
              {/* PRIMARY DOMINANT HERO IMAGE */}
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/10] rounded-2xl overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
                <Image
                  src={current.heroImage}
                  alt={current.heroAlt}
                  fill
                  unoptimized
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover object-center filter saturate-[0.98] contrast-[1.04] group-hover:scale-104 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

                {/* Top Left Project Pill */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-[11px] font-mono text-white/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5D5DA]" />
                  <span>CASE 0{current.number} &middot; {current.year}</span>
                </div>

                {/* Bottom Left Metric Badge on Dominant Image */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10 bg-[#11100F]/90 backdrop-blur-md border border-white/20 p-3.5 sm:p-4 rounded-xl shadow-xl max-w-[240px]">
                  <span className="font-sans font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-none block">
                    {current.metric}
                  </span>
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-[#F5D5DA] mt-1 block">
                    {current.metricLabel}
                  </span>
                </div>
              </div>

              {/* SECONDARY OVERLAPPING DETAIL IMAGE (Off-grid, layered composition) */}
              <div className="relative sm:absolute -bottom-6 sm:-bottom-8 right-2 sm:right-[-16px] w-52 sm:w-64 h-36 sm:h-44 rounded-xl overflow-hidden border-2 border-white/40 shadow-[0_20px_45px_rgba(0,0,0,0.7)] z-20 group hidden sm:block bg-black/40">
                <Image
                  src={current.detailImage}
                  alt={current.detailAlt}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 200px, 260px"
                  className="object-cover object-center filter saturate-[0.96] group-hover:scale-108 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-3 text-[9px] font-mono text-white/90 uppercase tracking-widest font-semibold">
                  TACTILE DETAIL / SYSTEM
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Editorial Storytelling & Deliverables (Cols 8-12) */}
            <div className="lg:col-span-5 flex flex-col items-start pr-0 lg:pl-4">
              
              {/* Category & Project Title */}
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#F5D5DA] font-semibold mb-2">
                {current.subtitle}
              </span>

              <h3 className="font-serif italic text-3xl sm:text-5xl text-white font-normal leading-[1.04] tracking-tight mb-4">
                {current.name}
              </h3>

              {/* High-Impact Editorial Quote */}
              <p className="font-serif italic text-base sm:text-lg text-[#F5D5DA] leading-relaxed mb-6 border-l-2 border-[#F5D5DA] pl-4">
                {current.quote}
              </p>

              {/* Detailed Project Storytelling */}
              <p className="font-sans text-xs sm:text-sm text-[#D4CCC2] leading-relaxed mb-6">
                {current.description}
              </p>

              {/* Deliverables Checklist */}
              <div className="w-full mb-8 pt-4 border-t border-white/10">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/60 block mb-3 font-bold">
                  DELIVERABLES & DISCIPLINES
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-white/90">
                  {current.deliverables.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="text-[#F5D5DA] text-xs">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button & Prev/Next Navigation Controls */}
              <div className="w-full flex items-center justify-between gap-4 pt-4 border-t border-white/15">
                <button
                  type="button"
                  onClick={openProjectModal}
                  onMouseEnter={() => setVariant('button')}
                  onMouseLeave={() => setVariant('default')}
                  className="inline-flex items-center gap-3 px-7 py-3 rounded-full bg-white hover:bg-[#FAF6F0] text-[#11100F] text-xs font-sans font-bold uppercase tracking-[0.10em] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span>Inquire Similar Project</span>
                  <span>→</span>
                </button>

                {/* Arrow Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    onMouseEnter={() => setVariant('button')}
                    onMouseLeave={() => setVariant('default')}
                    aria-label="Previous Case Study"
                    className="w-10 h-10 rounded-full border border-white/30 hover:border-white hover:bg-white hover:text-[#6F1420] text-white flex items-center justify-center transition-all duration-300 text-sm"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    onMouseEnter={() => setVariant('button')}
                    onMouseLeave={() => setVariant('default')}
                    aria-label="Next Case Study"
                    className="w-10 h-10 rounded-full border border-white/30 hover:border-white hover:bg-white hover:text-[#6F1420] text-white flex items-center justify-center transition-all duration-300 text-sm"
                  >
                    →
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}

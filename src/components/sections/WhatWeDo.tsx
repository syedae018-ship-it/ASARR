'use client';

import Image from 'next/image';
import { useCursorStore } from '@/components/ui/CustomCursor';
import { useModalStore } from '@/lib/modalStore';

interface ServiceCard {
  id: string;
  number: string;
  title: string;
  description: string;
  capabilities: string;
  image: string;
  alt: string;
}

const services: ServiceCard[] = [
  {
    id: 'svc-websites',
    number: '01',
    title: 'Websites',
    description: 'Modern, high-performance websites that turn visitors into customers.',
    capabilities: 'Next.js · E-commerce · Landing Pages · Web Apps',
    image: '/images/services/svc_websites.jpg',
    alt: 'Premium website interface displayed on MacBook Pro — Build Brands That Last',
  },
  {
    id: 'svc-software',
    number: '02',
    title: 'Custom Softwares',
    description: 'Tailor-made solutions to simplify operations and scale your business.',
    capabilities: 'SaaS Platforms · Dashboards · CRM · Business Tools',
    image: '/images/services/svc_software.jpg',
    alt: 'Business analytics dashboard on iMac showing revenue growth and user engagement',
  },
  {
    id: 'svc-apps',
    number: '03',
    title: 'Apps',
    description: 'Native and cross-platform apps built for real-world impact.',
    capabilities: 'iOS · Android · React Native · Flutter',
    image: '/images/services/svc_apps.jpg',
    alt: 'Three smartphones showcasing polished mobile app UI screens on beige surface',
  },
  {
    id: 'svc-content',
    number: '04',
    title: 'Content Creation',
    description: 'Scroll-stopping content that brings your brand to life across every platform.',
    capabilities: 'Brand Films · Photography · Reels · Post-Production',
    image: '/images/services/svc_content.jpg',
    alt: 'Professional cinema camera in production studio filming luxury product shoot',
  },
  {
    id: 'svc-marketing',
    number: '05',
    title: 'Digital Marketing',
    description: 'Strategy-driven marketing to grow your audience and revenue.',
    capabilities: 'Performance Ads · SEO · Social Media · Analytics',
    image: '/images/services/svc_marketing.jpg',
    alt: 'Marketing performance dashboard showing campaign metrics and conversion funnel',
  },
];

export function WhatWeDo() {
  const setVariant = useCursorStore((state) => state.setVariant);
  const { openProjectModal } = useModalStore();

  const scrollToServices = () => {
    const el = document.getElementById('services');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="what-we-do"
      className="relative w-full bg-[#F3EEE7] text-[#171515] pt-20 sm:pt-28 pb-16 sm:pb-24 px-6 sm:px-12 lg:px-16 overflow-hidden select-none"
    >
      {/* Top Architectural Curved Edge Transition slicing from Dark Hero into Ivory */}
      <div 
        className="absolute top-0 inset-x-0 h-16 sm:h-24 pointer-events-none z-10"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 96"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full text-[#11100F]"
        >
          <path
            d="M0,0 L1440,0 L1440,32 C1080,96 360,96 0,32 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="relative z-20 w-full max-w-[1550px] mx-auto">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 sm:pb-10 border-b border-black/[0.08]">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F1420]" />
            <span className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.16em] text-[#6E665E] font-semibold">
              WHAT WE DO
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10.5px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#6E665E]">
            <span>IDEAS</span>
            <span className="text-[#6F1420]">•</span>
            <span>STRATEGY</span>
            <span className="text-[#6F1420]">•</span>
            <span>CREATIVITY</span>
            <span className="text-[#6F1420]">•</span>
            <span>TECHNOLOGY</span>
          </div>
        </div>

        {/* Heading Row: Left editorial text + Right description & CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end pt-10 sm:pt-12 pb-10 sm:pb-12">
          
          {/* Left: Heading */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-5 h-[2px] bg-[#6F1420]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8C847C] font-medium">
                COMPLETE DIGITAL SOLUTIONS
              </span>
            </div>

            <h2 className="text-[2.6rem] sm:text-[3.4rem] lg:text-[3.8rem] leading-[1.02] tracking-[-0.02em] text-[#171515]">
              <span className="block font-sans font-extrabold uppercase">A–Z</span>
              <span className="block font-sans font-extrabold uppercase mt-0.5">Solutions for</span>
              <span className="block font-serif italic font-normal text-[#6F1420] text-[2.8rem] sm:text-[3.6rem] lg:text-[4.1rem] mt-0.5">
                Your Digital Presence.
              </span>
            </h2>
          </div>

          {/* Right: Description + CTA */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6 lg:pb-2">
            <p className="font-sans text-[13px] sm:text-sm text-[#5C554E] max-w-md leading-[1.7]">
              From custom websites and software to content creation and marketing — we handle the complete digital journey for your brand.
            </p>

            <button
              type="button"
              onClick={scrollToServices}
              onMouseEnter={() => setVariant('button')}
              onMouseLeave={() => setVariant('default')}
              className="inline-flex items-center gap-3 px-7 h-11 rounded-full bg-[#6F1420] hover:bg-[#5A1019] text-white text-[11px] font-sans font-semibold uppercase tracking-[0.12em] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0"
            >
              <span>Explore Services</span>
              <span className="text-sm font-normal">→</span>
            </button>
          </div>

        </div>

        {/* 5 Service Cards — Single Horizontal Row on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {services.map((service) => (
            <ServiceModule
              key={service.id}
              service={service}
              onMouseEnter={() => setVariant('button')}
              onMouseLeave={() => setVariant('default')}
              onClick={openProjectModal}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Service Module — Consistent Card Component
   ───────────────────────────────────────────── */

interface ServiceModuleProps {
  service: ServiceCard;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function ServiceModule({ service, onMouseEnter, onMouseLeave, onClick }: ServiceModuleProps) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-black/[0.07] hover:border-[#6F1420]/30 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] flex flex-col"
    >
      {/* Image — Consistent aspect ratio + identical radius (via parent overflow) */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#EBE4D8]">
        <Image
          src={service.image}
          alt={service.alt}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
          className="object-cover object-center filter saturate-[0.95] contrast-[1.03] group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        
        {/* Number + Divider */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[11px] font-semibold text-[#6F1420] tracking-[0.08em]">
            {service.number}
          </span>
          <span className="flex-1 h-px bg-black/[0.08]" />
        </div>

        {/* Service Title */}
        <h3 className="font-sans font-bold text-sm sm:text-[15px] tracking-[-0.01em] text-[#171515] group-hover:text-[#6F1420] transition-colors duration-250 leading-tight mb-1.5">
          {service.title}
        </h3>

        {/* Description */}
        <p className="font-sans text-[11px] sm:text-[12px] text-[#6E665E] leading-[1.5] mb-3 flex-1">
          {service.description}
        </p>

        {/* Capabilities + Arrow Row */}
        <div className="flex items-end justify-between gap-2 pt-2.5 border-t border-black/[0.06]">
          <span className="font-mono text-[9px] sm:text-[10px] text-[#8C847C] leading-[1.45] tracking-[0.02em]">
            {service.capabilities}
          </span>
          <div className="w-6 h-6 rounded-full bg-[#F3EEE7] group-hover:bg-[#6F1420] flex items-center justify-center shrink-0 transition-all duration-300 border border-black/[0.06] group-hover:border-[#6F1420]">
            <span className="text-[10px] text-[#171515] group-hover:text-white transition-colors duration-300 group-hover:translate-x-px">
              →
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

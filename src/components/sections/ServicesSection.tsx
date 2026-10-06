'use client';

import { useState } from 'react';
import { useCursorStore } from '@/components/ui/CustomCursor';
import { useModalStore } from '@/lib/modalStore';

interface ServiceItem {
  number: string;
  title: string;
  description: string;
  capabilities: string;
  isPrimaryTech?: boolean;
}

const services: ServiceItem[] = [
  {
    number: '01',
    title: 'Website Development',
    description: 'High-performance websites and digital experiences built around your business.',
    capabilities: 'Websites • E-commerce • Web Apps',
    isPrimaryTech: true,
  },
  {
    number: '02',
    title: 'App Development',
    description: 'Native and cross-platform applications designed for real-world products and users.',
    capabilities: 'iOS • Android • Cross-platform',
    isPrimaryTech: true,
  },
  {
    number: '03',
    title: 'Custom Software',
    description: 'Tailored digital systems that simplify operations and help businesses scale.',
    capabilities: 'Dashboards • Automation • Internal Tools',
    isPrimaryTech: true,
  },
  {
    number: '04',
    title: 'Content Creation',
    description: 'Strategic visual content that gives brands a stronger presence across digital channels.',
    capabilities: 'Video • Photography • Reels • Campaigns',
    isPrimaryTech: false,
  },
  {
    number: '05',
    title: 'Digital Marketing',
    description: 'Strategy-driven marketing designed to increase reach, performance and revenue.',
    capabilities: 'Social • SEO • Performance • Growth',
    isPrimaryTech: false,
  },
];

export function ServicesSection() {
  const setVariant = useCursorStore((state) => state.setVariant);
  const { openProjectModal } = useModalStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section 
      id="services"
      className="relative w-full bg-[#F3EEE7] text-[#171515] py-20 sm:py-24 lg:py-28 px-6 sm:px-10 lg:px-16 overflow-hidden select-none border-t border-black/[0.08]"
    >
      <div className="relative z-10 w-full max-w-[1260px] mx-auto">
        
        {/* ===================================================
            CENTERED INTRODUCTION & EDITORIAL HEADER
            =================================================== */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14 sm:mb-18 lg:mb-20">
          
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F1420]" />
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#6E665E] font-semibold">
              OUR SERVICES
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F1420]" />
          </div>

          {/* Centered Main Heading: Refined Sans + Serif pairing */}
          <h2 className="font-sans font-extrabold uppercase tracking-[-0.03em] leading-[0.96] text-[#171515] text-4xl sm:text-5xl lg:text-[4.25rem]">
            <span className="block">Everything</span>
            <span className="block mt-1">You Need</span>
            <span className="block font-serif italic font-normal text-[#6F1420] text-5xl sm:text-6xl lg:text-[5rem] mt-1.5 tracking-tight capitalize">
              To Grow.
            </span>
          </h2>

          {/* Centered Highlight Tagline (Sits below the heading) */}
          <div className="mt-5 sm:mt-6">
            <p className="font-serif italic text-base sm:text-lg text-[#6E665E] leading-relaxed">
              “Digital products, creative systems, and growth —{' '}
              <span className="not-italic font-sans font-semibold text-[#6F1420] text-xs sm:text-sm uppercase tracking-wider">
                under one roof.
              </span>”
            </p>
          </div>

          {/* Centered Supporting Statement */}
          <p className="mt-4 font-sans text-xs sm:text-sm text-[#5C554E] max-w-md mx-auto leading-relaxed">
            From digital products and custom software to content and growth, we build the systems that move ambitious businesses forward.
          </p>

          {/* Centered View All Services Action */}
          <div className="mt-6 sm:mt-7">
            <button
              type="button"
              onClick={openProjectModal}
              onMouseEnter={() => setVariant('button')}
              onMouseLeave={() => setVariant('default')}
              className="group inline-flex items-center justify-center gap-2.5 px-6 h-10.5 rounded-full bg-white hover:bg-[#171515] text-[#171515] hover:text-[#FAF7F2] border border-black/15 hover:border-[#171515] text-xs font-sans font-semibold uppercase tracking-[0.1em] transition-all duration-300 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
            >
              <span>View All Services</span>
              <span className="text-sm font-normal transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </div>

        </div>

        {/* ===================================================
            FULL-WIDTH SERVICE SYSTEM (5 ROWS WITH THIN DIVIDERS)
            Grid: NUMBER | SERVICE | DESCRIPTION & CAPABILITIES | ARROW
            =================================================== */}
        <div className="w-full border-t border-b border-black/10 divide-y divide-black/10">
          {services.map((service, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={service.number}
                onClick={openProjectModal}
                onMouseEnter={() => {
                  setHoveredIndex(index);
                  setVariant('button');
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setVariant('default');
                }}
                className={`group relative cursor-pointer transition-colors duration-300 ${
                  isHovered ? 'bg-white/60' : 'hover:bg-white/40'
                } px-4 sm:px-6 lg:px-8 ${
                  service.isPrimaryTech 
                    ? 'py-6 sm:py-7 lg:py-8' 
                    : 'py-5 sm:py-6 lg:py-7'
                }`}
              >
                {/* Left Subtle Maroon Accent Line on Hover */}
                <div 
                  className={`absolute left-0 top-3 bottom-3 w-[3px] bg-[#6F1420] rounded-r transition-transform duration-300 origin-center ${
                    isHovered ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-100'
                  }`}
                />

                {/* Desktop & Tablet Engineered Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-center">
                  
                  {/* Column 1: Monospace Number (1 col) */}
                  <div className="md:col-span-1 flex items-center justify-between md:justify-start">
                    <span className={`font-mono text-xs sm:text-sm font-medium transition-colors duration-200 ${
                      isHovered ? 'text-[#6F1420]' : 'text-[#8C847C] group-hover:text-[#6F1420]'
                    }`}>
                      {service.number}
                    </span>

                    {/* Mobile Only: Arrow Button for clean small screen alignment */}
                    <div className="md:hidden flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border ${
                        isHovered 
                          ? 'bg-[#6F1420] text-white border-[#6F1420]' 
                          : 'bg-white text-[#171515] border-black/10'
                      }`}>
                        <span className="text-xs">→</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Service Title (4 cols) */}
                  <div className="md:col-span-4">
                    <h3 
                      className={`font-sans uppercase tracking-tight transition-all duration-300 transform group-hover:translate-x-1.5 ${
                        service.isPrimaryTech
                          ? 'font-extrabold text-xl sm:text-2xl lg:text-[1.7rem]'
                          : 'font-bold text-lg sm:text-xl lg:text-[1.45rem]'
                      } ${
                        isHovered ? 'text-[#6F1420]' : 'text-[#171515] group-hover:text-[#6F1420]'
                      }`}
                    >
                      {service.title}
                    </h3>
                  </div>

                  {/* Column 3: One-Line Description + Capability List (6 cols) */}
                  <div className="md:col-span-6 flex flex-col justify-center">
                    <p className="font-sans text-xs sm:text-sm text-[#5C554E] group-hover:text-[#171515] transition-colors leading-relaxed">
                      {service.description}
                    </p>
                    <p className="font-mono text-[11px] sm:text-xs text-[#8C847C] group-hover:text-[#6E665E] transition-colors mt-1.5 tracking-tight">
                      {service.capabilities}
                    </p>
                  </div>

                  {/* Column 4: Arrow view action (1 col, hidden on mobile since rendered next to number) */}
                  <div className="hidden md:flex md:col-span-1 justify-end items-center">
                    <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${
                      isHovered 
                        ? 'bg-[#6F1420] text-white border-[#6F1420] shadow-[0_2px_10px_rgba(111,20,32,0.25)]' 
                        : 'bg-white group-hover:bg-[#6F1420] group-hover:text-white text-[#171515] border-black/10 group-hover:border-[#6F1420]'
                    }`}>
                      <span className="text-sm font-sans transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

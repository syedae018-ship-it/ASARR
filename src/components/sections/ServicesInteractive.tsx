'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCursorStore } from '@/components/ui/CustomCursor';

type ServiceId = 'technology' | 'creative' | 'growth';

interface ServiceData {
  id: string;
  key: ServiceId;
  navTitle: string;
  statementTitle: string;
  description: string[];
  capabilities: {
    number: string;
    title: string;
    href: string;
  }[];
  ctaText: string;
}

const servicesData: Record<ServiceId, ServiceData> = {
  technology: {
    id: '01',
    key: 'technology',
    navTitle: 'Technology',
    statementTitle: 'TECHNOLOGY',
    description: [
      'Turn ideas into powerful digital products',
      'with clean, scalable and modern technology.',
    ],
    capabilities: [
      { number: '01', title: 'Website Development', href: '#contact' },
      { number: '02', title: 'Custom Software', href: '#contact' },
      { number: '03', title: 'App Development', href: '#contact' },
      { number: '04', title: 'AI Integration', href: '#contact' },
    ],
    ctaText: 'EXPLORE\nTECHNOLOGY',
  },
  creative: {
    id: '02',
    key: 'creative',
    navTitle: 'Creative',
    statementTitle: 'CREATIVE',
    description: [
      'Craft compelling visual narratives and brand',
      'identities that resonate, inspire and leave a mark.',
    ],
    capabilities: [
      { number: '01', title: 'Brand Identity', href: '#contact' },
      { number: '02', title: 'Art Direction', href: '#contact' },
      { number: '03', title: 'Video Production', href: '#contact' },
      { number: '04', title: 'Social Content', href: '#contact' },
    ],
    ctaText: 'EXPLORE\nCREATIVE',
  },
  growth: {
    id: '03',
    key: 'growth',
    navTitle: 'Growth',
    statementTitle: 'GROWTH',
    description: [
      'Scale your audience, accelerate engagement and drive',
      'measurable outcomes with data-driven strategy.',
    ],
    capabilities: [
      { number: '01', title: 'Performance Marketing', href: '#contact' },
      { number: '02', title: 'SEO Strategy', href: '#contact' },
      { number: '03', title: 'Data Analytics', href: '#contact' },
      { number: '04', title: 'Growth Strategy', href: '#contact' },
    ],
    ctaText: 'EXPLORE\nGROWTH',
  },
};

const serviceOrder: ServiceId[] = ['technology', 'creative', 'growth'];

export function ServicesInteractive() {
  const [activeService, setActiveService] = useState<ServiceId>('technology');
  const [hoveredCapability, setHoveredCapability] = useState<number | null>(0); // Row 01 active initially like reference
  const setVariant = useCursorStore(state => state.setVariant);

  const current = servicesData[activeService];

  return (
    <section 
      id="services" 
      className="relative w-full flex flex-col justify-center overflow-hidden bg-[#F3F0EA] text-[#171515] px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20 lg:py-24 select-none"
      aria-label="Services Section"
    >
      {/* ============================================================== */}
      {/* 1. TOP HEADER BAR: "SERVICES" + EXTENDED HAIRLINE              */}
      {/* ============================================================== */}
      <div className="relative z-20 flex items-center justify-between w-full max-w-[1554px] mx-auto pb-6 sm:pb-8">
        <div className="flex items-center gap-4 sm:gap-6 flex-1">
          <span className="font-sans font-semibold text-[11px] sm:text-[12px] uppercase tracking-[0.14em] text-[#171515]">
            SERVICES
          </span>
          <div className="h-[1px] bg-[#171515]/[0.15] flex-1 max-w-[320px]" aria-hidden="true" />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN BODY: LEFT NAVIGATION + VERTICAL DIVIDER + MAIN CONTENT*/}
      {/* ============================================================== */}
      <div className="relative z-20 w-full max-w-[1554px] mx-auto flex-1 flex flex-col lg:flex-row items-stretch my-auto py-5 sm:py-6">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: SERVICE SELECTOR NAVIGATION (~22% width)        */}
        {/* ============================================================ */}
        <div className="w-full lg:w-[22%] xl:w-[21%] flex flex-col justify-center pr-6 sm:pr-8 py-4 sm:py-6 relative">
          
          {/* Subtle vertical hairline grid separator on the right edge */}
          <div className="hidden lg:block absolute right-0 top-[6%] bottom-[6%] w-[1px] bg-[#171515]/[0.15]" aria-hidden="true" />

          <div className="flex flex-col w-full divide-y divide-[#171515]/[0.10]">
            {serviceOrder.map((key) => {
              const item = servicesData[key];
              const isActive = activeService === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActiveService(key);
                    setHoveredCapability(0);
                  }}
                  onMouseEnter={() => setVariant('button')}
                  onMouseLeave={() => setVariant('default')}
                  className={`group relative flex items-baseline gap-4 sm:gap-5 py-5 sm:py-6 w-full text-left transition-all duration-300 ${
                    isActive ? 'text-[#171515]' : 'text-[#7A756F] hover:text-[#171515]'
                  }`}
                  aria-pressed={isActive}
                >
                  {/* Active Burgundy Left Vertical Hairline Indicator */}
                  {isActive && (
                    <span
                      className="absolute -left-3 sm:-left-5 top-3 sm:top-4 bottom-3 sm:bottom-4 w-[2.5px] bg-[#751423]"
                    />
                  )}

                  {/* Service Number */}
                  <span 
                    className={`font-sans font-medium text-[13px] sm:text-[14px] tracking-[0.10em] transition-colors duration-300 ${
                      isActive ? 'text-[#751423]' : 'text-[#8C8781]'
                    }`}
                  >
                    {item.id}
                  </span>

                  {/* Service Title */}
                  <div className="flex flex-col items-start">
                    <span 
                      className={`font-serif text-[28px] sm:text-[34px] xl:text-[37px] font-normal leading-[1.0] tracking-[-0.01em] transition-colors duration-300 ${
                        isActive ? 'text-[#171515]' : 'text-[#6E6963] group-hover:text-[#171515]'
                      }`}
                    >
                      {item.navTitle}
                    </span>

                    {/* Active Burgundy Underline */}
                    {isActive && (
                      <span
                        className="w-9 sm:w-11 h-[2px] bg-[#751423] mt-2 block"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER / RIGHT COLUMN: DYNAMIC MAIN EDITORIAL CONTENT       */}
        {/* ============================================================ */}
        <div className="w-full lg:w-[78%] xl:w-[79%] flex flex-col items-start justify-center lg:pl-10 xl:pl-14 py-4 sm:py-6">
          <div className="flex flex-col items-start w-full max-w-[800px]">
            
            {/* Main Visual Statement Heading (Architectural Swiss condensed grotesk) */}
            <h3 className="font-condensed font-[900] text-[clamp(4.6rem,9.4vw,10.6rem)] text-[#171515] leading-[0.98] tracking-[-0.015em] uppercase select-none w-full my-0.5 sm:my-1">
              {current.statementTitle}
            </h3>

            {/* Description */}
            <p className="font-sans font-normal text-[15.5px] sm:text-[17px] text-[#423E3A] max-w-[520px] leading-[1.6] tracking-[-0.005em] mt-4 sm:mt-5 mb-6 sm:mb-8 text-left">
              {current.description[0]}<br className="hidden sm:inline" />
              {current.description[1]}
            </p>

            {/* CORE CAPABILITIES SUB-SECTION */}
            <div className="w-full flex flex-col items-start">
              {/* Core Capabilities Header + Hairline */}
              <div className="flex items-center gap-4 w-full mb-1 sm:mb-2 max-w-[580px] sm:max-w-[620px]">
                <span className="font-sans font-semibold text-[10.5px] sm:text-[11px] uppercase tracking-[0.12em] text-[#171515] whitespace-nowrap">
                  CORE CAPABILITIES
                </span>
                <div className="h-[1px] bg-[#171515]/[0.15] flex-1" aria-hidden="true" />
              </div>

              {/* 4 Capabilities Rows */}
              <div className="w-full flex flex-col max-w-[580px] sm:max-w-[620px]">
                {current.capabilities.map((cap, idx) => {
                  const isHovered = hoveredCapability === idx;

                  return (
                    <Link
                      key={cap.number}
                      href={cap.href}
                      onMouseEnter={() => {
                        setHoveredCapability(idx);
                        setVariant('button');
                      }}
                      onMouseLeave={() => {
                        setVariant('default');
                      }}
                      className={`group relative flex items-center justify-between py-4 sm:py-5 w-full border-b transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isHovered 
                          ? 'border-[#751423] translate-x-2' 
                          : 'border-[#171515]/[0.10] hover:border-[#171515]/[0.30]'
                      }`}
                    >
                      <div className="flex items-baseline gap-5 sm:gap-7">
                        {/* Capability Number */}
                        <span 
                          className={`font-sans font-medium text-[12px] sm:text-[13px] tracking-[0.10em] transition-colors duration-400 ${
                            isHovered ? 'text-[#751423]' : 'text-[#85817C]'
                          }`}
                        >
                          {cap.number}
                        </span>

                        {/* Capability Title (High-fashion serif) */}
                        <span 
                          className={`font-serif text-[19px] sm:text-[22.5px] font-normal tracking-[-0.01em] transition-colors duration-400 ${
                            isHovered ? 'text-[#171515]' : 'text-[#171515]/85'
                          }`}
                        >
                          {cap.title}
                        </span>
                      </div>

                      {/* Arrow */}
                      <span 
                        className={`text-[19px] sm:text-[21px] transition-all duration-400 font-light transform ${
                          isHovered 
                            ? 'text-[#751423] translate-x-1' 
                            : 'text-[#85817C] group-hover:text-[#171515]'
                        }`}
                      >
                        →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom CTA Button */}
            <div className="mt-8 sm:mt-10 flex items-center gap-4 sm:gap-5">
              <Link
                href="#contact"
                onMouseEnter={() => setVariant('button')}
                onMouseLeave={() => setVariant('default')}
                className="group relative flex items-center gap-4 sm:gap-5"
              >
                {/* Burgundy Circle with Arrow */}
                <span className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#751423] group-hover:bg-[#8D182B] text-white flex items-center justify-center transition-all duration-400 shadow-[0_2px_12px_rgba(117,20,35,0.25)] group-hover:scale-105 active:scale-95">
                  <svg 
                    className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white transform transition-transform duration-300 group-hover:translate-x-1" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </span>

                {/* Stacked Text beside Circle: "EXPLORE / TECHNOLOGY" */}
                <span className="font-sans font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-[#171515] leading-[1.6] text-left">
                  EXPLORE<br />
                  {current.statementTitle}
                </span>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

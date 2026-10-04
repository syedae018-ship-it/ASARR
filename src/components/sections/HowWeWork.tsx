'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCursorStore } from '@/components/ui/CustomCursor';

export function HowWeWork() {
  const [activeStage, setActiveStage] = useState<number>(0);
  const setVariant = useCursorStore((state) => state.setVariant);

  return (
    <section 
      id="how-we-work" 
      className="py-14 md:py-18 bg-[#F4F1EB] text-[#1C1A1A] relative border-t border-black/10 overflow-hidden select-none"
    >
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 relative">
        
        {/* ========================================================= */}
        {/* TOP SUB-NAV HEADER                                        */}
        {/* ========================================================= */}
        {/* TOP SUB-NAV HEADER                                        */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-black/10">
          <div className="flex items-center gap-4 flex-grow">
            <span className="text-[11px] sm:text-[12px] font-sans font-semibold tracking-[0.14em] uppercase text-[#1C1A1A] shrink-0">
              HOW WE WORK
            </span>
            <div className="h-[1px] bg-black/15 flex-1 max-w-[320px]" />
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTERPIECE HEADLINE                                      */}
        {/* ========================================================= */}
        <div className="text-center pt-8 md:pt-10 pb-8 md:pb-12 max-w-3xl mx-auto">
          <span className="text-[11px] sm:text-[12px] font-sans font-semibold tracking-[0.12em] uppercase text-[#751423] block mb-3">
            OUR METHODOLOGY
          </span>

          <h2 className="leading-[0.98] tracking-tight">
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.5rem] font-condensed font-extrabold uppercase text-[#111] leading-[0.98] tracking-tight">
              IDEAS INTO{' '}
            </span>
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.5rem] font-serif italic font-normal text-[#751423] leading-[0.98] tracking-tight">
              IMPACT.
            </span>
          </h2>

          <p className="text-sm sm:text-base font-sans text-black/80 leading-relaxed max-w-xl mx-auto mt-4">
            Strategy, creativity, technology and media — working together to turn bold ideas into measurable results.
          </p>
        </div>

        {/* ========================================================= */}
        {/* DESKTOP ROADMAP SYSTEM                                     */}
        {/* ========================================================= */}
        <div className="relative w-full hidden lg:block h-[580px] my-2">
          
          {/* Subtle architectural background reference grid */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-[310px] left-0 right-0 h-[1px] bg-black/10" />
            <div className="absolute top-[430px] left-0 right-0 h-[1px] bg-black/10" />
            <div className="absolute left-[7.5%] top-0 bottom-0 w-[1px] bg-black/10 border-r border-dashed border-black/15" />
            <div className="absolute left-[29.5%] top-0 bottom-0 w-[1px] bg-black/10 border-r border-dashed border-black/15" />
            <div className="absolute left-[53%] top-0 bottom-0 w-[1px] bg-black/10 border-r border-dashed border-black/15" />
            <div className="absolute left-[76.5%] top-0 bottom-0 w-[1px] bg-black/10 border-r border-dashed border-black/15" />
          </div>

          {/* CONTINUOUS CURVING MAROON WAVE LINE (SVG) */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-10" 
            viewBox="0 0 1440 560" 
            preserveAspectRatio="none"
          >
            {/* Dashed entry on far left */}
            <line 
              x1="35" 
              y1="285" 
              x2="110" 
              y2="285" 
              stroke="#751423" 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
              opacity="0.45" 
            />

            {/* Continuous wave path through the 4 milestones */}
            <path
              d="M 110,285 C 210,260 310,265 425,335 C 530,395 640,360 765,372 C 865,382 965,405 1098,322 C 1175,275 1270,290 1375,290"
              fill="none"
              stroke="#751423"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* ======================================================= */}
          {/* 01 DISCOVER STAGE                                       */}
          {/* ======================================================= */}
          <div 
            className="absolute left-[3.5%] top-[45px] w-[260px] z-20 group cursor-pointer"
            onMouseEnter={() => { setActiveStage(0); setVariant('button'); }}
            onMouseLeave={() => setVariant('default')}
            onClick={() => setActiveStage(0)}
          >
            {/* Typography Above Route */}
            <div className="pl-7">
              <span className="text-5xl font-condensed font-extrabold text-[#B5B1A8] block leading-none select-none tracking-tight">
                01
              </span>
              <h3 className={`text-xl font-condensed font-bold tracking-tight uppercase leading-none mt-1 transition-colors duration-300 ${
                activeStage === 0 ? 'text-[#751423]' : 'text-[#111]'
              }`}>
                DISCOVER
              </h3>
              <p className="text-xs font-serif italic text-black/75 mt-1 leading-snug">
                Understand<br />the problem.
              </p>
            </div>

            {/* Frosted Double-Circle Milestone Badge (Sitting on line at x=110, y=285) */}
            <div className="absolute left-[14px] top-[204px] z-30">
              <div className={`w-[72px] h-[72px] rounded-full bg-[#F4F1EB] flex items-center justify-center transition-all duration-300 shadow-[0_12px_28px_-4px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,1)_inset] ${
                activeStage === 0 ? 'scale-105 shadow-[0_14px_30px_rgba(117,20,35,0.3)]' : ''
              }`}>
                <div className="w-[44px] h-[44px] rounded-full bg-[#751423] flex items-center justify-center text-white shadow-sm">
                  {/* Magnifying Glass Search Icon */}
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white stroke-[2.2]" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="6" />
                    <line x1="15.5" y1="15.5" x2="20" y2="20" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Visual Card (Notebook & Pen) */}
            <div className="mt-[135px] ml-7 relative w-[175px] rounded-2xl overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.08)] border border-black/5 bg-[#F9F7F2]">
              <Image 
                src="/images/hww/card_discover.png" 
                alt="Discover - Research Notes" 
                width={175}
                height={175}
                className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
          </div>

          {/* ======================================================= */}
          {/* 02 CREATE STAGE                                         */}
          {/* ======================================================= */}
          <div 
            className="absolute left-[25.5%] top-[95px] w-[260px] z-20 group cursor-pointer"
            onMouseEnter={() => { setActiveStage(1); setVariant('button'); }}
            onMouseLeave={() => setVariant('default')}
            onClick={() => setActiveStage(1)}
          >
            {/* Typography Above Route */}
            <div className="pl-7">
              <span className="text-5xl font-condensed font-extrabold text-[#B5B1A8] block leading-none select-none tracking-tight">
                02
              </span>
              <h3 className={`text-xl font-condensed font-bold tracking-tight uppercase leading-none mt-1 transition-colors duration-300 ${
                activeStage === 1 ? 'text-[#751423]' : 'text-[#111]'
              }`}>
                CREATE
              </h3>
              <p className="text-xs font-serif italic text-black/75 mt-1 leading-snug">
                Strategy, design<br />and production.
              </p>
            </div>

            {/* Frosted Double-Circle Milestone Badge (Sitting on line at x=425, y=335) */}
            <div className="absolute left-[14px] top-[204px] z-30">
              <div className={`w-[72px] h-[72px] rounded-full bg-[#F4F1EB] flex items-center justify-center transition-all duration-300 shadow-[0_12px_28px_-4px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,1)_inset] ${
                activeStage === 1 ? 'scale-105 shadow-[0_12px_28px_rgba(117,20,35,0.3)]' : ''
              }`}>
                <div className="w-[44px] h-[44px] rounded-full bg-[#751423] flex items-center justify-center text-white shadow-sm">
                  {/* Isometric Cube Icon */}
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white stroke-[2]" fill="none" stroke="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Visual Card (Aa Typography & Swatches) */}
            <div className="mt-[135px] ml-7 relative w-[175px] rounded-2xl overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.08)] border border-black/5 bg-[#F9F7F2]">
              <Image 
                src="/images/hww/card_create.png" 
                alt="Create - Typography & Swatches" 
                width={175}
                height={150}
                className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
          </div>

          {/* ======================================================= */}
          {/* 03 BUILD STAGE                                          */}
          {/* ======================================================= */}
          <div 
            className="absolute left-[49%] top-[135px] w-[260px] z-20 group cursor-pointer"
            onMouseEnter={() => { setActiveStage(2); setVariant('button'); }}
            onMouseLeave={() => setVariant('default')}
            onClick={() => setActiveStage(2)}
          >
            {/* Typography Above Route */}
            <div className="pl-7">
              <span className="text-5xl font-condensed font-extrabold text-[#B5B1A8] block leading-none select-none tracking-tight">
                03
              </span>
              <h3 className={`text-xl font-condensed font-bold tracking-tight uppercase leading-none mt-1 transition-colors duration-300 ${
                activeStage === 2 ? 'text-[#751423]' : 'text-[#111]'
              }`}>
                BUILD
              </h3>
              <p className="text-xs font-serif italic text-black/75 mt-1 leading-snug">
                Websites, apps,<br />software and digital products.
              </p>
            </div>

            {/* Frosted Double-Circle Milestone Badge (Sitting on line at x=765, y=372) */}
            <div className="absolute left-[14px] top-[201px] z-30">
              <div className={`w-[72px] h-[72px] rounded-full bg-[#F4F1EB] flex items-center justify-center transition-all duration-300 shadow-[0_12px_28px_-4px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,1)_inset] ${
                activeStage === 2 ? 'scale-105 shadow-[0_12px_28px_rgba(117,20,35,0.3)]' : ''
              }`}>
                <div className="w-[44px] h-[44px] rounded-full bg-[#751423] flex items-center justify-center text-white shadow-sm">
                  {/* Laptop / Screen Icon */}
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white stroke-[2]" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="12" rx="1.5" />
                    <line x1="2" y1="20" x2="22" y2="20" />
                    <line x1="8" y1="20" x2="16" y2="20" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Visual Card (Code Editor) */}
            <div className="mt-[135px] ml-7 relative w-[175px] rounded-2xl overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.08)] border border-black/5 bg-[#1F1F1F]">
              <Image 
                src="/images/hww/card_build.png" 
                alt="Build - Code Editor" 
                width={175}
                height={110}
                className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
          </div>

          {/* ======================================================= */}
          {/* 04 GROW STAGE                                           */}
          {/* ======================================================= */}
          <div 
            className="absolute left-[72%] top-[80px] w-[260px] z-20 group cursor-pointer"
            onMouseEnter={() => { setActiveStage(3); setVariant('button'); }}
            onMouseLeave={() => setVariant('default')}
            onClick={() => setActiveStage(3)}
          >
            {/* Typography Above Route */}
            <div className="pl-7">
              <span className="text-5xl font-condensed font-extrabold text-[#B5B1A8] block leading-none select-none tracking-tight">
                04
              </span>
              <h3 className={`text-xl font-condensed font-bold tracking-tight uppercase leading-none mt-1 transition-colors duration-300 ${
                activeStage === 3 ? 'text-[#751423]' : 'text-[#111]'
              }`}>
                GROW
              </h3>
              <p className="text-xs font-serif italic text-black/75 mt-1 leading-snug">
                Content, marketing<br />and optimization.
              </p>
            </div>

            {/* Frosted Double-Circle Milestone Badge (Sitting on line at x=1098, y=322) */}
            <div className="absolute left-[14px] top-[206px] z-30">
              <div className={`w-[72px] h-[72px] rounded-full bg-[#F4F1EB] flex items-center justify-center transition-all duration-300 shadow-[0_12px_28px_-4px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,1)_inset] ${
                activeStage === 3 ? 'scale-105 shadow-[0_12px_28px_rgba(117,20,35,0.3)]' : ''
              }`}>
                <div className="w-[44px] h-[44px] rounded-full bg-[#751423] flex items-center justify-center text-white shadow-sm">
                  {/* Ascending Bar Chart Icon */}
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                    <rect x="4" y="14" width="3.5" height="7" rx="0.5" />
                    <rect x="10.25" y="9" width="3.5" height="12" rx="0.5" />
                    <rect x="16.5" y="4" width="3.5" height="17" rx="0.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Visual Card (Ascending Concrete Pillars & Red Vector Arrow) */}
            <div className="mt-[135px] ml-7 relative w-[175px] rounded-2xl overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.08)] border border-black/5 bg-[#F9F7F2]">
              <Image 
                src="/images/hww/card_grow.png" 
                alt="Grow - Ascending Pillars" 
                width={175}
                height={140}
                className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* MOBILE ARCHITECTURAL WAYFINDING ROUTE (VERTICAL)          */}
        {/* ========================================================= */}
        <div className="lg:hidden relative pl-8 py-6 space-y-12">
          
          {/* Continuous Vertical Maroon Line */}
          <div className="absolute left-[13px] top-6 bottom-6 w-[2px] bg-[#751423]" />

          {/* STAGE 01: DISCOVER */}
          <div 
            className="relative cursor-pointer group"
            onClick={() => setActiveStage(0)}
          >
            {/* Milestone Badge on Route */}
            <div className="absolute -left-[28px] top-1 w-6 h-6 rounded-full border-2 border-[#751423] bg-[#F4F1EB] flex items-center justify-center shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-[#751423]" />
            </div>

            <span className="text-4xl font-condensed font-extrabold text-[#B5B1A8] block leading-none select-none">
              01
            </span>
            <h3 className="text-xl font-condensed font-bold tracking-tight uppercase text-[#111] mt-0.5">
              DISCOVER
            </h3>
            <p className="text-xs font-serif italic text-black/75 mt-1 leading-snug">
              Understand the problem.
            </p>

            <div className="mt-3 relative w-[160px] rounded-2xl overflow-hidden shadow-md border border-black/5 bg-[#F9F7F2]">
              <Image 
                src="/images/hww/card_discover.png" 
                alt="Discover" 
                width={160}
                height={160}
                className="w-full h-auto block object-cover" 
              />
            </div>
          </div>

          {/* STAGE 02: CREATE */}
          <div 
            className="relative cursor-pointer group"
            onClick={() => setActiveStage(1)}
          >
            {/* Milestone Badge on Route */}
            <div className="absolute -left-[28px] top-1 w-6 h-6 rounded-full border-2 border-[#751423] bg-[#F4F1EB] flex items-center justify-center shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-[#751423]" />
            </div>

            <span className="text-4xl font-condensed font-extrabold text-[#B5B1A8] block leading-none select-none">
              02
            </span>
            <h3 className="text-xl font-condensed font-bold tracking-tight uppercase text-[#111] mt-0.5">
              CREATE
            </h3>
            <p className="text-xs font-serif italic text-black/75 mt-1 leading-snug">
              Strategy, design and production.
            </p>

            <div className="mt-3 relative w-[160px] rounded-2xl overflow-hidden shadow-md border border-black/5 bg-[#F9F7F2]">
              <Image 
                src="/images/hww/card_create.png" 
                alt="Create" 
                width={160}
                height={135}
                className="w-full h-auto block object-cover" 
              />
            </div>
          </div>

          {/* STAGE 03: BUILD */}
          <div 
            className="relative cursor-pointer group"
            onClick={() => setActiveStage(2)}
          >
            {/* Milestone Badge on Route */}
            <div className="absolute -left-[28px] top-1 w-6 h-6 rounded-full border-2 border-[#751423] bg-[#F4F1EB] flex items-center justify-center shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-[#751423]" />
            </div>

            <span className="text-4xl font-condensed font-extrabold text-[#B5B1A8] block leading-none select-none">
              03
            </span>
            <h3 className="text-xl font-condensed font-bold tracking-tight uppercase text-[#111] mt-0.5">
              BUILD
            </h3>
            <p className="text-xs font-serif italic text-black/75 mt-1 leading-snug">
              Websites, apps, software and digital products.
            </p>

            <div className="mt-3 relative w-[160px] rounded-2xl overflow-hidden shadow-md border border-black/5 bg-[#1F1F1F]">
              <Image 
                src="/images/hww/card_build.png" 
                alt="Build" 
                width={160}
                height={100}
                className="w-full h-auto block object-cover" 
              />
            </div>
          </div>

          {/* STAGE 04: GROW */}
          <div 
            className="relative cursor-pointer group"
            onClick={() => setActiveStage(3)}
          >
            {/* Milestone Badge on Route */}
            <div className="absolute -left-[28px] top-1 w-6 h-6 rounded-full border-2 border-[#751423] bg-[#F4F1EB] flex items-center justify-center shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-[#751423]" />
            </div>

            <span className="text-4xl font-condensed font-extrabold text-[#B5B1A8] block leading-none select-none">
              04
            </span>
            <h3 className="text-xl font-condensed font-bold tracking-tight uppercase text-[#111] mt-0.5">
              GROW
            </h3>
            <p className="text-xs font-serif italic text-black/75 mt-1 leading-snug">
              Content, marketing and optimization.
            </p>

            <div className="mt-3 relative w-[160px] rounded-2xl overflow-hidden shadow-md border border-black/5 bg-[#F9F7F2]">
              <Image 
                src="/images/hww/card_grow.png" 
                alt="Grow" 
                width={160}
                height={125}
                className="w-full h-auto block object-cover" 
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

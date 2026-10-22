'use client';

import Image from 'next/image';
import { useCursorStore } from '@/components/ui/CustomCursor';
import { useModalStore } from '@/lib/modalStore';

export function FinalCTA() {
  const setVariant = useCursorStore((state) => state.setVariant);
  const { openProjectModal, openBookCall } = useModalStore();

  return (
    <section 
      id="contact"
      className="relative w-full bg-[#130708] text-[#FAF6F0] overflow-hidden select-none border-t border-black/10"
    >
      {/* Background Gradient Blend: Deep Near-Black Oxblood to Rich Burgundy */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-[#140809] via-[#22090D] via-60% to-[#4D0E18] pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Atmospheric Radial Burgundy Glow behind Logo Panel */}
      <div 
        className="absolute top-1/2 right-[5%] lg:right-[12%] -translate-y-1/2 w-[340px] sm:w-[500px] lg:w-[620px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(168,40,59,0.38)_0%,rgba(85,16,25,0.22)_45%,transparent_75%)] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[1550px] mx-auto px-6 sm:px-12 lg:px-16 py-16 sm:py-24 lg:py-28">
        
        {/* Main Split Grid (Balanced Desktop Two-Column Composition) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Heading + Description + Action Buttons (Cols 1-7) */}
          <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-6 z-10">
            
            {/* Eyebrow Label with Burgundy Dot */}
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
              <span className="w-2 h-2 rounded-full bg-[#BC535D] shadow-[0_0_8px_rgba(188,83,93,0.6)]" />
              <span className="font-mono text-[10.5px] sm:text-[11.5px] uppercase tracking-[0.18em] text-[#A69996] font-medium">
                LET&apos;S BUILD TOGETHER
              </span>
            </div>

            {/* Headline Composition: Precise Two-Line Contrast */}
            <h2 className="text-[2.2rem] sm:text-5xl lg:text-[4.15rem] font-sans font-extrabold uppercase tracking-[-0.03em] leading-[1.04] text-white">
              <span className="block">READY TO CREATE</span>
              <span className="block mt-1.5 sm:mt-2.5">
                <span className="font-serif italic font-normal text-white uppercase">YOUR NEXT</span>{' '}
                <span className="font-serif font-bold text-[#A8283B] uppercase">ASARR</span>{' '}
                <span className="font-serif font-normal text-white">?</span>
              </span>
            </h2>

            {/* Supporting Paragraph */}
            <p className="font-sans text-xs sm:text-sm lg:text-[14.5px] text-[#C2B7AC] max-w-lg leading-[1.65] mt-5 sm:mt-6 mb-7 sm:mb-9">
              Let&apos;s bring your ideas to life with powerful content, marketing and technology. Reach out to schedule a consultation with our leadership.
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              
              {/* Primary White Pill Button */}
              <button
                type="button"
                onClick={openProjectModal}
                onMouseEnter={() => setVariant('button')}
                onMouseLeave={() => setVariant('default')}
                className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 h-[44px] sm:h-[46px] bg-[#FCFBF9] hover:bg-white text-[#151313] text-[11px] sm:text-xs font-sans font-bold uppercase tracking-[0.10em] rounded-full transition-all duration-300 shadow-[0_4px_22px_rgba(255,255,255,0.22)] hover:shadow-[0_6px_28px_rgba(255,255,255,0.32)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>START A PROJECT</span>
                <span aria-hidden="true" className="text-sm font-bold">→</span>
              </button>

              {/* Secondary Dark Translucent Pill with Thin Burgundy Border & Calendar Icon */}
              <button
                type="button"
                onClick={openBookCall}
                onMouseEnter={() => setVariant('button')}
                onMouseLeave={() => setVariant('default')}
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 h-[44px] sm:h-[46px] bg-[#18080C]/80 hover:bg-[#250C13] border border-[#7A222F]/70 hover:border-[#A8283B] text-white text-[11px] sm:text-xs font-sans font-semibold uppercase tracking-[0.10em] rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer backdrop-blur-sm"
              >
                <span>BOOK A CALL</span>
                {/* Custom Crisp Calendar Icon */}
                <svg 
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect x="2" y="3" width="12" height="11" rx="2" fill="#FFFFFF" />
                  <path d="M2 5C2 3.89543 2.89543 3 4 3H12C13.1046 3 14 3.89543 14 5V6H2V5Z" fill="#C83244" />
                  <rect x="4.5" y="1.5" width="1.5" height="2.5" rx="0.5" fill="#C83244" />
                  <rect x="10" y="1.5" width="1.5" height="2.5" rx="0.5" fill="#C83244" />
                  <rect x="4" y="8" width="2" height="1.5" rx="0.3" fill="#C83244" />
                  <rect x="7" y="8" width="2" height="1.5" rx="0.3" fill="#C83244" />
                  <rect x="10" y="8" width="2" height="1.5" rx="0.3" fill="#C83244" />
                  <rect x="4" y="10.5" width="2" height="1.5" rx="0.3" fill="#C83244" />
                  <rect x="7" y="10.5" width="2" height="1.5" rx="0.3" fill="#C83244" />
                </svg>
              </button>

            </div>

          </div>

          {/* Right Column: ASARR Logo Panel with Orbital Arc Rings (Cols 8-12) */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center lg:justify-end py-4 sm:py-6">
            
            {/* Background Orbital Rings & Sweeping Curve (SVG Layer) */}
            <div className="absolute inset-0 -inset-x-12 sm:-inset-x-20 pointer-events-none flex items-center justify-center lg:justify-end overflow-visible">
              <svg 
                className="w-[140%] max-w-[620px] aspect-square overflow-visible"
                viewBox="0 0 500 500" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Sweeping Wave Arc */}
                <path 
                  d="M -150 420 C 50 360 180 280 250 250 C 320 220 420 180 550 140" 
                  stroke="rgba(188, 48, 68, 0.28)" 
                  strokeWidth="1.2" 
                />

                {/* Main Orbital Ellipse encasing the Logo Card */}
                <ellipse 
                  cx="250" 
                  cy="250" 
                  rx="195" 
                  ry="185" 
                  stroke="rgba(215, 60, 85, 0.32)" 
                  strokeWidth="1.2" 
                />

                {/* Burgundy Dot along Orbital Ring at ~4:30 position */}
                <circle 
                  cx="428" 
                  cy="325" 
                  r="7.5" 
                  fill="#982234" 
                  className="shadow-sm"
                />
              </svg>
            </div>

            {/* Elevated Logo Card Container */}
            <div className="relative w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[370px] aspect-square">
              
              {/* Backing Dark Burgundy Offset Frame (Shadow / Layered Depth) */}
              <div 
                className="absolute inset-0 translate-x-2.5 translate-y-2.5 sm:translate-x-3.5 sm:translate-y-3.5 rounded-[26px] sm:rounded-[34px] bg-[#3B0C14] shadow-[0_24px_60px_rgba(0,0,0,0.65)] -z-10"
                aria-hidden="true"
              />

              {/* Front Warm Cream Card */}
              <div className="relative w-full h-full rounded-[24px] sm:rounded-[30px] overflow-hidden bg-[#FAF7F0] border border-white/40 shadow-sm flex items-center justify-center">
                <Image
                  src="/images/brand/asarr_logo_cream.png"
                  alt="ASARR"
                  fill
                  priority
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 340px, 370px"
                  className="object-cover select-none"
                />
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}


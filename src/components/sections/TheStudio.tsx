'use client';

import Image from 'next/image';
import { useCursorStore } from '@/components/ui/CustomCursor';

export function TheStudio() {
  const setVariant = useCursorStore((state) => state.setVariant);

  return (
    <section 
      id="studio" 
      className="py-16 sm:py-20 lg:py-24 bg-[#EFE9DF] text-[#161616] relative overflow-hidden select-none border-t border-black/10"
    >
      <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 relative">
        
        {/* Top Editorial Eyebrow */}
        <div className="flex items-center gap-4 pb-6">
          <span className="text-[11px] sm:text-[12px] font-mono uppercase tracking-[0.16em] text-[#161616] shrink-0">
            05 / THE STUDIO
          </span>
          <div className="h-[1px] bg-black/15 flex-1 max-w-[280px]" />
        </div>

        {/* Main Studio Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center my-6 sm:my-10">
          
          {/* Left / Center Manifesto (Cols 1-7) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Monumental Headline */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-sans font-bold uppercase tracking-tight leading-[1.04] text-[#161616]">
              <span className="block">WE THINK.</span>
              <span className="block mt-1">WE CREATE.</span>
              <span className="block mt-1">
                WE{' '}
                <span className="font-serif italic font-normal text-[#751423]">
                  BUILD.
                </span>
              </span>
            </h2>

            {/* Editorial Description */}
            <div className="mt-8 space-y-4 max-w-xl">
              <p className="text-base sm:text-lg font-sans text-[#2B2724] leading-[1.6]">
                ASARR is an independent creative and technology studio uniting strategy, art direction, media production, and software engineering.
              </p>
              <div className="w-10 h-[1.5px] bg-[#751423] my-4" />
              <p className="text-sm sm:text-base font-serif italic text-[#5C564E] leading-[1.7]">
                Founded on the belief that digital products and brand identities should be architected with uncompromising craft, speed, and lasting cultural resonance.
              </p>
            </div>

            {/* Three-Column Metadata Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 mt-8 border-t border-black/10">
              <div>
                <span className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-[#7A746B] block mb-1">
                  LOCATION
                </span>
                <span className="text-sm sm:text-base font-sans font-bold uppercase text-[#161616]">
                  BANGALORE, IN
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-[#7A746B] block mb-1">
                  DISCIPLINES
                </span>
                <span className="text-sm sm:text-base font-sans font-bold uppercase text-[#161616]">
                  CREATIVE / TECH
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-[#7A746B] block mb-1">
                  ESTABLISHED
                </span>
                <span className="text-sm sm:text-base font-sans font-bold uppercase text-[#161616]">
                  2026
                </span>
              </div>
            </div>

          </div>

          {/* Right Architectural Photograph (Cols 8-12) */}
          <div 
            className="lg:col-span-5 relative w-full h-[360px] sm:h-[440px] lg:h-[500px] rounded-2xl overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.06)] border border-black/10"
            onMouseEnter={() => setVariant('button')}
            onMouseLeave={() => setVariant('default')}
          >
            <Image 
              src="/images/studio/studio-arch-crisp.png" 
              alt="Studio Architectural Perspective"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center filter saturate-[0.92] contrast-[1.02] hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            />
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono uppercase tracking-[0.12em] text-white/90">
              STUDIO ARCHIVE / BLR
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

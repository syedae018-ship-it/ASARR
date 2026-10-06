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
      className="relative w-full bg-[#11100F] text-[#FAF6F0] overflow-hidden select-none"
    >
      {/* Background Gradient Blend into Deep Maroon */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-[#11100F] via-[#4A0D15]/80 to-[#6F1420]/70 pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-10 w-full max-w-[1550px] mx-auto px-6 sm:px-12 lg:px-16 py-20 sm:py-28">
        
        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Heading + Description + Action Buttons (Cols 1-7) */}
          <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-8">
            
            {/* Eyebrow Label */}
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6F1420]" />
              <span className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.16em] text-[#C9BFB5]">
                LET&apos;S BUILD TOGETHER
              </span>
            </div>

            {/* Monumental Headline */}
            <h2 className="text-4xl sm:text-6xl lg:text-[4.6rem] font-sans font-bold uppercase tracking-[-0.03em] leading-[1.0] text-white">
              <span className="block">Ready to Create</span>
              <span className="block font-serif italic font-normal text-[#F5D5DA] text-5xl sm:text-7xl lg:text-[5.4rem] mt-1 sm:mt-2">
                Your ASARR?
              </span>
            </h2>

            {/* Subtitle */}
            <p className="font-sans text-sm sm:text-base text-[#D4CCC2] max-w-lg leading-relaxed mt-6 mb-10">
              Let&apos;s bring your ideas to life with powerful content, marketing and technology. Reach out to schedule a consultation with our leadership.
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              {/* Primary White Pill Button */}
              <button
                type="button"
                onClick={openProjectModal}
                onMouseEnter={() => setVariant('button')}
                onMouseLeave={() => setVariant('default')}
                className="inline-flex items-center justify-center gap-3 px-8 h-[48px] bg-white hover:bg-[#FAF6F0] text-[#11100F] text-xs font-sans font-bold uppercase tracking-[0.10em] rounded-full transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_25px_rgba(255,255,255,0.25)] hover:-translate-y-0.5"
              >
                <span>Start a Project</span>
                <span aria-hidden="true" className="text-sm">→</span>
              </button>

              {/* Secondary Dark Pill with Calendar Icon */}
              <button
                type="button"
                onClick={openBookCall}
                onMouseEnter={() => setVariant('button')}
                onMouseLeave={() => setVariant('default')}
                className="inline-flex items-center justify-center gap-3 px-7 h-[48px] bg-[#1C1817]/90 hover:bg-[#2A2422] border border-white/20 hover:border-white/40 text-white text-xs font-sans font-semibold uppercase tracking-[0.10em] rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
              >
                <span>Book a Call</span>
                <span className="text-sm">🗓</span>
              </button>
            </div>

          </div>

          {/* Right Column: Architectural Pavilion Composition (Cols 8-12) */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px] aspect-square rounded-[32px] sm:rounded-[40px] overflow-hidden border border-white/20 shadow-[0_24px_70px_rgba(0,0,0,0.6)] group">
              <Image
                src="/images/studio_assets/cta_closing_scene.jpg"
                alt="Architectural pavilion at golden dusk — Ideas becoming reality"
                fill
                unoptimized
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center filter saturate-[0.98] contrast-[1.05] group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />

              {/* Ambient Dusk Glow & Inner Shadow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />
              <div className="absolute inset-0 rounded-[32px] sm:rounded-[40px] shadow-[inset_0_0_30px_rgba(0,0,0,0.4)] pointer-events-none" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

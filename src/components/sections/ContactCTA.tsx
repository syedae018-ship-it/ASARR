'use client';

import { motion } from 'framer-motion';
import { useCursorStore } from '@/components/ui/CustomCursor';

export function ContactCTA() {
  const setVariant = useCursorStore((state) => state.setVariant);

  return (
    <section 
      id="contact" 
      className="py-16 md:py-24 bg-[#751423] text-[#F9F6F0] relative overflow-hidden"
    >
      {/* Subtle Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="section-container relative z-10">
        
        {/* Editorial Eyebrow */}
        <div className="flex items-center justify-between gap-4 mb-8 md:mb-12 border-b border-white/15 pb-4 md:pb-5">
          <div className="flex items-center gap-4 flex-grow">
            <span className="text-[11px] sm:text-[12px] font-sans font-semibold tracking-[0.14em] uppercase text-white/90">
              CONTACT
            </span>
            <div className="h-[1px] bg-white/20 flex-1 max-w-[280px]" />
          </div>
          <span className="text-[11px] font-mono tracking-[0.10em] uppercase text-white/75 shrink-0">
            AVAILABLE WORLDWIDE
          </span>
        </div>

        {/* Grand Emotional Headline in One Single Line */}
        <div className="w-full mb-10 md:mb-14">
          <motion.p 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs sm:text-sm font-sans font-medium tracking-[0.12em] uppercase text-white/80 mb-4"
          >
            HAVE AN IDEA?
          </motion.p>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.8rem] xl:text-[6.2rem] 2xl:text-[7.2rem] font-condensed uppercase tracking-tight leading-[1.0] text-white whitespace-normal md:whitespace-nowrap"
          >
            LET&apos;S MAKE SOMETHING{' '}
            <span className="font-serif italic font-normal text-[#F9F6F0]">
              MATTER.
            </span>
          </motion.h2>
        </div>

        {/* Clear Tactile CTA & Direct Communication Details */}
        <div className="grid grid-cols-12 gap-8 items-center pt-8 md:pt-10 border-t border-white/15">
          
          {/* Main Action Pill */}
          <div className="col-span-12 md:col-span-5 lg:col-span-4">
            <a 
              href="mailto:hello@asarr.in?subject=New%20Project%20Inquiry%20%E2%80%94%20ASARR"
              onMouseEnter={() => setVariant('button')}
              onMouseLeave={() => setVariant('default')}
              className="inline-flex items-center justify-between gap-6 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-[#F9F6F0] text-[#751423] text-xs sm:text-sm font-bold uppercase tracking-[0.08em] hover:bg-white hover:shadow-2xl transition-all duration-300 group w-full sm:w-auto"
            >
              <span>START A PROJECT</span>
              <span className="text-base sm:text-lg transform transition-transform duration-300 group-hover:translate-x-1.5 group-hover:-translate-y-0.5">
                →
              </span>
            </a>
          </div>

          {/* Editorial Metadata Blocks */}
          <div className="col-span-12 md:col-span-7 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-[11px] font-mono tracking-[0.08em] uppercase">
            
            <div className="flex flex-col gap-1.5">
              <span className="text-white/70">EMAIL DIRECT</span>
              <a 
                href="mailto:hello@asarr.in" 
                className="text-white hover:text-white/80 transition-colors font-medium lowercase tracking-normal text-xs"
              >
                hello@asarr.in
              </a>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-white/70">STUDIO LOCATION</span>
              <span className="text-white">
                BANGALORE, INDIA
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-white/70">AVAILABILITY</span>
              <span className="text-white/95">
                ACTIVE FOR NEW BUILDS
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

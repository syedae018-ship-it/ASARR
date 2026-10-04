'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { VortexStrandCanvas } from '@/components/ui/VortexStrandCanvas';
import { useCursorStore } from '@/components/ui/CustomCursor';

export function Hero() {
  const setVariant = useCursorStore(state => state.setVariant);

  return (
    <section 
      className="relative w-full min-h-screen flex flex-col items-center justify-start overflow-hidden bg-[#F4DFCE]"
    >
      {/* ============================================================== */}
      {/* 1. ATMOSPHERIC BACKDROP PLATE (Landscape, Mountains, Lake)      */}
      {/* ============================================================== */}
      <div 
        className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-cover bg-[center_top] bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero_bg.jpg')" }}
        aria-hidden="true"
      />

      {/* Layer 2: Subtle Atmospheric Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none z-[2] bg-[radial-gradient(ellipse_85%_65%_at_50%_50%,_transparent_60%,_rgba(65,18,22,0.15)_100%)]" 
        aria-hidden="true"
      />

      {/* ============================================================== */}
      {/* 2. DYNAMIC LIVE ANIMATED VORTEX (Canvas 2D Screen Blend)        */}
      {/* ============================================================== */}
      <VortexStrandCanvas />

      {/* ============================================================== */}
      {/* 3. HERO CONTENT & TYPOGRAPHY                                   */}
      {/* ============================================================== */}
      <div className="relative z-20 flex flex-col items-center text-center justify-center w-full max-w-[1200px] px-5 mt-[315px] max-xl:mt-[clamp(215px,27vh,315px)] max-md:mt-[160px]">
        
        {/* Prominent Editorial Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#FFF0EB]/70 border border-[#5A0A14]/30 backdrop-blur-md mb-5 sm:mb-6 shadow-[0_2px_14px_rgba(90,10,20,0.10)] select-none"
        >
          <span className="w-2 h-2 rounded-full bg-[#751423] shrink-0" />
          <span className="text-[12px] sm:text-[13.5px] font-sans font-bold tracking-[0.14em] uppercase text-[#320B10]">
            WHERE RESULTS MAKE AN IMPACT.
          </span>
        </motion.div>

        {/* Headline Line 1: "Ideas that create" */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center select-none"
        >
          <span className="font-sans font-medium text-[#320B10] text-[clamp(2.5rem,5.2vw,79.5px)] leading-[0.98] tracking-[-0.02em] whitespace-nowrap">
            Ideas that create
          </span>
          <span className="font-script font-normal text-[#550913] text-[clamp(7.5rem,15.5vw,239px)] leading-[0.82] tracking-normal -mt-3 sm:-mt-4 pb-1.5 whitespace-nowrap bg-gradient-to-b from-[#500812] to-[#70131E] bg-clip-text text-transparent">
            Impact
          </span>
        </motion.h1>

        {/* Subtitle Description */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans font-normal text-[clamp(15px,1.3vw,19px)] text-[#320B10]/90 max-w-[585px] leading-[1.45] tracking-[-0.005em] mt-5 mb-7 text-center"
        >
          A creative and tech company crafting brands, digital experiences<br className="hidden sm:inline" /> and custom solutions for a bolder tomorrow.
        </motion.p>

        {/* Action Buttons Row */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-row max-md:flex-col items-center justify-center gap-5 w-full sm:w-auto"
        >
          {/* Primary Filled Pill */}
          <Link 
            href="#contact"
            className="inline-flex items-center justify-center w-[192px] max-md:w-full h-[48px] bg-[#6B0F1A] hover:bg-[#48070F] text-white text-[14px] font-sans font-medium uppercase tracking-[0.08em] rounded-full transition-all duration-200 shadow-[0_4px_14px_rgba(90,10,20,0.22)] hover:shadow-[0_6px_20px_rgba(90,10,20,0.35)] hover:-translate-y-0.5 border border-white/10"
            onMouseEnter={() => setVariant('button')}
            onMouseLeave={() => setVariant('default')}
          >
            LET&apos;S BUILD &rarr;
          </Link>

          {/* Secondary Outlined Pill */}
          <Link 
            href="#work"
            className="inline-flex items-center justify-center gap-2 w-[178px] max-md:w-full h-[48px] bg-[#FFF0EB]/20 hover:bg-[#FFF0EB]/35 backdrop-blur-[6px] border-[1.5px] border-[#5A0A14] text-[#5A0A14] text-[14px] font-sans font-medium uppercase tracking-[0.08em] rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(90,10,20,0.2)]"
            onMouseEnter={() => setVariant('button')}
            onMouseLeave={() => setVariant('default')}
          >
            <span>OUR WORK</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

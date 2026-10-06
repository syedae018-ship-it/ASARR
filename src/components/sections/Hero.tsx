'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCursorStore } from '@/components/ui/CustomCursor';
import { useModalStore } from '@/lib/modalStore';

export function Hero() {
  const setVariant = useCursorStore((state) => state.setVariant);
  const { openProjectModal, openShowreel } = useModalStore();

  const scrollToNext = () => {
    const nextSection = document.getElementById('services') || document.getElementById('what-we-do');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="home"
      className="relative w-full min-h-screen bg-[#11100F] text-[#FAF6F0] overflow-hidden flex flex-col justify-between pt-24 sm:pt-28 pb-12 sm:pb-16 px-6 sm:px-12 lg:px-16 select-none"
    >
      {/* Background Architectural Atmosphere & Warm Sun Beam */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen bg-[radial-gradient(ellipse_80%_60%_at_75%_35%,_rgba(111,20,32,0.35),_transparent_75%)]" 
        aria-hidden="true"
      />
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#821827]/15 blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Main Split Grid Composition */}
      <div className="relative z-10 w-full max-w-[1550px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center my-auto py-4 sm:py-8">
        
        {/* LEFT COLUMN: Editorial Typography & Brand Narrative (Cols 1-6) */}
        <div className="lg:col-span-6 flex flex-col items-start justify-center pr-0 lg:pr-6">
          
          {/* Eyebrow Label */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-4 sm:mb-6"
          >
            <span className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.16em] text-[#C9BFB5]">
              IDEAS THAT LEAVE AN
            </span>
          </motion.div>

          {/* Monumental Brand Headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <h1 className="text-[clamp(3.8rem,9.5vw,7.8rem)] font-sans font-black tracking-[-0.04em] leading-[0.92] text-white flex items-baseline">
              <span>ASARR</span>
              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#6F1420] ml-2 inline-block transform translate-y-[-0.1em]" />
            </h1>

            <p className="font-serif italic text-2xl sm:text-3xl lg:text-[2.2rem] text-[#F5D5DA] font-normal tracking-[-0.01em] mt-3 sm:mt-4 leading-snug">
              Digital experiences that create Enduring Impact.
            </p>
          </motion.div>

          {/* Studio Manifesto Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans font-normal text-sm sm:text-base text-[#D4CCC2] max-w-[500px] leading-[1.65] mt-5 sm:mt-6 mb-8 text-left"
          >
            A creative and tech agency helping brands grow through strategy, content, marketing, websites and apps. We turn ideas into experiences that people remember.
          </motion.p>

          {/* Action Buttons Row */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10 sm:mb-12"
          >
            {/* Primary White Pill Button */}
            <button
              type="button"
              onClick={openProjectModal}
              onMouseEnter={() => setVariant('button')}
              onMouseLeave={() => setVariant('default')}
              className="inline-flex items-center justify-center gap-3 px-7 sm:px-8 h-[48px] bg-white hover:bg-[#FAF6F0] text-[#11100F] text-xs font-sans font-bold uppercase tracking-[0.10em] rounded-full transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_25px_rgba(255,255,255,0.25)] hover:-translate-y-0.5"
            >
              <span>Start a Project</span>
              <span aria-hidden="true" className="text-sm">→</span>
            </button>

            {/* Secondary Glass Pill Button with Play Icon */}
            <button
              type="button"
              onClick={openShowreel}
              onMouseEnter={() => setVariant('button')}
              onMouseLeave={() => setVariant('default')}
              className="inline-flex items-center justify-center gap-3 px-6 sm:px-7 h-[48px] bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white text-xs font-sans font-semibold uppercase tracking-[0.10em] rounded-full transition-all duration-300 hover:-translate-y-0.5"
            >
              <span>Watch Showreel</span>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] pl-0.5">
                ▶
              </span>
            </button>
          </motion.div>

          {/* Understated Editorial Metrics Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.45 }}
            className="flex items-center gap-8 sm:gap-12 pt-6 border-t border-white/10 w-full max-w-[500px]"
          >
            <div>
              <span className="block font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight leading-none">
                50+
              </span>
              <span className="block font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-[#A69E94] mt-1.5">
                PROJECTS
              </span>
            </div>

            <div className="h-8 w-[1px] bg-white/15" aria-hidden="true" />

            <div>
              <span className="block font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight leading-none">
                20+
              </span>
              <span className="block font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-[#A69E94] mt-1.5">
                HAPPY CLIENTS
              </span>
            </div>

            <div className="h-8 w-[1px] bg-white/15" aria-hidden="true" />

            <div>
              <span className="block font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight leading-none">
                3X
              </span>
              <span className="block font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-[#A69E94] mt-1.5">
                AVERAGE GROWTH
              </span>
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN: Cinematic Studio Environment & Interactive Composition (Cols 7-12) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 relative w-full flex items-center justify-center"
        >
          {/* Handwritten Annotation in Top-Right Corner */}
          <div className="absolute -top-10 sm:-top-12 right-2 sm:right-6 z-20 pointer-events-none hidden sm:block text-right">
            <span className="font-script text-[#E8DED3]/85 text-xl sm:text-2xl leading-tight block transform -rotate-3">
              Strategy &middot; Content &middot; Design<br />
              Development &middot; Marketing<br />
              <span className="text-white/90">— All in One Place</span>
            </span>
          </div>

          {/* Main Visual Frame */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)] border border-white/15 group">
            <Image
              src="/images/studio_assets/hero_studio.jpg"
              alt="ASARR High-End Creative Studio Environment"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center filter saturate-[0.98] contrast-[1.04] group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            />

            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(111,20,32,0.2),_transparent_60%)] pointer-events-none" />

            {/* Floating Interactive Badge: "BEHIND THE SCENES" */}
            <button
              type="button"
              onClick={openShowreel}
              onMouseEnter={() => setVariant('button')}
              onMouseLeave={() => setVariant('default')}
              className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 z-20 bg-white/90 hover:bg-white text-[#11100F] px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md border border-white/40 group/badge hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-[#6F1420] text-white flex items-center justify-center text-xs shadow-sm">
                ▶
              </div>
              <div className="text-left">
                <span className="block font-mono text-[9px] tracking-[0.14em] text-[#6E665E] uppercase font-bold">
                  STUDIO ARCHIVE
                </span>
                <span className="block font-sans font-bold text-xs uppercase tracking-wider text-[#11100F]">
                  BEHIND THE SCENES
                </span>
              </div>
            </button>

            {/* Floating Bottom Left Book Spine Tag */}
            <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 z-20 bg-[#11100F]/85 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-[10px] font-mono text-[#D4CCC2] tracking-wider uppercase hidden sm:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6F1420]" />
              <span>BRAND &middot; CONTENT &middot; TECH &middot; GROWTH</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Bottom Scroll Indicator Pill */}
      <div className="relative z-10 w-full max-w-[1550px] mx-auto flex items-center justify-between pt-6 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={scrollToNext}
          className="flex items-center gap-3 text-[11px] font-mono tracking-[0.14em] text-[#C9BFB5] hover:text-white uppercase transition-colors group cursor-pointer"
        >
          <span className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1 group-hover:border-white transition-colors">
            <span className="w-1 h-2 rounded-full bg-[#6F1420] animate-bounce" />
          </span>
          <span>SCROLL TO EXPLORE</span>
        </button>

        <span className="font-mono text-[11px] tracking-[0.12em] text-[#7A726C] uppercase hidden sm:inline">
          BANGALORE / GLOBAL STUDIO
        </span>
      </div>
    </section>
  );
}

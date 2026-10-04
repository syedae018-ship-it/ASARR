'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCursorStore } from '@/components/ui/CustomCursor';

export function PhilosophySection() {
  const setVariant = useCursorStore(state => state.setVariant);
  const containerRef = useRef<HTMLElement>(null);

  // Subtle mouse parallax (Desktop: 5–8px displacement max)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 ... 1
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const springConfig = { damping: 35, stiffness: 100, mass: 0.7 };
  const mouseX = useSpring(mousePos.x, springConfig);
  const mouseY = useSpring(mousePos.y, springConfig);

  const sculptureDisplacementX = useTransform(mouseX, [-1, 1], [-8, 8]);
  const sculptureDisplacementY = useTransform(mouseY, [-1, 1], [-6, 6]);

  const scrollToNext = () => {
    const nextSection = document.getElementById('services') || document.querySelector('section:nth-of-type(3)');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="philosophy"
      ref={containerRef}
      className="relative w-full flex flex-col justify-between overflow-hidden bg-[#11100E] text-[#F4F1EC] px-6 sm:px-12 lg:px-20 xl:px-28 py-14 sm:py-18 lg:py-20 select-none min-h-[660px] lg:min-h-[740px]"
      aria-label="ASAR Philosophy"
    >
      {/* ============================================================== */}
      {/* 1. ART-DIRECTED RETINA BACKGROUND PLATE (Desktop / Large View) */}
      {/* ============================================================== */}
      <motion.div 
        style={{ 
          x: sculptureDisplacementX, 
          y: sculptureDisplacementY,
        }}
        className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-right lg:bg-[right_center]"
          style={{ 
            backgroundImage: "url('/images/hero_plate_retina.jpg')",
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Ambient environmental dark vignette on left & bottom for seamless integration */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#11100E] via-[#11100E]/70 to-transparent w-full lg:w-[42%] pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#11100E] via-[#11100E]/60 to-transparent pointer-events-none" />
      </motion.div>

      {/* ============================================================== */}
      {/* 2. FILM GRAIN TEXTURE OVERLAY                                  */}
      {/* ============================================================== */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />

      {/* ============================================================== */}
      {/* 3. TOP BAR: "OUR PHILOSOPHY" Editorial Eyebrow                 */}
      {/* ============================================================== */}
      <div className="relative z-20 flex items-center justify-between w-full max-w-[1554px] mx-auto pb-4">
        <div className="flex items-center gap-4 flex-1">
          <span className="font-sans font-semibold text-[11px] sm:text-[12px] uppercase tracking-[0.14em] text-[#FAF7F2]">
            OUR PHILOSOPHY
          </span>
          <div className="h-[1px] bg-white/10 flex-1 max-w-[320px]" aria-hidden="true" />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. MAIN EDITORIAL CONTENT: HEADLINE + COPY + CTA BUTTON        */}
      {/* ============================================================== */}
      <div className="relative z-20 w-full max-w-[1554px] mx-auto flex-1 flex flex-col justify-center my-auto py-6 sm:py-8 lg:py-6">
        <div className="flex flex-col items-start max-w-[680px] xl:max-w-[760px]">
          
          {/* Main Headline */}
          <h2 className="flex flex-col items-start text-left tracking-tight select-none w-full">
            {/* Line 1: WE BUILD */}
            <span className="font-sans font-[800] text-[clamp(2.1rem,6.2vw,5.5rem)] text-[#F4F1EC] leading-[0.98] tracking-[-0.02em] uppercase">
              WE BUILD
            </span>
            
            {/* Line 2: DIGITAL EXPERIENCES */}
            <span className="font-sans font-[800] text-[clamp(1.75rem,5.8vw,5.5rem)] text-[#F4F1EC] leading-[0.98] tracking-[-0.02em] uppercase whitespace-normal sm:whitespace-nowrap">
              DIGITAL EXPERIENCES
            </span>
            
            {/* Line 3: THAT PEOPLE */}
            <span className="font-sans font-[800] text-[clamp(2.1rem,6.2vw,5.5rem)] text-[#F4F1EC] leading-[0.98] tracking-[-0.02em] uppercase">
              THAT PEOPLE
            </span>

            {/* Line 4: Remember. */}
            <span className="font-script font-normal text-[clamp(3.6rem,10.2vw,8.8rem)] leading-[0.88] tracking-[0.01em] text-[#821526] -mt-2 sm:-mt-3.5 lg:-mt-4 pl-1 select-none drop-shadow-[0_2px_16px_rgba(130,21,38,0.55)] [-webkit-text-stroke:0.6px_#821526]">
              Remember.
            </span>
          </h2>          {/* Supporting Copy */}
          <p className="font-sans font-normal text-[15px] sm:text-[17px] text-[#C5BFB6] max-w-[490px] leading-[1.65] tracking-[-0.005em] mt-5 sm:mt-7 mb-6 sm:mb-8 text-left">
            From ideas to unforgettable digital experiences —<br className="hidden sm:inline" />
            we design, create and build brands that leave a lasting impact.
          </p>

          {/* Tactile Capsule CTA Button */}
          <div>
            <Link
              href="#contact"
              onMouseEnter={() => setVariant('button')}
              onMouseLeave={() => setVariant('default')}
              className="group relative inline-flex items-center gap-3.5 sm:gap-4 pl-5 sm:pl-6 pr-2 sm:pr-2.5 py-2 sm:py-2.5 rounded-full bg-[#151313] hover:bg-[#1A1616] border border-[#751423]/80 hover:border-[#9E1B30] text-[#F4F1EC] text-[13.5px] sm:text-[14.5px] font-sans font-medium tracking-[0.03em] transition-all duration-300 shadow-[0_0_28px_rgba(117,20,35,0.4)] hover:shadow-[0_0_36px_rgba(117,20,35,0.6)] hover:translate-x-1"
            >
              <span>Let&apos;s Create Together</span>
              
              {/* Arrow enclosed in circular burgundy medallion */}
              <span className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-[#751423] group-hover:bg-[#8D182B] text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 shadow-sm">
                <svg 
                  className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white transform transition-transform duration-300" 
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
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. BOTTOM ZONE: STATISTICS (Left) + SCROLL INDICATOR (Right)   */}
      {/* ============================================================== */}
      <div className="relative z-20 flex flex-row items-end justify-between w-full max-w-[1554px] mx-auto pt-2 sm:pt-4">
        {/* Three Editorial Statistics */}
        <div className="flex flex-nowrap items-center gap-4 sm:gap-8 lg:gap-10">
          {/* Stat 1 */}
          <div className="flex flex-col items-start">
            <span className="font-sans font-light text-[22px] sm:text-[32px] lg:text-[36px] text-[#F4F1EC] leading-none tracking-tight">
              100+
            </span>
            <span className="font-sans font-medium text-[9px] sm:text-[10.5px] uppercase tracking-[0.12em] text-[#A8A39C] mt-1.5 sm:mt-2">
              BRANDS BUILT
            </span>
          </div>

          {/* Vertical Divider */}
          <div className="h-7 sm:h-9 w-[1px] bg-white/[0.12]" aria-hidden="true" />

          {/* Stat 2 */}
          <div className="flex flex-col items-start">
            <span className="font-sans font-light text-[22px] sm:text-[32px] lg:text-[36px] text-[#F4F1EC] leading-none tracking-tight">
              5M+
            </span>
            <span className="font-sans font-medium text-[9px] sm:text-[10.5px] uppercase tracking-[0.12em] text-[#A8A39C] mt-1.5 sm:mt-2">
              PEOPLE REACHED
            </span>
          </div>

          {/* Vertical Divider */}
          <div className="h-7 sm:h-9 w-[1px] bg-white/[0.12]" aria-hidden="true" />

          {/* Stat 3 */}
          <div className="flex flex-col items-start">
            <span className="font-sans font-light text-[22px] sm:text-[32px] lg:text-[36px] text-[#F4F1EC] leading-none tracking-tight">
              4+
            </span>
            <span className="font-sans font-medium text-[9px] sm:text-[10.5px] uppercase tracking-[0.12em] text-[#A8A39C] mt-1.5 sm:mt-2">
              YEARS OF IMPACT
            </span>
          </div>
        </div>

        {/* Bottom-Right: Circular Scroll Indicator */}
        <button
          type="button"
          onClick={scrollToNext}
          aria-label="Scroll down to services section"
          onMouseEnter={() => setVariant('button')}
          onMouseLeave={() => setVariant('default')}
          className="group hidden sm:flex items-center justify-center w-11 h-11 rounded-full border border-white/20 hover:border-[#751423] bg-transparent hover:bg-[#161414] text-[#FAF7F2] transition-all duration-300 shadow-none hover:shadow-[0_0_18px_rgba(117,20,35,0.4)] cursor-pointer"
        >
          <svg 
            className="w-4 h-4 transform group-hover:translate-y-0.5 transition-transform duration-300" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 6. MOBILE-ONLY ARTWORK PRESENTATION (Order: Text -> Stats -> Art) */}
      {/* ============================================================== */}
      <div className="block lg:hidden relative w-full mt-8 mb-2 pointer-events-none overflow-hidden rounded-2xl border border-white/[0.06] bg-[#141212]/50">
        <div className="relative w-full h-[280px] sm:h-[360px]">
          <Image
            src="/images/hero_plate_retina.jpg"
            alt="Classical Greco-Roman bust sculpture"
            fill
            className="object-cover object-right"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11100E] via-transparent to-[#11100E]/70" />
        </div>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';

export function TheStudio() {
  return (
    <section 
      id="studio" 
      className="w-full bg-[#EFE9DF] text-[#161616] relative overflow-hidden select-none border-t border-black/10"
      style={{
        ['--cream-bg' as string]: '#EFE9DF',
        ['--maroon' as string]: '#68131F',
        ['--dark-charcoal' as string]: '#161616',
      }}
    >
      <div className="w-full min-h-[600px] lg:min-h-[660px] flex flex-col md:flex-row relative">
        
        {/* ========================================================= */}
        {/* LEFT MAROON EDITORIAL SIDEBAR                             */}
        {/* ========================================================= */}
        <div className="w-full md:w-[130px] lg:w-[150px] xl:w-[170px] bg-[#68131F] text-[#FAF6EE] shrink-0 relative flex flex-col justify-between p-6 sm:p-7 z-20 overflow-hidden border-r border-[#4E0E17]">
          {/* Subtle luxury ripple texture in bottom half */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen bg-bottom bg-no-repeat bg-contain"
            style={{
              backgroundImage: "url('/images/studio/maroon-texture.png')",
              backgroundSize: '100% auto',
            }}
          />

          {/* Top Identity Block */}
          <div className="relative z-20 space-y-4 pt-2">
            <div>
              <span className="text-[11px] font-sans font-semibold tracking-[0.14em] uppercase text-[#FAF6EE] block leading-tight">
                STUDIO
              </span>
              <span className="text-[11px] font-sans font-semibold tracking-[0.14em] uppercase text-[#FAF6EE] block leading-tight">
                IDENTITY
              </span>
              <div className="w-6 h-[1.5px] bg-[#FAF6EE]/60 mt-3" />
            </div>
          </div>

          {/* Bottom Sidebar Note */}
          <div className="relative z-20 text-[10px] font-sans font-semibold tracking-[0.14em] uppercase text-[#FAF6EE]/70 pt-8 md:pt-0">
            ASARR
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER EDITORIAL CANVAS (Cream Background)               */}
        {/* ========================================================= */}
        <div className="flex-1 bg-[#EFE9DF] text-[#161616] flex flex-col justify-between relative z-10 min-w-0">
          
          {/* TOP HEADER SUB-NAV BAR */}
          <div className="w-full border-b border-black/10 px-6 sm:px-10 lg:px-12 py-5 flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4 flex-grow">
              <span className="text-[11px] sm:text-[12px] font-sans font-semibold tracking-[0.14em] uppercase text-[#161616]">
                THE STUDIO
              </span>
              <div className="h-[1px] bg-black/15 flex-1 max-w-[320px]" />
            </div>
          </div>

          {/* CENTER STATEMENT & EDITORIAL BODY */}
          <div className="px-6 sm:px-10 lg:px-12 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center relative z-10 flex-grow">
            
            {/* Monumental Headline (Cols 1-7) */}
            <div className="lg:col-span-7 xl:col-span-7 pl-0 lg:pl-4">
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[4.5rem] xl:text-[5.5rem] 2xl:text-[6.2rem] font-condensed font-extrabold uppercase tracking-tight leading-[1.02] text-[#161616]">
                <span className="block">
                  WE THINK.
                </span>
                <span className="block mt-1">
                  WE CREATE.
                </span>
                <span className="block mt-1">
                  WE{' '}
                  <span className="font-serif italic font-normal tracking-normal text-[#701423] inline-block ml-1">
                    BUILD.
                  </span>
                </span>
              </h2>
            </div>

            {/* Editorial Description (Cols 8-12) */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center pr-2 lg:pr-6">
              {/* Main Statement */}
              <p className="text-base sm:text-lg lg:text-[20px] font-sans text-[#1D1B19] leading-[1.45] font-normal max-w-md">
                A creative and technology studio bringing strategy, media, design and software together under one roof.
              </p>

              {/* Crimson Accent Divider */}
              <div className="w-12 h-[2px] bg-[#701423] my-5 lg:my-6" />

              {/* Italic Philosophy Note */}
              <p className="text-sm sm:text-base font-serif italic text-[#5C564E] leading-[1.6] max-w-sm">
                Founded on the belief that digital products and brand identities should be architected with uncompromising craft, speed, and lasting cultural impact.
              </p>
            </div>

          </div>

          {/* BOTTOM THREE-COLUMN METADATA BAR */}
          <div className="w-full border-t border-black/15 px-6 sm:px-10 lg:px-12 py-6 sm:py-7 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 items-center">
              {/* Column 1 */}
              <div className="flex flex-col gap-1 sm:border-r border-black/15 sm:pr-6">
                <span className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase text-[#736D64]">
                  BASED IN
                </span>
                <span className="text-lg sm:text-xl font-condensed font-bold tracking-wide uppercase text-[#161616]">
                  BANGALORE, INDIA
                </span>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-1 sm:border-r border-black/15 sm:px-6">
                <span className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase text-[#736D64]">
                  FOCUS
                </span>
                <span className="text-lg sm:text-xl font-condensed font-bold tracking-wide uppercase text-[#161616]">
                  CREATIVE / MEDIA / TECHNOLOGY
                </span>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col gap-1 sm:pl-6">
                <span className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase text-[#736D64]">
                  EST.
                </span>
                <span className="text-lg sm:text-xl font-condensed font-bold tracking-wide uppercase text-[#161616]">
                  2026
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT ARCHITECTURAL PHOTOGRAPH COLUMN (20-22% width)      */}
        {/* ========================================================= */}
        <div className="w-full md:w-[220px] lg:w-[270px] xl:w-[320px] 2xl:w-[360px] shrink-0 hidden md:block relative overflow-hidden bg-[#D8CFBF] border-l border-black/10">
          <Image 
            src="/images/studio/studio-arch-crisp.png" 
            alt="Studio Architectural Perspective"
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover object-center"
          />
        </div>

      </div>
    </section>
  );
}

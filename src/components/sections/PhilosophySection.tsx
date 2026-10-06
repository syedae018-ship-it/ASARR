'use client';

import Image from 'next/image';
import { useCursorStore } from '@/components/ui/CustomCursor';

interface Principle {
  number: string;
  title: string;
  description: string;
  icon: string;
}

const principles: Principle[] = [
  {
    number: '01',
    title: 'Strategy First',
    description: 'Data-driven decisions for real growth.',
    icon: 'target',
  },
  {
    number: '02',
    title: 'Creative + Technical',
    description: 'A perfect blend of creativity & technology.',
    icon: 'bolt',
  },
  {
    number: '03',
    title: 'End-to-End Solutions',
    description: 'From concept to scale, all in one place.',
    icon: 'users',
  },
  {
    number: '04',
    title: 'Results Driven',
    description: 'Focused on long-term impact, not just clicks.',
    icon: 'trending',
  },
];

export function PhilosophySection() {
  const setVariant = useCursorStore((state) => state.setVariant);

  const renderIcon = (type: string) => {
    switch (type) {
      case 'target':
        return (
          <svg className="w-5 h-5 text-[#F5D5DA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        );
      case 'bolt':
        return (
          <svg className="w-5 h-5 text-[#F5D5DA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        );
      case 'users':
        return (
          <svg className="w-5 h-5 text-[#F5D5DA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'trending':
      default:
        return (
          <svg className="w-5 h-5 text-[#F5D5DA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        );
    }
  };

  return (
    <section 
      id="philosophy"
      className="relative w-full bg-[#6F1420] text-[#FAF6F0] overflow-hidden select-none"
    >
      {/* Split Grid Section */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-[580px] lg:min-h-[640px] items-stretch">
        
        {/* LEFT HALF: Brutalist Concrete Staircase with Architectural Typography (Cols 1-6) */}
        <div className="lg:col-span-6 relative w-full h-[400px] sm:h-[480px] lg:h-auto min-h-[400px] overflow-hidden group">
          <Image
            src="/images/studio_assets/philosophy_editorial.jpg"
            alt="Multidisciplinary creative studio atelier — Craftsmanship, Strategy and Ambition"
            fill
            unoptimized
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center filter saturate-[0.96] contrast-[1.04] group-hover:scale-104 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />

          {/* Architectural Overlay & Text Enhancement */}
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />
          
          {/* Subtle Right Edge Fade into Maroon for Seamless Curve */}
          <div className="hidden lg:block absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[#6F1420] pointer-events-none" />
        </div>

        {/* RIGHT HALF: Deep Maroon Background + Editorial Manifesto + 4 Principles (Cols 7-12) */}
        <div className="lg:col-span-6 bg-[#6F1420] px-6 sm:px-12 lg:px-16 py-16 sm:py-20 lg:py-24 flex flex-col justify-center relative">
          
          {/* Floating Subtle Star Sparkle */}
          <div className="absolute top-10 right-10 text-white/30 text-2xl pointer-events-none hidden sm:block">
            ✦
          </div>

          <div className="w-full max-w-xl">
            
            {/* Eyebrow Label */}
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5D5DA]" />
              <span className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.16em] text-[#F5D5DA] font-semibold">
                OUR PHILOSOPHY
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-serif italic text-4xl sm:text-5xl lg:text-[3.8rem] text-white font-normal leading-[1.02] tracking-[-0.02em] mb-6">
              We Create Opportunities.
            </h2>

            {/* Manifesto Paragraph */}
            <p className="font-sans text-sm sm:text-base text-[#F5D5DA]/90 leading-[1.7] mb-10 max-w-lg">
              We don&apos;t just make content or build websites. We build digital ecosystems that create real opportunities for brands, businesses and people.
            </p>

            {/* 4 Principles in a Clean 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-8 border-t border-white/15">
              {principles.map((p) => (
                <div 
                  key={p.number}
                  className="flex flex-col items-start"
                  onMouseEnter={() => setVariant('button')}
                  onMouseLeave={() => setVariant('default')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center">
                      {renderIcon(p.icon)}
                    </div>
                    <span className="font-sans font-bold text-sm sm:text-base text-white tracking-tight uppercase">
                      {p.title}
                    </span>
                  </div>

                  <p className="font-sans text-xs text-[#F5D5DA]/80 leading-relaxed pl-11">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import { useCursorStore } from '@/components/ui/CustomCursor';

interface Stage {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  alt: string;
}

const stages: Stage[] = [
  {
    number: '01',
    title: 'DISCOVER',
    subtitle: 'Research & Strategic Positioning',
    description: 'We immerse ourselves in your market landscape, uncovering core differentiators, target user behaviors, and strategic opportunities.',
    image: '/images/hww/card_discover.png',
    alt: 'Discover - Research and Strategy',
  },
  {
    number: '02',
    title: 'CREATE',
    subtitle: 'Art Direction & Brand Systems',
    description: 'Crafting distinctive brand languages, intuitive user interfaces, and elevated visual systems engineered to leave an imprint.',
    image: '/images/hww/card_create.png',
    alt: 'Create - Art Direction and Typography',
  },
  {
    number: '03',
    title: 'BUILD',
    subtitle: 'Full-Stack Digital Engineering',
    description: 'Transforming designs into performant web applications, custom software platforms, and scalable digital architectures.',
    image: '/images/hww/card_build.png',
    alt: 'Build - Code and Engineering',
  },
  {
    number: '04',
    title: 'GROW',
    subtitle: 'Content, Media & Optimization',
    description: 'Deploying data-backed media campaigns, continuous telemetry, and performance optimizations that accelerate measurable traction.',
    image: '/images/hww/card_grow.png',
    alt: 'Grow - Measurable Impact and Scale',
  },
];

export function HowWeWork() {
  const setVariant = useCursorStore((state) => state.setVariant);

  return (
    <section 
      id="how-we-work" 
      className="py-16 sm:py-20 lg:py-24 bg-[#F5F2EB] text-[#1A1616] relative border-t border-black/10 overflow-hidden select-none"
    >
      <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 relative">
        
        {/* Top Editorial Eyebrow */}
        <div className="flex items-center gap-4 pb-6">
          <span className="text-[11px] sm:text-[12px] font-mono uppercase tracking-[0.16em] text-[#1A1616] shrink-0">
            03 / METHODOLOGY
          </span>
          <div className="h-[1px] bg-black/15 flex-1 max-w-[280px]" />
        </div>

        {/* Section Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <h2 className="leading-[1.0] tracking-tight">
              <span className="block text-4xl sm:text-5xl lg:text-[3.8rem] font-sans font-bold uppercase text-[#1A1616]">
                IDEAS INTO
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-[3.8rem] font-serif italic font-normal text-[#751423] mt-1">
                Measurable Impact.
              </span>
            </h2>
          </div>

          <p className="text-sm sm:text-base font-sans text-[#544D48] leading-relaxed max-w-md md:text-right">
            A cohesive four-stage framework uniting strategy, art direction, and software engineering under one roof.
          </p>
        </div>

        {/* Clean 4-Column Architectural Process Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 w-full">
          {stages.map((stage) => (
            <div
              key={stage.number}
              onMouseEnter={() => setVariant('button')}
              onMouseLeave={() => setVariant('default')}
              className="group flex flex-col justify-between bg-white/60 hover:bg-white border border-black/[0.08] hover:border-[#751423]/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)]"
            >
              <div>
                {/* Header with Stage Number & Hairline */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/[0.08]">
                  <span className="text-xs font-mono font-bold tracking-[0.14em] uppercase text-[#751423]">
                    PHASE {stage.number}
                  </span>
                  <span className="text-xs font-mono tracking-[0.10em] text-[#8C847C] uppercase">
                    0{stages.length}
                  </span>
                </div>

                {/* Stage Title & Subtitle */}
                <h3 className="text-xl sm:text-2xl font-sans font-bold uppercase tracking-tight text-[#1A1616] group-hover:text-[#751423] transition-colors">
                  {stage.title}
                </h3>
                <p className="text-xs font-mono tracking-[0.06em] text-[#7A726C] mt-1 mb-4 uppercase">
                  {stage.subtitle}
                </p>

                {/* Description */}
                <p className="text-xs sm:text-sm font-sans text-[#544D48] leading-relaxed mb-6">
                  {stage.description}
                </p>
              </div>

              {/* Visual Preview Card */}
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black/5 border border-black/[0.06]">
                <Image
                  src={stage.image}
                  alt={stage.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center filter saturate-[0.95] group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

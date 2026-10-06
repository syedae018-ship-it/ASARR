'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCursorStore } from '@/components/ui/CustomCursor';

interface ProjectFolderData {
  id: string;
  number: string;
  name: string;
  discipline: string;
  year: string;
  image: string;
  alt: string;
}

const folderProjects: ProjectFolderData[] = [
  {
    id: 'p1',
    number: '01',
    name: 'SURAT KHAZANA',
    discipline: 'BRAND / DIGITAL / CREATIVE',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000&auto=format&fit=crop',
    alt: 'Surat Khazana Luxury Craftsmanship Archive',
  },
  {
    id: 'p2',
    number: '02',
    name: 'AVIORA',
    discipline: 'BRAND / CREATIVE / CONTENT',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
    alt: 'Aviora Fashion Editorial Brand Archive',
  },
  {
    id: 'p3',
    number: '03',
    name: 'PURE & HERBS',
    discipline: 'BRAND / VISUAL / DIGITAL',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop',
    alt: 'Pure & Herbs Botanical System',
  },
  {
    id: 'p4',
    number: '04',
    name: 'TRIPMASTER',
    discipline: 'MEDIA / CONTENT / DIGITAL',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
    alt: 'Tripmaster Media & Travel Production',
  },
  {
    id: 'p5',
    number: '05',
    name: 'GROITUP',
    discipline: 'GROWTH / SOCIAL / MARKETING',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
    alt: 'Groitup Growth Ecosystem',
  },
  {
    id: 'p6',
    number: '06',
    name: 'ARTISTRY',
    discipline: 'CREATIVE DIRECTION / DESIGN',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop',
    alt: 'Artistry Creative Direction Portfolio',
  },
];

export function SelectedWork() {
  const setVariant = useCursorStore((state) => state.setVariant);

  return (
    <section 
      id="work" 
      className="py-14 sm:py-16 lg:py-20 bg-[#F4F1EA] text-[#1C1A1A] relative border-t border-black/10 overflow-hidden"
    >
      <div className="w-full max-w-[1540px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 relative">
        
        {/* ========================================================= */}
        {/* 1. EDITORIAL EYEBROW LABEL                                */}
        {/* ========================================================= */}
        <div className="flex items-center gap-4 pb-4">
          <span className="text-[11px] sm:text-[12px] font-sans font-semibold tracking-[0.14em] uppercase text-[#1C1A1A] shrink-0">
            04 / SELECTED WORK
          </span>
          <div className="h-[1px] bg-black/15 flex-1 max-w-[280px]" />
        </div>

        {/* ========================================================= */}
        {/* 2. COMPACT FULL-WIDTH HEADING & SHORT DESCRIPTION         */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="leading-[0.98] tracking-tight">
              <span className="block text-4xl sm:text-5xl lg:text-[3.8rem] font-condensed font-extrabold uppercase text-[#111]">
                SELECTED
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-[3.8rem] font-serif italic font-normal text-[#751423] mt-0.5">
                WORK.
              </span>
            </h2>
          </div>

          <p className="text-sm sm:text-base font-sans text-black/75 leading-relaxed max-w-md md:text-right lg:mb-1">
            An index of client brands, digital systems, and creative productions we’ve partnered with.
          </p>
        </div>

        {/* ========================================================= */}
        {/* 3. REFINED EDITORIAL ARCHIVE GRID                         */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
          {folderProjects.map((project) => {
            return (
              <div
                key={project.id}
                onMouseEnter={() => setVariant('button')}
                onMouseLeave={() => setVariant('default')}
                className="group cursor-pointer select-none flex flex-col bg-white/60 hover:bg-white border border-black/[0.08] hover:border-[#751423]/40 rounded-2xl p-4 sm:p-5 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)]"
              >
                {/* Image Container with subtle zoom */}
                <div className="relative w-full h-52 sm:h-60 rounded-xl overflow-hidden bg-black/5 mb-4">
                  <Image
                    src={project.image}
                    alt={project.alt}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center filter saturate-[0.95] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1A1616]/75 backdrop-blur-md text-[10px] font-mono tracking-[0.10em] text-white uppercase">
                    {project.number}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-md text-[10px] font-mono tracking-[0.08em] text-[#1A1616] uppercase">
                    {project.year}
                  </div>
                </div>

                {/* Project Details */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div>
                    <h3 className="text-lg sm:text-xl font-sans font-bold tracking-tight uppercase leading-snug text-[#1A1616] group-hover:text-[#751423] transition-colors duration-200">
                      {project.name}
                    </h3>
                    <p className="text-[11px] font-mono tracking-[0.10em] uppercase text-[#736E67] mt-1.5">
                      {project.discipline}
                    </p>
                  </div>

                  {/* Minimal Arrow Disc */}
                  <div className="w-8 h-8 shrink-0 rounded-full border border-black/15 group-hover:border-[#751423] group-hover:bg-[#751423] group-hover:text-white flex items-center justify-center transition-all duration-300 text-xs">
                    <span className="transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* 4. COMPACT BOTTOM ACTION BAR                              */}
        {/* ========================================================= */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="#contact"
            className="inline-flex items-center gap-3 group"
            onMouseEnter={() => setVariant('button')}
            onMouseLeave={() => setVariant('default')}
          >
            <div className="w-8 h-8 rounded-full bg-[#751423] text-white flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-[#5A0E1A]">
              <span className="text-sm transform transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </div>
            <span className="text-xs font-sans font-bold tracking-[0.10em] uppercase text-[#1C1A1A] group-hover:text-[#751423] transition-colors">
              START A PROJECT WITH ASARR
            </span>
          </Link>

          <span className="text-[11px] font-mono tracking-[0.08em] uppercase text-[#736E67]">
            INDEX 01 — 06 / ALL SYSTEMS DEPLOYED
          </span>
        </div>

      </div>
    </section>
  );
}

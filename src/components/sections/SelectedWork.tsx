'use client';

import { useState } from 'react';
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
  const [featuredId, setFeaturedId] = useState<string>('p1');
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
        {/* 3. EXACT 2 ROWS × 3 COLUMNS PHYSICAL ARCHIVE GRID         */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 w-full">
          {folderProjects.map((project) => {
            const isFeatured = featuredId === project.id;

            return (
              <div
                key={project.id}
                onMouseEnter={() => setVariant('button')}
                onMouseLeave={() => setVariant('default')}
                onClick={() => setFeaturedId(project.id)}
                className="group cursor-pointer select-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 flex flex-col"
              >
                {/* 3.1 PHYSICAL FOLDER TAB HEADER */}
                <div className="relative w-full h-7 overflow-hidden pointer-events-none -mb-[1px]">
                  <svg 
                    className="w-full h-full block" 
                    viewBox="0 0 340 28" 
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0,28 L 0,7 Q 0,0 8,0 L 110,0 Q 118,0 126,10 L 136,28 L 340,28"
                      fill={isFeatured ? '#751423' : '#E8E2D5'}
                      className="transition-colors duration-300"
                    />
                  </svg>
                  {/* Tab File Meta */}
                  <div className="absolute top-1 left-3 flex items-center gap-1.5 z-10">
                    <span className={`text-[10px] font-mono font-bold tracking-[0.10em] uppercase transition-colors duration-300 ${
                      isFeatured ? 'text-white/90' : 'text-[#5C564E]'
                    }`}>
                      {project.number}
                    </span>
                    <span className={`text-[9px] font-mono tracking-[0.08em] uppercase transition-colors duration-300 ${
                      isFeatured ? 'text-white/60' : 'text-[#8A847C]'
                    }`}>
                      / ARCHIVE
                    </span>
                  </div>
                </div>

                {/* 3.2 FOLDER BODY PANEL */}
                <div className={`p-4 sm:p-5 rounded-b-xl border-b border-l border-r flex flex-col justify-between flex-grow transition-all duration-300 ${
                  isFeatured
                    ? 'bg-[#751423] text-white border-[#751423] shadow-[0_12px_28px_rgba(117,20,35,0.22)]'
                    : 'bg-[#E8E2D5] text-[#1C1A1A] border-black/10 shadow-[0_4px_16px_rgba(0,0,0,0.04)] group-hover:border-[#751423]/50 group-hover:shadow-[0_8px_24px_rgba(117,20,35,0.12)]'
                }`}>
                  
                  {/* Top Image Preview Area */}
                  <div className="relative w-full h-40 sm:h-44 md:h-48 lg:h-40 xl:h-44 rounded-lg overflow-hidden bg-black/5">
                    <Image
                      src={project.image}
                      alt={project.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center filter saturate-[0.92] contrast-[1.03] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none" />
                  </div>

                  {/* Client / Project Name & Minimal Arrow Button */}
                  <div className="pt-3.5 flex items-start justify-between gap-3">
                    <h3 className={`text-base sm:text-lg font-sans font-bold tracking-tight uppercase leading-snug transition-colors duration-200 ${
                      isFeatured ? 'text-white' : 'text-[#161616] group-hover:text-[#751423]'
                    }`}>
                      {project.name}
                    </h3>

                    {/* Minimal Circular Arrow Button */}
                    <div className={`w-7 h-7 shrink-0 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      isFeatured
                        ? 'border-white/30 text-white group-hover:bg-white group-hover:text-[#751423]'
                        : 'border-black/15 text-[#1C1A1A] group-hover:border-[#751423] group-hover:text-[#751423] group-hover:bg-[#751423]/5'
                    }`}>
                      <span className="text-xs font-sans transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        ↗
                      </span>
                    </div>
                  </div>

                  {/* Discipline Metadata & Year */}
                  <div className={`flex items-center justify-between text-[9.5px] sm:text-[10px] font-mono tracking-[0.10em] uppercase pt-2.5 mt-2.5 border-t transition-colors duration-300 ${
                    isFeatured
                      ? 'border-white/15 text-white/70'
                      : 'border-black/10 text-[#736E67]'
                  }`}>
                    <span className="truncate pr-2">{project.discipline}</span>
                    <span className="shrink-0">{project.year}</span>
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

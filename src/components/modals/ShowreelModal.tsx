'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useModalStore } from '@/lib/modalStore';
import { useCursorStore } from '@/components/ui/CustomCursor';
import Image from 'next/image';

export function ShowreelModal() {
  const { isShowreelOpen, closeShowreel } = useModalStore();
  const setVariant = useCursorStore((state) => state.setVariant);

  return (
    <AnimatePresence>
      {isShowreelOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeShowreel}
            className="fixed inset-0 bg-[#11100F]/90 backdrop-blur-xl"
          />

          {/* Reel Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-4xl bg-[#1A1817] text-[#FAF6F0] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#11100F]/60">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#6F1420] animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-white/80">
                  ASARR — 2026 STUDIO SHOWREEL
                </span>
              </div>
              <button
                type="button"
                onClick={closeShowreel}
                onMouseEnter={() => setVariant('button')}
                onMouseLeave={() => setVariant('default')}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#6F1420] text-white flex items-center justify-center transition-colors text-xs"
                aria-label="Close Showreel"
              >
                ✕
              </button>
            </div>

            {/* Video Player Display */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              <Image
                src="/images/studio_assets/hero_studio.jpg"
                alt="ASARR Studio Cinematography Showreel"
                fill
                className="object-cover opacity-85 filter contrast-105"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Center Play Graphic & Reel Info */}
              <div className="relative z-10 flex flex-col items-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-[#6F1420]/90 text-white flex items-center justify-center text-3xl shadow-xl hover:scale-105 transition-transform cursor-pointer border border-white/20">
                  ▶
                </div>
                <h4 className="font-serif italic text-2xl sm:text-3xl text-white mt-4">
                  Ideas That Leave An ASARR
                </h4>
                <p className="font-sans text-xs text-white/70 mt-1 max-w-md">
                  A synthesis of brand films, high-performance web systems, product photography, and digital campaigns crafted across 2024–2026.
                </p>
              </div>

              {/* Bottom Playback Bar */}
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[11px] font-mono text-white/70">
                <div className="flex items-center gap-3">
                  <span>01:42</span>
                  <div className="w-48 sm:w-80 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-[#6F1420]" />
                  </div>
                  <span>03:15</span>
                </div>
                <span>4K CINEMA MASTER</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

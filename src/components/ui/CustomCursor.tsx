'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { create } from 'zustand';

interface CursorState {
  text: string;
  variant: 'default' | 'project' | 'button';
  setText: (text: string) => void;
  setVariant: (variant: 'default' | 'project' | 'button') => void;
}

export const useCursorStore = create<CursorState>((set) => ({
  text: '',
  variant: 'default',
  setText: (text) => set({ text }),
  setVariant: (variant) => set({ variant }),
}));

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const { text, variant } = useCursorStore();

  useEffect(() => {
    // Only enable on desktop
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  if (!isVisible) return null;

  const variants = {
    default: {
      x: mousePosition.x - 6,
      y: mousePosition.y - 6,
      width: 12,
      height: 12,
      backgroundColor: 'rgba(117, 20, 35, 0.4)',
      border: 'none',
      mixBlendMode: 'normal' as const,
    },
    project: {
      x: mousePosition.x - 28,
      y: mousePosition.y - 28,
      width: 56,
      height: 56,
      backgroundColor: 'rgba(117, 20, 35, 0.9)',
      border: 'none',
      mixBlendMode: 'normal' as const,
    },
    button: {
      x: mousePosition.x - 18,
      y: mousePosition.y - 18,
      width: 36,
      height: 36,
      backgroundColor: 'transparent',
      border: '1.5px solid #751423',
      mixBlendMode: 'normal' as const,
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[100] flex items-center justify-center text-white text-[10px] font-bold tracking-widest uppercase overflow-hidden"
      variants={variants}
      animate={variant}
      transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.5 }}
    >
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: variant !== 'default' ? 1 : 0, y: variant !== 'default' ? 0 : 10 }}
        transition={{ duration: 0.2 }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}

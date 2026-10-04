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
      x: mousePosition.x - 8,
      y: mousePosition.y - 8,
      width: 16,
      height: 16,
      backgroundColor: 'transparent',
      border: '1.5px solid var(--color-foreground)',
      mixBlendMode: 'difference' as const,
    },
    project: {
      x: mousePosition.x - 40,
      y: mousePosition.y - 40,
      width: 80,
      height: 80,
      backgroundColor: 'var(--color-primary)',
      border: 'none',
      mixBlendMode: 'normal' as const,
    },
    button: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      width: 48,
      height: 48,
      backgroundColor: 'transparent',
      border: '1.5px solid var(--color-primary)',
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

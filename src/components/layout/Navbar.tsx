'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursorStore } from '@/components/ui/CustomCursor';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const setVariant = useCursorStore(state => state.setVariant);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '/', active: true },
    { name: 'Philosophy', href: '#philosophy' },
    { name: 'Services', href: '#services' },
    { name: 'Work', href: '#work' },
    { name: 'How We Work', href: '#how-we-work' },
    { name: 'Studio', href: '#studio' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[60] h-[72px] px-6 sm:px-12 flex items-center justify-between border-b border-[rgba(120,40,40,0.15)] transition-all duration-300 ${
          isScrolled ? 'bg-[#F6E3D0]/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        {/* Left: ASAR Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 z-[70] group"
          onMouseEnter={() => setVariant('button')}
          onMouseLeave={() => setVariant('default')}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="ASARR Home"
        >
          <svg 
            className="w-7 h-7 text-[#5A0B16] transition-transform duration-300 group-hover:scale-105" 
            viewBox="0 0 36 36" 
            fill="currentColor"
          >
            <path d="M19.5 2.5 C19.5 2.5 25.5 15.5 33.5 32.5 C31.5 32.8 28.5 31.0 25.0 24.5 C21.5 17.5 19.5 9.5 19.0 2.5 Z" />
            <path d="M4.0 32.5 C6.5 28.5 11.5 22.0 19.0 19.5 C16.5 20.5 12.0 22.5 7.5 26.5 C5.5 28.5 4.5 30.5 4.0 32.5 Z" />
            <path d="M14.0 21.0 C16.5 16.5 18.5 10.0 19.5 2.5 C17.5 7.5 14.5 14.5 11.5 21.0 Z" opacity="0.9" />
          </svg>
          <span className="text-[22px] font-sans font-semibold tracking-[0.16em] text-[#5A0B16] select-none">
            ASARR
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav 
          className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2" 
          aria-label="Main Navigation"
        >
          <ul className="flex items-center gap-7 lg:gap-9">
            {navLinks.map((link) => (
              <li key={link.name} className="relative flex flex-col items-center">
                <Link 
                  href={link.href}
                  className="text-[14.5px] font-sans font-medium text-[#3A141A] hover:text-[#751423] transition-colors py-1.5"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Pill CTA Button */}
        <div className="hidden md:flex items-center">
          <Link 
            href="#contact"
            className="text-[13.5px] font-sans font-medium uppercase tracking-[0.08em] bg-[#5A0A14] text-white px-6 py-2.5 rounded-full hover:bg-[#450C14] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            onMouseEnter={() => setVariant('button')}
            onMouseLeave={() => setVariant('default')}
          >
            LET&apos;S BUILD →
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          type="button"
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={mobileMenuOpen}
          className="md:hidden flex items-center gap-2 text-xs font-bold uppercase tracking-[0.10em] text-[#5A0A14] z-[70] p-2 rounded-lg hover:bg-black/5 transition-colors min-h-[44px] min-w-[44px] justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="font-bold text-lg">
            {mobileMenuOpen ? '✕' : '☰'}
          </span>
          <span>{mobileMenuOpen ? 'CLOSE' : 'MENU'}</span>
        </button>
      </header>

      {/* Mobile Full-Screen Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[50] bg-[#F6E3D0]/98 backdrop-blur-xl flex flex-col justify-center px-8"
          >
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl sm:text-4xl font-sans font-medium text-[#350A12] hover:text-[#5A0A14] transition-colors uppercase tracking-tight"
                >
                  {link.name}
                </Link>
              ))}
              <Link 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center text-sm font-sans font-medium uppercase tracking-[0.08em] bg-[#5A0A14] text-white px-8 py-3 rounded-full mt-4 self-start"
              >
                LET&apos;S BUILD →
              </Link>
            </nav>
            
            <div className="absolute bottom-10 left-8 right-8 flex justify-between text-xs font-medium uppercase tracking-[0.10em] text-[#4A1A1A]/60 border-t border-[#4A1A1A]/15 pt-6">
              <span>hello@asarr.in</span>
              <span>Bangalore, IN</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

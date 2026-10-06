'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursorStore } from '@/components/ui/CustomCursor';
import { useModalStore } from '@/lib/modalStore';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  const setVariant = useCursorStore((state) => state.setVariant);
  const { openProjectModal } = useModalStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // Section tracking
      const sections = ['services', 'work', 'philosophy', 'process', 'contact'];
      const scrollPos = window.scrollY + 200;

      let current = 'home';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            current = sectionId;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'Services', href: '#services', id: 'services' },
    { name: 'Work', href: '#work', id: 'work' },
    { name: 'About', href: '#philosophy', id: 'philosophy' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[60] h-[72px] px-6 sm:px-12 flex items-center justify-between transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#F3EEE7]/90 backdrop-blur-md border-b border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-[#171515]' 
            : 'bg-transparent text-white border-b border-white/[0.08]'
        }`}
      >
        {/* Left: ASARR Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 z-[70] group"
          onMouseEnter={() => setVariant('button')}
          onMouseLeave={() => setVariant('default')}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="ASARR Studio Home"
        >
          <span className={`text-[21px] sm:text-[23px] font-sans font-extrabold tracking-[0.18em] transition-colors select-none ${
            isScrolled ? 'text-[#171515]' : 'text-white'
          }`}>
            ASARR
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#6F1420] shrink-0" />
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav 
          className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2" 
          aria-label="Main Navigation"
        >
          <ul className="flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <li key={link.name} className="relative flex flex-col items-center">
                  <a 
                    href={link.href}
                    className={`text-[13px] font-sans font-medium transition-colors py-1 ${
                      isScrolled
                        ? isActive ? 'text-[#6F1420] font-semibold' : 'text-[#4A423D] hover:text-[#6F1420]'
                        : isActive ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </a>
                  {isActive && (
                    <motion.span 
                      layoutId="activeNavDot"
                      className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#6F1420]" 
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right: Pill CTA Button "Let's Talk ->" */}
        <div className="hidden md:flex items-center">
          <button 
            type="button"
            onClick={openProjectModal}
            className={`text-[12px] font-sans font-semibold uppercase tracking-[0.10em] px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 ${
              isScrolled
                ? 'bg-[#6F1420] text-white hover:bg-[#5A0E1A] shadow-sm hover:shadow-md'
                : 'bg-white/10 hover:bg-white text-white hover:text-[#171515] border border-white/20'
            }`}
            onMouseEnter={() => setVariant('button')}
            onMouseLeave={() => setVariant('default')}
          >
            <span>Let&apos;s Talk</span>
            <span aria-hidden="true" className="text-sm">→</span>
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          type="button"
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={mobileMenuOpen}
          className={`md:hidden flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.10em] z-[70] p-2 rounded-lg transition-colors ${
            isScrolled ? 'text-[#171515]' : 'text-white'
          }`}
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
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[55] bg-[#F3EEE7]/98 backdrop-blur-xl flex flex-col justify-center px-8"
          >
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl font-sans font-medium text-[#171515] hover:text-[#6F1420] transition-colors uppercase tracking-tight"
                >
                  {link.name}
                </a>
              ))}
              <button 
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openProjectModal();
                }}
                className="inline-flex items-center justify-center gap-3 text-xs font-sans font-semibold uppercase tracking-[0.12em] bg-[#6F1420] text-white px-8 py-3.5 rounded-full mt-4 self-start shadow-md"
              >
                <span>LET&apos;S TALK</span>
                <span>→</span>
              </button>
            </nav>
            
            <div className="absolute bottom-10 left-8 right-8 flex justify-between text-xs font-mono uppercase tracking-[0.10em] text-[#7A726C] border-t border-black/10 pt-6">
              <span>hello@asarr.in</span>
              <span>Bangalore, IN</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#EFE9DF] text-[#4A4641] py-16 border-t border-black/10 select-none">
      <div className="section-container">
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-8 mb-16">
          
          <div className="flex flex-col gap-4 max-w-sm">
            <Link href="/" className="text-2xl font-sans font-semibold uppercase tracking-[0.16em] text-[#1C1A1A] hover:text-[#751423] transition-colors">
              ASARR
            </Link>
            <p className="text-sm font-sans text-[#4A4641] leading-relaxed">
              Creative + Media Production + Marketing + Software Studio.
            </p>
            <span className="text-[11px] font-mono tracking-[0.08em] uppercase text-[#8B8682]">
              Bangalore, India — Operating Globally
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono tracking-[0.12em] uppercase text-[#8B8682] mb-1">Index</span>
              <Link href="#philosophy" className="text-xs font-mono uppercase tracking-[0.08em] text-[#2B2927] hover:text-[#751423] transition-colors">Philosophy</Link>
              <Link href="#services" className="text-xs font-mono uppercase tracking-[0.08em] text-[#2B2927] hover:text-[#751423] transition-colors">Services</Link>
              <Link href="#work" className="text-xs font-mono uppercase tracking-[0.08em] text-[#2B2927] hover:text-[#751423] transition-colors">Selected Work</Link>
              <Link href="#how-we-work" className="text-xs font-mono uppercase tracking-[0.08em] text-[#2B2927] hover:text-[#751423] transition-colors">How We Work</Link>
              <Link href="#studio" className="text-xs font-mono uppercase tracking-[0.08em] text-[#2B2927] hover:text-[#751423] transition-colors">The Studio</Link>
            </div>
            
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono tracking-[0.12em] uppercase text-[#8B8682] mb-1">Channels</span>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xs font-mono uppercase tracking-[0.08em] text-[#2B2927] hover:text-[#751423] transition-colors">Instagram</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-xs font-mono uppercase tracking-[0.08em] text-[#2B2927] hover:text-[#751423] transition-colors">LinkedIn</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-xs font-mono uppercase tracking-[0.08em] text-[#2B2927] hover:text-[#751423] transition-colors">Twitter / X</a>
            </div>

            <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono tracking-[0.12em] uppercase text-[#8B8682] mb-1">Direct</span>
              <a href="mailto:hello@asarr.in" className="text-xs font-mono tracking-[0.04em] text-[#751423] hover:underline font-medium">hello@asarr.in</a>
              <span className="text-[11px] font-mono tracking-[0.08em] uppercase text-[#8B8682] mt-1">Est. 2026</span>
            </div>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-black/10 text-[10px] font-mono tracking-[0.08em] uppercase text-[#8B8682]">
          <p>© {new Date().getFullYear()} ASARR. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-[#1C1A1A] transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#1C1A1A] transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

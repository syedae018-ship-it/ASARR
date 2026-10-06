import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#11100F] text-[#FAF6F0] pt-16 sm:pt-20 pb-12 sm:pb-16 border-t border-white/10 select-none">
      <div className="w-full max-w-[1550px] mx-auto px-6 sm:px-12 lg:px-16">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10 pb-16 border-b border-white/[0.08]">
          
          {/* Brand Manifesto & Socials (Cols 1-4) */}
          <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-8">
            <Link 
              href="/" 
              className="text-2xl sm:text-3xl font-sans font-extrabold tracking-[0.18em] text-white hover:text-[#F5D5DA] transition-colors"
            >
              ASARR
            </Link>

            <p className="font-sans text-xs sm:text-sm text-[#A69E94] leading-[1.65] mt-4 mb-6 max-w-sm">
              A creative and tech agency helping brands grow through content, marketing, websites and apps.
            </p>

            {/* Social Channels Icons */}
            <div className="flex items-center gap-4 text-white/80">
              {/* Instagram */}
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="ASARR on Instagram"
                className="w-8 h-8 rounded-full border border-white/20 hover:border-white hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* YouTube */}
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="ASARR on YouTube"
                className="w-8 h-8 rounded-full border border-white/20 hover:border-white hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <polygon points="10 15 15 12 10 9 10 15" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="ASARR on LinkedIn"
                className="w-8 h-8 rounded-full border border-white/20 hover:border-white hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="ASARR on X"
                className="w-8 h-8 rounded-full border border-white/20 hover:border-white hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links (Cols 5-7) */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50 mb-4 font-semibold">
              QUICK LINKS
            </span>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-[#D4CCC2]">
              <li>
                <a href="#home" className="hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">Services</a>
              </li>
              <li>
                <a href="#work" className="hover:text-white transition-colors">Work</a>
              </li>
              <li>
                <a href="#philosophy" className="hover:text-white transition-colors">About</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          {/* Services (Cols 8-9) */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50 mb-4 font-semibold">
              SERVICES
            </span>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-[#D4CCC2]">
              <li>
                <a href="#services" className="hover:text-white transition-colors">Content Creation</a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">Digital Marketing</a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">Website Development</a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">App Development</a>
              </li>
            </ul>
          </div>

          {/* Direct Contact (Cols 10-12) */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50 mb-4 font-semibold">
              CONTACT
            </span>
            <div className="space-y-3 text-xs sm:text-sm font-sans text-[#D4CCC2]">
              <a 
                href="mailto:hello@asarr.in" 
                className="flex items-center gap-2.5 hover:text-white transition-colors group"
              >
                <span className="text-white/60 group-hover:text-white">✉</span>
                <span>hello@asarr.in</span>
              </a>

              <div className="flex items-center gap-2.5 text-[#A69E94]">
                <span>📍</span>
                <span>Bangalore, India</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-[11px] font-mono uppercase tracking-[0.12em] text-white/50">
          <p>© 2026 ASARR. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-white transition-colors cursor-pointer">Sitemap</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

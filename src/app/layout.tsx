import type { Metadata } from 'next';
import { Anton, Cormorant_Garamond, Manrope, IBM_Plex_Mono, Pinyon_Script } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomCursor } from '@/components/ui/CustomCursor';

const anton = Anton({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const manrope = Manrope({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const pinyonScript = Pinyon_Script({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ASARR — Creative Technology & Digital Agency | Ideas to Impact',
  description: 'ASARR builds bespoke digital products, high-performance web systems, creative brand identities, and AI integrations that ambitious businesses remember.',
  keywords: ['Creative Agency', 'Web Development', 'Custom Software', 'AI Integration', 'Brand Identity', 'ASARR', 'Digital Products'],
  authors: [{ name: 'ASARR' }],
  openGraph: {
    title: 'ASARR — From Ideas to Impact',
    description: 'Creative technology agency building digital experiences that people remember.',
    url: 'https://asarr.in',
    siteName: 'ASARR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASARR — From Ideas to Impact',
    description: 'Creative technology agency building digital experiences that people remember.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body 
        className={`${manrope.variable} ${anton.variable} ${cormorant.variable} ${ibmPlexMono.variable} ${pinyonScript.variable} font-sans bg-background text-foreground min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary custom-cursor-active overflow-x-clip`}
      >
        <CustomCursor />
        <Navbar />
        <main className="flex-grow overflow-x-clip">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Anton, IBM_Plex_Mono, Pinyon_Script } from 'next/font/google';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/600-italic.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
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

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400'],
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
        className={`${anton.variable} ${ibmPlexMono.variable} ${pinyonScript.variable} font-sans bg-background text-foreground min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary custom-cursor-active overflow-x-clip`}
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

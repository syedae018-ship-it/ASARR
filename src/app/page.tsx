import { Hero } from '@/components/sections/Hero';
import { WhatWeDo } from '@/components/sections/WhatWeDo';
import { FeaturedWork } from '@/components/sections/FeaturedWork';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { PhilosophySection } from '@/components/sections/PhilosophySection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { ProjectModal } from '@/components/modals/ProjectModal';
import { ShowreelModal } from '@/components/modals/ShowreelModal';
import { BookCallModal } from '@/components/modals/BookCallModal';

export default function Home() {
  return (
    <>
      <Hero />
      <WhatWeDo />
      <FeaturedWork />
      <ServicesSection />
      <PhilosophySection />
      <ProcessSection />
      <FinalCTA />
      
      {/* Interactive Global Modals */}
      <ProjectModal />
      <ShowreelModal />
      <BookCallModal />
    </>
  );
}

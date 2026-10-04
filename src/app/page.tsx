import { Hero } from '@/components/sections/Hero';
import { PhilosophySection } from '@/components/sections/PhilosophySection';
import { ServicesInteractive } from '@/components/sections/ServicesInteractive';
import { SelectedWork } from '@/components/sections/SelectedWork';
import { HowWeWork } from '@/components/sections/HowWeWork';
import { TheStudio } from '@/components/sections/TheStudio';
import { ContactCTA } from '@/components/sections/ContactCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <PhilosophySection />
      <ServicesInteractive />
      <SelectedWork />
      <HowWeWork />
      <TheStudio />
      <ContactCTA />
    </>
  );
}

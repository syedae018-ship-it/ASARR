import { ServicesInteractive } from '@/components/sections/ServicesInteractive';

export default function ServicesPreviewPage() {
  return (
    <main className="w-full min-h-screen bg-[#F3F0EA]">
      {/* Hide the global floating navbar on this dedicated visual test route */}
      <style>{`header { display: none !important; }`}</style>
      <ServicesInteractive />
    </main>
  );
}

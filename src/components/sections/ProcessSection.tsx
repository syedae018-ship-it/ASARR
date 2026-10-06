'use client';

import { useCursorStore } from '@/components/ui/CustomCursor';

interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

const steps: ProcessStep[] = [
  {
    number: '01',
    title: 'Discover',
    description: 'Understand your brand, goals and audience.',
  },
  {
    number: '02',
    title: 'Plan',
    description: 'Create strategy and roadmap.',
  },
  {
    number: '03',
    title: 'Create',
    description: 'Design, develop and execute.',
  },
  {
    number: '04',
    title: 'Grow',
    description: 'Optimize and scale for long-term impact.',
  },
];

export function ProcessSection() {
  const setVariant = useCursorStore((state) => state.setVariant);

  return (
    <section 
      id="process"
      className="relative w-full bg-[#F3EEE7] text-[#171515] py-20 sm:py-28 px-6 sm:px-12 lg:px-16 overflow-hidden select-none border-t border-black/[0.08]"
    >
      <div className="relative z-10 w-full max-w-[1550px] mx-auto">
        
        {/* Main Grid: Left Headline + Right Horizontal Connected Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Heading (Cols 1-4) */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <span className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.16em] text-[#6E665E] font-semibold mb-3">
              OUR PROCESS
            </span>

            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-sans font-extrabold uppercase tracking-tight leading-[1.02] text-[#171515]">
                <span className="block">Simple.</span>
                <span className="block mt-1">Clear. Effective.</span>
              </h2>

              {/* Hand-drawn Red Brush Accent Underline */}
              <svg 
                className="w-32 sm:w-44 text-[#6F1420] mt-2" 
                viewBox="0 0 160 12" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              >
                <path d="M4,7 Q80,2 156,8" />
              </svg>
            </div>
          </div>

          {/* Right Column: 4 Interconnected Process Steps (Cols 5-12) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 items-start pt-4 lg:pt-0">
            {steps.map((step, idx) => (
              <div
                key={step.number}
                onMouseEnter={() => setVariant('button')}
                onMouseLeave={() => setVariant('default')}
                className="group flex flex-col items-start relative pr-2"
              >
                {/* Step Number + Connecting Arrow */}
                <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-black/[0.08]">
                  <span className="font-mono text-xs font-bold text-[#6F1420] tracking-[0.14em]">
                    {step.number}
                  </span>

                  {/* Connecting Arrow for intermediate steps */}
                  {idx < steps.length - 1 && (
                    <span className="text-[#8C847C] group-hover:text-[#6F1420] group-hover:translate-x-1 transition-all duration-300 text-sm hidden lg:inline">
                      →
                    </span>
                  )}
                </div>

                {/* Step Title */}
                <h3 className="font-sans font-bold text-lg sm:text-xl tracking-tight text-[#171515] group-hover:text-[#6F1420] transition-colors mb-2">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="font-sans text-xs sm:text-sm text-[#5C554E] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

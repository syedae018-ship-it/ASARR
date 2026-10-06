'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalStore } from '@/lib/modalStore';
import { useCursorStore } from '@/components/ui/CustomCursor';

export function ProjectModal() {
  const { isProjectModalOpen, closeProjectModal } = useModalStore();
  const setVariant = useCursorStore((state) => state.setVariant);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    budget: '$15k - $30k',
    services: [] as string[],
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const toggleService = (svc: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(svc)
        ? prev.services.filter((s) => s !== svc)
        : [...prev.services, svc],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      closeProjectModal();
    }, 2500);
  };

  const serviceOptions = [
    'Brand Strategy',
    'Content Production',
    'Website Development',
    'App Development',
    'Digital Marketing',
    'AI & Custom Software',
  ];

  const budgetOptions = [
    '< $10k',
    '$10k - $25k',
    '$25k - $50k',
    '$50k+',
  ];

  return (
    <AnimatePresence>
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProjectModal}
            className="fixed inset-0 bg-[#11100F]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl bg-[#F3EEE7] text-[#171515] rounded-3xl p-6 sm:p-10 shadow-2xl border border-black/10 my-8 overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={closeProjectModal}
              onMouseEnter={() => setVariant('button')}
              onMouseLeave={() => setVariant('default')}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/70 hover:bg-[#6F1420] hover:text-white flex items-center justify-center transition-colors text-sm border border-black/10"
              aria-label="Close Project Modal"
            >
              ✕
            </button>

            {submitted ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#6F1420] text-white flex items-center justify-center text-2xl mb-5">
                  ✓
                </div>
                <h3 className="font-serif italic text-3xl sm:text-4xl text-[#171515]">
                  Inquiry Received.
                </h3>
                <p className="font-sans text-sm text-[#5C554E] max-w-sm mt-3 leading-relaxed">
                  Thank you for reaching out to ASARR. Our partner director will review your brief and contact you within 24 hours.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6F1420] font-semibold block mb-2">
                    START A PROJECT
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-sans font-bold tracking-tight">
                    Let&apos;s build your <span className="font-serif italic font-normal text-[#6F1420]">vision.</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6E665E] mt-2 font-sans">
                    Tell us about your company goals, timeline, and digital ambitions.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Services Selection */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-[0.10em] text-[#6E665E] mb-2.5">
                      SERVICES NEEDED (SELECT ALL THAT APPLY)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {serviceOptions.map((svc) => {
                        const isSelected = formData.services.includes(svc);
                        return (
                          <button
                            key={svc}
                            type="button"
                            onClick={() => toggleService(svc)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all duration-200 ${
                              isSelected
                                ? 'bg-[#6F1420] text-white shadow-sm'
                                : 'bg-white/80 hover:bg-white text-[#171515] border border-black/10'
                            }`}
                          >
                            {svc}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-[0.10em] text-[#6E665E] mb-1.5">
                        YOUR NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Maya Chen"
                        className="w-full bg-white/90 border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6F1420] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-[0.10em] text-[#6E665E] mb-1.5">
                        EMAIL ADDRESS *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="maya@company.com"
                        className="w-full bg-white/90 border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6F1420] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Company & Budget Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-[0.10em] text-[#6E665E] mb-1.5">
                        COMPANY / BRAND
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Company name"
                        className="w-full bg-white/90 border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6F1420] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-[0.10em] text-[#6E665E] mb-1.5">
                        ESTIMATED BUDGET
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full bg-white/90 border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6F1420] transition-colors"
                      >
                        {budgetOptions.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-[0.10em] text-[#6E665E] mb-1.5">
                      BRIEF PROJECT SUMMARY
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Share a few details on your goals, requirements, or inspiration..."
                      className="w-full bg-white/90 border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6F1420] transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      onMouseEnter={() => setVariant('button')}
                      onMouseLeave={() => setVariant('default')}
                      className="w-full py-4 rounded-full bg-[#6F1420] hover:bg-[#5A0E1A] text-white font-sans font-semibold text-xs uppercase tracking-[0.12em] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                    >
                      <span>SEND INQUIRY</span>
                      <span>→</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

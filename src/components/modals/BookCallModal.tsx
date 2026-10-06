'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalStore } from '@/lib/modalStore';
import { useCursorStore } from '@/components/ui/CustomCursor';

export function BookCallModal() {
  const { isBookCallOpen, closeBookCall } = useModalStore();
  const setVariant = useCursorStore((state) => state.setVariant);

  const [selectedDate, setSelectedDate] = useState('Tomorrow, 3:00 PM IST');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('New Project Discovery');
  const [booked, setBooked] = useState(false);

  const timeSlots = [
    'Tomorrow, 2:00 PM IST',
    'Tomorrow, 3:00 PM IST',
    'Tomorrow, 5:30 PM IST',
    'Wednesday, 11:00 AM IST',
    'Wednesday, 4:00 PM IST',
    'Thursday, 2:30 PM IST',
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      closeBookCall();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isBookCallOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBookCall}
            className="fixed inset-0 bg-[#11100F]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl bg-[#F3EEE7] text-[#171515] rounded-3xl p-6 sm:p-10 shadow-2xl border border-black/10 my-8 overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={closeBookCall}
              onMouseEnter={() => setVariant('button')}
              onMouseLeave={() => setVariant('default')}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/70 hover:bg-[#6F1420] hover:text-white flex items-center justify-center transition-colors text-sm border border-black/10"
              aria-label="Close Booking Modal"
            >
              ✕
            </button>

            {booked ? (
              <div className="py-14 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#6F1420] text-white flex items-center justify-center text-2xl mb-4">
                  🗓
                </div>
                <h3 className="font-serif italic text-3xl text-[#171515]">
                  Call Scheduled.
                </h3>
                <p className="font-sans text-sm text-[#5C554E] max-w-sm mt-3 leading-relaxed">
                  We have reserved your 30-minute discovery session for <span className="font-bold text-[#171515]">{selectedDate}</span>. An invite has been dispatched to {email || 'your email'}.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6F1420] font-semibold block mb-1">
                    30-MIN DISCOVERY CALL
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight">
                    Consult with our <span className="font-serif italic font-normal text-[#6F1420]">Creative Director.</span>
                  </h3>
                  <p className="text-xs text-[#6E665E] mt-1.5 font-sans">
                    Discuss scope, strategic alignment, and project execution with our leadership.
                  </p>
                </div>

                <form onSubmit={handleBooking} className="space-y-5">
                  {/* Select Slot */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-[0.10em] text-[#6E665E] mb-2">
                      SELECT AVAILABLE TIME SLOT
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {timeSlots.map((slot) => {
                        const isSelected = selectedDate === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedDate(slot)}
                            className={`p-2.5 rounded-xl text-xs font-sans text-left transition-all ${
                              isSelected
                                ? 'bg-[#6F1420] text-white font-medium shadow-sm'
                                : 'bg-white/80 hover:bg-white text-[#171515] border border-black/10'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-[0.10em] text-[#6E665E] mb-1">
                        YOUR NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white/90 border border-black/15 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#6F1420] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-[0.10em] text-[#6E665E] mb-1">
                        WORK EMAIL *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@studio.com"
                        className="w-full bg-white/90 border border-black/15 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#6F1420] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Discussion Topic */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-[0.10em] text-[#6E665E] mb-1">
                      PRIMARY TOPIC
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-white/90 border border-black/15 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#6F1420] transition-colors"
                    >
                      <option value="New Project Discovery">New Project Discovery</option>
                      <option value="Brand Identity & Redesign">Brand Identity & Redesign</option>
                      <option value="Full-Stack Web or App Build">Full-Stack Web or App Build</option>
                      <option value="Performance & Growth Marketing">Performance & Growth Marketing</option>
                      <option value="General Collaboration">General Collaboration</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      onMouseEnter={() => setVariant('button')}
                      onMouseLeave={() => setVariant('default')}
                      className="w-full py-3.5 rounded-full bg-[#6F1420] hover:bg-[#5A0E1A] text-white font-sans font-semibold text-xs uppercase tracking-[0.12em] transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                    >
                      <span>CONFIRM APPOINTMENT</span>
                      <span>🗓</span>
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

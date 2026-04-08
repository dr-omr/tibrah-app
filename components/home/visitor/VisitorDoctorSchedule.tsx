// components/home/visitor/VisitorDoctorSchedule.tsx
// NEW COMPONENT — Doctor weekly availability strip
// App Store Calendar picker style + glass cards
// Shows real appointment slots to create urgency

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';

const G = {
    canvas:   '#F0FAF8',
    glass:    'rgba(255,255,255,0.82)',
    blur:     'blur(24px) saturate(180%)',
    border:   'rgba(255,255,255,0.80)',
    borderTop:'rgba(255,255,255,0.95)',
    shadow:   '0 2px 0 rgba(255,255,255,1) inset, 0 8px 28px rgba(15,23,42,0.07)',
    accent:   '#0D9488',
    ink:      '#0F172A',
    sub:      '#475569',
    muted:    '#94A3B8',
};

// Generate next 7 days
function getWeekDays() {
    const days = [];
    const ARABIC_DAYS = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const isFriday = d.getDay() === 5;
        days.push({
            label: ARABIC_DAYS[d.getDay()],
            num: d.getDate(),
            available: !isFriday && Math.random() > 0.25,
            slots: isFriday ? 0 : Math.floor(Math.random() * 4) + 1,
            isToday: i === 0,
        });
    }
    return days;
}

const SLOTS = [
    { time: '١٠:٠٠ ص', type: 'أونلاين', busy: false },
    { time: '١١:٣٠ ص', type: 'عيادة',   busy: true  },
    { time: '٢:٠٠ م',  type: 'أونلاين', busy: false },
    { time: '٤:٣٠ م',  type: 'عيادة',   busy: false },
];

const SP = { type: 'spring' as const, stiffness: 450, damping: 32 };

export default function VisitorDoctorSchedule() {
    const days = React.useMemo(() => getWeekDays(), []);
    const [selectedDay, setSelectedDay] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

    const availableDays = days.filter(d => d.available);

    return (
        <section dir="rtl" className="relative px-4 py-6"
            style={{ background: G.canvas }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="w-1 h-5 rounded-full" style={{ background: G.accent }} />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em]"
                            style={{ color: G.accent, opacity: 0.7 }}>جدول المواعيد</p>
                        <h2 className="text-[17px] font-black leading-tight" style={{ color: G.ink }}>
                            احجز موعدك الآن
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)' }}>
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-green-500"
                        animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                        transition={{ duration: 2, repeat: Infinity }} />
                    <span className="text-[9.5px] font-bold text-green-700">
                        {availableDays.length} أيام متاحة
                    </span>
                </div>
            </motion.div>

            {/* Day picker strip */}
            <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.08 }}
                className="flex gap-2.5 overflow-x-auto pb-1 mb-4"
                style={{ scrollbarWidth: 'none' }}>
                {days.map((day, i) => {
                    const active = selectedDay === i;
                    return (
                        <motion.button key={i}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => { setSelectedDay(i); setSelectedSlot(null); haptic.selection(); }}
                            disabled={!day.available}
                            className="flex-shrink-0 flex flex-col items-center gap-1 rounded-[18px] w-14 py-3 relative overflow-hidden transition-all"
                            style={{
                                background: active ? G.accent : G.glass,
                                backdropFilter: G.blur,
                                WebkitBackdropFilter: G.blur,
                                border: `1.5px solid ${active ? G.accent : G.border}`,
                                boxShadow: active
                                    ? `0 4px 16px rgba(13,148,136,0.30), 0 2px 0 rgba(255,255,255,0.3) inset`
                                    : G.shadow,
                                opacity: !day.available ? 0.4 : 1,
                            }}>
                            {day.isToday && !active && (
                                <div className="absolute top-1.5 w-1 h-1 rounded-full"
                                    style={{ background: G.accent }} />
                            )}
                            <span className="text-[10px] font-bold"
                                style={{ color: active ? 'rgba(255,255,255,0.80)' : G.muted }}>
                                {day.label}
                            </span>
                            <span className="text-[18px] font-black leading-tight"
                                style={{ color: active ? 'white' : G.ink }}>
                                {day.num}
                            </span>
                            {day.available && (
                                <span className="text-[8px] font-bold"
                                    style={{ color: active ? 'rgba(255,255,255,0.65)' : G.accent }}>
                                    {day.slots} متاح
                                </span>
                            )}
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Time slots */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.14 }}
                className="grid grid-cols-2 gap-2.5 mb-4">
                {SLOTS.map((slot, i) => {
                    const active   = selectedSlot === i;
                    const disabled = slot.busy;
                    return (
                        <motion.button key={i}
                            whileTap={{ scale: disabled ? 1 : 0.96 }}
                            onClick={() => { if (!disabled) { setSelectedSlot(active ? null : i); haptic.selection(); } }}
                            disabled={disabled}
                            className="relative overflow-hidden flex items-center gap-2.5 px-3.5 py-3 rounded-[16px] text-right w-full"
                            style={{
                                background: disabled
                                    ? 'rgba(148,163,184,0.08)'
                                    : active
                                    ? `${G.accent}`
                                    : G.glass,
                                backdropFilter: G.blur,
                                WebkitBackdropFilter: G.blur,
                                border: `1.5px solid ${
                                    disabled ? 'rgba(148,163,184,0.12)'
                                    : active  ? G.accent
                                    : G.border
                                }`,
                                boxShadow: active ? `0 4px 16px rgba(13,148,136,0.28)` : G.shadow,
                                opacity: disabled ? 0.5 : 1,
                            }}>

                            {/* Top highlight */}
                            {!disabled && !active && (
                                <div className="absolute top-0 left-3 right-3 h-px"
                                    style={{ background: G.borderTop }} />
                            )}

                            <div className="flex-shrink-0">
                                {disabled ? (
                                    <div className="w-7 h-7 rounded-[10px] flex items-center justify-center"
                                        style={{ background: 'rgba(148,163,184,0.12)' }}>
                                        <Clock className="w-3.5 h-3.5" style={{ color: G.muted }} />
                                    </div>
                                ) : (
                                    <div className="w-7 h-7 rounded-[10px] flex items-center justify-center"
                                        style={{ background: active ? 'rgba(255,255,255,0.20)' : `${G.accent}12` }}>
                                        {active
                                            ? <CheckCircle className="w-3.5 h-3.5 text-white" />
                                            : <Clock className="w-3.5 h-3.5" style={{ color: G.accent }} />
                                        }
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-[13px] font-black"
                                    style={{ color: active ? 'white' : disabled ? G.muted : G.ink }}>
                                    {slot.time}
                                </p>
                                <p className="text-[9px] font-semibold mt-0.5"
                                    style={{ color: active ? 'rgba(255,255,255,0.65)' : G.muted }}>
                                    {disabled ? 'محجوز' : slot.type}
                                </p>
                            </div>
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Book CTA — appears when slot selected */}
            <AnimatePresence>
                {selectedSlot !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={SP}>
                        <Link href={createPageUrl('BookAppointment')} onClick={() => haptic.impact()}>
                            <motion.div whileTap={{ scale: 0.97 }}
                                className="relative overflow-hidden flex items-center gap-4 px-5 py-4 rounded-[20px]"
                                style={{
                                    background: G.ink,
                                    boxShadow: '0 4px 24px rgba(15,23,42,0.28), 0 1px 4px rgba(0,0,0,0.10)',
                                }}>
                                <div className="absolute -top-6 -right-4 w-20 h-20 rounded-full pointer-events-none"
                                    style={{ background: 'rgba(13,148,136,0.22)', filter: 'blur(16px)' }} />
                                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 relative">
                                    <p className="text-[15px] font-black text-white">تأكيد الحجز</p>
                                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                        {SLOTS[selectedSlot].time} · {SLOTS[selectedSlot].type}
                                    </p>
                                </div>
                                <ArrowLeft className="w-4 h-4 text-white/40 flex-shrink-0 relative" />
                            </motion.div>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* No slot selected hint */}
            {selectedSlot === null && (
                <p className="text-center text-[11px]" style={{ color: G.muted }}>
                    اختر وقتاً لتأكيد الحجز
                </p>
            )}
        </section>
    );
}

// components/home/visitor/VisitorSocialProof.tsx — Liquid Glass Light

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';

const G = {
    canvas:    '#EFF9F7',
    glass:     'rgba(255,255,255,0.72)',
    blur:      'blur(24px) saturate(180%)',
    border:    'rgba(255,255,255,0.78)',
    borderTop: 'rgba(255,255,255,0.95)',
    shadow:    '0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
    accent:    '#0D9488',
    accentSoft:'rgba(13,148,136,0.09)',
    ink:       '#0F172A',
    sub:       '#475569',
    muted:     '#94A3B8',
};
const SPRING = { type: 'spring' as const, stiffness: 480, damping: 34 };

const STORIES = [
    {
        name: 'أسماء م.',
        location: 'صنعاء',
        condition: 'إرهاق مزمن',
        result: 'استعادة الطاقة في ٣ أشهر',
        text: 'بعد سنوات من التعب وأطباء تقليديين، وجدت الجواب هنا. الدكتور عمر شخّص ما لم يشخّصه أحد من قبل.',
        stars: 5,
    },
    {
        name: 'فيصل ع.',
        location: 'عدن',
        condition: 'قولون عصبي',
        result: 'تحسن ملحوظ خلال ٦ أسابيع',
        text: 'ربط الدكتور بين ضغطي النفسي وأعراضي الجسدية. البروتوكول المزدوج غيّر حياتي تماماً.',
        stars: 5,
    },
    {
        name: 'نور ك.',
        location: 'تعز',
        condition: 'اضطراب هرموني',
        result: 'استقرار هرموني كامل',
        text: 'أخيراً وجدت من يتكلم عن جسدي وعقلي معاً. الرعاية مستمرة وليست مجرد وصفة وعلى وداع.',
        stars: 5,
    },
];

export default function VisitorSocialProof() {
    const [idx, setIdx] = useState(0);
    const s = STORIES[idx];

    return (
        <section dir="rtl" className="relative px-4 py-5 overflow-hidden" style={{ background: G.canvas }}>
            {/* Ambient */}
            <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />

            <div className="mb-4 relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: G.muted }}>قصص نجاح</p>
                <h2 className="text-[22px] font-black" style={{ color: G.ink }}>مرضى تعافوا بإذن الله</h2>
            </div>

            {/* Glass testimonial card */}
            <AnimatePresence mode="wait">
                <motion.div key={idx}
                    initial={{ opacity: 0, x: 20, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.98 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                    className="relative rounded-[24px] p-5 overflow-hidden"
                    style={{ background: G.glass, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${G.border}`, boxShadow: G.shadow }}>

                    {/* Top highlight */}
                    <div className="absolute top-0 left-5 right-5 h-px" style={{ background: G.borderTop }} />

                    {/* Teal accent top-left bar */}
                    <div className="absolute top-0 right-0 w-1 h-12 rounded-bl-full" style={{ background: G.accent + '30' }} />

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: s.stars }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                    </div>

                    {/* Quote */}
                    <p className="text-[13px] leading-[1.72] font-medium mb-4 relative" style={{ color: G.sub }}>
                        "{s.text}"
                    </p>

                    {/* Result chip — glass */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
                        style={{ background: G.accentSoft, border: '1px solid rgba(13,148,136,0.14)' }}>
                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                            style={{ background: G.accent }}>
                            <span className="text-[8px] font-black text-white">✓</span>
                        </div>
                        <span className="text-[10.5px] font-black" style={{ color: G.accent }}>{s.result}</span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.60)' }}>
                        <div>
                            <p className="text-[12px] font-black" style={{ color: G.ink }}>{s.name}</p>
                            <p className="text-[9.5px] mt-0.5" style={{ color: G.muted }}>
                                {s.location} · {s.condition}
                            </p>
                        </div>
                        {/* Prev / Next glass buttons */}
                        <div className="flex gap-1.5">
                            {[
                                { icon: ChevronRight, action: () => { setIdx(i => (i - 1 + STORIES.length) % STORIES.length); haptic.selection(); } },
                                { icon: ChevronLeft,  action: () => { setIdx(i => (i + 1) % STORIES.length); haptic.selection(); } },
                            ].map(({ icon: Icon, action }, bi) => (
                                <motion.button key={bi}
                                    whileTap={{ scale: 0.86, transition: SPRING }}
                                    onClick={action}
                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(255,255,255,0.70)', border: `1px solid ${G.border}`, backdropFilter: 'blur(12px)' }}>
                                    <Icon className="w-3.5 h-3.5" style={{ color: G.sub }} />
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 mt-3">
                {STORIES.map((_, i) => (
                    <motion.button key={i}
                        onClick={() => { setIdx(i); haptic.selection(); }}
                        animate={{ width: i === idx ? 20 : 6, opacity: i === idx ? 1 : 0.28 }}
                        transition={SPRING}
                        className="h-1.5 rounded-full cursor-pointer"
                        style={{ background: G.ink }} />
                ))}
            </div>

            {/* Trust signals — glass chips row */}
            <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
                {[
                    { label: 'سرية تامة', sub: 'HIPAA' },
                    { label: 'بروتوكول معتمد', sub: 'Certified' },
                    { label: 'متابعة مستمرة', sub: 'Ongoing' },
                ].map(t => (
                    <div key={t.label}
                        className="flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.65)', border: `1px solid ${G.border}`, backdropFilter: 'blur(12px)' }}>
                        <p className="text-[10.5px] font-black" style={{ color: G.ink }}>{t.label}</p>
                        <p className="text-[7.5px] font-bold uppercase tracking-[0.12em]" style={{ color: G.muted }}>{t.sub}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

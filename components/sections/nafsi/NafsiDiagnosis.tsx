'use client';
/**
 * NafsiDiagnosis.tsx — التشخيص النفسي
 * ──────────────────────────────────────
 * ✦ Featured Card: الطب الشعوري — التقييم العاطفي الرئيسي
 * ✦ 7 أدوات تشخيص نفسي كاملة
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, ArrowLeft, Sparkles } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { ServiceTile } from '@/components/sections/ServiceTile';
import { SP, SP_SLOW } from '@/components/sections/section-shared';

const C  = '#7C3AED';
const CA = '#6D28D9';

const ITEMS = [
    { href: '/emotional-medicine',   label: 'الطب الشعوري',           sub: 'تقييم حالتك العاطفية ومساراتها', badge: 'رئيسي', type: 'diagnostic' as const },
    { href: '/assess/anxiety',       label: 'تقييم القلق',             sub: 'GAD-7 + تحليل سريري عميق',       type: 'diagnostic' as const },
    { href: '/assess/depression',    label: 'تقييم الاكتئاب',          sub: 'PHQ-9 + مسارات الدعم',           type: 'diagnostic' as const },
    { href: '/assess/burnout',       label: 'تقييم الاحتراق النفسي',   sub: 'اكتشف مستوى استنزافك',           type: 'diagnostic' as const },
    { href: '/assess/attachment',    label: 'تقييم نمط التعلّق',       sub: 'علاقاتك + جذورها النفسية',        type: 'diagnostic' as const },
    { href: '/assess/personality',   label: 'أنماط الشخصية',           sub: 'فهم نفسك بعمق علمي',             type: 'diagnostic' as const },
    { href: '/assess/awareness',     label: 'خرائط الوعي والأنماط',    sub: 'أنماط الطاقة والوعي الداخلي',    type: 'diagnostic' as const },
];

/* ─── Emotion pulse rings ───────────────────── */
const EMOTION_RINGS = [
    { size: 44, opacity: 0.18, delay: 0 },
    { size: 60, opacity: 0.11, delay: 0.4 },
    { size: 78, opacity: 0.06, delay: 0.8 },
];

function FeaturedEmotionalCard() {
    return (
        <Link href="/emotional-medicine" onClick={() => haptic.impact()}>
            <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...SP, delay: 0.04 }}
                whileTap={{ scale: 0.968, rotate: -0.3 }}
                className="relative overflow-hidden rounded-[24px] mb-3 p-5"
                style={{
                    background: [
                        'linear-gradient(148deg,',
                        `  ${C}EE 0%,`,
                        `  ${CA}DC 55%,`,
                        '  rgba(40,10,80,0.92) 100%',
                        ')',
                    ].join(''),
                    boxShadow: [
                        '0 2px 0 rgba(255,255,255,0.22) inset',
                        `0 18px 52px ${C}40`,
                        '0 6px 22px rgba(0,0,0,0.18)',
                    ].join(', '),
                    minHeight: 140,
                }}
            >
                {/* Pulsing heart rings */}
                <div className="absolute top-4 right-4 flex items-center justify-center pointer-events-none">
                    {EMOTION_RINGS.map((r, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{ width: r.size, height: r.size, border: `1.5px solid rgba(255,255,255,${r.opacity})` }}
                            animate={{ scale: [1, 1.14, 1], opacity: [r.opacity, r.opacity * 0.5, r.opacity] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: r.delay }}
                        />
                    ))}
                    <Heart className="w-5 h-5 text-pink-300 relative z-10" fill="currentColor" />
                </div>

                {/* Shimmer */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.08) 47%, rgba(255,255,255,0.02) 54%, transparent 75%)' }}
                    animate={{ x: ['-130%', '130%'] }}
                    transition={{ duration: 5, repeat: Infinity, repeatDelay: 4.5, ease: 'easeInOut' }}
                />
                {/* Bubble */}
                <div className="absolute top-3 left-4 w-2.5 h-2.5 rounded-full pointer-events-none"
                    style={{ background: 'rgba(255,255,255,0.42)', filter: 'blur(1.5px)' }} />

                <div className="relative z-10 pr-20">
                    {/* top badge */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-pink-300"
                            animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
                        <span className="text-[8.5px] font-black text-white/65 uppercase tracking-[0.16em]">
                            الطب الشعوري · Emotional Medicine
                        </span>
                    </div>

                    <h3 className="text-[21px] font-black text-white leading-tight tracking-tight mb-1.5"
                        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.22)' }}>
                        تقييم حالتك العاطفية
                    </h3>
                    <p className="text-[10.5px] text-white/58 leading-relaxed mb-4">
                        اكتشف أنماط مشاعرك وجذورها العميقة
                    </p>

                    {/* Emotion pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {['القلق', 'الاكتئاب', 'الاحتراق', 'العلاقات'].map(e => (
                            <span key={e}
                                className="text-[8.5px] font-black px-2.5 py-1 rounded-full text-white/80"
                                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
                                {e}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="relative z-10 flex items-center justify-between mt-4 pt-3.5"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-purple-200" />
                        <span className="text-[9px] font-bold text-white/60">تقييم احترافي · دقيق · سري</span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.22)' }}>
                        <span className="text-[9px] font-black text-white">ابدأ التقييم</span>
                        <ArrowLeft className="w-3 h-3 text-white/75" />
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

export default function NafsiDiagnosis() {
    const [open, setOpen] = useState(true);
    const rest = ITEMS.slice(1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SP, delay: 0 }} className="mb-5"
        >
            <motion.button
                className="w-full flex items-center gap-2.5 mb-3 px-1"
                whileTap={{ scale: 0.97 }}
                onClick={() => { setOpen(o => !o); haptic.selection(); }}
                aria-expanded={open}
            >
                <div className="w-[3.5px] h-[18px] rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(to bottom, ${C}, ${CA})` }} />
                <span className="text-[14px] leading-none flex-shrink-0">🔍</span>
                <span className="text-[12.5px] font-black text-slate-700 flex-1 text-right tracking-tight">التشخيص النفسي</span>
                <span className="text-[7.5px] font-black px-1.5 py-[3px] rounded-full text-white"
                    style={{ background: `linear-gradient(135deg, ${C}, ${CA})`, boxShadow: `0 2px 6px ${C}30` }}>
                    تشخيص
                </span>
                <span className="text-[8px] font-black px-2 py-1 rounded-full mr-0.5"
                    style={{ background: `${C}12`, color: C, border: `1px solid ${C}20` }}>
                    {ITEMS.length}
                </span>
                <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ ...SP, duration: 0.18 }}>
                    <ChevronDown className="w-4 h-4" style={{ color: C, opacity: 0.55 }} />
                </motion.div>
            </motion.button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div key="g" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={SP_SLOW} style={{ overflow: 'hidden' }}>
                        <FeaturedEmotionalCard />
                        <div className="grid gap-2.5"
                            style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
                            {rest.map((item, i) => (
                                <ServiceTile key={item.href + item.label} item={item} color={C} colorAlt={CA} index={i + 1} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

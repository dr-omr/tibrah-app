'use client';
/**
 * FikriDiagnosis.tsx — تشخيص الأنماط الفكرية
 * ──────────────────────────────────────────────
 * ✦ Featured Card: المعتقدات المحدِّدة — يكسر القيد الخفي
 * ✦ 5 أدوات تشخيص فكري + belief meter interactive
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Brain, ArrowLeft, Lock } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { ServiceTile } from '@/components/sections/ServiceTile';
import { SP, SP_SLOW } from '@/components/sections/section-shared';

const C  = '#D97706';
const CA = '#EA580C';

const ITEMS = [
    { href: '/assess/beliefs',         label: 'المعتقدات المحدِّدة',     sub: 'اكتشف برمجياتك الداخلية',        badge: 'رئيسي', type: 'diagnostic' as const },
    { href: '/assess/cognitive',       label: 'التشوهات المعرفية',        sub: 'أنماط تفكير تعيقك بدون أن تعرف', type: 'diagnostic' as const },
    { href: '/assess/procrastination', label: 'تقييم التسويف',            sub: 'فهم جذر تأخيرك',                 type: 'diagnostic' as const },
    { href: '/assess/identity',        label: 'تقييم الهوية والانضباط',   sub: 'من أنت؟ وماذا تريد أن تصبح؟',   type: 'diagnostic' as const },
    { href: '/assess/inner-speech',    label: 'تقييم الحديث الداخلي',     sub: 'اللغة السرية التي تشكّل حياتك',  type: 'diagnostic' as const },
];

/* ─── Belief chains visual ──────────────────── */
const BELIEF_CHAINS = [
    { label: 'لست كافياً', strength: 78 },
    { label: 'لا أستحق النجاح', strength: 55 },
    { label: 'الفشل خطر', strength: 42 },
];

function FeaturedBeliefCard() {
    const [revealed, setRevealed] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SP, delay: 0.04 }}
            className="relative overflow-hidden rounded-[24px] mb-3 p-5"
            style={{
                background: [
                    'linear-gradient(148deg,',
                    `  ${C}EC 0%,`,
                    `  ${CA}D8 55%,`,
                    '  rgba(80,30,0,0.92) 100%',
                    ')',
                ].join(''),
                boxShadow: [
                    '0 2px 0 rgba(255,255,255,0.22) inset',
                    `0 18px 52px ${C}3C`,
                    '0 6px 22px rgba(0,0,0,0.18)',
                ].join(', '),
                minHeight: 150,
            }}
        >
            {/* Shimmer */}
            <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.08) 47%, transparent 68%)' }}
                animate={{ x: ['-130%', '130%'] }}
                transition={{ duration: 5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }} />
            <div className="absolute top-3 left-4 w-2.5 h-2.5 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.40)', filter: 'blur(1.5px)' }} />
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, rgba(255,255,255,0.12), transparent 65%)`, filter: 'blur(14px)' }} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-amber-300"
                            animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
                        <span className="text-[8.5px] font-black text-white/65 uppercase tracking-[0.16em]">
                            تشخيص المعتقدات
                        </span>
                    </div>
                    <Brain className="w-5 h-5 text-amber-300/80" />
                </div>

                <h3 className="text-[20px] font-black text-white leading-tight tracking-tight mb-1"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.24)' }}>
                    ما الذي يحبسك فعلاً؟
                </h3>
                <p className="text-[10.5px] text-white/55 leading-relaxed mb-4">
                    المعتقدات المحدِّدة غير مرئية — لكنها تتحكم في قراراتك يومياً
                </p>

                <AnimatePresence mode="wait">
                    {!revealed ? (
                        <motion.button
                            key="reveal"
                            exit={{ opacity: 0, y: -6 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => { setRevealed(true); haptic.impact(); }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px]"
                            style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.24)' }}
                        >
                            <Lock className="w-3.5 h-3.5 text-amber-300" />
                            <span className="text-[10px] font-black text-white">اكشف معتقداتي المخفية</span>
                        </motion.button>
                    ) : (
                        <motion.div key="chains" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-2">
                            {BELIEF_CHAINS.map((b, i) => (
                                <div key={b.label}>
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[9px] font-black text-white/80">«{b.label}»</span>
                                        <span className="text-[8px] font-bold text-amber-300">{b.strength}%</span>
                                    </div>
                                    <div className="h-[5px] rounded-full overflow-hidden"
                                        style={{ background: 'rgba(255,255,255,0.12)' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${b.strength}%` }}
                                            transition={{ duration: 0.6, delay: 0.1 * i, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ background: `linear-gradient(to right, ${C}, ${CA})` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* CTA strip */}
            <div className="relative z-10 flex items-center justify-between mt-4 pt-3.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                <span className="text-[9px] font-bold text-white/55">التشخيص يغير كل شيء</span>
                <Link href="/assess/beliefs" onClick={() => haptic.impact()}>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.22)' }}>
                        <span className="text-[9px] font-black text-white">ابدأ التقييم الكامل</span>
                        <ArrowLeft className="w-3 h-3 text-white/75" />
                    </div>
                </Link>
            </div>
        </motion.div>
    );
}

export default function FikriDiagnosis() {
    const [open, setOpen] = useState(true);
    const rest = ITEMS.slice(1);

    return (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SP, delay: 0 }} className="mb-5">
            <motion.button className="w-full flex items-center gap-2.5 mb-3 px-1"
                whileTap={{ scale: 0.97 }}
                onClick={() => { setOpen(o => !o); haptic.selection(); }}
                aria-expanded={open}>
                <div className="w-[3.5px] h-[18px] rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(to bottom, ${C}, ${CA})` }} />
                <span className="text-[14px] leading-none flex-shrink-0">🧩</span>
                <span className="text-[12.5px] font-black text-slate-700 flex-1 text-right tracking-tight">تشخيص الأنماط الفكرية</span>
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
                        <FeaturedBeliefCard />
                        <div className="grid gap-2.5" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
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

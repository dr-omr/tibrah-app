'use client';
/**
 * RuhiDiagnosis.tsx — تقييم الاتزان الداخلي
 * ─────────────────────────────────────────────
 * ✦ Featured Card: تقييم الاتزان الروحي — breathing circle animation
 * ✦ 4 أدوات تقييم روحي
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowLeft, Moon } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { ServiceTile } from '@/components/sections/ServiceTile';
import { SP, SP_SLOW } from '@/components/sections/section-shared';

const C  = '#2563EB';
const CA = '#4F46E5';

const ITEMS = [
    { href: '/assess/inner-balance',   label: 'تقييم اتزانك الداخلي',   sub: 'المعنى · السكون · الاتصال',     badge: 'رئيسي', type: 'diagnostic' as const },
    { href: '/assess/meaning',         label: 'تقييم المعنى والرسالة',   sub: 'هل تشعر بهدف حقيقي لحياتك؟',  type: 'diagnostic' as const },
    { href: '/assess/presence',        label: 'تقييم الحضور والانتباه',  sub: 'مدى عيشك في اللحظة الراهنة',  type: 'diagnostic' as const },
    { href: '/assess/disconnection',   label: 'تقييم الانفصال الداخلي', sub: 'ضياع · فراغ روحي · تشتت',       type: 'diagnostic' as const },
];

/* ─── 5-dimension balance visual ──────────────── */
const DIMENSIONS = [
    { label: 'السكون',  value: 68, color: '#60A5FA' },
    { label: 'المعنى',  value: 42, color: '#818CF8' },
    { label: 'الاتصال', value: 55, color: '#A78BFA' },
    { label: 'الحضور',  value: 30, color: '#C084FC' },
    { label: 'الرضا',   value: 76, color: '#7DD3FC' },
];

function FeaturedInnerBalanceCard() {
    const [started, setStarted] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SP, delay: 0.04 }}
            className="relative overflow-hidden rounded-[24px] mb-3 p-5"
            style={{
                background: [
                    'linear-gradient(148deg,',
                    '  rgba(10,20,60,0.96) 0%,',
                    `  rgba(15,25,80,0.94) 45%,`,
                    `  rgba(8,15,55,0.96) 100%`,
                    ')',
                ].join(''),
                border: '1px solid rgba(96,165,250,0.16)',
                borderTop: '1px solid rgba(129,140,248,0.28)',
                boxShadow: [
                    '0 2px 0 rgba(167,139,250,0.14) inset',
                    `0 18px 52px ${C}30`,
                    '0 6px 22px rgba(0,0,0,0.30)',
                ].join(', '),
                minHeight: 160,
            }}
        >
            {/* Stars */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: 1.5 + (i % 2.5),
                        height: 1.5 + (i % 2.5),
                        top: `${8 + i * 11}%`,
                        left: `${6 + i * 11}%`,
                        background: `rgba(192,200,255,${0.25 + (i % 3) * 0.12})`,
                    }}
                    animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
                    transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.25 }}
                />
            ))}
            {/* Breathing circle */}
            <motion.div
                className="absolute top-4 right-4 pointer-events-none"
                animate={{ scale: [1, 1.18, 1], opacity: [0.12, 0.25, 0.12] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="w-20 h-20 rounded-full" style={{
                    background: `radial-gradient(circle, rgba(129,140,248,0.4), transparent 68%)`,
                    filter: 'blur(8px)',
                }} />
            </motion.div>
            {/* Shimmer */}
            <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(108deg, transparent 25%, rgba(167,139,250,0.07) 46%, transparent 67%)' }}
                animate={{ x: ['-130%', '130%'] }}
                transition={{ duration: 5.5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }} />

            <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-3">
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-indigo-300"
                        animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 2.2, repeat: Infinity }} />
                    <span className="text-[8.5px] font-black text-indigo-300/65 uppercase tracking-[0.16em]">
                        الاتزان الداخلي · Inner Balance
                    </span>
                    <Moon className="w-3 h-3 text-indigo-300/50 mr-auto" />
                </div>

                <h3 className="text-[20px] font-black text-white leading-tight tracking-tight mb-1">
                    كيف حال روحك اليوم؟
                </h3>
                <p className="text-[10.5px] text-white/50 leading-relaxed mb-4">
                    قيّم أبعاد اتزانك الداخلي وابنِ مسار سكونك
                </p>

                <AnimatePresence mode="wait">
                    {!started ? (
                        <motion.button key="start" exit={{ opacity: 0 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => { setStarted(true); haptic.impact(); }}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-[12px]"
                            style={{ background: 'rgba(129,140,248,0.18)', border: '1px solid rgba(129,140,248,0.28)' }}>
                            <span className="text-[16px]">🧘</span>
                            <span className="text-[10px] font-black text-indigo-200">ابدأ تقييم الاتزان الداخلي</span>
                        </motion.button>
                    ) : (
                        <motion.div key="dims" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-1.5">
                            {DIMENSIONS.map((d, i) => (
                                <div key={d.label} className="flex items-center gap-2">
                                    <span className="text-[8.5px] font-black text-white/60 w-10 flex-shrink-0 text-right">{d.label}</span>
                                    <div className="flex-1 h-[5px] rounded-full overflow-hidden"
                                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${d.value}%` }}
                                            transition={{ duration: 0.55, delay: 0.08 * i, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ background: d.color }}
                                        />
                                    </div>
                                    <span className="text-[7.5px] font-bold w-7 flex-shrink-0"
                                        style={{ color: d.color }}>{d.value}%</span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* CTA strip */}
            <div className="relative z-10 flex items-center justify-between mt-4 pt-3.5"
                style={{ borderTop: '1px solid rgba(129,140,248,0.12)' }}>
                <span className="text-[9px] font-bold text-white/45">تقييم موضوعي ودقيق</span>
                <Link href="/assess/inner-balance" onClick={() => haptic.impact()}>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(129,140,248,0.18)', border: '1px solid rgba(129,140,248,0.26)' }}>
                        <span className="text-[9px] font-black text-indigo-200">التقييم الكامل</span>
                        <ArrowLeft className="w-3 h-3 text-indigo-300/75" />
                    </div>
                </Link>
            </div>
        </motion.div>
    );
}

export default function RuhiDiagnosis() {
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
                <span className="text-[14px] leading-none flex-shrink-0">🌀</span>
                <span className="text-[12.5px] font-black text-slate-700 flex-1 text-right tracking-tight">تقييم الاتزان الداخلي</span>
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
                        <FeaturedInnerBalanceCard />
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

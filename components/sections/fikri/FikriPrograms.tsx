'use client';
/**
 * FikriPrograms.tsx — برامج هندسة العقل والنجاح
 * ──────────────────────────────────────────────────
 * ✦ Featured: هندسة النجاح — Success Blueprint Card
 * ✦ Goal pillars visual + 4 برامج
 */
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Target, ArrowLeft, TrendingUp } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { ServiceTile } from '@/components/sections/ServiceTile';
import { SP, SP_SLOW } from '@/components/sections/section-shared';

const C  = '#D97706';
const CA = '#EA580C';

const ITEMS = [
    { href: '/programs/success-engineering',   label: 'هندسة النجاح',              sub: 'أهداف · عادات · هوية · إنجاز',  type: 'practical' as const },
    { href: '/programs/belief-reprogramming',  label: 'إعادة برمجة المعتقدات',    sub: 'تغيير البرمجيات الخفية',          isNew: true, type: 'practical' as const },
    { href: '/programs/word-power',            label: 'هندسة الفكر والكلمة',       sub: 'أثر اللغة على نفسك وواقعك',      type: 'practical' as const },
    { href: '/programs/discipline',            label: 'الانضباط وبناء العادات',    sub: 'نظام عملي يصمد طويلاً',           type: 'practical' as const },
];

const PILLARS = [
    { label: 'الهدف',     value: 85, icon: '🎯' },
    { label: 'الهوية',    value: 62, icon: '🪞' },
    { label: 'العادات',   value: 40, icon: '⚙️' },
    { label: 'الإنتاج',   value: 70, icon: '🏗️' },
];

function FeaturedSuccessCard() {
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
                    '  rgba(80,25,0,0.92) 100%',
                    ')',
                ].join(''),
                boxShadow: [
                    '0 2px 0 rgba(255,255,255,0.22) inset',
                    `0 18px 52px ${C}38`,
                    '0 6px 22px rgba(0,0,0,0.18)',
                ].join(', '),
                minHeight: 148,
            }}
        >
            <motion.div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.18), transparent 68%)', filter: 'blur(14px)' }}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.08) 46%, transparent 67%)' }}
                animate={{ x: ['-130%', '130%'] }}
                transition={{ duration: 5, repeat: Infinity, repeatDelay: 4.5, ease: 'easeInOut' }} />
            <div className="absolute top-3 left-4 w-2.5 h-2.5 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.42)', filter: 'blur(1.5px)' }} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-amber-300"
                            animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
                        <span className="text-[8.5px] font-black text-amber-200/60 uppercase tracking-[0.16em]">
                            هندسة النجاح · Success Engineering
                        </span>
                    </div>
                    <Target className="w-5 h-5 text-amber-300/75" />
                </div>

                <h3 className="text-[21px] font-black text-white leading-tight tracking-tight mb-1.5"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.22)' }}>
                    هندسة حياتك
                </h3>
                <p className="text-[10.5px] text-white/55 leading-relaxed mb-4">
                    من الفوضى إلى النظام — منهج علمي مثبت
                </p>

                <AnimatePresence mode="wait">
                    {!revealed ? (
                        <motion.button key="reveal" exit={{ opacity: 0 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => { setRevealed(true); haptic.impact(); }}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-[12px]"
                            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.22)' }}>
                            <TrendingUp className="w-4 h-4 text-amber-300" />
                            <span className="text-[10px] font-black text-white">استعرض ركائز نجاحك</span>
                        </motion.button>
                    ) : (
                        <motion.div key="pillars" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-4 gap-2">
                            {PILLARS.map((p, i) => (
                                <div key={p.label} className="flex flex-col items-center gap-1">
                                    <div className="relative w-full">
                                        <div className="h-14 rounded-[8px] overflow-hidden flex flex-col-reverse"
                                            style={{ background: 'rgba(255,255,255,0.08)' }}>
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${p.value}%` }}
                                                transition={{ duration: 0.55, delay: 0.1 * i, ease: 'easeOut' }}
                                                style={{ background: `linear-gradient(to top, ${C}, ${CA})`, borderRadius: '0 0 8px 8px' }}
                                            />
                                        </div>
                                        <div className="absolute inset-x-0 top-0 flex items-center justify-center h-full">
                                            <span className="text-[12px] relative z-10">{p.icon}</span>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-bold text-amber-200/68">{p.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-4 pt-3.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                <span className="text-[9px] font-bold text-white/50">خطة ٤ ركائز متكاملة</span>
                <Link href="/programs/success-engineering" onClick={() => haptic.impact()}>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.22)' }}>
                        <span className="text-[9px] font-black text-white">ابدأ البرنامج</span>
                        <ArrowLeft className="w-3 h-3 text-white/75" />
                    </div>
                </Link>
            </div>
        </motion.div>
    );
}

export default function FikriPrograms() {
    const [open, setOpen] = useState(true);
    const rest = ITEMS.slice(1);
    return (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SP, delay: 0.06 }} className="mb-5">
            <motion.button className="w-full flex items-center gap-2.5 mb-3 px-1"
                whileTap={{ scale: 0.97 }}
                onClick={() => { setOpen(o => !o); haptic.selection(); }} aria-expanded={open}>
                <div className="w-[3.5px] h-[18px] rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(to bottom, ${C}, ${CA})` }} />
                <span className="text-[14px] leading-none flex-shrink-0">🏗️</span>
                <span className="text-[12.5px] font-black text-slate-700 flex-1 text-right tracking-tight">برامج هندسة العقل والنجاح</span>
                <span className="text-[7.5px] font-black px-1.5 py-[3px] rounded-full text-white"
                    style={{ background: `linear-gradient(135deg, ${C}, ${CA})`, boxShadow: `0 2px 6px ${C}30` }}>أدوات</span>
                <span className="text-[8px] font-black px-2 py-1 rounded-full mr-0.5"
                    style={{ background: `${C}12`, color: C, border: `1px solid ${C}20` }}>{ITEMS.length}</span>
                <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ ...SP, duration: 0.18 }}>
                    <ChevronDown className="w-4 h-4" style={{ color: C, opacity: 0.55 }} />
                </motion.div>
            </motion.button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div key="g" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={SP_SLOW} style={{ overflow: 'hidden' }}>
                        <FeaturedSuccessCard />
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

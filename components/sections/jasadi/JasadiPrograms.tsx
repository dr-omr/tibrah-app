'use client';
/**
 * JasadiPrograms.tsx — البرامج الجسدية
 * ─────────────────────────────────────
 * الحركة · التغذية · النوم · السوائل · الديتوكس
 *
 * ✦ إضافات الإتقان العالمي:
 *   ① Featured Program Card — "الحركة العلاجية" كبطاقة hero كاملة
 *   ② Progress pips — 6 نقاط تمثل أيام الأسبوع
 *   ③ Motivational streak — "٣ أيام متتالية"
 */

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, Flame, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { ServiceTile } from '@/components/sections/ServiceTile';
import { SP, SP_SLOW } from '@/components/sections/section-shared';

const COLOR     = '#0D9488';
const COLOR_ALT = '#059669';

export const JASADI_PROGRAMS_ITEMS = [
    { href: '/programs/movement',   label: 'الحركة العلاجية',       sub: 'رياضة حسب حالتك الصحية تحديداً', type: 'practical' as const },
    { href: '/programs/nutrition',  label: 'الأكل العلاجي',          sub: 'تغذية حسب المرض والهدف',         type: 'practical' as const },
    { href: '/programs/hydration',  label: 'السوائل والدعم العشبي',  sub: 'مشروبات وأعشاب حسب مشكلتك',     type: 'practical' as const },
    { href: '/programs/sleep',      label: 'النوم العلاجي',           sub: 'بروتوكولات الأرق والإرهاق',      type: 'practical' as const },
    { href: '/meal-planner',        label: 'مخطط الوجبات',           sub: 'خطة غذائية أسبوعية مخصصة',       type: 'practical' as const },
    { href: '/programs/detox',      label: 'برنامج إعادة الضبط',     sub: 'ديتوكس جسدي ٢١ يوماً',           badge: 'قريباً', type: 'paid' as const },
];

/* 7-day streak pips (dummy demo) */
const WEEK_DAYS = ['س', 'أ', 'ث', 'ر', 'خ', 'ج', 'ح'];
const DONE_DAYS = [0, 1, 2]; // أول 3 أيام مكتملة

function FeaturedProgramCard() {
    return (
        <Link href="/programs/movement" onClick={() => haptic.impact()}>
            <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...SP, delay: 0.04 }}
                whileTap={{ scale: 0.968, rotate: -0.3 }}
                className="relative overflow-hidden rounded-[24px] mb-3 p-5"
                style={{
                    background: [
                        'linear-gradient(148deg,',
                        '  rgba(255,255,255,0.90) 0%,',
                        '  rgba(255,255,255,0.82) 50%,',
                        `  ${COLOR}0F 100%`,
                        ')',
                    ].join(''),
                    border: '1px solid rgba(255,255,255,0.82)',
                    borderTop: '1px solid rgba(255,255,255,0.96)',
                    backdropFilter: 'blur(40px) saturate(2)',
                    WebkitBackdropFilter: 'blur(40px) saturate(2)',
                    boxShadow: [
                        '0 2px 0 rgba(255,255,255,0.95) inset',
                        `0 16px 48px ${COLOR}18`,
                        '0 4px 18px rgba(0,0,0,0.07)',
                    ].join(', '),
                    minHeight: 130,
                }}
            >
                {/* Color pool top-right */}
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${COLOR}20, transparent 70%)`, filter: 'blur(12px)' }} />
                {/* Bubble */}
                <div className="absolute top-3 left-4 w-2.5 h-2.5 rounded-full pointer-events-none"
                    style={{ background: 'rgba(255,255,255,0.72)', filter: 'blur(1px)' }} />
                {/* Shimmer */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(110deg, transparent 28%, rgba(255,255,255,0.32) 48%, transparent 68%)' }}
                    animate={{ x: ['-140%', '140%'] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
                />

                <div className="relative z-10">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[18px] leading-none">🏃</span>
                            <div>
                                <p className="text-[13px] font-black text-slate-800 leading-tight">الحركة العلاجية</p>
                                <p className="text-[9px] text-slate-400 leading-tight">مخصصة لحالتك الصحية تماماً</p>
                            </div>
                        </div>
                        {/* Streak badge */}
                        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
                            style={{ background: `${COLOR}12`, border: `1px solid ${COLOR}22` }}>
                            <Flame className="w-3 h-3" style={{ color: '#F97316' }} />
                            <span className="text-[9px] font-black" style={{ color: COLOR }}>٣ أيام</span>
                        </div>
                    </div>

                    {/* Week progress pips */}
                    <div className="flex items-center gap-1.5 mb-3.5">
                        {WEEK_DAYS.map((d, i) => (
                            <div key={d} className="flex flex-col items-center gap-[3px] flex-1">
                                <div className="w-full h-[5px] rounded-full overflow-hidden"
                                    style={{ background: DONE_DAYS.includes(i) ? `${COLOR}` : `${COLOR}20` }}>
                                    {DONE_DAYS.includes(i) && (
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 0.5, delay: 0.1 * i }}
                                            className="h-full rounded-full"
                                            style={{ background: 'rgba(255,255,255,0.45)' }}
                                        />
                                    )}
                                </div>
                                <span className="text-[7px] font-bold"
                                    style={{ color: DONE_DAYS.includes(i) ? COLOR : '#CBD5E1' }}>
                                    {d}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: COLOR }} />
                            <span className="text-[9px] font-bold text-slate-500">متقدم على هدفك الأسبوعي</span>
                        </div>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                            style={{ background: `${COLOR}`, boxShadow: `0 4px 14px ${COLOR}38` }}>
                            <span className="text-[9px] font-black text-white">ابدأ اليوم</span>
                            <ArrowLeft className="w-3 h-3 text-white/80" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

export default function JasadiPrograms() {
    const [open, setOpen] = useState(true);
    const restItems = JASADI_PROGRAMS_ITEMS.slice(1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SP, delay: 0.06 }}
            className="mb-5"
        >
            <motion.button
                className="w-full flex items-center gap-2.5 mb-3 px-1"
                whileTap={{ scale: 0.97 }}
                onClick={() => { setOpen(o => !o); haptic.selection(); }}
                aria-expanded={open}
            >
                <div className="w-[3.5px] h-[18px] rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(to bottom, ${COLOR}, ${COLOR_ALT})` }} />
                <span className="text-[14px] leading-none flex-shrink-0">💪</span>
                <span className="text-[12.5px] font-black text-slate-700 flex-1 text-right tracking-tight">
                    البرامج الجسدية
                </span>
                <span className="text-[7.5px] font-black px-1.5 py-[3px] rounded-full text-white"
                    style={{ background: `linear-gradient(135deg, ${COLOR}, ${COLOR_ALT})`, boxShadow: `0 2px 6px ${COLOR}30` }}>
                    أدوات
                </span>
                <span className="text-[8px] font-black px-2 py-1 rounded-full mr-0.5"
                    style={{ background: `${COLOR}12`, color: COLOR, border: `1px solid ${COLOR}20` }}>
                    {JASADI_PROGRAMS_ITEMS.length}
                </span>
                <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ ...SP, duration: 0.18 }}>
                    <ChevronDown className="w-4 h-4" style={{ color: COLOR, opacity: 0.55 }} />
                </motion.div>
            </motion.button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="grid"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={SP_SLOW}
                        style={{ overflow: 'hidden' }}
                    >
                        {/* Featured */}
                        <FeaturedProgramCard />

                        {/* Rest 2-col */}
                        <div className="grid gap-2.5"
                            style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
                            {restItems.map((item, i) => (
                                <ServiceTile key={item.href + item.label} item={item} color={COLOR} colorAlt={COLOR_ALT} index={i + 1} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

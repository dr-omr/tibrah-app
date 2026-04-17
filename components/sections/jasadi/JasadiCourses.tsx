'use client';
/**
 * JasadiCourses.tsx — الكورسات الجسدية المدفوعة
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ✦ إضافات الإتقان العالمي:
 *   ① Premium Showcase — بطاقة VIP بطابور انتظار
 *   ② كل كورس له lock overlay + قفل بنفسجي
 *   ③ Upgrade CTA زجاجية ذهبية في الأسفل
 */

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, GraduationCap, Lock, Star, ArrowLeft, Crown } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { ServiceTile } from '@/components/sections/ServiceTile';
import { SP, SP_SLOW } from '@/components/sections/section-shared';

const COLOR     = '#0D9488';
const COLOR_ALT = '#059669';

export const JASADI_COURSES_ITEMS = [
    { href: '/courses/reset-body',          label: 'كورس إعادة ضبط الجسد',     sub: 'تحول جسدي كامل في ٤٠ يوماً',  badge: '👑 VIP',  type: 'paid' as const },
    { href: '/courses/sleep-energy',        label: 'كورس النوم والطاقة',         sub: 'حل أرق وإرهاق مزمن نهائياً', badge: 'مميز',    type: 'paid' as const },
    { href: '/courses/healing-nutrition',   label: 'كورس التغذية العلاجية',     sub: 'أكل كدواء — بروتوكول متكامل', badge: 'جديد', isNew: true, type: 'paid' as const },
    { href: '/courses/understand-symptoms', label: 'كورس فهم أعراضك',           sub: 'قبل الطبيب — افهم جسدك',       type: 'paid' as const },
];

/* ─── Premium Showcase ──────────────────────── */
function PremiumShowcase() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SP, delay: 0.04 }}
            className="relative overflow-hidden rounded-[24px] mb-3 p-5"
            style={{
                background: 'linear-gradient(148deg, rgba(15,10,40,0.94) 0%, rgba(30,15,60,0.90) 55%, rgba(20,5,30,0.95) 100%)',
                border: '1px solid rgba(167,139,250,0.22)',
                borderTop: '1px solid rgba(192,132,252,0.35)',
                boxShadow: [
                    '0 2px 0 rgba(192,132,252,0.16) inset',
                    '0 18px 48px rgba(124,58,237,0.28)',
                    '0 4px 18px rgba(0,0,0,0.35)',
                ].join(', '),
            }}
        >
            {/* Star dust */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: 2 + (i % 3),
                        height: 2 + (i % 3),
                        top: `${10 + i * 15}%`,
                        right: `${8 + i * 12}%`,
                        background: `rgba(192,132,252,${0.3 + i * 0.08})`,
                    }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.8 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                />
            ))}
            {/* Shimmer */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(192,132,252,0.08) 48%, transparent 68%)' }}
                animate={{ x: ['-130%', '130%'] }}
                transition={{ duration: 5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
            />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Crown className="w-3 h-3 text-amber-400" />
                            <span className="text-[8.5px] font-black text-purple-300 uppercase tracking-[0.18em]">Premium · كورسات VIP</span>
                        </div>
                        <h3 className="text-[18px] font-black text-white leading-tight">
                            اشترك في طِبرَا
                        </h3>
                        <p className="text-[10px] text-purple-200/60 mt-0.5">
                            وصول فوري لكل الكورسات الجسدية
                        </p>
                    </div>
                    <motion.div
                        animate={{ rotate: [0, 10, 0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="text-[32px] leading-none select-none"
                    >
                        👑
                    </motion.div>
                </div>

                {/* Course list preview */}
                <div className="flex flex-col gap-1.5 mb-4">
                    {JASADI_COURSES_ITEMS.slice(0, 3).map((c, i) => (
                        <motion.div
                            key={c.href}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.08 + i * 0.06 }}
                            className="flex items-center gap-2"
                        >
                            <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            <span className="text-[10px] font-bold text-white/70">{c.label}</span>
                        </motion.div>
                    ))}
                    <p className="text-[9px] text-purple-400/60 pr-5">+ كورس رابع وأكثر قريباً...</p>
                </div>

                {/* CTA */}
                <Link href="/premium" onClick={() => haptic.impact()}>
                    <motion.div
                        whileTap={{ scale: 0.96 }}
                        className="flex items-center justify-between px-4 py-3 rounded-[14px]"
                        style={{
                            background: 'linear-gradient(135deg, rgba(167,139,250,0.28), rgba(124,58,237,0.22))',
                            border: '1px solid rgba(167,139,250,0.30)',
                        }}
                    >
                        <span className="text-[12px] font-black text-white">ابدأ عضويتك الآن</span>
                        <ArrowLeft className="w-4 h-4 text-purple-300" />
                    </motion.div>
                </Link>
            </div>
        </motion.div>
    );
}

/* ─── Upgrade CTA footer card ───────────────── */
const UpgradeCTA = (
    <Link href="/premium" onClick={() => haptic.impact()}>
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-[18px]"
            style={{
                background: 'linear-gradient(145deg, rgba(217,119,6,0.08) 0%, rgba(255,255,255,0.82) 50%, rgba(217,119,6,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(217,119,6,0.18)',
                borderTop: '1px solid rgba(255,255,255,0.88)',
                boxShadow: '0 1.5px 0 rgba(255,255,255,0.92) inset',
            }}>
            <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.20)' }}>
                <GraduationCap className="w-5 h-5" style={{ color: '#D97706' }} />
            </div>
            <div className="flex-1">
                <p className="text-[12px] font-black text-slate-800">اشترك للوصول لجميع الكورسات</p>
                <p className="text-[9px] text-slate-400 mt-0.5">عضوية طِبرَا تتضمن كل الكورسات الجسدية</p>
            </div>
            <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
        </div>
    </Link>
);

/* ═════════════════════════════════════════════════════════════
   MAIN
═════════════════════════════════════════════════════════════ */
export default function JasadiCourses() {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SP, delay: 0.24 }}
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
                <span className="text-[14px] leading-none flex-shrink-0">🎓</span>
                <span className="text-[12.5px] font-black text-slate-700 flex-1 text-right tracking-tight">
                    كورسات جسدية مدفوعة
                </span>
                <span className="text-[7.5px] font-black px-1.5 py-[3px] rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', boxShadow: '0 2px 6px rgba(217,119,6,0.35)' }}>
                    👑 Premium
                </span>
                <span className="text-[8px] font-black px-2 py-1 rounded-full mr-0.5"
                    style={{ background: `${COLOR}12`, color: COLOR, border: `1px solid ${COLOR}20` }}>
                    {JASADI_COURSES_ITEMS.length}
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
                        {/* Premium showcase */}
                        <PremiumShowcase />

                        {/* Course tiles */}
                        <div className="grid gap-2.5 mb-3"
                            style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
                            {JASADI_COURSES_ITEMS.map((item, i) => (
                                <ServiceTile key={item.href} item={item} color={COLOR} colorAlt={COLOR_ALT} index={i} />
                            ))}
                        </div>

                        {/* Upgrade CTA */}
                        {UpgradeCTA}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

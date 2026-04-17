'use client';
/**
 * JasadiTools.tsx — الأدوات اليومية الجسدية
 * ─────────────────────────────────────────
 * ✦ إضافات الإتقان العالمي:
 *   ① Daily Check-in Card — "كيف تشعر اليوم؟" بطاقة شعور مائية
 *   ② شبكة الأدوات كاملة بدون حذف
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Activity, TrendingUp } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { ServiceTile } from '@/components/sections/ServiceTile';
import { SP, SP_SLOW } from '@/components/sections/section-shared';

const COLOR     = '#0D9488';
const COLOR_ALT = '#059669';

export const JASADI_TOOLS_ITEMS = [
    { href: '/health-tracker',  label: 'متابعة الصحة',     sub: 'مؤشراتك اليومية كاملة',         type: 'practical' as const },
    { href: '/record-health',   label: 'تسجيل القراءات',   sub: 'وزن، ضغط، سكر، ترطيب',         type: 'practical' as const },
    { href: '/daily-log',       label: 'السجل اليومي',     sub: 'دوّن يومك الصحي بتفصيل',        type: 'practical' as const },
    { href: '/quick-check-in',  label: 'الفحص السريع',     sub: 'كيف تشعر الآن؟ — ٢ دقيقة',     type: 'diagnostic' as const },
    { href: '/smart-pharmacy',  label: 'الصيدلية الذكية',  sub: 'مكملات بتوصية طبية لحالتك',     isNew: true, type: 'practical' as const },
];

/* ─── Mood emojis ────────────────────────────── */
const MOODS = [
    { emoji: '😔', label: 'سيئ',    value: 1 },
    { emoji: '😐', label: 'عادي',   value: 2 },
    { emoji: '🙂', label: 'جيد',    value: 3 },
    { emoji: '😊', label: 'بخير',   value: 4 },
    { emoji: '🤩', label: 'ممتاز', value: 5 },
];

function DailyCheckInCard() {
    const [selected, setSelected] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSelect = (v: number) => {
        setSelected(v);
        haptic.tap();
        setTimeout(() => setSubmitted(true), 500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SP, delay: 0.04 }}
            className="relative overflow-hidden rounded-[22px] mb-3 p-4"
            style={{
                background: [
                    'linear-gradient(148deg,',
                    `  ${COLOR}12 0%,`,
                    '  rgba(255,255,255,0.88) 40%,',
                    '  rgba(255,255,255,0.78) 70%,',
                    `  ${COLOR_ALT}0A 100%`,
                    ')',
                ].join(''),
                border: '1px solid rgba(255,255,255,0.72)',
                borderTop: '1px solid rgba(255,255,255,0.94)',
                backdropFilter: 'blur(36px) saturate(2)',
                WebkitBackdropFilter: 'blur(36px) saturate(2)',
                boxShadow: [
                    '0 2px 0 rgba(255,255,255,0.95) inset',
                    `0 12px 36px ${COLOR}14`,
                    '0 3px 12px rgba(0,0,0,0.06)',
                ].join(', '),
            }}
        >
            {/* Bubble */}
            <div className="absolute top-2.5 left-3.5 w-2 h-2 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.65)', filter: 'blur(1px)' }} />
            {/* Color pool */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${COLOR}18, transparent 70%)`, filter: 'blur(10px)' }} />

            <AnimatePresence mode="wait">
                {!submitted ? (
                    <motion.div key="ask" exit={{ opacity: 0, y: -8 }} className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Activity className="w-4 h-4 flex-shrink-0" style={{ color: COLOR }} />
                            <p className="text-[12px] font-black text-slate-700">كيف تشعر اليوم؟</p>
                            <span className="mr-auto text-[8px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: `${COLOR}10`, color: COLOR }}>
                                الفحص السريع
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                            {MOODS.map((m) => (
                                <motion.button
                                    key={m.value}
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => handleSelect(m.value)}
                                    className="flex flex-col items-center gap-1 flex-1 py-2 rounded-[12px]"
                                    style={{
                                        background: selected === m.value ? `${COLOR}18` : 'transparent',
                                        border: selected === m.value ? `1.5px solid ${COLOR}35` : '1.5px solid transparent',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <span className="text-[20px] leading-none">{m.emoji}</span>
                                    <span className="text-[7.5px] font-bold text-slate-400">{m.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 flex items-center gap-3 py-1"
                    >
                        <span className="text-[28px]">{MOODS.find(m => m.value === selected)?.emoji}</span>
                        <div>
                            <p className="text-[12px] font-black text-slate-800">تم تسجيل حالتك اليوم ✓</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">سيُحلّل الذكاء الاصطناعي أنماطك يومياً</p>
                        </div>
                        <Link href="/health-tracker" onClick={() => haptic.tap()} className="mr-auto">
                            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
                                style={{ background: `${COLOR}14`, border: `1px solid ${COLOR}22` }}>
                                <TrendingUp className="w-3 h-3" style={{ color: COLOR }} />
                                <span className="text-[8.5px] font-black" style={{ color: COLOR }}>التفاصيل</span>
                            </div>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function JasadiTools() {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SP, delay: 0.12 }}
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
                <span className="text-[14px] leading-none flex-shrink-0">📊</span>
                <span className="text-[12.5px] font-black text-slate-700 flex-1 text-right tracking-tight">
                    الأدوات اليومية
                </span>
                <span className="text-[7.5px] font-black px-1.5 py-[3px] rounded-full text-white"
                    style={{ background: `linear-gradient(135deg, ${COLOR}, ${COLOR_ALT})`, boxShadow: `0 2px 6px ${COLOR}30` }}>
                    أدوات
                </span>
                <span className="text-[8px] font-black px-2 py-1 rounded-full mr-0.5"
                    style={{ background: `${COLOR}12`, color: COLOR, border: `1px solid ${COLOR}20` }}>
                    {JASADI_TOOLS_ITEMS.length}
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
                        {/* Interactive daily check-in */}
                        <DailyCheckInCard />

                        {/* All tools 2-col */}
                        <div className="grid gap-2.5"
                            style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
                            {JASADI_TOOLS_ITEMS.map((item, i) => (
                                <ServiceTile key={item.href} item={item} color={COLOR} colorAlt={COLOR_ALT} index={i} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

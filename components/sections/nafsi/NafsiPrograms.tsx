'use client';
/**
 * NafsiPrograms.tsx — برامج تنظيم وتحرير المشاعر
 * ──────────────────────────────────────────────────
 * ✦ Featured: تحرير الخوف — CBT + Somatic + Breathwork
 * ✦ Emotion wheel visual + 6 برامج
 */
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Wind, ArrowLeft, Zap } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { ServiceTile } from '@/components/sections/ServiceTile';
import { SP, SP_SLOW } from '@/components/sections/section-shared';

const C  = '#7C3AED';
const CA = '#6D28D9';

const ITEMS = [
    { href: '/programs/emotions/fear',  label: 'تحرير الخوف',              sub: 'CBT + Somatic + Breathwork',   type: 'practical' as const },
    { href: '/programs/emotions/anger', label: 'إدارة الغضب',              sub: 'تنظيم عاطفي عميق',            type: 'practical' as const },
    { href: '/programs/emotions/grief', label: 'معالجة الحزن والفقد',       sub: 'بروتوكول شفاء الخسارة',        type: 'practical' as const },
    { href: '/programs/emotions/guilt', label: 'تحرير الذنب والعار',        sub: 'إعادة بناء قيمة الذات',        type: 'practical' as const },
    { href: '/programs/mind-body',      label: 'النفس–جسد',                sub: 'كيف تتحول المشاعر لأعراض',     isNew: true, type: 'practical' as const },
    { href: '/programs/relationships',  label: 'صحة العلاقات',              sub: 'الحدود · التعلّق · التواصل',   type: 'practical' as const },
];

/* Emotional release steps */
const RELEASE_STEPS = [
    { emoji: '😨', label: 'المشعور', color: '#A78BFA' },
    { emoji: '🔍', label: 'الجذر',   color: '#818CF8' },
    { emoji: '🌬️', label: 'التحرير', color: '#60A5FA' },
    { emoji: '☀️', label: 'الحرية',  color: '#34D399' },
];

function FeaturedEmotionReleaseCard() {
    return (
        <Link href="/programs/emotions/fear" onClick={() => haptic.impact()}>
            <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...SP, delay: 0.04 }}
                whileTap={{ scale: 0.968, rotate: -0.3 }}
                className="relative overflow-hidden rounded-[24px] mb-3 p-5"
                style={{
                    background: [
                        'linear-gradient(148deg,',
                        `  ${C}E8 0%,`,
                        `  ${CA}D5 55%,`,
                        '  rgba(35,10,75,0.92) 100%',
                        ')',
                    ].join(''),
                    boxShadow: [
                        '0 2px 0 rgba(255,255,255,0.18) inset',
                        `0 18px 52px ${C}3E`,
                        '0 6px 22px rgba(0,0,0,0.20)',
                    ].join(', '),
                    minHeight: 140,
                }}
            >
                {/* Large breath circle */}
                <motion.div
                    className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.18), transparent 68%)', filter: 'blur(16px)' }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Shimmer */}
                <motion.div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.08) 47%, transparent 67%)' }}
                    animate={{ x: ['-130%', '130%'] }}
                    transition={{ duration: 5, repeat: Infinity, repeatDelay: 4.5, ease: 'easeInOut' }} />
                <div className="absolute top-3 left-4 w-2.5 h-2.5 rounded-full pointer-events-none"
                    style={{ background: 'rgba(255,255,255,0.38)', filter: 'blur(1.5px)' }} />

                <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-3">
                        <Wind className="w-3.5 h-3.5 text-purple-300" />
                        <span className="text-[8.5px] font-black text-purple-200/60 uppercase tracking-[0.16em]">
                            تحرير المشاعر · Emotional Release
                        </span>
                    </div>
                    <h3 className="text-[21px] font-black text-white leading-tight tracking-tight mb-1.5"
                        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.24)' }}>
                        تحرير الخوف
                    </h3>
                    <p className="text-[10.5px] text-white/55 leading-relaxed mb-4">
                        منهج متكامل: تحديد الجذر، معالجة الجسد، تحرير العقل
                    </p>

                    {/* Release journey */}
                    <div className="flex items-center gap-1.5">
                        {RELEASE_STEPS.map((s, i) => (
                            <React.Fragment key={s.label}>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                        style={{ background: `${s.color}20`, border: `1px solid ${s.color}35` }}>
                                        <span className="text-[14px] leading-none">{s.emoji}</span>
                                    </div>
                                    <span className="text-[7.5px] font-black" style={{ color: s.color }}>{s.label}</span>
                                </div>
                                {i < RELEASE_STEPS.length - 1 && (
                                    <div className="flex-1 h-px mt-[-10px]"
                                        style={{ background: `linear-gradient(to right, ${s.color}40, ${RELEASE_STEPS[i+1].color}40)` }} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between mt-4 pt-3.5"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                    <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-purple-300" />
                        <span className="text-[9px] font-bold text-white/55">١٢ جلسة مرتبة سرياً</span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)' }}>
                        <span className="text-[9px] font-black text-white">ابدأ البرنامج</span>
                        <ArrowLeft className="w-3 h-3 text-white/75" />
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

export default function NafsiPrograms() {
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
                <span className="text-[14px] leading-none flex-shrink-0">💜</span>
                <span className="text-[12.5px] font-black text-slate-700 flex-1 text-right tracking-tight">تنظيم وتحرير المشاعر</span>
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
                        <FeaturedEmotionReleaseCard />
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

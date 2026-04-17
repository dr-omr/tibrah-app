'use client';
/**
 * JasadiDiagnosis.tsx — التشخيص الجسدي
 * ─────────────────────────────────────
 * المحرك السريري: أعراض → تشخيص احتمالي → خطة أولية
 * Section Type: 🔬 diagnostic
 *
 * إضافات الإتقان العالمي:
 *   ① Featured Hero Card — مدقق الأعراض بعرض كامل + aurora + shimmer
 *   ② Flow steps — مسار التشخيص السريري 3-step
 *   ③ شبكة الخدمات المتبقية (بدون البطاقة الرئيسية)
 */

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, Stethoscope, ArrowLeft, Zap } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { ServiceTile } from '@/components/sections/ServiceTile';
import { SP, SP_SLOW } from '@/components/sections/section-shared';

const COLOR     = '#0D9488';
const COLOR_ALT = '#059669';

export const JASADI_DIAGNOSIS_ITEMS = [
    { href: '/symptom-checker',     label: 'مدقق الأعراض الذكي',    sub: 'محرك فرز سريري SOCRATES — AI', badge: 'رئيسي', type: 'diagnostic' as const },
    { href: '/intake',              label: 'الاستبيان الأولي الشامل', sub: 'تاريخ مرضي كامل + نظم الجسد',  type: 'diagnostic' as const },
    { href: '/body-map',            label: 'خريطة الجسم',             sub: 'حدد موقع الألم بدقة تشريحية',  type: 'diagnostic' as const },
    { href: '/medical-history',     label: 'التاريخ الطبي',           sub: 'تاريخ مرضي، دوائي، عائلي',     type: 'diagnostic' as const },
    { href: '/diagnosis/face-scan', label: 'مسح الوجه الذكي',        sub: 'تشخيص بصري بالكاميرا',          badge: 'جديد', isNew: true, type: 'diagnostic' as const },
    { href: '/health-report',       label: 'التقرير الصحي الشامل',   sub: 'تحليل دوري + توصيات PDF',       type: 'diagnostic' as const },
];

/* ─── مسار التشخيص السريري ─────────────────────── */
const FLOW_STEPS = [
    { emoji: '📋', label: 'الأعراض' },
    { emoji: '🔬', label: 'التحليل' },
    { emoji: '📊', label: 'التقرير' },
];

/* ═════════════════════════════════════════════════════════════
   FEATURED HERO CARD — بطاقة كبيرة لمدقق الأعراض
═════════════════════════════════════════════════════════════ */
function FeaturedDiagnosticCard() {
    return (
        <Link href="/symptom-checker" onClick={() => haptic.impact()}>
            <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...SP, delay: 0.04 }}
                whileTap={{ scale: 0.968, rotate: -0.3 }}
                className="relative overflow-hidden rounded-[24px] mb-3 p-5"
                style={{
                    /* Rich teal gradient */
                    background: [
                        'linear-gradient(148deg,',
                        `  ${COLOR}F0 0%,`,
                        `  ${COLOR_ALT}E0 55%,`,
                        '  rgba(5,100,60,0.90) 100%',
                        ')',
                    ].join(''),
                    boxShadow: [
                        '0 2px 0 rgba(255,255,255,0.25) inset',
                        `0 18px 52px ${COLOR}44`,
                        '0 6px 24px rgba(0,0,0,0.16)',
                    ].join(', '),
                    minHeight: 138,
                }}
            >
                {/* Aurora orb */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, rgba(255,255,255,0.16), transparent 65%)`, filter: 'blur(14px)' }} />
                {/* Bottom ambient */}
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, rgba(0,0,0,0.15), transparent 70%)`, filter: 'blur(10px)' }} />
                {/* Liquid shimmer */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.10) 46%, rgba(255,255,255,0.03) 54%, transparent 75%)' }}
                    animate={{ x: ['-130%', '130%'] }}
                    transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                />
                {/* Specular top-left bubble */}
                <div className="absolute top-3 left-4 w-3 h-3 rounded-full pointer-events-none"
                    style={{ background: 'rgba(255,255,255,0.45)', filter: 'blur(1.5px)' }} />
                <div className="absolute top-5 left-7 w-1.5 h-1.5 rounded-full pointer-events-none"
                    style={{ background: 'rgba(255,255,255,0.28)' }} />

                {/* Content */}
                <div className="relative z-10 flex items-start justify-between">
                    <div className="flex-1">
                        {/* Badge */}
                        <div className="flex items-center gap-1.5 mb-3">
                            <motion.div
                                animate={{ opacity: [1, 0.45, 1] }}
                                transition={{ duration: 1.8, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-emerald-300"
                            />
                            <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.16em]">
                                تشخيص ذكي · SOCRATES Engine
                            </span>
                        </div>

                        <h3 className="text-[22px] font-black text-white leading-tight tracking-tight mb-1.5"
                            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.18)' }}>
                            مدقق الأعراض الذكي
                        </h3>
                        <p className="text-[11px] text-white/62 leading-relaxed mb-4 max-w-[200px]">
                            أدخل أعراضك — يُحلّلها بمنطق الطبيب السريري
                        </p>

                        {/* Flow steps */}
                        <div className="flex items-center gap-1.5">
                            {FLOW_STEPS.map((s, i) => (
                                <React.Fragment key={s.label}>
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full"
                                        style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)' }}>
                                        <span className="text-[10px]">{s.emoji}</span>
                                        <span className="text-[8.5px] font-black text-white/80">{s.label}</span>
                                    </div>
                                    {i < FLOW_STEPS.length - 1 && (
                                        <ArrowLeft className="w-2.5 h-2.5 text-white/35 flex-shrink-0" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* CTA icon */}
                    <motion.div
                        animate={{ y: [0, -3, 0], scale: [1, 1.04, 1] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0 mr-4"
                        style={{
                            background: 'rgba(255,255,255,0.18)',
                            border: '1px solid rgba(255,255,255,0.28)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 2px 0 rgba(255,255,255,0.20) inset',
                        }}
                    >
                        {/* inner specular */}
                        <div className="absolute top-1.5 left-2 w-1.5 h-1.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.50)' }} />
                        <Stethoscope className="w-7 h-7 text-white/90" />
                    </motion.div>
                </div>

                {/* Bottom CTA strip */}
                <div className="relative z-10 flex items-center justify-between mt-4 pt-3.5"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.14)' }}>
                    <div className="flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-yellow-300" />
                        <span className="text-[9px] font-black text-white/70">متوسط وقت التشخيص: ٥ دقائق</span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }}>
                        <span className="text-[9px] font-black text-white">ابدأ الآن</span>
                        <ArrowLeft className="w-3 h-3 text-white/80" />
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

/* ═════════════════════════════════════════════════════════════
   MAIN EXPORT
═════════════════════════════════════════════════════════════ */
export default function JasadiDiagnosis() {
    const [open, setOpen] = useState(true);

    /* الخدمات الأخرى (بدون مدقق الأعراض — تظهر كـ Featured Card) */
    const restItems = JASADI_DIAGNOSIS_ITEMS.slice(1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SP, delay: 0 }}
            className="mb-5"
        >
            {/* ── Section Header ── */}
            <motion.button
                className="w-full flex items-center gap-2.5 mb-3 px-1"
                whileTap={{ scale: 0.97 }}
                onClick={() => { setOpen(o => !o); haptic.selection(); }}
                aria-expanded={open}
            >
                <div className="w-[3.5px] h-[18px] rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(to bottom, ${COLOR}, ${COLOR_ALT})` }} />
                <span className="text-[14px] leading-none flex-shrink-0">🔬</span>
                <span className="text-[12.5px] font-black text-slate-700 flex-1 text-right tracking-tight">
                    التشخيص الجسدي
                </span>
                {/* type tag */}
                <span className="text-[7.5px] font-black px-1.5 py-[3px] rounded-full text-white"
                    style={{ background: `linear-gradient(135deg, ${COLOR}, ${COLOR_ALT})`, boxShadow: `0 2px 6px ${COLOR}30` }}>
                    تشخيص
                </span>
                <span className="text-[8px] font-black px-2 py-1 rounded-full mr-0.5"
                    style={{ background: `${COLOR}12`, color: COLOR, border: `1px solid ${COLOR}20` }}>
                    {JASADI_DIAGNOSIS_ITEMS.length}
                </span>
                <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ ...SP, duration: 0.18 }}>
                    <ChevronDown className="w-4 h-4" style={{ color: COLOR, opacity: 0.55 }} />
                </motion.div>
            </motion.button>

            {/* ── Grid ── */}
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
                        {/* ① Featured Hero Card */}
                        <FeaturedDiagnosticCard />

                        {/* ② Remaining 2-col grid */}
                        <div className="grid gap-2.5"
                            style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
                            {restItems.map((item, i) => (
                                <ServiceTile
                                    key={item.href + item.label}
                                    item={item}
                                    color={COLOR}
                                    colorAlt={COLOR_ALT}
                                    index={i + 1}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// components/home/visitor/VisitorSmartGuide.tsx — Sprint 6
// ═══════════════════════════════════════════════════════════════════
// 4-STEP VISUAL FLOW — بدل البطاقات القديمة
// المنطق: الـ flow يحكم، الروابط القديمة تبقى كاختصارات ثانوية فقط.
//
// التصميم:
//   4 خطوات رأسية متصلة بخط — كل خطوة تجيب على 3 أسئلة:
//   ① ما الذي يحدث؟  ② لماذا هذا مفيد؟  ③ ما النتيجة المتوقعة؟
//
// الـ language يجب أن تبقى بشرية:
//   نفهم حالتك / نحدد المسار / نبدأ خطة / نتابع تقدمك
//   (لا routing/subdomain/protocol في هذه الصفحة للزائر)
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, HeartPulse, Brain, ClipboardList } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { createPageUrl } from '@/utils';

/* ── Design tokens ───────────────────────────────────────────── */
const ACCENT  = '#0D9488';
const INK     = '#0F172A';
const SUB     = '#475569';
const MUTED   = '#94A3B8';
const CANVAS  = '#F0FAF8';
const GLASS   = 'rgba(255,255,255,0.82)';
const BLUR    = 'blur(28px) saturate(180%)';
const BORDER  = 'rgba(255,255,255,0.88)';
const SHADOW  = '0 2px 0 rgba(255,255,255,1) inset, 0 6px 24px rgba(15,23,42,0.08)';

const SP = { type: 'spring' as const, stiffness: 480, damping: 34 };

/* ── 4-Step data ─────────────────────────────────────────────── */
interface Step {
    num: number;
    emoji: string;
    title: string;
    why: string;
    outcome: string;
    accent: string;
    href: string;
    cta: string;
}

const STEPS: Step[] = [
    {
        num: 1,
        emoji: '🩺',
        title: 'ابدأ تقييمك',
        why: 'نصغي لأعراضك — جسدية ونفسية — في 5 دقائق فقط',
        outcome: 'صورة أولية واضحة عما يحدث في جسمك فعلاً',
        accent: ACCENT,
        href: '/symptom-checker',
        cta: 'ابدأ التقييم',
    },
    {
        num: 2,
        emoji: '🧭',
        title: 'نفهم حالتك',
        why: 'نحلل نمطك ونحدد الأولوية: أين الجذر الحقيقي للمشكلة؟',
        outcome: 'رؤية واضحة للمحاور التي تحتاج اهتماماً — بدون تخمين',
        accent: '#6D4AFF',
        href: '/symptom-checker',
        cta: 'شاهد مثالاً',
    },
    {
        num: 3,
        emoji: '📋',
        title: 'نبدأ خطة واضحة',
        why: 'خطة يومية مخصصة لأعراضك — تعرف بالضبط ماذا تفعل كل يوم',
        outcome: '7 أيام من الخطوات العملية — قابلة للمتابعة والقياس',
        accent: '#D97706',
        href: '/my-plan',
        cta: 'استعرض خطتي',
    },
    {
        num: 4,
        emoji: '📈',
        title: 'نتابع تقدمك',
        why: 'نقيس التحسّن يومياً — ونوجّهك للخطوة التالية بناءً على نتائجك',
        outcome: 'إذا تحسّنت: نكمل. إذا احتجت أكثر: نوصلك للطبيب مباشرة',
        accent: '#0EA5E9',
        href: createPageUrl('BookAppointment'),
        cta: 'احجز متابعة',
    },
];

/* ── Quick links (secondary) ───────────────────────────────── */
const QUICK_LINKS = [
    { emoji: '🔍', label: 'أفحص أعراضي',          href: '/symptom-checker',         accent: ACCENT },
    { emoji: '💭', label: 'أفهم حالتي النفسية',    href: '/emotional-medicine',       accent: '#6D4AFF' },
    { emoji: '📋', label: 'أريد خطة علاجية',       href: createPageUrl('BookAppointment'), accent: '#D97706' },
];

/* ── StepCard component ─────────────────────────────────────── */
function StepCard({ step, index, isLast }: { step: Step; index: number; isLast: boolean }) {
    const [tapped, setTapped] = useState(false);

    return (
        <div className="relative flex gap-4">
            {/* ── Connector line on the left ── */}
            <div className="flex flex-col items-center flex-shrink-0">
                {/* Circle */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, ...SP }}
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                    style={{
                        background: `${step.accent}15`,
                        border: `1.5px solid ${step.accent}35`,
                        boxShadow: `0 0 0 4px ${step.accent}08`,
                    }}
                >
                    <span className="text-[16px]">{step.emoji}</span>
                </motion.div>

                {/* Vertical connector line — hidden for last step */}
                {!isLast && (
                    <motion.div
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.15, duration: 0.4 }}
                        className="flex-1 w-px mt-1 origin-top"
                        style={{
                            background: `linear-gradient(to bottom, ${step.accent}30, ${STEPS[index + 1]?.accent ?? ACCENT}20)`,
                            minHeight: 32,
                        }}
                    />
                )}
            </div>

            {/* ── Card content ── */}
            <motion.div
                className="flex-1 mb-5"
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.05, ...SP }}
            >
                <Link href={step.href}
                    onClick={() => { haptic.tap(); setTapped(true); }}>
                    <motion.div
                        whileTap={{ scale: 0.97, transition: SP }}
                        className="relative rounded-[18px] overflow-hidden p-4"
                        style={{
                            background: tapped ? `${step.accent}08` : GLASS,
                            backdropFilter: BLUR,
                            WebkitBackdropFilter: BLUR,
                            border: `1px solid ${tapped ? step.accent + '30' : BORDER}`,
                            boxShadow: SHADOW,
                            transition: 'background 0.2s, border-color 0.2s',
                        }}
                    >
                        {/* Top reflection */}
                        <div style={{
                            position: 'absolute', top: 0, left: 12, right: 12, height: 1,
                            background: 'rgba(255,255,255,1)', borderRadius: 99,
                        }} />

                        {/* Step number badge */}
                        <div className="flex items-start justify-between mb-2.5">
                            <div
                                className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                style={{ color: step.accent, background: `${step.accent}12` }}
                            >
                                الخطوة {step.num}
                            </div>
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                style={{ background: `${step.accent}12` }}
                            >
                                <ArrowLeft style={{ width: 12, height: 12, color: step.accent }} />
                            </div>
                        </div>

                        {/* Title */}
                        <p className="text-[15px] font-black leading-tight mb-2"
                            style={{ color: INK }}>
                            {step.title}
                        </p>

                        {/* Why */}
                        <p className="text-[11.5px] leading-[1.55] mb-2.5"
                            style={{ color: SUB }}>
                            {step.why}
                        </p>

                        {/* Outcome pill */}
                        <div className="flex items-start gap-1.5 pt-2.5"
                            style={{ borderTop: `1px solid ${step.accent}15` }}>
                            <span className="text-[10px] mt-px">✦</span>
                            <p className="text-[10.5px] font-semibold leading-snug"
                                style={{ color: step.accent }}>
                                {step.outcome}
                            </p>
                        </div>
                    </motion.div>
                </Link>
            </motion.div>
        </div>
    );
}

/* ── Main component ─────────────────────────────────────────── */
export default function VisitorSmartGuide() {
    return (
        <section dir="rtl" style={{ background: CANVAS, padding: '44px 20px 36px' }}>

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ marginBottom: 28 }}
            >
                <p style={{
                    fontSize: 10.5, fontWeight: 700, color: MUTED,
                    letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8,
                }}>
                    كيف تعمل طِبرة
                </p>
                <h2 style={{
                    fontSize: 24, fontWeight: 900, color: INK,
                    lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0,
                }}>
                    أربع خطوات<br />
                    <span style={{ color: ACCENT }}>نحو صحة أوضح</span>
                </h2>
                <p style={{ fontSize: 12.5, color: SUB, marginTop: 10, lineHeight: 1.6 }}>
                    من الأعراض الأولى إلى المتابعة الحقيقية — كل خطوة مبنية على ما قبلها
                </p>
            </motion.div>

            {/* ── 4 Steps ── */}
            <div>
                {STEPS.map((step, i) => (
                    <StepCard
                        key={step.num}
                        step={step}
                        index={i}
                        isLast={i === STEPS.length - 1}
                    />
                ))}
            </div>

            {/* ── Secondary quick links ── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
                style={{ marginTop: 8 }}
            >
                <p style={{
                    fontSize: 9.5, fontWeight: 700, color: MUTED,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    marginBottom: 10, textAlign: 'center',
                }}>
                    أو ابدأ مباشرة من هنا
                </p>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {QUICK_LINKS.map(ql => (
                        <Link key={ql.label} href={ql.href} onClick={() => haptic.selection()}>
                            <motion.div
                                whileTap={{ scale: 0.95, transition: SP }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '7px 14px', borderRadius: 99,
                                    background: GLASS,
                                    backdropFilter: BLUR, WebkitBackdropFilter: BLUR,
                                    border: `1px solid ${BORDER}`,
                                    boxShadow: SHADOW,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <span style={{ fontSize: 12 }}>{ql.emoji}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: SUB }}>
                                    {ql.label}
                                </span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}

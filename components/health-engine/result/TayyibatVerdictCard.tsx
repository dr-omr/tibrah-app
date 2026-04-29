// components/health-engine/result/TayyibatVerdictCard.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat Dietary Verdict Card
// ════════════════════════════════════════════════════════════════
// Renders the full dietary analysis from the Tayyibat bridge engine.
// Sections:
//   1. Signal badge + summary
//   2. Anti-inflammatory score ring
//   3. Detected violations panel
//   4. Symptom ↔ food correlation matrix
//   5. Substitution quick-swap pills
//   6. 4-week adherence timeline
//   7. Pathway-specific recommendations
//   8. Relevant special notes
//   9. CTA → Tayyibat page
// ════════════════════════════════════════════════════════════════
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Leaf, AlertTriangle, ArrowLeftRight, ChevronLeft,
    ChevronDown, ChevronUp, Flame, ShieldCheck, Clock,
    FlaskConical, Zap, Info,
} from 'lucide-react';
import Link from 'next/link';
import type { TayyibatAssessmentVerdict } from '@/lib/tayyibat-assessment-bridge';
import type { DomainVisConfig } from './shared/design-tokens';
import { W } from './shared/design-tokens';
import { GlassCard, AccentIconBox, SectionLabel } from './shared/GlassCard';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

interface Props {
    data: TayyibatAssessmentVerdict;
    vis: DomainVisConfig;
    on: boolean;
}

/* ══════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════ */

const SIGNAL_COLORS = {
    critical: {
        bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.22)',
        text: '#DC2626', badgeBg: 'rgba(239,68,68,0.12)', badge: '⚠️ تنبيه مهم',
        ringColor: '#EF4444',
    },
    warning: {
        bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.22)',
        text: '#D97706', badgeBg: 'rgba(245,158,11,0.12)', badge: '🔍 مراجعة مطلوبة',
        ringColor: '#F59E0B',
    },
    good: {
        bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.22)',
        text: '#059669', badgeBg: 'rgba(16,185,129,0.12)', badge: '✅ متوافق',
        ringColor: '#10B981',
    },
    unknown: {
        bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.22)',
        text: '#64748B', badgeBg: 'rgba(148,163,184,0.12)', badge: '📋 معلومات',
        ringColor: '#94A3B8',
    },
};

const STRENGTH_BADGE = {
    strong:   { label: 'قوي', color: '#EF4444',  bg: 'rgba(239,68,68,0.1)' },
    moderate: { label: 'متوسط', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    weak:     { label: 'خفيف', color: '#6366F1',  bg: 'rgba(99,102,241,0.1)' },
};

const WEEK_COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#EC4899'];

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════ */

/** Animated SVG ring showing anti-inflammatory score */
function AntiInflamRing({ score, color }: { score: number; color: string }) {
    const r = 36;
    const circ = 2 * Math.PI * r;
    const label = score >= 80 ? 'مرتفع' : score >= 60 ? 'جيد' : score >= 40 ? 'متوسط' : 'منخفض';

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
            <div className="relative flex-shrink-0" style={{ width: 84, height: 84 }}>
                <svg width="84" height="84" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="42" cy="42" r={r} fill="none" stroke={`${color}20`} strokeWidth="5" />
                    <motion.circle cx="42" cy="42" r={r} fill="none"
                        stroke={color} strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ * (1 - score / 100) }}
                        transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span style={{ fontSize: 18, fontWeight: 900, color: W.textPrimary }}>{score}</span>
                    <span style={{ fontSize: 8, color: W.textSub, fontWeight: 700 }}>/100</span>
                </div>
            </div>
            <div>
                <p style={{ fontSize: 11, fontWeight: 900, color: W.textPrimary }}>درجة مضاد الالتهاب</p>
                <p style={{ fontSize: 13, fontWeight: 900, color, marginTop: 2 }}>{label}</p>
                <p style={{ fontSize: 9.5, color: W.textSub, marginTop: 3, lineHeight: 1.4 }}>
                    بناءً على الأطعمة المسموحة والممنوعة في نظام الطيبات
                </p>
            </div>
        </div>
    );
}

/** Violation chip with icon */
function ViolationChip({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-2 py-1.5">
            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0 text-red-400" />
            <p style={{ fontSize: 10.5, color: '#DC2626', lineHeight: 1.5 }}>{text}</p>
        </div>
    );
}

/** Symptom-food link row */
function SymptomFoodRow({
    symptom, suspectedFood, suggestion, strength,
}: {
    symptom: string; suspectedFood: string; suggestion: string;
    strength: 'strong' | 'moderate' | 'weak';
}) {
    const badge = STRENGTH_BADGE[strength];
    return (
        <div className="mb-3 last:mb-0 p-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)' }}>
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: W.textPrimary }}>{symptom}</span>
                    <span style={{ fontSize: 9, color: W.textSub }}>←</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#DC2626' }}>{suspectedFood}</span>
                </div>
                <span style={{
                    fontSize: 8.5, fontWeight: 700,
                    color: badge.color, background: badge.bg,
                    padding: '2px 7px', borderRadius: 20,
                }}>
                    {badge.label}
                </span>
            </div>
            <p style={{ fontSize: 9.5, color: W.textSub, lineHeight: 1.5 }}>↳ {suggestion}</p>
        </div>
    );
}

/** Substitution pill pair */
function SubstitutionPill({ forbidden, alternatives }: { forbidden: string; alternatives: string[] }) {
    return (
        <div className="flex items-center gap-2 flex-wrap py-1">
            <span style={{
                fontSize: 10, fontWeight: 700, color: '#DC2626',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                padding: '3px 10px', borderRadius: 20,
            }}>
                ✕ {forbidden}
            </span>
            <ArrowLeftRight className="w-3 h-3 text-slate-400" />
            {alternatives.map((alt, i) => (
                <span key={i} style={{
                    fontSize: 10, fontWeight: 700, color: '#059669',
                    background: 'rgba(5,150,105,0.08)',
                    border: '1px solid rgba(5,150,105,0.2)',
                    padding: '3px 10px', borderRadius: 20,
                }}>
                    ✓ {alt}
                </span>
            ))}
        </div>
    );
}

/** 4-week adherence timeline */
function WeekTimeline({ pathwayRecommendations }: { pathwayRecommendations: string[] }) {
    const weeks = [
        { label: 'الأسبوع ١', focus: 'إزالة الممنوعات الكبرى', detail: 'ألبان، بيض، قمح' },
        { label: 'الأسبوع ٢', focus: 'تثبيت البدائل', detail: 'أرز، فريك، جبن أصفر، توست ردة' },
        { label: 'الأسبوع ٣', focus: 'تقوية المسموحات', detail: 'سمك ٣×، بقوليات، خضار يومياً' },
        { label: 'الأسبوع ٤', focus: 'القياس والتقييم', detail: 'قارن أعراضك قبل وبعد' },
    ];

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute right-[18px] top-4 bottom-4 w-0.5"
                style={{ background: 'rgba(148,163,184,0.2)' }} />
            <div className="flex flex-col gap-3">
                {weeks.map((w, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-start gap-3">
                        {/* Dot */}
                        <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-black z-10"
                            style={{ background: WEEK_COLORS[i] }}>
                            {i + 1}
                        </div>
                        <div className="flex-1">
                            <p style={{ fontSize: 11, fontWeight: 800, color: W.textPrimary }}>{w.focus}</p>
                            <p style={{ fontSize: 9.5, color: W.textSub, marginTop: 2 }}>{w.detail}</p>
                            {i === 0 && pathwayRecommendations[0] && (
                                <p style={{ fontSize: 9, color: WEEK_COLORS[0], marginTop: 3, fontWeight: 600 }}>
                                    ← {pathwayRecommendations[0].slice(0, 60)}...
                                </p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

/** Collapsible section wrapper */
function CollapsSection({
    title, icon: Icon, iconColor, children, defaultOpen = false,
}: {
    title: string;
    icon: React.ElementType;
    iconColor: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-3.5 py-3 cursor-pointer">
                <div className="flex items-center gap-2">
                    <Icon style={{ width: 14, height: 14, color: iconColor }} />
                    <p style={{ fontSize: 11.5, fontWeight: 800, color: W.textPrimary }}>{title}</p>
                </div>
                {open
                    ? <ChevronUp style={{ width: 14, height: 14, color: W.textSub }} />
                    : <ChevronDown style={{ width: 14, height: 14, color: W.textSub }} />}
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden">
                        <div className="px-3.5 pb-3">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/** Recommendation item */
function RecItem({ text, index }: { text: string; index: number }) {
    const colors = ['#0D9488', '#6366F1', '#F59E0B'];
    const color = colors[index % colors.length];
    return (
        <div className="flex items-start gap-2.5 mb-2.5 last:mb-0">
            <div className="w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={{ background: `${color}15` }}>
                <span style={{ fontSize: 9, fontWeight: 900, color }}>{index + 1}</span>
            </div>
            <p style={{ fontSize: 10.5, color: W.textSub, lineHeight: 1.55 }}>{text}</p>
        </div>
    );
}

/** Special note pill */
function NotePill({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-2 py-1.5 px-2.5 rounded-lg mb-2 last:mb-0"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <Info style={{ width: 12, height: 12, color: '#6366F1', marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 10, color: '#6366F1', fontWeight: 600, lineHeight: 1.5 }}>{text}</p>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export function TayyibatVerdictCard({ data, vis, on }: Props) {
    if (!data || !data.isRelevant) return null;

    /* ── Educational-only mode: user selected "لا أعرفه" ─────────
       Show a gentle intro card — NO score ring, NO "ممتاز", NO adherence badge.
       This is the fix for the critical bug: unknown knowledge → fake excellent score.
    ──────────────────────────────────────────────────────────── */
    const isEducational =
        data.isEducationalOnly === true ||
        (data.primaryPattern === null && data.confidenceScore <= 20);

    if (isEducational) {
        return (
            <GlassCard delay={0.75} on={on} className="mx-4 mb-4 p-5">
                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <AccentIconBox color="#6366F1">
                                <Leaf style={{ width: 16, height: 16, color: '#6366F1' }} />
                            </AccentIconBox>
                            <div>
                                <SectionLabel text="الغذاء والطيبات ضمن تقييمك" color="#6366F1" />
                                <p style={{ fontSize: 9, color: W.textSub, marginTop: -2 }}>
                                    رؤية تعريفية — لا توجد بيانات كافية للتقييم
                                </p>
                            </div>
                        </div>
                        <span style={{
                            fontSize: 9, fontWeight: 800,
                            padding: '4px 10px', borderRadius: 20,
                            background: 'rgba(99,102,241,0.10)',
                            color: '#6366F1',
                            border: '1px solid rgba(99,102,241,0.22)',
                        }}>
                            📚 رؤية تعريفية
                        </span>
                    </div>

                    {/* Explanation box */}
                    <div className="mb-4 p-3.5 rounded-xl"
                        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)' }}>
                        <p style={{ fontSize: 12, color: '#4338CA', fontWeight: 700, lineHeight: 1.7, marginBottom: 6 }}>
                            اخترت أنك لا تعرف نظام الطيبات بعد.
                        </p>
                        <p style={{ fontSize: 10.5, color: W.textSub, lineHeight: 1.7 }}>
                            لذلك لا نعرض درجة التزام أو حكمًا غذائيًا. هذه البطاقة تعطيك مدخلًا أوليًا
                            وتساعد طِبرا على تحسين الدقة عندما تضيف بيانات غذائية لاحقًا.
                        </p>
                    </div>

                    {/* First step */}
                    {data.firstStepToday && (
                        <div className="mb-4 p-3 rounded-xl flex items-start gap-2.5"
                            style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                            <Zap style={{ width: 14, height: 14, color: '#6366F1', flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <p style={{ fontSize: 9.5, fontWeight: 800, color: '#6366F1', marginBottom: 3 }}>
                                    الخطوة الأولى اليوم
                                </p>
                                <p style={{ fontSize: 11, color: W.textSub, lineHeight: 1.6 }}>
                                    {data.firstStepToday}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* CTAs */}
                    <div className="flex flex-col gap-2">
                        <Link href="/tayyibat"
                            className="flex items-center justify-center gap-2 py-3 rounded-2xl"
                            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                            <Leaf style={{ width: 13, height: 13, color: '#6366F1' }} />
                            <span style={{ fontSize: 11.5, fontWeight: 800, color: '#6366F1' }}>
                                تعرّف على نظام الطيبات
                            </span>
                        </Link>
                        <Link href="/tayyibat/tracker"
                            className="flex items-center justify-center gap-2 py-2.5 rounded-2xl"
                            style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.18)' }}>
                            <Clock style={{ width: 12, height: 12, color: W.textSub }} />
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: W.textSub }}>
                                سجّل وجباتك لتحسين الدقة لاحقًا
                            </span>
                        </Link>
                    </div>
                </div>
            </GlassCard>
        );
    }

    /* ── Full card: user has real adherence data ─────────────── */
    const signal = SIGNAL_COLORS[data.adherenceSignal];
    // Estimate anti-inflammatory score from violation count
    const antiInflamScore = Math.max(0, Math.min(100, 80 - data.detectedViolations.length * 15));

    return (
        <GlassCard delay={0.75} on={on} className="mx-4 mb-4 p-5">
            <div className="relative z-10">

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <AccentIconBox color="#059669">
                            <Leaf style={{ width: 16, height: 16, color: '#059669' }} />
                        </AccentIconBox>
                        <div>
                            <SectionLabel text="تحليل نظام الطيبات" color="#059669" />
                            <p style={{ fontSize: 9, color: W.textSub, marginTop: -2 }}>
                                قراءة غذائية مساعدة — ليست تشخيصاً طبياً
                            </p>
                        </div>
                    </div>
                    <span style={{
                        fontSize: 9, fontWeight: 800,
                        padding: '4px 10px', borderRadius: 20,
                        background: signal.badgeBg,
                        color: signal.text,
                        border: `1px solid ${signal.border}`,
                    }}>
                        {signal.badge}
                    </span>
                </div>

                {/* ── Summary ── */}
                {data.summaryArabic && (
                    <div className="mb-4 p-3 rounded-xl"
                        style={{ background: `${signal.bg}`, border: `1px solid ${signal.border}` }}>
                        <p style={{ fontSize: 11.5, color: signal.text, fontWeight: 700, lineHeight: 1.6 }}>
                            {data.summaryArabic}
                        </p>
                    </div>
                )}

                {/* ──── v2: Primary Clinical Pattern ──── */}
                {data.primaryPattern && (

                    <div className="mb-4 rounded-[18px] p-4"
                        style={{ background: 'rgba(5,150,105,0.07)', border: '1.5px solid rgba(5,150,105,0.20)' }}>
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p style={{ fontSize: 9, fontWeight: 800, color: '#7DD3FC', marginBottom: 3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    النمط الغذائي السريري
                                </p>
                                <p style={{ fontSize: 14, fontWeight: 900, color: '#0C4A6E' }}>
                                    {data.primaryPatternLabel}
                                </p>
                            </div>
                            <div style={{
                                background: data.confidenceLabel === 'high' ? 'rgba(5,150,105,0.10)'
                                          : data.confidenceLabel === 'medium' ? 'rgba(217,119,6,0.10)' : 'rgba(148,163,184,0.10)',
                                border: `1px solid ${data.confidenceLabel === 'high' ? 'rgba(5,150,105,0.25)' : data.confidenceLabel === 'medium' ? 'rgba(217,119,6,0.25)' : 'rgba(148,163,184,0.25)'}`,
                                borderRadius: 12, padding: '4px 10px',
                            }}>
                                <p style={{ fontSize: 9, fontWeight: 800, color: data.confidenceLabel === 'high' ? '#059669' : data.confidenceLabel === 'medium' ? '#D97706' : '#9CA3AF' }}>
                                    ثقة {data.confidenceScore}٪
                                </p>
                            </div>
                        </div>
                        {/* Top gaps */}
                        {data.topGaps.length > 0 && (
                            <div className="mt-3 space-y-1">
                                {data.topGaps.map((gap, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span style={{ fontSize: 8, color: '#059669', marginTop: 4, flexShrink: 0 }}>●</span>
                                        <p style={{ fontSize: 10.5, fontWeight: 600, color: '#0369A1', lineHeight: 1.6 }}>{gap}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* First step today */}
                        {data.firstStepToday && !data.safetyGated && (
                            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(5,150,105,0.15)' }}>
                                <p style={{ fontSize: 9, fontWeight: 800, color: '#059669', marginBottom: 2 }}>⚡ خطوتك الأولى اليوم</p>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#0C4A6E', lineHeight: 1.6 }}>{data.firstStepToday}</p>
                            </div>
                        )}
                        {/* Contradictions */}
                        {data.contradictionNotes.length > 0 && (
                            <div className="mt-3 pt-3 rounded-[14px] p-3" style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.18)', borderTop: 'none' }}>
                                <p style={{ fontSize: 9, fontWeight: 800, color: '#D97706', marginBottom: 4 }}>💡 ملاحظة دقيقة</p>
                                {data.contradictionNotes.map((n, i) => (
                                    <p key={i} style={{ fontSize: 10, fontWeight: 600, color: '#92400E', lineHeight: 1.65 }}>{n}</p>
                                ))}
                            </div>
                        )}
                        {/* Confidence note */}
                        {data.mealLogCountUsed < 5 && (
                            <p style={{ fontSize: 9.5, fontWeight: 600, color: '#7DD3FC', marginTop: 6 }}>
                                سجّل ف وجبات على الأقل لرفع دقة الرؤية الغذائية. لديك {data.mealLogCountUsed}/١
                            </p>
                        )}
                        {data.mealLogCountUsed >= 5 && (
                            <p style={{ fontSize: 9.5, fontWeight: 700, color: '#059669', marginTop: 6 }}>
                                ✅ ارتفعت دقة الرؤية الغذائية بناءً على بيانات وجباتك.
                            </p>
                        )}
                    </div>
                )}

                {/* ── Medical Review Recommended (non-blocking) ── */}
                {data.medicalReviewLevel === 'recommended' && data.medicalReviewReason && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 rounded-[16px] p-4"
                        style={{ background: 'rgba(217,119,6,0.07)', border: '1.5px solid rgba(217,119,6,0.25)' }}>
                        <div className="flex items-start gap-3">
                            <span style={{ fontSize: 16, flexShrink: 0 }}>🩺</span>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 800, color: '#92400E', marginBottom: 3 }}>
                                    مراجعة طبية مستحسنة
                                </p>
                                <p style={{ fontSize: 10, fontWeight: 600, color: '#78350F', lineHeight: 1.65 }}>
                                    {data.medicalReviewReason}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Anti-Inflammatory Ring ── */}
                <div className="mb-4">
                    <AntiInflamRing score={antiInflamScore} color={signal.ringColor} />
                </div>

                <div className="flex flex-col gap-3">

                    {/* ── Violations ── */}
                    {data.detectedViolations.length > 0 && (
                        <CollapsSection
                            title={`ممنوعات مُكتشفة (${data.detectedViolations.length})`}
                            icon={AlertTriangle}
                            iconColor="#EF4444"
                            defaultOpen>
                            {data.detectedViolations.slice(0, 5).map((v, i) => (
                                <ViolationChip key={i} text={v} />
                            ))}
                            {data.detectedViolations.length > 5 && (
                                <p style={{ fontSize: 9.5, color: W.textSub, marginTop: 4 }}>
                                    + {data.detectedViolations.length - 5} إشارات أخرى
                                </p>
                            )}
                        </CollapsSection>
                    )}

                    {/* ── Symptom ↔ Food Correlations ── */}
                    {data.symptomFoodLinks.length > 0 && (
                        <CollapsSection
                            title="ربط الأعراض بالتغذية"
                            icon={FlaskConical}
                            iconColor="#6366F1"
                            defaultOpen>
                            {data.symptomFoodLinks.slice(0, 3).map((link, i) => (
                                <SymptomFoodRow key={i}
                                    symptom={link.symptom}
                                    suspectedFood={link.suspectedFood}
                                    suggestion={link.suggestion}
                                    strength={link.strength}
                                />
                            ))}
                        </CollapsSection>
                    )}

                    {/* ── Substitutions ── */}
                    {data.substitutions.length > 0 && (
                        <CollapsSection
                            title="بدائل التبديل السريع"
                            icon={ArrowLeftRight}
                            iconColor="#0D9488"
                            defaultOpen>
                            {data.substitutions.map((sub, i) => (
                                <SubstitutionPill key={i}
                                    forbidden={sub.forbidden}
                                    alternatives={sub.alternatives}
                                />
                            ))}
                            {/* Always show critical swaps */}
                            <div className="mt-3 pt-3"
                                style={{ borderTop: '1px solid rgba(148,163,184,0.15)' }}>
                                <p style={{ fontSize: 9.5, fontWeight: 700, color: '#059669', marginBottom: 6 }}>
                                    تبديلات ثابتة في نظام الطيبات:
                                </p>
                                {[
                                    { from: 'أي خبز', to: 'توست بالردة (ريتش بيك)' },
                                    { from: 'مكرونة / شعرية', to: 'أرز / فريك / بطاطس' },
                                    { from: 'سكر أبيض', to: 'عسل أبيض أو أسود' },
                                    { from: 'زيت ذرة / عباد', to: 'زيت زيتون / سمنة بلدي' },
                                ].map((s, i) => <SubstitutionPill key={i} forbidden={s.from} alternatives={[s.to]} />)}
                            </div>
                        </CollapsSection>
                    )}

                    {/* ── 4-Week Timeline ── */}
                    <CollapsSection
                        title="خطة الالتزام — ٤ أسابيع"
                        icon={Clock}
                        iconColor="#F59E0B">
                        <WeekTimeline pathwayRecommendations={data.pathwayRecommendations} />
                    </CollapsSection>

                    {/* ── Pathway Recommendations ── */}
                    {data.pathwayRecommendations.length > 0 && (
                        <CollapsSection
                            title="توصيات غذائية لحالتك"
                            icon={Zap}
                            iconColor="#6366F1">
                            {data.pathwayRecommendations.map((rec, i) => (
                                <RecItem key={i} text={rec} index={i} />
                            ))}
                        </CollapsSection>
                    )}

                    {/* ── Special Notes ── */}
                    {data.relevantNotes.length > 0 && (
                        <CollapsSection
                            title="ملاحظات نظام الطيبات"
                            icon={ShieldCheck}
                            iconColor="#6366F1">
                            {data.relevantNotes.map((note, i) => (
                                <NotePill key={i} text={note} />
                            ))}
                        </CollapsSection>
                    )}

                    {/* ── Meal Guide ── */}
                    <CollapsSection
                        title="دليل الوجبات اليومي"
                        icon={Flame}
                        iconColor="#0D9488">
                        {[
                            {
                                meal: 'الفطور 🌅',
                                items: ['توست بالردة + جبنة شيدر أو رومي', 'بيضة بديلة: فول أو تونة', 'عسل أو مربى', 'شاي / ينسون / كاكاو'],
                            },
                            {
                                meal: 'الغداء 🌞',
                                items: ['أرز أو بطاطس أو فريك', 'لحمة أو فراخ أو سمك', 'خضار بكل أشكاله', 'سلطة + عصير طازج'],
                            },
                            {
                                meal: 'العشاء 🌙',
                                items: ['بروتين خفيف: تونة / شاورما / ناجتس', 'خضار مطبوخة أو سوتيه', 'فاكهة طازجة', 'حلبة أو كركديه'],
                            },
                            {
                                meal: 'الوجبات الخفيفة 🍎',
                                items: ['مكسرات بدون ملح مبالغ', 'فاكهة', 'شيبسي (باعتدال)', 'شوكولاتة (باعتدال)'],
                            },
                        ].map((g, i) => (
                            <div key={i} className="mb-3 last:mb-0">
                                <p style={{ fontSize: 11, fontWeight: 800, color: W.textPrimary, marginBottom: 4 }}>
                                    {g.meal}
                                </p>
                                {g.items.map((item, j) => (
                                    <p key={j} style={{ fontSize: 10, color: W.textSub, lineHeight: 1.6 }}>
                                        • {item}
                                    </p>
                                ))}
                            </div>
                        ))}
                    </CollapsSection>

                </div>

                {/* ── CTA ── */}
                <div className="mt-4 space-y-2">
                    {/* Primary: tracker */}
                    <Link href="/tayyibat/tracker">
                        <motion.div whileTap={{ scale: 0.97 }}
                            className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer"
                            style={{
                                background: 'linear-gradient(135deg, rgba(5,150,105,0.10), rgba(5,150,105,0.05))',
                                border: '1.5px solid rgba(5,150,105,0.25)',
                            }}>
                            <div>
                                <p style={{ fontSize: 11.5, fontWeight: 800, color: '#059669' }}>
                                    سجّل وجباتك لرفع دقة طِبرا
                                </p>
                                <p style={{ fontSize: 9.5, color: '#0369A1', marginTop: 1 }}>
                                    ربط الغذاء بالأعراض بشكل شخصي • رؤية أسبوعية أوثق
                                </p>
                            </div>
                            <ChevronLeft className="w-4 h-4" style={{ color: '#059669' }} />
                        </motion.div>
                    </Link>
                    {/* Secondary: full detail */}
                    <Link href="/tayyibat/result">
                        <motion.div whileTap={{ scale: 0.97 }}
                            className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer"
                            style={{
                                background: 'rgba(8,145,178,0.05)',
                                border: '1px solid rgba(8,145,178,0.18)',
                            }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#0891B2' }}>
                                افتح التفاصيل الغذائية
                            </p>
                            <ChevronLeft className="w-4 h-4" style={{ color: '#0891B2' }} />
                        </motion.div>
                    </Link>
                    {/* Attribution */}
                    {data.attributionShort && (
                        <p style={{ fontSize: 9, fontWeight: 600, color: '#BAE6FD', textAlign: 'center', paddingTop: 4, lineHeight: 1.6 }}>
                            {data.attributionShort}
                        </p>
                    )}
                </div>

            </div>
        </GlassCard>
    );
}

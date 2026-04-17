'use client';
/**
 * pages/protocol-checkin.tsx — تسجيل يومي خفيف (micro-flow)
 * ─────────────────────────────────────────────────────────
 * URL: /protocol-checkin
 * 20-30 ثانية فقط — 4 خطوات بسيطة.
 * بعد الإرسال: يرجع مباشرة لـ /my-plan.
 *
 * الفصل الجوهري مُطبَّق هنا:
 *   adherenceCompleted = هل فعلت المهمة؟
 *   outcomeScore       = كيف الأعراض (1-10، 10=أسوأ)
 *   feltBetter         = رأيك المباشر مقارنة بأمس
 *
 * لا تخلط هذا مع /protocol-reassessment (مقارنة كاملة من البداية).
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { haptic } from '@/lib/HapticFeedback';
import { getActiveCarePlan, getProtocolDay } from '@/lib/care-plan-store';
import { getProtocol, getDayProtocol } from '@/lib/protocol-engine';
import { getRegisteredProtocol } from '@/lib/protocol-registry';
import {
    saveDayOutcome,
    saveProtocolBaseline,
    getProtocolBaseline,
    hasDayOutcome,
    getPlanId,
    type DayOutcome,
} from '@/lib/outcome-store';
import { trackEvent } from '@/lib/analytics';

/* ─── Domain colors ────────────────────────────── */
const DOMAIN_COLORS: Record<string, { color: string; colorAlt: string }> = {
    jasadi: { color: '#00B7EB', colorAlt: '#0EA5E9' },
    nafsi:  { color: '#8B5CF6', colorAlt: '#7C3AED' },
    fikri:  { color: '#10B981', colorAlt: '#059669' },
    ruhi:   { color: '#F59E0B', colorAlt: '#D97706' },
};

/* ─── Step component ────────────────────────────── */
function StepHeader({ current, total, color }: { current: number; total: number; color: string }) {
    return (
        <div className="flex items-center gap-1.5 mb-6">
            {Array.from({ length: total }, (_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full transition-all duration-400"
                    style={{ background: i < current ? color : `${color}25` }} />
            ))}
        </div>
    );
}

/* ════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════ */
export default function ProtocolCheckinPage() {
    const router  = useRouter();

    const plan = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return getActiveCarePlan();
    }, []);

    const context = useMemo(() => {
        if (!plan) return null;
        const planId    = getPlanId(plan.createdAt);
        const day       = getProtocolDay(plan);
        const protocol  = getProtocol(plan.routing.primary_subdomain)
                       ?? getRegisteredProtocol(plan.routing.primary_subdomain);
        const dayProto  = protocol ? getDayProtocol(protocol, day) : null;
        const domColors = DOMAIN_COLORS[plan.routing.primary_domain] ?? DOMAIN_COLORS.jasadi;
        const alreadyDone = hasDayOutcome(planId, day);
        return { planId, day, protocol, dayProto, domColors, alreadyDone };
    }, [plan]);

    // Form state
    const [step, setStep]               = useState(0);
    const [adherence, setAdherence]     = useState<'yes' | 'hard' | 'forgot' | null>(null);
    const [outcomeScore, setOutcomeScore] = useState<number>(5);
    const [feltBetter, setFeltBetter]   = useState<'better' | 'same' | 'worse' | null>(null);
    const [note, setNote]               = useState('');
    const [submitting, setSubmitting]   = useState(false);
    const [done, setDone]               = useState(false);

    if (!plan || !context) {
        return (
            <div className="min-h-screen flex items-center justify-center" dir="rtl"
                style={{ background: 'linear-gradient(135deg, #021828, #011220)' }}>
                <div className="text-center p-6">
                    <p className="text-white/70 text-sm font-bold mb-4">لا توجد خطة نشطة</p>
                    <Link href="/symptom-checker">
                        <span className="text-[#00B7EB] font-black text-sm">ابدأ التقييم ←</span>
                    </Link>
                </div>
            </div>
        );
    }

    const { planId, day, protocol, dayProto, domColors, alreadyDone } = context;
    const { color, colorAlt } = domColors;
    const TOTAL_STEPS = 4;

    // ── Already done today ──
    if (alreadyDone && !done) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" dir="rtl"
                style={{ background: `linear-gradient(150deg, ${color}0D 0%, #021828 50%)` }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-xs w-full">
                    <div className="text-[56px] mb-4">✅</div>
                    <p className="text-white text-lg font-black mb-2">سجّلت اليوم بالفعل!</p>
                    <p className="text-white/50 text-sm font-medium mb-8">
                        تسجيلك لليوم {day} محفوظ. عُد غداً للتسجيل التالي.
                    </p>
                    <Link href="/my-plan">
                        <motion.div whileTap={{ scale: 0.97 }}
                            className="py-3 px-6 rounded-[14px] flex items-center justify-center gap-2"
                            style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                            <span className="text-white font-black text-sm">عُد لخطتي</span>
                            <ArrowLeft className="w-4 h-4" style={{ color }} />
                        </motion.div>
                    </Link>
                </motion.div>
            </div>
        );
    }

    // ── Done state (after submit) ──
    if (done) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" dir="rtl"
                style={{ background: `linear-gradient(150deg, ${color}0D 0%, #021828 50%)` }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="text-center max-w-xs w-full">
                    <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-[64px] mb-4">🎉</motion.div>
                    <p className="text-white text-xl font-black mb-2">سجّلت اليوم {day}!</p>
                    <p className="text-white/50 text-sm font-medium mb-8">
                        كل check-in يساعد طِبرة يفهم تحسّنك الحقيقي.
                    </p>
                    <Link href="/my-plan">
                        <motion.div whileTap={{ scale: 0.97 }}
                            className="py-3.5 px-6 rounded-[16px]"
                            style={{
                                background: `linear-gradient(135deg, ${color}30, ${colorAlt}18)`,
                                border: `1.5px solid ${color}50`,
                                boxShadow: `0 12px 32px ${color}25`,
                            }}>
                            <span className="text-white font-black text-[15px]">عُد لخطتي ←</span>
                        </motion.div>
                    </Link>
                </motion.div>
            </div>
        );
    }

    // ── Handle submit ──
    const handleSubmit = () => {
        if (!adherence || !feltBetter) return;
        setSubmitting(true);
        haptic.impact();

        const outcome: DayOutcome = {
            planId,
            subdomainId: plan.routing.primary_subdomain,
            day,
            adherenceCompleted: adherence === 'yes',
            outcomeScore,
            feltBetter,
            note: note.trim() || undefined,
            checkedAt: new Date().toISOString(),
        };

        saveDayOutcome(outcome);

        // حفظ baseline إذا كان أول تسجيل (مرة واحدة فقط)
        if (!getProtocolBaseline(planId)) {
            saveProtocolBaseline({
                planId,
                subdomainId: plan.routing.primary_subdomain,
                baselineOutcomeScore: outcomeScore,
                startedAt: new Date().toISOString(),
            });
            trackEvent('protocol_started', { subdomain: plan.routing.primary_subdomain, day });
        }

        trackEvent('protocol_outcome_logged', {
            day,
            subdomain:            plan.routing.primary_subdomain,
            adherence_completed:  adherence === 'yes',
            outcome_score:        outcomeScore,
            felt_better:          feltBetter,
        });

        trackEvent('protocol_day_completed', {
            day,
            subdomain: plan.routing.primary_subdomain,
        });

        setTimeout(() => {
            setSubmitting(false);
            setDone(true);
        }, 500);
    };

    const canProceed = (s: number) => {
        if (s === 0) return adherence !== null;
        if (s === 1) return true; // slider always has value
        if (s === 2) return feltBetter !== null;
        return true;
    };

    return (
        <div className="min-h-screen flex flex-col" dir="rtl"
            style={{ background: `linear-gradient(150deg, ${color}0D 0%, #021828 60%)` }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-14 pb-4">
                <Link href="/my-plan" onClick={() => haptic.tap()}>
                    <motion.div whileTap={{ scale: 0.88 }}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <X className="w-4 h-4 text-white/60" />
                    </motion.div>
                </Link>
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>
                        تسجيل اليوم
                    </p>
                    <p className="text-white/40 text-[9px] font-medium">
                        يوم {day} {protocol ? `من ${protocol.totalDays}` : ''}
                    </p>
                </div>
                <div className="w-9" /> {/* spacer */}
            </div>

            {/* Content */}
            <div className="flex-1 px-5 pb-10">
                <StepHeader current={step + 1} total={TOTAL_STEPS} color={color} />

                <AnimatePresence mode="wait">

                    {/* ── Step 0: Adherence ── */}
                    {step === 0 && (
                        <motion.div key="step-0"
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

                            <p className="text-white text-[20px] font-black mb-1 leading-snug">
                                هل نفّذت مهمتك اليوم؟
                            </p>
                            {dayProto && (
                                <p className="text-white/40 text-[12px] font-medium mb-6">
                                    {dayProto.toolName} · {dayProto.durationMinutes} دقيقة
                                </p>
                            )}

                            <div className="flex flex-col gap-3">
                                {([
                                    { value: 'yes',    emoji: '✅', label: 'نعم، أكملتها' },
                                    { value: 'hard',   emoji: '😅', label: 'حاولت لكن كان صعباً' },
                                    { value: 'forgot', emoji: '😔', label: 'نسيت' },
                                ] as const).map(opt => (
                                    <motion.button key={opt.value}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => { haptic.tap(); setAdherence(opt.value); }}
                                        className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] text-right"
                                        style={{
                                            background: adherence === opt.value ? `${color}22` : 'rgba(255,255,255,0.05)',
                                            border: `1.5px solid ${adherence === opt.value ? color : 'rgba(255,255,255,0.08)'}`,
                                            boxShadow: adherence === opt.value ? `0 4px 16px ${color}22` : 'none',
                                        }}>
                                        <span className="text-[22px]">{opt.emoji}</span>
                                        <span className="text-white text-[13px] font-bold flex-1">{opt.label}</span>
                                        {adherence === opt.value && (
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center"
                                                style={{ background: color }}>
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 1: Outcome Score ── */}
                    {step === 1 && (
                        <motion.div key="step-1"
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

                            <p className="text-white text-[20px] font-black mb-1 leading-snug">
                                كيف تشعر الآن — بصدق؟
                            </p>
                            <p className="text-white/40 text-[12px] font-medium mb-8">
                                ١ = ممتاز · ١٠ = شديد جداً
                            </p>

                            {/* Score display */}
                            <div className="text-center mb-6">
                                <motion.p
                                    key={outcomeScore}
                                    initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                                    className="text-[68px] font-black"
                                    style={{ color: outcomeScore <= 3 ? '#00C88C' : outcomeScore <= 6 ? '#F59E0B' : '#EF4444' }}>
                                    {outcomeScore}
                                </motion.p>
                                <p className="text-white/40 text-[12px] font-medium">
                                    {outcomeScore <= 3 ? 'ممتاز — جيد جداً' : outcomeScore <= 6 ? 'متوسط' : 'صعب — نحوجه اهتماماً'}
                                </p>
                            </div>

                            {/* Slider */}
                            <div className="relative">
                                <input type="range" min={1} max={10} value={outcomeScore}
                                    onChange={e => { haptic.tap(); setOutcomeScore(Number(e.target.value)); }}
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to left, #EF4444, #F59E0B, #00C88C)`,
                                        WebkitAppearance: 'none',
                                    }}
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-[9px] font-bold" style={{ color: '#00C88C' }}>١ — أفضل</span>
                                    <span className="text-[9px] font-bold" style={{ color: '#EF4444' }}>١٠ — أسوأ</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 2: FeltBetter ── */}
                    {step === 2 && (
                        <motion.div key="step-2"
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

                            <p className="text-white text-[20px] font-black mb-1 leading-snug">
                                مقارنة بالأمس — كيف وضعك؟
                            </p>
                            <p className="text-white/40 text-[12px] font-medium mb-6">
                                رأيك مباشرة — بدون تفكير زائد
                            </p>

                            <div className="flex gap-3">
                                {([
                                    { value: 'better', emoji: '😊', label: 'أفضل', bg: '#00C88C' },
                                    { value: 'same',   emoji: '😐', label: 'مثل أمس', bg: '#7DD3FC' },
                                    { value: 'worse',  emoji: '😔', label: 'أسوأ', bg: '#EF4444' },
                                ] as const).map(opt => (
                                    <motion.button key={opt.value}
                                        whileTap={{ scale: 0.94 }}
                                        onClick={() => { haptic.tap(); setFeltBetter(opt.value); }}
                                        className="flex-1 flex flex-col items-center py-5 rounded-[18px]"
                                        style={{
                                            background: feltBetter === opt.value ? `${opt.bg}20` : 'rgba(255,255,255,0.05)',
                                            border: `1.5px solid ${feltBetter === opt.value ? opt.bg : 'rgba(255,255,255,0.08)'}`,
                                            boxShadow: feltBetter === opt.value ? `0 6px 20px ${opt.bg}25` : 'none',
                                        }}>
                                        <span className="text-[32px] mb-2">{opt.emoji}</span>
                                        <span className="text-white/80 text-[11px] font-black">{opt.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 3: Optional Note ── */}
                    {step === 3 && (
                        <motion.div key="step-3"
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

                            <p className="text-white text-[20px] font-black mb-1 leading-snug">
                                ملاحظة قصيرة؟
                            </p>
                            <p className="text-white/40 text-[12px] font-medium mb-6">
                                اختياري — ما الذي أثّر في يومك؟
                            </p>

                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value.slice(0, 100))}
                                placeholder="مثال: نمت متأخراً، أو الضغط كان عالياً..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-[16px] text-sm font-medium resize-none"
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1.5px solid rgba(255,255,255,0.10)',
                                    color: 'rgba(255,255,255,0.85)',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                }}
                            />
                            <p className="text-right text-white/30 text-[9px] font-medium mt-1">
                                {note.length}/100
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="fixed bottom-0 inset-x-0 px-5 pb-8 pt-4"
                    style={{ background: 'linear-gradient(to top, #021828, transparent)' }}>
                    <div className="flex gap-3">
                        {step > 0 && (
                            <motion.button whileTap={{ scale: 0.95 }}
                                onClick={() => { haptic.tap(); setStep(s => s - 1); }}
                                className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                <ArrowRight className="w-5 h-5 text-white/60" />
                            </motion.button>
                        )}

                        {step < TOTAL_STEPS - 1 ? (
                            <motion.button whileTap={{ scale: 0.97 }}
                                disabled={!canProceed(step)}
                                onClick={() => { haptic.tap(); if (canProceed(step)) setStep(s => s + 1); }}
                                className="flex-1 py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                                style={{
                                    background: canProceed(step)
                                        ? `linear-gradient(135deg, ${color}35, ${colorAlt}22)`
                                        : 'rgba(255,255,255,0.05)',
                                    border: `1.5px solid ${canProceed(step) ? color + '50' : 'rgba(255,255,255,0.06)'}`,
                                    opacity: canProceed(step) ? 1 : 0.5,
                                }}>
                                <span className="text-white font-black text-[14px]">التالي</span>
                                <ArrowLeft className="w-4 h-4" style={{ color: canProceed(step) ? color : 'white' }} />
                            </motion.button>
                        ) : (
                            <motion.button whileTap={{ scale: 0.97 }}
                                disabled={submitting || !canProceed(TOTAL_STEPS - 1)}
                                onClick={handleSubmit}
                                className="flex-1 py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                                style={{
                                    background: `linear-gradient(135deg, ${color}45, ${colorAlt}30)`,
                                    border: `1.5px solid ${color}60`,
                                    boxShadow: `0 8px 24px ${color}30`,
                                }}>
                                <span className="text-white font-black text-[14px]">
                                    {submitting ? 'جاري الحفظ...' : 'حفظ اليوم ✓'}
                                </span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            {/* Slider styles */}
            <style jsx global>{`
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}

'use client';
/**
 * pages/protocol-reassessment.tsx — إعادة التقييم البروتوكولي
 * ─────────────────────────────────────────────────────────────
 * URL: /protocol-reassessment
 * منفصلة تماماً عن /protocol-checkin.
 *
 * التمييز الجوهري:
 *   check-in    = هل فعلت اليوم؟ (adherence + outcome يومي)
 *   reassessment = هل تحسّنت منذ بداية البروتوكول؟ (outcome كلي)
 *
 * 3 أقسام:
 *   1. كيف تغيّرت منذ البداية؟ (4 خيارات → routing decision)
 *   2. ما العرض المتبقي؟ (optional text)
 *   3. ماذا تريد فعله؟ (3 خيارات → صفحة مناسبة)
 *
 * كل خيار يُسجَّل في analytics + يُوجَّه للصفحة الصحيحة.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Check, RefreshCw, Phone, Target } from 'lucide-react';
import Link from 'next/link';
import { haptic } from '@/lib/HapticFeedback';
import { getActiveCarePlan } from '@/lib/care-plan-store';
import { getProtocol } from '@/lib/protocol-engine';
import { getRegisteredProtocol } from '@/lib/protocol-registry';
import { getDayOutcomes, getProtocolBaseline, getPlanId, getMissingDays } from '@/lib/outcome-store';
import { computeTrend } from '@/lib/outcome-trend-engine';
import { getProtocolDay, getProtocolProgress } from '@/lib/care-plan-store';
import { trackEvent } from '@/lib/analytics';

/* ─── Types ─────────────────────────────────────── */
type ImprovementLevel = 'clearly_better' | 'slightly_better' | 'no_change' | 'worse';
type NextAction       = 'continue' | 'full_reassess' | 'book_session';

const DOMAIN_COLORS: Record<string, { color: string; colorAlt: string }> = {
    jasadi: { color: '#00B7EB', colorAlt: '#0EA5E9' },
    nafsi:  { color: '#8B5CF6', colorAlt: '#7C3AED' },
    fikri:  { color: '#10B981', colorAlt: '#059669' },
    ruhi:   { color: '#F59E0B', colorAlt: '#D97706' },
};

/* ════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════ */
export default function ProtocolReassessmentPage() {
    const router = useRouter();

    const plan = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return getActiveCarePlan();
    }, []);

    const context = useMemo(() => {
        if (!plan) return null;
        const planId    = getPlanId(plan.createdAt);
        const protocol  = getProtocol(plan.routing.primary_subdomain)
                       ?? getRegisteredProtocol(plan.routing.primary_subdomain);
        const day       = getProtocolDay(plan);
        const outcomes  = getDayOutcomes(planId);
        const baseline  = getProtocolBaseline(planId);
        const missing   = getMissingDays(planId, day);
        const trend     = computeTrend(outcomes, baseline, day, missing);
        const colors    = DOMAIN_COLORS[plan.routing.primary_domain] ?? DOMAIN_COLORS.jasadi;
        const progress  = protocol ? getProtocolProgress(plan, protocol) : null;
        return { planId, protocol, day, outcomes, baseline, trend, colors, progress };
    }, [plan]);

    const [improvement, setImprovement] = useState<ImprovementLevel | null>(null);
    const [symptomNote, setSymptomNote] = useState('');
    const [nextAction, setNextAction]   = useState<NextAction | null>(null);
    const [submitted, setSubmitted]     = useState(false);

    if (!plan || !context) {
        return (
            <div className="min-h-screen flex items-center justify-center" dir="rtl"
                style={{ background: 'linear-gradient(135deg, #021828, #011220)' }}>
                <div className="text-center p-6">
                    <p className="text-white/60 text-sm mb-4">لا توجد خطة نشطة</p>
                    <Link href="/symptom-checker">
                        <span className="text-[#00B7EB] font-black text-sm">ابدأ التقييم ←</span>
                    </Link>
                </div>
            </div>
        );
    }

    const { protocol, day, trend, colors, progress } = context;
    const { color, colorAlt } = colors;

    // Track page view once on mount (useEffect — not useMemo, which is for values not side effects)
    useEffect(() => {
        if (!plan || !context) return;
        trackEvent('protocol_reassessment_shown', {
            subdomain: plan.routing.primary_subdomain,
            day,
            trend_before: trend.trend,
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-suggest next action based on trend
    const suggestedAction: NextAction = useMemo(() => {
        if (trend.trend === 'worsening')      return 'book_session';
        if (trend.trend === 'no_response')    return 'full_reassess';
        return 'continue';
    }, [trend.trend]);

    const handleSubmit = () => {
        if (!improvement || !nextAction) return;
        haptic.impact();

        trackEvent('protocol_reassessment_completed', {
            subdomain:       plan.routing.primary_subdomain,
            day,
            improvement,
            next_action:     nextAction,
            symptom_note:    symptomNote.slice(0, 50) || null,
        });

        if (nextAction === 'book_session') {
            trackEvent('protocol_booking_clicked', {
                from: 'reassessment',
                subdomain: plan.routing.primary_subdomain,
            });
        }

        setSubmitted(true);
    };

    // ── Submitted → routing ──
    if (submitted && nextAction) {
        const destinations: Record<NextAction, string> = {
            continue:      '/my-plan',
            full_reassess: '/symptom-checker',
            book_session:  '/book-appointment',
        };
        const msgs: Record<NextAction, { emoji: string; title: string; desc: string }> = {
            continue:      { emoji: '🎯', title: 'ممتاز! واصل مسارك', desc: 'سنتابع تقدّمك معك يوماً بيوم' },
            full_reassess: { emoji: '🔍', title: 'حسناً — نعيد التقييم', desc: 'سيساعدنا هذا نجد مسار أدق لوضعك' },
            book_session:  { emoji: '📞', title: 'قرار صحيح', desc: 'المتخصص سيساعدك أكثر مما يستطيع التطبيق' },
        };
        const msg = msgs[nextAction];
        const dest = destinations[nextAction];

        return (
            <div className="min-h-screen flex items-center justify-center px-6" dir="rtl"
                style={{ background: `linear-gradient(150deg, ${color}0D, #021828)` }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className="text-center max-w-xs w-full">
                    <div className="text-[64px] mb-4">{msg.emoji}</div>
                    <p className="text-white text-xl font-black mb-2">{msg.title}</p>
                    <p className="text-white/50 text-sm font-medium mb-8">{msg.desc}</p>
                    <Link href={dest}>
                        <motion.div whileTap={{ scale: 0.97 }}
                            className="py-3.5 px-6 rounded-[16px]"
                            style={{
                                background: `${color}28`,
                                border: `1.5px solid ${color}50`,
                            }}>
                            <span className="text-white font-black text-[14px]">
                                {nextAction === 'continue' ? 'عُد لخطتي ←' :
                                 nextAction === 'full_reassess' ? 'أعد التقييم الآن ←' :
                                 'احجز الجلسة ←'}
                            </span>
                        </motion.div>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col pb-32" dir="rtl"
            style={{ background: `linear-gradient(150deg, ${color}0D 0%, #021828 50%)` }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-14 pb-5">
                <Link href="/my-plan" onClick={() => haptic.tap()}>
                    <motion.div whileTap={{ scale: 0.88 }}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}>
                        <X className="w-4 h-4 text-white/60" />
                    </motion.div>
                </Link>
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>
                        إعادة التقييم
                    </p>
                    {protocol && (
                        <p className="text-white/40 text-[9px] font-medium mt-0.5">
                            {protocol.arabicTitle}
                        </p>
                    )}
                </div>
                <div className="w-9" />
            </div>

            {/* Trend summary chip */}
            {!trend.hasWeakSignal && (
                <div className="mx-5 mb-5 px-3 py-2.5 rounded-[14px] flex items-center gap-2"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-[13px]">
                        {trend.trend === 'responding'   ? '✅' :
                         trend.trend === 'worsening'    ? '🚨' :
                         trend.trend === 'no_response'  ? '🔍' : '📈'}
                    </span>
                    <div className="flex-1">
                        <p className="text-white/70 text-[10px] font-bold">
                            بناءً على {trend.daysAnalyzed} يوم مسجّل من البروتوكول
                        </p>
                        <p className="text-white/40 text-[9px] font-medium">
                            الالتزام: {trend.adherenceRate}% · الأعراض: {trend.avgOutcomeScore}/10
                        </p>
                    </div>
                </div>
            )}

            <div className="px-5 space-y-6">

                {/* ══ القسم 1: مستوى التحسن ══ */}
                <div>
                    <p className="text-white text-[18px] font-black mb-1">
                        منذ بدأت هذه الرحلة — كيف وضعك الآن؟
                    </p>
                    <p className="text-white/40 text-[11px] font-medium mb-4">
                        قارن من اليوم الأول — ليس فقط أمس
                    </p>

                    <div className="grid grid-cols-2 gap-2.5">
                        {([
                            { value: 'clearly_better',  emoji: '🌟', label: 'تحسّنت بوضوح',          color: '#00C88C', desc: 'الفرق واضح' },
                            { value: 'slightly_better', emoji: '📈', label: 'تحسّنت قليلاً',          color: '#F59E0B', desc: 'تحسن بطيء' },
                            { value: 'no_change',       emoji: '😐', label: 'ما زلت في نفس المكان', color: '#64748B', desc: 'لا فرق' },
                            { value: 'worse',           emoji: '😟', label: 'الأمور تراجعت',          color: '#EF4444', desc: 'تراجع ملحوظ' },
                        ] as Array<{ value: ImprovementLevel; emoji: string; label: string; color: string; desc: string }>
                        ).map(opt => (
                            <motion.button key={opt.value}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { haptic.tap(); setImprovement(opt.value); }}
                                className="flex flex-col items-center py-4 px-3 rounded-[16px]"
                                style={{
                                    background: improvement === opt.value ? `${opt.color}18` : 'rgba(255,255,255,0.04)',
                                    border: `1.5px solid ${improvement === opt.value ? opt.color : 'rgba(255,255,255,0.07)'}`,
                                    boxShadow: improvement === opt.value ? `0 4px 16px ${opt.color}25` : 'none',
                                }}>
                                <span className="text-[28px] mb-1.5">{opt.emoji}</span>
                                <p className="text-white/90 text-[11px] font-black text-center leading-tight">{opt.label}</p>
                                <p className="text-white/35 text-[9px] font-medium text-center mt-0.5">{opt.desc}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* ══ القسم 2: العرض المتبقي ══ */}
                <div>
                    <p className="text-white text-[15px] font-black mb-1">
                        ما العرض الذي ما زال يؤثر عليك؟
                    </p>
                    <p className="text-white/40 text-[11px] font-medium mb-3">اختياري</p>
                    <textarea
                        value={symptomNote}
                        onChange={e => setSymptomNote(e.target.value.slice(0, 150))}
                        placeholder="مثال: التعب في الصباح ما زال شديداً..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-[14px] text-sm font-medium resize-none"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1.5px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.80)',
                            outline: 'none',
                            fontFamily: 'inherit',
                        }}
                    />
                </div>

                {/* ══ القسم 3: الخطوة التالية ══ */}
                <div>
                    <p className="text-white text-[15px] font-black mb-1">
                        ماذا تريد فعله؟
                    </p>
                    {improvement && (
                        <p className="text-white/40 text-[11px] font-medium mb-3">
                            {improvement === 'clearly_better' || improvement === 'slightly_better'
                                ? 'التحسن مشجّع — الاستمرار خيار جيد'
                                : improvement === 'worse'
                                    ? 'وضعك يحتاج دعم مباشر — احجز جلسة'
                                    : 'إعادة التقييم قد يعطيك مساراً أدق'}
                        </p>
                    )}

                    <div className="flex flex-col gap-2.5">
                        {([
                            {
                                value: 'continue' as NextAction,
                                Icon: Target, emoji: '🔄',
                                label: 'استمر في البروتوكول',
                                desc: 'واصل مسارك الحالي',
                                borderColor: color,
                            },
                            {
                                value: 'full_reassess' as NextAction,
                                Icon: RefreshCw, emoji: '🔍',
                                label: 'أعد تقييم مسارك الكامل',
                                desc: 'ابدأ من أسئلة جديدة',
                                borderColor: '#7DD3FC',
                            },
                            {
                                value: 'book_session' as NextAction,
                                Icon: Phone, emoji: '📞',
                                label: 'احجز جلسة مع متخصص',
                                desc: 'دعم شخصي مباشر',
                                borderColor: '#818CF8',
                            },
                        ]).map(opt => (
                            <motion.button key={opt.value}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => { haptic.tap(); setNextAction(opt.value); }}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] text-right"
                                style={{
                                    background: nextAction === opt.value ? `${opt.borderColor}18` : 'rgba(255,255,255,0.04)',
                                    border: `1.5px solid ${nextAction === opt.value ? opt.borderColor : 'rgba(255,255,255,0.07)'}`,
                                    boxShadow: nextAction === opt.value ? `0 4px 14px ${opt.borderColor}20` : 'none',
                                }}>
                                <span className="text-[20px] flex-shrink-0">{opt.emoji}</span>
                                <div className="flex-1 text-right">
                                    <p className="text-white/90 text-[12px] font-black">{opt.label}</p>
                                    <p className="text-white/35 text-[10px] font-medium">{opt.desc}</p>
                                </div>
                                {nextAction === opt.value && (
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: opt.borderColor }}>
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Submit */}
            <div className="fixed bottom-0 inset-x-0 px-5 pb-8 pt-4"
                style={{ background: 'linear-gradient(to top, #021828, transparent)' }}>
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={!improvement || !nextAction}
                    onClick={handleSubmit}
                    className="w-full py-4 rounded-[18px] flex items-center justify-center gap-2"
                    style={{
                        background: (improvement && nextAction)
                            ? `linear-gradient(135deg, ${color}40, ${colorAlt}28)`
                            : 'rgba(255,255,255,0.06)',
                        border: `1.5px solid ${(improvement && nextAction) ? color + '55' : 'rgba(255,255,255,0.07)'}`,
                        boxShadow: (improvement && nextAction) ? `0 12px 32px ${color}25` : 'none',
                        opacity: (improvement && nextAction) ? 1 : 0.5,
                    }}>
                    <span className="text-white font-black text-[15px]">
                        {!improvement ? 'اختر مستوى التحسن أولاً' :
                         !nextAction  ? 'اختر الخطوة التالية' :
                         'تأكيد ←'}
                    </span>
                </motion.button>
            </div>
        </div>
    );
}

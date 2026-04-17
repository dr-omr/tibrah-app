'use client';
/**
 * AdaptiveHandoff.tsx — Sprint 6: Clinical Conversion Layer
 * ──────────────────────────────────────────────────────────
 * 4 حالات سريرية واضحة مع نبرة وتصميم مختلف لكل حالة:
 *
 *   continue            → أنت تتحسن — استمر (هادئ، أخضر)
 *   repeat_today_gently → إعادة بلطف (برتقالي خفيف)
 *   reassess_now        → أعد التقييم (رمادي محايد)
 *   book_session        → احجز جلسة (بطاقة كبيرة + urgency طبية واضحة)
 *
 * book_session يُعرض بـ 4 رسائل مختلفة حسب السبب:
 *   no_response   → "رغم الالتزام — حالتك تحتاج تقييم أعمق"
 *   worsening     → "الأعراض تصاعدت — استشارة طبية ضرورية"
 *   partial+low   → "البروتوكول وحده قد لا يكفي"
 *   completed     → "أتممت — الخطوة التالية: تقييم مع الطبيب"
 */

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, RotateCcw, Search, CalendarDays, AlertCircle, CheckCircle2 } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { getProtocolDay } from '@/lib/care-plan-store';
import { getDayOutcomes, getProtocolBaseline, getPlanId, getMissingDays } from '@/lib/outcome-store';
import { computeTrend, TREND_INFO, HANDOFF_INFO } from '@/lib/outcome-trend-engine';
import { trackEvent } from '@/lib/analytics';
import { createPageUrl } from '@/utils';
import type { SavedCarePlan } from '@/lib/care-plan-store';

/* ─── Props ─────────────────────────────────────── */
interface AdaptiveHandoffProps {
    plan: SavedCarePlan;
    domainColor: string;
}

/* ─── Clinical copy by handoff reason ───────────── */
function getBookingCopy(trend: ReturnType<typeof computeTrend>) {
    if (trend.trend === 'worsening') {
        return {
            urgency: 'عاجل',
            urgencyColor: '#EF4444',
            icon: '🚨',
            title: 'الأعراض تصاعدت',
            body: 'مؤشراتك تُظهر تراجعاً رغم المتابعة — هذا يستدعي استشارة طبية لتقييم السبب وضبط الخطة.',
            cta: 'احجز استشارة الآن',
        };
    }
    if (trend.trend === 'no_response') {
        return {
            urgency: 'توصية سريرية',
            urgencyColor: '#6366F1',
            icon: '🩺',
            title: 'رغم الالتزام — لا تغيير واضح',
            body: 'الالتزام جيد لكن الأعراض لم تتغير بما يكفي. هذا يعني أن الجذر أعمق ويحتاج تقييم مع الطبيب.',
            cta: 'احجز تقييماً متعمقاً',
        };
    }
    if (trend.trend === 'partial_response') {
        return {
            urgency: 'اقتراح',
            urgencyColor: '#D97706',
            icon: '💡',
            title: 'البروتوكول وحده قد لا يكفي',
            body: 'التحسّن جزئي — جلسة مع الطبيب ستُحدد إذا كنت تحتاج تعديل البروتوكول أو دعم إضافي.',
            cta: 'احجز للمراجعة',
        };
    }
    // completed / default
    return {
        urgency: 'أتممت البروتوكول',
        urgencyColor: '#0D9488',
        icon: '🎯',
        title: 'الخطوة التالية: تقييم مع الطبيب',
        body: 'أكملت أسبوعك بنجاح — التقييم مع الطبيب يُقيس النتيجة ويُقرّر الخطوة الأنسب للاستمرار.',
        cta: 'احجز جلسة المتابعة',
    };
}

/* ════════════════════════════════════════════════════════
   BOOKING CLINICAL CARD — يظهر فقط لـ book_session
   بطاقة كبيرة تشعر بأنها توصية طبية فعلية
   ════════════════════════════════════════════════════════ */
function BookingClinicalCard({ trend, plan, domainColor }: {
    trend: ReturnType<typeof computeTrend>;
    plan: SavedCarePlan;
    domainColor: string;
}) {
    const copy = getBookingCopy(trend);
    const isUrgent = trend.trend === 'worsening';

    return (
        <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 280, damping: 28 }}
            className="overflow-hidden rounded-[22px]"
            style={{
                background: isUrgent ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${copy.urgencyColor}30`,
                boxShadow: isUrgent ? `0 8px 32px ${copy.urgencyColor}15` : '0 4px 20px rgba(0,0,0,0.10)',
            }}
        >
            {/* Top urgency bar */}
            <div className="px-4 pt-3.5 pb-2.5 flex items-center gap-2">
                <div
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: `${copy.urgencyColor}20` }}
                >
                    {isUrgent
                        ? <AlertCircle style={{ width: 12, height: 12, color: copy.urgencyColor }} />
                        : <CalendarDays style={{ width: 11, height: 11, color: copy.urgencyColor }} />
                    }
                </div>
                <span
                    className="text-[9px] font-black uppercase tracking-widest"
                    style={{ color: copy.urgencyColor }}
                >
                    {copy.urgency}
                </span>
                <div className="flex-1" />
                {/* Pulsing dot for urgent */}
                {isUrgent && (
                    <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ background: copy.urgencyColor }}
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                    />
                )}
            </div>

            {/* Divider */}
            <div className="h-px mx-4" style={{ background: `${copy.urgencyColor}15` }} />

            {/* Body */}
            <div className="px-4 py-3.5">
                <div className="flex items-start gap-3 mb-3">
                    <span className="text-[28px] flex-shrink-0 mt-0.5">{copy.icon}</span>
                    <div className="flex-1">
                        <p className="text-[13px] font-black text-slate-700 leading-snug mb-1.5">
                            {copy.title}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium leading-[1.55]">
                            {copy.body}
                        </p>
                    </div>
                </div>

                {/* Trend data strip */}
                <div className="flex gap-1.5 mb-4">
                    <span className="text-[8px] font-bold px-2 py-1 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.05)', color: '#64748B' }}>
                        {trend.daysAnalyzed} أيام مسجّلة
                    </span>
                    <span className="text-[8px] font-bold px-2 py-1 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.05)', color: '#64748B' }}>
                        التزام {trend.adherenceRate}%
                    </span>
                    {trend.scoreChange !== null && trend.scoreChange !== 0 && (
                        <span className="text-[8px] font-bold px-2 py-1 rounded-full"
                            style={{
                                background: trend.scoreChange < 0 ? 'rgba(0,200,140,0.10)' : 'rgba(239,68,68,0.10)',
                                color: trend.scoreChange < 0 ? 'rgba(0,140,90,0.9)' : '#DC2626',
                            }}>
                            {trend.scoreChange < 0 ? `↗ تحسّن ${Math.abs(trend.scoreChange)}` : `↘ ارتفع ${trend.scoreChange}`}
                        </span>
                    )}
                </div>

                {/* Book CTA */}
                <Link
                    href={createPageUrl('BookAppointment')}
                    onClick={() => {
                        haptic.impact();
                        trackEvent('protocol_booking_clicked', {
                            from: 'adaptive_handoff_clinical',
                            subdomain: plan.routing.primary_subdomain,
                            trend: trend.trend,
                            reason: copy.urgency,
                        });
                    }}
                >
                    <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-2.5 py-3.5 rounded-[14px]"
                        style={{
                            background: isUrgent
                                ? `linear-gradient(135deg, ${copy.urgencyColor}25, ${copy.urgencyColor}15)`
                                : `linear-gradient(135deg, ${domainColor}22, ${domainColor}12)`,
                            border: `1.5px solid ${copy.urgencyColor}35`,
                        }}
                    >
                        <span className="text-[14px] font-black text-slate-700">{copy.cta}</span>
                        <ArrowLeft
                            className="w-4 h-4"
                            style={{ color: copy.urgencyColor }}
                        />
                    </motion.div>
                </Link>
            </div>
        </motion.div>
    );
}

/* ════════════════════════════════════════════════════
   COMPACT STATUS CARD — للحالات الأخرى (continue / repeat / reassess)
   ════════════════════════════════════════════════════ */
function CompactHandoffCard({ trend, plan, domainColor }: {
    trend: ReturnType<typeof computeTrend>;
    plan: SavedCarePlan;
    domainColor: string;
}) {
    const handoffInfo = HANDOFF_INFO[trend.handoff];

    type TrendColorKey = Exclude<typeof trend.trend, 'insufficient_data'>;
    const cardColors: Record<TrendColorKey, { bg: string; border: string; textColor: string }> = {
        responding:       { bg: 'rgba(0,200,140,0.07)', border: 'rgba(0,200,140,0.22)', textColor: 'rgba(0,140,90,0.9)' },
        partial_response: { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.22)', textColor: '#D97706' },
        no_response:      { bg: 'rgba(100,116,139,0.07)', border: 'rgba(100,116,139,0.20)', textColor: '#475569' },
        worsening:        { bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.25)', textColor: '#DC2626' },
    };

    const cc = cardColors[trend.trend as TrendColorKey];

    const titleByTrend: Record<TrendColorKey, string> = {
        responding: `أنت تتحسن — الالتزام ${trend.adherenceRate}%`,
        partial_response: `تحسن تدريجي — الالتزام ${trend.adherenceRate}%`,
        no_response: `الالتزام جيد (${trend.adherenceRate}%) — لا تغيير واضح بعد`,
        worsening: `مؤشرات تراجع — تحتاج دعم أعمق`,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, type: 'spring', stiffness: 260, damping: 26 }}
            className="overflow-hidden rounded-[20px]"
            style={{ background: cc.bg, border: `1px solid ${cc.border}` }}
        >
            <div className="px-4 pt-4 pb-3">
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-[20px] flex-shrink-0">
                        {trend.trend === 'responding' ? '📈' : trend.trend === 'partial_response' ? '🔄' : trend.trend === 'no_response' ? '🔍' : '⚠️'}
                    </span>
                    <div className="flex-1">
                        <p className="text-[11.5px] font-black" style={{ color: cc.textColor }}>
                            {titleByTrend[trend.trend as TrendColorKey]}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                            بناءً على {trend.daysAnalyzed} يوم مسجّل
                            {trend.scoreChange !== null && trend.scoreChange !== 0 && (
                                <> · الأعراض {trend.scoreChange < 0 ? `تحسّنت ${Math.abs(trend.scoreChange)} نقطة` : `ارتفعت ${trend.scoreChange} نقطة`}</>
                            )}
                        </p>
                    </div>
                </div>

                {/* Pills */}
                <div className="flex gap-1.5 mb-3">
                    <span className="text-[8px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: `${domainColor}12`, color: domainColor }}>
                        {trend.adherenceLevel === 'strong' ? '💪 التزام قوي' : trend.adherenceLevel === 'usable' ? '✊ التزام مقبول' : '⚠️ التزام منخفض'}
                    </span>
                    {trend.direction !== 'unknown' && (
                        <span className="text-[8px] font-bold px-2.5 py-1 rounded-full"
                            style={{
                                background: trend.direction === 'improving' ? 'rgba(0,200,140,0.12)' :
                                            trend.direction === 'worsening' ? 'rgba(239,68,68,0.12)' : 'rgba(0,0,0,0.06)',
                                color: trend.direction === 'improving' ? 'rgba(0,140,90,0.9)' :
                                       trend.direction === 'worsening' ? '#DC2626' : '#64748B',
                            }}>
                            {trend.direction === 'improving' ? '↗ تحسن' : trend.direction === 'worsening' ? '↘ تراجع' : '→ ثابت'}
                        </span>
                    )}
                </div>

                <div className="h-px mb-3" style={{ background: cc.border }} />

                {/* Handoff CTA */}
                <Link
                    href={handoffInfo.href}
                    onClick={() => {
                        haptic.tap();
                        trackEvent('protocol_handoff_clicked', {
                            from: 'adaptive_handoff',
                            handoff: trend.handoff,
                            subdomain: plan.routing.primary_subdomain,
                        });
                    }}
                >
                    <motion.div
                        whileTap={{ scale: 0.97, y: 1 }}
                        className="flex items-center gap-3 px-3 py-3 rounded-[14px]"
                        style={{ background: `${domainColor}0D`, border: `1px solid ${domainColor}22` }}
                    >
                        <span className="text-[18px] flex-shrink-0">{handoffInfo.emoji}</span>
                        <div className="flex-1">
                            <p className="text-[11px] font-black text-slate-700">{handoffInfo.label}</p>
                            <p className="text-[9px] text-slate-400 font-medium mt-0.5">{handoffInfo.description}</p>
                        </div>
                        <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" style={{ color: domainColor, opacity: 0.5 }} />
                    </motion.div>
                </Link>
            </div>
        </motion.div>
    );
}

/* ════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════ */
export function AdaptiveHandoff({ plan, domainColor }: AdaptiveHandoffProps) {
    const result = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const planId     = getPlanId(plan.createdAt);
        const currentDay = getProtocolDay(plan);
        const outcomes   = getDayOutcomes(planId);
        const baseline   = getProtocolBaseline(planId);
        const missing    = getMissingDays(planId, currentDay);
        return {
            planId,
            currentDay,
            trend: computeTrend(outcomes, baseline, currentDay, missing),
        };
    }, [plan]);

    if (!result) return null;

    const { trend } = result;

    // ── No data yet: CTA للأول check-in ──
    if (trend.trend === 'insufficient_data') {
        return (
            <Link href="/protocol-checkin" onClick={() => haptic.tap()}>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 26 }}
                    className="relative overflow-hidden rounded-[18px] px-4 py-3.5 flex items-center gap-3"
                    style={{ background: `${domainColor}0A`, border: `1.5px dashed ${domainColor}35` }}
                >
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                        style={{ background: `${domainColor}18`, border: `1px solid ${domainColor}28` }}>
                        <span className="text-[18px]">📋</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-[11.5px] font-black text-slate-700">سجّل يومك الأول</p>
                        <p className="text-[9px] font-medium text-slate-400 mt-0.5">
                            كل check-in يساعد طِبرة يفهم تحسّنك الحقيقي
                        </p>
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" style={{ color: domainColor, opacity: 0.6 }} />
                </motion.div>
            </Link>
        );
    }

    // ── Weak signal: don't show anything yet ──
    if (trend.hasWeakSignal) return null;

    // ── book_session → Clinical card (larger, more prominent) ──
    if (trend.handoff === 'book_session') {
        return <BookingClinicalCard trend={trend} plan={plan} domainColor={domainColor} />;
    }

    // ── Other states: compact card ──
    return <CompactHandoffCard trend={trend} plan={plan} domainColor={domainColor} />;
}



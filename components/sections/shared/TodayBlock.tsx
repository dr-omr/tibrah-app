'use client';
/**
 * TodayBlock.tsx — بلوك اليوم: حلقة السلوك العلاجي اليومية
 * ─────────────────────────────────────────────────────────
 * Sprint 1: Protocol-Aware — 3 حالات واضحة:
 *
 *  State 1: Active Protocol
 *    اليوم X من 7 · هدف الأسبوع · أداة اليوم · ما يُقاس · القادم
 *
 *  State 2: No Active Protocol (fallback)
 *    عادات صحية افتراضية + CTA للتقييم
 *
 *  State 3: Completed / Waiting Reassessment
 *    "أكملت البروتوكول" + CTA إعادة التقييم
 *
 * Backward compatible: Props الحالية تعمل بدون تغيير.
 * adherence ≠ outcome — الفرق مُضمّن في DayProtocol.
 */

import React, { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Check, ArrowLeft, Calendar, Target, ChevronLeft, Repeat, Zap, BarChart2, RefreshCw } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import {
    getActiveCarePlan,
    getTodayChecklist,
    saveDailyChecklist,
    getStreak,
    getProtocolDay,
    getProtocolProgress,
    getProtocolReassessment,
} from '@/lib/care-plan-store';
import { SUBDOMAIN_BY_ID } from '@/lib/domain-routing-map';
import { getProtocol, getDayProtocol, PHASE_LABELS } from '@/lib/protocol-engine';
import { hasTodayOutcome, getPlanId } from '@/lib/outcome-store';
import type { DomainId } from '@/components/health-engine/types';

/* ─── Types ─────────────────────────────────────── */
interface TodayAction {
    id: string;
    emoji: string;
    label: string;
    href?: string;
}

interface TodayBlockProps {
    domainId: DomainId;
    color: string;
    colorAlt: string;
    question?: string;
    fallbackActions?: TodayAction[];
    /** Override protocol rendering (default: auto-detect from plan) */
    showProtocol?: boolean;
}

/* ─── Fallback defaults per domain ──────────────── */
const DOMAIN_FALLBACK: Record<DomainId, TodayAction[]> = {
    jasadi: [
        { id: 'water',  emoji: '💧', label: 'اشرب كوب ماء الآن' },
        { id: 'breathe', emoji: '🫁', label: 'تنفس عميق ٣ دقائق', href: '/breathe' },
        { id: 'move',   emoji: '🚶', label: 'تحرّك ١٠ دقائق', href: '/programs/movement' },
        { id: 'log',    emoji: '📝', label: 'سجّل حالتك اليوم', href: '/quick-check-in' },
    ],
    nafsi: [
        { id: 'breathe', emoji: '🫁', label: 'تنفس ٣ دقائق الآن', href: '/breathe' },
        { id: 'journal', emoji: '✍️', label: 'كتابة حرة ٥ دقائق', href: '/tools/journal' },
        { id: 'check',  emoji: '🌡️', label: 'تفقّد مشاعرك', href: '/quick-check-in' },
    ],
    fikri: [
        { id: 'brain',  emoji: '🧠', label: 'تفريغ دماغي ٥ دقائق', href: '/tools/journal' },
        { id: 'focus',  emoji: '🎯', label: 'حدد أولوية اليوم الواحدة' },
        { id: 'log',    emoji: '📝', label: 'سجّل أفكارك', href: '/quick-check-in' },
    ],
    ruhi: [
        { id: 'grounded', emoji: '🌿', label: 'لحظة تأريض ٢ دقيقة', href: '/tools/grounding' },
        { id: 'gratitude', emoji: '🙏', label: '٣ أشياء شاكر عليها' },
        { id: 'quiet',  emoji: '🔇', label: '١٠ دقائق بلا شاشة' },
    ],
};

/* ═══════════════════════════════════════════════════════════
   STATE 1: Protocol Habit Loop
   ═══════════════════════════════════════════════════════════ */
function ProtocolHabitLoop({
    color, colorAlt,
}: { color: string; colorAlt: string }) {
    const plan = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return getActiveCarePlan();
    }, []);

    const protocol = useMemo(() => {
        if (!plan) return null;
        return getProtocol(plan.routing.primary_subdomain);
    }, [plan]);

    const currentDay    = useMemo(() => plan ? getProtocolDay(plan) : 1,   [plan]);
    const streak        = useMemo(() => plan ? getStreak(plan) : 0,        [plan]);
    const progress      = useMemo(() =>
        plan && protocol ? getProtocolProgress(plan, protocol) : null, [plan, protocol]);
    const reassessment  = useMemo(() =>
        plan && protocol ? getProtocolReassessment(plan, protocol) : null, [plan, protocol]);
    const hasDoneCheckin = useMemo(() => {
        if (!plan) return false;
        const pid = getPlanId(plan.createdAt);
        const day = getProtocolDay(plan);
        return hasTodayOutcome(pid, day);
    }, [plan]);

    const dayProto = useMemo(() =>
        protocol ? getDayProtocol(protocol, currentDay) : null, [protocol, currentDay]);

    // Checklist state
    const [doneIds, setDoneIds] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        const p = getActiveCarePlan();
        return p ? getTodayChecklist(p) : [];
    });

    const toggleDone = useCallback((id: string) => {
        haptic.tap();
        setDoneIds(prev => {
            const next = prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id];
            const p = getActiveCarePlan();
            if (p) saveDailyChecklist(next);
            return next;
        });
    }, []);

    if (!plan || !protocol || !dayProto || !progress) return null;

    const phase    = progress.phase;
    const phaseInfo = PHASE_LABELS[phase];
    const isTaskDone = doneIds.includes(dayProto.toolId);

    // Completed state
    if (reassessment?.needed && progress.completedDays >= 5) {
        return <ProtocolCompleted color={color} colorAlt={colorAlt} protocol={protocol} />;
    }

    // Next day preview
    const nextDayNum = Math.min(currentDay + 1, protocol.totalDays);
    const nextDayProto = getDayProtocol(protocol, nextDayNum);

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.08 }}
            className="mx-4 mb-5 rounded-[22px] relative overflow-hidden"
            style={{
                background: [
                    'linear-gradient(152deg,',
                    `  ${color}0D 0%,`,
                    '  rgba(255,255,255,0.93) 38%,',
                    `  ${colorAlt}09 100%`,
                    ')',
                ].join(''),
                border: '1px solid rgba(255,255,255,0.75)',
                borderTop: '1px solid rgba(255,255,255,0.95)',
                backdropFilter: 'blur(36px)',
                WebkitBackdropFilter: 'blur(36px)',
                boxShadow: `0 2px 0 rgba(255,255,255,0.95) inset, 0 12px 32px ${color}12`,
            }}
        >
            {/* Ambient glow */}
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${color}16, transparent 70%)`, filter: 'blur(14px)' }} />

            <div className="relative z-10 p-4">

                {/* ── Row 1: Day counter + streak ── */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-1">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                        <span className="text-[11px] font-black text-slate-700">
                            اليوم <span style={{ color }}>{currentDay}</span>
                            <span className="text-slate-400 font-bold"> من {protocol.totalDays}</span>
                        </span>
                        {/* Phase badge */}
                        <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: `${color}14`, color }}>
                            {phaseInfo.emoji} {phaseInfo.ar}
                        </span>
                    </div>
                    {streak > 0 && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: 'rgba(245,158,11,0.12)', color: '#D97706' }}>
                            🔥 {streak} {streak === 1 ? 'يوم' : 'أيام'}
                        </span>
                    )}
                </div>

                {/* ── Week Goal ── */}
                <div className="mb-3 px-3 py-2 rounded-[12px]"
                    style={{ background: `${color}08`, border: `1px solid ${color}14` }}>
                    <p className="text-[8.5px] font-black uppercase tracking-[0.12em] mb-0.5" style={{ color, opacity: 0.7 }}>
                        هدف الأسبوع
                    </p>
                    <p className="text-[10.5px] font-bold text-slate-600 leading-snug">
                        {protocol.weekGoal}
                    </p>
                </div>

                {/* ── Protocol Progress bar ── */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] font-bold text-slate-400">التقدم الكلي</span>
                        <span className="text-[8px] font-black" style={{ color }}>
                            {progress.adherencePercent}%
                        </span>
                    </div>
                    <div className="h-[3.5px] rounded-full overflow-hidden" style={{ background: `${color}14` }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(to right, ${color}, ${colorAlt})` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.adherencePercent}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* ── Today's Tool (CTA رئيسي) ── */}
                <div className="mb-3">
                    <p className="text-[8.5px] font-black uppercase tracking-[0.12em] mb-1.5" style={{ color, opacity: 0.8 }}>
                        ⚡ أداة اليوم
                    </p>
                    <Link href={dayProto.toolHref} onClick={() => haptic.tap()}>
                        <motion.div
                            whileTap={{ scale: 0.97, y: 1 }}
                            className="px-3 py-3 rounded-[14px] flex items-center gap-3 relative overflow-hidden"
                            style={{
                                background: isTaskDone
                                    ? 'rgba(0,200,140,0.08)'
                                    : `linear-gradient(135deg, ${color}18, ${colorAlt}10)`,
                                border: `1.5px solid ${isTaskDone ? 'rgba(0,200,140,0.35)' : color + '30'}`,
                                boxShadow: `0 4px 14px ${color}18`,
                            }}
                        >
                            {/* Checkbox */}
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={e => { e.preventDefault(); e.stopPropagation(); toggleDone(dayProto.toolId); }}
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: isTaskDone ? 'rgba(0,200,140,0.85)' : `${color}18`,
                                    border: `1.5px solid ${isTaskDone ? 'rgba(0,200,140,0.9)' : color + '40'}`,
                                    boxShadow: isTaskDone ? '0 2px 6px rgba(0,200,140,0.35)' : 'none',
                                }}
                            >
                                {isTaskDone && <Check className="w-3.5 h-3.5 text-white" />}
                            </motion.button>

                            <div className="flex-1 min-w-0">
                                <p className="text-[11.5px] font-black text-slate-700 leading-tight"
                                    style={{ textDecoration: isTaskDone ? 'line-through' : 'none', opacity: isTaskDone ? 0.6 : 1 }}>
                                    {dayProto.toolName}
                                </p>
                                <p className="text-[9px] font-medium text-slate-400 mt-0.5">
                                    {dayProto.durationMinutes} دقيقة · {dayProto.focus}
                                </p>
                            </div>

                            <ChevronLeft className="w-3.5 h-3.5 flex-shrink-0" style={{ color, opacity: 0.7 }} />
                        </motion.div>
                    </Link>
                </div>

                {/* ── Adherence + Outcome checks ── */}
                <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="px-2.5 py-2 rounded-[11px]"
                        style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(226,232,240,0.4)' }}>
                        <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest mb-1">الإنجاز</p>
                        <p className="text-[9px] font-bold text-slate-600 leading-tight">{dayProto.adherenceCheck}</p>
                    </div>
                    <div className="px-2.5 py-2 rounded-[11px]"
                        style={{ background: `${color}07`, border: `1px solid ${color}14` }}>
                        <p className="text-[7.5px] font-black uppercase tracking-widest mb-1" style={{ color, opacity: 0.7 }}>
                            التحسن
                        </p>
                        <p className="text-[9px] font-bold text-slate-600 leading-tight">{dayProto.outcomeCheck}</p>
                    </div>
                </div>

                {/* ── Note ── */}
                {dayProto.note && (
                    <div className="mb-3 px-3 py-2 rounded-[11px]"
                        style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)' }}>
                        <p className="text-[9px] font-bold text-amber-700 leading-snug">
                            💡 {dayProto.note}
                        </p>
                    </div>
                )}

                {/* ── Next best action (tomorrow preview) ── */}
                {currentDay < protocol.totalDays && (
                    <div className="flex items-center gap-2 pt-2.5 mb-2"
                        style={{ borderTop: `1px solid ${color}12` }}>
                        <span className="text-[8.5px] font-bold text-slate-400 flex-1">
                            التالي غداً:&nbsp;
                            <span className="text-slate-500 font-bold">{nextDayProto.toolName}</span>
                        </span>
                        <span className="text-[7.5px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${color}10`, color }}>
                            {PHASE_LABELS[nextDayProto.phase].emoji} {PHASE_LABELS[nextDayProto.phase].ar}
                        </span>
                    </div>
                )}

                {/* ── Daily check-in CTA ── */}
                <Link href="/protocol-checkin" onClick={() => haptic.tap()}>
                    <motion.div whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-[12px]"
                        style={{
                            background: hasDoneCheckin ? 'rgba(0,200,140,0.08)' : `${color}0A`,
                            border: `1px solid ${hasDoneCheckin ? 'rgba(0,200,140,0.22)' : color + '20'}`,
                        }}>
                        <span className="text-[15px]">{hasDoneCheckin ? '✅' : '📋'}</span>
                        <div className="flex-1">
                            <p className="text-[10px] font-black"
                                style={{ color: hasDoneCheckin ? 'rgba(0,140,90,0.9)' : color }}>
                                {hasDoneCheckin ? 'سجّلت اليوم' : 'سجّل حالتك اليوم'}
                            </p>
                            {!hasDoneCheckin && (
                                <p className="text-[8.5px] text-slate-400 font-medium">
                                    ٢٠ ثانية — يساعد طِبرة يفهم تقدّمك
                                </p>
                            )}
                        </div>
                        {!hasDoneCheckin && (
                            <ArrowLeft className="w-3 h-3 flex-shrink-0" style={{ color, opacity: 0.5 }} />
                        )}
                    </motion.div>
                </Link>

                {/* ── Reassessment nudge (not yet completed) ── */}
                {reassessment?.needed && progress.completedDays < 5 && (
                    <ReassessmentNudge reason={reassessment.reason} urgency={reassessment.urgency} color={color} />
                )}
            </div>
        </motion.div>
    );
}

/* ─── Reassessment Nudge ─────────────────────────── */
function ReassessmentNudge({
    reason, urgency, color,
}: { reason: string; urgency: 'low' | 'high'; color: string }) {
    const isHigh = urgency === 'high';
    const msgs: Record<string, string> = {
        time:        'وصلت اليوم 7 — هل تحسّن وضعك؟',
        completion:  'أكملت البروتوكول مبكراً! حان وقت إعادة التقييم.',
        bad_outcome: 'يبدو أن هناك عائق — ربما تحتاج دعم أعمق.',
        none:        '',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 px-3 py-2.5 rounded-[12px] flex items-center gap-3"
            style={{
                background: isHigh ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${isHigh ? 'rgba(239,68,68,0.20)' : 'rgba(245,158,11,0.22)'}`,
            }}
        >
            <span className="text-[16px]">{isHigh ? '🚨' : '⏰'}</span>
            <div className="flex-1">
                <p className="text-[10px] font-black" style={{ color: isHigh ? '#DC2626' : '#D97706' }}>
                    {msgs[reason]}
                </p>
                {isHigh ? (
                    <Link href="/book-appointment">
                        <span className="text-[9px] font-bold text-rose-500 underline">احجز جلسة تشخيصية</span>
                    </Link>
                ) : (
                    <Link href="/symptom-checker">
                        <span className="text-[9px] font-bold" style={{ color }}>
                            أعد التقييم الآن ←
                        </span>
                    </Link>
                )}
            </div>
        </motion.div>
    );
}

/* ─── Completed State ────────────────────────────── */
function ProtocolCompleted({
    color, colorAlt, protocol,
}: { color: string; colorAlt: string; protocol: { arabicTitle: string } }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 mb-5 p-4 rounded-[22px]"
            style={{
                background: 'linear-gradient(145deg, rgba(0,200,140,0.08), rgba(0,200,140,0.04))',
                border: '1px solid rgba(0,200,140,0.25)',
                backdropFilter: 'blur(20px)',
            }}
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,200,140,0.14)', border: '1px solid rgba(0,200,140,0.25)' }}>
                    <span className="text-[20px]">🎉</span>
                </div>
                <div className="flex-1">
                    <p className="text-[12px] font-black mb-0.5" style={{ color: 'rgba(0,140,90,0.9)' }}>
                        أكملت {protocol.arabicTitle}!
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 mb-3">
                        الخطوة التالية: أعد التقييم لمعرفة تحسّنك وتحديد مسارك القادم.
                    </p>
                    <Link href="/symptom-checker">
                        <motion.div whileTap={{ scale: 0.96 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px]"
                            style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
                            <RefreshCw className="w-3 h-3" style={{ color }} />
                            <span className="text-[10px] font-black" style={{ color }}>
                                أعد التقييم الآن
                            </span>
                        </motion.div>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   STATE 2 & 3: Fallback Loop (no plan or no protocol)
   ═══════════════════════════════════════════════════════════ */
function FallbackHabitLoop({
    domainId, color, colorAlt, question, fallbackActions,
}: {
    domainId: DomainId;
    color: string; colorAlt: string;
    question: string;
    fallbackActions?: TodayAction[];
}) {
    const actions = fallbackActions ?? DOMAIN_FALLBACK[domainId] ?? DOMAIN_FALLBACK.jasadi;

    const [doneIds, setDoneIds] = useState<string[]>([]);
    const toggleDone = (id: string) => {
        haptic.tap();
        setDoneIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const progress = actions.length > 0 ? (doneIds.length / actions.length) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.08 }}
            className="mx-4 mb-5 rounded-[22px] p-4 relative overflow-hidden"
            style={{
                background: [
                    'linear-gradient(148deg,',
                    `  ${color}0C 0%,`,
                    '  rgba(255,255,255,0.92) 40%,',
                    `  ${colorAlt}08 100%`,
                    ')',
                ].join(''),
                border: '1px solid rgba(255,255,255,0.72)',
                borderTop: '1px solid rgba(255,255,255,0.94)',
                backdropFilter: 'blur(36px)',
                WebkitBackdropFilter: 'blur(36px)',
                boxShadow: `0 2px 0 rgba(255,255,255,0.95) inset, 0 10px 30px ${color}12`,
            }}
        >
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${color}14, transparent 70%)`, filter: 'blur(8px)' }} />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2.5">
                    <Sun className="w-4 h-4 flex-shrink-0" style={{ color }} />
                    <p className="text-[11px] font-black text-slate-700 flex-1">{question}</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${color}14`, color }}>
                        {doneIds.length}/{actions.length}
                    </span>
                </div>

                {/* Progress */}
                <div className="h-[3.5px] rounded-full mb-3 overflow-hidden" style={{ background: `${color}15` }}>
                    <motion.div className="h-full rounded-full"
                        style={{ background: `linear-gradient(to right, ${color}, ${colorAlt})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5">
                    {actions.map(a => {
                        const isDone = doneIds.includes(a.id);
                        const content = (
                            <motion.div layout
                                className="flex items-center gap-2.5 px-3 py-2 rounded-[12px]"
                                style={{
                                    background: isDone ? `${color}0C` : 'rgba(255,255,255,0.5)',
                                    border: isDone ? `1px solid ${color}22` : '1px solid rgba(226,232,240,0.3)',
                                    opacity: isDone ? 0.7 : 1,
                                }}
                            >
                                <motion.button whileTap={{ scale: 0.8 }}
                                    onClick={() => toggleDone(a.id)}
                                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: isDone ? color : 'transparent',
                                        border: isDone ? 'none' : `1.5px solid ${color}40`,
                                    }}>
                                    {isDone && <Check className="w-3 h-3 text-white" />}
                                </motion.button>
                                <span className="text-[13px] leading-none flex-shrink-0">{a.emoji}</span>
                                <span className="text-[10px] font-bold text-slate-600 flex-1"
                                    style={{ textDecoration: isDone ? 'line-through' : 'none' }}>
                                    {a.label}
                                </span>
                                {a.href && !isDone && (
                                    <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" style={{ color, opacity: 0.5 }} />
                                )}
                            </motion.div>
                        );
                        return a.href && !isDone
                            ? <Link key={a.id} href={a.href} onClick={() => haptic.tap()}>{content}</Link>
                            : <div key={a.id}>{content}</div>;
                    })}
                </div>

                {/* CTA to start assessment */}
                <Link href="/symptom-checker">
                    <motion.div whileTap={{ scale: 0.97 }}
                        className="mt-3 flex items-center gap-2 px-3 py-2 rounded-[12px]"
                        style={{
                            background: `${color}0A`,
                            border: `1px dashed ${color}28`,
                        }}>
                        <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color, opacity: 0.7 }} />
                        <p className="text-[9.5px] font-bold text-slate-500 flex-1">
                            ابدأ تقييمك للحصول على مسار علاجي مخصص
                        </p>
                        <ArrowLeft className="w-3 h-3 flex-shrink-0" style={{ color, opacity: 0.5 }} />
                    </motion.div>
                </Link>

                {/* All done celebration */}
                <AnimatePresence>
                    {doneIds.length === actions.length && actions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-3 text-center py-2">
                            <p className="text-[11px] font-black" style={{ color }}>🎉 أنجزت مهام اليوم!</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">استمر كده — التزامك يُسجَّل تلقائياً</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT — Auto-detects which state to render
   ═══════════════════════════════════════════════════════════ */
export function TodayBlock({
    domainId,
    color,
    colorAlt,
    question = 'ماذا تحتاج اليوم؟',
    fallbackActions,
    showProtocol,
}: TodayBlockProps) {
    // Detect mode
    const { hasActivePlan, hasProtocol: hasProt } = useMemo(() => {
        if (typeof window === 'undefined') return { hasActivePlan: false, hasProtocol: false };
        const plan = getActiveCarePlan();
        if (!plan) return { hasActivePlan: false, hasProtocol: false };
        const sub = plan.routing.primary_subdomain;
        return { hasActivePlan: true, hasProtocol: !!getProtocol(sub) };
    }, []);

    const shouldShowProtocol = showProtocol ?? (hasActivePlan && hasProt);

    if (shouldShowProtocol) {
        return <ProtocolHabitLoop color={color} colorAlt={colorAlt} />;
    }

    return (
        <FallbackHabitLoop
            domainId={domainId}
            color={color}
            colorAlt={colorAlt}
            question={question}
            fallbackActions={fallbackActions}
        />
    );
}

'use client';
/**
 * pages/tools/[type]/[id].tsx — Universal Tool Renderer (Sprint 3)
 * ════════════════════════════════════════════════════════════════════
 *
 * يُعالج كل أنواع الأدوات في صفحة واحدة:
 *   practice  → PracticeRenderer  (خطوات متسلسلة مع مؤقت)
 *   test      → TestRenderer      (أسئلة واحدة - نتيجة)
 *   workshop  → WorkshopRenderer  (أقسام قابلة للتوسيع)
 *   tracker   → TrackerRenderer   (حقول + حفظ يومي)
 *   protocol  → ProtocolRenderer  (مهام اليوم من tool-content-map)
 *
 * الطبقات:
 *   ToolHeader          — اسم + نوع + مدة
 *   ProtocolContextStrip — اليوم X من Y + هدف البروتوكول (إذا ربط)
 *   ToolBody            — الـ renderer المناسب
 *   CompletionScreen    — إكمال + check-in CTA + عُد للخطة
 *
 * Tracker storage key: tibrah_tracker_{planId}_{toolId}_{date}
 * لا يدمج tool-content-map مع protocol-engine — الفصل مُحافَظ عليه.
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { haptic } from '@/lib/HapticFeedback';
import {
    getToolContent,
    type ToolContent, type PracticeContent, type TestContent,
    type WorkshopContent, type TrackerContent, type ProtocolContent,
} from '@/lib/tool-content-map';
import {
    getActiveCarePlan,
    markToolOpened,
    markToolCompleted,
    getProtocolDay,
    getProtocolProgress,
} from '@/lib/care-plan-store';
import { getProtocol } from '@/lib/protocol-engine';
import { getPlanId, hasTodayOutcome } from '@/lib/outcome-store';
import { trackEvent } from '@/lib/analytics';

/* ─── Domain colors ─────────────────────────────── */
const DOMAIN_COLORS: Record<string, { color: string; colorAlt: string; bg: string }> = {
    jasadi: { color: '#00B7EB', colorAlt: '#0EA5E9', bg: 'rgba(0,183,235,0.07)' },
    nafsi:  { color: '#8B5CF6', colorAlt: '#7C3AED', bg: 'rgba(139,92,246,0.07)' },
    fikri:  { color: '#10B981', colorAlt: '#059669', bg: 'rgba(16,185,129,0.07)' },
    ruhi:   { color: '#F59E0B', colorAlt: '#D97706', bg: 'rgba(245,158,11,0.07)' },
};

const TYPE_LABELS: Record<string, { ar: string; emoji: string }> = {
    practice: { ar: 'تمرين',     emoji: '⚡' },
    test:     { ar: 'اختبار',    emoji: '📋' },
    workshop: { ar: 'ورشة',     emoji: '📖' },
    tracker:  { ar: 'متابعة',   emoji: '📊' },
    protocol: { ar: 'بروتوكول', emoji: '🗓️' },
};

/* ════════════════════════════════════════════════════
   PROTOCOL CONTEXT STRIP
   ════════════════════════════════════════════════════ */
interface ProtocolContextStripProps {
    subdomain: string;
    color: string;
}
function ProtocolContextStrip({ subdomain, color }: ProtocolContextStripProps) {
    const data = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const plan = getActiveCarePlan();
        if (!plan || plan.routing.primary_subdomain !== subdomain) return null;
        const protocol = getProtocol(subdomain);
        if (!protocol) return null;
        const day      = getProtocolDay(plan);
        const progress = getProtocolProgress(plan, protocol);
        return { day, totalDays: protocol.totalDays, weekGoal: protocol.weekGoal, progress };
    }, [subdomain]);

    if (!data) return null;

    return (
        <div className="mx-5 mb-4 px-3 py-2.5 rounded-[14px] flex items-center gap-2"
            style={{ background: `${color}09`, border: `1px solid ${color}22` }}>
            <span className="text-[14px]">🗓️</span>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black truncate" style={{ color }}>
                    اليوم <strong>{data.day}</strong> من {data.totalDays}
                </p>
                <p className="text-[8.5px] text-slate-400 font-medium truncate">{data.weekGoal}</p>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="text-[11px] font-black" style={{ color }}>{data.progress.adherencePercent}%</p>
                <p className="text-[7.5px] text-slate-400 font-medium">التزام</p>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════
   COMPLETION SCREEN
   ════════════════════════════════════════════════════ */
interface CompletionScreenProps {
    toolName: string;
    color: string;
    colorAlt: string;
    hasCheckinToday: boolean;
    toolId: string;
}
function CompletionScreen({ toolName, color, colorAlt, hasCheckinToday, toolId }: CompletionScreenProps) {
    useEffect(() => {
        trackEvent('completion_screen_viewed', { tool_id: toolId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
        >
            <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-[72px] mb-5"
            >🎉</motion.div>

            <h2 className="text-white text-[22px] font-black mb-2 leading-tight">
                أكملت {toolName}
            </h2>
            <p className="text-white/50 text-[13px] font-medium mb-8 max-w-[240px] leading-relaxed">
                كل إكمال يُقرّبك من التحسن الحقيقي. استمر.
            </p>

            {/* Primary: check-in if not done */}
            {!hasCheckinToday ? (
                <Link href="/protocol-checkin" className="w-full max-w-xs mb-3"
                    onClick={() => trackEvent('checkin_clicked_from_completion', { tool_id: toolId })}>
                    <motion.div whileTap={{ scale: 0.97 }}
                        className="py-4 rounded-[18px] flex items-center justify-center gap-2"
                        style={{
                            background: `linear-gradient(135deg, ${color}35, ${colorAlt}22)`,
                            border: `1.5px solid ${color}55`,
                            boxShadow: `0 10px 28px ${color}28`,
                        }}>
                        <span className="text-[16px]">📋</span>
                        <span className="text-white font-black text-[14px]">سجّل حالتك الآن</span>
                    </motion.div>
                </Link>
            ) : (
                <div className="w-full max-w-xs mb-3 py-3 px-4 rounded-[16px] flex items-center gap-2 justify-center"
                    style={{ background: 'rgba(0,200,140,0.10)', border: '1px solid rgba(0,200,140,0.22)' }}>
                    <span className="text-[14px]">✅</span>
                    <span className="text-[12px] font-black" style={{ color: 'rgba(0,140,90,0.9)' }}>
                        سجّلت اليوم بالفعل
                    </span>
                </div>
            )}

            {/* Secondary: back to plan */}
            <Link href="/my-plan" className="w-full max-w-xs"
                onClick={() => trackEvent('returned_to_my_plan', { source: 'completion_screen', tool_id: toolId })}>
                <motion.div whileTap={{ scale: 0.97 }}
                    className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                    <span className="text-white/70 font-bold text-[13px]">عُد لخطّتي</span>
                    <ArrowLeft className="w-3.5 h-3.5 text-white/40" />
                </motion.div>
            </Link>
        </motion.div>
    );
}

/* ════════════════════════════════════════════════════
   PRACTICE RENDERER
   ════════════════════════════════════════════════════ */
function PracticeRenderer({
    content, color, onComplete,
}: { content: PracticeContent; color: string; onComplete: () => void }) {
    const [stepIdx, setStepIdx] = useState(0);
    const [timer, setTimer]     = useState<number | null>(null);
    const [atClosing, setAtClosing] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const currentStep = content.steps[stepIdx];
    const isLast      = stepIdx === content.steps.length - 1;

    // Start/reset timer for step
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const dur = currentStep?.durationSeconds ?? 0;
        if (dur > 0) {
            setTimer(dur);
            intervalRef.current = setInterval(() => {
                setTimer(t => {
                    if (t === null || t <= 1) {
                        clearInterval(intervalRef.current!);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        } else {
            setTimer(null);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepIdx]);

    const handleNext = () => {
        haptic.tap();
        if (atClosing) { onComplete(); return; }
        if (isLast) { setAtClosing(true); return; }
        setStepIdx(i => i + 1);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Progress bar */}
            <div className="flex gap-1">
                {content.steps.map((_, i) => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-400"
                        style={{ background: i <= stepIdx ? color : `${color}20` }} />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {!atClosing ? (
                    <motion.div key={`step-${stepIdx}`}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}
                        className="rounded-[20px] p-5"
                        style={{ background: `${color}09`, border: `1px solid ${color}22` }}>

                        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color }}>
                            الخطوة {stepIdx + 1} من {content.steps.length}
                        </p>
                        <p className="text-slate-800 text-[17px] font-black leading-snug mb-4">
                            {currentStep.instruction}
                        </p>

                        {timer !== null && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" style={{ color }} />
                                <span className="text-[22px] font-black tabular-nums" style={{ color }}>
                                    {timer}ث
                                </span>
                                {timer === 0 && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="text-[11px] font-bold text-slate-400">
                                        انتهى الوقت
                                    </motion.span>
                                )}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="closing"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-[20px] p-5"
                        style={{ background: 'rgba(0,200,140,0.08)', border: '1px solid rgba(0,200,140,0.22)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-3"
                            style={{ color: 'rgba(0,140,90,0.9)' }}>ملاحظة ختامية</p>
                        <p className="text-slate-800 text-[15px] font-bold leading-relaxed mb-3">
                            {content.closingNote}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                            🔄 {content.repeatSuggestion}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleNext}
                className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                style={{
                    background: `linear-gradient(135deg, ${color}30, ${color}18)`,
                    border: `1.5px solid ${color}45`,
                }}>
                <span className="text-slate-800 font-black text-[14px]">
                    {atClosing ? 'أكملت التمرين ✓' : isLast ? 'الخطوة الأخيرة ←' : 'التالي ←'}
                </span>
            </motion.button>
        </div>
    );
}

/* ════════════════════════════════════════════════════
   TEST RENDERER
   ════════════════════════════════════════════════════ */
function TestRenderer({
    content, color, onComplete,
}: { content: TestContent; color: string; onComplete: () => void }) {
    const [qIdx, setQIdx]       = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [result, setResult]   = useState<typeof content.results[0] | null>(null);

    const currentQ   = content.questions[qIdx];
    const isLast     = qIdx === content.questions.length - 1;
    const selected   = answers[currentQ?.id];

    const handleSelect = (val: number) => {
        haptic.tap();
        setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
    };

    const handleNext = () => {
        haptic.tap();
        if (result) { onComplete(); return; }
        if (isLast) {
            const total = Object.values(answers).reduce((s, v) => s + v, 0);
            const r = content.results.find(r => total >= r.minScore && total <= r.maxScore)
                ?? content.results[content.results.length - 1];
            setResult(r);
        } else {
            setQIdx(i => i + 1);
        }
    };

    if (result) {
        const levelColors = { low: '#00C88C', moderate: '#F59E0B', high: '#EF4444' };
        const bgColors    = { low: 'rgba(0,200,140,0.08)', moderate: 'rgba(245,158,11,0.08)', high: 'rgba(239,68,68,0.08)' };
        const c = levelColors[result.level];
        return (
            <div className="flex flex-col gap-4">
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[22px] p-5" style={{ background: bgColors[result.level], border: `1.5px solid ${c}30` }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: c }}>
                        نتيجتك
                    </p>
                    <p className="text-slate-800 text-[19px] font-black mb-2">{result.title}</p>
                    <p className="text-slate-600 text-[13px] font-medium leading-relaxed mb-3">{result.message}</p>
                    <div className="h-px mb-3" style={{ background: `${c}22` }} />
                    <p className="text-[11px] font-bold" style={{ color: c }}>الخطوة التالية المقترحة:</p>
                    <p className="text-slate-600 text-[12px] font-medium mt-1">{result.nextStep}</p>
                </motion.div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleNext}
                    className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                    style={{ background: `${color}20`, border: `1.5px solid ${color}35` }}>
                    <span className="text-slate-800 font-black text-[14px]">إكمال ✓</span>
                </motion.button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Progress */}
            <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                    {content.questions.map((_, i) => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all"
                            style={{ background: i <= qIdx ? color : `${color}20` }} />
                    ))}
                </div>
                <span className="text-[10px] font-bold text-slate-400">{qIdx + 1}/{content.questions.length}</span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={qIdx}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

                    <p className="text-slate-800 text-[17px] font-black leading-snug mb-4">
                        {currentQ.text}
                    </p>

                    <div className="flex flex-col gap-2">
                        {currentQ.options.map(opt => (
                            <motion.button key={opt.value} whileTap={{ scale: 0.97 }}
                                onClick={() => handleSelect(opt.value)}
                                className="px-4 py-3 rounded-[14px] text-right"
                                style={{
                                    background: selected === opt.value ? `${color}18` : 'rgba(0,0,0,0.04)',
                                    border: `1.5px solid ${selected === opt.value ? color : 'rgba(0,0,0,0.08)'}`,
                                }}>
                                <span className="text-slate-700 text-[13px] font-bold">{opt.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            <motion.button whileTap={{ scale: 0.97 }}
                disabled={selected === undefined}
                onClick={handleNext}
                className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                style={{
                    background: selected !== undefined ? `${color}20` : 'rgba(0,0,0,0.05)',
                    border: `1.5px solid ${selected !== undefined ? color + '35' : 'transparent'}`,
                    opacity: selected !== undefined ? 1 : 0.5,
                }}>
                <span className="text-slate-800 font-black text-[14px]">
                    {isLast ? 'أظهر النتيجة' : 'التالي ←'}
                </span>
            </motion.button>
        </div>
    );
}

/* ════════════════════════════════════════════════════
   WORKSHOP RENDERER
   ════════════════════════════════════════════════════ */
function WorkshopRenderer({
    content, color, onComplete,
}: { content: WorkshopContent; color: string; onComplete: () => void }) {
    const [expanded, setExpanded] = useState<number>(0);
    const [read, setRead]         = useState(false);

    return (
        <div className="flex flex-col gap-3">
            {/* Goal chip */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-[12px]"
                style={{ background: `${color}09`, border: `1px solid ${color}20` }}>
                <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                <span className="text-[10px] font-bold text-slate-500">{content.durationMinutes} دقيقة قراءة</span>
                <span className="text-[10px] font-bold text-slate-400 flex-1 text-left">{content.goal}</span>
            </div>

            {/* Sections */}
            {content.sections.map((sec, i) => (
                <motion.div key={i}
                    className="rounded-[18px] overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.80)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-right"
                        onClick={() => { haptic.tap(); setExpanded(expanded === i ? -1 : i); }}>
                        <span className="text-[22px] flex-shrink-0">{sec.emoji}</span>
                        <span className="text-slate-800 text-[13px] font-black flex-1">{sec.title}</span>
                        {expanded === i
                            ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    </button>
                    <AnimatePresence>
                        {expanded === i && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ overflow: 'hidden' }}>
                                <p className="text-slate-600 text-[13px] font-medium leading-relaxed px-4 pb-4">
                                    {sec.body}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}

            {/* Key takeaways */}
            <div className="rounded-[18px] p-4"
                style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color }}>
                    الأفكار الرئيسية
                </p>
                {content.keyTakeaways.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1.5 last:mb-0">
                        <span style={{ color }} className="text-[10px] font-black mt-0.5">✦</span>
                        <p className="text-slate-700 text-[12px] font-medium flex-1">{t}</p>
                    </div>
                ))}
            </div>

            {/* Closing action */}
            <div className="rounded-[14px] px-4 py-3"
                style={{ background: 'rgba(0,200,140,0.07)', border: '1px solid rgba(0,200,140,0.18)' }}>
                <p className="text-[10px] font-black mb-1" style={{ color: 'rgba(0,140,90,0.9)' }}>
                    إجراء اليوم
                </p>
                <p className="text-slate-700 text-[12px] font-medium">{content.closingAction}</p>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={onComplete}
                className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                style={{ background: `${color}20`, border: `1.5px solid ${color}35` }}>
                <span className="text-slate-800 font-black text-[14px]">أكملت القراءة ✓</span>
            </motion.button>
        </div>
    );
}

/* ════════════════════════════════════════════════════
   TRACKER RENDERER
   ════════════════════════════════════════════════════ */
function TrackerRenderer({
    content, color, toolId, planId, onComplete,
}: { content: TrackerContent; color: string; toolId: string; planId: string; onComplete: () => void }) {
    const storageKey = `tibrah_tracker_${planId}_${toolId}_${new Date().toDateString()}`;
    const [values, setValues] = useState<Record<string, string | number | boolean>>({});
    const [saved, setSaved]   = useState(false);

    const handleSave = () => {
        haptic.impact();
        if (typeof window !== 'undefined') {
            try { localStorage.setItem(storageKey, JSON.stringify({ ...values, savedAt: new Date().toISOString() })); }
            catch { /* quota */ }
        }
        trackEvent('protocol_outcome_logged', { tool_id: toolId, tracker_fields: Object.keys(values).length });
        setSaved(true);
        setTimeout(onComplete, 1200);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Intro */}
            <p className="text-slate-600 text-[13px] font-medium leading-relaxed">{content.intro}</p>

            {/* Fields */}
            {content.fields.map(field => (
                <div key={field.id} className="rounded-[16px] p-4"
                    style={{ background: 'rgba(255,255,255,0.80)', border: '1px solid rgba(0,0,0,0.07)' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[18px]">{field.emoji}</span>
                        <p className="text-slate-700 text-[12px] font-black">{field.label}</p>
                    </div>

                    {field.type === 'scale' && (
                        <div>
                            <input type="range" min={field.min ?? 0} max={field.max ?? 10}
                                value={(values[field.id] as number) ?? Math.round(((field.min ?? 0) + (field.max ?? 10)) / 2)}
                                onChange={e => setValues(v => ({ ...v, [field.id]: Number(e.target.value) }))}
                                className="w-full h-2 rounded-full cursor-pointer"
                                style={{ accentColor: color }} />
                            <div className="flex justify-between mt-1">
                                <span className="text-[9px] text-slate-400">{field.min ?? 0}</span>
                                <span className="text-[13px] font-black" style={{ color }}>
                                    {(values[field.id] as number) ?? Math.round(((field.min ?? 0) + (field.max ?? 10)) / 2)}
                                </span>
                                <span className="text-[9px] text-slate-400">{field.max ?? 10}</span>
                            </div>
                        </div>
                    )}

                    {field.type === 'choice' && field.options && (
                        <div className="flex flex-wrap gap-1.5">
                            {field.options.map(opt => (
                                <button key={opt} onClick={() => { haptic.tap(); setValues(v => ({ ...v, [field.id]: opt })); }}
                                    className="px-3 py-1.5 rounded-[10px] text-[11px] font-bold transition-all"
                                    style={{
                                        background: values[field.id] === opt ? `${color}20` : 'rgba(0,0,0,0.05)',
                                        border: `1.5px solid ${values[field.id] === opt ? color : 'transparent'}`,
                                        color: values[field.id] === opt ? color : '#64748B',
                                    }}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {field.type === 'boolean' && (
                        <div className="flex gap-2">
                            {['نعم', 'لا'].map(opt => (
                                <button key={opt} onClick={() => { haptic.tap(); setValues(v => ({ ...v, [field.id]: opt === 'نعم' })); }}
                                    className="flex-1 py-2 rounded-[10px] text-[12px] font-bold"
                                    style={{
                                        background: (values[field.id] === true && opt === 'نعم') || (values[field.id] === false && opt === 'لا')
                                            ? `${color}18` : 'rgba(0,0,0,0.05)',
                                        border: `1.5px solid ${(values[field.id] === true && opt === 'نعم') || (values[field.id] === false && opt === 'لا')
                                            ? color : 'transparent'}`,
                                        color: (values[field.id] === true && opt === 'نعم') || (values[field.id] === false && opt === 'لا')
                                            ? color : '#64748B',
                                    }}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {field.type === 'text' && (
                        <textarea rows={2} placeholder="اكتب هنا..."
                            value={(values[field.id] as string) ?? ''}
                            onChange={e => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-[10px] text-[12px] font-medium resize-none"
                            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', outline: 'none', fontFamily: 'inherit', color: '#334155' }} />
                    )}
                </div>
            ))}

            {/* Insight */}
            <div className="px-3 py-2.5 rounded-[12px]"
                style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                <p className="text-[11px] font-medium text-slate-500 italic">💡 {content.insight}</p>
            </div>

            {/* Save button */}
            {!saved ? (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
                    className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                    style={{ background: `${color}20`, border: `1.5px solid ${color}35` }}>
                    <span className="text-slate-800 font-black text-[14px]">حفظ التسجيل ✓</span>
                </motion.button>
            ) : (
                <div className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                    style={{ background: 'rgba(0,200,140,0.10)', border: '1px solid rgba(0,200,140,0.22)' }}>
                    <span className="text-[14px]">✅</span>
                    <span className="text-[13px] font-black" style={{ color: 'rgba(0,140,90,0.9)' }}>تم الحفظ!</span>
                </div>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════════
   PROTOCOL RENDERER
   (يستخدم tool-content-map للعرض فقط — لا protocol-engine)
   ════════════════════════════════════════════════════ */
function ProtocolRenderer({
    content, color, onComplete,
}: { content: ProtocolContent; color: string; onComplete: () => void }) {
    const [dayIdx, setDayIdx]       = useState(0);
    const [checked, setChecked]     = useState<Record<string, boolean>>({});
    const [showHowItWorks, setShow] = useState(false);

    const currentDay = content.days[dayIdx];
    const allChecked = currentDay.tasks.every(t => checked[t.id]);

    const toggle = (taskId: string) => {
        haptic.tap();
        setChecked(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Day navigator */}
            <div className="flex items-center gap-1 justify-center">
                {content.days.map((d, i) => (
                    <button key={d.day} onClick={() => { haptic.tap(); setDayIdx(i); setChecked({}); }}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all"
                        style={{
                            background: i === dayIdx ? color : i < dayIdx ? 'rgba(0,200,140,0.20)' : 'rgba(0,0,0,0.06)',
                            border: `1.5px solid ${i === dayIdx ? color : 'transparent'}`,
                        }}>
                        <span className="text-[10px] font-black"
                            style={{ color: i === dayIdx ? '#fff' : i < dayIdx ? 'rgba(0,140,90,0.7)' : '#94A3B8' }}>
                            {d.day}
                        </span>
                    </button>
                ))}
            </div>

            {/* Day card */}
            <AnimatePresence mode="wait">
                <motion.div key={dayIdx}
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>

                    <div className="rounded-[20px] p-5 mb-3"
                        style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>

                        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color }}>
                            اليوم {currentDay.day}
                        </p>
                        <h3 className="text-slate-800 text-[17px] font-black mb-0.5">{currentDay.title}</h3>
                        <p className="text-slate-400 text-[11px] font-medium mb-4">{currentDay.subtitle}</p>

                        {/* Tasks */}
                        <div className="flex flex-col gap-2">
                            {currentDay.tasks.map(task => (
                                <button key={task.id} onClick={() => toggle(task.id)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-right"
                                    style={{
                                        background: checked[task.id] ? 'rgba(0,200,140,0.08)' : 'rgba(0,0,0,0.03)',
                                        border: `1.5px solid ${checked[task.id] ? 'rgba(0,200,140,0.25)' : 'rgba(0,0,0,0.06)'}`,
                                    }}>
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: checked[task.id] ? 'rgba(0,200,140,0.85)' : 'rgba(0,0,0,0.08)' }}>
                                        {checked[task.id] && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="text-[13px] flex-shrink-0">{task.emoji}</span>
                                    <p className="text-slate-700 text-[12px] font-medium flex-1 text-right leading-snug">{task.text}</p>
                                    {task.durationMinutes > 0 && (
                                        <span className="text-[9px] text-slate-400 font-bold flex-shrink-0">
                                            {task.durationMinutes}د
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* How it works */}
            <button onClick={() => setShow(s => !s)}
                className="flex items-center gap-2 px-3 py-2 rounded-[12px]"
                style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="text-[11px] font-bold text-slate-500 flex-1 text-right">كيف يعمل هذا البروتوكول؟</span>
                {showHowItWorks ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            {showHowItWorks && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-slate-500 text-[12px] font-medium leading-relaxed px-2">
                    {content.howItWorks}
                </motion.p>
            )}

            {/* Complete day */}
            {allChecked && (
                <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.97 }} onClick={onComplete}
                    className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                    style={{ background: `${color}22`, border: `1.5px solid ${color}40`, boxShadow: `0 8px 24px ${color}20` }}>
                    <span className="text-slate-800 font-black text-[14px]">أكملت اليوم {currentDay.day} ✓</span>
                </motion.button>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════════
   TOOL HEADER
   ════════════════════════════════════════════════════ */
function ToolHeader({
    toolName, toolType, duration, color,
    onBack,
}: {
    toolName: string; toolType: string; duration?: number;
    color: string; onBack: () => void;
}) {
    const typeInfo = TYPE_LABELS[toolType] ?? { ar: toolType, emoji: '📌' };
    return (
        <div className="sticky top-0 z-20 px-5 pt-14 pb-4"
            style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-3">
                <button onClick={onBack}>
                    <motion.div whileTap={{ scale: 0.88 }}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                    </motion.div>
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color }}>
                        {typeInfo.emoji} {typeInfo.ar}
                    </p>
                    <h1 className="text-slate-800 text-[16px] font-black leading-tight truncate">{toolName}</h1>
                </div>
                {duration && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                        <Clock className="w-3 h-3" style={{ color }} />
                        <span className="text-[9px] font-black" style={{ color }}>{duration}د</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════ */
export default function ToolPage() {
    const router = useRouter();
    const { type, id } = router.query as { type?: string; id?: string };

    const [completed, setCompleted] = useState(false);

    const ctx = useMemo(() => {
        if (!id || !type || typeof window === 'undefined') return null;
        const content = getToolContent(id);
        const plan    = getActiveCarePlan();
        const planId  = plan ? getPlanId(plan.createdAt) : 'no-plan';
        const domainId = plan?.routing.primary_domain ?? 'jasadi';
        const subdomain = plan?.routing.primary_subdomain ?? '';
        const colors  = DOMAIN_COLORS[domainId] ?? DOMAIN_COLORS.jasadi;
        const hasCheckinToday = plan
            ? hasTodayOutcome(planId, getProtocolDay(plan))
            : false;
        return { content, plan, planId, domainId, subdomain, colors, hasCheckinToday };
    }, [id, type]);

    // Mark tool opened + fire tool_page_viewed
    useEffect(() => {
        if (!id) return;
        markToolOpened(id);
        trackEvent('tool_page_viewed', { tool_id: id, tool_type: type ?? '' });

        // Abandon tracking — fires if user navigates away before completing
        let didComplete = false;
        const handleComplete = () => { didComplete = true; };
        window.addEventListener('tibrah:tool_completed', handleComplete);

        const handleRouteChange = () => {
            if (!didComplete) {
                trackEvent('tool_abandoned', { tool_id: id, tool_type: type ?? '' });
            }
        };
        router.events.on('routeChangeStart', handleRouteChange);
        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
            window.removeEventListener('tibrah:tool_completed', handleComplete);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleComplete = () => {
        haptic.impact();
        if (id) {
            markToolCompleted(id);
            trackEvent('tool_completed', { tool_id: id, tool_type: type ?? '' });
            trackEvent('protocol_day_completed', { tool_id: id, tool_type: type ?? '' });
            // Signal to abandon tracker
            window.dispatchEvent(new Event('tibrah:tool_completed'));
        }
        setCompleted(true);
    };

    // ── Loading / Invalid ──
    if (!ctx || !id || !type) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
                <p className="text-slate-400 text-sm">جارٍ التحميل...</p>
            </div>
        );
    }

    // ── No content ──
    if (!ctx.content) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center" dir="rtl">
                <p className="text-[32px] mb-4">🚧</p>
                <p className="text-slate-700 text-[17px] font-black mb-2">هذه الأداة قيد التطوير</p>
                <p className="text-slate-400 text-[13px] font-medium mb-6">المحتوى سيكون متاحاً قريباً</p>
                <Link href="/my-plan">
                    <span className="text-[13px] font-black" style={{ color: ctx.colors.color }}>← عُد لخطتي</span>
                </Link>
            </div>
        );
    }

    const { content, colors, planId, subdomain, hasCheckinToday } = ctx;
    const { color, colorAlt } = colors;

    const duration = 'durationMinutes' in content ? (content as any).durationMinutes as number : undefined;
    const toolNameMap: Record<string, string> = {
        practice: 'تمرين الجلسة',
        test:     'اختبار تقييم',
        workshop: 'ورشة تعلم',
        tracker:  'متابعة يومية',
        protocol: 'بروتوكول',
    };
    const toolName = toolNameMap[content.type] ?? 'الأداة';

    return (
        <div className="min-h-screen bg-slate-50" dir="rtl">
            {/* Header */}
            <ToolHeader
                toolName={toolName}
                toolType={type}
                duration={duration}
                color={color}
                onBack={() => router.back()}
            />

            <div className="pt-4 pb-32">
                {/* Protocol Context Strip */}
                {subdomain && <ProtocolContextStrip subdomain={subdomain} color={color} />}

                <div className="px-5">
                    <AnimatePresence mode="wait">
                        {completed ? (
                            <motion.div key="done"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <CompletionScreen
                                    toolName={toolName}
                                    color={color}
                                    colorAlt={colorAlt}
                                    hasCheckinToday={hasCheckinToday}
                                    toolId={id}
                                />
                            </motion.div>
                        ) : (
                            <motion.div key="active"
                                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }}>

                                {/* Goal intro */}
                                {'goal' in content && (
                                    <div className="mb-4 px-3 py-2.5 rounded-[14px]"
                                        style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                                        <p className="text-[11px] text-slate-600 font-medium">{(content as any).goal}</p>
                                    </div>
                                )}

                                {/* Renderer */}
                                {content.type === 'practice' && (
                                    <PracticeRenderer content={content} color={color} onComplete={handleComplete} />
                                )}
                                {content.type === 'test' && (
                                    <TestRenderer content={content} color={color} onComplete={handleComplete} />
                                )}
                                {content.type === 'workshop' && (
                                    <WorkshopRenderer content={content} color={color} onComplete={handleComplete} />
                                )}
                                {content.type === 'tracker' && (
                                    <TrackerRenderer content={content} color={color} toolId={id} planId={planId} onComplete={handleComplete} />
                                )}
                                {content.type === 'protocol' && (
                                    <ProtocolRenderer content={content} color={color} onComplete={handleComplete} />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

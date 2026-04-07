// components/home/SmartInsight.tsx  ✦ V2 — Living Intelligence Edition
// The insight card is now alive: color-morphing, pulsing urgency indicator,
// drag to cycle, auto-advance every 8s, and a "seen" shimmer on each insight.

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Droplets, Flame, Brain, Zap, AlertCircle,
    CheckCircle, Heart, Wind,
} from 'lucide-react';
import { type HealthDashboardData } from '@/hooks/useHealthDashboard';
import { haptic } from '@/lib/HapticFeedback';
import { STAGGER_ITEM } from '@/lib/tibrah-motion';

interface Insight {
    icon:    React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color:   string;
    bg:      string;
    border:  string;
    title:   string;
    body:    string;
    urgent:  boolean;
    tag:     string;
}

const AUTO_ADVANCE_MS = 8000;

export function SmartInsight({ dashboard }: { dashboard: HealthDashboardData }) {
    const [idx, setIdx]       = useState(0);
    const [seen, setSeen]     = useState<Set<number>>(new Set([0]));
    const [dismiss, setDismiss] = useState(false);

    const insights = useMemo<Insight[]>(() => {
        const list: Insight[] = [];
        const waterPct = dashboard.waterToday / Math.max(dashboard.waterGoal, 1);

        // P1 — Critical water warning
        if (waterPct < 0.4) list.push({
            icon: Droplets, color: '#dc2626',
            bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.18)',
            title: 'تحذير: الجفاف يقترب',
            body: `شربت ${dashboard.waterAr} فقط (${Math.round(waterPct*100)}%) — الجفاف الخفيف يقلل التركيز بنسبة ٢٣٪.`,
            urgent: true, tag: 'عاجل',
        });
        else if (waterPct < 0.7) list.push({
            icon: Droplets, color: '#2563eb',
            bg: 'rgba(37,99,235,0.06)', border: 'rgba(37,99,235,0.16)',
            title: 'اشرب ماءً الآن',
            body: `شربت ${dashboard.waterAr} من ${dashboard.waterGoal} — تبقّى ${Math.max(0, dashboard.waterGoal - dashboard.waterToday)} لتر لإتمام هدفك.`,
            urgent: false, tag: 'تذكير',
        });

        // P2 — Late-day log reminder
        if (!dashboard.hasLoggedToday && new Date().getHours() >= 14) list.push({
            icon: AlertCircle, color: '#d97706',
            bg: 'rgba(217,119,6,0.06)', border: 'rgba(217,119,6,0.16)',
            title: 'لم تُسجّل بياناتك بعد',
            body: 'مرّ أكثر من نصف اليوم — سجّل الآن قبل أن تفقد دقة المتابعة الصحية لهذا اليوم.',
            urgent: true, tag: 'مطلوب',
        });

        // P3 — Streak fire
        if (dashboard.streak >= 7) list.push({
            icon: Flame, color: '#ea580c',
            bg: 'rgba(234,88,12,0.06)', border: 'rgba(234,88,12,0.16)',
            title: `${dashboard.streakAr} يوم متواصل 🔥`,
            body: 'أسبوع كامل من المتابعة — الدراسات تثبت أن الانتظام لأسبوعين يُعيد برمجة العادات الصحية.',
            urgent: false, tag: 'إنجاز',
        });

        // P4 — Goals done
        if (dashboard.goalsCompleted >= dashboard.goalsTotal && dashboard.goalsTotal > 0) list.push({
            icon: CheckCircle, color: '#16a34a',
            bg: 'rgba(22,163,74,0.06)', border: 'rgba(22,163,74,0.16)',
            title: 'أنجزت أهداف اليوم ✓',
            body: `أكملت ${dashboard.goalsTotal} أهداف اليوم — استمر في هذا المسار غداً للحفاظ على الزخم.`,
            urgent: false, tag: 'اكتمل',
        });

        // P5 — AI nudge
        list.push({
            icon: Brain, color: '#6366f1',
            bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.16)',
            title: 'بصيرة Gemini السريرية',
            body: 'المريض المنتظم في المتابعة يكتشف تغيّرات صحية في وقت ٣× أبكر ممن يتابع بشكل متقطع.',
            urgent: false, tag: 'AI',
        });

        // P6 — Wellness tip
        list.push({
            icon: Heart, color: '#e11d48',
            bg: 'rgba(225,29,72,0.06)', border: 'rgba(225,29,72,0.16)',
            title: 'نفَس عميق الآن',
            body: '٣ أنفاس عميقة الآن تخفض مستوى الكورتيزول (هرمون التوتر) خلال ٩٠ ثانية فقط.',
            urgent: false, tag: 'رفاه',
        });

        return list;
    }, [dashboard]);

    // Auto-advance
    useEffect(() => {
        if (insights.length <= 1 || dismiss) return;
        const t = setInterval(() => {
            setIdx(prev => {
                const next = (prev + 1) % insights.length;
                setSeen(s => new Set(s).add(next));
                return next;
            });
        }, AUTO_ADVANCE_MS);
        return () => clearInterval(t);
    }, [insights.length, dismiss]);

    const go = useCallback((dir: 1 | -1) => {
        haptic.selection();
        setIdx(prev => {
            const next = ((prev + dir) + insights.length) % insights.length;
            setSeen(s => new Set(s).add(next));
            return next;
        });
    }, [insights.length]);

    if (insights.length === 0 || dismiss) return null;
    const cur = insights[idx];
    const Icon = cur.icon;

    return (
        <motion.div variants={STAGGER_ITEM} className="px-4">
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.16}
                onDragEnd={(_, { offset }) => {
                    if (offset.x < -28) go(1);
                    else if (offset.x > 28) go(-1);
                }}
                className="relative overflow-hidden rounded-[20px] cursor-grab active:cursor-grabbing select-none"
                style={{ background: cur.bg, border: `1px solid ${cur.border}` }}
                layout>

                {/* Urgency pulse border */}
                {cur.urgent && (
                    <motion.div className="absolute inset-0 rounded-[20px] pointer-events-none"
                        animate={{ boxShadow: [`0 0 0 0px ${cur.color}40`, `0 0 0 4px ${cur.color}00`] }}
                        transition={{ duration: 2, repeat: Infinity }} />
                )}

                <div className="flex items-start gap-3.5 p-4">
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-[13px] flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${cur.color}14` }}>
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.5, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                            <Icon className="w-[18px] h-[18px]" style={{ color: cur.color }} />
                        </motion.div>
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 pointer-events-none">
                        <AnimatePresence mode="wait">
                            <motion.div key={idx}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.18 }}>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                        style={{ background: `${cur.color}18`, color: cur.color }}>
                                        {cur.tag}
                                    </span>
                                </div>
                                <p className="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight">
                                    {cur.title}
                                </p>
                                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                                    {cur.body}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right: dots + dismiss */}
                    <div className="flex flex-col items-center gap-2 self-stretch ml-1 flex-shrink-0">
                        {/* Dismiss */}
                        <button onClick={(e) => { e.stopPropagation(); setDismiss(true); haptic.selection(); }}
                            className="text-[12px] text-slate-300 hover:text-slate-400 leading-none p-0.5">✕
                        </button>

                        <div className="flex-1" />

                        {/* Pagination dots */}
                        {insights.length > 1 && (
                            <div className="flex flex-col gap-1 items-center">
                                {insights.map((_, i) => (
                                    <motion.button key={i}
                                        onClick={(e) => { e.stopPropagation(); setIdx(i); setSeen(s => new Set(s).add(i)); haptic.selection(); }}
                                        className="rounded-full"
                                        animate={{
                                            height: idx === i ? 14 : seen.has(i) ? 5 : 4,
                                            width: 4,
                                            background: idx === i ? cur.color : seen.has(i) ? `${cur.color}50` : `${cur.color}25`,
                                        }}
                                        transition={{ type: 'spring', stiffness: 440, damping: 28 }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Auto-advance progress bar */}
                {insights.length > 1 && (
                    <motion.div className="absolute bottom-0 inset-x-0 h-[2px]"
                        style={{ background: `${cur.color}20` }}>
                        <motion.div className="h-full rounded-r-full"
                            style={{ background: cur.color }}
                            key={idx}
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: 'linear' }} />
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}

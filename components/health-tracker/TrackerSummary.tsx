// components/health-tracker/TrackerSummary.tsx
// Health Tracker — Command Center Summary Tab
// Replaces the cluttered old Summary with a coherent, top-down story:
// 1. Body Score ring (composite of all metrics)
// 2. Metric Rings horizontal strip
// 3. Today's Story (3-stat highlights)
// 4. Correlations (cross-metric intelligence)
// 5. Day Timeline
// 6. AI Context Assistant

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
    HeartPulse, Zap, TrendingUp,
    Droplets, Moon, Activity, Smile,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { METRIC, TC, scoreToColor, calcBodyScore } from './tracker-tokens';
import { TrackerMetricRings, type TrackerRingsData } from './TrackerMetricRings';
import { TrackerCorrelations } from './TrackerCorrelations';
import { TrackerTimeline } from './TrackerTimeline';
import { TrackerStreaks } from './TrackerStreaks';
import { TrackerWeeklyOverview } from './TrackerWeeklyChart';
import { TrackerGoalCard } from './TrackerGoalCard';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/tibrah-motion';
import { DOCTOR_KNOWLEDGE } from '@/lib/doctorContext';
import { TrackerDailyPlan } from './TrackerDailyPlan';

const AIContextAssistant = dynamic(() => import('@/components/ai/AIContextAssistant'), { ssr: false });
const WearablesSync = dynamic(() => import('./WearablesSync'), { ssr: false });

/* ── Section label ── */
function SL({ label, icon: Icon, color = '#0d9488' }: {
    label: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color?: string;
}) {
    return (
        <motion.div variants={STAGGER_ITEM} className="flex items-center gap-2 px-4">
            <div className="w-5 h-5 rounded-[7px] flex items-center justify-center"
                style={{ background: `${color}13` }}>
                <Icon className="w-3 h-3" style={{ color }} />
            </div>
            <span className="text-[10.5px] font-extrabold uppercase tracking-[0.1em]"
                style={{ color: `${color}90` }}>
                {label}
            </span>
            <div className="flex-1 h-px"
                style={{ background: `linear-gradient(to left, transparent, ${color}15)` }} />
        </motion.div>
    );
}

/* ── Body Score Ring ── */
function BodyScoreRing({ score }: { score: number }) {
    const color = scoreToColor(score);
    const sz = 160; const r = 66; const circ = 2 * Math.PI * r;
    const dash = circ - (score / 100) * circ;
    const rInner = 50; const circI = 2 * Math.PI * rInner;

    const label =
        score >= 90 ? 'استثنائي 🌟' :
            score >= 80 ? 'ممتاز ✓' :
                score >= 65 ? 'جيد جداً 👍' :
                    score >= 50 ? 'يمكن تحسينه' : 'يحتاج اهتماماً';

    return (
        <motion.div variants={STAGGER_ITEM} className="px-4">
            <div className="relative overflow-hidden rounded-[28px] flex flex-col items-center py-7"
                style={{
                    background: `linear-gradient(160deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))`,
                    backdropFilter: 'blur(32px)',
                    border: `1.5px solid ${color}22`,
                    boxShadow: `0 8px 40px ${color}18, 0 2px 8px rgba(0,0,0,0.06)`,
                }}>
                {/* Full-bleed ambient gradient */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${color}0E, transparent 70%)` }} />
                <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse 60% 50% at 50% 100%, ${color}06, transparent)` }} />

                <div className="relative" style={{ width: sz, height: sz }}>
                    {/* Breathing glow ring */}
                    <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                        animate={{ opacity: [0.04, 0.14, 0.04], scale: [1, 1.05, 1] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ boxShadow: `0 0 0 10px ${color}` }} />

                    <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)' }}>
                        {/* Track */}
                        <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke={`${color}10`} strokeWidth="9" />
                        {/* Score arc */}
                        <motion.circle cx={sz / 2} cy={sz / 2} r={r} fill="none"
                            stroke={color} strokeWidth="9" strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 8px ${color}55)` }}
                            strokeDasharray={circ}
                            initial={{ strokeDashoffset: circ }}
                            animate={{ strokeDashoffset: dash }}
                            transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1] }} />
                        {/* Inner decorative ring */}
                        <circle cx={sz / 2} cy={sz / 2} r={rInner} fill="none" stroke={`${color}08`} strokeWidth="5" />
                        <motion.circle cx={sz / 2} cy={sz / 2} r={rInner} fill="none"
                            stroke={`${color}35`} strokeWidth="5" strokeLinecap="round"
                            strokeDasharray={circI}
                            initial={{ strokeDashoffset: circI }}
                            animate={{ strokeDashoffset: circI - 0.7 * circI }}
                            transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }} />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span className="text-[52px] font-black tabular-nums leading-none"
                            style={{ color, textShadow: `0 2px 20px ${color}40` }}
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 280, damping: 16 }}>
                            {score}
                        </motion.span>
                        <span className="text-[11px] font-bold text-slate-400 mt-0.5">درجة الجسم</span>
                        <motion.div className="flex items-center gap-1.5 mt-2 px-3.5 py-1.5 rounded-full"
                            style={{ background: `${color}12`, border: `1.5px solid ${color}28` }}
                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
                            <motion.div className="w-2 h-2 rounded-full" style={{ background: color }}
                                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }} />
                            <span className="text-[11px] font-black" style={{ color }}>{label}</span>
                        </motion.div>
                    </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-400 font-medium">متوسط مؤشراتك اليوم</p>
            </div>
        </motion.div>
    );
}

/* ── Today's Story — 3 stat highlights ── */
function TodayStory({ rings }: { rings: TrackerRingsData }) {
    const facts = useMemo(() => [
        {
            icon: Droplets, color: METRIC.water.color,
            label: 'الترطيب',
            value: `${Math.round(rings.waterPct * 100)}%`,
            ok: rings.waterPct >= 0.6,
        },
        {
            icon: Moon, color: METRIC.sleep.color,
            label: 'النوم',
            value: `${rings.sleepHours.toFixed(1)} س`,
            ok: rings.sleepHours >= 6.5,
        },
        {
            icon: Activity, color: METRIC.activity.color,
            label: 'النشاط',
            value: `${rings.activityMin} د`,
            ok: rings.activityMin >= 20,
        },
    ], [rings]);

    return (
        <motion.div variants={STAGGER_ITEM} className="px-4">
            <div className="flex gap-2.5">
                {facts.map((f, i) => {
                    const Icon = f.icon;
                    return (
                        <motion.div key={i}
                            initial={{ opacity: 0, y: 12, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: i * 0.08, type: 'spring', stiffness: 320, damping: 22 }}
                            className="flex-1 rounded-[22px] flex flex-col items-center gap-2 py-4 relative overflow-hidden"
                            style={{
                                background: f.ok
                                    ? `linear-gradient(160deg, ${f.color}10, ${f.color}06)`
                                    : 'rgba(0,0,0,0.03)',
                                border: `1.5px solid ${f.ok ? f.color + '28' : 'rgba(0,0,0,0.07)'}`,
                                boxShadow: f.ok ? `0 6px 20px ${f.color}14` : 'none',
                            }}>
                            {/* Background watermark */}
                            {f.ok && (
                                <div className="absolute -bottom-3 -right-2 opacity-[0.07] text-[52px] leading-none">
                                    <Icon style={{ width: 52, height: 52, color: f.color }} />
                                </div>
                            )}
                            <div className="w-9 h-9 rounded-[12px] flex items-center justify-center relative z-10"
                                style={{
                                    background: f.ok ? f.color : 'rgba(0,0,0,0.06)',
                                    boxShadow: f.ok ? `0 4px 12px ${f.color}40` : 'none',
                                }}>
                                <Icon className="w-4.5 h-4.5" style={{ color: f.ok ? 'white' : '#94a3b8', width: 18, height: 18 }} />
                            </div>
                            <span className="text-[20px] font-black tabular-nums leading-none relative z-10"
                                style={{ color: f.ok ? f.color : '#94a3b8' }}>
                                {f.value}
                            </span>
                            <span className="text-[9.5px] font-bold text-slate-400 relative z-10">{f.label}</span>
                            {/* OK indicator */}
                            {f.ok && (
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: f.color }} />
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

/* ════════════════════════════════════════════════════
   TRACKER SUMMARY (main export)
   ════════════════════════════════════════════════════ */
interface TrackerSummaryProps {
    rings: TrackerRingsData;
    metrics?: Record<string, unknown>[];
    symptoms?: Record<string, unknown>[];
}

export function TrackerSummary({
    rings,
    metrics = [],
    symptoms = [],
}: TrackerSummaryProps) {
    const bodyScore = useMemo(() => calcBodyScore({
        water: rings.waterPct * 100,
        sleep: (rings.sleepHours / 8) * 100,
        activity: (rings.activityMin / 30) * 100,
        mood: rings.moodScore * 10,
        meds: rings.medsTotalCount > 0 ? (rings.medsCount / rings.medsTotalCount) * 100 : 100,
    }), [rings]);

    return (
        <motion.div
            className="flex flex-col gap-4 pt-2"
            initial="hidden"
            animate="show"
            variants={STAGGER_CONTAINER}>

            {/* Wearables sync (compact) */}
            <WearablesSync />

            {/* 1. Body Score */}
            <SL label="درجة جسمك اليوم" icon={HeartPulse} color="#0d9488" />
            <BodyScoreRing score={bodyScore} />

            {/* 2. Metric Rings */}
            <SL label="مؤشراتك" icon={Zap} color="#6366f1" />
            <motion.div variants={STAGGER_ITEM}>
                <TrackerMetricRings data={rings} />
            </motion.div>

            {/* 3. Daily Plan — NEW: morning/afternoon/evening task checklist */}
            <SL label="خطة يومك الصحية" icon={Activity} color="#0d9488" />
            <TrackerDailyPlan />

            {/* 4. Today's Story */}
            <SL label="يومك بالأرقام" icon={Activity} color="#0891b2" />
            <TodayStory rings={rings} />

            {/* 4. Smart Correlations */}
            <SL label="الذكاء الصحي" icon={TrendingUp} color="#7c3aed" />
            <TrackerCorrelations
                waterDailyAvg={rings.waterPct}
                sleepAvgHours={rings.sleepHours}
                activityMinAvg={rings.activityMin}
                moodAvg={rings.moodScore}
            />

            {/* 5. Streaks */}
            <SL label="سلاسل الالتزام" icon={Activity} color="#f97316" />
            <motion.div variants={STAGGER_ITEM}>
                <TrackerStreaks />
            </motion.div>

            {/* 6. Weekly chart */}
            <SL label="تطور الأسبوع" icon={TrendingUp} color="#0891b2" />
            <motion.div variants={STAGGER_ITEM}>
                <TrackerWeeklyOverview />
            </motion.div>

            {/* 7. Goals */}
            <SL label="أهدافي" icon={HeartPulse} color="#6366f1" />
            <motion.div variants={STAGGER_ITEM}>
                <TrackerGoalCard />
            </motion.div>

            {/* 8. Day Timeline */}
            <SL label="جدول يومك" icon={Activity} color="#64748b" />
            <TrackerTimeline />

            {/* 6. AI analysis */}
            <SL label="مساعدك الذكي" icon={Smile} color="#6366f1" />
            <motion.div variants={STAGGER_ITEM} className="px-4 pb-4">
                <AIContextAssistant
                    contextType="health_tracker"
                    contextData={{ metrics: metrics.slice(0, 5), symptoms: symptoms.slice(0, 5) }}
                    knowledgeBase={DOCTOR_KNOWLEDGE}
                    title="مساعدك الصحي"
                />
            </motion.div>
        </motion.div>
    );
}

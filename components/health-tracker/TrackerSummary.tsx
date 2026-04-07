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
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/tibrah-motion';
import { DOCTOR_KNOWLEDGE } from '@/lib/doctorContext';

const AIContextAssistant = dynamic(() => import('@/components/ai/AIContextAssistant'), { ssr: false });
const WearablesSync      = dynamic(() => import('./WearablesSync'), { ssr: false });

/* ── Section label ── */
function SL({ label, icon: Icon, color = '#0d9488' }: {
    label: string;
    icon:  React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
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
    const sz    = 160; const r = 66; const circ = 2 * Math.PI * r;
    const dash  = circ - (score / 100) * circ;

    const label =
        score >= 90 ? 'استثنائي 🌟' :
        score >= 80 ? 'ممتاز ✓' :
        score >= 65 ? 'جيد جداً' :
        score >= 50 ? 'يمكن تحسينه' : 'يحتاج اهتماماً';

    return (
        <motion.div variants={STAGGER_ITEM} className="px-4">
            <div className="relative overflow-hidden rounded-[28px] flex flex-col items-center py-6"
                style={{
                    background: TC.card.bg,
                    backdropFilter: TC.card.blur,
                    border: `1.5px solid ${TC.card.border}`,
                    boxShadow: TC.card.shadowLg,
                }}>
                {/* Ambient glow */}
                <div className="absolute inset-x-0 top-0 h-32 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${color}12, transparent)` }} />

                <div className="relative" style={{ width: sz, height: sz }}>
                    {/* Breathing ring */}
                    <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                        animate={{ opacity: [0.06, 0.18, 0.06], scale: [1, 1.04, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        style={{ boxShadow: `0 0 0 8px ${color}` }} />

                    <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx={sz/2} cy={sz/2} r={r} fill="none"
                            stroke="rgba(0,0,0,0.05)" strokeWidth="8" strokeLinecap="round" />
                        <motion.circle cx={sz/2} cy={sz/2} r={r} fill="none"
                            stroke={color} strokeWidth="8" strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
                            strokeDasharray={circ}
                            initial={{ strokeDashoffset: circ }}
                            animate={{ strokeDashoffset: dash }}
                            transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1] }} />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                        <motion.span className="text-[48px] font-black tabular-nums leading-none"
                            style={{ color }}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 18 }}>
                            {score}
                        </motion.span>
                        <span className="text-[11px] font-semibold text-slate-400">درجة الجسم</span>
                        <motion.div className="flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full"
                            style={{ background: `${color}12`, border: `1px solid ${color}22` }}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                            <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: color }}
                                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                            <span className="text-[10.5px] font-black" style={{ color }}>{label}</span>
                        </motion.div>
                    </div>
                </div>

                {/* Sub-hint */}
                <p className="mt-2 text-[11px] text-slate-400 font-medium">
                    متوسط مؤشراتك اليوم
                </p>
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
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="flex-1 rounded-[18px] flex flex-col items-center gap-1.5 py-3.5"
                            style={{
                                background: f.ok ? `${f.color}09` : 'rgba(0,0,0,0.03)',
                                border: `1.5px solid ${f.ok ? f.color + '22' : 'rgba(0,0,0,0.07)'}`,
                                boxShadow: f.ok ? `0 4px 14px ${f.color}12` : 'none',
                            }}>
                            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                                style={{ background: f.ok ? f.color : 'rgba(0,0,0,0.06)' }}>
                                <Icon className="w-4 h-4" style={{ color: f.ok ? 'white' : '#94a3b8' }} />
                            </div>
                            <span className="text-[17px] font-black tabular-nums"
                                style={{ color: f.ok ? f.color : '#94a3b8' }}>
                                {f.value}
                            </span>
                            <span className="text-[9.5px] font-bold text-slate-400">{f.label}</span>
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
        water:    rings.waterPct * 100,
        sleep:    (rings.sleepHours / 8) * 100,
        activity: (rings.activityMin / 30) * 100,
        mood:     rings.moodScore * 10,
        meds:     rings.medsTotalCount > 0 ? (rings.medsCount / rings.medsTotalCount) * 100 : 100,
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

            {/* 3. Today's Story */}
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

            {/* 5. Day Timeline */}
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

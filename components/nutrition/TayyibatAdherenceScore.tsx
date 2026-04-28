// components/nutrition/TayyibatAdherenceScore.tsx
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat Adherence Score Card
// ════════════════════════════════════════════════════════════════════════
//
// Shows daily / 3-day / weekly adherence with visual indicators,
// trend arrow, weakest meal highlight, and easiest correction.
// ════════════════════════════════════════════════════════════════════════

'use client';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb, Leaf } from 'lucide-react';

import {
    getTodayAdherence,
    getThreeDayAdherence,
    getWeeklyAdherence,
    ADHERENCE_MEAL_LABELS,
    type AdherenceMealTag,
} from '@/lib/nutrition/tayyibat-adherence';

/* ── Design Tokens ── */
const W = {
    glass:       'rgba(255,255,255,0.58)',
    glassHigh:   'rgba(255,255,255,0.72)',
    glassBorder: 'rgba(255,255,255,0.85)',
    glassShadow: '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04)',
    textPrimary: '#0C4A6E',
    textSub:     '#0369A1',
    textMuted:   '#7DD3FC',
    green:       '#059669',
    red:         '#DC2626',
    amber:       '#D97706',
    sheen:       'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
};

type TimeRange = 'today' | '3days' | 'week';

function getScoreColor(score: number): string {
    if (score >= 80) return W.green;
    if (score >= 50) return W.amber;
    return W.red;
}

const TrendIcon = ({ trend }: { trend: 'improving' | 'stable' | 'declining' }) => {
    if (trend === 'improving') return <TrendingUp style={{ width: 14, height: 14, color: W.green }} />;
    if (trend === 'declining') return <TrendingDown style={{ width: 14, height: 14, color: W.red }} />;
    return <Minus style={{ width: 14, height: 14, color: W.textMuted }} />;
};

const TREND_LABELS: Record<string, string> = {
    improving: 'في تحسن',
    stable: 'مستقر',
    declining: 'يحتاج انتباه',
};

export function TayyibatAdherenceScore() {
    const [range, setRange] = useState<TimeRange>('today');

    const today   = useMemo(() => getTodayAdherence(), []);
    const three   = useMemo(() => getThreeDayAdherence(), []);
    const weekly  = useMemo(() => getWeeklyAdherence(), []);

    const score = range === 'today' ? today
        : range === '3days' ? three.average
        : weekly.averageAdherence;

    const scoreColor = getScoreColor(score);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[24px] overflow-hidden"
            style={{
                background: W.glassHigh,
                border: `1px solid ${W.glassBorder}`,
                boxShadow: W.glassShadow,
                position: 'relative',
            }}
        >
            <div style={{ position: 'absolute', inset: 0, background: W.sheen, pointerEvents: 'none' }} />

            <div className="p-5 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-4">
                    <div style={{
                        width: 36, height: 36, borderRadius: 12,
                        background: 'linear-gradient(145deg, rgba(5,150,105,0.12), rgba(34,211,153,0.08))',
                        border: '1px solid rgba(5,150,105,0.22)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Leaf style={{ width: 18, height: 18, color: W.green }} />
                    </div>
                    <div className="flex-1">
                        <h3 style={{ fontSize: 14, fontWeight: 900, color: W.textPrimary }}>
                            الالتزام بالطيبات
                        </h3>
                        <p style={{ fontSize: 10, color: W.textMuted, fontWeight: 600 }}>
                            {range === 'today' ? 'اليوم' : range === '3days' ? 'آخر ٣ أيام' : 'هذا الأسبوع'}
                        </p>
                    </div>
                    {range === 'week' && (
                        <div className="flex items-center gap-1.5">
                            <TrendIcon trend={weekly.trend} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: W.textMuted }}>
                                {TREND_LABELS[weekly.trend]}
                            </span>
                        </div>
                    )}
                </div>

                {/* Score Display */}
                <div className="flex items-end gap-3 mb-4">
                    <motion.span
                        key={score}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ fontSize: 48, fontWeight: 900, color: scoreColor, lineHeight: 1 }}
                    >
                        {score}
                    </motion.span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: W.textMuted, marginBottom: 8 }}>%</span>

                    {/* Violations count */}
                    {range === 'week' && weekly.totalViolations > 0 && (
                        <div className="mr-auto flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5"
                            style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
                            <AlertTriangle style={{ width: 11, height: 11, color: W.red }} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: W.red }}>
                                {weekly.totalViolations} مخالفة
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div className="mb-4" style={{
                    height: 6, borderRadius: 3,
                    background: 'rgba(8,145,178,0.06)',
                    overflow: 'hidden',
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        style={{
                            height: '100%', borderRadius: 3,
                            background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}88)`,
                        }}
                    />
                </div>

                {/* Time range tabs */}
                <div className="flex gap-1 p-0.5 rounded-[10px] mb-4"
                    style={{ background: 'rgba(8,145,178,0.04)' }}>
                    {[
                        { id: 'today' as TimeRange, label: 'اليوم' },
                        { id: '3days' as TimeRange, label: '٣ أيام' },
                        { id: 'week' as TimeRange, label: 'أسبوع' },
                    ].map(tab => (
                        <motion.button
                            key={tab.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setRange(tab.id)}
                            className="flex-1 rounded-[8px] py-1.5"
                            style={{
                                background: range === tab.id ? W.glass : 'transparent',
                                border: range === tab.id ? `1px solid ${W.glassBorder}` : '1px solid transparent',
                            }}
                        >
                            <span style={{
                                fontSize: 10, fontWeight: 700,
                                color: range === tab.id ? W.textSub : W.textMuted,
                            }}>{tab.label}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Insights */}
                {range === 'week' && weekly.daysLogged > 0 && (
                    <div className="space-y-2">
                        {weekly.weakestMeal && (
                            <div className="flex items-center gap-2 rounded-[12px] px-3 py-2"
                                style={{ background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.10)' }}>
                                <AlertTriangle style={{ width: 11, height: 11, color: W.red }} />
                                <span style={{ fontSize: 10, fontWeight: 600, color: W.textSub }}>
                                    أضعف وجبة: <strong>{ADHERENCE_MEAL_LABELS[weekly.weakestMeal]}</strong>
                                </span>
                            </div>
                        )}
                        {weekly.easiestCorrection && (
                            <div className="flex items-center gap-2 rounded-[12px] px-3 py-2"
                                style={{ background: 'rgba(5,150,105,0.04)', border: '1px solid rgba(5,150,105,0.12)' }}>
                                <Lightbulb style={{ width: 11, height: 11, color: W.green }} />
                                <span style={{ fontSize: 10, fontWeight: 600, color: W.textSub }}>
                                    أسهل تصحيح: {weekly.easiestCorrection}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* 3-day chart dots */}
                {range === '3days' && three.days.length > 0 && (
                    <div className="flex items-end justify-center gap-4 mt-2">
                        {three.days.map((d, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div style={{
                                    width: 8, height: Math.max(6, (d.score / 100) * 30),
                                    borderRadius: 4,
                                    background: getScoreColor(d.score),
                                }} />
                                <span style={{ fontSize: 8, fontWeight: 600, color: W.textMuted }}>
                                    {new Date(d.date).toLocaleDateString('ar', { weekday: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

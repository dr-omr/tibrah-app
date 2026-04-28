// components/my-plan/AdaptivePriorityCard.tsx
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Adaptive Priority Card for My Plan
// ════════════════════════════════════════════════════════════════════════
//
// Shows the daily adaptive priority based on:
//   - Current plan state (tools, nutrition, outcomes)
//   - Symptom trend
//   - Tayyibat adherence
//   - Protocol progress
//
// Replaces static text with dynamic, responsive guidance.
// ════════════════════════════════════════════════════════════════════════

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle, TrendingUp, TrendingDown, Minus,
    Utensils, Wrench, RefreshCw, Calendar, Target,
} from 'lucide-react';
import type { SavedCarePlan } from '@/lib/care-plan-store';
import { computeAdaptivePlanState, type AdaptivePlanState } from '@/lib/adaptive-plan-engine';
import { GLASS, TXT } from './plan-tokens';

/* ── Design ── */
const LEVEL_COLORS: Record<string, { bg: string; border: string; accent: string; emoji: string }> = {
    on_track:           { bg: 'rgba(5,150,105,0.10)',  border: 'rgba(5,150,105,0.30)',  accent: '#059669', emoji: '✅' },
    needs_adjustment:   { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.30)', accent: '#F59E0B', emoji: '⚡' },
    needs_intervention: { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.30)',  accent: '#EF4444', emoji: '⚠️' },
    critical:           { bg: 'rgba(220,38,38,0.14)',  border: 'rgba(220,38,38,0.40)',  accent: '#DC2626', emoji: '🚨' },
};

const EMPHASIS_ICONS: Record<string, React.ReactNode> = {
    nutrition:      <Utensils style={{ width: 14, height: 14 }} />,
    tools:          <Wrench style={{ width: 14, height: 14 }} />,
    adherence:      <Target style={{ width: 14, height: 14 }} />,
    reassessment:   <RefreshCw style={{ width: 14, height: 14 }} />,
    booking:        <Calendar style={{ width: 14, height: 14 }} />,
    balanced:       <Target style={{ width: 14, height: 14 }} />,
};

const TREND_DISPLAY: Record<string, { icon: React.ReactNode; text: string; color: string }> = {
    improving:         { icon: <TrendingUp style={{ width: 13, height: 13 }} />,   text: 'الأعراض تتحسن',    color: '#059669' },
    stable:            { icon: <Minus style={{ width: 13, height: 13 }} />,         text: 'الأعراض مستقرة',    color: '#F59E0B' },
    worsening:         { icon: <TrendingDown style={{ width: 13, height: 13 }} />,  text: 'الأعراض تتفاقم',   color: '#EF4444' },
    insufficient_data: { icon: <Minus style={{ width: 13, height: 13 }} />,         text: 'بيانات غير كافية', color: TXT.muted },
};

/* ── Props ── */
interface AdaptivePriorityCardProps {
    plan: SavedCarePlan;
    domainColor: string;
}

export function AdaptivePriorityCard({ plan, domainColor }: AdaptivePriorityCardProps) {
    const state = useMemo(() => computeAdaptivePlanState(plan), [plan]);

    const level = LEVEL_COLORS[state.adaptationLevel] || LEVEL_COLORS.on_track;
    const trend = TREND_DISPLAY[state.symptomTrend] || TREND_DISPLAY.insufficient_data;
    const emphasisIcon = EMPHASIS_ICONS[state.currentEmphasis] || EMPHASIS_ICONS.balanced;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
            <div
                className="relative overflow-hidden"
                style={{
                    borderRadius: 22,
                    background: GLASS.base,
                    border: `1px solid ${GLASS.border}`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: GLASS.shadowSm,
                }}
            >
                {/* Sheen */}
                <div
                    className="absolute inset-x-0 top-0 pointer-events-none"
                    style={{
                        height: '45%',
                        background: GLASS.sheen,
                        borderRadius: '22px 22px 0 0',
                    }}
                />

                <div className="relative z-10 p-4">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 mb-3">
                        <div
                            style={{
                                width: 32, height: 32, borderRadius: 10,
                                background: level.bg, border: `1px solid ${level.border}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <span style={{ fontSize: 15 }}>{level.emoji}</span>
                        </div>
                        <div className="flex-1">
                            <p
                                style={{
                                    fontSize: 8, fontWeight: 900, color: TXT.muted,
                                    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 1,
                                }}
                            >
                                أولوية اليوم
                            </p>
                            <p style={{ fontSize: 13, fontWeight: 800, color: TXT.primary, lineHeight: 1.4 }}>
                                {state.todayPriority}
                            </p>
                        </div>
                    </div>

                    {/* Trend + Emphasis */}
                    <div className="flex gap-2 mb-3">
                        {/* Symptom trend badge */}
                        <div
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px]"
                            style={{
                                background: `${trend.color}12`,
                                border: `1px solid ${trend.color}30`,
                            }}
                        >
                            <span style={{ color: trend.color }}>{trend.icon}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: trend.color }}>
                                {trend.text}
                            </span>
                        </div>

                        {/* Emphasis badge */}
                        <div
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px]"
                            style={{
                                background: `${domainColor}12`,
                                border: `1px solid ${domainColor}30`,
                            }}
                        >
                            <span style={{ color: domainColor }}>{emphasisIcon}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: domainColor }}>
                                {state.currentEmphasis === 'nutrition' ? 'التركيز: التغذية'
                                    : state.currentEmphasis === 'tools' ? 'التركيز: الأدوات'
                                    : state.currentEmphasis === 'adherence' ? 'التركيز: الالتزام'
                                    : state.currentEmphasis === 'reassessment' ? 'إعادة تقييم'
                                    : state.currentEmphasis === 'booking' ? 'حجز جلسة'
                                    : 'متوازن'}
                            </span>
                        </div>
                    </div>

                    {/* Next best action */}
                    <div
                        className="rounded-[14px] p-3 mb-2.5"
                        style={{
                            background: `${domainColor}08`,
                            border: `1px solid ${domainColor}18`,
                        }}
                    >
                        <p
                            style={{
                                fontSize: 7.5, fontWeight: 900, color: domainColor,
                                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4,
                            }}
                        >
                            الخطوة القادمة
                        </p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: TXT.primary, lineHeight: 1.6 }}>
                            {state.nextBestAction}
                        </p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-1.5">
                        <StatCell label="الأدوات" value={`${state.stats.toolCompletion}%`} color={domainColor} />
                        <StatCell label="التغذية" value={`${state.stats.nutritionAdherence}%`} color="#059669" />
                        <StatCell label="يوم" value={`${state.stats.protocolDay}/7`} color={TXT.secondary} />
                    </div>

                    {/* Reassessment note */}
                    {state.reassessmentNote && (
                        <p
                            className="mt-2.5"
                            style={{ fontSize: 10, color: TXT.muted, fontWeight: 600, lineHeight: 1.5 }}
                        >
                            📅 {state.reassessmentNote}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/* ── Small stat cell ── */
function StatCell({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div
            className="text-center py-2 rounded-[10px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
            <p style={{ fontSize: 7, fontWeight: 800, color: TXT.muted, letterSpacing: '0.1em', marginBottom: 2 }}>
                {label}
            </p>
            <p style={{ fontSize: 13, fontWeight: 900, color }}>{value}</p>
        </div>
    );
}

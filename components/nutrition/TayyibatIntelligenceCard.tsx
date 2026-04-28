// components/nutrition/TayyibatIntelligenceCard.tsx
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat Intelligence Card
// ════════════════════════════════════════════════════════════════════════
//
// Shows the smart decision engine output:
//   - Overall assessment
//   - Main blocker + correction
//   - Timing/fasting/behavior insights
//   - Symptom-food correlations
//
// Designed for the tracker tab of the Tayyibat page.
// ════════════════════════════════════════════════════════════════════════

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import { getTodayLog, getWeeklyAdherence } from '@/lib/nutrition/tayyibat-adherence';
import {
    generateDecisionReport,
    type TayyibatDecisionReport,
    type DecisionInsight,
} from '@/lib/nutrition/tayyibat-decision-engine';

/* ── Design Tokens ── */
const W = {
    glass:       'rgba(255,255,255,0.58)',
    glassHigh:   'rgba(255,255,255,0.72)',
    glassBorder: 'rgba(255,255,255,0.85)',
    glassShadow: '0 8px 32px rgba(5,150,105,0.10), 0 2px 8px rgba(0,0,0,0.04)',
    textPrimary: '#0C4A6E',
    textSub:     '#0369A1',
    textMuted:   '#7DD3FC',
    green:       '#059669',
    greenDeep:   '#047857',
    sheen:       'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
};

const LEVEL_COLORS: Record<string, { bg: string; border: string; text: string; emoji: string }> = {
    full:           { bg: 'rgba(5,150,105,0.12)',  border: 'rgba(5,150,105,0.35)',  text: '#059669', emoji: '🌿' },
    mostly:         { bg: 'rgba(34,211,153,0.12)', border: 'rgba(34,211,153,0.35)', text: '#22D3A0', emoji: '🌱' },
    partial:        { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#F59E0B', emoji: '⚡' },
    weak:           { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  text: '#EF4444', emoji: '⚠️' },
    not_following:  { bg: 'rgba(220,38,38,0.14)',  border: 'rgba(220,38,38,0.40)',  text: '#DC2626', emoji: '🚫' },
};

const LEVEL_LABELS: Record<string, string> = {
    full: 'ملتزم بالكامل',
    mostly: 'التزام جيد',
    partial: 'التزام جزئي',
    weak: 'التزام ضعيف',
    not_following: 'غير ملتزم',
};

const PRIORITY_COLORS: Record<string, string> = {
    critical: '#EF4444',
    important: '#F59E0B',
    informational: '#059669',
};

interface TayyibatIntelligenceCardProps {
    /** User-reported symptoms from assessment (if available) */
    reportedSymptoms?: string[];
    /** Self-reported adherence level */
    selfReportedAdherence?: string;
}

export function TayyibatIntelligenceCard({
    reportedSymptoms = [],
    selfReportedAdherence = 'partial',
}: TayyibatIntelligenceCardProps) {
    const [expanded, setExpanded] = React.useState(false);

    const report = useMemo(() => {
        // Get recent logs for analysis
        const recentLogs = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            try {
                const raw = typeof window !== 'undefined'
                    ? localStorage.getItem(`tibrah_tayyibat_daily_logs`)
                    : null;
                if (raw) {
                    const allLogs = JSON.parse(raw) as Record<string, any>;
                    if (allLogs[dateStr]) recentLogs.push(allLogs[dateStr]);
                }
            } catch { /* SSR safe */ }
        }

        return generateDecisionReport(reportedSymptoms, selfReportedAdherence, recentLogs);
    }, [reportedSymptoms, selfReportedAdherence]);

    const levelStyle = LEVEL_COLORS[report.trueAdherenceLevel] || LEVEL_COLORS.partial;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
            <div className="relative overflow-hidden" style={{
                borderRadius: 22,
                background: W.glassHigh,
                border: `1px solid ${W.glassBorder}`,
                boxShadow: W.glassShadow,
            }}>
                {/* Sheen */}
                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
                    height: '45%', background: W.sheen, borderRadius: '22px 22px 0 0',
                }} />

                <div className="relative z-10 p-4">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 mb-3">
                        <div style={{
                            width: 34, height: 34, borderRadius: 11,
                            background: levelStyle.bg, border: `1px solid ${levelStyle.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span style={{ fontSize: 16 }}>{levelStyle.emoji}</span>
                        </div>
                        <div className="flex-1">
                            <p style={{
                                fontSize: 8, fontWeight: 900, color: W.textMuted,
                                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 1,
                            }}>
                                تحليل ذكي — نظام الطيبات
                            </p>
                            <div className="flex items-center gap-2">
                                <p style={{ fontSize: 14, fontWeight: 900, color: W.textPrimary }}>
                                    {LEVEL_LABELS[report.trueAdherenceLevel] || 'جارٍ التحليل'}
                                </p>
                                <div className="px-2 py-0.5 rounded-full" style={{
                                    background: levelStyle.bg, border: `1px solid ${levelStyle.border}`,
                                }}>
                                    <span style={{ fontSize: 11, fontWeight: 900, color: levelStyle.text }}>
                                        {report.compositeScore}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Overall Assessment */}
                    <div className="rounded-[14px] p-3 mb-3" style={{
                        background: 'rgba(5,150,105,0.04)',
                        border: '1px solid rgba(5,150,105,0.12)',
                    }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: W.textPrimary, lineHeight: 1.7 }}>
                            {report.overallAssessment}
                        </p>
                    </div>

                    {/* Top Correction */}
                    <div className="rounded-[14px] p-3 mb-3" style={{
                        background: 'rgba(245,158,11,0.05)',
                        border: '1px solid rgba(245,158,11,0.15)',
                    }}>
                        <p style={{
                            fontSize: 7.5, fontWeight: 900, color: '#F59E0B',
                            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4,
                        }}>
                            التصحيح الأهم
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: W.textPrimary, marginBottom: 4 }}>
                            {report.topCorrection.what}
                        </p>
                        <p style={{ fontSize: 11, color: W.textSub, lineHeight: 1.6 }}>
                            {report.topCorrection.how}
                        </p>
                    </div>

                    {/* Nutrition-Symptoms Link */}
                    {report.nutritionSustainingSymptoms && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-[14px] p-3 mb-3"
                            style={{
                                background: 'rgba(239,68,68,0.06)',
                                border: '1px solid rgba(239,68,68,0.18)',
                            }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle style={{ width: 14, height: 14, color: '#EF4444' }} />
                                <p style={{ fontSize: 11, fontWeight: 900, color: '#EF4444' }}>
                                    الغذاء مرتبط بأعراضك
                                </p>
                            </div>
                            {report.symptomCorrelations.slice(0, 2).map((corr, i) => (
                                <p key={i} style={{ fontSize: 11, color: W.textSub, lineHeight: 1.6, marginBottom: 2 }}>
                                    • {corr.suggestion}
                                </p>
                            ))}
                        </motion.div>
                    )}

                    {/* Expand toggle for insights */}
                    {report.insights.length > 0 && (
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setExpanded(!expanded)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-[12px]"
                            style={{
                                background: 'rgba(5,150,105,0.04)',
                                border: '1px solid rgba(5,150,105,0.10)',
                            }}
                        >
                            <Brain style={{ width: 12, height: 12, color: W.green }} />
                            <span style={{ fontSize: 11, fontWeight: 800, color: W.green }}>
                                {expanded ? 'إخفاء التفاصيل' : `${report.insights.length} ملاحظات ذكية`}
                            </span>
                            <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
                                <ChevronDown style={{ width: 12, height: 12, color: W.green }} />
                            </motion.span>
                        </motion.button>
                    )}

                    {/* Expanded insights */}
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden mt-3 space-y-2"
                            >
                                {report.insights.map((insight, i) => (
                                    <InsightRow key={i} insight={insight} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

function InsightRow({ insight }: { insight: DecisionInsight }) {
    const priColor = PRIORITY_COLORS[insight.priority] || PRIORITY_COLORS.informational;

    return (
        <div className="flex items-start gap-2.5 p-2.5 rounded-[12px]" style={{
            background: `${priColor}06`,
            border: `1px solid ${priColor}14`,
        }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>{insight.emoji}</span>
            <div className="flex-1 min-w-0">
                <p style={{ fontSize: 11, fontWeight: 800, color: W.textPrimary, marginBottom: 2 }}>
                    {insight.title}
                </p>
                <p style={{ fontSize: 10, color: W.textSub, lineHeight: 1.6 }}>
                    {insight.body}
                </p>
            </div>
        </div>
    );
}

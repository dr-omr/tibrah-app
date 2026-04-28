// components/my-plan/ProtocolProgressCard.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Protocol Progress Card (7-day timeline + phase pipeline)
// ════════════════════════════════════════════════════════════════════

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getProtocolDay, getProtocolProgress, getProtocolReassessment } from '@/lib/care-plan-store';
import { getProtocol } from '@/lib/protocol-engine';
import { getRegisteredProtocol } from '@/lib/protocol-registry';
import type { SavedCarePlan } from '@/lib/care-plan-store';

/* ─── Phase Labels ──────────────────────────────── */
const PHASE_LABELS: Record<string, { ar: string; emoji: string }> = {
    understand: { ar: 'الفهم',   emoji: '🔍' },
    practice:   { ar: 'التطبيق', emoji: '⚡' },
    measure:    { ar: 'القياس',  emoji: '📊' },
    assess:     { ar: 'التقييم', emoji: '🔄' },
};

const PHASES: Array<{ key: string; label: string; emoji: string; days: string }> = [
    { key: 'understand', label: 'الفهم',   emoji: '🔍', days: '١-٢' },
    { key: 'practice',   label: 'التطبيق', emoji: '⚡', days: '٣-٤' },
    { key: 'measure',    label: 'القياس',  emoji: '📊', days: '٥-٦' },
    { key: 'assess',     label: 'التقييم', emoji: '🔄', days: '٧' },
];

/* ─── Component ─────────────────────────────────── */
export function ProtocolProgressCard({
    plan, domainColor,
}: { plan: SavedCarePlan; domainColor: string }) {
    const protocol = getProtocol(plan.routing.primary_subdomain)
                  ?? getRegisteredProtocol(plan.routing.primary_subdomain);
    if (!protocol) return null;

    const currentDay   = getProtocolDay(plan);
    const progress     = getProtocolProgress(plan, protocol);
    const reassessment = getProtocolReassessment(plan, protocol);
    const phaseInfo    = PHASE_LABELS[progress.phase];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04, type: 'spring', stiffness: 260, damping: 26 }}
        >
            <div className="relative overflow-hidden" style={{
                borderRadius: 22,
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.90)',
                backdropFilter: 'blur(24px) saturate(160%)',
                boxShadow: '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.95)',
                padding: '18px 18px 14px',
            }}>
                {/* sheen */}
                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
                    height: '45%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)',
                    borderRadius: '22px 22px 0 0',
                }} />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-1">
                            <span style={{ fontSize: 15 }}>🗓️</span>
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 900, color: domainColor, letterSpacing: '-0.01em' }}>
                                    {protocol.arabicTitle}
                                </p>
                                <p style={{ fontSize: 9, color: '#7DD3FC', fontWeight: 700 }}>
                                    {protocol.weekGoal}
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 18, fontWeight: 900, color: domainColor, lineHeight: 1 }}>
                                {progress.adherencePercent}%
                            </p>
                            <p style={{ fontSize: 9, color: '#7DD3FC', fontWeight: 700 }}>التزام</p>
                        </div>
                    </div>

                    {/* Day dots */}
                    <div className="flex items-center gap-1 mb-3 justify-between">
                        {Array.from({ length: protocol.totalDays }, (_, i) => {
                            const d = i + 1;
                            const isDone  = d < currentDay && progress.completedDays >= d;
                            const isCurrent = d === currentDay;
                            return (
                                <div key={d} className="flex flex-col items-center gap-0.5">
                                    <motion.div
                                        style={{
                                            width: 28, height: 28,
                                            borderRadius: isCurrent ? 10 : 8,
                                            background: isDone
                                                ? 'rgba(0,200,140,0.85)'
                                                : isCurrent ? domainColor : 'rgba(0,0,0,0.05)',
                                            border: isCurrent ? `2px solid ${domainColor}` : '1.5px solid transparent',
                                            boxShadow: isCurrent ? `0 4px 12px ${domainColor}40` : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                        animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <span style={{
                                            fontSize: isDone ? 10 : 9, fontWeight: 900,
                                            color: isDone || isCurrent ? '#fff' : 'rgba(0,0,0,0.25)',
                                        }}>
                                            {isDone ? '✓' : d}
                                        </span>
                                    </motion.div>
                                    {d === currentDay && (
                                        <span style={{ fontSize: 7, fontWeight: 800, color: domainColor }}>اليوم</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Phase pipeline */}
                    <div className="grid grid-cols-4 gap-1 mb-3">
                        {PHASES.map(ph => {
                            const isActive  = ph.key === progress.phase;
                            const isPast    = PHASES.indexOf(ph) < PHASES.findIndex(p => p.key === progress.phase);
                            return (
                                <div key={ph.key} className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-[10px]" style={{
                                    background: isActive ? `${domainColor}14` : isPast ? 'rgba(0,200,140,0.07)' : 'rgba(0,0,0,0.03)',
                                    border: `1px solid ${isActive ? domainColor + '28' : 'transparent'}`,
                                }}>
                                    <span style={{ fontSize: 13 }}>{ph.emoji}</span>
                                    <p style={{
                                        fontSize: 8.5, fontWeight: isActive ? 900 : 600,
                                        color: isActive ? domainColor : isPast ? 'rgba(0,140,90,0.7)' : 'rgba(0,0,0,0.28)',
                                        textAlign: 'center', lineHeight: 1.2,
                                    }}>
                                        {ph.label}
                                    </p>
                                    <span style={{ fontSize: 7, color: 'rgba(0,0,0,0.2)', fontWeight: 600 }}>يوم {ph.days}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Current phase description */}
                    <div style={{
                        padding: '8px 12px', borderRadius: 12,
                        background: `${domainColor}09`, border: `1px solid ${domainColor}18`,
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <span style={{ fontSize: 14 }}>{phaseInfo.emoji}</span>
                        <div className="flex-1">
                            <p style={{ fontSize: 10, fontWeight: 900, color: domainColor, letterSpacing: '0.06em', marginBottom: 1 }}>
                                أنت في مرحلة: {phaseInfo.ar}
                            </p>
                            <p style={{ fontSize: 9, color: '#0369A1', fontWeight: 600, lineHeight: 1.4 }}>
                                {progress.phase === 'understand' && 'ركّز على الفهم — لا ضغط على التغيير الآن'}
                                {progress.phase === 'practice'   && 'طبّق الأداة بانتظام — التكرار هو ما يُرسّخ العادة'}
                                {progress.phase === 'measure'    && 'قِس التحسن — قارن اليوم بالبداية'}
                                {progress.phase === 'assess'     && 'حان وقت إعادة التقييم — هل تحسّن وضعك؟'}
                            </p>
                        </div>
                        {reassessment.needed && (
                            <Link href="/symptom-checker">
                                <motion.div whileTap={{ scale: 0.94 }} style={{
                                    padding: '6px 10px', borderRadius: 10,
                                    background: reassessment.urgency === 'high' ? 'rgba(239,68,68,0.12)' : `${domainColor}18`,
                                    border: `1px solid ${reassessment.urgency === 'high' ? 'rgba(239,68,68,0.30)' : domainColor + '28'}`,
                                }}>
                                    <p style={{ fontSize: 9, fontWeight: 900, color: reassessment.urgency === 'high' ? '#DC2626' : domainColor, whiteSpace: 'nowrap' }}>
                                        أعد التقييم ←
                                    </p>
                                </motion.div>
                            </Link>
                        )}
                        {!reassessment.needed && reassessment.daysTill > 0 && (
                            <p style={{ fontSize: 8.5, fontWeight: 700, color: '#7DD3FC', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                بعد {reassessment.daysTill}د
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

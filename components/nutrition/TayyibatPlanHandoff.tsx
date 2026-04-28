// components/nutrition/TayyibatPlanHandoff.tsx
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat Plan Integration Card
// Shows nutrition focus for my-plan: today's focus, biggest violation,
// easiest next correction.
// ════════════════════════════════════════════════════════════════════════

'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Leaf, AlertTriangle, Lightbulb, ChevronLeft } from 'lucide-react';

import { getWeeklyAdherence, hasAnyTayyibatLog, ADHERENCE_MEAL_LABELS } from '@/lib/nutrition/tayyibat-adherence';
import { haptic } from '@/lib/HapticFeedback';

const W = {
    glass:       'rgba(255,255,255,0.58)',
    glassHigh:   'rgba(255,255,255,0.72)',
    glassBorder: 'rgba(255,255,255,0.85)',
    glassShadow: '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04)',
    textPrimary: '#0C4A6E',
    textSub:     '#0369A1',
    textMuted:   '#7DD3FC',
    green:       '#059669',
    greenBg:     'rgba(5,150,105,0.06)',
    greenBorder: 'rgba(5,150,105,0.22)',
    red:         '#DC2626',
    amber:       '#D97706',
    sheen:       'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
};

export function TayyibatPlanHandoff() {
    const weekly  = useMemo(() => getWeeklyAdherence(), []);
    const hasLogs = useMemo(() => hasAnyTayyibatLog(), []);

    // No logs yet — show onboarding CTA
    if (!hasLogs) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[22px] relative overflow-hidden"
                style={{
                    background: 'linear-gradient(145deg, rgba(5,150,105,0.08), rgba(34,211,153,0.04))',
                    border: `1px solid ${W.greenBorder}`,
                }}
            >
                <div style={{ position: 'absolute', inset: 0, background: W.sheen, pointerEvents: 'none' }} />
                <div className="p-5 relative z-10" style={{ direction: 'rtl' }}>
                    <div className="flex items-center gap-2.5 mb-3">
                        <Leaf style={{ width: 18, height: 18, color: W.green }} />
                        <h3 style={{ fontSize: 14, fontWeight: 900, color: W.textPrimary }}>
                            نظام الطيبات
                        </h3>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: W.textSub, lineHeight: 1.7, marginBottom: 12 }}>
                        سجّل وجباتك اليومية لمعرفة مدى التزامك بنظام الطيبات واكتشاف التصحيحات الأسهل
                    </p>
                    <Link href="/tayyibat" onClick={() => haptic.selection()}>
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center justify-center gap-2 py-3 rounded-[14px]"
                            style={{
                                background: 'rgba(5,150,105,0.10)',
                                border: `1px solid ${W.greenBorder}`,
                            }}
                        >
                            <Leaf style={{ width: 14, height: 14, color: W.green }} />
                            <span style={{ fontSize: 13, fontWeight: 800, color: W.green }}>ابدأ التسجيل</span>
                            <ChevronLeft style={{ width: 14, height: 14, color: W.green }} />
                        </motion.div>
                    </Link>
                </div>
            </motion.div>
        );
    }

    // Has logs — show summary
    const scoreColor = weekly.averageAdherence >= 80 ? W.green
        : weekly.averageAdherence >= 50 ? W.amber : W.red;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[22px] relative overflow-hidden"
            style={{
                background: W.glassHigh,
                border: `1px solid ${W.glassBorder}`,
                boxShadow: W.glassShadow,
            }}
        >
            <div style={{ position: 'absolute', inset: 0, background: W.sheen, pointerEvents: 'none' }} />
            <div className="p-5 relative z-10" style={{ direction: 'rtl' }}>
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-3">
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: W.greenBg, border: `1px solid ${W.greenBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Leaf style={{ width: 16, height: 16, color: W.green }} />
                    </div>
                    <div className="flex-1">
                        <h3 style={{ fontSize: 13, fontWeight: 900, color: W.textPrimary }}>الطيبات هذا الأسبوع</h3>
                        <p style={{ fontSize: 10, color: W.textMuted, fontWeight: 600 }}>
                            {weekly.daysLogged} أيام مسجلة
                        </p>
                    </div>
                    <span style={{ fontSize: 24, fontWeight: 900, color: scoreColor }}>
                        {weekly.averageAdherence}%
                    </span>
                </div>

                {/* Insights */}
                <div className="space-y-1.5">
                    {weekly.weakestMeal && (
                        <div className="flex items-center gap-2 py-1">
                            <AlertTriangle style={{ width: 11, height: 11, color: W.red }} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: W.textSub }}>
                                أضعف وجبة: {ADHERENCE_MEAL_LABELS[weekly.weakestMeal]}
                            </span>
                        </div>
                    )}
                    {weekly.easiestCorrection && (
                        <div className="flex items-center gap-2 py-1">
                            <Lightbulb style={{ width: 11, height: 11, color: W.green }} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: W.textSub }}>
                                {weekly.easiestCorrection}
                            </span>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <Link href="/tayyibat" onClick={() => haptic.selection()}>
                    <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-[12px] mt-3"
                        style={{
                            background: 'rgba(8,145,178,0.06)',
                            border: '1px solid rgba(8,145,178,0.15)',
                        }}
                    >
                        <span style={{ fontSize: 11, fontWeight: 700, color: W.textSub }}>فتح نظام الطيبات</span>
                        <ChevronLeft style={{ width: 13, height: 13, color: W.textMuted }} />
                    </motion.div>
                </Link>
            </div>
        </motion.div>
    );
}

// components/nutrition/TayyibatViolationList.tsx
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat Violation List
// Shows detected forbidden items with meal context and repeat count.
// ════════════════════════════════════════════════════════════════════════

'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, ArrowLeftRight } from 'lucide-react';

import { getTodayLog, type MealLog } from '@/lib/nutrition/tayyibat-adherence';
import { getSubstituteSuggestion } from '@/lib/nutrition/tayyibat-engine';

const W = {
    glass:       'rgba(255,255,255,0.58)',
    glassBorder: 'rgba(255,255,255,0.85)',
    textPrimary: '#0C4A6E',
    textSub:     '#0369A1',
    textMuted:   '#7DD3FC',
    red:         '#DC2626',
    redBg:       'rgba(220,38,38,0.05)',
    redBorder:   'rgba(220,38,38,0.15)',
    green:       '#059669',
    greenBg:     'rgba(5,150,105,0.06)',
    greenBorder: 'rgba(5,150,105,0.18)',
};

interface ViolationEntry {
    item: string;
    mealTag: string;
    matchedItem?: string;
}

export function TayyibatViolationList() {
    const todayLog = useMemo(() => getTodayLog(), []);

    const violations = useMemo((): ViolationEntry[] => {
        if (!todayLog) return [];
        const result: ViolationEntry[] = [];
        for (const [tag, meal] of Object.entries(todayLog.meals)) {
            if (!meal) continue;
            for (const item of meal.items) {
                if (item.classification === 'forbidden') {
                    result.push({
                        item: item.raw,
                        mealTag: tag,
                        matchedItem: item.matchedItem,
                    });
                }
            }
        }
        return result;
    }, [todayLog]);

    if (violations.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] overflow-hidden"
            style={{
                background: W.redBg,
                border: `1px solid ${W.redBorder}`,
            }}
        >
            <div className="p-4" style={{ direction: 'rtl' }}>
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle style={{ width: 15, height: 15, color: W.red }} />
                    <h4 style={{ fontSize: 13, fontWeight: 900, color: W.red }}>
                        مخالفات اليوم ({violations.length})
                    </h4>
                </div>

                <div className="space-y-2">
                    {violations.map((v, i) => {
                        const subs = getSubstituteSuggestion(v.item);
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="rounded-[14px] p-3"
                                style={{ background: 'rgba(255,255,255,0.60)', border: `1px solid ${W.glassBorder}` }}
                            >
                                <div className="flex items-center gap-2">
                                    <span style={{ fontSize: 12, color: W.red }}>❌</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: W.textPrimary, flex: 1 }}>
                                        {v.item}
                                    </span>
                                    <span style={{ fontSize: 9, fontWeight: 600, color: W.textMuted }}>
                                        {v.mealTag}
                                    </span>
                                </div>
                                {subs.length > 0 && (
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <ArrowLeftRight style={{ width: 10, height: 10, color: W.green }} />
                                        <span style={{ fontSize: 10, fontWeight: 600, color: W.green }}>
                                            البديل: {subs.slice(0, 2).join(' أو ')}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

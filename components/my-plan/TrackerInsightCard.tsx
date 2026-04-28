// components/my-plan/TrackerInsightCard.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Tracker Insight Card (Sprint 5 — insight-rules.ts powered)
// ════════════════════════════════════════════════════════════════════

import React from 'react';
import { motion } from 'framer-motion';
import { getPlanId } from '@/lib/outcome-store';
import { getTrackerInsight, getLegacyTrackerInsight } from '@/lib/insight-rules';
import type { SavedCarePlan } from '@/lib/care-plan-store';

export function TrackerInsightCard({ plan, domainColor }: { plan: SavedCarePlan; domainColor: string }) {
    const planId     = getPlanId(plan.createdAt);
    const subdomainId = plan.routing.primary_subdomain;

    // تحقّق من الريجستري أولاً ثم المسار القديم
    const insight = React.useMemo(() => {
        const fromRegistry = getTrackerInsight(subdomainId, planId);
        if (fromRegistry) return fromRegistry;
        return getLegacyTrackerInsight(planId); // fallback
    }, [planId, subdomainId]);

    if (!insight) return null;

    const levelBg: Record<string, string> = {
        low:    'rgba(239,68,68,0.07)',
        medium: `${domainColor}08`,
        high:   'rgba(0,200,140,0.07)',
    };
    const levelBorder: Record<string, string> = {
        low:    'rgba(239,68,68,0.20)',
        medium: `${domainColor}20`,
        high:   'rgba(0,200,140,0.20)',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 py-3 rounded-[16px] flex items-start gap-3"
            style={{
                background: levelBg[insight.level],
                border: `1px solid ${levelBorder[insight.level]}`,
            }}
        >
            <span className="text-[20px] flex-shrink-0 mt-0.5">{insight.emoji}</span>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest mb-0.5"
                    style={{ color: insight.level === 'high' ? 'rgba(0,140,90,0.85)' : insight.level === 'low' ? '#EF4444' : domainColor }}>
                    تسجيل اليوم — {insight.label}
                </p>
                <p className="text-slate-700 text-[12px] font-medium leading-snug">
                    {insight.message}
                </p>
            </div>
            {insight.score !== null && (
                <div className="flex-shrink-0 flex flex-col items-center">
                    <span className="text-[20px] font-black tabular-nums leading-none"
                        style={{ color: insight.level === 'high' ? 'rgba(0,140,90,0.85)' : insight.level === 'low' ? '#EF4444' : domainColor }}>
                        {insight.score}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold">{insight.unit}</span>
                </div>
            )}
        </motion.div>
    );
}

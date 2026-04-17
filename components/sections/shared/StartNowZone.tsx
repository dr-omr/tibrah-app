'use client';
/**
 * StartNowZone.tsx — بوابة البدء الذكية
 * ─────────────────────────────────────────
 * Three states:
 *   1. "موصى لك الآن"  — routing exists, show recommended tools
 *   2. "ابدأ من هنا"   — no assessment, show primary CTA
 *   3. "أكمل ما بدأت"  — has opened but not completed tools
 */

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowLeft, Play, CheckCircle2 } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { getActiveCarePlan } from '@/lib/care-plan-store';
import type { DomainId, ToolRecommendation } from '@/components/health-engine/types';

interface StartNowItem {
    emoji: string;
    label: string;
    sub: string;
    href: string;
    pulse?: boolean;
}

interface StartNowZoneProps {
    domainId: DomainId;
    color: string;
    colorAlt: string;
    /** Fallback items when no plan exists */
    defaultItems: StartNowItem[];
    /** Main CTA for first-time users */
    startHref?: string;
    startLabel?: string;
}

export function StartNowZone({
    domainId,
    color,
    colorAlt,
    defaultItems,
    startHref = '/symptom-checker',
    startLabel = 'ابدأ التقييم',
}: StartNowZoneProps) {
    const plan = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return getActiveCarePlan();
    }, []);

    const isDomainRelevant = plan && (
        plan.routing.primary_domain === domainId ||
        plan.routing.secondary_domain === domainId
    );

    // State detection
    const hasOpenedTools = plan && plan.toolsOpened.length > 0;
    const hasIncomplete = plan && plan.toolsOpened.length > plan.toolsCompleted.length;

    // Determine header
    let headerIcon = '🚀';
    let headerText = 'ابدأ من هنا';
    let headerSub = 'اختر أداة التقييم المناسبة لبدء رحلتك';

    if (plan && isDomainRelevant && hasIncomplete) {
        headerIcon = '▶️';
        headerText = 'أكمل ما بدأت';
        headerSub = `فتحت ${plan.toolsOpened.length} أدوات — أكملت ${plan.toolsCompleted.length}`;
    } else if (plan && isDomainRelevant) {
        headerIcon = '⭐';
        headerText = 'موصى لك الآن';
        headerSub = plan.routing.priority || 'أدوات مخصصة بناءً على تقييمك';
    }

    // Items to show
    let items: StartNowItem[];
    if (plan && isDomainRelevant) {
        // Show recommended tools from routing
        items = plan.routing.recommended_tools.slice(0, 4).map(t => ({
            emoji: t.emoji,
            label: t.arabicName,
            sub: `${t.durationMinutes} دقيقة`,
            href: t.href,
        }));
        // If no tools in routing, fallback
        if (items.length === 0) items = defaultItems.slice(0, 4);
    } else {
        items = defaultItems.slice(0, 4);
    }

    return (
        <div className="px-4 mb-5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-[13px]">{headerIcon}</span>
                <div className="flex-1">
                    <p className="text-[11px] font-black text-slate-700 tracking-tight">{headerText}</p>
                    <p className="text-[8.5px] text-slate-400 mt-0.5">{headerSub}</p>
                </div>
            </div>

            {/* No plan — show big CTA first */}
            {!plan && (
                <Link href={startHref} onClick={() => haptic.impact()}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={{ scale: 0.96 }}
                        className="relative overflow-hidden rounded-[20px] p-4 mb-3"
                        style={{
                            background: `linear-gradient(135deg, ${color}F2, ${colorAlt}E8)`,
                            boxShadow: `0 10px 32px ${color}35`,
                        }}
                    >
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: 'linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)' }}
                            animate={{ x: ['-120%', '120%'] }}
                            transition={{ duration: 4, repeat: Infinity, repeatDelay: 6 }}
                        />
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[14px] font-black text-white">{startLabel}</p>
                                <p className="text-[10px] text-white/60 mt-0.5">تقييم سريري ذكي — ٥ دقائق</p>
                            </div>
                            <ArrowLeft className="w-5 h-5 text-white/60" />
                        </div>
                    </motion.div>
                </Link>
            )}

            {/* Items grid */}
            <div className="grid grid-cols-2 gap-2">
                {items.map((item, i) => {
                    const isCompleted = plan?.toolsCompleted.some(
                        id => plan.routing.recommended_tools.find(t => t.id === id)?.href === item.href
                    );

                    return (
                        <Link key={`${item.href}-${i}`} href={item.href} onClick={() => haptic.tap()}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 28, delay: 0.04 * i }}
                                whileTap={{ scale: 0.95 }}
                                className="relative rounded-[16px] p-3 overflow-hidden"
                                style={{
                                    background: isCompleted
                                        ? `${color}08`
                                        : 'rgba(255,255,255,0.85)',
                                    border: isCompleted
                                        ? `1.5px solid ${color}30`
                                        : '1px solid rgba(226,232,240,0.5)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                }}
                            >
                                {isCompleted && (
                                    <CheckCircle2
                                        className="absolute top-2 left-2 w-3.5 h-3.5"
                                        style={{ color }}
                                    />
                                )}
                                <span className="text-[18px] leading-none block mb-2">{item.emoji}</span>
                                <p className="text-[10.5px] font-black text-slate-700 leading-tight mb-0.5">{item.label}</p>
                                <p className="text-[8.5px] text-slate-400">{item.sub}</p>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

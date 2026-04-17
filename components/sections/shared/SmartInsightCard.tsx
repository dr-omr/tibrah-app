'use client';
/**
 * SmartInsightCard.tsx — بطاقة الرؤية الذكية المشتركة
 * ──────────────────────────────────────────────────────
 * تظهر توصية ذكية مخصصة بلون ونبض القسم
 * Props: color, colorAlt, insight (object)
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';

export interface InsightData {
    label: string;            // مثل: "توصية اليوم"
    title: string;            // العنوان الرئيسي
    body: string;             // النص التوضيحي
    cta: string;              // نص الزر
    href: string;             // رابط الإجراء
    emoji: string;            // أيقونة الرؤية
    urgency?: 'normal' | 'high'; // مستوى الأولوية
}

interface SmartInsightProps {
    color: string;
    colorAlt: string;
    insight: InsightData;
}

export function SmartInsightCard({ color, colorAlt, insight }: SmartInsightProps) {
    const isUrgent = insight.urgency === 'high';

    return (
        <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30, delay: 0.06 }}
            className="relative overflow-hidden rounded-[22px] mb-4 mx-4"
            style={{
                background: [
                    'linear-gradient(148deg,',
                    '  rgba(255,255,255,0.94) 0%,',
                    '  rgba(255,255,255,0.86) 60%,',
                    `  ${color}0D 100%`,
                    ')',
                ].join(''),
                border: '1px solid rgba(255,255,255,0.80)',
                borderTop: '1px solid rgba(255,255,255,0.97)',
                backdropFilter: 'blur(40px) saturate(2)',
                WebkitBackdropFilter: 'blur(40px) saturate(2)',
                boxShadow: [
                    '0 2px 0 rgba(255,255,255,0.96) inset',
                    `0 14px 42px ${color}18`,
                    '0 4px 14px rgba(0,0,0,0.06)',
                ].join(', '),
            }}
        >
            {/* Left accent strip */}
            <div className="absolute top-0 bottom-0 right-0 w-[3.5px]"
                style={{ background: `linear-gradient(to bottom, ${color}, ${colorAlt} 60%, transparent)` }} />

            {/* Color pool */}
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${color}14, transparent 70%)`, filter: 'blur(10px)' }} />

            {/* Shimmer */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.28) 48%, transparent 68%)' }}
                animate={{ x: ['-140%', '140%'] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 7, ease: 'easeInOut' }}
            />

            <div className="relative z-10 p-4">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-7 h-7 rounded-[10px] flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}14`, border: `1px solid ${color}20` }}>
                        <Sparkles className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <span className="text-[8.5px] font-black uppercase tracking-[0.16em]" style={{ color }}>
                        {insight.label}
                    </span>
                    {isUrgent && (
                        <motion.div
                            className="mr-auto flex items-center gap-1 px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)' }}
                            animate={{ opacity: [1, 0.55, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span className="text-[7.5px] font-black text-red-400">عاجل</span>
                        </motion.div>
                    )}
                    <span className="text-[22px] leading-none mr-auto">{insight.emoji}</span>
                </div>

                {/* Content */}
                <h4 className="text-[14px] font-black text-slate-800 leading-tight mb-1 tracking-tight">
                    {insight.title}
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                    {insight.body}
                </p>

                {/* CTA */}
                <Link href={insight.href} onClick={() => haptic.impact()}>
                    <motion.div
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] self-start w-fit"
                        style={{
                            background: `linear-gradient(135deg, ${color}, ${colorAlt})`,
                            boxShadow: `0 4px 14px ${color}35`,
                        }}
                    >
                        <span className="text-[10px] font-black text-white">{insight.cta}</span>
                        <ArrowLeft className="w-3 h-3 text-white/80" />
                    </motion.div>
                </Link>
            </div>
        </motion.div>
    );
}

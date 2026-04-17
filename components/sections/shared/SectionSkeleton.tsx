'use client';
/**
 * SectionSkeleton.tsx — Skeleton Loader لصفحات الأقسام
 * ───────────────────────────────────────────────────────
 * يظهر فوراً قبل تحميل البيانات الحقيقية
 * color    → لون القسم (teal / purple / amber / blue)
 * variant  → 'full' | 'compact'
 */

import React from 'react';
import { motion } from 'framer-motion';

interface SectionSkeletonProps {
    color: string;
    colorAlt: string;
}

/* ─── Pulse animation ──────────────────────────── */
const pulse = {
    animate: { opacity: [0.4, 0.7, 0.4] },
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const },
};

function SkeletonBlock({
    w = '100%', h = 14, r = 8, delay = 0,
}: {
    w?: string | number; h?: number; r?: number; delay?: number;
}) {
    return (
        <motion.div
            {...pulse}
            transition={{ ...pulse.transition, delay }}
            className="rounded-full flex-shrink-0"
            style={{ width: w, height: h, background: 'rgba(0,0,0,0.06)', borderRadius: r }}
        />
    );
}

function SkeletonCard({ color, delay = 0 }: { color: string; delay?: number }) {
    return (
        <motion.div
            {...pulse}
            transition={{ ...pulse.transition, delay }}
            className="rounded-[22px] p-3.5 flex flex-col gap-2.5"
            style={{
                background: `linear-gradient(148deg, ${color}0A, rgba(255,255,255,0.80))`,
                border: '1px solid rgba(255,255,255,0.70)',
                borderTop: '1px solid rgba(255,255,255,0.92)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                minHeight: 120,
                boxShadow: `0 8px 28px ${color}0C`,
            }}
        >
            {/* Icon placeholder */}
            <div className="w-10 h-10 rounded-[13px]"
                style={{ background: `${color}14` }} />
            {/* Text lines */}
            <div className="flex flex-col gap-1.5 mt-auto">
                <div className="h-[11px] rounded-full"
                    style={{ background: 'rgba(0,0,0,0.07)', width: '72%' }} />
                <div className="h-[9px] rounded-full"
                    style={{ background: 'rgba(0,0,0,0.05)', width: '55%' }} />
            </div>
        </motion.div>
    );
}

export function SectionSkeleton({ color, colorAlt }: SectionSkeletonProps) {
    return (
        <div className="px-4 pb-24">
            {/* Hero skeleton */}
            <motion.div
                {...pulse}
                className="relative overflow-hidden rounded-[26px] mb-4"
                style={{
                    height: 220,
                    background: `linear-gradient(148deg, ${color}22 0%, rgba(0,0,0,0.08) 60%, ${colorAlt}10 100%)`,
                }}
            >
                {/* Shimmer sweep */}
                <motion.div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.12) 48%, transparent 68%)' }}
                    animate={{ x: ['-140%', '140%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Back button */}
                <div className="absolute top-5 right-5 w-8 h-8 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.14)' }} />
                {/* Bottom content */}
                <div className="absolute bottom-5 right-5 flex flex-col items-end gap-2">
                    <div className="h-4 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                    <div className="h-6 w-36 rounded-full" style={{ background: 'rgba(255,255,255,0.16)' }} />
                    <div className="h-3 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.09)' }} />
                </div>
            </motion.div>

            {/* CrossDomainBar skeleton */}
            <div className="flex items-center gap-2 px-1 mb-4 overflow-x-hidden">
                {[...Array(4)].map((_, i) => (
                    <motion.div key={i} {...pulse}
                        transition={{ ...pulse.transition, delay: 0.06 * i }}
                        className="flex-1 h-9 rounded-[14px]"
                        style={{ background: i === 0 ? `${color}14` : 'rgba(0,0,0,0.04)' }}
                    />
                ))}
            </div>

            {/* Dashboard card skeleton */}
            <motion.div {...pulse} className="rounded-[26px] p-5 mb-4"
                style={{
                    background: 'rgba(255,255,255,0.82)',
                    border: '1px solid rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)',
                    boxShadow: `0 10px 32px ${color}10`,
                }}>
                <div className="flex items-start gap-5">
                    {/* Ring */}
                    <div className="w-[88px] h-[88px] rounded-full flex-shrink-0"
                        style={{ background: `${color}10`, border: `6px solid ${color}18` }} />
                    {/* Grid */}
                    <div className="flex-1 grid grid-cols-2 gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-14 rounded-[14px]"
                                style={{ background: 'rgba(0,0,0,0.04)' }} />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Quick actions skeleton */}
            <div className="flex gap-2.5 mb-4 overflow-x-hidden">
                {[...Array(5)].map((_, i) => (
                    <motion.div key={i} {...pulse}
                        transition={{ ...pulse.transition, delay: 0.05 * i }}
                        className="flex-shrink-0 rounded-[18px]"
                        style={{ width: 68, height: 78, background: 'rgba(0,0,0,0.04)' }}
                    />
                ))}
            </div>

            {/* Insight card skeleton */}
            <div className="rounded-[22px] p-4 mb-5 h-28"
                style={{ background: 'rgba(255,255,255,0.80)', border: '1px solid rgba(255,255,255,0.72)' }} />

            {/* Section divider */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
                <div className="h-3 w-32 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }} />
                <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
            </div>

            {/* Subsections (3 panels) */}
            {[...Array(3)].map((_, si) => (
                <div key={si} className="mb-5">
                    {/* Panel header */}
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="w-[3.5px] h-[18px] rounded-full"
                            style={{ background: `${color}40` }} />
                        <div className="h-[13px] w-[120px] rounded-full"
                            style={{ background: 'rgba(0,0,0,0.07)' }} />
                        <div className="mr-auto h-[18px] w-8 rounded-full"
                            style={{ background: 'rgba(0,0,0,0.05)' }} />
                    </div>
                    {/* 2-col card grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                        {[...Array(si === 0 ? 0 : 4)].map((_, ci) => (
                            <SkeletonCard key={ci} color={color} delay={0.04 * ci} />
                        ))}
                        {si === 0 && (
                            /* Featured card */
                            <motion.div className="col-span-2 h-36 rounded-[24px]"
                                style={{ background: `linear-gradient(148deg, ${color}CC, ${colorAlt}CC)`, opacity: 0.2 }}
                                {...pulse} />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

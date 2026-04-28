// components/sections/shared/SectionSkeleton.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Premium Section Loading Skeleton
// Replaces blank <div> loading states with animated shimmer skeletons
// ════════════════════════════════════════════════════════════════════

import React from 'react';
import { motion } from 'framer-motion';

const shimmerStyle: React.CSSProperties = {
    backgroundImage: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.8s ease-in-out infinite',
};

function Bar({ w = '100%', h = 14, r = 8, delay = 0, className = '' }: {
    w?: string | number; h?: number; r?: number; delay?: number; className?: string;
}) {
    return (
        <motion.div
            className={`bg-slate-200/60 ${className}`}
            style={{ width: typeof w === 'number' ? `${w}px` : w, height: h, borderRadius: r, ...shimmerStyle }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}
        />
    );
}

function Ring({ size = 88, delay = 0 }: { size?: number; delay?: number }) {
    return (
        <motion.div
            className="rounded-full bg-slate-200/50 flex-shrink-0"
            style={{ width: size, height: size, ...shimmerStyle }}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }}
        />
    );
}

interface SectionSkeletonProps {
    /** dominant color of the section */
    color: string;
    /** background gradient for the section */
    bg?: string;
}

export function SectionSkeleton({ color, bg }: SectionSkeletonProps) {
    return (
        <div className="min-h-screen pb-28" style={{ background: bg || `linear-gradient(168deg, ${color}10, #F9FAFB 50%, ${color}08)` }}>
            {/* Inject keyframes */}
            <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

            {/* Hero area */}
            <div className="relative overflow-hidden" style={{ height: 200, background: `linear-gradient(135deg, ${color}20, ${color}08)` }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)' }} />
                <div className="absolute bottom-5 right-5 space-y-2">
                    <Bar w={140} h={20} r={10} delay={0.1} />
                    <Bar w={200} h={12} r={6} delay={0.15} />
                </div>
            </div>

            {/* Cross-domain bar placeholder */}
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="flex gap-3 justify-center">
                    {[1, 2, 3, 4].map(i => (
                        <motion.div key={i} className="rounded-full bg-slate-200/40" style={{ width: 64, height: 28, ...shimmerStyle }}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }} />
                    ))}
                </div>
            </div>

            {/* Status bar */}
            <div className="mx-4 mt-4">
                <div className="rounded-[20px] p-4" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.8)' }}>
                    <div className="flex items-center gap-3">
                        <Ring size={14} delay={0.2} />
                        <div className="flex-1 space-y-1.5">
                            <Bar w="70%" h={12} delay={0.25} />
                            <Bar w="40%" h={8} delay={0.3} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard card */}
            <div className="mx-4 mt-4">
                <div className="rounded-[24px] p-5" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-start gap-5">
                        <Ring size={88} delay={0.3} />
                        <div className="flex-1 grid grid-cols-2 gap-2">
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className="rounded-[12px] p-3" style={{ background: `${color}08`, border: `1px solid ${color}12` }}>
                                    <Bar w={40} h={16} delay={0.35 + i * 0.05} />
                                    <Bar w={28} h={8} delay={0.4 + i * 0.05} className="mt-1.5" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Start Now Zone placeholder */}
            <div className="px-4 mt-5">
                <Bar w={80} h={10} delay={0.5} className="mb-3" />
                <div className="flex gap-3 overflow-hidden">
                    {[1, 2, 3].map(i => (
                        <motion.div key={i} className="rounded-[20px] flex-shrink-0" style={{ width: 130, height: 100, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.85)', ...shimmerStyle }}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }} />
                    ))}
                </div>
            </div>

            {/* Subdomain rail placeholder */}
            <div className="px-4 mt-5 flex gap-2.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <motion.div key={i} className="rounded-full" style={{ width: 70, height: 30, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)', ...shimmerStyle }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.04 }} />
                ))}
            </div>

            {/* Content blocks */}
            <div className="px-4 mt-6 space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-[18px] p-4" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.8)' }}>
                        <div className="flex items-center gap-3">
                            <Ring size={40} delay={0.7 + i * 0.05} />
                            <div className="flex-1 space-y-1.5">
                                <Bar w="60%" h={13} delay={0.72 + i * 0.05} />
                                <Bar w="80%" h={9} delay={0.76 + i * 0.05} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── My Plan Skeleton ─────────────────────────── */
export function MyPlanSkeleton() {
    return (
        <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(168deg, #E8F9F5 0%, #F0FBFA 50%, #F3FFFE 100%)' }}>
            <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
            
            {/* Header */}
            <div className="px-5 pt-6 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.7)' }}>
                <Bar w={32} h={32} r={12} delay={0.05} />
                <Bar w={120} h={20} r={10} delay={0.1} />
                <Bar w={32} h={32} r={12} delay={0.05} />
            </div>

            {/* Domain scores */}
            <div className="px-4 mt-4 flex gap-2.5">
                {[1, 2, 3, 4].map(i => (
                    <motion.div key={i} className="flex-1 rounded-[16px] p-3" style={{ background: 'rgba(255,255,255,0.7)', height: 70, ...shimmerStyle }}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }} />
                ))}
            </div>

            {/* Checklist */}
            <div className="mx-4 mt-5 rounded-[22px] p-5" style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(255,255,255,0.9)' }}>
                <Bar w={100} h={14} delay={0.3} className="mb-3" />
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 py-2">
                        <Ring size={20} delay={0.35 + i * 0.05} />
                        <Bar w="70%" h={12} delay={0.38 + i * 0.05} />
                    </div>
                ))}
            </div>

            {/* Tool cards */}
            <div className="px-4 mt-5 space-y-3">
                {[1, 2].map(i => (
                    <motion.div key={i} className="rounded-[20px]" style={{ height: 100, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.85)', ...shimmerStyle }}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }} />
                ))}
            </div>
        </div>
    );
}

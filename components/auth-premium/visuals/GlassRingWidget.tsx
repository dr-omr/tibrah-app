import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

export default function GlassRingWidget({ className = '' }: { className?: string }) {
    const [mounted, setMounted] = useState(false);

    const rings = useMemo(() => [
        { name: 'الحيوية',    color: '#f43f5e', trackColor: 'rgba(244,63,94,0.10)',  dash: 251, target: 42, size: 40, pct: '٨٤٪', trend: '+٣٪' },
        { name: 'التوازن',    color: '#2B9A89', trackColor: 'rgba(43,154,137,0.10)',  dash: 176, target: 55, size: 28, pct: '٩١٪', trend: '+٥٪' },
        { name: 'الترطيب',    color: '#3b82f6', trackColor: 'rgba(59,130,246,0.10)',  dash: 101, target: 22, size: 16, pct: '٧٨٪', trend: '+٢٪' },
    ], []);

    useEffect(() => { setMounted(true); }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.5 }}
            className={`glass-tier-1 rounded-[28px] p-6 w-[260px] flex flex-col relative overflow-hidden ${className}`}
        >
            {/* Inner light */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 80%)', transform: 'translate(30%, -30%)' }} />

            {/* Bottom-right subtle colored glow */}
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(43,154,137,0.06) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

            {/* Header */}
            <div className="flex items-center justify-between mb-5 relative z-10">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.2em]"
                      style={{ color: '#64748B' }}>
                    التوازن الشامل
                </span>
                <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="text-[9px] font-bold px-2.5 py-1 rounded-full"
                    style={{ color: '#2B9A89', backgroundColor: 'rgba(43,154,137,0.08)' }}>
                    مثالي ✦
                </motion.span>
            </div>

            {/* SVG Activity Rings */}
            <div className="relative flex items-center justify-center h-[135px] z-10">
                <svg viewBox="0 0 100 100" className="w-[120px] h-[120px] -rotate-90">
                    {rings.map((ring, i) => (
                        <g key={ring.name}>
                            <circle cx="50" cy="50" r={ring.size} fill="none" stroke={ring.trackColor} strokeWidth="6" />
                            <motion.circle
                                cx="50" cy="50" r={ring.size}
                                fill="none" stroke={ring.color} strokeWidth="6" strokeLinecap="round"
                                strokeDasharray={ring.dash}
                                initial={{ strokeDashoffset: ring.dash }}
                                animate={{ strokeDashoffset: mounted ? ring.target : ring.dash }}
                                transition={{ duration: 2.5, ease: 'easeOut', delay: 0.8 + i * 0.35 }}
                            />
                            {/* Glow circle behind the stroke */}
                            <motion.circle
                                cx="50" cy="50" r={ring.size}
                                fill="none" stroke={ring.color} strokeWidth="10" strokeLinecap="round"
                                strokeDasharray={ring.dash}
                                initial={{ strokeDashoffset: ring.dash }}
                                animate={{ strokeDashoffset: mounted ? ring.target : ring.dash }}
                                transition={{ duration: 2.5, ease: 'easeOut', delay: 0.8 + i * 0.35 }}
                                style={{ opacity: 0.15, filter: 'blur(4px)' }}
                            />
                        </g>
                    ))}
                </svg>

                {/* Center score */}
                <div className="absolute flex flex-col items-center">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.8, type: 'spring' }}
                        className="text-[28px] font-black leading-none"
                        style={{ color: '#101822' }}
                    >
                        ٩٤
                    </motion.span>
                    <span className="text-[7px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#64748B' }}>
                        نقطة
                    </span>
                </div>
            </div>

            {/* Legend with trends */}
            <div className="mt-5 space-y-2.5 relative z-10">
                {rings.map((ring, i) => (
                    <motion.div
                        key={ring.name}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2 + i * 0.15 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ring.color }} />
                            <span className="text-[10px] font-semibold" style={{ color: '#64748B' }}>
                                {ring.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold" style={{ color: '#101822' }}>
                                {ring.pct}
                            </span>
                            <span className="flex items-center text-[8px] font-bold" style={{ color: '#2B9A89' }}>
                                <ArrowUpRight className="w-2.5 h-2.5" />
                                {ring.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom divider + timestamp */}
            <div className="mt-4 pt-3 relative z-10" style={{ borderTop: '1px solid rgba(16,24,34,0.04)' }}>
                <div className="flex items-center justify-between">
                    <span className="text-[8px] font-medium" style={{ color: '#c4cdd5' }}>آخر تحديث: ٢ دقيقة</span>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" style={{ color: '#2B9A89' }} />
                        <span className="text-[8px] font-bold" style={{ color: '#2B9A89' }}>تحسّن</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

import React, { useState, useEffect, useMemo } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { TrendingUp, ArrowUpRight, Zap } from 'lucide-react';

interface GlassStatWidgetProps {
    title: string;
    targetValue: number;
    subtitle: string;
    className?: string;
}

export default function GlassStatWidget({ title, targetValue, subtitle, className = '' }: GlassStatWidgetProps) {
    const [mounted, setMounted] = useState(false);
    const countMotion = useMotionValue(0);
    const springValue = useSpring(countMotion, { stiffness: 60, damping: 18 });
    const displayValue = useTransform(springValue, (v) => v.toFixed(1) + '%');

    // Sparkline data (simulated)
    const sparkline = useMemo(() => {
        const pts: number[] = [];
        let val = 85;
        for (let i = 0; i < 20; i++) {
            val += (Math.random() - 0.4) * 3;
            val = Math.max(80, Math.min(100, val));
            pts.push(val);
        }
        return pts;
    }, []);

    const sparklinePath = useMemo(() => {
        const min = Math.min(...sparkline);
        const max = Math.max(...sparkline);
        const range = max - min || 1;
        return sparkline.map((v, i) => {
            const x = (i / (sparkline.length - 1)) * 100;
            const y = 20 - ((v - min) / range) * 18;
            return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
    }, [sparkline]);

    useEffect(() => {
        setMounted(true);
        const t = setTimeout(() => { countMotion.set(targetValue); }, 700);
        return () => clearTimeout(t);
    }, [targetValue, countMotion]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
            className={`glass-tier-1 rounded-[24px] p-5 w-[230px] relative overflow-hidden ${className}`}
        >
            {/* Inner reflections */}
            <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(43,154,137,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(43,154,137,0.04) 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />

            {/* Header */}
            <div className="flex items-start justify-between mb-3 relative z-10">
                <div>
                    <span className="text-[7px] font-extrabold uppercase tracking-[0.3em] block"
                          style={{ color: '#2B9A89' }}>
                        {title}
                    </span>
                    {/* Status micro-badge */}
                    <div className="flex items-center gap-1 mt-1.5">
                        <Zap className="w-2.5 h-2.5" style={{ color: '#fbbf24' }} />
                        <span className="text-[8px] font-bold" style={{ color: '#94a3b8' }}>أداء عالي</span>
                    </div>
                </div>
                <motion.div
                    whileHover={{ rotate: 12 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(43,154,137,0.08)' }}
                >
                    <TrendingUp className="w-4 h-4" style={{ color: '#2B9A89' }} strokeWidth={2.5} />
                </motion.div>
            </div>

            {/* Big number */}
            <div className="relative z-10 mb-1 flex items-end gap-2">
                <motion.span className="text-[36px] font-black leading-none" style={{ color: '#101822' }}>
                    {displayValue}
                </motion.span>
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="flex items-center gap-0.5 mb-1.5"
                >
                    <ArrowUpRight className="w-3 h-3" style={{ color: '#2B9A89' }} />
                    <span className="text-[10px] font-bold" style={{ color: '#2B9A89' }}>+٠.٣</span>
                </motion.div>
            </div>

            {/* Subtitle */}
            <p className="text-[10px] font-medium relative z-10 mb-3" style={{ color: '#64748B' }}>
                {subtitle}
            </p>

            {/* Sparkline chart */}
            <div className="relative z-10 h-[22px] mb-3">
                <svg viewBox="0 0 100 22" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Area fill */}
                    <path d={`${sparklinePath} L100,22 L0,22 Z`} fill="rgba(43,154,137,0.06)" />
                    {/* Glow line */}
                    <path d={sparklinePath} fill="none" stroke="rgba(43,154,137,0.2)" strokeWidth="3"
                          strokeLinejoin="round" style={{ filter: 'blur(2px)' }} />
                    {/* Main line */}
                    <motion.path
                        d={sparklinePath}
                        fill="none" stroke="#2B9A89" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: mounted ? 1 : 0 }}
                        transition={{ duration: 2, ease: 'easeOut', delay: 1 }}
                    />
                    {/* End dot */}
                    <circle cx="100" cy={sparkline[sparkline.length - 1] ? 20 - ((sparkline[sparkline.length - 1] - Math.min(...sparkline)) / (Math.max(...sparkline) - Math.min(...sparkline) || 1)) * 18 : 10}
                            r="2.5" fill="#2B9A89" />
                </svg>
            </div>

            {/* Progress bar */}
            <div className="relative z-10">
                <div className="w-full h-[3px] rounded-full" style={{ backgroundColor: 'rgba(43,154,137,0.1)' }}>
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: mounted ? `${Math.min(targetValue, 100)}%` : '0%' }}
                        transition={{ duration: 2.5, ease: 'easeOut', delay: 0.8 }}
                        className="h-full rounded-full relative"
                        style={{ backgroundColor: '#2B9A89' }}
                    >
                        {/* Glow tip */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                             style={{ backgroundColor: '#2B9A89', boxShadow: '0 0 8px rgba(43,154,137,0.6)' }} />
                    </motion.div>
                </div>
            </div>

            {/* Footer meta */}
            <div className="mt-3 flex items-center justify-between relative z-10">
                <span className="text-[7px] font-medium" style={{ color: '#c4cdd5' }}>آخر ٧ أيام</span>
                <span className="text-[7px] font-bold" style={{ color: '#2B9A89' }}>+٢.١٪ تحسّن</span>
            </div>
        </motion.div>
    );
}

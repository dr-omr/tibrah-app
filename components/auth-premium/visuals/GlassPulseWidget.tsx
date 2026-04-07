import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, TrendingDown } from 'lucide-react';

export default function GlassPulseWidget({ className = '' }: { className?: string }) {
    const [pathData, setPathData] = useState('');
    const [bpm, setBpm] = useState(58);
    const [bpmHistory, setBpmHistory] = useState<number[]>([58]);
    const pointsRef = useRef<number[]>(Array(52).fill(15));
    const tickRef = useRef(0);

    // BPM zone classification
    const bpmZone = useMemo(() => {
        if (bpm < 50) return { label: 'منخفض جداً', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' };
        if (bpm < 60) return { label: 'ممتاز — رياضي', color: '#2B9A89', bg: 'rgba(43,154,137,0.08)' };
        if (bpm < 80) return { label: 'في المنطقة المثالية', color: '#2B9A89', bg: 'rgba(43,154,137,0.08)' };
        return { label: 'مرتفع قليلاً', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' };
    }, [bpm]);

    // Min/Max from history
    const bpmStats = useMemo(() => ({
        min: Math.min(...bpmHistory),
        max: Math.max(...bpmHistory),
        avg: Math.round(bpmHistory.reduce((a, b) => a + b, 0) / bpmHistory.length),
    }), [bpmHistory]);

    useEffect(() => {
        const interval = setInterval(() => {
            tickRef.current++;
            let newPts = [...pointsRef.current];
            newPts.shift();

            if (tickRef.current % 22 === 0) {
                newPts.push(14, 10, -2, 42, -8, 18, 15, 15, 15);
                const newBpm = Math.floor(56 + Math.random() * 8);
                setBpm(newBpm);
                setBpmHistory(prev => [...prev.slice(-19), newBpm]);
            } else {
                newPts.push(15 + (Math.random() * 1.4 - 0.7));
            }

            while (newPts.length > 52) newPts.shift();
            pointsRef.current = newPts;

            const path = newPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * 1.92).toFixed(1)},${p.toFixed(1)}`).join(' ');
            setPathData(path);
        }, 40);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 90, delay: 0.7 }}
            className={`glass-tier-1 rounded-[28px] p-5 w-[240px] relative overflow-hidden ${className}`}
        >
            {/* Inner glow */}
            <div className="absolute top-0 left-0 w-20 h-20 rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 80%)', transform: 'translate(-30%, -30%)' }} />

            {/* Bottom ambient */}
            <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.04) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                    className="w-9 h-9 rounded-2xl flex items-center justify-center relative"
                    style={{ backgroundColor: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)' }}
                >
                    <Activity className="w-4 h-4" style={{ color: '#f43f5e' }} strokeWidth={2.5} />
                    {/* Ripple ring */}
                    <motion.div
                        animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 rounded-2xl"
                        style={{ border: '1px solid rgba(244,63,94,0.2)' }}
                    />
                </motion.div>
                <div>
                    <span className="block text-[8px] font-extrabold uppercase tracking-[0.2em]" style={{ color: '#64748B' }}>
                        نبض القلب أثناء الراحة
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                        <motion.span
                            key={bpm}
                            initial={{ opacity: 0.4, y: -4, scale: 1.1 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="text-[24px] font-black leading-none"
                            style={{ color: '#101822' }}
                        >
                            {bpm}
                        </motion.span>
                        <span className="text-[9px] font-bold" style={{ color: '#64748B' }}>نبضة/د</span>
                        {/* Mini heart icon */}
                        <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                        >
                            <Heart className="w-3 h-3" style={{ color: '#f43f5e' }} fill="#f43f5e" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Live ECG with triple-layer rendering */}
            <div className="w-full h-[48px] relative z-10">
                <svg viewBox="0 -18 100 58" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Shadow glow layer */}
                    <path d={pathData} fill="none" stroke="rgba(244,63,94,0.12)" strokeWidth="8"
                          strokeLinejoin="round" strokeLinecap="round" style={{ filter: 'blur(5px)' }} />
                    {/* Soft glow layer */}
                    <path d={pathData} fill="none" stroke="rgba(244,63,94,0.2)" strokeWidth="4"
                          strokeLinejoin="round" strokeLinecap="round" style={{ filter: 'blur(2px)' }} />
                    {/* Crisp line */}
                    <path d={pathData} fill="none" stroke="#f43f5e" strokeWidth="1.6"
                          strokeLinejoin="round" strokeLinecap="round" />
                </svg>
                {/* Fade-out edge */}
                <div className="absolute inset-0 pointer-events-none"
                     style={{ background: 'linear-gradient(to left, rgba(251,253,253,0.9) 0%, transparent 20%)' }} />
                <div className="absolute inset-0 pointer-events-none"
                     style={{ background: 'linear-gradient(to right, rgba(251,253,253,0.5) 0%, transparent 10%)' }} />
            </div>

            {/* BPM Zone Badge */}
            <motion.div
                key={bpmZone.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 mt-3 relative z-10"
            >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: bpmZone.color }} />
                <span className="text-[8px] font-bold tracking-wider" style={{ color: bpmZone.color }}>
                    {bpmZone.label}
                </span>
            </motion.div>

            {/* Stats footer */}
            <div className="mt-3 pt-3 relative z-10 flex items-center justify-between"
                 style={{ borderTop: '1px solid rgba(16,24,34,0.04)' }}>
                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-bold uppercase tracking-widest" style={{ color: '#c4cdd5' }}>أقل</span>
                        <span className="text-[11px] font-black" style={{ color: '#101822' }}>{bpmStats.min}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[7px] font-bold uppercase tracking-widest" style={{ color: '#c4cdd5' }}>معدّل</span>
                        <span className="text-[11px] font-black" style={{ color: '#101822' }}>{bpmStats.avg}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[7px] font-bold uppercase tracking-widest" style={{ color: '#c4cdd5' }}>أعلى</span>
                        <span className="text-[11px] font-black" style={{ color: '#101822' }}>{bpmStats.max}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" style={{ color: '#2B9A89' }} />
                    <span className="text-[7px] font-bold" style={{ color: '#2B9A89' }}>مستقر</span>
                </div>
            </div>
        </motion.div>
    );
}

// components/health-engine/ui/SeveritySlider.tsx
// THIE v2 — Liquid chromatic severity meter

'use client';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';

interface Props { value: number; onChange: (v: number) => void; }

const SEGMENTS = [
    { range: [1, 3], label: 'خفيف',  emoji: '🟢', color: '#10b981', glow: 'rgba(16,185,129,0.4)' },
    { range: [4, 6], label: 'متوسط', emoji: '🟡', color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
    { range: [7, 8], label: 'شديد',  emoji: '🟠', color: '#f97316', glow: 'rgba(249,115,22,0.4)' },
    { range: [9, 10], label: 'حرج',  emoji: '🔴', color: '#ef4444', glow: 'rgba(239,68,68,0.5)' },
];

function getSegment(v: number) {
    return SEGMENTS.find(s => v >= s.range[0] && v <= s.range[1]) ?? SEGMENTS[0];
}

export function SeveritySlider({ value, onChange }: Props) {
    const seg = getSegment(value);

    return (
        <div className="space-y-5">
            {/* Bars */}
            <div className="flex gap-1.5 items-end">
                {Array.from({ length: 10 }, (_, i) => {
                    const n = i + 1;
                    const s = getSegment(n);
                    const isActive = n <= value;
                    const isCurrent = n === value;

                    return (
                        <motion.button
                            key={n}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => { haptic.selection(); onChange(n); }}
                            className="flex-1 rounded-lg cursor-pointer relative"
                            style={{
                                height: 24 + n * 3.5,
                                background: isActive
                                    ? `linear-gradient(180deg, ${s.color}, ${s.color}bb)`
                                    : 'rgba(255,255,255,0.05)',
                                boxShadow: isCurrent
                                    ? `0 0 16px ${s.glow}, 0 0 4px ${s.color}`
                                    : 'none',
                                transition: 'all 0.15s',
                            }}>
                            {/* Top cap glow */}
                            {isCurrent && (
                                <motion.div
                                    layoutId="severity-cap"
                                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                                    style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Label */}
            <div className="flex items-center">
                <span className="text-[9.5px] font-bold text-slate-700 flex-1">أدنى</span>
                <motion.div
                    key={value}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl"
                    style={{
                        background: `${seg.color}12`,
                        border: `1px solid ${seg.color}35`,
                        boxShadow: `0 0 20px ${seg.glow}`,
                    }}>
                    <span className="text-[18px]">{seg.emoji}</span>
                    <span className="text-[18px] font-black" style={{ color: seg.color }}>{value}</span>
                    <span className="text-[10px] font-black" style={{ color: seg.color }}>{seg.label}</span>
                </motion.div>
                <span className="text-[9.5px] font-bold text-slate-700 flex-1 text-left">أشد</span>
            </div>
        </div>
    );
}

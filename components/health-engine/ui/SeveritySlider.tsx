// components/health-engine/ui/SeveritySlider.tsx
// THIE v4 — M3 Segmented indicator
// Physical, tactile, like Google's Wellbeing / Calm apps

'use client';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';

interface Props { value: number; onChange: (v: number) => void; }

const SEGS = [
    { r: [1, 3],  label: 'خفيف',  emoji: '🟢', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    { r: [4, 6],  label: 'متوسط', emoji: '🟡', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
    { r: [7, 8],  label: 'شديد',  emoji: '🟠', color: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
    { r: [9, 10], label: 'حرج',   emoji: '🔴', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
];
const getSeg = (v: number) => SEGS.find(s => v >= s.r[0] && v <= s.r[1]) ?? SEGS[0];

export function SeveritySlider({ value, onChange }: Props) {
    const seg = getSeg(value);

    return (
        <div className="space-y-5">
            {/*
             * Vertical bar chart — each bar is a tap target
             * Rising heights create visual severity cue
             * Selected bar has glow cap (M3 "thumb" equivalent)
             */}
            <div className="flex gap-[5px] items-end" style={{ height: 64 }}>
                {Array.from({ length: 10 }, (_, i) => {
                    const n   = i + 1;
                    const s   = getSeg(n);
                    const act = n <= value;
                    const cur = n === value;
                    return (
                        <motion.button
                            key={n}
                            whileTap={{ scale: 0.78, y: -2 }}
                            transition={{ type: 'spring', stiffness: 600, damping: 28 }}
                            onClick={() => { haptic.selection(); onChange(n); }}
                            className="flex-1 rounded-[6px] relative cursor-pointer"
                            style={{
                                height: 18 + n * 4,
                                background: act
                                    ? `linear-gradient(180deg, ${s.color}, ${s.color}99)`
                                    : 'rgba(0,0,0,0.07)',
                                boxShadow: cur
                                    ? `0 0 14px ${s.color}40, 0 2px 6px ${s.color}30`
                                    : 'none',
                                transition: 'background 160ms, box-shadow 160ms',
                            }}>
                            {/* M3 Thumb indicator — glowing dot on active bar */}
                            {cur && (
                                <motion.div
                                    layoutId="sev-thumb"
                                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[7px] h-[7px] rounded-full"
                                    style={{
                                        background: s.color,
                                        boxShadow: `0 0 8px ${s.color}80`,
                                    }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* M3 Value indicator chip */}
            <div className="flex items-center">
                <span className="m3-label-sm text-slate-400 flex-1" style={{ textTransform: 'none', fontSize: 10 }}>أدنى</span>
                <motion.div
                    key={value}
                    initial={{ scale: 1.12, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-[20px]"
                    style={{
                        background: seg.bg,
                        border: `1.5px solid ${seg.border}`,
                        boxShadow: `0 2px 12px ${seg.color}15`,
                    }}>
                    <span className="text-[18px] leading-none">{seg.emoji}</span>
                    <span className="text-[20px] font-black leading-none" style={{ color: seg.color }}>{value}</span>
                    <span className="m3-label-lg" style={{ color: seg.color, textTransform: 'none' }}>{seg.label}</span>
                </motion.div>
                <span className="m3-label-sm text-slate-400 flex-1 text-left" style={{ textTransform: 'none', fontSize: 10 }}>أشد</span>
            </div>
        </div>
    );
}

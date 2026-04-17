// components/health-engine/ui/SeveritySlider.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH v8 — Liquid Glass Water Severity Slider
// أشرطة مائية زجاجية — بدون أي لون أسود
// ════════════════════════════════════════════════════════════════
'use client';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';

interface Props { value: number; onChange: (v: number) => void; }

const SEGS = [
    { r: [1, 3],  label: 'خفيف',  emoji: '🟢', color: '#059669', glow: 'rgba(5,150,105,0.32)',  tint: 'rgba(5,150,105,0.12)',  border: 'rgba(167,243,208,0.6)' },
    { r: [4, 6],  label: 'متوسط', emoji: '🟡', color: '#D97706', glow: 'rgba(217,119,6,0.28)',  tint: 'rgba(217,119,6,0.10)',  border: 'rgba(253,230,138,0.6)' },
    { r: [7, 8],  label: 'شديد',  emoji: '🟠', color: '#EA580C', glow: 'rgba(234,88,12,0.28)',  tint: 'rgba(234,88,12,0.10)',  border: 'rgba(254,215,170,0.6)' },
    { r: [9, 10], label: 'حرج',   emoji: '🔴', color: '#DC2626', glow: 'rgba(220,38,38,0.28)',  tint: 'rgba(220,38,38,0.10)',  border: 'rgba(254,202,202,0.6)' },
];
const getSeg = (v: number) => SEGS.find(s => v >= s.r[0] && v <= s.r[1]) ?? SEGS[0];

export function SeveritySlider({ value, onChange }: Props) {
    const seg = getSeg(value);

    return (
        <div className="space-y-4">
            {/* Water bar chart */}
            <div className="flex gap-[5px] items-end" style={{ height: 68 }}>
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
                            className="flex-1 relative cursor-pointer overflow-hidden"
                            style={{
                                height: 20 + n * 4.2,
                                borderRadius: 7,
                                // Liquid glass water bars
                                background: act
                                    ? `linear-gradient(180deg, rgba(255,255,255,0.65) 0%, ${s.color}CC 40%, ${s.color} 100%)`
                                    : 'rgba(255,255,255,0.45)',
                                border: act
                                    ? `1px solid rgba(255,255,255,0.7)`
                                    : '1px solid rgba(255,255,255,0.55)',
                                backdropFilter: 'blur(8px)',
                                boxShadow: cur
                                    ? `0 0 16px ${s.glow}, 0 2px 0 rgba(255,255,255,0.8) inset`
                                    : act
                                    ? `0 2px 6px ${s.color}22`
                                    : 'none',
                                transition: 'background 160ms, box-shadow 160ms',
                            }}>
                            {/* Glass highlight on each bar */}
                            {act && (
                                <div className="absolute top-0 left-0 right-0 h-[40%]"
                                    style={{
                                        background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)',
                                        borderRadius: '5px 5px 0 0',
                                    }} />
                            )}
                            {/* Active thumb — water droplet glow */}
                            {cur && (
                                <motion.div
                                    layoutId="sev-thumb-water"
                                    className="absolute -top-2 left-1/2 -translate-x-1/2"
                                    style={{
                                        width: 8, height: 8,
                                        borderRadius: '50%',
                                        background: s.color,
                                        boxShadow: `0 0 10px ${s.glow}, 0 0 20px ${s.glow}`,
                                        border: '1.5px solid rgba(255,255,255,0.9)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Value glass chip */}
            <div className="flex items-center">
                <span style={{ fontSize: 10, color: '#7DD3FC', fontWeight: 700, flex: 1 }}>أدنى</span>

                <motion.div
                    key={value}
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                    className="flex items-center gap-2 px-4 py-2 relative overflow-hidden"
                    style={{
                        borderRadius: 20,
                        background: `linear-gradient(145deg, rgba(255,255,255,0.88) 0%, ${seg.tint} 100%)`,
                        border: `1.5px solid ${seg.border}`,
                        backdropFilter: 'blur(20px)',
                        boxShadow: `0 4px 16px ${seg.glow}, 0 2px 0 rgba(255,255,255,0.95) inset`,
                    }}>
                    {/* Caustic */}
                    <div className="absolute top-0 left-0 w-[55%] h-[55%]"
                        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.45) 0%, transparent 70%)', borderRadius: 18 }} />
                    <span style={{ fontSize: 18, lineHeight: 1, position: 'relative', zIndex: 1 }}>{seg.emoji}</span>
                    <span style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, color: seg.color, position: 'relative', zIndex: 1 }}>{value}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: seg.color, position: 'relative', zIndex: 1 }}>{seg.label}</span>
                </motion.div>

                <span style={{ fontSize: 10, color: '#7DD3FC', fontWeight: 700, flex: 1, textAlign: 'left' }}>أشد</span>
            </div>
        </div>
    );
}

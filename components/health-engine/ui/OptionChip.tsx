// components/health-engine/ui/OptionChip.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH v8 — Liquid Glass Water Option Chip
// مائي زجاجي — بدون أي لون أسود
// ════════════════════════════════════════════════════════════════
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';

interface Props {
    label: string;
    selected: boolean;
    onToggle: () => void;
    color?: string;
    emoji?: string;
    size?: 'sm' | 'md';
}

export function OptionChip({ label, selected, onToggle, color = '#0891B2', emoji, size = 'md' }: Props) {
    const h  = size === 'sm' ? 30 : 36;
    const px = size === 'sm' ? 10 : 14;
    const fs = size === 'sm' ? 11 : 12.5;

    return (
        <motion.button
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={() => { haptic.selection(); onToggle(); }}
            className="flex items-center gap-1.5 rounded-full relative overflow-hidden"
            style={{
                height: h,
                paddingLeft: px,
                paddingRight: px,
                fontSize: fs,
                fontWeight: 700,
                letterSpacing: '0.005em',
                background: selected
                    ? `linear-gradient(145deg, rgba(255,255,255,0.90) 0%, ${color}14 100%)`
                    : 'rgba(255,255,255,0.58)',
                border: `1.5px solid ${selected ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.82)'}`,
                backdropFilter: 'blur(18px)',
                color: selected ? color : '#0369A1',
                boxShadow: selected
                    ? `0 4px 16px ${color}18, inset 0 1.5px 0 rgba(255,255,255,0.95)`
                    : '0 2px 8px rgba(8,145,178,0.06), inset 0 1.5px 0 rgba(255,255,255,0.90)',
                transition: 'all 200ms cubic-bezier(0.05,0.7,0.1,1)',
            }}>

            {/* Glass sheen when selected */}
            {selected && (
                <div className="absolute inset-x-0 top-0 pointer-events-none"
                    style={{
                        height: '50%',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)',
                        borderRadius: '99px 99px 0 0',
                    }} />
            )}

            {/* Leading check icon */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 15, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        className="overflow-hidden flex-shrink-0"
                        style={{ position: 'relative', zIndex: 1 }}>
                        <Check style={{ width: 13, height: 13, color }} strokeWidth={2.8} />
                    </motion.div>
                )}
            </AnimatePresence>

            {emoji && <span style={{ fontSize: 14, lineHeight: 1, position: 'relative', zIndex: 1 }}>{emoji}</span>}
            <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
        </motion.button>
    );
}

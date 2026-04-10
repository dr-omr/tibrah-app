// components/health-engine/ui/OptionChip.tsx
// THIE v4 — M3 Filter Chip
// Reference: Material Design 3 Chips

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

export function OptionChip({ label, selected, onToggle, color = '#0d9488', emoji, size = 'md' }: Props) {
    /*
     * M3 Filter Chip spec:
     * - Height: 32dp
     * - Shape: 8dp rounded (Stadium = full radius for text-only)
     * - Selected: primary tonal background + check icon
     * - State layer: 8% on hover, 12% on press
     */
    return (
        <motion.button
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={() => { haptic.selection(); onToggle(); }}
            className="flex items-center gap-1.5 rounded-full m3-state"
            style={{
                height: size === 'sm' ? 28 : 32,
                paddingLeft: size === 'sm' ? 10 : 12,
                paddingRight: size === 'sm' ? 10 : 12,
                fontSize: size === 'sm' ? 11 : 12,
                fontWeight: 600,
                letterSpacing: '0.01em',
                backgroundColor: selected ? color + '18' : '#ffffff',
                border: `1.5px solid ${selected ? color : 'rgba(0,0,0,0.12)'}`,
                color: selected ? color : '#475569',
                boxShadow: selected
                    ? `0 0 0 3px ${color}0e`
                    : '0 1px 2px rgba(0,0,0,0.07)',
                transition: 'all 180ms cubic-bezier(0.05,0.7,0.1,1)',
            }}>
            {/* Leading check icon — M3 spec: appears when selected */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 16, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden flex-shrink-0">
                        <Check className="w-3.5 h-3.5" style={{ color }} strokeWidth={2.5} />
                    </motion.div>
                )}
            </AnimatePresence>

            {emoji && <span className="text-sm leading-none">{emoji}</span>}
            <span>{label}</span>
        </motion.button>
    );
}

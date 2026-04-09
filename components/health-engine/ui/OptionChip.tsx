// components/health-engine/ui/OptionChip.tsx
// THIE — Premium dark-mode selectable chip

'use client';
import { motion } from 'framer-motion';
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
    return (
        <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { haptic.selection(); onToggle(); }}
            className="flex items-center gap-1.5 rounded-2xl font-bold transition-all duration-150"
            style={{
                padding: size === 'sm' ? '6px 12px' : '8px 14px',
                fontSize: size === 'sm' ? 11 : 12.5,
                backgroundColor: selected ? `${color}22` : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${selected ? color : 'rgba(255,255,255,0.08)'}`,
                color: selected ? color : 'rgba(255,255,255,0.55)',
                boxShadow: selected ? `0 0 16px ${color}25` : 'none',
            }}>
            {emoji && <span className="text-[14px] leading-none">{emoji}</span>}
            <span>{label}</span>
            {selected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color }}>
                    <Check className="w-2 h-2 text-white" />
                </motion.div>
            )}
        </motion.button>
    );
}

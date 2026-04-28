// components/common/onboarding/OnboardingParts.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Onboarding Sub-Components: FloatingParticles, ProgressDots,
// SelectionGrid
// ════════════════════════════════════════════════════════════════════

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import type { SelectableItem } from './onboarding-data';

/* ── Floating Particles ───────────────────────────── */
export function FloatingParticles({ color }: { color: string }) {
    const particles = useMemo(() =>
        Array.from({ length: 12 }, () => ({
            width: Math.random() * 8 + 4,
            left: Math.random() * 100,
            top: Math.random() * 100,
            xDrift: Math.random() * 20 - 10,
            duration: Math.random() * 3 + 3,
            delay: Math.random() * 2,
        })), []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p, i) => (
                <motion.div key={i} className="absolute rounded-full"
                    style={{ width: p.width, height: p.width, backgroundColor: `${color}30`, left: `${p.left}%`, top: `${p.top}%` }}
                    animate={{ y: [0, -30, 0], x: [0, p.xDrift, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.5, 1] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
}

/* ── Progress Dots ────────────────────────────────── */
export function ProgressDots({ total, current }: { total: number; current: number }) {
    return (
        <div className="flex items-center gap-2 justify-center">
            {Array.from({ length: total }).map((_, i) => (
                <motion.div key={i} className="rounded-full"
                    animate={{
                        width: i === current ? 24 : 8, height: 8,
                        backgroundColor: i === current ? '#2D9B83' : i < current ? '#2D9B8380' : '#E2E8F0',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
            ))}
        </div>
    );
}

/* ── Selection Grid (reusable for interests + goals) ── */
export function SelectionGrid({
    items, selectedIds, onToggle, accentColor, countLabel, particleColor,
}: {
    items: SelectableItem[];
    selectedIds: string[];
    onToggle: (id: string) => void;
    accentColor: string;
    countLabel: string;
    particleColor: string;
}) {
    return (
        <>
            <motion.div className="grid grid-cols-2 gap-3 w-full max-w-sm overflow-y-auto flex-1 pb-4"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                {items.map((item, idx) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <motion.button key={item.id}
                            className={`relative p-4 rounded-2xl border-2 transition-all text-right ${isSelected
                                ? `border-${accentColor}-500 bg-${accentColor}-50 dark:bg-${accentColor}-900/20`
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
                            }`}
                            style={isSelected ? { borderColor: item.color, backgroundColor: `${item.color}10` } : {}}
                            onClick={() => onToggle(item.id)}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + idx * 0.06 }}
                            whileTap={{ scale: 0.95 }}>
                            {isSelected && (
                                <motion.div className="absolute top-2 left-2"
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500 }}>
                                    <CheckCircle2 className="w-5 h-5" style={{ color: item.color }} />
                                </motion.div>
                            )}
                            <div className="text-2xl mb-2">{item.emoji}</div>
                            <div className="font-semibold text-sm text-slate-800 dark:text-white">{item.label}</div>
                        </motion.button>
                    );
                })}
            </motion.div>
            {selectedIds.length > 0 && (
                <motion.div className="text-center py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <span className="text-sm font-medium" style={{ color: particleColor }}>
                        {selectedIds.length} {countLabel} ✓
                    </span>
                </motion.div>
            )}
        </>
    );
}

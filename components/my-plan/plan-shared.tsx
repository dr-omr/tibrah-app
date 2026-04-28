// components/my-plan/plan-shared.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — My Plan Shared UI Components
// DeepGlassCard, WaterParticles, DomainScoreBar
// ════════════════════════════════════════════════════════════════════

import React from 'react';
import { motion } from 'framer-motion';
import { GLASS, TXT } from './plan-tokens';

/* ══════════════════════════════════════════════════════════════════
   COMPONENT: DeepGlassCard — البطاقة الزجاجية ذات العمق الفيزيائي
   ══════════════════════════════════════════════════════════════════ */
export function DeepGlassCard({
    children, className = '', style = {},
    tint = GLASS.base, noSheen = false,
}: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    tint?: string;
    noSheen?: boolean;
}) {
    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{
                background: tint,
                border: `1px solid ${GLASS.border}`,
                backdropFilter: 'blur(24px) saturate(160%)',
                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                boxShadow: GLASS.shadow,
                borderRadius: 24,
                ...style,
            }}
        >
            {/* الوميض العلوي — الضوء يكسر على حافة الزجاج */}
            {!noSheen && (
                <div
                    className="absolute inset-x-0 top-0 pointer-events-none"
                    style={{ height: '52%', background: GLASS.sheen, borderRadius: '24px 24px 0 0' }}
                />
            )}
            {/* نقطة الانعكاس الجانبية */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: GLASS.spec, borderRadius: 24 }}
            />
            {/* المحتوى */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT: WaterParticles — جزيئات المياه المتحركة
   ══════════════════════════════════════════════════════════════════ */
export function WaterParticles({ color }: { color: string }) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: 'inherit' }}>
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: 3 + i * 1.5,
                        height: 3 + i * 1.5,
                        background: color,
                        opacity: 0.4 - i * 0.06,
                        left: `${15 + i * 18}%`,
                        top: `${25 + (i % 2) * 35}%`,
                        filter: 'blur(1px)',
                    }}
                    animate={{
                        y: [-4, 4, -4],
                        opacity: [0.3 - i * 0.04, 0.5 - i * 0.06, 0.3 - i * 0.04],
                    }}
                    transition={{
                        duration: 2.5 + i * 0.7,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.4,
                    }}
                />
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT: DomainScoreBar — شريط النقاط بعمق فيزيائي
   ══════════════════════════════════════════════════════════════════ */
export function DomainScoreBar({
    label, emoji, score, color, delay = 0, isPrimary = false,
}: {
    label: string; emoji: string; score: number;
    color: string; delay?: number; isPrimary?: boolean;
}) {
    return (
        <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, type: 'spring', stiffness: 260, damping: 26 }}
        >
            <div className="flex items-center gap-1.5 w-[35%]">
                <span style={{ fontSize: isPrimary ? 16 : 13 }}>{emoji}</span>
                <span style={{
                    fontSize: isPrimary ? 12 : 10.5,
                    fontWeight: isPrimary ? 800 : 600,
                    color: isPrimary ? TXT.primary : TXT.secondary,
                    letterSpacing: '-0.01em',
                }}>{label}</span>
            </div>
            {/* Track — منخفض كالقناة */}
            <div
                className="flex-1 relative overflow-hidden"
                style={{
                    height: isPrimary ? 8 : 5,
                    borderRadius: 99,
                    background: 'rgba(255,255,255,0.07)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }}
            >
                <motion.div
                    style={{
                        height: '100%',
                        borderRadius: 99,
                        background: isPrimary
                            ? `linear-gradient(90deg, ${color}88, ${color})`
                            : `${color}60`,
                        boxShadow: isPrimary ? `0 0 10px ${color}60, 0 0 4px ${color}40` : 'none',
                    }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.2, ease: [0.05, 0.7, 0.1, 1], delay: delay + 0.2 }}
                />
            </div>
            <span style={{
                fontSize: isPrimary ? 14 : 11,
                fontWeight: isPrimary ? 900 : 600,
                color: isPrimary ? color : TXT.muted,
                width: 34,
                textAlign: 'right',
                letterSpacing: '-0.02em',
            }}>{score}%</span>
        </motion.div>
    );
}

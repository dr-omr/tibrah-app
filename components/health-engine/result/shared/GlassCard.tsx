// components/health-engine/result/shared/GlassCard.tsx
// ════════════════════════════════════════════════════════════════
// Shared water-glass UI primitives extracted from StepResult.tsx.
// All result subcomponents import from here.
// ════════════════════════════════════════════════════════════════
'use client';
import { useEffect, useState } from 'react';
import { motion, animate, useMotionValue } from 'framer-motion';
import { W } from './design-tokens';

/* ── Animated counter ─────────────────────────────────── */
export function AnimatedNum({
    value,
    delay = 0,
    suffix = '',
}: {
    value: number;
    delay?: number;
    suffix?: string;
}) {
    const mv = useMotionValue(0);
    const [disp, setDisp] = useState(0);
    useEffect(() => {
        const c = animate(mv, value, {
            duration: 1.1,
            ease: 'easeOut',
            delay,
            onUpdate: (v) => setDisp(Math.round(v)),
        });
        return c.stop;
    }, [value, delay, mv]);
    return <>{disp}{suffix}</>;
}

/* ── Water ambient micro-particles ────────────────────── */
export function WaterAmbient({ domainColor }: { domainColor: string }) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: 'inherit' }}>
            {/* caustic glow spot */}
            <div style={{
                position: 'absolute', top: -20, right: -30,
                width: 180, height: 120,
                borderRadius: '50%',
                background: `radial-gradient(ellipse, ${domainColor}28 0%, transparent 70%)`,
                filter: 'blur(30px)',
            }} />
            {/* floating micro-bubbles */}
            {[...Array(4)].map((_, i) => (
                <motion.div key={i}
                    className="absolute rounded-full"
                    style={{
                        width: 3 + i,
                        height: 3 + i,
                        background: domainColor,
                        opacity: 0.35 - i * 0.06,
                        left: `${18 + i * 20}%`,
                        top: `${30 + (i % 2) * 28}%`,
                        filter: 'blur(0.5px)',
                    }}
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ duration: 2.5 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                />
            ))}
        </div>
    );
}

/* ── Glass card with sheen + spec layers ──────────────── */
export function GlassCard({
    children,
    className = '',
    style = {},
    delay = 0,
    on,
}: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    delay?: number;
    on: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={on ? { opacity: 1, y: 0 } : {}}
            transition={{ delay, type: 'spring', stiffness: 240, damping: 26 }}
            className={`relative overflow-hidden ${className}`}
            style={{
                borderRadius: 26,
                background: W.glass,
                border: `1px solid ${W.glassBorder}`,
                backdropFilter: 'blur(24px) saturate(160%)',
                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                boxShadow: W.glassShadow,
                ...style,
            }}>
            {/* Upper sheen */}
            <div className="absolute inset-x-0 top-0 pointer-events-none"
                style={{ height: '50%', background: W.sheen, borderRadius: '26px 26px 0 0' }} />
            {/* Specular dot */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: W.spec, borderRadius: 26 }} />
            {children}
        </motion.div>
    );
}

/* ── Score ring (SVG animated arc) ───────────────────── */
export function WaterScoreRing({ score, color }: { score: number; color: string }) {
    const r = 40;
    const circ = 2 * Math.PI * r;
    return (
        <div className="relative flex-shrink-0" style={{ width: 96, height: 96 }}>
            {/* Outer glass panel */}
            <div className="absolute inset-0 rounded-full"
                style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: `0 8px 28px rgba(0,0,0,0.4), 0 0 20px ${color}22, inset 0 1px 0 rgba(255,255,255,0.20)`,
                }} />
            <svg width="96" height="96" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <defs>
                    <linearGradient id="ring-wg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                        <stop offset="100%" stopColor={W.tealLight} stopOpacity="0.7" />
                    </linearGradient>
                    <filter id="ring-glow-w">
                        <feGaussianBlur stdDeviation="2" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                <circle cx="48" cy="48" r={r} fill="none" stroke={`${color}18`} strokeWidth="5" />
                <motion.circle cx="48" cy="48" r={r} fill="none"
                    stroke="url(#ring-wg)" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ * (1 - score / 10) }}
                    transition={{ duration: 1.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.35 }}
                    filter="url(#ring-glow-w)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span style={{ fontSize: 22, fontWeight: 900, color: W.textPrimary, lineHeight: 1, textShadow: `0 0 20px ${color}60` }}>
                    <AnimatedNum value={score} delay={0.6} />
                </span>
                <span style={{ fontSize: 8, color: W.textMuted, fontWeight: 800 }}>/10</span>
            </div>
        </div>
    );
}

/* ── Accent icon box ──────────────────────────────────── */
export function AccentIconBox({
    children,
    color,
    size = 36,
}: {
    children: React.ReactNode;
    color: string;
    size?: number;
}) {
    return (
        <div
            className="flex-shrink-0 relative overflow-hidden flex items-center justify-center"
            style={{
                width: size,
                height: size,
                borderRadius: Math.round(size * 0.33),
                background: `${color}12`,
                border: `1px solid ${color}22`,
            }}>
            <div className="absolute top-0 left-0 right-0 h-[45%]"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </div>
    );
}

/* ── Section label ────────────────────────────────────── */
export function SectionLabel({ text, color }: { text: string; color: string }) {
    return (
        <p style={{
            fontSize: 9,
            fontWeight: 900,
            color,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 4,
        }}>
            {text}
        </p>
    );
}

/* ── Horizontal rule with color bleed ─────────────────── */
export function ColorDivider({ color }: { color: string }) {
    return (
        <div className="h-px my-4" style={{
            background: `linear-gradient(90deg, transparent, ${color}30, transparent)`,
        }} />
    );
}

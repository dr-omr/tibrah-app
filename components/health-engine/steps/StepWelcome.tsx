// components/health-engine/steps/StepWelcome.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH v8 — Liquid Glass Water Design System
// تصميم مائي زجاجي عميق — بدون أي لون أسود
// ════════════════════════════════════════════════════════════════════
'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, Sparkles, Shield } from 'lucide-react';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

/* ══════════════════════════════════════════════════════ */
/* LIGHT WATER GLASS — Premium Medical              */
/* ══════════════════════════════════════════════════════ */
const W = {
    pageBg:    'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)',
    pageBg2:   '#DCF5FC',
    glass:     'rgba(255,255,255,0.55)',
    glassBg:   'rgba(255,255,255,0.38)',
    glassBorder: 'rgba(255,255,255,0.82)',
    teal:      '#0891B2',
    tealLight: '#22D3EE',
    tealDeep:  '#0E7490',
    cyan:      '#38BDF8',
    seafoam:   '#34D399',
    lavender:  '#818CF8',
    amber:     '#FBBF24',
    textPrimary: '#0C4A6E',
    textSub:     '#0369A1',
    textMuted:   '#7DD3FC',
    textFaint:   '#BAE6FD',
};

/* ══════════════════════════════════════════════════════ */
/* ECG LINE — aqua water pulse                           */
/* ══════════════════════════════════════════════════════ */
function WaterPulseLine() {
    return (
        <svg viewBox="0 0 320 48" style={{ width: '100%', maxWidth: 280, height: 48 }} aria-hidden>
            <defs>
                <linearGradient id="wp-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor={W.teal}    stopOpacity="0" />
                    <stop offset="30%"  stopColor={W.teal} />
                    <stop offset="65%"  stopColor={W.cyan} />
                    <stop offset="100%" stopColor={W.lavender} stopOpacity="0" />
                </linearGradient>
                <filter id="wp-glow">
                    <feGaussianBlur stdDeviation="2" result="b" />
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>
            <motion.polyline
                points="0,24 40,24 56,6 66,42 76,6 86,42 96,24 140,24 155,17 170,24 185,31 200,24 320,24"
                fill="none" stroke="url(#wp-grad)" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                filter="url(#wp-glow)"
                pathLength={1}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.6 }}
            />
            {/* Water ripple dots along the line */}
            {[1.0, 1.5, 2.0].map((delay, i) => (
                <motion.circle key={i} cx={150 + i * 20} cy="24" r="2.5"
                    fill={W.tealLight} fillOpacity="0.7"
                    animate={{ r: [2.5, 5, 2.5], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay, ease: 'easeInOut' }}
                />
            ))}
        </svg>
    );
}

/* ══════════════════════════════════════════════════════ */
/* WATER ORB — liquid glass hero                          */
/* ══════════════════════════════════════════════════════ */
function WaterGlassOrb({ ready }: { ready: boolean }) {
    return (
        <div className="relative" style={{ width: 130, height: 130 }}>
            {/* Outer water rings */}
            {[1.65, 1.38, 1.14].map((scale, i) => (
                <motion.div key={i}
                    className="absolute inset-0 rounded-[44px]"
                    style={{
                        background: `rgba(${i === 0 ? '34,211,238' : i === 1 ? '56,189,248' : '129,140,248'},0.08)`,
                        border: `1px solid rgba(${i === 0 ? '34,211,238' : i === 1 ? '56,189,248' : '129,140,248'},0.22)`,
                        transform: `scale(${scale})`,
                        backdropFilter: 'blur(2px)',
                    }}
                    animate={{ scale: [scale, scale * 1.04, scale] }}
                    transition={{ duration: 3 + i * 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                />
            ))}

            {/* Core water orb */}
            <motion.div
                onClick={() => haptic.impact()}
                whileTap={{ scale: 0.93 }}
                className="absolute inset-0 rounded-[40px] flex items-center justify-center cursor-pointer overflow-hidden"
                style={{
                    background: `linear-gradient(145deg,
                        rgba(255,255,255,0.92) 0%,
                        rgba(186,230,253,0.85) 30%,
                        rgba(103,232,249,0.70) 65%,
                        rgba(34,211,238,0.80) 100%
                    )`,
                    boxShadow: `
                        0 16px 48px rgba(8,145,178,0.28),
                        0 4px 16px rgba(34,211,238,0.22),
                        0 2px 0 rgba(255,255,255,0.95) inset,
                        0 -1px 0 rgba(8,145,178,0.12) inset
                    `,
                    border: '1.5px solid rgba(255,255,255,0.88)',
                }}>
                {/* Inner glass highlight */}
                <div className="absolute top-0 left-0 right-0 h-[55%] rounded-t-[38px]"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, transparent 100%)' }} />
                {/* Caustic refraction dot */}
                <div className="absolute top-4 right-5 w-3 h-3 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.9)', filter: 'blur(2px)' }} />
                <div className="absolute top-6 right-8 w-1.5 h-1.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.7)' }} />
                <span style={{ fontSize: 48, filter: 'drop-shadow(0 3px 10px rgba(8,145,178,0.3))', position: 'relative', zIndex: 1 }}>🧬</span>
            </motion.div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* 4-DOMAIN WATER PILLS                                   */
/* ══════════════════════════════════════════════════════ */
const DOMAINS = [
    { emoji: '🫀', label: 'جسدي',  tint: 'rgba(8,145,178,0.12)',  border: 'rgba(8,145,178,0.28)',  text: '#0E7490' },
    { emoji: '🧠', label: 'نفسي',  tint: 'rgba(129,140,248,0.12)', border: 'rgba(129,140,248,0.3)', text: '#4F46E5' },
    { emoji: '📚', label: 'فكري',  tint: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.28)', text: '#B45309' },
    { emoji: '✨', label: 'روحي',  tint: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)',  text: '#0284C7' },
];

function RoutingPreview({ ready }: { ready: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={ready ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: 0.5, type: 'spring', stiffness: 220, damping: 28 }}
            className="w-full rounded-[26px] overflow-hidden mb-5"
            style={{
                background: W.glass,
                border: `1.5px solid ${W.glassBorder}`,
                backdropFilter: 'blur(24px)',
                boxShadow: '0 4px 24px rgba(8,145,178,0.10), 0 1px 0 rgba(255,255,255,0.9) inset',
            }}>
            {/* Shimmer top */}
            <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)' }} />
            <div className="p-4">
                <p style={{ fontSize: 8.5, fontWeight: 900, color: W.textMuted, textTransform: 'uppercase', letterSpacing: '0.18em', textAlign: 'center', marginBottom: 12 }}>
                    التقييم يُوجّهك تلقائياً إلى
                </p>
                <div className="grid grid-cols-4 gap-2">
                    {DOMAINS.map((d, i) => (
                        <motion.div key={d.label}
                            initial={{ opacity: 0, scale: 0.75 }}
                            animate={ready ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 0.58 + i * 0.07, type: 'spring', stiffness: 350, damping: 24 }}
                            className="flex flex-col items-center gap-1.5 rounded-[16px] py-2.5 px-1"
                            style={{
                                background: `${d.tint}`,
                                border: `1px solid ${d.border}`,
                                backdropFilter: 'blur(8px)',
                            }}>
                            <span style={{ fontSize: 20 }}>{d.emoji}</span>
                            <span style={{ fontSize: 8.5, fontWeight: 800, color: d.text }}>{d.label}</span>
                        </motion.div>
                    ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-px" style={{ background: `rgba(8,145,178,0.12)` }} />
                    <p style={{ fontSize: 9, color: W.textMuted, fontWeight: 600 }}>+ فرع + ٥ أدوات مخصصة</p>
                    <div className="flex-1 h-px" style={{ background: `rgba(8,145,178,0.12)` }} />
                </div>
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* FEATURE PILLS                                          */
/* ══════════════════════════════════════════════════════ */
const PILLS = [
    { icon: Zap,      label: 'دقيقتان',     tint: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.28)', text: '#92400E' },
    { icon: Lock,     label: 'سري',         tint: 'rgba(8,145,178,0.1)',   border: 'rgba(8,145,178,0.25)',  text: W.tealDeep },
    { icon: Sparkles, label: 'مجاناً',      tint: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.3)', text: '#4338CA' },
    { icon: Shield,   label: 'بإشراف طبي', tint: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.28)', text: '#065F46' },
];

/* ══════════════════════════════════════════════════════ */
/* MAIN                                                   */
/* ══════════════════════════════════════════════════════ */
export function StepWelcome({ onStart }: { onStart: () => void }) {
    const [ready, setReady] = useState(false);
    useEffect(() => { const t = setTimeout(() => setReady(true), 160); return () => clearTimeout(t); }, []);

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden"
            style={{ background: W.pageBg }}>

            {/* Deep water ambient layers */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Primary water glow */}
                <div style={{ position: 'absolute', top: -100, right: -60, width: 360, height: 360,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.28) 0%, rgba(56,189,248,0.18) 35%, transparent 70%)',
                    filter: 'blur(50px)' }} />
                {/* Secondary seafoam glow */}
                <div style={{ position: 'absolute', top: 140, left: -80, width: 280, height: 280,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 65%)',
                    filter: 'blur(50px)' }} />
                {/* Bottom lavender water glow */}
                <div style={{ position: 'absolute', bottom: 60, right: -30, width: 240, height: 240,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(129,140,248,0.16) 0%, transparent 65%)',
                    filter: 'blur(45px)' }} />
                {/* Caustic light pattern (very subtle) */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(ellipse 60% 40% at 25% 60%, rgba(255,255,255,0.22) 0%, transparent 50%),
                                      radial-gradient(ellipse 40% 30% at 75% 25%, rgba(255,255,255,0.18) 0%, transparent 50%)`,
                }} />
            </div>

            {/* Glass panel overlay effect */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ backdropFilter: 'blur(0.5px)' }} />

            <div className="relative z-10 flex flex-col items-center text-center px-5 pt-7 pb-3 flex-1">
                {/* Brand */}
                <motion.p initial={{ opacity: 0, y: -6 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.04 }}
                    style={{ fontSize: 9.5, fontWeight: 900, color: W.teal, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 22 }}>
                    طِبرَا · Digital Care Engine
                </motion.p>

                {/* Hero orb */}
                <motion.div initial={{ opacity: 0, scale: 0.72 }} animate={ready ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.07, type: 'spring', stiffness: 200, damping: 22 }} className="mb-5">
                    <WaterGlassOrb ready={ready} />
                </motion.div>

                {/* Water pulse ECG */}
                <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.28 }} className="mb-5">
                    {ready && <WaterPulseLine />}
                </motion.div>

                {/* Headline */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={ready ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.18, type: 'spring', stiffness: 230, damping: 28 }} className="mb-4">
                    <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15,
                        color: W.textPrimary, marginBottom: 10 }}>
                        جسدك يحكي.
                        <br />
                        <span style={{
                            background: `linear-gradient(135deg, ${W.teal}, ${W.cyan} 55%, ${W.lavender})`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>
                            نحن نفهمه.
                        </span>
                    </h1>
                    <p style={{ fontSize: 13, color: W.textSub, lineHeight: 1.65, fontWeight: 500 }}>
                        تحليل سريري رباعي الأبعاد في دقيقتين.
                    </p>
                </motion.div>

                {/* Feature pills */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={ready ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 }} className="flex flex-wrap gap-2 justify-center mb-5">
                    {PILLS.map((p, i) => (
                        <motion.div key={p.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={ready ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 0.36 + i * 0.07, type: 'spring', stiffness: 350, damping: 26 }}
                            className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                            style={{
                                background: p.tint,
                                border: `1px solid ${p.border}`,
                                backdropFilter: 'blur(12px)',
                            }}>
                            <p.icon style={{ width: 11, height: 11, color: p.text, flexShrink: 0 }} />
                            <span style={{ fontSize: 10.5, fontWeight: 800, color: p.text }}>{p.label}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Routing preview */}
                <RoutingPreview ready={ready} />

                {/* Warning glass card */}
                <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.68 }}
                    className="w-full rounded-[18px] p-3 flex items-start gap-2.5 mb-4"
                    style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.28)', backdropFilter: 'blur(12px)' }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                    <p style={{ fontSize: 10.5, color: '#92400E', lineHeight: 1.6, fontWeight: 500, textAlign: 'right' }}>
                        في الحالات الطارئة التي تهدد الحياة، توجه للطوارئ فوراً.
                    </p>
                </motion.div>

                {/* Doctor badge */}
                <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.74 }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full mb-4"
                    style={{ background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.25)', backdropFilter: 'blur(12px)' }}>
                    <Shield style={{ width: 12, height: 12, color: W.teal }} />
                    <p style={{ fontSize: 10.5, color: W.tealDeep, fontWeight: 700 }}>
                        بإشراف د. عمر العماد — طب وظيفي وتكاملي
                    </p>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.62, type: 'spring', stiffness: 220, damping: 28 }}
                className="relative z-10">
                <BottomCTA label="ابدأ التحليل الآن" onPress={onStart} variant="gradient" sublabel="آمن · سري · مجاني" />
            </motion.div>
        </div>
    );
}

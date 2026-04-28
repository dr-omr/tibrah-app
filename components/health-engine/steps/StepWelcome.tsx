// components/health-engine/steps/StepWelcome.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH v9 — Welcome Screen Redesign
// ════════════════════════════════════════════════════════════════════
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Zap, Sparkles, Shield, ChevronLeft, Star, Heart, Brain, Activity } from 'lucide-react';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

/* ══════════════════════════════════════════════════════ */
/* DESIGN TOKENS                                          */
/* ══════════════════════════════════════════════════════ */
const W = {
    pageBg:    'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)',
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
    sheen:       'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
};

/* ══════════════════════════════════════════════════════ */
/* LIVE COUNTER — animated number                         */
/* ══════════════════════════════════════════════════════ */
function LiveCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const duration = 1800;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            setCount(Math.floor(current));
            if (current >= target) clearInterval(timer);
        }, duration / steps);
        return () => clearInterval(timer);
    }, [target]);
    return <>{prefix}{count.toLocaleString('ar')}{suffix}</>;
}

/* ══════════════════════════════════════════════════════ */
/* FLOW STEPS PREVIEW                                     */
/* ══════════════════════════════════════════════════════ */
const FLOW_STEPS = [
    { emoji: '🎯', label: 'اختر شكواك الرئيسية', color: '#0891B2' },
    { emoji: '📊', label: 'صف حدة الأعراض ومدتها', color: '#D97706' },
    { emoji: '💙', label: 'حدد سياقك العاطفي', color: '#818CF8' },
    { emoji: '✨', label: 'استلم نتيجتك الشخصية', color: '#059669' },
];

function FlowPreview({ ready }: { ready: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.42, type: 'spring', stiffness: 220, damping: 28 }}
            className="w-full rounded-[26px] overflow-hidden mb-4"
            style={{
                background: W.glass,
                border: `1.5px solid ${W.glassBorder}`,
                backdropFilter: 'blur(24px)',
                boxShadow: '0 4px 24px rgba(8,145,178,0.10), 0 1px 0 rgba(255,255,255,0.9) inset',
            }}>
            <div className="px-4 pt-4 pb-3">
                <p style={{ fontSize: 8.5, fontWeight: 900, color: W.textMuted, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 14, textAlign: 'center' }}>
                    رحلتك في ٤ خطوات · ٢ دقيقة فقط
                </p>
                <div className="space-y-2">
                    {FLOW_STEPS.map((s, i) => (
                        <motion.div key={s.label}
                            initial={{ opacity: 0, x: 12 }}
                            animate={ready ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.48 + i * 0.07, type: 'spring', stiffness: 280, damping: 28 }}
                            className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                                style={{ background: `${s.color}12`, border: `1px solid ${s.color}22` }}>
                                <span style={{ fontSize: 15 }}>{s.emoji}</span>
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                                    <span style={{ fontSize: 9, fontWeight: 900, color: s.color }}>{i + 1}</span>
                                </div>
                                <p style={{ fontSize: 12, fontWeight: 700, color: W.textSub }}>{s.label}</p>
                            </div>
                            {i < FLOW_STEPS.length - 1 && (
                                <ChevronLeft style={{ width: 12, height: 12, color: W.textMuted, flexShrink: 0 }} />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* STATS ROW                                              */
/* ══════════════════════════════════════════════════════ */
const STATS = [
    { icon: Heart,    value: 2800,  suffix: '+', label: 'تقييم طبي' },
    { icon: Star,     value: 4.9,   suffix: '',  label: 'تقييم المستخدمين', decimal: true },
    { icon: Activity, value: 98,    suffix: '%', label: 'دقة التحليل' },
];

function StatsRow({ ready }: { ready: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.32, type: 'spring', stiffness: 240, damping: 28 }}
            className="flex gap-2 w-full mb-4">
            {STATS.map((s, i) => (
                <motion.div key={s.label}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={ready ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.36 + i * 0.07, type: 'spring', stiffness: 350, damping: 24 }}
                    className="flex-1 rounded-[16px] p-2.5 text-center relative overflow-hidden"
                    style={{
                        background: W.glass,
                        border: `1px solid ${W.glassBorder}`,
                        backdropFilter: 'blur(18px)',
                        boxShadow: '0 3px 12px rgba(8,145,178,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
                    }}>
                    <div className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
                        style={{ background: W.sheen, borderRadius: '16px 16px 0 0' }} />
                    <s.icon style={{ width: 12, height: 12, color: W.teal, margin: '0 auto 4px' }} />
                    <p style={{ fontSize: 15, fontWeight: 900, color: W.textPrimary, lineHeight: 1 }}>
                        {ready ? (
                            s.decimal
                                ? '4.9'
                                : <LiveCounter target={s.value} suffix={s.suffix} />
                        ) : '—'}
                    </p>
                    <p style={{ fontSize: 8, fontWeight: 700, color: W.textMuted, marginTop: 2 }}>{s.label}</p>
                </motion.div>
            ))}
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* HERO ORB — liquid water glass                          */
/* ══════════════════════════════════════════════════════ */
function HeroOrb({ ready }: { ready: boolean }) {
    return (
        <div className="relative" style={{ width: 120, height: 120 }}>
            {/* Outer water rings */}
            {[1.65, 1.38, 1.14].map((scale, i) => (
                <motion.div key={i}
                    className="absolute inset-0 rounded-[44px]"
                    style={{
                        background: `rgba(${i === 0 ? '34,211,238' : i === 1 ? '56,189,248' : '129,140,248'},0.07)`,
                        border: `1px solid rgba(${i === 0 ? '34,211,238' : i === 1 ? '56,189,248' : '129,140,248'},0.18)`,
                        transform: `scale(${scale})`,
                        backdropFilter: 'blur(1px)',
                    }}
                    animate={{ scale: [scale, scale * 1.04, scale] }}
                    transition={{ duration: 3 + i * 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                />
            ))}

            {/* Core */}
            <motion.div
                animate={ready ? { scale: [1, 1.04, 1] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-[40px] flex items-center justify-center relative overflow-hidden"
                style={{
                    background: `linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(186,230,253,0.85) 30%, rgba(103,232,249,0.70) 65%, rgba(34,211,238,0.80) 100%)`,
                    boxShadow: `0 16px 48px rgba(8,145,178,0.28), 0 4px 16px rgba(34,211,238,0.22), 0 2px 0 rgba(255,255,255,0.95) inset`,
                    border: '1.5px solid rgba(255,255,255,0.88)',
                }}>
                <div className="absolute top-0 left-0 right-0 h-[55%] rounded-t-[38px]"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, transparent 100%)' }} />
                {/* Caustic dots */}
                <div className="absolute top-4 right-5 w-3 h-3 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.9)', filter: 'blur(2px)' }} />
                <div className="absolute top-6 right-8 w-1.5 h-1.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.7)' }} />
                <span style={{ fontSize: 42, filter: 'drop-shadow(0 3px 10px rgba(8,145,178,0.3))', position: 'relative', zIndex: 1 }}>🧬</span>
            </motion.div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* ECG PULSE LINE                                         */
/* ══════════════════════════════════════════════════════ */
function PulseLine() {
    return (
        <svg viewBox="0 0 320 48" style={{ width: '100%', maxWidth: 280, height: 40 }} aria-hidden>
            <defs>
                <linearGradient id="pulse-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={W.teal} stopOpacity="0" />
                    <stop offset="30%" stopColor={W.teal} />
                    <stop offset="65%" stopColor={W.tealLight} />
                    <stop offset="100%" stopColor={W.lavender} stopOpacity="0" />
                </linearGradient>
            </defs>
            <motion.polyline
                points="0,24 40,24 56,6 66,42 76,6 86,42 96,24 140,24 155,18 170,24 185,30 200,24 320,24"
                fill="none" stroke="url(#pulse-grad)" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                pathLength={1}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.4 }}
            />
            {[0.9, 1.4, 1.9].map((delay, i) => (
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
/* TRUST BADGES                                           */
/* ══════════════════════════════════════════════════════ */
const PILLS = [
    { icon: Zap,      label: 'دقيقتان فقط',  tint: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.28)', text: '#92400E' },
    { icon: Lock,     label: 'سرية تامة',     tint: 'rgba(8,145,178,0.1)',   border: 'rgba(8,145,178,0.25)',  text: W.tealDeep },
    { icon: Sparkles, label: 'مجاناً',         tint: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.3)', text: '#4338CA' },
    { icon: Shield,   label: 'إشراف طبي',     tint: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.28)', text: '#065F46' },
];

/* ══════════════════════════════════════════════════════ */
/* DOMAIN PILLS — 4 pillars                               */
/* ══════════════════════════════════════════════════════ */
const DOMAINS = [
    { emoji: '🫀', label: 'جسدي',  color: '#0D9488' },
    { emoji: '🧠', label: 'نفسي',  color: '#7C3AED' },
    { emoji: '📚', label: 'فكري',  color: '#D97706' },
    { emoji: '✨', label: 'روحي',  color: '#0284C7' },
];

/* ══════════════════════════════════════════════════════ */
/* MAIN PAGE                                              */
/* ══════════════════════════════════════════════════════ */
export function StepWelcome({ onStart }: { onStart: () => void }) {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setReady(true), 140);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden" dir="rtl"
            style={{ background: W.pageBg }}>

            {/* ── Ambient layers ── */}
            <div className="absolute inset-0 pointer-events-none">
                <div style={{
                    position: 'absolute', top: -100, right: -60, width: 360, height: 360,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.25) 0%, rgba(56,189,248,0.15) 40%, transparent 70%)',
                    filter: 'blur(52px)',
                }} />
                <div style={{
                    position: 'absolute', top: 160, left: -80, width: 280, height: 280,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(52,211,153,0.16) 0%, transparent 65%)',
                    filter: 'blur(50px)',
                }} />
                <div style={{
                    position: 'absolute', bottom: 80, right: -30, width: 240, height: 240,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(129,140,248,0.14) 0%, transparent 65%)',
                    filter: 'blur(45px)',
                }} />
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(ellipse 60% 40% at 25% 60%, rgba(255,255,255,0.20) 0%, transparent 50%),
                                      radial-gradient(ellipse 40% 30% at 75% 25%, rgba(255,255,255,0.16) 0%, transparent 50%)`,
                }} />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center px-5 pt-7 pb-44 flex-1">

                {/* Brand */}
                <motion.p initial={{ opacity: 0, y: -6 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.04 }}
                    style={{ fontSize: 9, fontWeight: 900, color: W.teal, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 20 }}>
                    طِبرَا · Digital Care Engine
                </motion.p>

                {/* Hero Orb */}
                <motion.div initial={{ opacity: 0, scale: 0.72 }} animate={ready ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.07, type: 'spring', stiffness: 200, damping: 22 }} className="mb-4">
                    <HeroOrb ready={ready} />
                </motion.div>

                {/* Pulse ECG */}
                <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.26 }} className="mb-4">
                    {ready && <PulseLine />}
                </motion.div>

                {/* Headline */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={ready ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.16, type: 'spring', stiffness: 230, damping: 28 }} className="mb-5">
                    <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, color: W.textPrimary, marginBottom: 10 }}>
                        ابدأ خريطة حالتك
                    </h1>
                    <p style={{ fontSize: 13, color: W.textSub, lineHeight: 1.65, fontWeight: 500 }}>
                        أجب عن أسئلة قصيرة، وسيبني طِبرا قراءة أولية تربط الأعراض، الشدة، الإيقاع، والسياق — مع السلامة أولاً.
                    </p>
                </motion.div>

                {/* Disclaimer — honest, not fake metrics */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={ready ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.28 }} className="flex flex-wrap gap-2 justify-center mb-5">
                    {PILLS.map((p, i) => (
                        <motion.div key={p.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={ready ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 0.32 + i * 0.06, type: 'spring', stiffness: 350, damping: 26 }}
                            className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                            style={{ background: p.tint, border: `1px solid ${p.border}`, backdropFilter: 'blur(12px)' }}>
                            <p.icon style={{ width: 11, height: 11, color: p.text, flexShrink: 0 }} />
                            <span style={{ fontSize: 10.5, fontWeight: 800, color: p.text }}>{p.label}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Flow preview */}
                <FlowPreview ready={ready} />

                {/* 4 domains strip */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={ready ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.52, type: 'spring', stiffness: 220, damping: 28 }}
                    className="w-full rounded-[22px] p-3 mb-4 relative overflow-hidden"
                    style={{
                        background: W.glass,
                        border: `1.5px solid ${W.glassBorder}`,
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 3px 16px rgba(8,145,178,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                    }}>
                    <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
                        style={{ background: W.sheen, borderRadius: '22px 22px 0 0' }} />
                    <p style={{ fontSize: 8.5, fontWeight: 900, color: W.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 }}>
                        يُوجّهك تلقائياً إلى أحد الأقسام الأربعة
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                        {DOMAINS.map((d, i) => (
                            <motion.div key={d.label}
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={ready ? { opacity: 1, scale: 1 } : {}}
                                transition={{ delay: 0.58 + i * 0.06, type: 'spring', stiffness: 360, damping: 24 }}
                                className="flex flex-col items-center gap-1.5 rounded-[14px] py-2 px-1"
                                style={{ background: `${d.color}10`, border: `1px solid ${d.color}20` }}>
                                <span style={{ fontSize: 18 }}>{d.emoji}</span>
                                <span style={{ fontSize: 9, fontWeight: 800, color: d.color }}>{d.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Emergency warning */}
                <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.66 }}
                    className="w-full rounded-[18px] p-3 flex items-start gap-2.5 mb-3"
                    style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.28)', backdropFilter: 'blur(12px)' }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                    <p style={{ fontSize: 10.5, color: '#92400E', lineHeight: 1.6, fontWeight: 500, textAlign: 'right' }}>
                        في الحالات الطارئة التي تهدد الحياة، توجه للطوارئ فوراً.
                    </p>
                </motion.div>

                {/* Doctor badge */}
                <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.72 }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full"
                    style={{ background: 'rgba(8,145,178,0.10)', border: '1px solid rgba(8,145,178,0.22)', backdropFilter: 'blur(12px)' }}>
                    <Brain style={{ width: 11, height: 11, color: W.teal }} />
                    <p style={{ fontSize: 10.5, color: W.tealDeep, fontWeight: 700 }}>
                        بإشراف د. عمر العماد · طب وظيفي وتكاملي
                    </p>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.60, type: 'spring', stiffness: 220, damping: 28 }}
                className="relative z-10">
                <BottomCTA
                    label="ابدأ التقييم"
                    onPress={() => { haptic.impact(); onStart(); }}
                    variant="gradient"
                    sublabel="آمن · سري · مجاني تماماً"
                />
            </motion.div>
        </div>
    );
}

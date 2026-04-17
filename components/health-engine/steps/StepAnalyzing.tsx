// components/health-engine/steps/StepAnalyzing.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH v8 — Liquid Glass Water Analyzing Screen
// مائي زجاجي عميق — بدون أي لون أسود
// ════════════════════════════════════════════════════════════════════
'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════
   LIGHT WATER GLASS — Premium Medical
   ══════════════════════════════════════════════════════════════════ */
const W = {
    pageBg:    'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)',
    glass:     'rgba(255,255,255,0.55)',
    glassBorder: 'rgba(255,255,255,0.82)',
    teal:      '#0891B2',
    tealDeep:  '#0E7490',
    tealLight: '#22D3EE',
    cyan:      '#38BDF8',
    seafoam:   '#34D399',
    lavender:  '#818CF8',
    textPrimary: '#0C4A6E',
    textSub:     '#0369A1',
    textMuted:   '#7DD3FC',
};

/* ══════════════════════════════════════════════════════ */
/* STEPS                                                  */
/* ══════════════════════════════════════════════════════ */
const STEPS = [
    { label: 'قراءة الأعراض الرئيسية',    emoji: '🩺', ms: 540 },
    { label: 'فحص علامات الخطر',           emoji: '⚠️', ms: 480 },
    { label: 'قياس الشدة والمدة',          emoji: '📊', ms: 560 },
    { label: 'تحليل الأنماط السريرية',     emoji: '🔬', ms: 620 },
    { label: 'قراءة السياق العاطفي',       emoji: '🧠', ms: 680 },
    { label: 'رسم خريطة الأقسام الأربعة',  emoji: '🗺️', ms: 560 },
    { label: 'تحديد الأدوات المناسبة',     emoji: '🎯', ms: 460 },
    { label: 'توليد خريطة توجيهك',         emoji: '✨', ms: 580 },
];

/* ══════════════════════════════════════════════════════ */
/* 4-DOMAIN ORBIT — water glass orbs                      */
/* ══════════════════════════════════════════════════════ */
const DOMAIN_ORBS = [
    { emoji: '🫀', label: 'جسدي',  color: '#0891B2', tint: 'rgba(8,145,178,0.22)',  angle: 0   },
    { emoji: '🧠', label: 'نفسي',  color: '#7C3AED', tint: 'rgba(124,58,237,0.18)', angle: 90  },
    { emoji: '📚', label: 'فكري',  color: '#D97706', tint: 'rgba(217,119,6,0.18)',  angle: 180 },
    { emoji: '✨', label: 'روحي',  color: '#0284C7', tint: 'rgba(2,132,199,0.18)',  angle: 270 },
];

function WaterOrbitViz({ activeIdx }: { activeIdx: number }) {
    const R = 78;
    const activated = Math.min(4, Math.floor((activeIdx / STEPS.length) * 5));

    return (
        <div className="relative" style={{ width: 220, height: 220 }}>
            {/* Water depth rings */}
            {[0.45, 0.7, 1.0].map((op, i) => (
                <motion.div key={i}
                    className="absolute rounded-full"
                    style={{
                        inset: i === 0 ? '20%' : i === 1 ? '10%' : '0%',
                        background: `radial-gradient(ellipse, rgba(34,211,238,${op * 0.08}) 0%, transparent 70%)`,
                        border: `1px solid rgba(34,211,238,${op * 0.18})`,
                    }}
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
                />
            ))}

            {/* Orbital ring (dashed, water style) */}
            <motion.div className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
                <svg width="220" height="220" className="absolute inset-0">
                    <defs>
                        <linearGradient id="orbit-g" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={W.teal} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={W.lavender} stopOpacity="0.15" />
                        </linearGradient>
                    </defs>
                    <circle cx="110" cy="110" r={R}
                        fill="none" stroke="url(#orbit-g)"
                        strokeWidth="1.5" strokeDasharray="5 8" />
                </svg>
            </motion.div>

            {/* Central water glass orb */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-[68px] h-[68px] rounded-[22px] flex items-center justify-center relative overflow-hidden"
                    style={{
                        background: `linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(186,230,253,0.85) 35%, rgba(34,211,238,0.75) 100%)`,
                        boxShadow: `0 8px 32px rgba(8,145,178,0.28), 0 2px 0 rgba(255,255,255,0.95) inset`,
                        border: '1.5px solid rgba(255,255,255,0.85)',
                    }}>
                    <div className="absolute top-0 left-0 right-0 h-[48%]"
                        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 100%)', borderRadius: '22px 22px 0 0' }} />
                    <span style={{ fontSize: 28, position: 'relative', zIndex: 1 }}>🧬</span>
                </motion.div>
            </div>

            {/* Domain orbs */}
            {DOMAIN_ORBS.map((orb, i) => {
                const rad = (orb.angle * Math.PI) / 180;
                const x = 110 + R * Math.cos(rad) - 20;
                const y = 110 + R * Math.sin(rad) - 20;
                const isActive = i < activated;

                return (
                    <motion.div key={orb.label}
                        style={{ position: 'absolute', left: x, top: y, width: 42, height: 42 }}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 280, damping: 22 }}>
                        <motion.div
                            animate={isActive
                                ? { scale: [1, 1.12, 1], boxShadow: [`0 0 0px transparent`, `0 0 18px ${orb.color}60`, `0 0 0px transparent`] }
                                : { scale: 1 }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
                            className="w-[42px] h-[42px] rounded-full flex items-center justify-center relative overflow-hidden"
                            style={{
                                background: isActive
                                    ? `linear-gradient(145deg, rgba(255,255,255,0.9) 0%, ${orb.tint} 100%)`
                                    : 'rgba(255,255,255,0.35)',
                                border: `1.5px solid ${isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)'}`,
                                boxShadow: isActive ? `0 4px 16px ${orb.color}30` : 'none',
                                backdropFilter: 'blur(10px)',
                            }}>
                            {isActive && (
                                <div className="absolute top-0 left-0 right-0 h-[45%]"
                                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, transparent 100%)', borderRadius: '50% 50% 0 0' }} />
                            )}
                            <span style={{ fontSize: 17, position: 'relative', zIndex: 1 }}>{orb.emoji}</span>
                        </motion.div>
                        <p style={{
                            fontSize: 7.5, fontWeight: 800, textAlign: 'center', marginTop: 2,
                            color: isActive ? orb.color : W.textMuted,
                            transition: 'color 0.4s ease',
                        }}>{orb.label}</p>
                    </motion.div>
                );
            })}

            {/* Water ripple pulses from center */}
            {[0, 1, 2].map(i => (
                <motion.div key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        top: '50%', left: '50%',
                        width: 60 + i * 36, height: 60 + i * 36,
                        marginLeft: -(30 + i * 18), marginTop: -(30 + i * 18),
                        border: `1px solid rgba(8,145,178,${0.18 - i * 0.05})`,
                    }}
                    animate={{ scale: [0.85, 1.25, 0.85], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.9, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* WATER CANVAS BACKGROUND                                */
/* ══════════════════════════════════════════════════════ */
function WaterCanvas() {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        c.width = c.offsetWidth; c.height = c.offsetHeight;

        const nodes = Array.from({ length: 26 }, () => ({
            x: Math.random() * c.width, y: Math.random() * c.height,
            vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
            r: Math.random() * 2 + 0.8,
            colorIdx: Math.floor(Math.random() * 4),
        }));

        // Water palette (no black)
        const COLORS = ['rgba(8,145,178', 'rgba(34,211,238', 'rgba(56,189,248', 'rgba(129,140,248'];
        let frame = 0; let raf: number;

        const draw = () => {
            frame++;
            ctx.clearRect(0, 0, c.width, c.height);
            nodes.forEach(n => {
                n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > c.width) n.vx *= -1;
                if (n.y < 0 || n.y > c.height) n.vy *= -1;
            });

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 90) {
                        ctx.beginPath();
                        ctx.strokeStyle = `${COLORS[nodes[i].colorIdx]},${(1 - d / 90) * 0.18})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            nodes.forEach((n, i) => {
                const p = Math.sin(frame * 0.035 + i) * 0.5 + 0.5;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r + p * 0.7, 0, Math.PI * 2);
                ctx.fillStyle = `${COLORS[n.colorIdx]},${0.25 + p * 0.22})`;
                ctx.fill();
            });

            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(raf);
    }, []);

    return <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{ opacity: 0.55 }} />;
}

/* ══════════════════════════════════════════════════════ */
/* STEP ITEM                                              */
/* ══════════════════════════════════════════════════════ */
function StepItem({ step, index, isCompleted, isActive, delay }: {
    step: typeof STEPS[0]; index: number;
    isCompleted: boolean; isActive: boolean; delay: number;
}) {
    const pct = isCompleted ? 100 : isActive ? 50 : 0;
    const r = 10; const circ = 2 * Math.PI * r;

    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: isCompleted || isActive ? 1 : 0.3, x: 0 }}
            transition={{ delay, type: 'spring', stiffness: 260, damping: 28 }}
            className="flex items-center gap-3">
            {/* Mini arc */}
            <div className="relative flex-shrink-0" style={{ width: 26, height: 26 }}>
                <svg width="26" height="26" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
                    <circle cx="13" cy="13" r={r} fill="none" stroke="rgba(8,145,178,0.15)" strokeWidth="2" />
                    <motion.circle cx="13" cy="13" r={r} fill="none"
                        stroke={isCompleted ? W.seafoam : W.teal}
                        strokeWidth="2" strokeLinecap="round"
                        strokeDasharray={circ}
                        animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
                        transition={{ duration: 0.35 }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isCompleted
                            ? <motion.div key="chk"
                                initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}>
                                <Check style={{ width: 11, height: 11, color: W.seafoam, strokeWidth: 3 }} />
                              </motion.div>
                            : <motion.div key="dot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {isActive
                                    ? <motion.div className="w-2 h-2 rounded-full"
                                        style={{ background: W.teal }}
                                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 0.65, repeat: Infinity }} />
                                    : <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(8,145,178,0.3)' }} />
                                }
                              </motion.div>
                        }
                    </AnimatePresence>
                </div>
            </div>

            {/* Text + sweep bar */}
            <div className="flex-1">
                <p style={{
                    fontSize: 12.5, fontWeight: isActive ? 800 : 600,
                    color: isCompleted ? W.tealDeep : isActive ? W.textPrimary : W.textMuted,
                    transition: 'color 0.3s ease',
                }}>
                    {step.emoji} {step.label}
                </p>
                {isActive && (
                    <motion.div
                        initial={{ width: 0 }} animate={{ width: '100%' }}
                        transition={{ duration: (step.ms / 1000) * 0.85, ease: 'linear' }}
                        className="h-[2px] rounded-full mt-1"
                        style={{ background: `linear-gradient(90deg, ${W.teal}, ${W.tealLight})` }}
                    />
                )}
            </div>

            {/* Done */}
            <AnimatePresence>
                {isCompleted && (
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 24 }}>
                        <Check style={{ width: 13, height: 13, color: W.seafoam, strokeWidth: 3 }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* MAIN                                                   */
/* ══════════════════════════════════════════════════════ */
export function StepAnalyzing() {
    const [activeIdx, setActiveIdx] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
        let idx = 0;
        const go = () => {
            idx++;
            if (idx < STEPS.length) { setActiveIdx(idx); setTimeout(go, STEPS[idx].ms); }
            else setTimeout(() => setDone(true), 400);
        };
        setTimeout(go, STEPS[0].ms);
    }, []);

    const pct = done ? 100 : Math.round((activeIdx / STEPS.length) * 100);

    return (
        <div className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden"
            style={{ background: W.pageBg, paddingTop: 28 }}>

            {/* Water canvas bg */}
            <div className="absolute inset-0 pointer-events-none"><WaterCanvas /></div>

            {/* Ambient water glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div style={{ position: 'absolute', top: -80, right: -60, width: 320, height: 320,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.22) 0%, transparent 70%)',
                    filter: 'blur(50px)' }} />
                <div style={{ position: 'absolute', bottom: -60, left: -40, width: 280, height: 280,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(129,140,248,0.16) 0%, transparent 65%)',
                    filter: 'blur(45px)' }} />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center px-5">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="text-center mb-7">
                    <p style={{ fontSize: 9.5, fontWeight: 900, color: W.teal, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
                        طِبرَا · محرك التوجيه الرباعي
                    </p>
                    <AnimatePresence mode="wait">
                        <motion.h2 key={done ? 'done' : 'work'}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}
                            style={{ fontSize: 24, fontWeight: 900, color: W.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.22 }}>
                            {done
                                ? <><span style={{ color: W.seafoam }}>✓</span> اكتمل التحليل</>
                                : 'الذكاء يعمل…'
                            }
                        </motion.h2>
                    </AnimatePresence>
                    <p style={{ fontSize: 12, color: W.textSub, marginTop: 4, fontWeight: 500 }}>
                        {done ? 'خريطة توجيهك الشخصية جاهزة' : 'جسدي · نفسي · فكري · إيقاعي'}
                    </p>
                </motion.div>

                {/* Orbit viz */}
                <motion.div initial={{ opacity: 0, scale: 0.86 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.18, type: 'spring', stiffness: 200, damping: 24 }} className="mb-7">
                    <WaterOrbitViz activeIdx={activeIdx} />
                </motion.div>

                {/* Glass steps card */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28, type: 'spring', stiffness: 200, damping: 28 }}
                    className="w-full max-w-sm rounded-[28px] p-4 overflow-hidden"
                    style={{
                        background: W.glass,
                        border: `1.5px solid ${W.glassBorder}`,
                        backdropFilter: 'blur(28px)',
                        boxShadow: '0 8px 32px rgba(8,145,178,0.12), 0 2px 0 rgba(255,255,255,0.95) inset',
                    }}>
                    <div className="h-px mb-4"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)' }} />

                    <div className="space-y-3">
                        {STEPS.map((s, i) => (
                            <StepItem key={i} step={s} index={i}
                                isCompleted={i < activeIdx || done}
                                isActive={i === activeIdx && !done}
                                delay={0.32 + i * 0.04} />
                        ))}
                    </div>

                    {/* Progress */}
                    <div className="mt-4 pt-4" style={{ borderTop: `1px solid rgba(8,145,178,0.1)` }}>
                        <div className="flex justify-between mb-2">
                            <span style={{ fontSize: 9, fontWeight: 800, color: W.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>تقدم التحليل</span>
                            <span style={{ fontSize: 9, fontWeight: 900, color: done ? W.seafoam : W.teal }}>{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(8,145,178,0.1)' }}>
                            <motion.div className="h-full rounded-full"
                                style={{ background: done
                                    ? `linear-gradient(90deg, ${W.seafoam}, ${W.tealLight})`
                                    : `linear-gradient(90deg, ${W.teal}, ${W.tealLight})`
                                }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.4, ease: [0.05, 0.7, 0.1, 1] }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

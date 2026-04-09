// components/health-engine/steps/StepWelcome.tsx
// THIE v2 — "The Oracle" — First impression that stops time
// Inspired by: Apple Vision Pro spatial UI + medical biometrics + cosmic energy

'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Lock, Sparkles, Zap, Brain } from 'lucide-react';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

// ── Animated ECG line ──
function EcgLine() {
    return (
        <svg viewBox="0 0 300 60" className="w-full" style={{ opacity: 0.25 }} preserveAspectRatio="none">
            <motion.polyline
                points="0,30 30,30 45,10 55,50 65,10 75,50 85,30 120,30 135,20 150,30 165,40 180,30 300,30"
                fill="none"
                stroke="url(#ecg-grad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2.5, ease: 'easeInOut', delay: 0.8 }}
            />
            <defs>
                <linearGradient id="ecg-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0" />
                    <stop offset="50%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ── DNA Helix Rings ──
function DnaRings() {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[80, 110, 140, 170].map((size, i) => (
                <motion.div key={i}
                    className="absolute rounded-full border"
                    style={{
                        width: size, height: size,
                        borderColor: i % 2 === 0 ? 'rgba(13,148,136,0.15)' : 'rgba(99,102,241,0.12)',
                        borderStyle: i % 2 === 0 ? 'solid' : 'dashed',
                    }}
                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                    transition={{
                        duration: 20 + i * 5,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    );
}

// ── Floating data nodes ──
const DATA_NODES = [
    { x: '15%', y: '22%', label: 'القلب', color: '#ef4444', delay: 0.6 },
    { x: '78%', y: '18%', label: 'الدماغ', color: '#8b5cf6', delay: 0.75 },
    { x: '8%',  y: '65%', label: 'الغدد',  color: '#f59e0b', delay: 0.9 },
    { x: '82%', y: '68%', label: 'الجهاز', color: '#10b981', delay: 1.0 },
];

export function StepWelcome({ onStart }: { onStart: () => void }) {
    const [ready, setReady] = useState(false);
    const orbRef = useRef<HTMLDivElement>(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const rotateX = useSpring(useTransform(my, [-150, 150], [12, -12]), { stiffness: 150, damping: 30 });
    const rotateY = useSpring(useTransform(mx, [-150, 150], [-12, 12]), { stiffness: 150, damping: 30 });

    useEffect(() => { setTimeout(() => setReady(true), 300); }, []);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!orbRef.current) return;
        const rect = orbRef.current.getBoundingClientRect();
        mx.set(e.clientX - rect.left - rect.width / 2);
        my.set(e.clientY - rect.top - rect.height / 2);
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden pt-safe"
            onPointerMove={handlePointerMove}>

            {/* Top ambient */}
            <div className="absolute top-0 inset-x-0 h-64 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(13,148,136,0.20) 0%, transparent 100%)' }} />

            {/* Floating nodes */}
            {DATA_NODES.map((node, i) => (
                <motion.div key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={ready ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: node.delay, type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ position: 'absolute', left: node.x, top: node.y }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-md"
                    aria-hidden>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: node.color, boxShadow: `0 0 6px ${node.color}` }} />
                    <span className="text-[9px] font-black text-white/50">{node.label}</span>
                </motion.div>
            ))}

            {/* Center section */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-24">
                {/* 3D Tiltable Orb */}
                <motion.div
                    ref={orbRef}
                    style={{ rotateX, rotateY, perspective: 600 }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={ready ? { scale: 1, opacity: 1 } : {}}
                    transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
                    className="relative mb-8"
                    onClick={() => haptic.impact()}>
                    <DnaRings />

                    {/* Core orb */}
                    <motion.div
                        animate={{ boxShadow: [
                            '0 0 40px rgba(13,148,136,0.4), 0 0 80px rgba(99,102,241,0.2)',
                            '0 0 60px rgba(13,148,136,0.6), 0 0 120px rgba(99,102,241,0.35)',
                            '0 0 40px rgba(13,148,136,0.4), 0 0 80px rgba(99,102,241,0.2)',
                        ] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-28 h-28 rounded-[32px] flex items-center justify-center relative z-10"
                        style={{ background: 'linear-gradient(145deg, #0d9488 0%, #1e1b4b 50%, #6366f1 100%)' }}>
                        {/* Inner glass */}
                        <div className="absolute inset-[1px] rounded-[31px]"
                            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)' }} />
                        <Brain className="w-14 h-14 text-white relative z-10" strokeWidth={1.5} />
                    </motion.div>
                </motion.div>

                {/* ECG line */}
                <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}}
                    transition={{ delay: 0.6 }} className="w-full max-w-xs mb-6">
                    <EcgLine />
                </motion.div>

                {/* Headlines */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={ready ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 24 }}
                    className="text-center mb-4">
                    <motion.p
                        initial={{ letterSpacing: '0.3em', opacity: 0 }}
                        animate={ready ? { letterSpacing: '0.18em', opacity: 1 } : {}}
                        transition={{ delay: 0.35, duration: 0.8 }}
                        className="text-[9px] font-black uppercase text-teal-400 mb-3 tracking-[0.2em]">
                        محرك الذكاء الصحي · طِبرَا
                    </motion.p>

                    <h1 className="text-[34px] font-black leading-[1.1] tracking-tight mb-4">
                        <span className="text-white">جسدك يحكي.</span>
                        <br />
                        <span className="relative">
                            <span className="text-transparent bg-clip-text"
                                style={{ backgroundImage: 'linear-gradient(135deg, #0d9488 20%, #a78bfa 80%)' }}>
                                نحن نفهمه.
                            </span>
                            {/* Underline glow */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={ready ? { width: '100%' } : {}}
                                transition={{ delay: 0.7, duration: 0.6 }}
                                className="absolute -bottom-1 left-0 h-px"
                                style={{ background: 'linear-gradient(90deg, #0d9488, #6366f1)' }}
                            />
                        </span>
                    </h1>

                    <p className="text-[13px] text-slate-400 leading-relaxed max-w-[270px] mx-auto">
                        تحليل سريري متعدد الأبعاد — جسدي، وظيفي، وعاطفي — في دقيقتين.
                    </p>
                </motion.div>

                {/* Feature chips */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={ready ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-2 justify-center mb-8">
                    {[
                        { icon: Brain, label: 'ذكاء سريري', color: '#6366f1' },
                        { icon: Zap, label: 'دقيقتان', color: '#f59e0b' },
                        { icon: Lock, label: 'سري تماماً', color: '#10b981' },
                        { icon: Sparkles, label: 'مجانيًا', color: '#ec4899' },
                    ].map(({ icon: Icon, label, color }, i) => (
                        <motion.div key={label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={ready ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 0.5 + i * 0.06 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                            style={{
                                background: `${color}12`,
                                border: `1px solid ${color}25`,
                            }}>
                            <Icon className="w-3 h-3" style={{ color }} />
                            <span className="text-[11px] font-bold" style={{ color }}>{label}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Emergency banner */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={ready ? { opacity: 1 } : {}}
                    transition={{ delay: 0.8 }}
                    className="w-full max-w-xs rounded-2xl p-3 flex items-start gap-2.5 mb-4"
                    style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <span className="text-[14px] flex-shrink-0 mt-0.5">⚠️</span>
                    <p className="text-[10px] text-amber-500/70 font-medium leading-relaxed">
                        في الحالات الطارئة التي تهدد حياتك — توجه للطوارئ فوراً.
                    </p>
                </motion.div>
            </div>

            <BottomCTA
                label="ابدأ التحليل الآن"
                onPress={onStart}
                variant="gradient"
                sublabel="آمن · محمي · مجاني"
            />
        </div>
    );
}

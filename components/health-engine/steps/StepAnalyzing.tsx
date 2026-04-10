// components/health-engine/steps/StepAnalyzing.tsx
// THIE v4 — M3 Activity indicator + step list
// Reference: Google Pixel setup screens, Material Design circular progress

'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const STEPS = [
    { label: 'قراءة الأعراض الرئيسية',    emoji: '🩺', ms: 600 },
    { label: 'فحص علامات الخطر',            emoji: '⚠️', ms: 550 },
    { label: 'قياس الشدة والمدة',           emoji: '📊', ms: 650 },
    { label: 'تحليل الأنماط السريرية',       emoji: '🔬', ms: 700 },
    { label: 'قراءة السياق العاطفي',         emoji: '🧠', ms: 750 },
    { label: 'الربط بين الجسدي والعاطفي',   emoji: '💫', ms: 600 },
    { label: 'تحديد مستوى الأولوية',         emoji: '🎯', ms: 500 },
    { label: 'توليد تقريرك الشخصي',          emoji: '✨', ms: 650 },
];

/* Light teal neural background — M3 "surface dim" feel */
function NeuralCanvas() {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        c.width = c.offsetWidth; c.height = c.offsetHeight;

        const nodes = Array.from({ length: 22 }, () => ({
            x: Math.random() * c.width, y: Math.random() * c.height,
            vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 2.5 + 0.8,
        }));

        let frame = 0; let raf: number;
        const draw = () => {
            frame++;
            ctx.clearRect(0, 0, c.width, c.height);
            nodes.forEach(n => {
                n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > c.width) n.vx *= -1;
                if (n.y < 0 || n.y > c.height) n.vy *= -1;
            });
            for (let i = 0; i < nodes.length; i++)
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 85) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(13,148,136,${(1 - d / 85) * 0.15})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            nodes.forEach((n, i) => {
                const p = Math.sin(frame * 0.04 + i) * 0.5 + 0.5;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r + p * 0.7, 0, Math.PI * 2);
                ctx.fillStyle = i % 2 === 0
                    ? `rgba(13,148,136,${0.25 + p * 0.25})`
                    : `rgba(99,102,241,${0.18 + p * 0.18})`;
                ctx.fill();
            });
            raf = requestAnimationFrame(draw);
        };
        draw(); return () => cancelAnimationFrame(raf);
    }, []);
    return <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{ opacity: 0.65 }} />;
}

/* M3 Indeterminate circular loader → determinate on complete */
function CircularLoader({ pct, done }: { pct: number; done: boolean }) {
    const r = 46; const circ = 2 * Math.PI * r;
    return (
        <div className="relative w-32 h-32">
            <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle cx="64" cy="64" r={r} fill="none"
                    stroke="rgba(13,148,136,0.12)" strokeWidth="6" />
                {/* Progress */}
                <motion.circle cx="64" cy="64" r={r} fill="none"
                    stroke="url(#analyze-grad)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circ}
                    animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
                    transition={{ duration: 0.4, ease: [0.05, 0.7, 0.1, 1] }}
                />
                <defs>
                    <linearGradient id="analyze-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                </defs>
            </svg>
            {/* Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    {done
                        ? <motion.div key="done"
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 24 }}>
                            <Check className="w-10 h-10 text-teal-500" strokeWidth={3} />
                        </motion.div>
                        : <motion.div key="pct"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <span className="m3-headline-sm text-slate-900"
                                style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {pct}%
                            </span>
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
        </div>
    );
}

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
        <div className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"><NeuralCanvas /></div>

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                {/* M3 Circular progress */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                    className="mb-7">
                    <CircularLoader pct={pct} done={done} />
                </motion.div>

                {/* Title */}
                <AnimatePresence mode="wait">
                    <motion.div key={done ? 'done' : 'work'}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="text-center mb-7">
                        <h2 className="m3-headline-sm text-slate-900">
                            {done ? 'اكتمل التحليل ✓' : 'ذكاء طِبرَا يعمل…'}
                        </h2>
                        <p className="m3-body-md text-slate-400 mt-1">
                            {done ? 'جاري إنشاء تقريرك الشخصي' : 'طب وظيفي · تكاملي · عاطفي'}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* M3 Step list card */}
                <div className="w-full rounded-[24px] p-4"
                    style={{
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(0,0,0,0.07)',
                        boxShadow: '0px 2px 6px rgba(0,0,0,0.09)',
                    }}>
                    <div className="space-y-3">
                        {STEPS.map((s, i) => {
                            const isDone   = i < activeIdx || (i === activeIdx && done);
                            const isActive = i === activeIdx && !done;
                            return (
                                <motion.div key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: i > activeIdx ? 0.28 : 1 }}
                                    className="flex items-center gap-3">
                                    <AnimatePresence mode="wait">
                                        {isDone
                                            ? <motion.div key="d"
                                                initial={{ scale: 0, rotate: -90 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                            </motion.div>
                                            : isActive
                                            ? <div key="a" className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{ border: '2px solid #6366f1', background: '#eef2ff' }}>
                                                <motion.div className="w-2 h-2 rounded-full bg-indigo-500"
                                                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                                    transition={{ duration: 0.65, repeat: Infinity }} />
                                            </div>
                                            : <div key="p" className="w-6 h-6 rounded-full flex-shrink-0"
                                                style={{ background: '#f1f5f9', border: '1px solid rgba(0,0,0,0.09)' }} />
                                        }
                                    </AnimatePresence>
                                    <span className="m3-body-md font-semibold"
                                        style={{ color: isDone || isActive ? '#1e293b' : '#cbd5e1' }}>
                                        {s.emoji} {s.label}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

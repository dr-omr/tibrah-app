// components/health-engine/steps/StepAnalyzing.tsx
// THIE v2 — "Neural Fusion" — The most dramatic moment in the journey
// Neural network particles + synaptic connections + real-time step counter

'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const STEPS = [
    { label: 'قراءة الأعراض الرئيسية',       icon: '🩺', duration: 600 },
    { label: 'فحص علامات الخطر',               icon: '⚠️', duration: 550 },
    { label: 'قياس الشدة والمدة الزمنية',      icon: '📊', duration: 650 },
    { label: 'تحليل الأنماط السريرية',          icon: '🔬', duration: 700 },
    { label: 'قراءة السياق العاطفي',            icon: '🧠', duration: 750 },
    { label: 'ربط الأعراض الجسدية بالعاطفية',  icon: '💫', duration: 600 },
    { label: 'تحديد مستوى الأولوية',            icon: '🎯', duration: 500 },
    { label: 'توليد تقرير مخصص لك',             icon: '✨', duration: 600 },
];

// ── Neural canvas animation ──
function NeuralCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Nodes
        const nodes = Array.from({ length: 18 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 2 + 1,
        }));

        let frame = 0;
        let raf: number;

        const draw = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Move nodes
            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
            });

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 90) {
                        const alpha = (1 - dist / 90) * 0.3;
                        const pulse = Math.sin(frame * 0.03 + i * 0.5) * 0.5 + 0.5;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(13,148,136,${alpha * pulse})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            nodes.forEach((n, i) => {
                const pulse = Math.sin(frame * 0.04 + i) * 0.5 + 0.5;
                const color = i % 3 === 0 ? `rgba(99,102,241,${0.4 + pulse * 0.4})`
                    : i % 3 === 1 ? `rgba(13,148,136,${0.4 + pulse * 0.4})`
                    : `rgba(236,72,153,${0.25 + pulse * 0.25})`;

                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r + pulse * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            });

            raf = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60"
            style={{ mixBlendMode: 'screen' }} />
    );
}

export function StepAnalyzing() {
    const [activeIdx, setActiveIdx] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
        let idx = 0;
        const advance = () => {
            idx++;
            if (idx < STEPS.length) {
                setActiveIdx(idx);
                setTimeout(advance, STEPS[idx]?.duration ?? 600);
            } else {
                setTimeout(() => setDone(true), 400);
            }
        };
        setTimeout(advance, STEPS[0].duration);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden pt-16">
            {/* Neural background */}
            <div className="absolute inset-0">
                <NeuralCanvas />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-sm">
                {/* Central pulsing brain-core */}
                <div className="flex justify-center mb-10">
                    <div className="relative">
                        {/* Multi-layer pulse rings */}
                        {[60, 80, 104, 132].map((size, i) => (
                            <motion.div key={i}
                                className="absolute rounded-full"
                                style={{
                                    width: size, height: size,
                                    top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    border: `1px solid ${i % 2 === 0 ? 'rgba(13,148,136,' : 'rgba(99,102,241,'}${0.3 - i * 0.05})`,
                                }}
                                animate={{ scale: [1, 1 + i * 0.04, 1], opacity: [0.6, 0.1, 0.6] }}
                                transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                            />
                        ))}

                        {/* Core */}
                        <motion.div
                            animate={{ boxShadow: done ? [
                                '0 0 30px rgba(16,185,129,0.6)',
                                '0 0 60px rgba(16,185,129,0.8)',
                                '0 0 30px rgba(16,185,129,0.6)'
                            ] : [
                                '0 0 30px rgba(13,148,136,0.5)',
                                '0 0 60px rgba(99,102,241,0.5)',
                                '0 0 30px rgba(13,148,136,0.5)',
                            ] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10"
                            style={{
                                background: done
                                    ? 'linear-gradient(135deg, #059669, #10b981)'
                                    : 'linear-gradient(135deg, #0d9488, #6366f1)',
                            }}>
                            <AnimatePresence mode="wait">
                                {done ? (
                                    <motion.div key="done"
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}>
                                        <Check className="w-9 h-9 text-white" strokeWidth={3} />
                                    </motion.div>
                                ) : (
                                    <motion.span key="brain" className="text-[28px]">🧠</motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* Title */}
                <AnimatePresence mode="wait">
                    <motion.div key={done ? 'done' : 'analyzing'}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="text-center mb-8">
                        <h2 className="text-[20px] font-black text-white mb-1">
                            {done ? 'اكتمل التحليل ✓' : 'ذكاء طِبرَا يعمل...'}
                        </h2>
                        <p className="text-[11px] text-slate-500">
                            {done ? 'جاري إنشاء تقريرك الشخصي' : 'طب وظيفي + تكاملي + عاطفي'}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Steps list */}
                <div className="space-y-2.5 rounded-[24px] p-4"
                    style={{
                        background: 'rgba(15,23,42,0.6)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(16px)',
                    }}>
                    {STEPS.map((s, i) => {
                        const isDone = i < activeIdx || (i === activeIdx && done);
                        const isActive = i === activeIdx && !done;
                        const isUpcoming = i > activeIdx;
                        return (
                            <motion.div key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: isUpcoming ? 0.2 : 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3">
                                {/* Indicator */}
                                <AnimatePresence mode="wait">
                                    {isDone ? (
                                        <motion.div key="done"
                                            initial={{ scale: 0, rotate: -90 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}>
                                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                        </motion.div>
                                    ) : isActive ? (
                                        <motion.div key="active"
                                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ border: '1.5px solid #6366f1', background: 'rgba(99,102,241,0.15)' }}>
                                            <motion.div
                                                className="w-2 h-2 rounded-full bg-indigo-400"
                                                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                                                transition={{ duration: 0.7, repeat: Infinity }}
                                            />
                                        </motion.div>
                                    ) : (
                                        <div key="pending"
                                            className="w-6 h-6 rounded-full flex-shrink-0"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }} />
                                    )}
                                </AnimatePresence>
                                <span className="text-[12px] font-semibold"
                                    style={{ color: isDone || isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)' }}>
                                    {s.icon} {s.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

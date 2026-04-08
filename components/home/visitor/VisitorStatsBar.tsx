// components/home/visitor/VisitorStatsBar.tsx — Liquid Glass Light

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const G = {
    canvas: '#EFF9F7',
    glass:  'rgba(255,255,255,0.72)',
    blur:   'blur(24px) saturate(180%)',
    border: 'rgba(255,255,255,0.78)',
    borderTop: 'rgba(255,255,255,0.95)',
    shadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 6px 24px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
    accent: '#0D9488',
    ink:    '#0F172A',
    sub:    '#475569',
    muted:  '#94A3B8',
};
const SPRING = { type: 'spring' as const, stiffness: 480, damping: 34 };

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const [val, setVal] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        const t0 = performance.now();
        const run = (now: number) => {
            const p = Math.min((now - t0) / 1200, 1);
            setVal(Math.round((1 - Math.pow(1 - p, 4)) * to));
            if (p < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
    }, [inView, to]);
    return <span ref={ref}>{val}{suffix}</span>;
}

const STATS = [
    { to: 2000, suffix: '+', label: 'مريض تعافى',   icon: '🌿', delay: 0     },
    { to: 8,    suffix: '+', label: 'سنوات خبرة',   icon: '📅', delay: 0.07  },
    { to: 95,   suffix: '%', label: 'نسبة الرضا',   icon: '💚', delay: 0.14  },
    { to: 3,    suffix: '',  label: 'تخصصات طبية',  icon: '⚕️', delay: 0.21  },
];

export default function VisitorStatsBar() {
    return (
        <section dir="rtl" className="relative px-4 py-5 overflow-hidden" style={{ background: G.canvas }}>
            {/* Soft blob */}
            <div className="absolute -top-8 -left-8 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 70%)', filter: 'blur(32px)' }} />

            <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-3 relative" style={{ color: G.muted }}>
                بالأرقام
            </p>

            <div className="grid grid-cols-2 gap-2.5 relative">
                {STATS.map((s) => (
                    <motion.div key={s.label}
                        initial={{ opacity: 0, y: 14, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: s.delay, ...SPRING }}
                        className="relative rounded-[20px] p-4 overflow-hidden"
                        style={{ background: G.glass, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${G.border}`, boxShadow: G.shadow }}>

                        {/* Inner top highlight */}
                        <div className="absolute top-0 left-3 right-3 h-px pointer-events-none"
                            style={{ background: G.borderTop }} />

                        {/* Corner watermark icon */}
                        <div className="absolute -top-1 -left-1 text-[44px] opacity-[0.06] leading-none pointer-events-none">
                            {s.icon}
                        </div>

                        <p className="text-[30px] font-black tabular-nums leading-none relative" style={{ color: G.ink }}>
                            <Counter to={s.to} suffix={s.suffix} />
                        </p>
                        {/* Teal underline accent */}
                        <div className="w-5 h-[2.5px] rounded-full mt-2 mb-1.5" style={{ background: G.accent }} />
                        <p className="text-[10.5px] font-semibold relative" style={{ color: G.sub }}>{s.label}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

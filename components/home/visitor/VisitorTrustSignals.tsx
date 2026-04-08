// components/home/visitor/VisitorTrustSignals.tsx
// Minimal trust row + single testimonial — clean, not cluttered
// App-native: 3 stats in one glass row + one testimonial card

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useInView } from 'framer-motion';

const INK    = '#0F172A';
const SUB    = '#64748B';
const MUTED  = '#94A3B8';
const ACCENT = '#0D9488';
const CANVAS = '#F0FAF8';
const GLASS  = 'rgba(255,255,255,0.78)';
const BLUR   = 'blur(32px) saturate(180%)';
const BORDER = 'rgba(255,255,255,0.85)';
const SHADOW = '0 2px 0 rgba(255,255,255,1) inset, 0 8px 32px rgba(15,23,42,0.09)';
const SP     = { type: 'spring' as const, stiffness: 480, damping: 34 };

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const [val, setVal] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        const t0 = performance.now();
        const run = (now: number) => {
            const p = Math.min((now - t0) / 1100, 1);
            setVal(Math.round((1 - Math.pow(1 - p, 4)) * to));
            if (p < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
    }, [inView, to]);
    return <span ref={ref}>{val}{suffix}</span>;
}

const STATS = [
    { to: 2000, suffix: '+', label: 'مريض تعافى' },
    { to: 8,    suffix: '+', label: 'سنوات خبرة' },
    { to: 95,   suffix: '%', label: 'نسبة الرضا'  },
];

export default function VisitorTrustSignals() {
    return (
        <section dir="rtl" style={{ background: CANVAS, padding: '0 20px 32px' }}>
            {/* Stats glass row */}
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={SP}
                style={{ display: 'flex', borderRadius: 20, overflow: 'hidden', position: 'relative',
                    background: GLASS, backdropFilter: BLUR, WebkitBackdropFilter: BLUR,
                    border: `1px solid ${BORDER}`, boxShadow: SHADOW, marginBottom: 12 }}>
                {/* Top edge */}
                <div style={{ position: 'absolute', top: 0, left: 16, right: 16, height: 1,
                    background: 'rgba(255,255,255,1)', borderRadius: 99, zIndex: 1 }} />

                {STATS.map((s, i) => (
                    <div key={s.label}
                        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', padding: '20px 8px',
                            borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.60)' : 'none' }}>
                        <p style={{ fontSize: 26, fontWeight: 900, color: INK, lineHeight: 1, tabularNums: true } as React.CSSProperties}>
                            <Counter to={s.to} suffix={s.suffix} />
                        </p>
                        <div style={{ width: 18, height: 2, borderRadius: 99, background: ACCENT,
                            margin: '7px 0 6px' }} />
                        <p style={{ fontSize: 10, fontWeight: 600, color: SUB, textAlign: 'center' }}>{s.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Single testimonial */}
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.08, ...SP }}
                style={{ position: 'relative', borderRadius: 20, overflow: 'hidden',
                    background: GLASS, backdropFilter: BLUR, WebkitBackdropFilter: BLUR,
                    border: `1px solid ${BORDER}`, boxShadow: SHADOW, padding: '20px 20px 20px' }}>
                {/* Top edge */}
                <div style={{ position: 'absolute', top: 0, left: 16, right: 16, height: 1,
                    background: 'rgba(255,255,255,1)', borderRadius: 99 }} />

                {/* Stars */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                    {[1,2,3,4,5].map(s => <Star key={s} style={{ width: 13, height: 13, fill: '#FBBF24', color: '#FBBF24' }} />)}
                </div>

                <p style={{ fontSize: 13, color: SUB, lineHeight: 1.72, fontWeight: 500,
                    fontStyle: 'italic', marginBottom: 16 }}>
                    "بعد سنوات من التعب وأطباء لم يجدوا جواباً، وجدت الجواب هنا. الدكتور عمر شخّص ما لم يشخّصه أحد."
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.60)' }}>
                    <div>
                        <p style={{ fontSize: 12.5, fontWeight: 900, color: INK }}>أسماء م.</p>
                        <p style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>صنعاء · إرهاق مزمن</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                        borderRadius: 99, background: 'rgba(13,148,136,0.09)',
                        border: '1px solid rgba(13,148,136,0.14)' }}>
                        <div style={{ width: 6, height: 6, borderRadius: 99, background: ACCENT }} />
                        <span style={{ fontSize: 10, fontWeight: 800, color: ACCENT }}>
                            استعادة الطاقة في ٣ أشهر
                        </span>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}

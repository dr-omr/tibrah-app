// components/home/visitor/VisitorSuccessStories.tsx
// NEW — Patient success metrics + 3 story cards with before/after data
// Apple Health + Calm "transformation" style
// Numbers animate in on scroll, each story has a colored progress arc

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Heart, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';

const G = {
    canvas:   '#F0FAF8',
    glass:    'rgba(255,255,255,0.85)',
    blur:     'blur(24px) saturate(180%)',
    border:   'rgba(255,255,255,0.82)',
    borderTop:'rgba(255,255,255,0.98)',
    shadow:   '0 2px 0 rgba(255,255,255,1) inset, 0 8px 28px rgba(15,23,42,0.08)',
    accent:   '#0D9488',
    ink:      '#0F172A',
    sub:      '#475569',
    muted:    '#94A3B8',
};
const SP = { type: 'spring' as const, stiffness: 440, damping: 32 };

// Animated counter
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
    const [count, setCount] = React.useState(0);
    const ref = React.useRef<boolean>(false);
    React.useEffect(() => {
        if (ref.current) return;
        const observer = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !ref.current) {
                ref.current = true;
                let start = 0;
                const step = Math.ceil(value / 40);
                const id = setInterval(() => {
                    start = Math.min(start + step, value);
                    setCount(start);
                    if (start >= value) clearInterval(id);
                }, 30);
            }
        }, { threshold: 0.4 });
        const el = document.getElementById(`counter-${value}-${suffix}`);
        if (el) observer.observe(el);
        return () => observer.disconnect();
    }, [value, suffix]);
    return (
        <span id={`counter-${value}-${suffix}`}>
            {count}{suffix}
        </span>
    );
}

const METRICS = [
    { Icon: TrendingUp, value: 94,  suffix: '%', label: 'نسبة التحسن', sub: 'خلال ٣ شهور', color: G.accent },
    { Icon: Heart,      value: 430, suffix: '+', label: 'مريض متعافٍ', sub: 'حتى الآن',    color: '#6366f1' },
    { Icon: Zap,        value: 8,   suffix: '+',  label: 'سنوات خبرة',  sub: 'في الطب الوظيفي', color: '#D97706' },
];

const STORIES = [
    {
        name: 'سارة م.',
        condition: 'تعب مزمن وهرمونات',
        duration: '٤ شهور',
        improvement: 88,
        quote: 'بعد ٦ سنين ما لقيت حل — طِبرَا اكتشف في أول جلسة ما فاتت كل الأطباء',
        color: G.accent,
    },
    {
        name: 'خالد ع.',
        condition: 'نفس-جسدي وضغط',
        duration: '٣ شهور',
        improvement: 92,
        quote: 'ما كنت أعرف إن اللي أعاني منه له اسم. د. عمر شرح لي كل شيء وبنى لي بروتوكولاً',
        color: '#6366f1',
    },
    {
        name: 'منى ط.',
        condition: 'هضم والتهاب مزمن',
        duration: '٦ شهور',
        improvement: 96,
        quote: 'الفرق الأكبر أنه يسمع — ساعة كاملة اللي ما أحد استمع فيها من قبل',
        color: '#D97706',
    },
];

// Mini arc progress
function ArcProgress({ pct, color }: { pct: number; color: string }) {
    const r = 28; const circ = 2 * Math.PI * r;
    const dash = circ - (pct / 100) * circ;
    return (
        <div className="relative" style={{ width: 68, height: 68 }}>
            <svg width={68} height={68} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={34} cy={34} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={5} />
                <motion.circle cx={34} cy={34} r={r} fill="none"
                    stroke={color} strokeWidth={5} strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    whileInView={{ strokeDashoffset: dash }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[13px] font-black" style={{ color }}>{pct}%</span>
            </div>
        </div>
    );
}

export default function VisitorSuccessStories() {
    return (
        <section dir="rtl" className="relative px-4 py-8" style={{ background: G.canvas }}>

            {/* Ambient */}
            <div className="absolute top-8 right-0 w-48 h-40 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(13,148,136,0.09) 0%, transparent 70%)', filter: 'blur(40px)' }} />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} className="mb-6">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-1 h-5 rounded-full" style={{ background: G.accent }} />
                    <TrendingUp className="w-4 h-4" style={{ color: G.accent, opacity: 0.75 }} />
                    <p className="text-[10px] font-black uppercase tracking-[0.14em]"
                        style={{ color: G.accent, opacity: 0.65 }}>قصص نجاح</p>
                </div>
                <h2 className="text-[24px] font-black leading-[1.15] tracking-tight" style={{ color: G.ink }}>
                    مرضى تعافوا<br />
                    <span style={{ color: G.accent }}>مع طِبرَا</span>
                </h2>
            </motion.div>

            {/* Metrics row */}
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.06 }}
                className="flex gap-2.5 mb-6">
                {METRICS.map((m, i) => {
                    const Icon = m.Icon;
                    return (
                        <motion.div key={i}
                            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ delay: i * 0.07, ...SP }}
                            className="flex-1 relative overflow-hidden rounded-[18px] p-3.5"
                            style={{
                                background: G.glass,
                                backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
                                border: `1.5px solid ${G.border}`,
                                boxShadow: G.shadow,
                            }}>
                            <div className="absolute top-0 left-2 right-2 h-px"
                                style={{ background: G.borderTop }} />
                            <div className="w-7 h-7 rounded-[10px] flex items-center justify-center mb-2"
                                style={{ background: `${m.color}12` }}>
                                <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                            </div>
                            <p className="text-[22px] font-black tabular-nums leading-tight"
                                style={{ color: m.color }}>
                                <AnimatedNumber value={m.value} suffix={m.suffix} />
                            </p>
                            <p className="text-[10px] font-bold mt-0.5" style={{ color: G.ink }}>
                                {m.label}
                            </p>
                            <p className="text-[9px] mt-0.5" style={{ color: G.muted }}>
                                {m.sub}
                            </p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Story cards — horizontal scroll */}
            <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
                    {STORIES.map((s, i) => (
                        <motion.div key={i}
                            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ delay: i * 0.09, ...SP }}
                            className="relative overflow-hidden rounded-[22px] p-4"
                            style={{
                                width: 230,
                                background: G.glass,
                                backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
                                border: `1.5px solid ${G.border}`,
                                boxShadow: G.shadow,
                            }}>

                            {/* Top edge */}
                            <div className="absolute top-0 left-4 right-4 h-px"
                                style={{ background: G.borderTop }} />

                            {/* Glow */}
                            <div className="absolute -bottom-4 -left-4 w-20 h-20 pointer-events-none"
                                style={{ background: `radial-gradient(circle, ${s.color}18 0%, transparent 70%)`, filter: 'blur(16px)' }} />

                            {/* Header: name + arc */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-[13px] font-black" style={{ color: G.ink }}>{s.name}</p>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                                        style={{ background: `${s.color}12`, color: s.color, border: `1px solid ${s.color}20` }}>
                                        {s.condition}
                                    </span>
                                </div>
                                <ArcProgress pct={s.improvement} color={s.color} />
                            </div>

                            {/* Quote */}
                            <p className="text-[11.5px] leading-[1.68] mb-3 relative"
                                style={{ color: G.sub }}>
                                <span className="text-[18px] leading-none opacity-30 relative -top-1"
                                    style={{ color: s.color }}>«</span>
                                {s.quote}
                                <span className="text-[18px] leading-none opacity-30"
                                    style={{ color: s.color }}>»</span>
                            </p>

                            {/* Duration tag */}
                            <div className="flex items-center justify-between"
                                style={{ borderTop: '1px solid rgba(255,255,255,0.58)', paddingTop: 10 }}>
                                <span className="text-[10px] font-semibold" style={{ color: G.muted }}>
                                    مدة العلاج: {s.duration}
                                </span>
                                <span className="text-[10px] font-black" style={{ color: s.color }}>
                                    ✓ مكتمل
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* See all CTA */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="mt-5 text-center">
                <Link href={createPageUrl('BookAppointment')} onClick={() => haptic.selection()}
                    className="inline-flex items-center gap-2 text-[12px] font-black px-5 py-2.5 rounded-full no-underline"
                    style={{
                        background: G.glass, backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
                        border: `1px solid ${G.border}`, boxShadow: G.shadow,
                        color: G.accent,
                    }}>
                    ابدأ رحلتك الآن
                    <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
            </motion.div>
        </section>
    );
}

// components/care-hub/CareThreePillars.tsx
// ثلاثة أركان طِبرَا — The Three Healing Dimensions
// Unique to Tibrah: Physical + Emotional + Spiritual
// Inspired by: Integrative Medicine principles + Islamic holistic wellness
// Design: Three animated pillar cards with real-time status from user data

import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Sparkles, Star, ChevronLeft, TrendingUp } from 'lucide-react';
import { CT } from './care-tokens';
import { SPRING_BOUNCY } from '@/lib/tibrah-motion';
import Link from 'next/link';

interface PillarData {
    key:      'physical' | 'emotional' | 'spiritual';
    score:    number;    // 0-100
    status:   string;   // e.g. "البروتوكول العضوي نشط"
    action?:  string;   // CTA label
    href?:    string;
}

const PILLAR_CONFIG = {
    physical: {
        label:   'الجسد',
        emoji:   '🌿',
        sub:     'المكملات والتغذية',
        color:   CT.teal.c,
        dark:    CT.teal.dark,
        light:   CT.teal.light,
        glow:    CT.teal.glow,
        icon:    Leaf,
        verse:   '"وَعَافَانَا فِي أَبْدَانِنَا"',
        href:    '/my-care',
    },
    emotional: {
        label:   'الشعور',
        emoji:   '💫',
        sub:     'الطب النفس-جسدي',
        color:   CT.soul.c,
        dark:    CT.soul.dark,
        light:   CT.soul.light,
        glow:    CT.soul.glow,
        icon:    Sparkles,
        verse:   '"أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ"',
        href:    '/emotional-medicine',
    },
    spiritual: {
        label:   'الروح',
        emoji:   '✨',
        sub:     'الصحة الروحية والنفسية',
        color:   CT.warm.c,
        dark:    CT.warm.dark,
        light:   CT.warm.light,
        glow:    CT.warm.glow,
        icon:    Star,
        verse:   '"فَإِنَّ مَعَ الْعُسْرِ يُسْرًا"',
        href:    '/meditation',
    },
} as const;

/* ── Arc ring for each pillar ── */
function PillarArc({ score, color }: { score: number; color: string }) {
    const sz = 48; const r = 18; const circ = 2 * Math.PI * r;
    return (
        <div className="relative" style={{ width: sz, height: sz }}>
            <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={sz/2} cy={sz/2} r={r} fill="none"
                    stroke={`${color}18`} strokeWidth="4" />
                <motion.circle cx={sz/2} cy={sz/2} r={r} fill="none"
                    stroke={color} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - (score / 100) * circ }}
                    transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
                    style={{ filter: `drop-shadow(0 0 3px ${color}60)` }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[13px] font-black" style={{ color }}>
                    {score}
                </span>
            </div>
        </div>
    );
}

/* ── Single pillar card ── */
function PillarCard({ pillar, data, idx }: { pillar: typeof PILLAR_CONFIG[keyof typeof PILLAR_CONFIG]; data: PillarData; idx: number }) {
    const Icon = pillar.icon;
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, ...SPRING_BOUNCY }}>
            <Link href={pillar.href || '#'}>
                <motion.div whileTap={{ scale: 0.96 }}
                    className="relative overflow-hidden rounded-[22px] p-4 flex flex-col gap-3"
                    style={{
                        background: `linear-gradient(160deg, ${pillar.dark}F0, ${pillar.color}E8)`,
                        boxShadow: `0 8px 28px ${pillar.glow}`,
                        minHeight: 148,
                    }}>
                    {/* Background watermark */}
                    <div className="absolute top-2 left-2 opacity-[0.08] text-[70px] leading-none">{pillar.emoji}</div>

                    {/* Top row */}
                    <div className="flex items-start justify-between relative z-10">
                        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.20)' }}>
                            <Icon className="w-4 h-4 text-white" />
                        </div>
                        <PillarArc score={data.score} color="rgba(255,255,255,0.90)" />
                    </div>

                    {/* Labels */}
                    <div className="relative z-10 flex-1">
                        <p className="text-[16px] font-black text-white leading-tight">{pillar.label}</p>
                        <p className="text-[10px] text-white/65 font-medium mt-0.5">{pillar.sub}</p>
                    </div>

                    {/* Status */}
                    <div className="relative z-10">
                        <p className="text-[10px] text-white/80 font-semibold">{data.status}</p>
                    </div>

                    {/* Quranic verse */}
                    <div className="relative z-10 border-t border-white/20 pt-2">
                        <p className="text-[9px] text-white/50 font-medium leading-relaxed">{pillar.verse}</p>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}

/* ── Integrated score summary ── */
function HolisticScoreBar({ data }: { data: PillarData[] }) {
    const avg = Math.round(data.reduce((a, b) => a + b.score, 0) / data.length);
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-[18px]"
            style={{ background: 'rgba(0,0,0,0.04)', border: '1.5px solid rgba(0,0,0,0.06)' }}>
            <TrendingUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex-1">
                <p className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">الصحة الشمولية المتكاملة</p>
                <div className="flex gap-1 h-1.5">
                    {data.map(d => {
                        const cfg = PILLAR_CONFIG[d.key];
                        return (
                            <motion.div key={d.key}
                                className="rounded-full"
                                style={{ flex: d.score, background: cfg.color }}
                                initial={{ width: 0 }} animate={{ width: 'auto' }}
                                transition={{ duration: 0.8, delay: 0.4 }} />
                        );
                    })}
                </div>
            </div>
            <span className="text-[16px] font-black text-slate-700">{avg}%</span>
        </div>
    );
}

/* ════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════ */
const DEFAULT_PILLARS: PillarData[] = [
    { key: 'physical',  score: 72, status: 'البروتوكول العضوي نشط',       href: '/my-care' },
    { key: 'emotional', score: 58, status: 'جلسة شعورية مجدولة',          href: '/emotional-medicine' },
    { key: 'spiritual', score: 85, status: 'التأمل والإيمان بخير',         href: '/meditation' },
];

export function CareThreePillars({ pillars = DEFAULT_PILLARS }: { pillars?: PillarData[] }) {
    return (
        <div className="space-y-3">
            {/* Section label */}
            <div className="flex items-center gap-2 px-1">
                <span className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                    أركان الصحة الثلاثة
                </span>
                <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Integrated bar */}
            <HolisticScoreBar data={pillars} />

            {/* Pillar cards */}
            <div className="grid grid-cols-3 gap-2.5">
                {pillars.map((pillar, i) => (
                    <PillarCard
                        key={pillar.key}
                        pillar={PILLAR_CONFIG[pillar.key]}
                        data={pillar}
                        idx={i}
                    />
                ))}
            </div>
        </div>
    );
}

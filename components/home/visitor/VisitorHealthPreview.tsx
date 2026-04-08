// components/home/visitor/VisitorHealthPreview.tsx
// Locked health dashboard preview — creates desire to register
// Inspired by: Apple Fitness+ locked previews · Oura Ring score reveal
// Shows a blurred-but-recognizable version of the health score + vitals
// with a glass overlay and "سجّل لترى درجتك" CTA

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, HeartPulse, Droplets, Flame, TrendingUp } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';

const G = {
    canvas:    '#EFF9F7',
    glass:     'rgba(255,255,255,0.72)',
    blur:      'blur(24px) saturate(180%)',
    border:    'rgba(255,255,255,0.78)',
    borderTop: 'rgba(255,255,255,0.95)',
    shadow:    '0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 28px rgba(0,0,0,0.07)',
    accent:    '#0D9488',
    ink:       '#0F172A',
    sub:       '#475569',
    muted:     '#94A3B8',
};
const SPRING = { type: 'spring' as const, stiffness: 480, damping: 34 };

// Fake vitals (blurred out) to show the richness of what awaits
const FAKE_VITALS = [
    { icon: HeartPulse, label: 'النبض',   value: '72',  unit: 'bpm',  color: '#E11D48' },
    { icon: Droplets,   label: 'الماء',    value: '6/8', unit: 'أكواب', color: '#2563EB' },
    { icon: Flame,      label: 'السلسلة',  value: '14',  unit: 'يوم',  color: '#EA580C' },
    { icon: TrendingUp, label: 'التقدم',   value: '78',  unit: '%',    color: '#16A34A' },
];

export default function VisitorHealthPreview() {
    return (
        <section dir="rtl" className="relative px-4 py-5 overflow-hidden" style={{ background: G.canvas }}>
            {/* Ambient */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(13,148,136,0.10) 0%, transparent 70%)', filter: 'blur(36px)' }} />

            <div className="mb-4 relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: G.muted }}>لوحة صحتك</p>
                <h2 className="text-[22px] font-black" style={{ color: G.ink }}>ماذا سترى بعد التسجيل؟</h2>
                <p className="text-[12px] mt-1" style={{ color: G.muted }}>درجتك الصحية · أهدافك · خطتك العلاجية</p>
            </div>

            {/* Preview container */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={SPRING}
                className="relative rounded-[24px] overflow-hidden"
                style={{ background: G.glass, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${G.border}`, boxShadow: G.shadow }}>

                {/* Top edge */}
                <div className="absolute top-0 left-5 right-5 h-px z-10" style={{ background: G.borderTop }} />

                {/* Blurred content layer */}
                <div className="p-5 select-none" style={{ filter: 'blur(6px) brightness(0.98)', pointerEvents: 'none' }}>
                    {/* Fake score ring area */}
                    <div className="flex flex-col items-center py-3 mb-4">
                        <div className="relative w-28 h-28">
                            <svg width={112} height={112} style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx={56} cy={56} r={44} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
                                <circle cx={56} cy={56} r={44} fill="none"
                                    stroke={G.accent} strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={276.5}
                                    strokeDashoffset={62}
                                    style={{ filter: `drop-shadow(0 0 4px ${G.accent}50)` }} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[38px] font-black leading-none" style={{ color: G.accent }}>78</span>
                                <span className="text-[10px] text-slate-400 mt-0.5">درجة الصحة</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full"
                            style={{ background: `${G.accent}12`, border: `1px solid ${G.accent}22` }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.accent }} />
                            <span className="text-[10px] font-black" style={{ color: G.accent }}>جيد جداً</span>
                        </div>
                    </div>

                    {/* Fake vitals grid */}
                    <div className="grid grid-cols-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                        {FAKE_VITALS.map((v) => {
                            const Icon = v.icon;
                            return (
                                <div key={v.label} className="flex flex-col items-center py-3 gap-1">
                                    <Icon className="w-4 h-4" style={{ color: v.color }} />
                                    <span className="text-[14px] font-black tabular-nums" style={{ color: G.ink }}>{v.value}</span>
                                    <span className="text-[8px] text-slate-400">{v.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Glass lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20"
                    style={{ background: 'rgba(239,249,247,0.60)', backdropFilter: 'blur(2px)' }}>

                    {/* Lock icon with glass container */}
                    <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative rounded-[20px] p-4 mb-4"
                        style={{ background: G.glass, backdropFilter: 'blur(20px)', border: `1px solid ${G.border}`, boxShadow: G.shadow }}>
                        <div className="absolute top-0 left-3 right-3 h-px" style={{ background: G.borderTop }} />
                        <Lock className="w-7 h-7" style={{ color: G.ink }} />
                    </motion.div>

                    <p className="text-[15px] font-black text-center mb-1" style={{ color: G.ink }}>
                        درجتك الصحية تنتظرك
                    </p>
                    <p className="text-[11px] text-center mb-4" style={{ color: G.sub }}>
                        سجّل مجاناً لترى لوحتك الصحية الكاملة
                    </p>

                    <Link href={createPageUrl('Register')} onClick={() => haptic.impact()}>
                        <motion.div whileTap={{ scale: 0.96, transition: SPRING }}
                            className="flex items-center gap-2.5 px-5 py-3 rounded-full"
                            style={{ background: G.ink, boxShadow: '0 4px 16px rgba(15,23,42,0.25)' }}>
                            <span className="text-[13px] font-black text-white">ابدأ مجاناً</span>
                            <ArrowLeft className="w-4 h-4 text-white/60" />
                        </motion.div>
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}

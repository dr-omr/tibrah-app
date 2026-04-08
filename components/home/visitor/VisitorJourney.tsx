// components/home/visitor/VisitorJourney.tsx — Liquid Glass Light

import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Brain, Calendar, Stethoscope, TrendingUp } from 'lucide-react';

const G = {
    canvas:    '#EFF9F7',
    glass:     'rgba(255,255,255,0.72)',
    blur:      'blur(24px) saturate(180%)',
    border:    'rgba(255,255,255,0.78)',
    borderTop: 'rgba(255,255,255,0.95)',
    shadow:    '0 1px 0 rgba(255,255,255,0.95) inset, 0 6px 20px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
    accent:    '#0D9488',
    accentSoft:'rgba(13,148,136,0.09)',
    ink:       '#0F172A',
    sub:       '#475569',
    muted:     '#94A3B8',
};
const SPRING = { type: 'spring' as const, stiffness: 480, damping: 34 };

const STEPS = [
    { num: '١', label: 'الإنصات',    sub: 'نسمع قصتك',       icon: HeartPulse },
    { num: '٢', label: 'التشخيص',    sub: 'تحليل جذري',      icon: Brain },
    { num: '٣', label: 'الحجز',      sub: 'جلسة مخصصة',     icon: Calendar },
    { num: '٤', label: 'البروتوكول', sub: 'خطة علاجية',      icon: Stethoscope },
    { num: '٥', label: 'التشافي',    sub: 'متابعة دائمة',    icon: TrendingUp },
];

export default function VisitorJourney() {
    return (
        <section dir="rtl" className="relative overflow-hidden py-5" style={{ background: G.canvas }}>
            {/* Ambient blob */}
            <div className="absolute bottom-0 left-0 w-56 h-32 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(13,148,136,0.08) 0%, transparent 70%)', filter: 'blur(36px)' }} />

            <div className="px-4 mb-5 relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: G.muted }}>رحلتك معنا</p>
                <h2 className="text-[22px] font-black" style={{ color: G.ink }}>من أول خطوة للتشافي</h2>
            </div>

            {/* Scrollable steps */}
            <div className="overflow-x-auto pb-2 relative" style={{ scrollbarWidth: 'none' }}>
                <div className="flex items-start px-4 min-w-max">
                    {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.label} className="flex items-start">
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08, ...SPRING }}
                                    className="flex flex-col items-center" style={{ width: 80 }}>

                                    {/* Glass circle */}
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.08 + 0.10, type: 'spring', stiffness: 420, damping: 22 }}
                                        className="relative w-14 h-14 rounded-full flex items-center justify-center"
                                        style={{ background: G.glass, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1.5px solid ${G.border}`, boxShadow: G.shadow }}>
                                        {/* Top highlight */}
                                        <div className="absolute top-0 left-2 right-2 h-px" style={{ background: G.borderTop }} />
                                        <Icon className="w-5 h-5" style={{ color: G.accent }} />
                                        {/* Number badge */}
                                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                                            style={{ background: G.ink, boxShadow: '0 1px 4px rgba(0,0,0,0.20)' }}>
                                            {step.num}
                                        </div>
                                    </motion.div>

                                    <p className="text-[11.5px] font-black text-center mt-2.5" style={{ color: G.ink }}>{step.label}</p>
                                    <p className="text-[9px] font-medium text-center mt-0.5 leading-tight" style={{ color: G.muted }}>{step.sub}</p>
                                </motion.div>

                                {/* Connector */}
                                {i < STEPS.length - 1 && (
                                    <div className="flex items-center" style={{ width: 12, marginTop: 26 }}>
                                        <motion.div className="h-px w-full"
                                            initial={{ scaleX: 0 }}
                                            whileInView={{ scaleX: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.08 + 0.14, duration: 0.5, ease: 'easeOut' }}
                                            style={{ background: `linear-gradient(to left, ${G.accent}20, ${G.accent}50, ${G.accent}20)`, transformOrigin: 'right' }} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Doctor quote — glass card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, ...SPRING }}
                className="mx-4 mt-5 relative rounded-[20px] overflow-hidden p-4"
                style={{ background: G.glass, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${G.border}`, boxShadow: G.shadow }}>
                {/* Top edge */}
                <div className="absolute top-0 left-4 right-4 h-px" style={{ background: G.borderTop }} />
                {/* Large quote mark */}
                <div className="absolute top-2 left-4 text-[52px] font-serif leading-none pointer-events-none"
                    style={{ color: `${G.accent}12` }}>"</div>
                <p className="text-[12px] leading-[1.7] font-medium relative" style={{ color: G.sub }}>
                    "كل مريض يصل إلينا يبدأ رحلة — ليس فقط رحلة علاج، بل رحلة فهم جذور ما يعيشه وما يشعر به"
                </p>
                <div className="flex items-center gap-2 mt-3">
                    <div className="w-0.5 h-5 rounded-full" style={{ background: G.accent }} />
                    <p className="text-[10px] font-black" style={{ color: G.accent }}>د. عمر العماد</p>
                    <p className="text-[9px]" style={{ color: G.muted }}>— استشاري الطب الوظيفي</p>
                </div>
            </motion.div>
        </section>
    );
}

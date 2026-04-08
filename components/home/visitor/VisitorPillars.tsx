// components/home/visitor/VisitorPillars.tsx — Liquid Glass Light

import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Brain, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { haptic } from '@/lib/HapticFeedback';

const G = {
    canvas:     '#EFF9F7',
    glass:      'rgba(255,255,255,0.72)',
    blur:       'blur(24px) saturate(180%)',
    border:     'rgba(255,255,255,0.78)',
    borderTop:  'rgba(255,255,255,0.95)',
    shadow:     '0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 28px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04)',
    accent:     '#0D9488',
    accentSoft: 'rgba(13,148,136,0.09)',
    ink:        '#0F172A',
    sub:        '#475569',
    muted:      '#94A3B8',
};
const SPRING = { type: 'spring' as const, stiffness: 480, damping: 34 };

const PILLARS = [
    {
        icon: HeartPulse, num: '01',
        title: 'الركيزة الجسدية',
        sub: 'الجسم كنظام متكامل',
        desc: 'تحليل شامل للجينوم الغذائي والمكملات والهرمونات واكتشاف الجذور العضوية للمرض قبل ظهور الأعراض.',
        tags: ['التغذية الوظيفية', 'المكملات المخصصة', 'الهرمونات', 'جينوم غذائي'],
        blob: 'rgba(13,148,136,0.10)',
        href: '/services',
    },
    {
        icon: Brain, num: '02',
        title: 'الركيزة النفسية',
        sub: 'العقل يصنع المرض ويصنع الشفاء',
        desc: 'استكشاف الروابط بين المشاعر المكبوتة والأمراض الجسدية عبر نهج النفس-جسدي لعلاج الجذور الحقيقية.',
        tags: ['نمط شعوري مخصص', 'علاج جذري', 'استقرار عاطفي'],
        blob: 'rgba(109,74,255,0.07)',
        href: '/emotional-medicine',
    },
    {
        icon: Sparkles, num: '03',
        title: 'الركيزة الروحية',
        sub: 'السكينة — أساس الشفاء',
        desc: 'دمج الاطمئنان القلبي والتأمل والإيمان في خطة العلاج الشمولية كمحرك أساسي وحقيقي للتعافي.',
        tags: ['التأمل العلاجي', 'الطب الشمولي', 'الاتزان الداخلي'],
        blob: 'rgba(217,119,6,0.07)',
        href: '/meditation',
    },
];

export default function VisitorPillars() {
    return (
        <section dir="rtl" className="relative px-4 py-5 overflow-hidden" style={{ background: G.canvas }}>
            {/* Ambient blob */}
            <div className="absolute top-10 right-0 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)', filter: 'blur(48px)' }} />

            <div className="relative mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: G.muted }}>نهج العلاج</p>
                <h2 className="text-[22px] font-black leading-tight" style={{ color: G.ink }}>الأركان الثلاثة للشفاء</h2>
                <p className="text-[12px] mt-1" style={{ color: G.muted }}>كل ركيزة تغذّي الأخرى في منظومة علاج واحدة</p>
            </div>

            <div className="space-y-3 relative">
                {PILLARS.map((p, i) => {
                    const Icon = p.icon;
                    return (
                        <motion.div key={p.title}
                            initial={{ opacity: 0, y: 16, scale: 0.97 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: '-20px' }}
                            transition={{ delay: i * 0.09, ...SPRING }}>
                            <Link href={p.href} onClick={() => haptic.selection()}>
                                <motion.div whileTap={{ scale: 0.974, transition: SPRING }}
                                    className="relative rounded-[24px] p-5 overflow-hidden"
                                    style={{ background: G.glass, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${G.border}`, boxShadow: G.shadow }}>

                                    {/* Inner top edge */}
                                    <div className="absolute top-0 left-5 right-5 h-px pointer-events-none"
                                        style={{ background: G.borderTop }} />

                                    {/* Ambient colour per pillar */}
                                    <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full pointer-events-none"
                                        style={{ background: `radial-gradient(circle, ${p.blob} 0%, transparent 70%)`, filter: 'blur(28px)' }} />

                                    <div className="relative">
                                        {/* Header row */}
                                        <div className="flex items-start justify-between mb-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center"
                                                    style={{ background: G.accentSoft, border: '1px solid rgba(13,148,136,0.12)' }}>
                                                    <Icon className="w-5 h-5" style={{ color: G.accent }} />
                                                </div>
                                                <span className="text-[22px] font-black tabular-nums"
                                                    style={{ color: 'rgba(13,148,136,0.18)', letterSpacing: '-0.02em' }}>
                                                    {p.num}
                                                </span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                                style={{ background: G.accentSoft }}>
                                                <ArrowLeft className="w-3.5 h-3.5" style={{ color: G.accent + '90' }} />
                                            </div>
                                        </div>

                                        <h3 className="text-[17px] font-black mb-0.5" style={{ color: G.ink }}>{p.title}</h3>
                                        <p className="text-[11px] font-bold mb-2.5" style={{ color: G.accent }}>{p.sub}</p>
                                        <p className="text-[12px] leading-relaxed mb-3.5" style={{ color: G.sub }}>{p.desc}</p>

                                        {/* Glass tag chips */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {p.tags.map(t => (
                                                <span key={t} className="text-[9.5px] font-semibold px-2.5 py-1 rounded-full"
                                                    style={{ background: 'rgba(255,255,255,0.60)', color: G.sub, border: '1px solid rgba(255,255,255,0.80)', backdropFilter: 'blur(8px)' }}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}

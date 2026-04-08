// components/home/visitor/VisitorServicesScroll.tsx
// Horizontal App Store-style service cards
// Each card: glass · icon · service name · price · arrow

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Stethoscope, Brain, FlaskConical, HeartPulse, Leaf, Microscope } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';

const G = {
    canvas:  '#EFF9F7',
    glass:   'rgba(255,255,255,0.72)',
    blur:    'blur(24px) saturate(180%)',
    border:  'rgba(255,255,255,0.78)',
    borderTop:'rgba(255,255,255,0.95)',
    shadow:  '0 1px 0 rgba(255,255,255,0.95) inset, 0 6px 20px rgba(0,0,0,0.07)',
    accent:  '#0D9488',
    ink:     '#0F172A',
    sub:     '#475569',
    muted:   '#94A3B8',
};
const SPRING = { type: 'spring' as const, stiffness: 480, damping: 34 };

const SERVICES = [
    {
        icon: Stethoscope,
        title: 'استشارة تشخيصية',
        sub: 'جلسة شاملة ٦٠ دقيقة',
        price: 'ابدأ من ٥٠$',
        href: '/services/consultation',
        blob: 'rgba(13,148,136,0.10)',
    },
    {
        icon: Brain,
        title: 'جلسة النفس-جسدي',
        sub: 'تحليل عاطفي وجسدي',
        price: 'ابدأ من ٤٥$',
        href: '/services/emotional',
        blob: 'rgba(109,74,255,0.08)',
    },
    {
        icon: FlaskConical,
        title: 'تحليل مخصص',
        sub: 'فحوصات وظيفية متقدمة',
        price: 'ابدأ من ٨٠$',
        href: '/services/labs',
        blob: 'rgba(56,189,248,0.09)',
    },
    {
        icon: HeartPulse,
        title: 'بروتوكول علاجي',
        sub: 'خطة كاملة ٣ أشهر',
        price: 'ابدأ من ١٢٠$',
        href: '/services/protocol',
        blob: 'rgba(232,128,58,0.08)',
    },
    {
        icon: Leaf,
        title: 'علاج تغذوي',
        sub: 'تغذية وظيفية مخصصة',
        price: 'ابدأ من ٣٥$',
        href: '/services/nutrition',
        blob: 'rgba(22,163,74,0.09)',
    },
    {
        icon: Microscope,
        title: 'فحص الجينوم',
        sub: 'تحليل جيني غذائي',
        price: 'ابدأ من ١٥٠$',
        href: '/services/genomics',
        blob: 'rgba(217,119,6,0.08)',
    },
];

export default function VisitorServicesScroll() {
    return (
        <section dir="rtl" className="relative py-5 overflow-hidden" style={{ background: G.canvas }}>
            {/* Ambient */}
            <div className="absolute top-0 right-0 w-48 h-32 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(13,148,136,0.08) 0%, transparent 70%)', filter: 'blur(32px)' }} />

            <div className="px-4 mb-4 flex items-end justify-between relative">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: G.muted }}>خدماتنا</p>
                    <h2 className="text-[22px] font-black" style={{ color: G.ink }}>كيف نخدمك</h2>
                </div>
                <Link href="/services" className="text-[11px] font-bold" style={{ color: G.accent }}>
                    الكل ←
                </Link>
            </div>

            {/* Horizontal scroll */}
            <div className="overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
                <div className="flex gap-3 px-4" style={{ width: 'max-content' }}>
                    {SERVICES.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.div key={s.title}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: '-20px' }}
                                transition={{ delay: i * 0.06, ...SPRING }}>
                                <Link href={s.href} onClick={() => haptic.selection()}>
                                    <motion.div whileTap={{ scale: 0.96, transition: SPRING }}
                                        className="relative flex flex-col rounded-[22px] p-4 overflow-hidden"
                                        style={{ width: 152, background: G.glass, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${G.border}`, boxShadow: G.shadow }}>

                                        {/* Top edge */}
                                        <div className="absolute top-0 left-3 right-3 h-px" style={{ background: G.borderTop }} />

                                        {/* Blob background */}
                                        <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full pointer-events-none"
                                            style={{ background: `radial-gradient(circle, ${s.blob} 0%, transparent 70%)`, filter: 'blur(16px)' }} />

                                        {/* Icon */}
                                        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-3 relative"
                                            style={{ background: 'rgba(13,148,136,0.09)', border: '1px solid rgba(13,148,136,0.12)' }}>
                                            <Icon className="w-5 h-5" style={{ color: G.accent }} />
                                        </div>

                                        {/* Text */}
                                        <p className="text-[13px] font-black leading-tight mb-1 relative" style={{ color: G.ink }}>{s.title}</p>
                                        <p className="text-[9.5px] mb-3 relative" style={{ color: G.muted }}>{s.sub}</p>

                                        {/* Price */}
                                        <div className="flex items-center justify-between mt-auto relative">
                                            <span className="text-[10px] font-black" style={{ color: G.accent }}>{s.price}</span>
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center"
                                                style={{ background: 'rgba(13,148,136,0.10)' }}>
                                                <span className="text-[10px]" style={{ color: G.accent }}>←</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

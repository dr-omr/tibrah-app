// components/home/visitor/VisitorFinalCTA.tsx — Liquid Glass Light

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, MessageCircle, Shield, Globe } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';

const G = {
    canvas:    '#EFF9F7',
    glass:     'rgba(255,255,255,0.72)',
    blur:      'blur(24px) saturate(180%)',
    border:    'rgba(255,255,255,0.78)',
    borderTop: 'rgba(255,255,255,0.95)',
    shadow:    '0 1px 0 rgba(255,255,255,0.95) inset, 0 12px 40px rgba(0,0,0,0.09), 0 3px 8px rgba(0,0,0,0.05)',
    accent:    '#0D9488',
    accentSoft:'rgba(13,148,136,0.09)',
    ink:       '#0F172A',
    sub:       '#475569',
    muted:     '#94A3B8',
};
const SPRING = { type: 'spring' as const, stiffness: 480, damping: 34 };

export default function VisitorFinalCTA() {
    return (
        <section dir="rtl" className="relative px-4 pb-12 pt-2 overflow-hidden" style={{ background: G.canvas }}>
            {/* Large ambient blob */}
            <div className="absolute inset-x-0 -bottom-20 h-64 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(13,148,136,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />

            {/* Main glass CTA block */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={SPRING}
                className="relative rounded-[28px] overflow-hidden"
                style={{ background: G.ink, boxShadow: '0 16px 56px rgba(15,23,42,0.22), 0 4px 12px rgba(0,0,0,0.10)' }}>

                {/* Teal glow inside dark */}
                <div className="absolute top-0 right-0 w-48 h-32 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(13,148,136,0.22) 0%, transparent 70%)', filter: 'blur(28px)' }} />
                {/* Bottom left glow */}
                <div className="absolute bottom-0 left-0 w-32 h-24 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(13,148,136,0.15) 0%, transparent 70%)', filter: 'blur(24px)' }} />

                {/* Subtle white grid on dark */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
                    style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

                <div className="relative p-6">
                    <div className="w-8 h-0.5 rounded-full mb-5" style={{ background: G.accent }} />
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        ابدأ الآن
                    </p>
                    <h2 className="text-[26px] font-black text-white leading-tight mb-3">
                        ابدأ رحلتك نحو<br />
                        <span style={{ color: '#5EEAD4' }}>الشفاء الحقيقي</span>
                    </h2>
                    <p className="text-[12.5px] leading-[1.65] mb-7" style={{ color: 'rgba(255,255,255,0.50)' }}>
                        أول خطوة في التعافي تبدأ بجلسة واحدة — طبيبك ينتظرك الآن
                    </p>

                    <div className="flex flex-col gap-2.5">
                        {/* Primary — teal */}
                        <Link href={createPageUrl('BookAppointment')} onClick={() => haptic.impact()}>
                            <motion.div whileTap={{ scale: 0.968, transition: SPRING }}
                                className="relative overflow-hidden flex items-center gap-3.5 px-5 py-4 rounded-[18px]"
                                style={{ background: G.accent, boxShadow: `0 6px 24px rgba(13,148,136,0.45)` }}>
                                {/* Shimmer */}
                                <motion.div className="absolute inset-y-0 w-16 pointer-events-none"
                                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)', skewX: -20 }}
                                    animate={{ left: ['-64px', '120%'] }}
                                    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3 }} />
                                <div className="w-9 h-9 rounded-[12px] bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                                </div>
                                <div className="flex-1 relative">
                                    <p className="text-[15px] font-black text-white">احجز جلستك الآن</p>
                                    <p className="text-[10px] text-white/60 mt-0.5">استشارة تشخيصية شاملة</p>
                                </div>
                                <ArrowLeft className="w-4 h-4 text-white/50 flex-shrink-0 relative" />
                            </motion.div>
                        </Link>

                        {/* Secondary — glass outline on dark */}
                        <a href="https://wa.me/967771447111" target="_blank" rel="noopener noreferrer"
                            onClick={() => haptic.selection()}>
                            <motion.div whileTap={{ scale: 0.968, transition: SPRING }}
                                className="flex items-center justify-center gap-2.5 py-3.5 rounded-[18px]"
                                style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                <MessageCircle className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.55)' }} />
                                <span className="text-[13px] font-bold" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                    تواصل عبر واتساب أولاً
                                </span>
                            </motion.div>
                        </a>
                    </div>

                    <p className="text-center text-[9px] mt-4" style={{ color: 'rgba(255,255,255,0.22)' }}>
                        لا حاجة لتسجيل مسبق · ردٌ خلال ساعات
                    </p>
                </div>
            </motion.div>

            {/* HIPAA badge — glass, same as login */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="flex flex-col items-center gap-2 mt-5">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', border: `1px solid ${G.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <motion.div className="w-1.5 h-1.5 rounded-full"
                        style={{ background: G.accent }}
                        animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <span className="text-[8px] font-bold uppercase tracking-[0.20em]" style={{ color: G.muted }}>
                        SECURED · HIPAA · TIBRAH VAULT
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Globe className="w-2.5 h-2.5" style={{ color: '#C4CDD5' }} />
                    <span className="text-[8px] font-medium" style={{ color: '#C4CDD5' }}>اليمن والعالم العربي</span>
                </div>
            </motion.div>

            <p className="text-center text-[9px] mt-3 px-4 leading-relaxed" style={{ color: G.muted }}>
                طِبرَا — منصة رعاية صحية متكاملة. المحتوى تثقيفي ولا يُغني عن الاستشارة الطبية.
            </p>
        </section>
    );
}

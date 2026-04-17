// components/home/visitor/VisitorHeroSection.tsx — "Liquid Glass Hero V8"
// Doctor photo as atmospheric watercolor background — Apple WWDC meets Spotify artist page
// Layers (bottom→top):
//   1. Canvas #F0FAF8
//   2. Doctor photo — full cover, 32% opacity, teal-tinted
//   3. Watercolor dissolve gradient — fades photo into canvas at bottom
//   4. Animated teal blobs
//   5. Content z-10 (glass cards over the photo)

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowLeft, HeartPulse, Shield, MessageCircle, Star } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';

const DOCTOR_PHOTO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69287e726ff0e068617e81b7/9185440e5_omar.jpg';

// ── Design constants ────────────────────────────────────────
const G = {
    canvas: '#F0FAF8',
    glass: 'rgba(255,255,255,0.72)',
    glassHvy: 'rgba(255,255,255,0.88)',
    blur: 'blur(28px) saturate(180%)',
    blurHvy: 'blur(36px) saturate(200%)',
    borderTop: 'rgba(255,255,255,0.95)',
    border: 'rgba(255,255,255,0.80)',
    shadow: '0 2px 0 rgba(255,255,255,1) inset, 0 8px 32px rgba(15,23,42,0.08)',
    shadowLg: '0 2px 0 rgba(255,255,255,1) inset, 0 16px 48px rgba(15,23,42,0.11), 0 4px 12px rgba(0,0,0,0.06)',
    accent: '#0D9488',
    accentSoft: 'rgba(13,148,136,0.10)',
    ink: '#0F172A',
    sub: '#475569',
    muted: '#94A3B8',
};
const SP = { type: 'spring' as const, stiffness: 500, damping: 34 };

// ── Rotating specialties ────────────────────────────────────
const SPECS = ['الطب الوظيفي', 'الطب النفس-جسدي', 'الطب الشمولي', 'العلاج الجذري'];
function RotatingSpec() {
    const [i, setI] = useState(0);
    const [v, setV] = useState(true);
    useEffect(() => {
        const id = setInterval(() => {
            setV(false);
            setTimeout(() => { setI(x => (x + 1) % SPECS.length); setV(true); }, 320);
        }, 2800);
        return () => clearInterval(id);
    }, []);
    return (
        <AnimatePresence mode="wait">
            <motion.span key={i}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: v ? 1 : 0, y: v ? 0 : -8, filter: v ? 'blur(0px)' : 'blur(4px)' }}
                transition={{ duration: 0.32 }}
                style={{ color: G.accent }}
                className="block">
                {SPECS[i]}
            </motion.span>
        </AnimatePresence>
    );
}

export default function VisitorHeroSection() {
    return (
        <section dir="rtl" className="relative overflow-hidden"
            style={{ background: G.canvas, minHeight: 660 }}>

            {/* ══════════════════════════════════════════════════
                LAYER 1 — Doctor photo as watercolor atmosphere
                Full cover · 30% opacity · teal saturation boost
                ══════════════════════════════════════════════════ */}
            <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
                <Image
                    src={DOCTOR_PHOTO}
                    alt=""
                    fill
                    priority
                    unoptimized
                    style={{
                        objectFit: 'cover',
                        objectPosition: '50% 8%',
                        opacity: 0.62,
                        filter: 'brightness(1.06) saturate(0.92) contrast(1.10)',
                    }}
                />

                {/* Subtle teal tint — brand colour wash without masking the face */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse at 65% 10%, rgba(13,148,136,0.10) 0%, transparent 60%)',
                }} />

                {/* Right-side text protection — content is on the right in RTL */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to right, rgba(240,250,248,0.00) 0%, rgba(240,250,248,0.48) 62%, rgba(240,250,248,0.82) 100%)',
                }} />

                {/* Bottom dissolve — photo melts gracefully into canvas */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(to bottom,
                        rgba(240,250,248,0.00) 0%,
                        rgba(240,250,248,0.00) 40%,
                        rgba(240,250,248,0.50) 62%,
                        rgba(240,250,248,0.90) 80%,
                        rgba(240,250,248,1.00) 100%
                    )`,
                }} />

                {/* Top edge fade */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 72,
                    background: 'linear-gradient(to bottom, rgba(240,250,248,0.55) 0%, transparent 100%)',
                }} />
            </div>

            {/* ══════════════════════════════════════════════════
                LAYER 2 — Animated watercolor blobs (on top of photo)
                ══════════════════════════════════════════════════ */}
            <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden" aria-hidden>
                <motion.div style={{
                    position: 'absolute', width: 380, height: 300, top: -60, right: -60,
                    background: 'radial-gradient(ellipse, rgba(13,148,136,0.16) 0%, transparent 68%)',
                    filter: 'blur(56px)', borderRadius: '50%',
                }}
                    animate={{ x: [0, 14, -8, 0], y: [0, -10, 5, 0], scale: [1, 1.06, 0.97, 1] }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />

                <motion.div style={{
                    position: 'absolute', width: 260, height: 240, top: 220, left: -30,
                    background: 'radial-gradient(ellipse, rgba(20,184,166,0.12) 0%, transparent 68%)',
                    filter: 'blur(44px)', borderRadius: '50%',
                }}
                    animate={{ x: [0, -10, 6, 0], y: [0, 12, -5, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
            </div>

            {/* ══════════════════════════════════════════════════
                LAYER 3 — Content
                ══════════════════════════════════════════════════ */}
            <div className="relative z-10 flex flex-col gap-5 px-5 pt-14 pb-8">

                {/* ── Top bar: wordmark + live badge ─── */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between">

                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-[13px] flex items-center justify-center"
                            style={{ background: G.ink, boxShadow: '0 4px 16px rgba(15,23,42,0.26)' }}>
                            <span className="text-white font-black text-[15px] leading-none">ط</span>
                        </div>
                        <div>
                            <p className="text-[17px] font-black leading-none" style={{ color: G.ink }}>طِبرَا</p>
                            <p className="text-[7.5px] font-bold uppercase tracking-[0.20em] mt-0.5" style={{ color: G.muted }}>
                                Functional Medicine
                            </p>
                        </div>
                    </div>

                    {/* Live pill */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                            background: G.glassHvy, backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
                            border: `1px solid ${G.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}>
                        <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }}
                            animate={{ scale: [1, 1.7, 1], opacity: [1, 0.4, 1] }}
                            transition={{ duration: 2, repeat: Infinity }} />
                        <span className="text-[9.5px] font-bold" style={{ color: G.sub }}>الطبيب متاح</span>
                    </div>
                </motion.div>

                {/* ── Headline — reads over the watercolor photo ── */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-2.5"
                        style={{ color: G.accent }}>رعاية طبية متكاملة</p>
                    <h1 className="text-[40px] font-black leading-[1.08] tracking-[-0.02em]"
                        style={{ color: G.ink }}>
                        ابدأ رحلتك<br />
                        <RotatingSpec />
                    </h1>
                    <p className="text-[13px] leading-[1.68] mt-3"
                        style={{ color: G.sub, maxWidth: 290 }}>
                        تقييم حالتك · خطة واضحة · متابعة حقيقية — من الأعراض إلى التعافي
                    </p>
                </motion.div>

                {/* ── Doctor identity card — glass over photo ── */}
                <motion.div initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.16, ...SP }}>
                    <div className="relative rounded-[22px] overflow-hidden"
                        style={{
                            background: G.glassHvy, backdropFilter: G.blurHvy,
                            WebkitBackdropFilter: G.blurHvy, border: `1px solid ${G.border}`,
                            boxShadow: G.shadowLg
                        }}>

                        {/* Top Fluent reflection */}
                        <div className="absolute top-0 left-5 right-5 h-px"
                            style={{ background: G.borderTop }} />

                        <div className="flex items-center gap-3.5 p-4">
                            {/* Circular photo — small, thumbnail quality */}
                            <div className="relative flex-shrink-0">
                                <div className="w-14 h-14 rounded-full overflow-hidden"
                                    style={{
                                        boxShadow: `0 0 0 2.5px rgba(255,255,255,0.95),
                                                    0 0 0 4.5px rgba(13,148,136,0.25),
                                                    0 6px 20px rgba(0,0,0,0.15)`,
                                    }}>
                                    <Image src={DOCTOR_PHOTO} alt="د. عمر العماد"
                                        width={56} height={56}
                                        className="w-full h-full object-cover object-top"
                                        unoptimized />
                                </div>
                                {/* Online pulse */}
                                <motion.div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                                    style={{ background: '#22C55E', boxShadow: '0 0 0 2.5px rgba(255,255,255,0.95), 0 2px 8px rgba(34,197,94,0.50)' }}
                                    animate={{ scale: [1, 1.22, 1] }} transition={{ duration: 2.6, repeat: Infinity }}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                </motion.div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-[15.5px] font-black leading-tight" style={{ color: G.ink }}>
                                            د. عمر العماد
                                        </p>
                                        <p className="text-[10px] mt-0.5 leading-tight" style={{ color: G.sub }}>
                                            استشاري الطب الوظيفي والشمولي
                                        </p>
                                    </div>
                                    {/* 5 stars */}
                                    <div className="flex gap-0.5 mt-1 flex-shrink-0">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                </div>

                                {/* Credential chips */}
                                <div className="flex gap-1.5 mt-2 flex-wrap">
                                    {['MBBS', 'طب وظيفي', 'نفس-جسدي', '+٨ سنوات'].map(c => (
                                        <span key={c}
                                            className="text-[8px] font-bold px-2 py-0.5 rounded-md"
                                            style={{
                                                background: 'rgba(255,255,255,0.75)',
                                                color: G.sub, border: '1px solid rgba(255,255,255,0.90)',
                                                backdropFilter: 'blur(8px)'
                                            }}>
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp strip */}
                        <a href="https://wa.me/967771447111" target="_blank" rel="noopener noreferrer"
                            onClick={() => haptic.impact()}
                            className="flex items-center justify-center gap-2 py-3 no-underline"
                            style={{
                                borderTop: '1px solid rgba(255,255,255,0.60)',
                                background: 'rgba(34,197,94,0.07)', textDecoration: 'none'
                            }}>
                            <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-[11px] font-black text-green-700">
                                تواصل مباشرة عبر واتساب
                            </span>
                        </a>
                    </div>
                </motion.div>

                {/* ── Feature chips ───────────────────────────── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.26 }}
                    className="flex gap-2 flex-wrap">
                    {[
                        { label: 'تقييم دقيق', icon: '🔬' },
                        { label: 'خطة 7 أيام', icon: '📋' },
                        { label: 'متابعة يومية', icon: '📡' },
                        { label: 'طب شمولي', icon: '✦' },
                    ].map(f => (
                        <div key={f.label}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                            style={{
                                background: G.glassHvy, backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                border: `1px solid ${G.border}`,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                            }}>
                            <span className="text-[11px]">{f.icon}</span>
                            <span className="text-[9.5px] font-semibold" style={{ color: G.sub }}>
                                {f.label}
                            </span>
                        </div>
                    ))}
                </motion.div>

                {/* ── CTA pair ───────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    className="flex flex-col gap-2.5">

                    {/* Primary — ink dark with teal glow */}
                    <Link href={createPageUrl('BookAppointment')} onClick={() => haptic.impact()}>
                        <motion.div whileTap={{ scale: 0.967, transition: SP }}
                            className="relative overflow-hidden flex items-center gap-4 px-5 py-4 rounded-[20px]"
                            style={{
                                background: G.ink,
                                boxShadow: '0 4px 24px rgba(15,23,42,0.30), 0 1px 4px rgba(0,0,0,0.12)'
                            }}>

                            {/* Teal glow */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                                style={{ background: 'rgba(13,148,136,0.20)', filter: 'blur(20px)' }} />
                            {/* Shimmer */}
                            <motion.div className="absolute inset-y-0 w-16 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
                                    skewX: -20
                                }}
                                animate={{ left: ['-64px', '120%'] }}
                                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3 }} />

                            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 relative"
                                style={{
                                    background: 'rgba(255,255,255,0.11)',
                                    border: '1px solid rgba(255,255,255,0.15)'
                                }}>
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 relative">
                                <p className="text-[15.5px] font-black text-white leading-tight">احجز استشارتك</p>
                                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                    معنا تفهم ما تحتاجه فعلاً
                                </p>
                            </div>
                            <ArrowLeft className="w-4 h-4 text-white/40 flex-shrink-0 relative" />
                        </motion.div>
                    </Link>

                    {/* Secondary — glass */}
                    <Link href="/symptom-checker" onClick={() => haptic.selection()}>
                        <motion.div whileTap={{ scale: 0.967, transition: SP }}
                            className="relative overflow-hidden flex items-center gap-4 px-5 py-3.5 rounded-[20px]"
                            style={{
                                background: G.glassHvy, backdropFilter: G.blurHvy,
                                WebkitBackdropFilter: G.blurHvy,
                                border: `1px solid ${G.border}`, boxShadow: G.shadow
                            }}>
                            <div className="absolute top-0 left-4 right-4 h-px"
                                style={{ background: G.borderTop }} />
                            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: G.accentSoft,
                                    border: '1px solid rgba(13,148,136,0.14)'
                                }}>
                                <HeartPulse className="w-5 h-5" style={{ color: G.accent }} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[14.5px] font-black" style={{ color: G.ink }}>افحص أعراضك أولاً</p>
                                <p className="text-[10px] mt-0.5" style={{ color: G.muted }}>
                                    تقييم ذكي · مجاني · 5 دقائق
                                </p>
                            </div>
                            <ArrowLeft className="w-4 h-4 flex-shrink-0" style={{ color: G.muted }} />
                        </motion.div>
                    </Link>
                </motion.div>

                {/* ── HIPAA badge ──────────────────────────── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.90 }}
                    className="flex items-center justify-center gap-2 py-1.5 px-4 rounded-full mx-auto"
                    style={{
                        background: G.glassHvy, backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: `1px solid ${G.border}`,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                    }}>
                    <Shield className="w-3 h-3" style={{ color: G.muted }} />
                    <span className="text-[7.5px] font-bold uppercase tracking-[0.22em]"
                        style={{ color: G.muted }}>
                        SECURED · HIPAA · TIBRAH VAULT
                    </span>
                </motion.div>

            </div>
        </section>
    );
}

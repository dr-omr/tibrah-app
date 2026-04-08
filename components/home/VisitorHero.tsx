// components/home/VisitorHero.tsx — V4 "Apple × Fluent Minimal"
// Philosophy:
//   - WHITE background. ONE accent color (Tibrah Teal #0D9488)
//   - Sharp typography, no color soup
//   - Physical spring press feedback
//   - Microsoft Mica depth layers + Apple-grade spacing

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
    Calendar, ArrowLeft, Stethoscope, Brain,
    Shield, MessageCircle, ChevronLeft, HeartPulse,
    Leaf, CheckCircle2, Activity, Zap,
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';

const ACCENT   = '#0D9488';
const DEEP     = '#0F766E';
const BG       = '#F8FAFC';
const SURFACE  = '#FFFFFF';
const BORDER   = 'rgba(0,0,0,0.07)';
const TEXT_PRI = '#0F172A';   // slate-900
const TEXT_SEC = '#64748B';   // slate-500
const TEXT_MUT = '#94A3B8';   // slate-400
const SHADOW   = '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)';
const SHADOW_LG= '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)';
const SPRING   = { type: 'spring' as const, stiffness: 500, damping: 32 };

const DOCTOR_PHOTO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69287e726ff0e068617e81b7/9185440e5_omar.jpg';

/* ── Animated number counter ─────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const [val, setVal] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        const t0 = performance.now();
        const run = (now: number) => {
            const p = Math.min((now - t0) / 1200, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(e * to));
            if (p < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
    }, [inView, to]);
    return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Typewriter for specialties ──────────────────────────── */
const TAGS = ['الطب الوظيفي', 'الطب النفس-جسدي', 'الطب الشمولي'];
function Typewriter() {
    const [i, setI] = useState(0);
    const [vis, setVis] = useState(true);
    useEffect(() => {
        const id = setInterval(() => {
            setVis(false);
            setTimeout(() => { setI(x => (x + 1) % TAGS.length); setVis(true); }, 350);
        }, 2600);
        return () => clearInterval(id);
    }, []);
    return (
        <motion.span key={i}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: vis ? 1 : 0, y: vis ? 0 : -4 }}
            transition={{ duration: 0.28 }}
            style={{ color: ACCENT }} className="font-black">
            {TAGS[i]}
        </motion.span>
    );
}

/* ── Press button wrapper (physical feel) ────────────────── */
function PressBox({ children, className = '', style = {}, onPress }: {
    children: React.ReactNode; className?: string;
    style?: React.CSSProperties; onPress?: () => void;
}) {
    return (
        <motion.div
            className={`select-none cursor-pointer active:opacity-95 ${className}`}
            style={style}
            whileTap={{ scale: 0.965, transition: SPRING }}
            onClick={onPress}>
            {children}
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════ */
export function VisitorHero() {
    return (
        <div dir="rtl" style={{ background: BG }} className="flex flex-col pb-4 font-sans">

            {/* ══ HERO BANNER ══════════════════════════════ */}
            <div className="relative overflow-hidden"
                style={{
                    background: `linear-gradient(160deg, ${DEEP} 0%, ${ACCENT} 100%)`,
                    paddingTop: 64, paddingBottom: 40,
                    paddingLeft: 20, paddingRight: 20,
                }}>

                {/* Subtle dot grid */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                    }} />

                {/* Top: wordmark */}
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mb-8">
                    <div className="w-7 h-7 rounded-[8px] bg-white/20 flex items-center justify-center"
                        style={{ backdropFilter: 'blur(8px)' }}>
                        <HeartPulse className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[12px] font-black text-white/80 tracking-[0.16em]">طِبرَا</span>
                    <div className="mr-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-300"
                            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
                        <span className="text-[9px] font-bold text-white/80">متاح الآن</span>
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                    className="text-[30px] font-black text-white leading-[1.15] tracking-tight mb-3">
                    رعاية طبية
                    <br />
                    متكاملة في{' '}
                    <Typewriter />
                </motion.h1>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}
                    className="text-[13px] leading-relaxed mb-5"
                    style={{ color: 'rgba(255,255,255,0.70)', maxWidth: 290 }}>
                    نهج شمولي يجمع الجسد والعقل والروح في بروتوكول علاجي واحد
                </motion.p>

                {/* Feature pills */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
                    className="flex gap-2 flex-wrap">
                    {['تشخيص دقيق', 'بروتوكول مخصص', 'متابعة مستمرة'].map(tag => (
                        <span key={tag}
                            className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)' }}>
                            {tag}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* ══ DOCTOR CARD (elevated, overlaps hero) ════ */}
            <div className="px-4 -mt-5 relative z-10">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, ...SPRING }}
                    className="rounded-[20px] overflow-hidden"
                    style={{ background: SURFACE, boxShadow: SHADOW_LG, border: `1px solid ${BORDER}` }}>

                    <div className="flex items-center gap-3.5 p-4">
                        {/* Photo */}
                        <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 rounded-[14px] overflow-hidden"
                                style={{ border: `2px solid ${ACCENT}22` }}>
                                <Image src={DOCTOR_PHOTO} alt="د. عمر العماد"
                                    width={56} height={56} className="w-full h-full object-cover" unoptimized />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2"
                                style={{ background: '#22C55E', borderColor: SURFACE }} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-black leading-tight" style={{ color: TEXT_PRI }}>
                                د. عمر العماد
                            </p>
                            <p className="text-[10px] mt-0.5" style={{ color: TEXT_SEC }}>
                                استشاري الطب الوظيفي والشمولي
                            </p>
                            <div className="flex gap-1.5 mt-1.5">
                                {['MBBS', 'طب وظيفي', 'نفس-جسدي'].map(c => (
                                    <span key={c} className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-md"
                                        style={{ background: `${ACCENT}0D`, color: ACCENT, border: `1px solid ${ACCENT}18` }}>
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* WhatsApp */}
                        <PressBox onPress={() => haptic.impact()}>
                            <a href="https://wa.me/967771447111" target="_blank" rel="noopener noreferrer"
                                className="flex flex-col items-center gap-1">
                                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                                    style={{ background: '#22C55E14', border: '1px solid #22C55E22' }}>
                                    <MessageCircle className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-[7.5px] font-bold text-green-600">واتساب</span>
                            </a>
                        </PressBox>
                    </div>
                </motion.div>
            </div>

            {/* ══ TRUST STATS ══════════════════════════════ */}
            <div className="px-4 mt-3">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24 }}
                    className="grid grid-cols-4 rounded-[18px] overflow-hidden"
                    style={{ background: SURFACE, border: `1px solid ${BORDER}`, boxShadow: SHADOW }}>
                    {[
                        { to: 2000, suffix: '+', label: 'مريض' },
                        { to: 8,    suffix: '+', label: 'سنوات' },
                        { to: 95,   suffix: '%', label: 'رضا' },
                        { to: 3,    suffix: '',  label: 'تخصصات' },
                    ].map((s, i) => (
                        <React.Fragment key={s.label}>
                            {i > 0 && <div style={{ width: 1, background: BORDER, margin: '12px 0' }} />}
                            <div className="flex flex-col items-center py-4 gap-0.5">
                                <span className="text-[19px] font-black tabular-nums" style={{ color: ACCENT }}>
                                    <Counter to={s.to} suffix={s.suffix} />
                                </span>
                                <span className="text-[9px] font-semibold" style={{ color: TEXT_MUT }}>{s.label}</span>
                            </div>
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>

            {/* ══ THREE PILLARS ════════════════════════════ */}
            <div className="px-4 mt-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] mb-3" style={{ color: TEXT_MUT }}>
                    نهج العلاج
                </p>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { icon: HeartPulse, label: 'جسدي',  sub: 'التغذية والمكملات'  },
                        { icon: Brain,      label: 'نفسي',   sub: 'النفس-جسدي'         },
                        { icon: Leaf,       label: 'روحي',   sub: 'الطب الشمولي'       },
                    ].map((p, i) => {
                        const Icon = p.icon;
                        return (
                            <motion.div key={p.label}
                                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.07, ...SPRING }}
                                className="rounded-[16px] p-3.5 flex flex-col gap-2"
                                style={{ background: SURFACE, border: `1px solid ${BORDER}`, boxShadow: SHADOW }}>
                                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                                    style={{ background: `${ACCENT}0E` }}>
                                    <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                                </div>
                                <div>
                                    <p className="text-[13px] font-black" style={{ color: TEXT_PRI }}>{p.label}</p>
                                    <p className="text-[9.5px] mt-0.5" style={{ color: TEXT_MUT }}>{p.sub}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* ══ JOURNEY STEPS ════════════════════════════ */}
            <div className="px-4 mt-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] mb-3" style={{ color: TEXT_MUT }}>
                    رحلتك معنا
                </p>
                <div className="flex items-center">
                    {[
                        { label: 'الأعراض',  icon: HeartPulse },
                        { label: 'التشخيص',  icon: Brain },
                        { label: 'الحجز',    icon: Calendar },
                        { label: 'الرعاية',  icon: Stethoscope },
                    ].map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <React.Fragment key={s.label}>
                                <div className="flex flex-col items-center gap-1.5">
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ delay: 0.35 + i * 0.08, ...SPRING }}
                                        className="w-9 h-9 rounded-full flex items-center justify-center"
                                        style={{ background: `${ACCENT}12`, border: `1.5px solid ${ACCENT}30` }}>
                                        <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                                    </motion.div>
                                    <span className="text-[9px] font-bold" style={{ color: TEXT_SEC }}>{s.label}</span>
                                </div>
                                {i < 3 && (
                                    <div className="flex-1 h-px mx-1.5" style={{ background: `${ACCENT}25` }} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* ══ DUAL CTA ═════════════════════════════════ */}
            <div className="px-4 mt-5 flex flex-col gap-2.5">
                {/* Primary — book */}
                <Link href={createPageUrl('BookAppointment')} onClick={() => haptic.impact()}>
                    <PressBox
                        className="flex items-center gap-4 px-5 py-4 rounded-[18px] overflow-hidden relative"
                        style={{ background: ACCENT, boxShadow: `0 8px 28px ${ACCENT}50` }}>
                        {/* Shine */}
                        <div className="absolute inset-y-0 right-0 w-1/3 bg-white/08 pointer-events-none"
                            style={{ background: 'linear-gradient(to left, rgba(255,255,255,0.10), transparent)' }} />
                        <div className="w-10 h-10 rounded-[12px] bg-white/20 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[16px] font-black text-white">احجز جلستك</p>
                            <p className="text-[10px] text-white/65 mt-0.5">استشارة تشخيصية شاملة</p>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-white/70 flex-shrink-0" />
                    </PressBox>
                </Link>

                {/* Secondary — diagnose */}
                <Link href="/body-map" onClick={() => haptic.selection()}>
                    <PressBox
                        className="flex items-center gap-4 px-5 py-4 rounded-[18px]"
                        style={{ background: SURFACE, border: `1.5px solid ${BORDER}`, boxShadow: SHADOW }}>
                        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                            style={{ background: `${ACCENT}0E` }}>
                            <Stethoscope className="w-5 h-5" style={{ color: ACCENT }} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[15px] font-black" style={{ color: TEXT_PRI }}>ابدأ التشخيص</p>
                            <p className="text-[10px] mt-0.5" style={{ color: TEXT_MUT }}>مدقق الأعراض الذكي</p>
                        </div>
                        <ArrowLeft className="w-4 h-4 flex-shrink-0" style={{ color: TEXT_MUT }} />
                    </PressBox>
                </Link>
            </div>
        </div>
    );
}

export default VisitorHero;

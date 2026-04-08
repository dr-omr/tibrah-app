// components/home/HeroCard.tsx  ✦ V2 — Soul Edition
// The health score is not just a number. It's a living signal.
// New: mesh gradient background, depth layers, breathing ring, haptic score tap

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
    Brain, Droplets, Flame, Target, Stethoscope,
    HeartPulse, ArrowLeft, ChevronDown, Timer,
    TrendingUp, Sparkles,
} from 'lucide-react';
import { type HealthDashboardData } from '@/hooks/useHealthDashboard';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { T, scoreColor, CARD_SPRING } from './home-tokens';
import { STAGGER_ITEM, ARROW_BOUNCE } from '@/lib/tibrah-motion';

/* ── Greeting by time ── */
function useGreeting() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return { text: 'صباح الخير', emoji: '☀️', sub: 'وقت مثالي للتسجيل' };
    if (h >= 12 && h < 17) return { text: 'مرحباً', emoji: '🌤️', sub: 'كيف تشعر الآن؟' };
    if (h >= 17 && h < 21) return { text: 'مساء الخير', emoji: '🌅', sub: 'راجع يومك' };
    return { text: 'وقت الراحة', emoji: '🌙', sub: 'سجّل قبل النوم' };
}

/* ── Countdown ── */
function useCountdown() {
    const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });
    useEffect(() => {
        const tick = () => {
            const ms = new Date().setHours(23, 59, 59, 999) - Date.now();
            setLeft({ h: ~~(ms / 3600000), m: ~~(ms % 3600000 / 60000), s: ~~(ms % 60000 / 1000) });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);
    return left;
}

/* ── Tiny EKG line (SVG animated path) ── */
function EkgLine({ color, expanded }: { color: string; expanded: boolean }) {
    // A real EKG PQRST-like waveform
    const d = 'M0,18 Q8,18 14,18 L18,18 L22,5 L25,30 L28,5 L32,18 L36,18 Q46,18 54,18 L58,13 L62,23 L66,18 Q80,18 160,18';
    return (
        <div className="absolute inset-x-0 bottom-0 h-12 overflow-hidden pointer-events-none"
            style={{ opacity: expanded ? 0.07 : 0.11, transition: 'opacity 0.4s ease' }}>
            <svg viewBox="0 0 160 36" className="w-full h-full" preserveAspectRatio="none">
                <motion.path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.4, repeatType: 'loop' }} />
            </svg>
        </div>
    );
}

/* ── Mesh gradient background (score-aware) ── */
function MeshBg({ color }: { color: string }) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
            {/* Top-center bloom */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-40"
                style={{
                    background: `radial-gradient(ellipse, ${color}16 0%, transparent 70%)`,
                    filter: 'blur(20px)',
                    transition: 'background 0.8s ease',
                }} />
            {/* Bottom-right accent */}
            <div className="absolute -bottom-8 -right-8 w-40 h-40"
                style={{
                    background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
                    filter: 'blur(16px)',
                }} />
        </div>
    );
}

/* ════════════════════════════════════════════════════
   HERO CARD
   ════════════════════════════════════════════════════ */
export function HeroCard({
    dashboard,
    onAIOpen,
}: {
    dashboard: HealthDashboardData;
    onAIOpen: () => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [scoreTapped, setScoreTapped] = useState(false);

    const greeting = useGreeting();
    const countdown = useCountdown();
    const color = scoreColor(dashboard.healthScore);
    const urgent = !dashboard.hasLoggedToday;

    // SVG ring
    const sz = 188; const rr = 80; const circ = 2 * Math.PI * rr;
    const dash = circ - (dashboard.healthScore / 100) * circ;

    // Score tap bounce
    const handleScoreTap = useCallback(() => {
        haptic.impact();
        setScoreTapped(true);
        setTimeout(() => setScoreTapped(false), 600);
    }, []);

    // Health label
    const healthLabel =
        dashboard.healthScore >= 90 ? 'استثنائي 🌟' :
            dashboard.healthScore >= 80 ? 'ممتاز ✓' :
                dashboard.healthScore >= 65 ? 'جيد جداً' :
                    dashboard.healthScore >= 50 ? 'يمكن تحسينه' : 'يحتاج اهتماماً';

    return (
        <motion.div variants={STAGGER_ITEM} className="px-4">
            <div className="relative overflow-hidden rounded-[32px]"
                style={{
                    background: 'rgba(255,255,255,0.97)',
                    backdropFilter: 'blur(32px) saturate(180%)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
                }}>

                <MeshBg color={color} />
                <EkgLine color={color} expanded={expanded} />

                <div className="relative z-10">

                    {/* ── Top bar ── */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-3">
                        <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[15px]">{greeting.emoji}</span>
                                <span className="text-[11px] font-semibold text-slate-400 tracking-wide">{greeting.text}</span>
                            </div>
                            <p className="text-[17px] font-black text-slate-900 leading-tight">
                                {urgent ? greeting.sub : 'صحتك محدّثة ✓'}
                            </p>
                        </div>

                        {/* Gemini button */}
                        <motion.button whileTap={{ scale: 0.88 }}
                            onClick={() => { haptic.impact(); onAIOpen(); }}
                            className="relative overflow-hidden flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold text-white"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                            {/* Shimmer */}
                            <motion.div className="absolute inset-y-0 w-10 bg-white/20 skew-x-[-20deg]"
                                animate={{ left: ['-40px', '120px'] }}
                                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.5 }} />
                            <Brain className="w-3.5 h-3.5 relative z-10" />
                            <span className="relative z-10">Gemini</span>
                        </motion.button>
                    </div>

                    {/* ── Giant ring ── */}
                    <div className="flex flex-col items-center pb-2 pt-1">
                        <div className="relative" style={{ width: sz, height: sz }}>

                            {/* Breathing outer ring */}
                            <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                                animate={{ opacity: [0.07, 0.2, 0.07], scale: [1, 1.04, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ boxShadow: `0 0 0 6px ${color}` }} />

                            {/* SVG rings */}
                            <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)' }}>
                                {/* Background track */}
                                <circle cx={sz / 2} cy={sz / 2} r={rr} fill="none"
                                    stroke="rgba(0,0,0,0.05)" strokeWidth="9" strokeLinecap="round" />
                                {/* Thin inner detail */}
                                <circle cx={sz / 2} cy={sz / 2} r={rr - 14} fill="none"
                                    stroke={`${color}10`} strokeWidth="1.5" />
                                {/* Score arc */}
                                <motion.circle cx={sz / 2} cy={sz / 2} r={rr} fill="none"
                                    stroke={color} strokeWidth="9" strokeLinecap="round"
                                    style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
                                    strokeDasharray={circ}
                                    initial={{ strokeDashoffset: circ }}
                                    animate={{ strokeDashoffset: dash }}
                                    transition={{ duration: 2, ease: [0.34, 1.56, 0.64, 1] }} />
                            </svg>

                            {/* Center — tappable score */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                                <motion.button
                                    animate={scoreTapped ? { scale: [1.2, 0.9, 1.05, 1], rotate: [0, -3, 3, 0] } : {}}
                                    transition={{ duration: 0.5 }}
                                    onClick={handleScoreTap}
                                    className="flex flex-col items-center select-none active:scale-95">
                                    <motion.span className="text-[60px] font-black tabular-nums leading-none"
                                        style={{ color }}
                                        initial={{ opacity: 0, scale: 0.4 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 18 }}>
                                        {dashboard.healthScore}
                                    </motion.span>
                                    <span className="text-[12px] font-semibold text-slate-400 mt-0.5">درجة الصحة</span>
                                </motion.button>

                                {/* Status chip */}
                                <motion.div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full"
                                    style={{ background: `${color}12`, border: `1px solid ${color}22` }}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}>
                                    <motion.div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                        style={{ background: color }}
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1.8, repeat: Infinity }} />
                                    <span className="text-[11px] font-black" style={{ color }}>{healthLabel}</span>
                                </motion.div>
                            </div>
                        </div>

                        {/* ── Stats strip ── */}
                        <div className="flex items-stretch w-full mt-3 border-t border-slate-100">
                            {([
                                {
                                    icon: Droplets, label: 'الماء',
                                    value: `${Math.round(Math.min(dashboard.waterToday / Math.max(dashboard.waterGoal, 1), 1) * 100)}%`,
                                    color: '#2563eb', href: createPageUrl('DailyLog'),
                                    alert: dashboard.waterToday / Math.max(dashboard.waterGoal, 1) < 0.5,
                                },
                                {
                                    icon: Flame, label: 'السلسلة',
                                    value: `${dashboard.streakAr}`,
                                    color: '#ea580c', href: createPageUrl('DailyLog'),
                                    alert: false,
                                },
                                {
                                    icon: Target, label: 'الأهداف',
                                    value: `${dashboard.goalsCompleted}/${dashboard.goalsTotal}`,
                                    color: '#7c3aed', href: createPageUrl('Rewards'),
                                    alert: false,
                                },
                            ]).map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <React.Fragment key={i}>
                                        {i > 0 && <div className="w-px bg-slate-100 flex-shrink-0" />}
                                        <Link href={s.href} onClick={() => haptic.selection()} className="flex-1">
                                            <motion.div
                                                whileTap={{ scale: 0.92 }}
                                                className="flex flex-col items-center py-4 gap-1 rounded-xl active:bg-slate-50/60 transition-colors">
                                                <div className="relative">
                                                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                                                    {s.alert && (
                                                        <motion.div
                                                            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500"
                                                            animate={{ scale: [1, 1.4, 1] }}
                                                            transition={{ duration: 1.4, repeat: Infinity }} />
                                                    )}
                                                </div>
                                                <span className="text-[15px] font-black tabular-nums text-slate-900">{s.value}</span>
                                                <span className="text-[9.5px] font-medium text-slate-400">{s.label}</span>
                                            </motion.div>
                                        </Link>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Expand toggle ── */}
                    <button
                        className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-slate-100"
                        onClick={() => { setExpanded(e => !e); haptic.selection(); }}>
                        <span className="text-[11px] font-semibold text-slate-400">
                            {expanded ? 'إخفاء التفاصيل' : 'تفاصيل أكثر'}
                        </span>
                        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={CARD_SPRING}>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                        </motion.div>
                    </button>

                    {/* ── Expanded panel ── */}
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ ...CARD_SPRING, stiffness: 400, damping: 36 }}
                                className="overflow-hidden px-5 pb-5">

                                <div className="pt-4 space-y-3.5">

                                    {/* Countdown */}
                                    {urgent && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-3 px-4 py-3.5 rounded-[18px] bg-indigo-50/80 border border-indigo-100">
                                            <Timer className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                            <span className="text-[12px] font-bold text-indigo-700 flex-1">وقت متبقٍ لتسجيل يومك</span>
                                            <span dir="ltr" className="text-[14px] font-black text-indigo-800 tabular-nums">
                                                {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}
                                            </span>
                                        </motion.div>
                                    )}

                                    {/* Score breakdown */}
                                    <div className="p-4 rounded-[18px]"
                                        style={{ background: `${color}08`, border: `1px solid ${color}16` }}>
                                        <p className="text-[11.5px] font-bold mb-3" style={{ color }}>مكونات الدرجة</p>
                                        {[
                                            { label: 'الانتظام', pct: Math.min(dashboard.streak * 10, 100) },
                                            { label: 'الترطيب', pct: Math.round(Math.min(dashboard.waterToday / Math.max(dashboard.waterGoal, 1), 1) * 100) },
                                            { label: 'إكمال الأهداف', pct: Math.round((dashboard.goalsCompleted / Math.max(dashboard.goalsTotal, 1)) * 100) },
                                        ].map((item, i) => (
                                            <div key={i} className="mb-2 last:mb-0">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[10px] font-bold text-slate-600">{item.label}</span>
                                                    <span className="text-[10px] font-black tabular-nums" style={{ color }}>{item.pct}%</span>
                                                </div>
                                                <div className="h-1 rounded-full bg-white/60 overflow-hidden">
                                                    <motion.div className="h-full rounded-full" style={{ background: color }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.pct}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Streak progress */}
                                    {dashboard.streak > 0 && (
                                        <div>
                                            <div className="flex justify-between mb-1.5">
                                                <span className="text-[11px] font-bold text-slate-500">سلسلة الانتظام</span>
                                                <span className="text-[11px] font-black text-orange-500">
                                                    {Math.round(Math.min(dashboard.streak / 30, 1) * 100)}% نحو ٣٠ يوم
                                                </span>
                                            </div>
                                            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                                                <motion.div className="h-full rounded-full"
                                                    style={{ background: 'linear-gradient(90deg,#f97316,#ef4444)' }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(dashboard.streak / 30, 1) * 100}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut' }} />
                                            </div>
                                            {/* Day dots */}
                                            <div className="flex gap-1 mt-2">
                                                {[...Array(Math.min(dashboard.streak, 14))].map((_, i) => (
                                                    <motion.div key={i}
                                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                        transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 20 }}
                                                        className="flex-1 h-2 rounded-full"
                                                        style={{ background: `hsl(${24 + i * 2},85%,${55 + i}%)`, maxWidth: 16 }} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* CTA */}
                                    <Link href={urgent ? '/quick-check-in' : createPageUrl('MyCare')}
                                        onClick={() => { haptic.impact(); uiSounds.navigate(); }}>
                                        <motion.div whileTap={{ scale: 0.97 }}
                                            className="relative overflow-hidden flex items-center gap-3.5 px-5 py-4 rounded-[20px]"
                                            style={{
                                                background: urgent
                                                    ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                                                    : `linear-gradient(135deg,${color},${color}cc)`,
                                                boxShadow: `0 8px 28px ${urgent ? 'rgba(99,102,241,0.32)' : color.replace('#', 'rgba(') + ',0.28)'}`,
                                            }}>
                                            {/* shine overlay */}
                                            <div className="absolute inset-y-0 left-0 right-1/2 bg-white/10 rounded-r-full pointer-events-none" />
                                            <div className="w-10 h-10 rounded-[13px] bg-white/15 flex items-center justify-center flex-shrink-0 z-10">
                                                {urgent
                                                    ? <Stethoscope className="w-5 h-5 text-white" />
                                                    : <HeartPulse className="w-5 h-5 text-white" />}
                                            </div>
                                            <div className="flex-1 z-10">
                                                <p className="text-[15px] font-black text-white leading-tight">
                                                    {urgent ? 'سجّل يومك الصحي' : 'رحلتي العلاجية'}
                                                </p>
                                                <p className="text-[11px] text-white/60 mt-0.5">
                                                    {urgent ? 'تقييم سريري شامل · ٢ دقيقة' : 'خطتك وجلساتك الطبية'}
                                                </p>
                                            </div>
                                            <motion.div {...ARROW_BOUNCE} className="z-10 flex-shrink-0">
                                                <ArrowLeft className="w-4 h-4 text-white/80" />
                                            </motion.div>
                                        </motion.div>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

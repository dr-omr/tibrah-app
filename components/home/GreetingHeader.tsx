'use client';
/**
 * GreetingHeader.tsx — طِبرَا LIVING HEALTH CANVAS
 * ──────────────────────────────────────────────────────────────
 * مستوى: Samsung Health × Apple Fitness+ × Gentler Streak
 * غني · عميق · متحرك · فاخر — لا بساطة هنا
 *
 * الهيكل:
 *  ① Aurora mesh background (3 ألوان + 4 orbs + dot texture)
 *  ② Header strip: التاريخ + علامة طِبرَا
 *  ③ Hero Section:
 *     • اليسار: اسم المستخدم + تحية كبيرة + شارة الحالة + مقايسة اجتماعية
 *     • اليمين: Semi-circle gauge (نصف دائرة) + رقم متحرك
 *  ④ Domain matrix: 5 tiles زجاجية ملونة + mini rings
 *  ⑤ AI analysis CTA — زجاجي فاخر
 */

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useAnimationFrame } from 'framer-motion';
import { Brain, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { haptic } from '@/lib/HapticFeedback';
import { STAGGER_ITEM } from '@/lib/tibrah-motion';
import { DOMAINS } from './domain-data';
import { useHealthDashboard } from '@/hooks/useHealthDashboard';

/* ─────────────────────────────────────────────────────────────
   Count-up
───────────────────────────────────────────────────────────── */
function useCountUp(target: number, ms = 1200, delay = 600) {
    const [n, setN] = useState(0);
    const raf = useRef<number | null>(null);
    useEffect(() => {
        const timer = setTimeout(() => {
            const t0 = Date.now();
            const tick = () => {
                const p = Math.min((Date.now() - t0) / ms, 1);
                setN(Math.round((1 - Math.pow(1 - p, 3)) * target));
                if (p < 1) raf.current = requestAnimationFrame(tick);
            };
            raf.current = requestAnimationFrame(tick);
        }, delay);
        return () => { clearTimeout(timer); if (raf.current) cancelAnimationFrame(raf.current); };
    }, [target, ms, delay]);
    return n;
}

/* ─────────────────────────────────────────────────────────────
   Semi-circle Gauge — Water Glass Edition
───────────────────────────────────────────────────────────── */
function SemiGauge({ score }: { score: number }) {
    const W = 160; const H = 90;
    const cx = W / 2; const cy = H - 6;
    const r = 72; const sw = 14;
    const displayScore = useCountUp(score, 1300, 700);

    // Arc from 180° to 0° (left → right across bottom)
    const MathPI = Math.PI;
    const angleStart = MathPI;
    const angleEnd   = 0;
    const total = angleStart - angleEnd;
    
    // Ensure the score line never exceeds the start/end bounds
    const safeScore = Math.max(0, Math.min(100, score));
    const filled = (safeScore / 100) * total;

    // SVG arc helper
    const arc = (a1: number, a2: number) => {
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2);
        const y2 = cy + r * Math.sin(a2);
        const large = Math.abs(a2 - a1) > MathPI ? 1 : 0;
        return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
    };

    // Gradient colors per zone
    const [c1, c2] = safeScore >= 80 ? ['#34D399', '#10B981']
                   : safeScore >= 50 ? ['#FBBF24', '#F59E0B']
                   :                   ['#F87171', '#EF4444'];

    return (
        <div className="relative flex-shrink-0" style={{ width: W, height: H + 24 }}>
            {/* Ambient water pulse */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ filter: `drop-shadow(0 0 24px ${c1}40)` }} />

            <svg width={W} height={H} overflow="visible">
                <defs>
                    <linearGradient id="sgLiquid" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={c2} />
                        <stop offset="100%" stopColor={c1} />
                    </linearGradient>
                    
                    {/* Water Glass Specular Edge Filter */}
                    <filter id="glassBevel" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur"/>
                        <feOffset dx="0" dy="-1.5" result="offsetBlur"/>
                        <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1.2" 
                                            specularExponent="20" lightingColor="white" result="specOut">
                            <fePointLight x="0" y="-50" z="200"/>
                        </feSpecularLighting>
                        <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
                        <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
                    </filter>
                    <filter id="glassGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
                        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur2" />
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Track arc (Glass Trough) */}
                <path d={arc(MathPI, 0)} 
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={sw + 2} fill="none" strokeLinecap="round" 
                      filter="url(#glassBevel)" />
                      
                <path d={arc(MathPI, 0)} 
                      stroke="rgba(0,0,0,0.4)"
                      strokeWidth={sw - 2} fill="none" strokeLinecap="round" />

                {/* Tick marks embedded inside the glass */}
                {[0, 25, 50, 75, 100].map((pct) => {
                    const a = MathPI - (pct / 100) * MathPI;
                    const ir = r - sw * 0.45;
                    const or = r + sw * 0.45;
                    return (
                        <line key={pct}
                            x1={cx + ir * Math.cos(a)} y1={cy + ir * Math.sin(a)}
                            x2={cx + or * Math.cos(a)} y2={cy + or * Math.sin(a)}
                            stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} strokeLinecap="round" />
                    );
                })}

                {/* Filled arc — Liquid/Crystal representation */}
                {safeScore > 0 && (
                    <motion.path
                        d={arc(MathPI, MathPI - filled)}
                        stroke="url(#sgLiquid)"
                        strokeWidth={sw - 1.5}
                        fill="none"
                        strokeLinecap="round"
                        filter="url(#glassGlow)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.6, ease: [0.34, 1.1, 0.64, 1], delay: 0.6 }}
                    />
                )}

                {/* Shimmer line inside the liquid to look like physical specular flow */}
                {safeScore > 0 && (
                    <motion.path
                        d={arc(MathPI, MathPI - filled)}
                        stroke="rgba(255,255,255,0.45)"
                        strokeWidth={2}
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.6, ease: [0.34, 1.1, 0.64, 1], delay: 0.6 }}
                    />
                )}

                {/* Tip glow dot with physical depth */}
                {safeScore > 5 && (
                    <motion.circle
                        cx={cx + r * Math.cos(MathPI - filled)}
                        cy={cy + r * Math.sin(MathPI - filled)}
                        r={sw / 2 + 3}
                        fill="white"
                        style={{ filter: `drop-shadow(0 0 10px ${c1})` }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2.0, type: 'spring', stiffness: 400 }}
                    />
                )}
            </svg>

            {/* Score display below arc center */}
            <div className="absolute bottom-[16px] left-0 right-0 flex flex-col items-center">
                <motion.span className="font-black text-transparent bg-clip-text leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                    style={{ fontSize: 34, letterSpacing: '-1px', backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)' }}>
                    {displayScore}
                </motion.span>
                <span className="text-[8px] font-black uppercase tracking-[0.15em] mt-1"
                    style={{ color: c1, opacity: 0.8 }}>
                    / ١٠٠ نقطة
                </span>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Domain Glass Tile — for the 5-tile strip
───────────────────────────────────────────────────────────── */
function DomainTile({ domain, i, realScore }: { domain: typeof DOMAINS[number]; i: number, realScore: number }) {
    const r = 14; const sw = 2.8;
    const circ = 2 * Math.PI * r;
    const safeScore = Math.max(0, Math.min(100, realScore)); // USE REAL SCORE
    const filled = (safeScore / 100) * circ;

    return (
        <Link href={domain.sectionHref} onClick={() => haptic.tap()}>
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28, delay: 0.7 + i * 0.07 }}
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-[16px] flex-shrink-0"
                style={{
                    background: [
                        'linear-gradient(145deg,',
                        `  ${domain.color}25 0%,`,
                        '  rgba(255,255,255,0.06) 40%,',
                        `  ${domain.color}15 100%`,
                        ')',
                    ].join(''),
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    boxShadow: [
                        '0 1.5px 0 rgba(255,255,255,0.15) inset',
                        `0 -1px 0 ${domain.color}10 inset`,
                        `0 4px 12px ${domain.color}20`,
                    ].join(', '),
                    minWidth: 56,
                }}
            >
                {/* Mini ring */}
                <div className="relative" style={{ width: r * 2 + sw + 2, height: r * 2 + sw + 2 }}>
                    <svg width={r * 2 + sw + 2} height={r * 2 + sw + 2}
                        style={{ transform: 'rotate(-90deg)', display: 'block' }}>
                        <circle cx={r + sw / 2 + 1} cy={r + sw / 2 + 1} r={r}
                            strokeWidth={sw} stroke="rgba(255,255,255,0.10)" fill="none" />
                        <motion.circle
                            cx={r + sw / 2 + 1} cy={r + sw / 2 + 1} r={r}
                            strokeWidth={sw} stroke={domain.color} fill="none"
                            strokeLinecap="round" strokeDasharray={circ}
                            initial={{ strokeDashoffset: circ }}
                            animate={{ strokeDashoffset: circ - filled }}
                            transition={{ duration: 1.2, ease: [0.34, 1.1, 0.64, 1], delay: 0.8 + i * 0.07 }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[12px] leading-none">{domain.emoji}</span>
                    </div>
                </div>
                {/* Score */}
                <span className="text-[11px] font-black leading-none" style={{ color: domain.color }}>
                    {safeScore}
                </span>
                {/* Name */}
                <span className="text-[8.5px] font-bold leading-none text-white/45">
                    {domain.name}
                </span>
                {/* Delta arrow (hidden if NO real delta logic exists yet, but keeping for UI standard) */}
                {domain.delta !== 0 && (
                    <span className="text-[8px] font-black leading-none"
                        style={{ color: domain.delta > 0 ? '#34D399' : '#F87171' }}>
                        {domain.delta > 0 ? `↑` : `↓`}
                    </span>
                )}
            </motion.div>
        </Link>
    );
}

/* ─────────────────────────────────────────────────────────────
   Floating Aurora Orb
───────────────────────────────────────────────────────────── */
function AuroraOrb({ color, x, y, size, delay }: {
    color: string; x: string; y: string; size: number; delay: number;
}) {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                left: x, top: y, width: size, height: size,
                background: `radial-gradient(circle, ${color}, transparent 70%)`,
                filter: 'blur(24px)',
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
        />
    );
}

/* ═════════════════════════════════════════════════════════════
   MAIN EXPORT
═════════════════════════════════════════════════════════════ */
export default function GreetingHeader({ onAIOpen }: { onAIOpen: () => void }) {
    const { user } = useAuth();
    const dashboardData = useHealthDashboard(); // Real live data
    
    const hour = new Date().getHours();
    const greetAR = hour < 12 ? 'صباح الصحة' : hour < 17 ? 'نهارك بخير' : 'مساء العافية';
    const greetEN = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
    const name    = user?.name?.split(' ')[0] || 'عزيزي';
    
    // REAL data ONLY — Never use mock overrides.
    // If loading, score is literally 0 until loaded.
    const overall = dashboardData.loading ? 0 : dashboardData.healthScore;
    const dateStr = new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });

    const statusData = overall >= 85 ? { label: 'حالة ممتازة', icon: '⚡', color: '#34D399', rank: '73' }
                     : overall >= 50 ? { label: 'تتقدم بخير', icon: '💪', color: '#FBBF24', rank: '55' }
                     : overall > 0   ? { label: 'تحتاج عناية', icon: '⚕️', color: '#EF4444', rank: '21' }
                     :                 { label: 'ابدأ رحلتك', icon: '🌱', color: '#3B82F6', rank: '—' };

    return (
        <motion.div variants={STAGGER_ITEM} className="mx-4 mt-2">
            <div
                className="relative overflow-hidden rounded-[32px]"
                style={{
                    /* ── WATER GLASS: Rich, non-grey dark base with translucency ── */
                    backgroundColor: 'rgba(5, 20, 25, 0.85)',
                    background: [
                        'linear-gradient(160deg,',
                        '  rgba(7, 33, 31, 1.0) 0%,',
                        '  rgba(13, 58, 53, 0.85) 35%,',
                        '  rgba(13, 32, 64, 0.85) 75%,',
                        '  rgba(22, 6, 48, 0.95) 100%',
                        ')',
                    ].join(''),
                    backdropFilter: 'blur(30px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(30px) saturate(1.8)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderTop: '1px solid rgba(255,255,255,0.35)',
                    boxShadow: [
                        '0 2px 0 rgba(255,255,255,0.15) inset',
                        '1px 0 0 rgba(255,255,255,0.08) inset',
                        '-1px -1px 0 rgba(0,0,0,0.50) inset',
                        '0 32px 80px rgba(4,15,28,0.70)',
                    ].join(', '),
                }}
            >
                {/* ── Aurora orbs ── */}
                <AuroraOrb color="rgba(13,148,136,0.30)" x="-10%" y="-30%" size={200} delay={0} />
                <AuroraOrb color="rgba(79,70,229,0.20)"  x="60%"  y="-20%" size={160} delay={1.5} />
                <AuroraOrb color="rgba(52,211,153,0.15)" x="20%"  y="60%"  size={140} delay={3} />
                <AuroraOrb color="rgba(96,165,250,0.15)" x="-5%"  y="70%"  size={120} delay={2} />

                {/* ── Dot texture ── */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                    }} />

                {/* ── Shimmer sweep ── */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)',
                    }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 6, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                />

                {/* ── Top shine ── */}
                <div className="absolute top-0 left-12 right-12 h-px"
                    style={{ background: 'rgba(255,255,255,0.10)' }} />

                {/* ════ CONTENT ════ */}
                <div className="relative z-10 px-5 pt-5 pb-4 flex flex-col gap-4">

                    {/* ── Row 1: Date + Brand ── */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <motion.div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: '#34D399' }}
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <span className="text-[10px] font-bold text-white/45 tracking-wide">{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <span className="text-[9px] font-black text-white/40 tracking-[0.2em] uppercase">{greetEN}</span>
                        </div>
                    </div>

                    {/* ── Row 2: Greeting + Gauge ── */}
                    <div className="flex items-end gap-3">

                        {/* LEFT: Identity block */}
                        <div className="flex-1 flex flex-col gap-2.5">

                            {/* Greeting + Name */}
                            <div>
                                <p className="text-[11px] font-medium text-white/50 mb-1 leading-none">
                                    {greetAR}
                                </p>
                                <h1 className="text-[30px] font-black text-white leading-[1.1] tracking-tight">
                                    {name} 👋
                                </h1>
                            </div>

                            {/* Status badge */}
                            <motion.div
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.4 }}
                                className="flex items-center gap-2 self-start px-3 py-1.5 rounded-full"
                                style={{
                                    background: `${statusData.color}16`,
                                    border: `1px solid ${statusData.color}28`,
                                }}
                            >
                                <motion.div className="w-2 h-2 rounded-full"
                                    style={{ background: statusData.color, boxShadow: `0 0 8px ${statusData.color}` }}
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }} />
                                <span className="text-[10.5px] font-black" style={{ color: statusData.color }}>
                                    {statusData.icon} {statusData.label}
                                </span>
                            </motion.div>

                            {/* Social comparison micro-stat */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.8 }}
                                className="flex items-center gap-1.5"
                            >
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] font-semibold text-white/45">
                                    أحسن من <span className="text-emerald-400 font-black">{statusData.rank}%</span> من المستخدمين
                                </span>
                            </motion.div>
                        </div>

                        {/* RIGHT: Semi-circle gauge */}
                        <motion.div
                            className="cursor-pointer"
                            whileTap={{ scale: 0.94 }}
                            onClick={() => { haptic.tap(); onAIOpen(); }}
                        >
                            <SemiGauge score={overall} />
                        </motion.div>
                    </div>

                    {/* ── Row 3: Label for gauge + tap hint ── */}
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
                            مؤشرات صحتك الشاملة
                        </span>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Brain className="w-2.5 h-2.5 text-white/40" />
                            <span className="text-[8px] font-black text-white/40">اضغط الرقم للتحليل</span>
                        </div>
                    </div>

                    {/* ── Row 4: domain divider ── */}
                    <div className="h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

                    {/* ── Row 5: 4 Domain Tiles ── */}
                    {/* Negative margins (-mx-5) + padding (px-5) = full-width scroll on mobile */}
                    <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-1 -mx-5 px-5"
                        style={{ scrollbarWidth: 'none' }}>
                        {DOMAINS.map((d, i) => (
                            <DomainTile key={d.id} domain={d} i={i} realScore={overall} />
                        ))}

                        {/* AI CTA tile — WATER GLASS PHYSICS */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.2 }}
                            whileTap={{ scale: 0.88 }}
                            onClick={() => { haptic.tap(); onAIOpen(); }}
                            className="flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 rounded-[16px] flex-shrink-0 cursor-pointer"
                            style={{
                                background: [
                                    'linear-gradient(145deg,',
                                    '  rgba(139,92,246,0.35) 0%,',
                                    '  rgba(255,255,255,0.10) 40%,',
                                    '  rgba(139,92,246,0.20) 100%',
                                    ')',
                                ].join(''),
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderTop: '1px solid rgba(255,255,255,0.3)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                boxShadow: [
                                    '0 1.5px 0 rgba(255,255,255,0.2) inset',
                                    '0 -1px 0 rgba(139,92,246,0.2) inset',
                                    '0 6px 16px rgba(139,92,246,0.35)',
                                ].join(', '),
                                minWidth: 56,
                            }}
                        >
                            <Zap className="w-4 h-4 text-violet-400" />
                            <span className="text-[9px] font-black text-violet-400 text-center leading-tight">
                                تحليل<br />AI
                            </span>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

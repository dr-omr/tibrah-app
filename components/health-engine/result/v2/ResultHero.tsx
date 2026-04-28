// components/health-engine/result/v2/ResultHero.tsx
// ═══════════════════════════════════════════════════════════════
// TIBRAH v12 — ULTRA-RICH Hero Reveal
// Maximum visual density: layered glass, caustics, floating orbs,
// animated score ring, pulsing triage, mesh gradients, shimmer
// ═══════════════════════════════════════════════════════════════
'use client';
import { useEffect, useState, useMemo } from 'react';
import { motion, animate, useMotionValue } from 'framer-motion';
import type { ResultHeroBlock } from '../../types';
import type { DomainVisConfig } from '../shared/design-tokens';
import { W } from '../shared/design-tokens';

interface Props {
  hero: ResultHeroBlock;
  vis: DomainVisConfig;
  on: boolean;
  /** Human-readable summary from planHandoff */
  humanSummary?: string;
  /** First action step from planHandoff */
  startTodayStep?: string;
}

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════ */

/* ── Animated counter ─────────────────────────────────── */
function AnimCount({ value, delay = 0 }: { value: number; delay?: number }) {
  const mv = useMotionValue(0);
  const [d, setD] = useState(0);
  useEffect(() => {
    const c = animate(mv, value, {
      duration: 1.8, ease: [0.16, 1, 0.3, 1], delay,
      onUpdate: v => setD(Math.round(v)),
    });
    return c.stop;
  }, [value, delay, mv]);
  return <>{d}</>;
}

/* ── Water Caustic Light Rays ────────────────────────── */
function CausticRays({ color }: { color: string }) {
  const rays = useMemo(() => [
    { top: '8%',  left: '6%',  h: 70,  rot: -18, dur: 3.4, del: 0 },
    { top: '22%', left: '18%', h: 55,  rot: -8,  dur: 4.2, del: 0.6 },
    { top: '38%', left: '72%', h: 85,  rot: 12,  dur: 3.8, del: 1.2 },
    { top: '55%', left: '88%', h: 60,  rot: 22,  dur: 4.6, del: 0.3 },
    { top: '68%', left: '35%', h: 75,  rot: -5,  dur: 5.0, del: 0.9 },
    { top: '12%', left: '55%', h: 65,  rot: 8,   dur: 3.6, del: 1.5 },
    { top: '78%', left: '15%', h: 50,  rot: -12, dur: 4.4, del: 0.4 },
  ], []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {rays.map((r, i) => (
        <motion.div key={i} className="absolute"
          style={{
            top: r.top, left: r.left, width: 2, height: r.h,
            background: `linear-gradient(to bottom, transparent, ${color}30, transparent)`,
            borderRadius: 99,
            transform: `rotate(${r.rot}deg)`, transformOrigin: 'top center',
          }}
          animate={{ opacity: [0.2, 0.65, 0.2], scaleY: [0.85, 1.2, 0.85] }}
          transition={{ duration: r.dur, repeat: Infinity, ease: 'easeInOut', delay: r.del }}
        />
      ))}
    </div>
  );
}

/* ── Floating Glass Orbs ─────────────────────────────── */
function FloatingOrbs({ color }: { color: string }) {
  const orbs = useMemo(() => [
    { s: 14, top: '12%', left: '8%',  dur: 5.0, del: 0,   op: [0.4, 0.8] },
    { s: 8,  top: '28%', left: '5%',  dur: 6.2, del: 0.7, op: [0.3, 0.7] },
    { s: 18, top: '52%', left: '10%', dur: 4.5, del: 1.3, op: [0.35, 0.75] },
    { s: 6,  top: '72%', left: '6%',  dur: 5.8, del: 0.4, op: [0.3, 0.6] },
    { s: 10, top: '18%', left: '88%', dur: 4.8, del: 0.9, op: [0.35, 0.8] },
    { s: 16, top: '42%', left: '90%', dur: 5.4, del: 1.6, op: [0.3, 0.7] },
    { s: 7,  top: '65%', left: '92%', dur: 6.0, del: 0.2, op: [0.4, 0.75] },
    { s: 12, top: '82%', left: '85%', dur: 4.2, del: 1.0, op: [0.3, 0.65] },
    { s: 5,  top: '35%', left: '22%', dur: 7.0, del: 1.8, op: [0.25, 0.55] },
    { s: 9,  top: '88%', left: '45%', dur: 5.6, del: 0.5, op: [0.3, 0.6] },
  ], []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {orbs.map((o, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            width: o.s, height: o.s, top: o.top, left: o.left,
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95) 0%, ${color}50 55%, ${color}20 100%)`,
            border: '1px solid rgba(255,255,255,0.65)',
            boxShadow: `0 2px 10px ${color}18, inset 0 1px 0 rgba(255,255,255,0.8)`,
          }}
          animate={{
            y: [-10, 10, -10],
            x: [-3, 3, -3],
            opacity: [o.op[0], o.op[1], o.op[0]],
            scale: [1, 1.12, 1],
          }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: o.del }}
        />
      ))}
    </div>
  );
}

/* ── Animated SVG Score Ring with double track ────────── */
function ScoreRing({ score, color, on }: { score: number; color: string; on: boolean }) {
  const R = 74, C = 2 * Math.PI * R, pct = score / 10;
  const R2 = 82, C2 = 2 * Math.PI * R2; // outer thin ring

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Layered glow rings */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full"
        style={{ inset: -16, background: `radial-gradient(circle, ${color}28 0%, transparent 65%)`, filter: 'blur(16px)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute rounded-full"
        style={{ inset: -30, background: `radial-gradient(circle, ${color}18 0%, transparent 60%)`, filter: 'blur(28px)' }}
      />

      <svg width="200" height="200" className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="hr-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="50%" stopColor={W.tealLight || '#22D3EE'} stopOpacity="0.85" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
          <filter id="hr-glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Outer decorative ring */}
        <circle cx="100" cy="100" r={R2} fill="none" stroke={`${color}12`} strokeWidth="1.5" strokeDasharray="4 8" />
        {/* Track */}
        <circle cx="100" cy="100" r={R} fill="none" stroke={`${color}14`} strokeWidth="7" />
        {/* Progress */}
        <motion.circle cx="100" cy="100" r={R} fill="none"
          stroke="url(#hr-grad)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={on ? { strokeDashoffset: C * (1 - pct) } : {}}
          transition={{ duration: 2, ease: [0.34, 1.56, 0.64, 1], delay: 0.4 }}
          filter="url(#hr-glow)"
        />
        {/* Tip glow dot (animated along ring) */}
        <motion.circle cx="100" cy={100 - R} r="5" fill={color}
          initial={{ opacity: 0 }}
          animate={on ? { opacity: [0, 1, 0.7] } : {}}
          transition={{ delay: 2, duration: 0.5 }}
          filter="url(#hr-glow)"
        />
      </svg>

      {/* Center glass orb — multi-layered */}
      <div className="relative flex flex-col items-center justify-center rounded-full"
        style={{
          width: 126, height: 126,
          background: 'linear-gradient(155deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.65) 45%, rgba(255,255,255,0.35) 100%)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1.5px solid rgba(255,255,255,0.92)',
          boxShadow: `0 16px 48px ${color}25, 0 4px 12px rgba(0,0,0,0.06), inset 0 2px 0 rgba(255,255,255,1)`,
        }}>
        {/* Inner sheen highlight */}
        <div className="absolute inset-x-0 top-0 rounded-t-full pointer-events-none"
          style={{ height: '52%', background: 'linear-gradient(180deg, rgba(255,255,255,0.80) 0%, transparent 100%)' }} />
        {/* Specular dot */}
        <div className="absolute pointer-events-none"
          style={{ top: '18%', left: '28%', width: 8, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', filter: 'blur(2px)', transform: 'rotate(-25deg)' }} />

        <span style={{ fontSize: 46, fontWeight: 900, color: W.textPrimary, letterSpacing: '-0.05em', lineHeight: 1, position: 'relative', zIndex: 1 }}>
          {on ? <AnimCount value={score} delay={0.5} /> : '0'}
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color: color, position: 'relative', zIndex: 1, marginTop: 2, opacity: 0.85 }}>/ ١٠</span>
      </div>
    </div>
  );
}

/* ── Triage Config ────────────────────────────────────── */
const TC: Record<string, { bg: string; bd: string; tx: string; dot: string; glow: string }> = {
  emergency:    { bg: 'rgba(254,242,242,0.92)', bd: 'rgba(220,38,38,0.30)', tx: '#991B1B', dot: '#DC2626', glow: 'rgba(220,38,38,0.20)' },
  urgent:       { bg: 'rgba(255,247,237,0.92)', bd: 'rgba(234,88,12,0.30)', tx: '#9A3412', dot: '#EA580C', glow: 'rgba(234,88,12,0.20)' },
  needs_doctor: { bg: 'rgba(240,249,255,0.92)', bd: 'rgba(8,145,178,0.30)', tx: '#0E7490', dot: '#0891B2', glow: 'rgba(8,145,178,0.20)' },
  review:       { bg: 'rgba(240,253,250,0.92)', bd: 'rgba(5,150,105,0.25)', tx: '#065F46', dot: '#059669', glow: 'rgba(5,150,105,0.18)' },
  manageable:   { bg: 'rgba(240,253,244,0.92)', bd: 'rgba(34,197,94,0.25)', tx: '#15803D', dot: '#22C55E', glow: 'rgba(34,197,94,0.18)' },
};

/* ── Triage human messages ────────────────────────────── */
const TRIAGE_HUMAN: Record<string, string> = {
  emergency:    'حالتك تحتاج تدخل طبي فوري. لا تتأخر.',
  urgent:       'حالتك تحتاج اهتمام عاجل. راجع طبيبك قريباً.',
  needs_doctor: 'حالتك تستحق متابعة طبية. جسمك يرسل إشارات مهمة.',
  review:       'حالتك مستقرة لكن تحتاج مراقبة. خطوات بسيطة ستحدث فرقاً.',
  manageable:   'حالتك جيدة. استمر في العناية بنفسك بذكاء.',
};

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════ */
export function ResultHero({ hero, vis, on, humanSummary, startTodayStep }: Props) {
  const tc = TC[hero.triageLevel] ?? TC.needs_doctor;

  return (
    <div className="relative overflow-hidden" dir="rtl"
      style={{
        minHeight: '90vh',
        background: `linear-gradient(175deg, rgba(255,255,255,0.98) 0%, ${vis.particleColor}08 20%, ${vis.particleColor}05 50%, rgba(255,255,255,0.96) 80%, ${vis.particleColor}04 100%)`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        paddingTop: 80, paddingBottom: 44,
      }}>

      {/* ── LAYER 1: Mesh gradient ambient ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-right domain glow */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '-10%', right: '-15%',
            width: 360, height: 360, borderRadius: '50%',
            background: `radial-gradient(circle, ${vis.particleColor}20 0%, transparent 60%)`,
            filter: 'blur(55px)',
          }}
        />
        {/* Center massive glow */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.50, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          style={{
            position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)',
            width: 500, height: 500, borderRadius: '50%',
            background: `radial-gradient(circle, ${vis.particleColor}18 0%, transparent 55%)`,
            filter: 'blur(70px)',
          }}
        />
        {/* Bottom-left lavender */}
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{
            position: 'absolute', bottom: '-8%', left: '-12%',
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(129,140,248,0.14) 0%, transparent 60%)',
            filter: 'blur(50px)',
          }}
        />
        {/* Top soft wash */}
        <div className="absolute top-0 inset-x-0"
          style={{ height: '30vh', background: `linear-gradient(180deg, ${vis.particleColor}0A 0%, transparent 100%)` }} />
      </div>

      {/* ── LAYER 2: Caustic light rays ── */}
      <CausticRays color={vis.particleColor} />

      {/* ── LAYER 3: Floating glass orbs ── */}
      <FloatingOrbs color={vis.particleColor} />

      {/* ── LAYER 4: Top glass shimmer ── */}
      <div className="absolute top-0 inset-x-0 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, transparent 100%)' }} />

      {/* ── LAYER 5: Moving shimmer band ── */}
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)' }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear', delay: 2 }}
      />

      {/* ═══ CONTENT ═══════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col items-center px-6 w-full" style={{ maxWidth: 400 }}>

        {/* Brand watermark */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={on ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.06 }}
          className="flex items-center gap-2 mb-6">
          <div className="h-px w-8" style={{ background: `linear-gradient(to right, transparent, ${vis.particleColor}30)` }} />
          <p style={{ fontSize: 9, fontWeight: 900, color: vis.textColor, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            طِبرَا · نتيجة تقييمك السريري
          </p>
          <div className="h-px w-8" style={{ background: `linear-gradient(to left, transparent, ${vis.particleColor}30)` }} />
        </motion.div>

        {/* Triage badge — glass pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -8 }}
          animate={on ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ delay: 0.12, type: 'spring', stiffness: 420, damping: 25 }}
          className="relative overflow-hidden flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-10"
          style={{
            background: tc.bg, border: `1.5px solid ${tc.bd}`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 6px 24px ${tc.glow}, inset 0 1px 0 rgba(255,255,255,0.75)`,
          }}>
          {/* Pill sheen */}
          <div className="absolute inset-x-0 top-0 h-[50%] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.60) 0%, transparent 100%)', borderRadius: '99px 99px 0 0' }} />
          {/* Pulsing dot with ripple */}
          <div className="relative w-2.5 h-2.5 flex-shrink-0">
            <motion.div
              animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full"
              style={{ background: tc.dot }}
            />
            <motion.div
              animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
              className="absolute inset-0 rounded-full"
              style={{ background: tc.dot }}
            />
            <div className="absolute inset-0 rounded-full" style={{ background: tc.dot, boxShadow: `0 0 8px ${tc.dot}` }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 900, color: tc.tx, letterSpacing: '0.02em', position: 'relative', zIndex: 1 }}>
            {hero.triageBadge}
          </span>
        </motion.div>

        {/* Score ring — centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, filter: 'blur(12px)' }}
          animate={on ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10">
          <ScoreRing score={hero.score} color={vis.particleColor} on={on} />
        </motion.div>

        {/* Domain + Pathway */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={on ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45, type: 'spring', stiffness: 280, damping: 28 }}
          className="text-center w-full mb-8">
          {/* Domain chip */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center relative overflow-hidden"
              style={{ background: `${vis.particleColor}12`, border: `1px solid ${vis.particleColor}20`, boxShadow: `0 4px 14px ${vis.particleColor}15` }}>
              <div className="absolute inset-x-0 top-0 h-[48%]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)', borderRadius: '10px 10px 0 0' }} />
              <span style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>{hero.domainEmoji}</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 800, color: vis.particleColor, letterSpacing: '0.03em' }}>
              القسم {hero.domainArabicName}
            </p>
          </div>

          <h1 style={{ fontSize: 30, fontWeight: 900, color: W.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.18, marginBottom: 10 }}>
            {hero.pathwayEmoji} {hero.pathwayLabel}
          </h1>

          {hero.integrativeInsight && (
            <p style={{ fontSize: 13.5, fontWeight: 500, color: '#6B7280', lineHeight: 1.75, maxWidth: 300, margin: '0 auto' }}>
              {hero.integrativeInsight}
            </p>
          )}
        </motion.div>

        {/* Stats row — frosted glass */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={on ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.58, type: 'spring', stiffness: 260, damping: 28 }}
          className="flex gap-3 w-full">
          {[
            { label: 'درجة الشدة', value: hero.severityDisplay, emoji: '📊' },
            { label: 'المدة',      value: hero.durationDisplay,  emoji: '🗓️' },
          ].map((s, i) => (
            <div key={i} className="flex-1 rounded-[22px] py-4 px-3 text-center relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.65)',
                border: '1.5px solid rgba(255,255,255,0.90)',
                backdropFilter: 'blur(22px)',
                boxShadow: `0 6px 24px ${vis.particleColor}08, 0 2px 8px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.95)`,
              }}>
              <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, transparent 100%)', borderRadius: '22px 22px 0 0' }} />
              <span style={{ fontSize: 18, display: 'block', marginBottom: 4, position: 'relative', zIndex: 1 }}>{s.emoji}</span>
              <p style={{ fontSize: 17, fontWeight: 900, color: W.textPrimary, position: 'relative', zIndex: 1, marginBottom: 2 }}>{s.value}</p>
              <p style={{ fontSize: 9, fontWeight: 800, color: vis.textColor, textTransform: 'uppercase', letterSpacing: '0.1em', position: 'relative', zIndex: 1 }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Human summary card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={on ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.66, type: 'spring', stiffness: 260, damping: 28 }}
          className="w-full mt-6 rounded-[24px] p-5 relative overflow-hidden"
          style={{
            background: `linear-gradient(160deg, ${tc.bg} 0%, rgba(255,255,255,0.70) 100%)`,
            border: `1.5px solid ${tc.bd}`,
            backdropFilter: 'blur(24px)',
            boxShadow: `0 8px 28px ${tc.glow}, inset 0 1.5px 0 rgba(255,255,255,0.90)`,
          }}>
          <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.60) 0%, transparent 100%)', borderRadius: '24px 24px 0 0' }} />
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full" style={{ background: tc.dot, boxShadow: `0 0 6px ${tc.dot}` }} />
          <p style={{ fontSize: 9, fontWeight: 900, color: tc.tx, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8, position: 'relative', zIndex: 1 }}>
            ✦ ملخص حالتك
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: tc.tx, lineHeight: 1.75, position: 'relative', zIndex: 1, marginBottom: humanSummary ? 8 : 0 }}>
            {TRIAGE_HUMAN[hero.triageLevel] ?? TRIAGE_HUMAN.needs_doctor}
          </p>
          {humanSummary && (
            <p style={{ fontSize: 12.5, fontWeight: 500, color: '#4B5563', lineHeight: 1.8, position: 'relative', zIndex: 1 }}>
              {humanSummary}
            </p>
          )}
        </motion.div>

        {/* ── First action step card ── */}
        {startTodayStep && (
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={on ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.76, type: 'spring', stiffness: 260, damping: 28 }}
            className="w-full mt-3 rounded-[24px] p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(240,253,244,0.90) 0%, rgba(255,255,255,0.70) 100%)',
              border: '1.5px solid rgba(34,197,94,0.22)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 8px 28px rgba(34,197,94,0.10), inset 0 1.5px 0 rgba(255,255,255,0.90)',
            }}>
            <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.60) 0%, transparent 100%)', borderRadius: '24px 24px 0 0' }} />
            <motion.div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)' }}
              animate={{ x: ['-120%', '200%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 4 }}
            />
            <div className="flex items-center gap-2 mb-3" style={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.14)', border: '1.5px solid rgba(34,197,94,0.25)' }}>
                <span style={{ fontSize: 14 }}>💡</span>
              </motion.div>
              <p style={{ fontSize: 9, fontWeight: 900, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                خطوتك الأولى اليوم
              </p>
            </div>
            <p style={{ fontSize: 13.5, fontWeight: 650, color: '#166534', lineHeight: 1.75, position: 'relative', zIndex: 1 }}>
              {startTodayStep}
            </p>
          </motion.div>
        )}

        {/* ── Session timestamp ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 0.9 }}
          className="flex items-center justify-center gap-2 mt-8 mb-2">
          <div className="h-px flex-1 max-w-12" style={{ background: `linear-gradient(to right, transparent, ${vis.particleColor}18)` }} />
          <div className="px-3 py-1 rounded-full relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.50)',
              border: '1px solid rgba(255,255,255,0.75)',
              backdropFilter: 'blur(12px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.80)',
            }}>
            <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%)' }} />
            <span style={{ fontSize: 8, fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.08em', position: 'relative', zIndex: 1 }}>
              🕐 {new Date().toLocaleDateString('ar', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="h-px flex-1 max-w-12" style={{ background: `linear-gradient(to left, transparent, ${vis.particleColor}18)` }} />
        </motion.div>

        {/* ── Scroll indicator ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 1.2 }}
          className="flex flex-col items-center mt-4 gap-2.5">
          <p style={{ fontSize: 9.5, fontWeight: 700, color: W.textMuted, letterSpacing: '0.08em' }}>
            اسحب للأسفل لتفاصيل خريطتك
          </p>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="relative overflow-hidden"
              style={{
                width: 28, height: 44, borderRadius: 14,
                border: `2px solid ${vis.particleColor}25`,
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8,
                background: 'rgba(255,255,255,0.40)',
                backdropFilter: 'blur(10px)',
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.70), 0 3px 12px ${vis.particleColor}08`,
              }}>
              {/* Glass sheen */}
              <div className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)', borderRadius: '12px 12px 0 0' }} />
              {/* Dot with trail */}
              <motion.div
                animate={{ y: [0, 14, 0], opacity: [1, 0.15, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="relative"
                style={{ width: 5, height: 5, borderRadius: '50%', background: vis.particleColor, boxShadow: `0 0 8px ${vis.particleColor}60`, zIndex: 1 }}>
                {/* Gradient trail */}
                <motion.div
                  animate={{ height: [0, 10, 0], opacity: [0, 0.4, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="absolute left-1/2 top-full"
                  style={{ width: 2, marginLeft: -1, background: `linear-gradient(to bottom, ${vis.particleColor}40, transparent)`, borderRadius: 1 }}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

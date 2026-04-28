// components/health-engine/result/v2/ResultTriDimCard.tsx
// ═══════════════════════════════════════════════════════════════
// TIBRAH v12 — Three-Dimensional Clinical Analysis Card
// Shows conventional · functional · somatic-emotional scores
// with animated SVG gauge arcs, pattern labels, and glass depth
// ═══════════════════════════════════════════════════════════════
'use client';
import { useEffect, useState } from 'react';
import { motion, animate, useMotionValue } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { TriDimBadgeBlock } from '../../types';
import type { DomainVisConfig } from '../shared/design-tokens';
import { W } from '../shared/design-tokens';

interface Props {
  triDim: TriDimBadgeBlock;
  vis: DomainVisConfig;
  on: boolean;
}

/* ── Animated counter ─────────────────────────────────── */
function Ct({ value, delay = 0 }: { value: number; delay?: number }) {
  const mv = useMotionValue(0);
  const [d, setD] = useState(0);
  useEffect(() => {
    const c = animate(mv, value, {
      duration: 1.5, ease: [0.16, 1, 0.3, 1], delay,
      onUpdate: v => setD(Math.round(v)),
    });
    return c.stop;
  }, [value, delay, mv]);
  return <>{d}</>;
}

/* ── SVG mini gauge arc ──────────────────────────────── */
function GaugeArc({ score, maxScore = 10, color, gradId, size = 90, delay = 0, on }: {
  score: number; maxScore?: number; color: string; gradId: string;
  size?: number; delay?: number; on: boolean;
}) {
  const cx = size / 2, cy = size / 2, r = (size / 2) - 10;
  // Draw 270° arc (from 135° to 405°)
  const totalAngle = 270;
  const startAngle = 135;
  const endAngle = startAngle + totalAngle;
  const pct = Math.min(score / maxScore, 1);

  const polarToXY = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const arcPath = (startA: number, endA: number, radius: number) => {
    const s = polarToXY(startA, radius);
    const e = polarToXY(endA, radius);
    const largeArc = (endA - startA) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const trackPath = arcPath(startAngle, endAngle, r);
  const progressEnd = startAngle + totalAngle * pct;
  const progressPath = arcPath(startAngle, progressEnd, r);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background glow */}
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full"
        style={{ inset: 2, background: `radial-gradient(circle, ${color}18 0%, transparent 60%)`, filter: 'blur(10px)' }}
      />
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.35" />
          </linearGradient>
          <filter id={`${gradId}-gl`}>
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Track */}
        <path d={trackPath} fill="none" stroke={`${color}12`} strokeWidth="5" strokeLinecap="round" />
        {/* Progress */}
        <motion.path
          d={progressPath}
          fill="none" stroke={`url(#${gradId})`} strokeWidth="5.5" strokeLinecap="round"
          filter={`url(#${gradId}-gl)`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={on ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ delay, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {/* Center value */}
      <div className="absolute flex flex-col items-center justify-center" style={{ top: '28%', left: 0, right: 0 }}>
        <span style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {on ? <Ct value={score} delay={delay} /> : '0'}
        </span>
        <span style={{ fontSize: 8, fontWeight: 700, color: '#9CA3AF', marginTop: 1 }}>/ {maxScore}</span>
      </div>
    </div>
  );
}

/* ── Dimension config ────────────────────────────────── */
const DIMS = [
  {
    key: 'conventional',
    label: 'التحليل التقليدي',
    sublabel: 'الشدة السريرية الكلاسيكية',
    emoji: '🏥',
    color: '#0891B2',
    gradId: 'td-conv',
  },
  {
    key: 'functional',
    label: 'الطب الوظيفي',
    sublabel: 'الأنماط الجذرية المُكتشفة',
    emoji: '⚙️',
    color: '#7C3AED',
    gradId: 'td-func',
  },
  {
    key: 'somatic',
    label: 'البعد الجسدي-النفسي',
    sublabel: 'الحمل العاطفي في الجسد',
    emoji: '🫀',
    color: '#DC2626',
    gradId: 'td-soma',
  },
];

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */
export function ResultTriDimCard({ triDim, vis, on }: Props) {
  const scores = [triDim.conventionalScore, triDim.functionalScore, triDim.somaticScore];
  const patterns = [null, triDim.topFunctionalPatternLabel, triDim.topSomaticThemeLabel];

  return (
    <>
      {/* Section divider */}
      <motion.div
        initial={{ opacity: 0, x: -12 }} animate={on ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.04 }}
        className="flex items-center gap-3 mx-4 mb-5">
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${vis.particleColor}28)` }} />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ background: `${vis.particleColor}08`, border: `1px solid ${vis.particleColor}15` }}>
          <Sparkles style={{ width: 9, height: 9, color: vis.particleColor }} />
          <p style={{ fontSize: 9.5, fontWeight: 900, color: W.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            التحليل ثلاثي الأبعاد
          </p>
        </div>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${vis.particleColor}28)` }} />
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={on ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.08, type: 'spring', stiffness: 240, damping: 28 }}
        className="relative overflow-hidden mx-4 mb-4"
        style={{
          borderRadius: 28,
          background: 'linear-gradient(160deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.40) 100%)',
          border: '1.5px solid rgba(255,255,255,0.90)',
          backdropFilter: 'blur(30px) saturate(160%)',
          boxShadow: '0 8px 36px rgba(8,145,178,0.08), 0 2px 10px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.95)',
        }}>
        {/* Sheen */}
        <div className="absolute inset-x-0 top-0 pointer-events-none"
          style={{ height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, transparent 100%)', borderRadius: '28px 28px 0 0' }} />
        {/* Specular */}
        <div className="absolute pointer-events-none"
          style={{ top: '10%', left: '18%', width: 45, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.48)', filter: 'blur(8px)' }} />
        {/* Top accent multicolor strip */}
        <div className="absolute top-0 left-[5%] right-[5%] h-[3px] rounded-b-full pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #0891B2 0%, #7C3AED 50%, #DC2626 100%)', boxShadow: '0 2px 12px rgba(124,58,237,0.25)' }} />
        {/* Shimmer */}
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%)' }}
          animate={{ x: ['-120%', '200%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 4 }}
        />

        {/* Content */}
        <div className="p-6 relative z-10">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-10 h-10 rounded-[14px] flex items-center justify-center relative overflow-hidden flex-shrink-0"
              style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.90) 0%, rgba(124,58,237,0.12) 100%)', border: '1.5px solid rgba(255,255,255,0.92)', boxShadow: '0 5px 20px rgba(124,58,237,0.15), inset 0 1.5px 0 rgba(255,255,255,0.95)' }}>
              <div className="absolute inset-x-0 top-0 h-[48%]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)', borderRadius: '12px 12px 0 0' }} />
              <span style={{ fontSize: 18, position: 'relative', zIndex: 1 }}>🔮</span>
            </motion.div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                INTEGRATIVE ANALYSIS
              </p>
              <p style={{ fontSize: 15, fontWeight: 900, color: W.textPrimary }}>التحليل التكاملي المتقدم</p>
            </div>
          </div>

          {/* 3 gauges in a row */}
          <div className="flex justify-center gap-2 mb-5">
            {DIMS.map((dim, i) => (
              <motion.div key={dim.key}
                initial={{ opacity: 0, y: 12 }} animate={on ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 300 }}
                className="flex flex-col items-center">
                <GaugeArc
                  score={scores[i]} color={dim.color} gradId={dim.gradId}
                  size={92} delay={0.2 + i * 0.12} on={on}
                />
                <span style={{ fontSize: 15, marginTop: -6, marginBottom: 3 }}>{dim.emoji}</span>
                <p style={{ fontSize: 9, fontWeight: 800, color: dim.color, textAlign: 'center', lineHeight: 1.2, maxWidth: 80 }}>
                  {dim.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Separator */}
          <div className="h-px mx-2 mb-5" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)' }} />

          {/* Pattern labels */}
          <div className="space-y-3">
            {DIMS.slice(1).map((dim, i) => {
              const pattern = patterns[i + 1];
              if (!pattern) return null;
              return (
                <motion.div key={dim.key}
                  initial={{ opacity: 0, x: -10 }} animate={on ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.55 + i * 0.08, type: 'spring', stiffness: 300 }}
                  className="flex items-start gap-3 rounded-[18px] p-4 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(155deg, rgba(255,255,255,0.58) 0%, ${dim.color}05 100%)`,
                    border: `1px solid rgba(255,255,255,0.80)`,
                    boxShadow: `0 2px 10px ${dim.color}06, inset 0 1px 0 rgba(255,255,255,0.80)`,
                  }}>
                  {/* Glass sheen */}
                  <div className="absolute inset-x-0 top-0 h-[42%] pointer-events-none"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%)', borderRadius: '18px 18px 0 0' }} />
                  {/* Accent bar */}
                  <div className="absolute top-2 bottom-2 right-0 w-[2.5px] rounded-l-full"
                    style={{ background: `linear-gradient(to bottom, ${dim.color}, ${dim.color}40)`, boxShadow: `0 0 6px ${dim.color}30` }} />

                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                    style={{ background: `${dim.color}12`, border: `1.5px solid ${dim.color}22` }}>
                    <div className="absolute inset-x-0 top-0 h-[48%]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)' }} />
                    <span style={{ fontSize: 14, position: 'relative', zIndex: 1 }}>{dim.emoji}</span>
                  </div>

                  <div className="flex-1" style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ fontSize: 9, fontWeight: 900, color: dim.color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 3 }}>
                      {dim.sublabel}
                    </p>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: W.textPrimary, lineHeight: 1.45 }}>
                      {pattern}
                    </p>
                  </div>

                  <div className="flex-shrink-0 px-2 py-1 rounded-full"
                    style={{ background: `${dim.color}10`, border: `1px solid ${dim.color}18` }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: dim.color }}>
                      {scores[DIMS.indexOf(dim)]}/10
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Interpretation footer */}
          <motion.div
            initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}
            className="mt-5 rounded-[16px] p-3.5 relative overflow-hidden"
            style={{ background: 'rgba(8,145,178,0.04)', border: '1px solid rgba(8,145,178,0.10)' }}>
            <div className="absolute inset-x-0 top-0 h-[42%] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.40) 0%, transparent 100%)', borderRadius: '16px 16px 0 0' }} />
            <p style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
              💡 التحليل التكاملي يجمع بين ثلاثة أبعاد تشخيصية: السريري التقليدي، والوظيفي (الأسباب الجذرية)، والجسدي-النفسي (العاطفة في الجسد). هذا يعطيك صورة أشمل من التشخيص التقليدي.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

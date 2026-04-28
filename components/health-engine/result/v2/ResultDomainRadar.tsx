// components/health-engine/result/v2/ResultDomainRadar.tsx
// ═══════════════════════════════════════════════════════════════
// TIBRAH v12 — ULTRA-RICH Domain Radar: خريطة الأبعاد الأربعة
// SVG spider chart + animated fill + domain orbs + why narrative
// Full glass treatment, ambient glows, staggered orbs
// ═══════════════════════════════════════════════════════════════
'use client';
import { useEffect, useState } from 'react';
import { motion, animate, useMotionValue } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { DomainCompassBlock, DomainId } from '../../types';
import { DOMAIN_BY_ID } from '@/lib/domain-routing-map';
import { W, DOMAIN_VIS } from '../shared/design-tokens';

/* ── Local animated number ─────────────────────────── */
function AnimScore({ value, delay = 0, suffix = '' }: { value: number; delay?: number; suffix?: string }) {
  const mv = useMotionValue(0);
  const [d, setD] = useState(0);
  useEffect(() => {
    const c = animate(mv, value, {
      duration: 1.4, ease: [0.16, 1, 0.3, 1], delay,
      onUpdate: v => setD(Math.round(v)),
    });
    return c.stop;
  }, [value, delay, mv]);
  return <>{d}{suffix}</>;
}

interface Props { compass: DomainCompassBlock; on: boolean }

/* ── Glass card ──────────────────────────────────────── */
function GCard({ children, delay = 0, on, accentColor }: {
  children: React.ReactNode; delay?: number; on: boolean; accentColor?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={on ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, type: 'spring', stiffness: 240, damping: 28 }}
      className="relative overflow-hidden mx-4 mb-4"
      style={{
        borderRadius: 28,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.40) 100%)',
        border: '1.5px solid rgba(255,255,255,0.90)',
        backdropFilter: 'blur(30px) saturate(160%)',
        boxShadow: '0 8px 36px rgba(8,145,178,0.08), 0 2px 10px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.95)',
      }}>
      <div className="absolute inset-x-0 top-0 pointer-events-none"
        style={{ height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, transparent 100%)', borderRadius: '28px 28px 0 0' }} />
      <div className="absolute pointer-events-none"
        style={{ top: '10%', left: '18%', width: 45, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.48)', filter: 'blur(8px)' }} />
      {accentColor && (
        <div className="absolute top-0 left-[12%] right-[12%] h-[3px] rounded-b-full pointer-events-none"
          style={{ background: `linear-gradient(90deg, ${accentColor}30, ${accentColor}90, ${accentColor}30)`, boxShadow: `0 2px 10px ${accentColor}30` }} />
      )}
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%)' }}
        animate={{ x: ['-120%', '200%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: delay + 3 }}
      />
      {children}
    </motion.div>
  );
}

/* ── Section divider ─────────────────────────────────── */
function SectionDivider({ label, color, delay, on }: { label: string; color: string; delay: number; on: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }} animate={on ? { opacity: 1, x: 0 } : {}}
      transition={{ delay }}
      className="flex items-center gap-3 mx-4 mb-5">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}28)` }} />
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
        style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
        <Sparkles style={{ width: 9, height: 9, color }} />
        <p style={{ fontSize: 9.5, fontWeight: 900, color: W.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{label}</p>
      </div>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}28)` }} />
    </motion.div>
  );
}

/* ── SVG Radar chart ─────────────────────────────────── */
const RDOMS: { id: DomainId; label: string; emoji: string; color: string; angle: number }[] = [
  { id: 'jasadi', label: 'جسدي', emoji: '🫀', color: '#0891B2', angle: -90  },
  { id: 'nafsi',  label: 'نفسي', emoji: '🧠', color: '#7C3AED', angle: 0    },
  { id: 'fikri',  label: 'فكري', emoji: '📚', color: '#D97706', angle: 90   },
  { id: 'ruhi',   label: 'روحي', emoji: '✨', color: '#0284C7', angle: 180  },
];

function RadarChart({ scores, primaryId, on }: {
  scores: Record<DomainId, number>; primaryId: DomainId; on: boolean;
}) {
  const SZ = 240, CX = SZ / 2, CY = SZ / 2, MR = 88;
  const mx = Math.max(...Object.values(scores), 1);
  const pt = (a: number, r: number) => {
    const rad = (a * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  };
  const poly = RDOMS.map(d => { const p = pt(d.angle, ((scores[d.id] ?? 0) / mx) * MR); return `${p.x},${p.y}`; }).join(' ');

  return (
    <div className="relative flex items-center justify-center" style={{ width: SZ, height: SZ }}>
      <svg width={SZ} height={SZ} viewBox={`0 0 ${SZ} ${SZ}`}>
        <defs>
          <linearGradient id="rf" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0891B2" stopOpacity="0.30" />
            <stop offset="50%" stopColor="#818CF8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.25" />
          </linearGradient>
          <filter id="rg"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <radialGradient id="centerOrb" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.60)" />
          </radialGradient>
        </defs>

        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1.0].map((lv, li) => {
          const pts = RDOMS.map(d => { const p = pt(d.angle, lv * MR); return `${p.x},${p.y}`; }).join(' ');
          return <polygon key={li} points={pts} fill="none" stroke={`rgba(8,145,178,${0.05 + li * 0.04})`} strokeWidth="1" />;
        })}

        {/* Axis lines */}
        {RDOMS.map(d => { const p = pt(d.angle, MR); return <line key={d.id} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="rgba(8,145,178,0.10)" strokeWidth="1" />; })}

        {/* Filled area */}
        <motion.polygon points={poly} fill="url(#rf)" stroke="rgba(8,145,178,0.50)" strokeWidth="2" strokeLinejoin="round" filter="url(#rg)"
          initial={{ opacity: 0, scale: 0 }} animate={on ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.5, duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* Data dots */}
        {RDOMS.map((d, i) => {
          const s = scores[d.id] ?? 0, r = (s / mx) * MR, p = pt(d.angle, r);
          const isPri = d.id === primaryId;
          return (
            <motion.circle key={d.id} cx={p.x} cy={p.y} r={isPri ? 8 : 5.5}
              fill={d.color} stroke="rgba(255,255,255,0.92)" strokeWidth={isPri ? 3 : 2}
              filter={isPri ? 'url(#rg)' : undefined}
              initial={{ opacity: 0, scale: 0 }} animate={on ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.7 + i * 0.08, type: 'spring', stiffness: 400, damping: 20 }}
            />
          );
        })}

        {/* Center orb */}
        <circle cx={CX} cy={CY} r={12} fill="url(#centerOrb)" stroke="rgba(8,145,178,0.22)" strokeWidth="1.5" />
        <text x={CX} y={CY + 4} textAnchor="middle" fontSize="11" fill="#0891B2">🧬</text>
      </svg>

      {/* Domain labels */}
      {RDOMS.map((d, i) => {
        const LR = MR + 30, p = pt(d.angle, LR), isPri = d.id === primaryId, s = scores[d.id] ?? 0;
        return (
          <motion.div key={d.id}
            initial={{ opacity: 0, scale: 0.7 }} animate={on ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.85 + i * 0.08, type: 'spring', stiffness: 350, damping: 24 }}
            className="absolute flex flex-col items-center"
            style={{ left: p.x - 26, top: p.y - 20, width: 52, textAlign: 'center' }}>
            <motion.div
              animate={isPri ? { scale: [1, 1.12, 1], boxShadow: [`0 4px 16px ${d.color}40`, `0 6px 22px ${d.color}60`, `0 4px 16px ${d.color}40`] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden"
              style={{
                background: isPri ? d.color : `${d.color}15`,
                border: isPri ? '2.5px solid rgba(255,255,255,0.88)' : `1px solid ${d.color}28`,
                boxShadow: isPri ? `0 4px 16px ${d.color}50` : 'none',
              }}>
              {isPri && <div className="absolute inset-x-0 top-0 h-[48%]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)' }} />}
              <span style={{ fontSize: isPri ? 14 : 12, position: 'relative', zIndex: 1 }}>{d.emoji}</span>
            </motion.div>
            <span style={{ fontSize: 8.5, fontWeight: 800, color: isPri ? d.color : '#9CA3AF', marginTop: 3 }}>{d.label}</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: isPri ? d.color : '#9CA3AF' }}>
              {on ? <AnimScore value={s} delay={0.9} suffix="%" /> : '0%'}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Domain chips ────────────────────────────────────── */
function DomainChips({ compass, on }: { compass: DomainCompassBlock; on: boolean }) {
  const priDom = DOMAIN_BY_ID[compass.primaryDomainId];
  const secDom = DOMAIN_BY_ID[compass.secondaryDomainId];
  const priVis = DOMAIN_VIS[compass.primaryDomainId];
  const secVis = DOMAIN_VIS[compass.secondaryDomainId];
  const chips = [
    { label: 'القسم الرئيسي', dom: priDom, dv: priVis },
    { label: 'القسم المساند', dom: secDom, dv: secVis },
  ];

  return (
    <div className="flex gap-3 px-6 mb-5">
      {chips.map(({ label, dom, dv }, i) => (
        <motion.div key={label}
          initial={{ opacity: 0, y: 12 }} animate={on ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.1 + i * 0.06, type: 'spring', stiffness: 300 }}
          className="flex-1 rounded-[22px] p-4 relative overflow-hidden"
          style={{
            background: dv.tint, border: `1.5px solid ${dv.border}`,
            backdropFilter: 'blur(14px)', boxShadow: `0 4px 18px ${dv.glow}`,
          }}>
          <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)', borderRadius: '22px 22px 0 0' }} />
          <p style={{ fontSize: 8, fontWeight: 900, color: dv.textColor, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6, position: 'relative', zIndex: 1 }}>
            {label}
          </p>
          <div className="flex items-center gap-2.5" style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 20 }}>{dom?.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: W.textPrimary }}>{dom?.arabicName}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════ */
export function ResultDomainRadar({ compass, on }: Props) {
  const vis = DOMAIN_VIS[compass.primaryDomainId];

  return (
    <>
      <SectionDivider label="خريطة صحتك الرباعية" color={vis.particleColor} delay={0.32} on={on} />

      <GCard delay={0.36} on={on} accentColor={vis.particleColor}>
        <div className="flex justify-center pt-7 pb-3 relative z-10">
          <RadarChart scores={compass.domainScores} primaryId={compass.primaryDomainId} on={on} />
        </div>

        <DomainChips compass={compass} on={on} />

        {/* Priority */}
        <motion.div initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 1.15 }}
          className="mx-6 mb-5 px-4 py-4 rounded-[20px] relative overflow-hidden"
          style={{ background: vis.tint, border: `1px solid ${vis.border}` }}>
          <div className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%)', borderRadius: '20px 20px 0 0' }} />
          <p style={{ fontSize: 9, fontWeight: 900, color: vis.textColor, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6, position: 'relative', zIndex: 1 }}>
            ✦ أولويتك هذا الأسبوع
          </p>
          <p style={{ fontSize: 13, fontWeight: 600, color: W.textPrimary, lineHeight: 1.8, position: 'relative', zIndex: 1 }}>
            {compass.priorityText}
          </p>
        </motion.div>

        {/* Why text */}
        <motion.div initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 1.22 }}
          className="mx-6 mb-6 px-4 py-4 rounded-[20px] relative overflow-hidden"
          style={{ background: 'rgba(8,145,178,0.04)', border: '1px solid rgba(8,145,178,0.10)' }}>
          <div className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)', borderRadius: '20px 20px 0 0' }} />
          <p style={{ fontSize: 9, fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6, position: 'relative', zIndex: 1 }}>
            لماذا هذا التوجيه؟
          </p>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', lineHeight: 1.85, position: 'relative', zIndex: 1 }}>
            {compass.whyText}
          </p>
        </motion.div>
      </GCard>
    </>
  );
}

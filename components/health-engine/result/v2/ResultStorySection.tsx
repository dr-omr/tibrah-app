// components/health-engine/result/v2/ResultStorySection.tsx
// ═══════════════════════════════════════════════════════════════
// TIBRAH v12 — ULTRA-RICH Story Section
// Clinical narrative · Confidence bar · Phenotype DNA · Key signals
// Multi-layered glass, shimmer, animated bars, staggered entrance
// ═══════════════════════════════════════════════════════════════
'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Activity, AlertTriangle, Sparkles } from 'lucide-react';
import type {
  ResultInsightBlock,
  ConfidencePhenotypeBlock,
  KeySignalPresentation,
} from '../../types';
import type { DomainVisConfig } from '../shared/design-tokens';
import { W } from '../shared/design-tokens';

interface Props {
  explanation: ResultInsightBlock;
  confidencePhenotype: ConfidencePhenotypeBlock;
  keySignals?: KeySignalPresentation[];
  vis: DomainVisConfig;
  on: boolean;
}

/* ── Luxury glass card ───────────────────────────────── */
function GlassCard({ children, delay = 0, on, accentColor, accentPos = 'top' }: {
  children: React.ReactNode; delay?: number; on: boolean;
  accentColor?: string; accentPos?: 'top' | 'right' | 'none';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={on ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, type: 'spring', stiffness: 240, damping: 28 }}
      className="relative overflow-hidden mx-4 mb-4"
      style={{
        borderRadius: 28,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.40) 100%)',
        border: '1.5px solid rgba(255,255,255,0.90)',
        backdropFilter: 'blur(30px) saturate(160%)',
        WebkitBackdropFilter: 'blur(30px) saturate(160%)',
        boxShadow: '0 8px 36px rgba(8,145,178,0.08), 0 2px 10px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.95)',
      }}>
      {/* Sheen top highlight */}
      <div className="absolute inset-x-0 top-0 pointer-events-none"
        style={{ height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.10) 55%, transparent 100%)', borderRadius: '28px 28px 0 0' }} />
      {/* Specular highlight dot */}
      <div className="absolute pointer-events-none"
        style={{ top: '12%', left: '20%', width: 40, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.50)', filter: 'blur(8px)' }} />
      {/* Top accent strip */}
      {accentColor && accentPos === 'top' && (
        <div className="absolute top-0 left-[12%] right-[12%] h-[3px] rounded-b-full pointer-events-none"
          style={{ background: `linear-gradient(90deg, ${accentColor}30, ${accentColor}90, ${accentColor}30)`, boxShadow: `0 2px 10px ${accentColor}35` }} />
      )}
      {/* Right accent bar */}
      {accentColor && accentPos === 'right' && (
        <div className="absolute top-4 bottom-4 right-0 w-[3px] rounded-l-full pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}40)`, boxShadow: `0 0 10px ${accentColor}40` }} />
      )}
      {/* Shimmer sweep */}
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%)' }}
        animate={{ x: ['-120%', '200%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: delay + 2 }}
      />
      {children}
    </motion.div>
  );
}

/* ── Section divider with glow ───────────────────────── */
function SectionDivider({ label, color, delay = 0, on }: {
  label: string; color: string; delay?: number; on: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }} animate={on ? { opacity: 1, x: 0 } : {}}
      transition={{ delay }}
      className="flex items-center gap-3 mx-4 mb-5">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}28)` }} />
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
        style={{ background: `${color}08`, border: `1px solid ${color}15`, backdropFilter: 'blur(10px)' }}>
        <Sparkles style={{ width: 9, height: 9, color }} />
        <p style={{ fontSize: 9.5, fontWeight: 900, color: W.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          {label}
        </p>
      </div>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}28)` }} />
    </motion.div>
  );
}

/* ── Icon orb ────────────────────────────────────────── */
function IconOrb({ emoji, color, size = 44 }: { emoji: string; color: string; size?: number }) {
  const br = Math.round(size * 0.32);
  return (
    <motion.div
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className="flex-shrink-0 relative overflow-hidden flex items-center justify-center"
      style={{
        width: size, height: size, borderRadius: br,
        background: `linear-gradient(145deg, rgba(255,255,255,0.90) 0%, ${color}15 100%)`,
        border: '1.5px solid rgba(255,255,255,0.92)',
        boxShadow: `0 5px 20px ${color}18, inset 0 1.5px 0 rgba(255,255,255,0.95)`,
      }}>
      <div className="absolute inset-x-0 top-0 pointer-events-none"
        style={{ height: '48%', background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)', borderRadius: `${br}px ${br}px 0 0` }} />
      <span style={{ fontSize: Math.round(size * 0.42), position: 'relative', zIndex: 1 }}>{emoji}</span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   ① Clinical Explanation Card
   ═══════════════════════════════════════════════════════ */
function ExplanationCard({ block, vis, delay, on }: {
  block: ResultInsightBlock; vis: DomainVisConfig; delay: number; on: boolean;
}) {
  return (
    <GlassCard delay={delay} on={on} accentColor={vis.particleColor} accentPos="top">
      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <IconOrb emoji="🔬" color={vis.particleColor} size={48} />
          <div>
            <p style={{ fontSize: 9, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              {block.sectionLabel}
            </p>
            <p style={{ fontSize: 15, fontWeight: 900, color: W.textPrimary }}>رأي طِبرَا السريري</p>
          </div>
        </div>

        {/* Body in styled block */}
        <div className="rounded-[20px] p-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(155deg, ${vis.particleColor}06 0%, rgba(255,255,255,0.50) 100%)`,
            border: `1px solid ${vis.particleColor}14`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.70)`,
          }}>
          {/* Inner shimmer */}
          <div className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)', borderRadius: '20px 20px 0 0' }} />
          <p style={{ fontSize: 13.5, fontWeight: 500, color: W.textPrimary, lineHeight: 1.9, position: 'relative', zIndex: 1 }}>
            {block.body}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════
   ② Confidence + Phenotype Card
   ═══════════════════════════════════════════════════════ */
function ConfPhenoCard({ block, vis, delay, on }: {
  block: ConfidencePhenotypeBlock; vis: DomainVisConfig; delay: number; on: boolean;
}) {
  const confColor = block.confidenceBand === 'high' ? '#059669'
    : block.confidenceBand === 'medium' ? '#D97706' : '#DC2626';
  const ConfIcon = block.confidenceBand === 'high' ? CheckCircle
    : block.confidenceBand === 'medium' ? Activity : AlertTriangle;
  const confLabel = block.confidenceBand === 'high' ? 'ثقة عالية'
    : block.confidenceBand === 'medium' ? 'ثقة متوسطة' : 'ثقة محدودة';
  const confGrad = block.confidenceBand === 'high'
    ? 'linear-gradient(90deg, #059669, #34D399, #059669)'
    : block.confidenceBand === 'medium'
      ? 'linear-gradient(90deg, #D97706, #FCD34D, #D97706)'
      : 'linear-gradient(90deg, #DC2626, #FCA5A5, #DC2626)';

  return (
    <GlassCard delay={delay} on={on} accentColor={confColor} accentPos="right">
      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <IconOrb emoji="📊" color={confColor} size={42} />
            <p style={{ fontSize: 14, fontWeight: 900, color: W.textPrimary }}>موثوقية التحليل</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full relative overflow-hidden"
            style={{ background: `${confColor}10`, border: `1.5px solid ${confColor}22` }}>
            <div className="absolute inset-x-0 top-0 h-[50%] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%)', borderRadius: '99px 99px 0 0' }} />
            <ConfIcon style={{ width: 11, height: 11, color: confColor, position: 'relative', zIndex: 1 }} />
            <span style={{ fontSize: 10.5, fontWeight: 900, color: confColor, position: 'relative', zIndex: 1 }}>{confLabel}</span>
          </div>
        </div>

        {/* Animated progress bar */}
        {block.confidenceScore > 0 && (
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <span style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                دقة النمذجة
              </span>
              <span style={{ fontSize: 11, fontWeight: 900, color: confColor }}>{block.confidenceScore}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden relative"
              style={{ background: `${confColor}10`, boxShadow: `inset 0 1px 2px rgba(0,0,0,0.06)` }}>
              <motion.div className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={on ? { width: `${block.confidenceScore}%` } : {}}
                transition={{ delay: delay + 0.35, duration: 1.2, ease: [0.05, 0.7, 0.1, 1] }}
                style={{ background: confGrad, boxShadow: `0 0 12px ${confColor}40` }}
              />
              {/* Glow tip */}
              <motion.div className="absolute top-0 h-full rounded-full"
                initial={{ left: 0 }}
                animate={on ? { left: `${block.confidenceScore}%` } : {}}
                transition={{ delay: delay + 0.35, duration: 1.2, ease: [0.05, 0.7, 0.1, 1] }}
                style={{ width: 4, background: 'rgba(255,255,255,0.9)', filter: `blur(2px)`, marginLeft: -2 }}
              />
            </div>
          </div>
        )}

        {/* Factor chips */}
        {block.confidenceFactors.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {block.confidenceFactors.map((f, i) => (
              <motion.span key={i}
                initial={{ opacity: 0, scale: 0.85 }} animate={on ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: delay + 0.5 + i * 0.06, type: 'spring', stiffness: 350 }}
                className="px-3 py-1.5 rounded-full relative overflow-hidden"
                style={{
                  fontSize: 10, fontWeight: 700, color: '#6B7280',
                  background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(203,213,225,0.50)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)',
                }}>
                <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)' }} />
                <span style={{ position: 'relative', zIndex: 1 }}>{f}</span>
              </motion.span>
            ))}
          </div>
        )}

        {/* Phenotype section */}
        {block.showPhenotype && block.phenotypeLabel && (
          <>
            <div className="h-px my-1" style={{ background: `linear-gradient(90deg, transparent, ${vis.particleColor}22, transparent)` }} />
            <div className="flex items-start gap-3.5 mt-5 rounded-[20px] p-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(155deg, ${vis.particleColor}07 0%, rgba(255,255,255,0.45) 100%)`,
                border: `1px solid ${vis.particleColor}18`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.65)`,
              }}>
              <div className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%)', borderRadius: '20px 20px 0 0' }} />
              <IconOrb emoji="🧬" color={vis.particleColor} size={44} />
              <div className="flex-1" style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 9, fontWeight: 900, color: vis.textColor, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                  النمط السريري المُستنتج
                </p>
                <p style={{ fontSize: 14, fontWeight: 800, color: W.textPrimary, lineHeight: 1.35, marginBottom: 8 }}>
                  {block.phenotypeLabel}
                </p>
                {block.phenotypeMatchScore > 0 && (
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: `${vis.particleColor}12` }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={on ? { width: `${block.phenotypeMatchScore}%` } : {}}
                        transition={{ delay: delay + 0.6, duration: 0.9, ease: 'easeOut' }}
                        style={{ background: vis.particleColor, boxShadow: `0 0 8px ${vis.particleColor}50` }}
                      />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 900, color: vis.textColor, flexShrink: 0 }}>
                      {block.phenotypeMatchScore}% تطابق
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════
   ③ Key Signals Card
   ═══════════════════════════════════════════════════════ */
function SignalsCard({ signals, vis, delay, on }: {
  signals: KeySignalPresentation[]; vis: DomainVisConfig; delay: number; on: boolean;
}) {
  if (!signals?.length) return null;
  const COLORS = ['#DC2626', '#EA580C', '#D97706', '#0891B2', '#7C3AED'];

  return (
    <GlassCard delay={delay} on={on} accentColor={vis.particleColor} accentPos="top">
      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <IconOrb emoji="🎯" color={vis.particleColor} size={42} />
          <p style={{ fontSize: 14, fontWeight: 900, color: W.textPrimary }}>
            إشارات التوجيه الكبرى
          </p>
        </div>

        <div className="space-y-3">
          {signals.map((sig, i) => {
            const c = COLORS[i % 5];
            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: -14 }} animate={on ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: delay + 0.1 + i * 0.07, type: 'spring', stiffness: 300, damping: 26 }}
                className="flex items-center gap-3 rounded-[16px] p-3 relative overflow-hidden"
                style={{
                  background: `linear-gradient(155deg, rgba(255,255,255,0.60) 0%, ${c}05 100%)`,
                  border: `1px solid rgba(255,255,255,0.80)`,
                  boxShadow: `0 2px 10px ${c}06, inset 0 1px 0 rgba(255,255,255,0.80)`,
                }}>
                <div className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%)', borderRadius: '16px 16px 0 0' }} />
                {/* Left accent bar */}
                <div className="absolute top-2 bottom-2 right-0 w-[2.5px] rounded-l-full"
                  style={{ background: `linear-gradient(to bottom, ${c}, ${c}40)`, boxShadow: `0 0 6px ${c}30` }} />

                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                  style={{ background: `${c}12`, border: `1.5px solid ${c}22` }}>
                  <div className="absolute inset-x-0 top-0 h-[48%]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)' }} />
                  <span style={{ fontSize: 12, position: 'relative', zIndex: 1 }}>{sig.emoji}</span>
                </div>

                <p className="flex-1" style={{ fontSize: 12.5, fontWeight: 650, color: '#374151', lineHeight: 1.5, position: 'relative', zIndex: 1 }}>
                  {sig.label}
                </p>

                {sig.weight > 0 && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                    style={{ background: `${c}10`, border: `1px solid ${c}20` }}>
                    <span style={{ fontSize: 9.5, fontWeight: 900, color: c, position: 'relative', zIndex: 1 }}>+{sig.weight}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */
export function ResultStorySection({ explanation, confidencePhenotype, keySignals, vis, on }: Props) {
  return (
    <>
      <SectionDivider label="ما فهمناه عنك" color={vis.particleColor} delay={0.04} on={on} />
      <ExplanationCard block={explanation} vis={vis} delay={0.08} on={on} />
      <ConfPhenoCard block={confidencePhenotype} vis={vis} delay={0.18} on={on} />
      {keySignals && <SignalsCard signals={keySignals} vis={vis} delay={0.28} on={on} />}
    </>
  );
}

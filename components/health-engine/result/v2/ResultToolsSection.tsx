// components/health-engine/result/v2/ResultToolsSection.tsx
// ═══════════════════════════════════════════════════════════════
// TIBRAH v12 — ULTRA-RICH Tools & Recommendations Section
// Glass cards, animated icon orbs, shimmer sweep, benefit strips,
// effort gauges, priority badges, staggered entrance
// ═══════════════════════════════════════════════════════════════
'use client';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft, Shield, Zap, TestTube2, PlayCircle, BarChart3, Sparkles, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { RecommendationGroup, RankedRecommendation } from '../../types';
import { W } from '../shared/design-tokens';
import { haptic } from '@/lib/HapticFeedback';
import { trackEvent } from '@/lib/analytics';
import { markToolOpened } from '@/lib/care-plan-store';

/* ── Type icons ──────────────────────────────────────── */
const TYPE_ICON: Record<string, typeof Shield> = {
  protocol: Shield, practice: Zap, test: TestTube2, workshop: PlayCircle, tracker: BarChart3,
};
const TYPE_LABEL: Record<string, string> = {
  protocol: 'بروتوكول', practice: 'تطبيق', test: 'اختبار', workshop: 'ورشة', tracker: 'متابعة',
};
const EFFORT_COLOR: Record<string, string> = {
  low: '#059669', medium: '#D97706', high: '#DC2626',
};

/* ── Icon orb ────────────────────────────────────────── */
function IconOrb({ emoji, accent, isPrimary }: { emoji: string; accent: string; isPrimary: boolean }) {
  return (
    <motion.div
      animate={isPrimary ? { scale: [1, 1.06, 1] } : {}}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative flex-shrink-0"
      style={{ width: 56, height: 56 }}>
      {/* Glow ring for primary */}
      {isPrimary && (
        <motion.div className="absolute rounded-[18px] pointer-events-none"
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ inset: -5, border: `2px solid ${accent}30`, boxShadow: `0 0 14px ${accent}20`, borderRadius: 22 }}
        />
      )}
      <div className="w-full h-full rounded-[18px] flex items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, rgba(255,255,255,0.92) 0%, ${accent}16 100%)`,
          border: '1.5px solid rgba(255,255,255,0.92)',
          boxShadow: `0 6px 24px ${accent}18, inset 0 1.5px 0 rgba(255,255,255,0.95)`,
        }}>
        {/* Sheen */}
        <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)', borderRadius: '16px 16px 0 0' }} />
        <span style={{ fontSize: 26, position: 'relative', zIndex: 1 }}>{emoji}</span>
        {/* Type badge dot */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: accent, border: '2.5px solid rgba(255,255,255,0.95)', boxShadow: `0 2px 8px ${accent}50` }}>
          {(() => { const I = TYPE_ICON['']; return null; })()}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Single recommendation card ─────────────────────── */
function ToolCard({ rec, index, on, isPrimary = false }: {
  rec: RankedRecommendation; index: number; on: boolean; isPrimary?: boolean;
}) {
  const Icon = TYPE_ICON[rec.type] ?? Shield;
  const accent = rec.accentColor;
  const efColor = EFFORT_COLOR[rec.effortLevel] ?? '#059669';

  const handleClick = () => {
    haptic.tap();
    markToolOpened(rec.id);
    trackEvent('primary_recommendation_clicked', { tool_id: rec.id, tool_type: rec.type, tool_name: rec.englishName });
  };

  return (
    <Link href={rec.href} onClick={handleClick}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={on ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.08 + index * 0.08, type: 'spring', stiffness: 240, damping: 26 }}
        whileTap={{ scale: 0.97, y: 1 }}
        className="relative overflow-hidden rounded-[26px] cursor-pointer mb-4"
        style={{
          background: isPrimary
            ? `linear-gradient(160deg, rgba(255,255,255,0.85) 0%, ${accent}10 45%, ${accent}06 100%)`
            : 'linear-gradient(160deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.52) 50%, rgba(255,255,255,0.40) 100%)',
          border: `1.5px solid ${isPrimary ? `${accent}28` : 'rgba(255,255,255,0.90)'}`,
          backdropFilter: 'blur(28px) saturate(160%)',
          boxShadow: isPrimary
            ? `0 12px 40px ${accent}16, 0 3px 10px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.95)`
            : '0 6px 28px rgba(8,145,178,0.06), 0 2px 8px rgba(0,0,0,0.03), inset 0 1.5px 0 rgba(255,255,255,0.92)',
        }}>

        {/* Glass sheen */}
        <div className="absolute inset-x-0 top-0 pointer-events-none"
          style={{ height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, transparent 100%)', borderRadius: '26px 26px 0 0' }} />
        {/* Specular */}
        <div className="absolute pointer-events-none"
          style={{ top: '8%', left: '15%', width: 40, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', filter: 'blur(6px)' }} />
        {/* Right accent bar */}
        <div className="absolute top-4 bottom-4 right-0 w-[3px] rounded-l-full pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}45)`, boxShadow: `0 0 10px ${accent}35` }} />
        {/* Shimmer for primary */}
        {isPrimary && (
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)' }}
            animate={{ x: ['-150%', '250%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 1.5 + index * 0.5 }}
          />
        )}

        {/* ── Main content ── */}
        <div className="flex items-start gap-4 p-5 pr-7 relative z-10">
          {/* Icon */}
          <motion.div
            animate={isPrimary ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex-shrink-0 relative" style={{ width: 56, height: 56 }}>
            {isPrimary && (
              <motion.div className="absolute pointer-events-none"
                animate={{ opacity: [0.12, 0.3, 0.12] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ inset: -5, borderRadius: 22, border: `2px solid ${accent}28`, boxShadow: `0 0 14px ${accent}18` }}
              />
            )}
            <div className="w-full h-full rounded-[18px] flex items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(145deg, rgba(255,255,255,0.92) 0%, ${accent}15 100%)`,
                border: '1.5px solid rgba(255,255,255,0.92)',
                boxShadow: `0 6px 22px ${accent}18, inset 0 1.5px 0 rgba(255,255,255,0.95)`,
              }}>
              <div className="absolute inset-x-0 top-0 h-[48%]"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)', borderRadius: '16px 16px 0 0' }} />
              <span style={{ fontSize: 25, position: 'relative', zIndex: 1 }}>{rec.emoji}</span>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: accent, border: '2.5px solid rgba(255,255,255,0.95)', boxShadow: `0 2px 8px ${accent}50` }}>
                <Icon className="text-white" style={{ width: 9, height: 9 }} />
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full"
                style={{ fontSize: 8, fontWeight: 900, color: accent, background: `${accent}10`, border: `1px solid ${accent}18`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {TYPE_LABEL[rec.type] ?? rec.type}
              </span>
              {isPrimary && (
                <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full"
                  style={{ fontSize: 7, fontWeight: 900, background: `${accent}14`, color: accent, border: `1px solid ${accent}22` }}>
                  <Star style={{ width: 7, height: 7 }} /> أولوية قصوى
                </span>
              )}
              {!rec.isFree && (
                <span className="px-2 py-0.5 rounded-full"
                  style={{ fontSize: 7, fontWeight: 800, background: 'rgba(251,191,36,0.14)', color: '#92400E', border: '1px solid rgba(251,191,36,0.28)' }}>
                  PRO
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full"
                style={{ fontSize: 7.5, fontWeight: 800, color: efColor, background: `${efColor}10`, border: `1px solid ${efColor}20` }}>
                {rec.effortLabel}
              </span>
            </div>

            {/* Name */}
            <p style={{ fontSize: 15, fontWeight: 900, color: W.textPrimary, lineHeight: 1.25, marginBottom: 5 }}>
              {rec.arabicName}
            </p>

            {/* Why now */}
            <p className="line-clamp-2" style={{ fontSize: 11, color: '#6B7280', fontWeight: 480, lineHeight: 1.65, marginBottom: 8 }}>
              {rec.whyNow}
            </p>

            {/* CTA pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full relative overflow-hidden"
              style={{ background: `${accent}10`, border: `1.5px solid ${accent}22`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.7)` }}>
              <div className="absolute inset-x-0 top-0 h-[50%] pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)' }} />
              <span style={{ fontSize: 10.5, fontWeight: 900, color: accent, position: 'relative', zIndex: 1 }}>{rec.ctaLabel}</span>
              <ChevronLeft style={{ width: 10, height: 10, color: accent, position: 'relative', zIndex: 1 }} />
            </div>
          </div>

          {/* Duration + nav */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2 pt-1">
            {rec.durationHint && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <Clock style={{ width: 9, height: 9, color: '#9CA3AF' }} />
                <span style={{ fontSize: 8.5, fontWeight: 700, color: '#9CA3AF' }}>{rec.durationHint}</span>
              </div>
            )}
            <div className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden"
              style={{ background: `${accent}10`, border: `1.5px solid ${accent}22` }}>
              <div className="absolute inset-x-0 top-0 h-[48%]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)' }} />
              <ChevronLeft style={{ width: 13, height: 13, color: accent, position: 'relative', zIndex: 1 }} />
            </div>
          </div>
        </div>

        {/* ── Benefit footer ── */}
        <div className="px-5 pb-5 relative z-10">
          <div className="flex items-start gap-2.5 rounded-[18px] px-4 py-3 relative overflow-hidden"
            style={{ background: `${accent}06`, border: `1px solid ${accent}12`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.55)` }}>
            <div className="absolute inset-x-0 top-0 h-[42%] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.40) 0%, transparent 100%)', borderRadius: '18px 18px 0 0' }} />
            <TrendingUp style={{ width: 12, height: 12, color: accent, flexShrink: 0, marginTop: 2, position: 'relative', zIndex: 1 }} />
            <p style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 500, lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
              {rec.expectedBenefit}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ── Group header ────────────────────────────────────── */
function GroupHeader({ header, color, count, delay, on }: {
  header: string; color: string; count: number; delay: number; on: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={on ? { opacity: 1, x: 0 } : {}}
      transition={{ delay }}
      className="flex items-center gap-3 mx-4 mb-3">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}22)` }} />
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full relative overflow-hidden"
        style={{ background: `${color}06`, border: `1px solid ${color}15`, backdropFilter: 'blur(10px)' }}>
        <div className="absolute inset-x-0 top-0 h-[50%] pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.40) 0%, transparent 100%)' }} />
        <span style={{ fontSize: 8.5, fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.16em', position: 'relative', zIndex: 1 }}>
          {header}
        </span>
        <span className="relative overflow-hidden rounded-full"
          style={{ fontSize: 9, fontWeight: 900, color, background: `${color}12`, padding: '2px 8px', border: `1px solid ${color}20` }}>
          <span style={{ position: 'relative', zIndex: 1 }}>{count}</span>
        </span>
      </div>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}22)` }} />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */
interface Props {
  groups: RecommendationGroup[];
  domainColor: string;
  on: boolean;
}

export function ResultToolsSection({ groups, domainColor, on }: Props) {
  if (!groups || groups.length === 0) return null;

  let cardIndex = 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 0.04 }}>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, x: -12 }} animate={on ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.02 }}
        className="flex items-center gap-3 mx-4 mb-5">
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${domainColor}28)` }} />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ background: `${domainColor}08`, border: `1px solid ${domainColor}15` }}>
          <Sparkles style={{ width: 9, height: 9, color: domainColor }} />
          <p style={{ fontSize: 9.5, fontWeight: 900, color: W.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            أدواتك المقترحة
          </p>
        </div>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${domainColor}28)` }} />
      </motion.div>

      {groups.map((group, gi) => {
        const isPrimaryGroup = gi === 0;
        const groupDelay = 0.06 + gi * 0.12;
        return (
          <div key={group.key} className="mb-3">
            <GroupHeader header={group.header} color={domainColor} count={group.recommendations.length} delay={groupDelay} on={on} />
            {group.recommendations.map(rec => {
              const idx = cardIndex++;
              return (
                <div key={rec.id} className="mx-4">
                  <ToolCard rec={rec} index={idx} on={on} isPrimary={isPrimaryGroup && idx === 0} />
                </div>
              );
            })}
          </div>
        );
      })}
    </motion.div>
  );
}

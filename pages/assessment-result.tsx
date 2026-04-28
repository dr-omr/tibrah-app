// pages/assessment-result.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH v10 — Standalone Assessment Result Page
// Narrative-sectioned, cinematic, world-class result experience
// ════════════════════════════════════════════════════════════════
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRight, ChevronDown } from 'lucide-react';
import {
  getLatestSession, getSessionById, touchSession,
  type AssessmentSession,
} from '@/lib/assessment-session-store';
import { trackEvent } from '@/lib/analytics';
import { haptic } from '@/lib/HapticFeedback';

import { PAGE_BG_RESULT, WATER_CAUSTIC_R, DOMAIN_VIS, W }
  from '@/components/health-engine/result/shared/design-tokens';

// v2 narrative components
import { ResultHero }         from '@/components/health-engine/result/v2/ResultHero';
import { ResultStorySection } from '@/components/health-engine/result/v2/ResultStorySection';
import { ResultDomainRadar }  from '@/components/health-engine/result/v2/ResultDomainRadar';
import { ResultActionPlan }   from '@/components/health-engine/result/v2/ResultActionPlan';
import { ResultToolsSection } from '@/components/health-engine/result/v2/ResultToolsSection';
import { ResultTriDimCard }   from '@/components/health-engine/result/v2/ResultTriDimCard';
import { ResultCTA }          from '@/components/health-engine/result/v2/ResultCTA';

// Keep escalation banner (critical safety — unchanged)
import { EscalationBanner } from '@/components/health-engine/result/EscalationBanner';
import { TayyibatVerdictCard } from '@/components/health-engine/result/TayyibatVerdictCard';
import { MedicalHistoryVerdictCard } from '@/components/health-engine/result/MedicalHistoryVerdictCard';

/* ── Section pill nav (floating dots) ───────────────── */
const NAV_SECTIONS = [
  { id: 'hero',    label: 'النتيجة'   },
  { id: 'story',   label: 'التحليل'   },
  { id: 'map',     label: 'الخريطة'   },
  { id: 'tridim',  label: 'الأبعاد'   },
  { id: 'plan',    label: 'الخطة'     },
  { id: 'tools',   label: 'الأدوات'   },
];

function SectionNav({ active, vis }: { active: string; vis: typeof DOMAIN_VIS[keyof typeof DOMAIN_VIS] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 28 }}
      className="fixed left-3 top-1/2 z-40 flex flex-col items-center gap-0 rounded-full py-2 px-[5px]"
      style={{
        transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,0.45)',
        border: '1px solid rgba(255,255,255,0.70)',
        backdropFilter: 'blur(18px) saturate(150%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.80)',
      }}>
      {NAV_SECTIONS.map((s, idx) => {
        const isActive = active === s.id;
        return (
          <div key={s.id} className="relative flex items-center">
            {/* Tooltip label (on active) */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, x: 6, scale: 0.85 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 6, scale: 0.85 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-full mr-2 px-2.5 py-1 rounded-full whitespace-nowrap pointer-events-none"
                  style={{
                    background: 'rgba(255,255,255,0.80)',
                    border: `1px solid ${vis.particleColor}25`,
                    backdropFilter: 'blur(12px)',
                    boxShadow: `0 3px 12px ${vis.particleColor}12, inset 0 1px 0 rgba(255,255,255,0.90)`,
                  }}>
                  <span style={{ fontSize: 8, fontWeight: 900, color: vis.textColor, letterSpacing: '0.04em' }}>
                    {s.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => { haptic.tap(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }}
              className="relative flex items-center justify-center cursor-pointer"
              style={{ width: 22, height: 22 }}
              whileTap={{ scale: 0.85 }}>
              {/* Glow ring */}
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute rounded-full"
                  style={{
                    inset: 1,
                    border: `1.5px solid ${vis.particleColor}40`,
                    boxShadow: `0 0 8px ${vis.particleColor}30`,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}
              {/* Dot */}
              <motion.div
                animate={{
                  width: isActive ? 9 : 5,
                  height: isActive ? 9 : 5,
                  background: isActive ? vis.particleColor : `rgba(156,163,175,0.40)`,
                  boxShadow: isActive ? `0 0 6px ${vis.particleColor}50` : '0 0 0 transparent',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                className="rounded-full"
              />
            </motion.button>
          </div>
        );
      })}
    </motion.div>
  );
}

/* ── Sticky top header ───────────────────────────────── */
function StickyHeader({
  session, vis, domainId, scrolled
}: {
  session: AssessmentSession;
  vis: typeof DOMAIN_VIS[keyof typeof DOMAIN_VIS];
  domainId: string;
  scrolled: boolean;
}) {
  const router = useRouter();
  const DOMAIN_EMOJI: Record<string, string> = { jasadi: '🫀', nafsi: '🧠', fikri: '📚', ruhi: '✨' };
  const DOMAIN_NAME:  Record<string, string> = { jasadi: 'جسدي', nafsi: 'نفسي', fikri: 'فكري', ruhi: 'روحي' };

  return (
    <motion.div
      className="fixed top-0 inset-x-0 z-30 px-4"
      animate={{
        paddingTop: scrolled ? 12 : 48,
        paddingBottom: scrolled ? 12 : 14,
        background: scrolled ? 'rgba(232,248,251,0.88)' : 'rgba(232,248,251,0)',
        backdropFilter: scrolled ? 'blur(32px) saturate(200%)' : 'blur(0px)',
      }}
      transition={{ duration: 0.25 }}>
      {/* Bottom border with gradient */}
      <motion.div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.70), transparent)' }}
      />
      {/* Glass sheen */}
      <motion.div className="absolute inset-x-0 top-0 pointer-events-none"
        animate={{ opacity: scrolled ? 1 : 0, height: scrolled ? '55%' : '0%' }}
        transition={{ duration: 0.25 }}
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%)' }}
      />

      <div className="flex items-center gap-3 relative z-10">
        {/* Back button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => { haptic.selection(); router.back(); }}
          className="relative overflow-hidden flex items-center justify-center flex-shrink-0"
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: W.glass, border: `1.5px solid ${W.glassBorder}`,
            backdropFilter: 'blur(20px)',
            boxShadow: W.glassShadow,
          }}>
          <div className="absolute inset-x-0 top-0 h-[50%]"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 100%)', borderRadius: '50% 50% 0 0' }} />
          <ArrowRight style={{ width: 16, height: 16, color: W.textSub, position: 'relative', zIndex: 1 }} />
        </motion.button>

        {/* Title — only shown when scrolled */}
        <AnimatePresence>
          {scrolled && (
            <motion.div className="flex-1"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
              <h1 style={{ fontSize: 16, fontWeight: 900, color: W.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                نتيجة التقييم
              </h1>
              <p style={{ fontSize: 9, fontWeight: 600, color: W.textMuted }}>
                {new Date(session.createdAt).toLocaleDateString('ar', { weekday: 'short', day: 'numeric', month: 'long' })}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mr-auto" />

        {/* Score mini badge */}
        <AnimatePresence>
          {scrolled && session.resultViewModel?.hero && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              className="flex items-center justify-center relative overflow-hidden flex-shrink-0"
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(255,255,255,0.75)',
                border: `2px solid ${vis.particleColor}30`,
                backdropFilter: 'blur(12px)',
                boxShadow: `0 3px 14px ${vis.glow}, inset 0 1px 0 rgba(255,255,255,0.90)`,
              }}>
              <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.60) 0%, transparent 100%)', borderRadius: '50% 50% 0 0' }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: vis.textColor, position: 'relative', zIndex: 1 }}>
                {session.resultViewModel.hero.score}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Domain badge */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full relative overflow-hidden"
              style={{ background: vis.tint, border: `1.5px solid ${vis.border}`, backdropFilter: 'blur(12px)', boxShadow: `0 2px 10px ${vis.glow}` }}>
              <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)', borderRadius: '50px 50px 0 0' }} />
              <span style={{ fontSize: 12, position: 'relative', zIndex: 1 }}>{DOMAIN_EMOJI[domainId] ?? '🧬'}</span>
              <span style={{ fontSize: 9.5, fontWeight: 900, color: vis.textColor, position: 'relative', zIndex: 1 }}>{DOMAIN_NAME[domainId] ?? domainId}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Loading spinner ─────────────────────────────────── */
function LoadingView() {
  return (
    <div dir="rtl" style={{ background: PAGE_BG_RESULT, minHeight: '100svh' }}
      className="flex flex-col items-center justify-center gap-6">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        {Object.values(WATER_CAUSTIC_R).map((g, i) => (
          <div key={i} className="absolute inset-0" style={{ background: g }} />
        ))}
      </div>

      {/* Spinner orb */}
      <div className="relative" style={{ width: 80, height: 80, zIndex: 1 }}>
        {/* Ambient glow */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-full"
          style={{ inset: -12, background: 'radial-gradient(circle, rgba(8,145,178,0.20) 0%, transparent 65%)', filter: 'blur(15px)' }}
        />
        {/* Spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{
            border: '3px solid rgba(8,145,178,0.12)',
            borderTopColor: '#0891B2',
            borderRightColor: 'rgba(8,145,178,0.35)',
            boxShadow: '0 0 20px rgba(8,145,178,0.18)',
          }}
        />
        {/* Inner glass orb */}
        <div className="absolute rounded-full flex items-center justify-center overflow-hidden"
          style={{
            inset: 10,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 100%)',
            border: '1.5px solid rgba(255,255,255,0.90)',
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.95), 0 6px 24px rgba(8,145,178,0.12)',
          }}>
          <div className="absolute inset-x-0 top-0 h-[50%] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)' }} />
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 24, position: 'relative', zIndex: 1 }}>🧬</motion.span>
        </div>
      </div>

      {/* Loading text */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center relative z-10">
        <p style={{ fontSize: 14, fontWeight: 800, color: '#0369A1', letterSpacing: '0.02em', marginBottom: 4 }}>
          جارٍ تحميل نتيجتك
        </p>
        <motion.div className="flex items-center justify-center gap-1">
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#0891B2' }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────── */
function EmptyView() {
  const router = useRouter();
  return (
    <div dir="rtl" style={{ background: PAGE_BG_RESULT, minHeight: '100svh' }}
      className="flex items-center justify-center p-6">
      <Head><title>نتيجة التقييم — طِبرَا</title></Head>
      <div className="fixed inset-0 pointer-events-none">
        {Object.values(WATER_CAUSTIC_R).map((g, i) => (
          <div key={i} className="absolute inset-0" style={{ background: g }} />
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        className="relative z-10 text-center max-w-xs w-full">

        {/* Glass card wrapper */}
        <div className="rounded-[32px] p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.40) 100%)',
            border: '1.5px solid rgba(255,255,255,0.90)',
            backdropFilter: 'blur(30px) saturate(160%)',
            boxShadow: '0 12px 48px rgba(8,145,178,0.10), inset 0 1.5px 0 rgba(255,255,255,0.95)',
          }}>
          {/* Sheen */}
          <div className="absolute inset-x-0 top-0 h-[50%] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, transparent 100%)', borderRadius: '32px 32px 0 0' }} />
          {/* Specular */}
          <div className="absolute pointer-events-none"
            style={{ top: '8%', left: '22%', width: 50, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.50)', filter: 'blur(9px)' }} />

          {/* Floating icon */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto mb-8 relative"
            style={{ width: 96, height: 96, zIndex: 1 }}>
            {/* Glow ring */}
            <motion.div className="absolute rounded-full pointer-events-none"
              animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ inset: -6, border: '2px solid rgba(8,145,178,0.25)', boxShadow: '0 0 20px rgba(8,145,178,0.15)' }}
            />
            <div className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(170deg, rgba(255,255,255,0.95) 0%, rgba(186,230,253,0.70) 60%, rgba(8,145,178,0.25) 100%)',
                border: '1.5px solid rgba(255,255,255,0.90)',
                boxShadow: '0 16px 48px rgba(8,145,178,0.20), inset 0 2px 0 rgba(255,255,255,0.98)',
              }}>
              <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)' }} />
              <span style={{ fontSize: 40, position: 'relative', zIndex: 1 }}>🧬</span>
            </div>
          </motion.div>

          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0C4A6E', marginBottom: 10, position: 'relative', zIndex: 1 }}>
            لا توجد نتيجة محفوظة
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 32, lineHeight: 1.75, position: 'relative', zIndex: 1 }}>
            أكمل التقييم لترى خريطتك الصحية الشخصية وخطتك العلاجية المخصصة
          </p>

          {/* CTA button */}
          <motion.div whileTap={{ scale: 0.96, y: 1 }}
            onClick={() => { haptic.impact(); router.push('/symptom-checker'); }}
            className="flex items-center justify-center gap-2 py-4 rounded-[22px] cursor-pointer relative overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.90) 0%, rgba(8,145,178,0.14) 60%, rgba(8,145,178,0.08) 100%)',
              border: '1.5px solid rgba(8,145,178,0.25)',
              boxShadow: '0 10px 36px rgba(8,145,178,0.18), inset 0 1.5px 0 rgba(255,255,255,0.95)',
              position: 'relative', zIndex: 1,
            }}>
            <div className="absolute inset-x-0 top-0 h-[50%] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)', borderRadius: '22px 22px 0 0' }} />
            {/* Shimmer */}
            <motion.div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)' }}
              animate={{ x: ['-150%', '250%'] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', delay: 1 }}
            />
            <span style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>🩺</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#0C4A6E', position: 'relative', zIndex: 1 }}>
              ابدأ تقييمك الآن
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Collapsible Section (Ultra-Rich Progressive Disclosure) ─ */
function CollapsibleSection({
  id, title, subtitle, emoji, color, expanded, onToggle, on, delay = 0, children,
}: {
  id: string; title: string; subtitle: string; emoji: string;
  color: string; expanded: boolean; onToggle: () => void;
  on: boolean; delay?: number; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={on ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 28 }}>

      {/* ── Header — clickable glass bar ── */}
      <motion.button
        onClick={() => { onToggle(); haptic.tap(); }}
        whileTap={{ scale: 0.975, y: 1 }}
        className="w-full flex items-center gap-3.5 mx-4 px-5 py-[18px] rounded-[24px] relative overflow-hidden cursor-pointer text-right"
        style={{
          width: 'calc(100% - 32px)',
          marginBottom: expanded ? 6 : 16,
          transition: 'margin-bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>

        {/* ─ Background with animated gradient ─ */}
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{
            background: expanded
              ? `linear-gradient(160deg, rgba(255,255,255,0.88) 0%, ${color}10 45%, ${color}06 100%)`
              : 'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.52) 50%, rgba(255,255,255,0.40) 100%)',
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ borderRadius: 24 }}
        />

        {/* ─ Border overlay (animated) ─ */}
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{
            boxShadow: expanded
              ? `inset 0 0 0 1.5px ${color}25, 0 8px 32px ${color}12, inset 0 1.5px 0 rgba(255,255,255,0.98)`
              : 'inset 0 0 0 1.5px rgba(255,255,255,0.88), 0 4px 18px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.92)',
            backdropFilter: expanded ? 'blur(30px) saturate(170%)' : 'blur(24px) saturate(140%)',
          }}
          transition={{ duration: 0.4 }}
          style={{ borderRadius: 24 }}
        />

        {/* ─ Glass sheen ─ */}
        <div className="absolute inset-x-0 top-0 h-[52%] pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.08) 100%)', borderRadius: '24px 24px 0 0' }} />

        {/* ─ Specular dot ─ */}
        <div className="absolute pointer-events-none"
          style={{ top: '16%', left: '20%', width: 32, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', filter: 'blur(6px)' }} />

        {/* ─ Top accent strip (animated in/out) ─ */}
        <motion.div className="absolute top-0 left-[8%] right-[8%] h-[2.5px] rounded-b-full pointer-events-none"
          animate={{
            opacity: expanded ? 1 : 0,
            scaleX: expanded ? 1 : 0.3,
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: `linear-gradient(90deg, transparent, ${color}90, transparent)`,
            boxShadow: `0 2px 12px ${color}30`,
            transformOrigin: 'center',
          }}
        />

        {/* ─ Shimmer sweep (only when expanded) ─ */}
        {expanded && (
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.20) 50%, transparent 70%)' }}
            initial={{ x: '-120%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        )}

        {/* ─ Icon orb with glow ring ─ */}
        <div className="relative flex-shrink-0" style={{ width: 42, height: 42, zIndex: 2 }}>
          {/* Glow ring (pulses when expanded) */}
          <motion.div className="absolute rounded-[14px] pointer-events-none"
            animate={expanded
              ? { opacity: [0.2, 0.45, 0.2], scale: [1, 1.08, 1] }
              : { opacity: 0, scale: 0.9 }}
            transition={expanded
              ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3 }}
            style={{
              inset: -4,
              border: `2px solid ${color}30`,
              boxShadow: `0 0 16px ${color}20`,
              borderRadius: 18,
            }}
          />
          {/* Orb body */}
          <motion.div
            animate={expanded ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-full rounded-[14px] flex items-center justify-center relative overflow-hidden"
            style={{
              background: expanded
                ? `linear-gradient(145deg, rgba(255,255,255,0.95) 0%, ${color}18 100%)`
                : `linear-gradient(145deg, rgba(255,255,255,0.85) 0%, ${color}10 100%)`,
              border: '1.5px solid rgba(255,255,255,0.92)',
              boxShadow: expanded
                ? `0 6px 20px ${color}20, inset 0 1.5px 0 rgba(255,255,255,0.98)`
                : `0 3px 12px ${color}10, inset 0 1px 0 rgba(255,255,255,0.85)`,
              transition: 'background 0.35s, box-shadow 0.35s',
            }}>
            {/* Inner sheen */}
            <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 100%)', borderRadius: '12px 12px 0 0' }} />
            <motion.span
              animate={expanded ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              style={{ fontSize: 18, position: 'relative', zIndex: 1 }}>
              {emoji}
            </motion.span>
          </motion.div>
        </div>

        {/* ─ Text ─ */}
        <div className="flex-1 min-w-0" style={{ position: 'relative', zIndex: 2 }}>
          <motion.p
            animate={{ color: expanded ? color : '#0C4A6E' }}
            transition={{ duration: 0.3 }}
            style={{ fontSize: 14.5, fontWeight: 900, lineHeight: 1.2, marginBottom: 3 }}>
            {title}
          </motion.p>
          <p style={{ fontSize: 10, fontWeight: 500, color: '#9CA3AF', lineHeight: 1.3 }}>{subtitle}</p>
        </div>

        {/* ─ Expand/Collapse badge ─ */}
        <div className="flex items-center gap-2 flex-shrink-0" style={{ position: 'relative', zIndex: 2 }}>
          {/* Label pill */}
          <motion.span
            animate={{ opacity: expanded ? 0 : 1, x: expanded ? 8 : 0 }}
            transition={{ duration: 0.25 }}
            className="px-2.5 py-1 rounded-full"
            style={{
              fontSize: 8, fontWeight: 800, color: '#9CA3AF',
              background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)',
              letterSpacing: '0.06em',
            }}>
            عرض
          </motion.span>

          {/* Chevron with glass orb */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden"
            style={{
              background: expanded ? `${color}14` : 'rgba(255,255,255,0.60)',
              border: `1.5px solid ${expanded ? `${color}22` : 'rgba(255,255,255,0.85)'}`,
              boxShadow: expanded
                ? `0 3px 10px ${color}15, inset 0 1px 0 rgba(255,255,255,0.70)`
                : 'inset 0 1px 0 rgba(255,255,255,0.80)',
              transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
            }}>
            <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%)' }} />
            <ChevronDown style={{ width: 14, height: 14, color: expanded ? color : '#9CA3AF', position: 'relative', zIndex: 1, transition: 'color 0.3s' }} />
          </motion.div>
        </div>
      </motion.button>

      {/* ── Content with rich animation ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key={`content-${id}`}
            initial={{ height: 0, opacity: 0, filter: 'blur(6px)' }}
            animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
            exit={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
            transition={{
              height: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.3, delay: 0.08 },
              filter: { duration: 0.3, delay: 0.05 },
            }}
            style={{ overflow: 'hidden' }}>
            {/* Connecting line from header to content */}
            <motion.div
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="mx-auto mb-2"
              style={{
                width: 1.5, height: 16,
                background: `linear-gradient(to bottom, ${color}30, transparent)`,
                transformOrigin: 'top',
              }}
            />
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════ */
export default function AssessmentResultPage() {
  const router = useRouter();
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [loading,  setLoading] = useState(true);
  const [on, setOn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleSection = (id: string) => setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));

  /* ── Load session ──────────────────────────────────── */
  useEffect(() => {
    if (!router.isReady) return;
    const id = router.query.id as string | undefined;
    const found = id ? getSessionById(id) : getLatestSession();
    if (found) {
      setSession(found);
      touchSession(found.id);
      trackEvent('assessment_result_reopened', { session_id: found.id, from: id ? 'direct_link' : 'latest' });
      if (router.query.animate === '1') {
        setTimeout(() => {
          setOn(true);
          haptic.trigger('heavy');
          const level = found.resultViewModel?.hero?.triageLevel || found.triageResult?.level;
          if (level === 'manageable' || level === 'review') {
            const domainId = found.resultViewModel?.domainId ?? 'jasadi';
            const vis = DOMAIN_VIS[domainId as keyof typeof DOMAIN_VIS];
            confetti({
              particleCount: 90, spread: 65, origin: { y: 0.75 },
              colors: [vis.particleColor, '#22D3EE', '#ffffff'],
              disableForReducedMotion: true, zIndex: 100,
            });
          }
        }, 180);
      } else {
        setOn(true);
      }
    }
    setLoading(false);
  }, [router.isReady, router.query.id, router.query.animate]);

  /* ── Scroll tracking ───────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      // Scroll progress
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? Math.min(y / docH, 1) : 0);
      // Active section detection
      const ids = ['hero', 'story', 'map', 'tridim', 'plan', 'tools'];
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(ids[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Render guards ─────────────────────────────────── */
  if (loading) return <LoadingView />;
  if (!session || !session.resultViewModel) return <EmptyView />;

  const vm = session.resultViewModel;
  const domainId = (vm.domainId ?? vm.hero?.domainId ?? 'jasadi') as keyof typeof DOMAIN_VIS;
  const vis = DOMAIN_VIS[domainId];

  return (
    <div dir="rtl" ref={scrollRef} style={{ background: PAGE_BG_RESULT, minHeight: '100svh', paddingBottom: 48 }}>
      <Head>
        <title>نتيجة تقييمك — طِبرَا</title>
        <meta name="description" content="نتيجة التقييم السريري المتكامل من طِبرَا" />
      </Head>

      {/* Global ambient caustic layer */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {Object.values(WATER_CAUSTIC_R).map((g, i) => (
          <div key={i} className="absolute inset-0" style={{ background: g }} />
        ))}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: -100, right: -80,
            width: 380, height: 380, borderRadius: '50%',
            background: `radial-gradient(circle, ${vis.particleColor}20 0%, transparent 65%)`,
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', bottom: -80, left: -60,
            width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(129,140,248,0.14) 0%, transparent 65%)',
            filter: 'blur(55px)',
          }}
        />
      </div>

      {/* Sticky header */}
      <StickyHeader session={session} vis={vis} domainId={domainId} scrolled={scrolled} />

      {/* Scroll progress bar */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
            <motion.div
              style={{
                height: 2.5,
                width: `${scrollProgress * 100}%`,
                background: `linear-gradient(90deg, ${vis.particleColor}, ${vis.particleColor}90)`,
                boxShadow: `0 0 10px ${vis.particleColor}50, 0 0 3px ${vis.particleColor}30`,
                borderRadius: '0 2px 2px 0',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating section nav dots */}
      <SectionNav active={activeSection} vis={vis} />

      {/* ════ CONTENT ════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ① Escalation banner — safety critical */}
        {vm.escalationBanner && (
          <div className="pt-14">
            <EscalationBanner block={vm.escalationBanner} on={on} />
          </div>
        )}

        {/* ② HERO — cinematic score reveal + human summary + first step */}
        <section id="hero">
          <ResultHero
            hero={vm.hero}
            vis={vis}
            on={on}
            humanSummary={vm.planHandoff?.mainDirection}
            startTodayStep={vm.planHandoff?.startTodayStep}
          />
        </section>

        {/* ── Glass separator ── */}
        <div className="flex items-center gap-4 mx-8 my-2">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${vis.particleColor}15)` }} />
          <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 rounded-full" style={{ background: vis.particleColor, boxShadow: `0 0 6px ${vis.particleColor}40` }} />
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${vis.particleColor}15)` }} />
        </div>

        {/* ③ STORY — clinical narrative (collapsible) */}
        <section id="story" className="pt-8 pb-2">
          <CollapsibleSection
            id="story"
            title="التحليل السريري"
            subtitle="ما فهمناه عنك وعن حالتك"
            emoji="🔬"
            color={vis.particleColor}
            expanded={expandedSections['story'] ?? true}
            onToggle={() => toggleSection('story')}
            on={on}
            delay={0.02}>
            <ResultStorySection
              explanation={vm.clinicalExplanation}
              confidencePhenotype={vm.confidencePhenotype}
              keySignals={vm.keySignals}
              vis={vis}
              on={on}
            />
          </CollapsibleSection>
        </section>

        {/* ④ MAP — 4-domain radar (collapsible) */}
        <section id="map" className="pt-4 pb-2">

          {/* Tayyibat verdict card — dietary analysis */}
          {vm.tayyibatVerdict && (
            <div className="mb-4">
              <TayyibatVerdictCard data={vm.tayyibatVerdict} vis={vis} on={on} />
            </div>
          )}

          {/* Medical history verdict card — history correlation */}
          {vm.medicalHistoryVerdict && (
            <div className="mb-4">
              <MedicalHistoryVerdictCard data={vm.medicalHistoryVerdict} vis={vis} on={on} />
            </div>
          )}
          <CollapsibleSection
            id="map"
            title="خريطة صحتك الرباعية"
            subtitle="الأبعاد الأربعة وتوزيع التأثر"
            emoji="🧭"
            color={vis.particleColor}
            expanded={expandedSections['map'] ?? false}
            onToggle={() => toggleSection('map')}
            on={on}
            delay={0.06}>
            <ResultDomainRadar compass={vm.domainCompass} on={on} />
          </CollapsibleSection>
        </section>

        {/* ④b TRIDIM — 3-dimensional clinical analysis (collapsible) */}
        <section id="tridim" className="pt-4 pb-2">
          <CollapsibleSection
            id="tridim"
            title="التحليل ثلاثي الأبعاد"
            subtitle="التقليدي · الوظيفي · الجسدي-النفسي"
            emoji="🔮"
            color={vis.particleColor}
            expanded={expandedSections['tridim'] ?? false}
            onToggle={() => toggleSection('tridim')}
            on={on}
            delay={0.10}>
            <ResultTriDimCard triDim={vm.triDimBadges} vis={vis} on={on} />
          </CollapsibleSection>
        </section>

        {/* ── Glass separator before plan ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={on ? { opacity: 1 } : {}} transition={{ delay: 0.15 }}
          className="flex items-center gap-4 mx-6 my-3">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${vis.particleColor}20)` }} />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: `${vis.particleColor}06`, border: `1px solid ${vis.particleColor}12`, backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: 10, position: 'relative', zIndex: 1 }}>⚡</span>
            <p style={{ fontSize: 8.5, fontWeight: 900, color: vis.textColor, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              خطتك العملية
            </p>
          </div>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${vis.particleColor}20)` }} />
        </motion.div>

        {/* ⑤ PLAN — action plan */}
        <section id="plan" className="pt-4 pb-2">
          <ResultActionPlan
            todayAction={vm.todayAction}
            monitoring={vm.monitoring}
            seekCare={vm.seekCare}
            consistencyNote={vm.consistencyNote}
            vis={vis}
            on={on}
          />
        </section>

        {/* ⑥ TOOLS — recommendations */}
        <section id="tools" className="pt-4 pb-2">
          <ResultToolsSection
            groups={vm.recommendationGroups}
            domainColor={vis.particleColor}
            on={on}
          />
        </section>

        {/* ⑦ CTA — next step */}
        <div className="pt-6">
          <ResultCTA
            vis={vis}
            sessionId={session.id}
            planHandoffText={vm.planHandoff?.mainDirection}
            revisitNote={vm.planHandoff?.revisitNote}
            reassessmentCondition={vm.planHandoff?.reassessmentCondition}
            showBookingCta={vm.planHandoff?.showBookingCta}
            on={on}
          />
        </div>
      </div>
    </div>
  );
}

'use client';

// components/health-engine/ui/AssessmentGlassShell.tsx
// ═══════════════════════════════════════════════════════════
// Unified mائي/زجاجي shell for ALL assessment steps
// Wraps intake, symptom-checker, reassessment, etc.
// Provides: animated background, step progress rail, header bar
// ═══════════════════════════════════════════════════════════

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PAGE_BG_ASSESSMENT, STEP_PALETTE, type StepPalette } from '../result/shared/design-tokens';

const ARABIC_FONT =
  'var(--font-alexandria), Alexandria, "IBM Plex Sans Arabic", "Noto Kufi Arabic", system-ui, -apple-system, sans-serif';

/* ── Types ────────────────────────────────────────────── */

export type AssessmentStepKey =
  | 'welcome'
  | 'history'
  | 'complaint'
  | 'severity'
  | 'modifiers'
  | 'hopi'
  | 'tayyibat'
  | 'review'
  | 'analyzing';

interface StepDotConfig {
  key: AssessmentStepKey;
  label: string;
}

/* ── Animated background orbs ─────────────────────────── */

function AquaticBackground({ color }: { color: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base gradient */}
      <div className="absolute inset-0" style={{ background: PAGE_BG_ASSESSMENT }} />

      {/* Primary color orb - top right */}
      <motion.div
        className="absolute -top-32 -right-32 rounded-full"
        animate={{ scale: [1, 1.12, 1], opacity: [0.28, 0.52, 0.28] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 380,
          height: 380,
          background: `radial-gradient(circle at 35% 30%, ${color}35, transparent 68%)`,
          filter: 'blur(56px)',
        }}
      />

      {/* Secondary teal orb - bottom left */}
      <motion.div
        className="absolute -bottom-24 -left-24 rounded-full"
        animate={{ y: [0, -14, 0], opacity: [0.20, 0.40, 0.20] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        style={{
          width: 320,
          height: 320,
          background: 'radial-gradient(circle, rgba(8,145,178,0.22), transparent 66%)',
          filter: 'blur(48px)',
        }}
      />

      {/* Caustic shimmer lines */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(115deg, rgba(255,255,255,0.30) 0 1px, transparent 1px 14px), linear-gradient(25deg, rgba(255,255,255,0.20) 0 1px, transparent 1px 18px)',
          backgroundSize: '48px 48px, 62px 62px',
        }}
      />

      {/* Top sheen */}
      <div
        className="absolute inset-x-0 top-0 h-36"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.42), transparent)' }}
      />
    </div>
  );
}

/* ── Step progress rail ───────────────────────────────── */

interface StepRailProps {
  steps: StepDotConfig[];
  currentKey: AssessmentStepKey;
  palette: StepPalette;
}

function StepProgressRail({ steps, currentKey, palette }: StepRailProps) {
  const currentIdx = steps.findIndex((s) => s.key === currentKey);
  const progress = steps.length > 1 ? currentIdx / (steps.length - 1) : 0;

  return (
    <div className="relative mx-auto flex max-w-xs items-center gap-1.5 py-2">
      {/* Track */}
      <div
        className="absolute inset-y-1/2 left-0 right-0 -translate-y-1/2 h-px"
        style={{ background: 'rgba(255,255,255,0.40)' }}
      />
      {/* Filled track */}
      <motion.div
        className="absolute inset-y-1/2 left-0 -translate-y-1/2 h-[2px] rounded-full"
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ background: `linear-gradient(90deg, ${palette.color}, ${palette.color}99)` }}
      />

      {/* Dots */}
      {steps.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <motion.div
            key={step.key}
            className="relative z-10 flex-1 flex justify-center"
            title={step.label}
          >
            <motion.div
              animate={{
                scale: active ? 1.2 : 1,
                background: done
                  ? palette.color
                  : active
                    ? palette.color
                    : 'rgba(255,255,255,0.50)',
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="rounded-full"
              style={{
                width: active ? 10 : 7,
                height: active ? 10 : 7,
                border: `1.5px solid ${done || active ? palette.color : 'rgba(255,255,255,0.62)'}`,
                boxShadow: active ? `0 0 0 3px ${palette.color}28` : 'none',
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Glass Header Bar ─────────────────────────────────── */

interface GlassHeaderProps {
  stepLabel: string;
  stepNumber: number;
  totalSteps: number;
  palette: StepPalette;
  onBack?: () => void;
  backIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  scrolled?: boolean;
}

export function AssessmentGlassHeader({
  stepLabel,
  stepNumber,
  totalSteps,
  palette,
  onBack,
  backIcon,
  rightSlot,
  scrolled = false,
}: GlassHeaderProps) {
  return (
    <motion.div
      animate={{
        paddingTop: scrolled ? 10 : 14,
        paddingBottom: scrolled ? 8 : 10,
        background: scrolled
          ? 'rgba(235,249,252,0.88)'
          : 'rgba(235,249,252,0.00)',
        backdropFilter: scrolled ? 'blur(28px) saturate(175%)' : 'blur(0px)',
      }}
      transition={{ duration: 0.22 }}
      className="sticky top-0 z-30 px-4"
      style={{ fontFamily: ARABIC_FONT }}
    >
      <div className="mx-auto flex max-w-md items-center gap-3 h-14">
        {/* Back button */}
        {onBack ? (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(255,255,255,0.88)',
              boxShadow: `0 6px 18px ${palette.color}12, inset 0 1px 0 rgba(255,255,255,0.90)`,
              color: palette.textColor,
            }}
            aria-label="رجوع"
          >
            {backIcon ?? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </motion.button>
        ) : (
          <div className="w-10 shrink-0" />
        )}

        {/* Center: step label + number */}
        <div className="flex-1 text-center min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepLabel}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.22 }}
            >
              <span
                className="block truncate"
                style={{ fontSize: 13.5, fontWeight: 900, color: palette.textColor, lineHeight: 1.25 }}
              >
                {stepLabel}
              </span>
              <span style={{ fontSize: 10, fontWeight: 750, color: `${palette.color}99` }}>
                {stepNumber} من {totalSteps}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right slot */}
        <div className="w-10 shrink-0 flex justify-end">
          {rightSlot}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Glass Card ───────────────────────────────────────── */

export function AssessmentGlassCard({
  children,
  palette,
  className = '',
  strong = false,
  noPad = false,
}: {
  children: React.ReactNode;
  palette: StepPalette;
  className?: string;
  strong?: boolean;
  noPad?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] ${noPad ? '' : 'p-5'} ${className}`}
      style={{
        background: strong
          ? `linear-gradient(155deg, rgba(255,255,255,0.95), rgba(255,255,255,0.78) 42%, rgba(238,252,255,0.58))`
          : `linear-gradient(150deg, rgba(255,255,255,0.88), rgba(255,255,255,0.64) 46%, rgba(232,250,255,0.44))`,
        border: '1px solid rgba(255,255,255,0.92)',
        backdropFilter: 'blur(36px) saturate(182%)',
        WebkitBackdropFilter: 'blur(36px) saturate(182%)',
        boxShadow: `0 20px 60px ${palette.color}18, 0 8px 24px rgba(6,54,75,0.06), inset 0 1.5px 0 rgba(255,255,255,0.98)`,
      }}
    >
      {/* Top highlight sheen */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[28px]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.80), rgba(255,255,255,0.12), transparent)' }}
      />
      {/* Color accent from top */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[28px]"
        style={{ background: `radial-gradient(ellipse 78% 32% at 18% 0%, ${palette.color}16, transparent 66%)` }}
      />
      {/* Top specular line */}
      <div
        className="pointer-events-none absolute left-[14%] right-[14%] top-0 h-[2.5px] rounded-b-full"
        style={{ background: `linear-gradient(90deg, transparent, ${palette.color}A0, transparent)` }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ── Main Shell ───────────────────────────────────────── */

interface AssessmentGlassShellProps {
  stepKey: AssessmentStepKey;
  steps?: StepDotConfig[];
  children: React.ReactNode;
  /** Override the palette completely */
  customPalette?: StepPalette;
}

export function AssessmentGlassShell({
  stepKey,
  steps,
  children,
  customPalette,
}: AssessmentGlassShellProps) {
  const palette = customPalette ?? STEP_PALETTE[stepKey] ?? STEP_PALETTE.welcome;
  const visibleSteps = steps?.filter(
    (s) => s.key !== 'analyzing' && s.key !== 'review',
  ) ?? [];

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden"
      style={{ fontFamily: ARABIC_FONT }}
    >
      <AquaticBackground color={palette.color} />

      {/* Step rail */}
      {visibleSteps.length > 1 && (
        <div className="relative z-20 px-4 pt-2">
          <StepProgressRail
            steps={visibleSteps}
            currentKey={stepKey}
            palette={palette}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ── Convenience hook ─────────────────────────────────── */

export function useStepPalette(stepKey: AssessmentStepKey): StepPalette {
  return STEP_PALETTE[stepKey] ?? STEP_PALETTE.welcome;
}

export { STEP_PALETTE };
export type { StepPalette };

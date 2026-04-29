'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Zap } from 'lucide-react';

const C = {
  ink:    '#0C4A6E',
  sub:    '#0369A1',
  muted:  '#64B5C9',
};

/* ── Collapsible hint row ──────────────────────────────────── */
function HintRow({ label, text, accent, icon }: {
  label: string; text: string; accent: string; icon: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 w-full text-right"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <span style={{ color: accent, flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 10.5, fontWeight: 800, color: accent, flex: 1 }}>{label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown style={{ width: 12, height: 12, color: accent }} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ fontSize: 10.5, lineHeight: 1.6, color: C.sub, fontWeight: 600, paddingTop: 5 }}>
              {text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WhyWeAskLine({ text, accent }: { text: string; accent: string }) {
  return (
    <HintRow
      label="لماذا نسأل؟"
      text={text}
      accent={accent}
      icon={<HelpCircle style={{ width: 11, height: 11 }} />}
    />
  );
}

export function QuestionImpactNote({ text, accent }: { text: string; accent: string }) {
  return (
    <HintRow
      label="كيف تؤثر الإجابة؟"
      text={text}
      accent={accent}
      icon={<Zap style={{ width: 11, height: 11 }} />}
    />
  );
}

/* ── SmartQuestionCard ──────────────────────────────────────── */
export function SmartQuestionCard({
  title,
  whyWeAsk,
  impact,
  children,
  stageLabel,
  badge,
  selectedCount,
  accent = '#0891B2',
  compact = false,
  priorityMode = false,
  index = 0,
}: {
  title: string;
  whyWeAsk: string;
  impact: string;
  children: ReactNode;
  stageLabel: string;
  badge?: string;
  selectedCount?: number;
  accent?: string;
  compact?: boolean;
  priorityMode?: boolean;
  index?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14, scale: 0.986 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.05 + index * 0.04, type: 'spring', stiffness: 260, damping: 28 }}
      className="mb-3"
      aria-label={title}
    >
      <div
        className={`relative overflow-hidden ${compact ? 'rounded-[20px] p-3.5' : 'rounded-[24px] p-4'}`}
        style={{
          background: priorityMode
            ? `linear-gradient(150deg, rgba(255,255,255,0.92) 0%, ${accent}10 100%)`
            : 'rgba(255,255,255,0.78)',
          border: `1.5px solid ${priorityMode ? `${accent}28` : 'rgba(255,255,255,0.94)'}`,
          backdropFilter: 'blur(28px) saturate(150%)',
          boxShadow: priorityMode
            ? `0 14px 38px ${accent}14, 0 3px 12px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.96)`
            : '0 6px 24px rgba(8,145,178,0.06), 0 2px 8px rgba(0,0,0,0.03), inset 0 1.5px 0 rgba(255,255,255,0.96)',
        }}
      >
        {/* Top shine */}
        <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.96)' }} />
        {/* Accent top strip */}
        <div className="absolute top-0 left-[14%] right-[14%] h-[2px] rounded-b-full pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}88, transparent)` }} />

        <div className="relative z-10">
          {/* Stage label + counter */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1"
              style={{ background: `${accent}0E`, border: `1px solid ${accent}1A`, color: accent, fontSize: 10, fontWeight: 900 }}>
              {stageLabel}
            </span>
            <AnimatePresence>
              {typeof selectedCount === 'number' && selectedCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                  className="rounded-full px-2.5 py-1"
                  style={{ background: `${accent}14`, border: `1px solid ${accent}26`, color: accent, fontSize: 10, fontWeight: 950 }}>
                  ✓ {selectedCount} محدد
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Question title — larger, dominant */}
          <h3 style={{
            fontSize: compact ? 15 : 17,
            fontWeight: 950,
            color: C.ink,
            lineHeight: 1.4,
            letterSpacing: '-0.015em',
            marginBottom: 10,
          }}>
            {title}
          </h3>
          {badge && (
            <p style={{ fontSize: 11, color: C.muted, fontWeight: 650, marginBottom: 8 }}>{badge}</p>
          )}

          {/* Hints — collapsed by default */}
          <div className="flex items-center gap-3 mb-4 px-0.5">
            <div className="flex-1">
              <WhyWeAskLine text={whyWeAsk} accent={accent} />
            </div>
            <div style={{ width: 1, height: 14, background: `${accent}20`, flexShrink: 0 }} />
            <div className="flex-1">
              <QuestionImpactNote text={impact} accent={accent} />
            </div>
          </div>

          {/* Options */}
          {children}
        </div>
      </div>
    </motion.section>
  );
}

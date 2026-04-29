'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';
import type { AssessmentFlowSnapshot } from '@/components/health-engine/types';

export function AdaptiveReasonRibbon({
  triggers,
  fallback,
  accent = '#059669',
}: {
  triggers: AssessmentFlowSnapshot['adaptiveTriggers'];
  fallback?: string;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const hasReasons = triggers.length > 0;

  if (!hasReasons && !fallback) return null;

  const summary = hasReasons
    ? triggers.slice(0, 2).map(t => t.trigger).join(' · ')
    : fallback ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-3"
    >
      {/* Compact toggle row */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 w-full text-right"
        style={{
          borderRadius: 14, padding: '7px 12px',
          background: `${accent}0A`,
          border: `1px solid ${accent}20`,
          backdropFilter: 'blur(16px)',
          cursor: 'pointer',
        }}
      >
        <Sparkles style={{ width: 11, height: 11, color: accent, flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 900, color: accent, flex: 1 }}>
          الأسئلة تتشكل حول إجاباتك
        </span>
        <span style={{
          fontSize: 9.5, fontWeight: 650, color: accent,
          maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          opacity: 0.75,
        }}>
          {summary}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown style={{ width: 12, height: 12, color: accent, flexShrink: 0 }} />
        </motion.span>
      </button>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="rounded-[14px] p-3 mt-1 grid gap-1.5"
              style={{ background: `${accent}08`, border: `1px solid ${accent}18`, backdropFilter: 'blur(14px)' }}>
              {hasReasons ? triggers.map(item => (
                <p key={`${item.trigger}-${item.caused}`}
                  style={{ fontSize: 11, lineHeight: 1.65, color: '#0369A1', fontWeight: 700 }}>
                  أضفنا هذا لأنك ذكرت: <span style={{ fontWeight: 900 }}>{item.trigger}</span>. {item.caused}
                </p>
              )) : (
                <p style={{ fontSize: 11, lineHeight: 1.65, color: '#0369A1', fontWeight: 700 }}>{fallback}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

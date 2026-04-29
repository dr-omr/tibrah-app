'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { haptic } from '@/lib/HapticFeedback';

const C = {
  ink:  '#0C4A6E',
  sub:  '#0369A1',
  muted:'#64B5C9',
};

export type SmartOption = {
  value: string;
  label: string;
  subtext?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

/* ── Native option pill/card ────────────────────────────────── */
export function OptionCard({
  option, selected, accent, index = 0, onSelect,
}: {
  option: SmartOption;
  selected: boolean;
  accent: string;
  index?: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 320, damping: 26 }}
      whileTap={option.disabled ? undefined : { scale: 0.965, y: 1 }}
      disabled={option.disabled}
      onClick={() => { haptic.selection(); onSelect(); }}
      className="relative text-right focus:outline-none w-full"
      style={{
        borderRadius: 18,
        padding: '11px 14px',
        background: selected
          ? `linear-gradient(150deg, rgba(255,255,255,0.94) 0%, ${accent}10 100%)`
          : 'rgba(255,255,255,0.55)',
        border: `1.5px solid ${selected ? `${accent}28` : 'rgba(255,255,255,0.86)'}`,
        boxShadow: selected
          ? `0 8px 22px ${accent}14, 0 2px 6px rgba(0,0,0,0.03), inset 0 1.5px 0 rgba(255,255,255,0.98)`
          : 'inset 0 1px 0 rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px) saturate(140%)',
        opacity: option.disabled ? 0.45 : 1,
        transition: 'background 200ms, border-color 200ms, box-shadow 200ms',
      }}
      aria-pressed={selected}
    >
      {/* Top shine line */}
      <div className="absolute inset-x-0 top-0 h-px rounded-t-[18px] pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.92)' }} />

      {/* Selected accent strip */}
      {selected && (
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.25 }}
          className="absolute top-0 left-[20%] right-[20%] h-[2px] rounded-b-full pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}CC, transparent)`, transformOrigin: 'center' }}
        />
      )}

      <span className="flex items-center gap-2.5">
        {option.icon && <span className="shrink-0">{option.icon}</span>}
        <span className="flex-1 min-w-0">
          <span style={{
            display: 'block', fontSize: 13, fontWeight: selected ? 900 : 700,
            color: selected ? C.ink : C.sub, lineHeight: 1.4,
            transition: 'color 0.2s, font-weight 0.2s',
          }}>
            {option.label}
          </span>
          {option.subtext && (
            <span style={{ display: 'block', marginTop: 3, fontSize: 10.5, fontWeight: 550, color: C.muted, lineHeight: 1.5 }}>
              {option.subtext}
            </span>
          )}
        </span>
        {/* Check badge */}
        <AnimatePresence>
          {selected && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 22 }}
              className="rounded-full flex items-center justify-center shrink-0"
              style={{
                width: 24, height: 24,
                background: accent,
                boxShadow: `0 4px 10px ${accent}40`,
              }}>
              <Check style={{ width: 12, height: 12, color: '#fff', strokeWidth: 3 }} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

export function OptionCardGroup({
  options,
  value,
  multiple = false,
  accent = '#0891B2',
  onChange,
}: {
  options: SmartOption[];
  value: string | string[] | number | undefined;
  multiple?: boolean;
  accent?: string;
  onChange: (value: string) => void;
}) {
  const isSelected = (optionValue: string) => Array.isArray(value)
    ? value.includes(optionValue)
    : value === optionValue;

  return (
    <div className="grid grid-cols-1 gap-2" role="group">
      {options.map((option, i) => (
        <OptionCard
          key={option.value}
          option={option}
          selected={isSelected(option.value)}
          accent={accent}
          index={i}
          onSelect={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}

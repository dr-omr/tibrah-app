// components/daily-log/daily-log-ui.tsx
// ════════════════════════════════════════════════════════
// Shared UI components for Daily Log
// ════════════════════════════════════════════════════════

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { STEPS_ORDERED, SPRING, type StepType } from './daily-log-data';

/* ─── GlassCard ──────────────────────────────── */
export function GlassCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={{
      background: 'rgba(255,255,255,0.78)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.6)',
      boxShadow: '0 0 0 0.5px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
      borderRadius: 24, ...style,
    }}>{children}</div>
  );
}

/* ─── StepDots ───────────────────────────────── */
export function StepDots({ current }: { current: StepType }) {
  const idx = STEPS_ORDERED.indexOf(current as any);
  if (idx < 0) return null;
  return (
    <div className="flex gap-1.5 justify-center">
      {STEPS_ORDERED.map((_, i) => (
        <motion.div key={i}
          animate={{ width: i === idx ? 20 : 6, background: i === idx ? '#0d9488' : 'rgba(0,0,0,0.15)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{ height: 6, borderRadius: 3 }} />
      ))}
    </div>
  );
}

/* ─── MetalDial ──────────────────────────────── */
export function MetalDial({ value, onChange, min = 0, max = 10, color }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; color: string;
}) {
  return (
    <div className="relative">
      <div className="flex justify-between mb-1 px-1">
        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>{min}</span>
        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>{max}</span>
      </div>
      <div className="relative h-10 flex items-center px-2">
        <div className="absolute inset-x-2 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.08)' }} />
        <motion.div className="absolute right-2 h-1.5 rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)`, width: `${((value - min) / (max - min)) * 100}%`, left: 'auto' }}
          animate={{ width: `${((value - min) / (max - min)) * 100}%` }} transition={SPRING} />
        <input type="range" min={min} max={max} value={value}
          onChange={e => { onChange(Number(e.target.value)); haptic.selection(); uiSounds.select(); }}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" style={{ zIndex: 10 }} />
        <motion.div className="absolute pointer-events-none"
          animate={{ left: `${((value - min) / (max - min)) * (100 - 12)}%` }} transition={SPRING}
          style={{
            width: 28, height: 28, borderRadius: 14, background: '#ffffff',
            boxShadow: `0 0 0 1.5px ${color}44, 0 3px 10px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.8) inset`,
            top: '50%', transform: 'translateY(-50%)',
          }} />
      </div>
    </div>
  );
}

/* ─── NavButtons ─────────────────────────────── */
export function NavButtons({ onBack, onNext, nextLabel = 'التالي', nextColor = '#0d9488', disabled = false }: {
  onBack?: () => void; onNext: () => void; nextLabel?: string; nextColor?: string; disabled?: boolean;
}) {
  return (
    <div className="flex gap-3">
      {onBack && (
        <motion.button whileTap={{ scale: 0.95 }} onClick={onBack}
          className="w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <ChevronLeft className="w-5 h-5 text-slate-500" style={{ transform: 'rotate(180deg)' }} />
        </motion.button>
      )}
      <motion.button whileTap={disabled ? {} : { scale: 0.97 }} onClick={disabled ? undefined : onNext}
        disabled={disabled}
        className="flex-1 h-14 rounded-[18px] flex items-center justify-center gap-2 font-bold relative overflow-hidden"
        style={{
          background: disabled ? 'rgba(148,163,184,0.2)' : `linear-gradient(135deg, ${nextColor}, ${nextColor}dd)`,
          boxShadow: disabled ? 'none' : `0 4px 20px ${nextColor}30`,
          color: disabled ? '#94a3b8' : '#fff', fontSize: 15,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}>
        {!disabled && <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 55%)' }} />}
        <span className="relative z-10">{nextLabel}</span>
        {!disabled && <ChevronLeft className="w-4 h-4 relative z-10" style={{ color: 'rgba(255,255,255,0.7)' }} />}
      </motion.button>
    </div>
  );
}

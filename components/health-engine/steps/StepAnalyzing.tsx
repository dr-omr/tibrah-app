'use client';
// StepAnalyzing — Full Native Glass Redesign
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const PHASES = [
  { label: 'نراجع المسار والشدة والمدة',       icon: '🗺️', color: '#0787A5' },
  { label: 'نقارن النمط والإشارات المتكررة',   icon: '📊', color: '#7C3AED' },
  { label: 'نربط الغذاء والنوم والسياق',        icon: '🥗', color: '#059669' },
  { label: 'نجهّز خريطة حالتك الكاملة',         icon: '🎯', color: '#D97706' },
];

const C = {
  bg:   'linear-gradient(168deg,#E8F8FB 0%,#D9F1F7 30%,#EEF7FF 66%,#F8FCFD 100%)',
  ink:  '#073B52',
  sub:  '#0F6F8F',
  muted:'#639CAF',
  teal: '#0787A5',
};

export function StepAnalyzing() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive(c => Math.min(c + 1, PHASES.length - 1));
    }, 1100);
    return () => window.clearInterval(timer);
  }, []);

  const pct = Math.round(((active + 1) / PHASES.length) * 100);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-5" dir="rtl" style={{ background: C.bg }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.14, 1], opacity: [0.40, 0.76, 0.40] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '10%', right: '6%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(34,211,238,0.22),transparent 64%)', filter: 'blur(52px)' }}
        />
        <div style={{ position: 'absolute', bottom: '12%', left: '-8%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.12),transparent 64%)', filter: 'blur(50px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Central orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="mx-auto mb-8 flex items-center justify-center relative overflow-hidden"
          style={{
            width: 128, height: 128, borderRadius: 46,
            background: 'linear-gradient(145deg,rgba(255,255,255,0.94),rgba(186,230,253,0.84),rgba(34,211,238,0.76))',
            border: '1.5px solid rgba(255,255,255,0.94)',
            boxShadow: '0 22px 64px rgba(8,145,178,0.26), inset 0 2px 0 rgba(255,255,255,0.96)',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
            style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.72),transparent)', borderRadius: '44px 44px 0 0' }} />
          {/* Rotating ring */}
          <motion.div
            className="absolute inset-4 rounded-[34px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            style={{ border: '1.5px solid transparent', borderTopColor: 'rgba(8,145,178,0.40)', borderRightColor: 'rgba(34,211,238,0.26)' }}
          />
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-[44px]"
            style={{ background: 'linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.30) 50%,transparent 70%)' }}
            animate={{ x: ['-120%', '200%'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
          />
          <span style={{ fontSize: 42, position: 'relative', zIndex: 1 }}>🧠</span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 240, damping: 26 }}
          className="text-center mb-6"
        >
          <h2 style={{ fontSize: 22, fontWeight: 950, color: C.ink, letterSpacing: '-0.02em', marginBottom: 5 }}>
            نبني خريطة حالتك
          </h2>
          <p style={{ fontSize: 12, color: C.sub, fontWeight: 650, lineHeight: 1.55 }}>
            نحوّل إجاباتك إلى قراءة وخطوة عملية
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-6 rounded-full overflow-hidden"
          style={{ height: 4, background: 'rgba(8,145,178,0.10)', border: '1px solid rgba(8,145,178,0.10)' }}>
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#0891B2,#22D3EE)' }}
          />
        </div>

        {/* Phase rows */}
        <div className="grid gap-2">
          {PHASES.map((phase, i) => {
            const done    = i < active;
            const current = i === active;
            return (
              <motion.div
                key={phase.label}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 28 }}
                className="relative overflow-hidden flex items-center gap-3"
                style={{
                  borderRadius: 18, padding: '11px 14px',
                  background: current
                    ? `linear-gradient(150deg,rgba(255,255,255,0.92) 0%,${phase.color}0E 100%)`
                    : done
                      ? 'rgba(255,255,255,0.48)'
                      : 'rgba(255,255,255,0.30)',
                  border: `1.5px solid ${current ? `${phase.color}22` : 'rgba(255,255,255,0.78)'}`,
                  backdropFilter: 'blur(16px)',
                  boxShadow: current ? `0 6px 18px ${phase.color}10, inset 0 1.5px 0 rgba(255,255,255,0.94)` : 'inset 0 1px 0 rgba(255,255,255,0.80)',
                  transition: 'background 300ms, border-color 300ms',
                }}
              >
                {/* top accent strip on current */}
                {current && (
                  <motion.div
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    className="absolute top-0 left-[15%] right-[15%] h-[2px] rounded-b-full pointer-events-none"
                    style={{ background: `linear-gradient(90deg,transparent,${phase.color}88,transparent)`, transformOrigin: 'center' }}
                  />
                )}
                {/* icon orb */}
                <div className="shrink-0 flex items-center justify-center rounded-[12px]"
                  style={{ width: 36, height: 36, background: `${phase.color}0E`, border: `1px solid ${phase.color}1E`, fontSize: 18 }}>
                  {done ? <Check style={{ width: 15, height: 15, color: phase.color, strokeWidth: 3 }} /> : phase.icon}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: current ? 900 : done ? 750 : 600,
                  color: current ? C.ink : done ? C.sub : C.muted,
                  lineHeight: 1.35, flex: 1,
                  transition: 'color 250ms, font-weight 250ms',
                }}>
                  {phase.label}
                </span>
                {/* Pulsing dot on current */}
                {current && (
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: phase.color, flexShrink: 0 }}
                  />
                )}
                {done && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                      style={{ width: 20, height: 20, borderRadius: '50%', background: `${phase.color}18`, border: `1px solid ${phase.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      <Check style={{ width: 10, height: 10, color: phase.color, strokeWidth: 3 }} />
                    </motion.div>
                  </AnimatePresence>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', fontSize: 10.5, color: C.muted, fontWeight: 650, marginTop: 20, lineHeight: 1.6 }}>
          لا تُغلق الشاشة — يستغرق هذا ثوانٍ قليلة
        </motion.p>
      </div>
    </div>
  );
}

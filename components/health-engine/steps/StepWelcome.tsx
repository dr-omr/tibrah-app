'use client';
// StepWelcome — Rebuilt per clinical sprint spec

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import { BottomCTA } from '../ui/BottomCTA';

const W = {
  bg:    'linear-gradient(158deg,#F8FDFF 0%,#E4FAF6 22%,#E8F1FF 48%,#F6FBFF 74%,#FFFFFF 100%)',
  glass: 'rgba(255,255,255,0.68)',
  border:'rgba(255,255,255,0.90)',
  teal:  '#0787A5',
  tealD: '#0F6F8F',
  ink:   '#073B52',
  sub:   '#0F6F8F',
  muted: '#639CAF',
  blur:  'blur(20px) saturate(130%)',
};

const TRUST_CHIPS = [
  { label: 'نبدأ بالمعلومات المهمة', emoji: '📋', color: '#0787A5' },
  { label: 'نسأل حسب إجاباتك',       emoji: '🔍', color: '#059669' },
  { label: 'نعطيك خطوة واضحة',       emoji: '🎯', color: '#7C3AED' },
];

const STEPS_PREVIEW = [
  { icon: '👤', label: 'معلومات عنك',    sub: 'بسيطة وسريعة، تقدر تتخطاها' },
  { icon: '💬', label: 'إيش يضايقك',     sub: 'اختار العرض من قائمة واضحة' },
  { icon: '📋', label: 'تفاصيل العرض',  sub: 'متى بدأ، كيف ماشي، إيش يزيده' },
  { icon: '🎯', label: 'ملخص حالتك',    sub: 'خطوة واضحة وقراءة أولية' },
];

function HeartLine() {
  return (
    <svg viewBox="0 0 300 42" className="w-full" style={{ height: 42 }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor={W.teal} stopOpacity="0" />
          <stop offset="28%"  stopColor={W.teal} stopOpacity="0.5" />
          <stop offset="62%"  stopColor="#22D3EE" stopOpacity="0.95" />
          <stop offset="100%" stopColor={W.teal} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,21 L52,21 L64,21 L68,8 L72,34 L76,6 L80,21 L110,21 L122,21 L126,2 L130,40 L134,14 L138,21 L165,21 L176,21 L180,15 L184,27 L188,21 L210,21 L240,21 L260,21"
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.4 }}
      />
    </svg>
  );
}

function HowItWorksSheet({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        onClick={e => e.stopPropagation()}
        className="w-full rounded-t-[32px] px-5 pb-10 pt-4"
        style={{ background: W.glass, backdropFilter: W.blur, border: `1.5px solid ${W.border}`, maxHeight: '80vh', overflowY: 'auto' }}
        dir="rtl"
      >
        <div className="mx-auto w-10 h-1 rounded-full bg-gray-200 mb-5" />
        <h3 style={{ fontSize: 18, fontWeight: 950, color: W.ink, marginBottom: 4 }}>كيف يشتغل التقييم؟</h3>
        <p style={{ fontSize: 12, color: W.sub, fontWeight: 650, marginBottom: 20, lineHeight: 1.65 }}>
          طِبرا يسألك خطوة خطوة ويرتّب الأعراض في قراءة واضحة.
        </p>
        <div className="grid gap-3">
          {STEPS_PREVIEW.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3 rounded-[18px] p-3"
              style={{ background: 'rgba(255,255,255,0.68)', border: '1.5px solid rgba(255,255,255,0.90)', backdropFilter: 'blur(14px)' }}>
              <div className="shrink-0 flex items-center justify-center rounded-[13px] font-bold text-xs"
                style={{ width: 36, height: 36, background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.14)', color: W.teal }}>
                {i + 1}
              </div>
              <div className="flex-1">
                <p style={{ fontSize: 13, fontWeight: 900, color: W.ink, marginBottom: 1 }}>{s.icon} {s.label}</p>
                <p style={{ fontSize: 11, color: W.sub, fontWeight: 650, lineHeight: 1.5 }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 10, color: W.muted, textAlign: 'center', marginTop: 18, lineHeight: 1.65 }}>
          القراءة الأولية لا تُغني عن زيارة الطبيب. طِبرا يُرتّب الصورة ويساعدك تتابع بشكل أذكى.
        </p>
      </motion.div>
    </motion.div>
  );
}

export function StepWelcome({ onStart }: { onStart: () => void }) {
  const [ready, setReady] = useState(false);
  const [showHow, setShowHow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div className="relative min-h-screen" dir="rtl" style={{ background: W.bg }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.38, 0.66, 0.38] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -100, right: -80, width: 380, height: 360, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(34,211,238,0.22) 0%,transparent 64%)', filter: 'blur(55px)' }}
        />
        <div style={{ position: 'absolute', top: 240, left: -70, width: 300, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(52,211,153,0.14),transparent 65%)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: 100, right: -40, width: 260, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(129,140,248,0.11),transparent 65%)', filter: 'blur(48px)' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center px-5 pt-10" style={{ paddingBottom: 200 }}>

        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.05 }}
          className="flex items-center gap-2 mb-8"
        >
          <div className="h-px w-7" style={{ background: `linear-gradient(to left,transparent,${W.teal}50)` }} />
          <span style={{ fontSize: 9, fontWeight: 900, color: W.teal, letterSpacing: '0.22em' }}>طِبرا</span>
          <div className="h-px w-7" style={{ background: `linear-gradient(to right,transparent,${W.teal}50)` }} />
        </motion.div>

        {/* Icon orb */}
        <motion.div
          initial={{ scale: 0.78, opacity: 0 }} animate={ready ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.1, type: 'spring', stiffness: 190, damping: 22 }}
          className="mb-5 flex items-center justify-center relative overflow-hidden"
          style={{
            width: 120, height: 120, borderRadius: 44,
            background: 'linear-gradient(145deg,rgba(255,255,255,0.94) 0%,rgba(186,230,253,0.86) 34%,rgba(34,211,238,0.76) 100%)',
            border: '1.5px solid rgba(255,255,255,0.94)',
            boxShadow: '0 20px 56px rgba(8,145,178,0.26), inset 0 2px 0 rgba(255,255,255,0.96)',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
            style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.70),transparent)', borderRadius: '42px 42px 0 0' }} />
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-[42px]"
            style={{ background: 'linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.28) 50%,transparent 70%)' }}
            animate={{ x: ['-120%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
          />
          <span style={{ fontSize: 44, position: 'relative', zIndex: 1 }}>🏥</span>
        </motion.div>

        {/* ECG */}
        <motion.div
          initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.28 }}
          className="w-full mb-4"
        >
          <HeartLine />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, type: 'spring', stiffness: 230, damping: 28 }}
          className="text-center mb-5 w-full"
        >
          <h1 style={{ fontSize: 28, fontWeight: 950, letterSpacing: '-0.028em', lineHeight: 1.2, color: W.ink, marginBottom: 10 }}>
            خلّينا نفهم حالتك
            <br />خطوة خطوة
          </h1>
          <p style={{ fontSize: 13, color: W.sub, lineHeight: 1.72, fontWeight: 600, maxWidth: 310, margin: '0 auto' }}>
            جاوب على أسئلة بسيطة، وطِبرا يرتّب لك الأعراض، الشدة، المدة، الأشياء اللي تزيدها، وأول خطوة تعملها.
          </p>
        </motion.div>

        {/* Trust chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 justify-center mb-6"
        >
          {TRUST_CHIPS.map((chip, i) => (
            <motion.div key={chip.label}
              initial={{ opacity: 0, scale: 0.88 }} animate={ready ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.34 + i * 0.07, type: 'spring', stiffness: 340, damping: 24 }}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2"
              style={{ background: `${chip.color}0D`, border: `1px solid ${chip.color}22`, backdropFilter: 'blur(12px)' }}
            >
              <span style={{ fontSize: 13 }}>{chip.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 820, color: chip.color }}>{chip.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Steps preview card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, type: 'spring', stiffness: 210, damping: 28 }}
          className="relative overflow-hidden rounded-[24px] px-4 py-4 mb-5 w-full"
          style={{ background: W.glass, border: `1.5px solid ${W.border}`, backdropFilter: W.blur, boxShadow: '0 8px 28px rgba(8,145,178,0.08), inset 0 1.5px 0 rgba(255,255,255,0.94)' }}
        >
          <div className="absolute top-0 left-[18%] right-[18%] h-[2.5px] rounded-b-full"
            style={{ background: `linear-gradient(90deg,rgba(8,145,178,0.26),rgba(8,145,178,0.72),rgba(8,145,178,0.26))` }} />
          <p style={{ fontSize: 9, fontWeight: 900, color: W.muted, letterSpacing: '0.14em', marginBottom: 10, position: 'relative', zIndex: 1 }}>
            الخطوات
          </p>
          <div className="space-y-2.5 relative z-10">
            {STEPS_PREVIEW.map((step, i) => (
              <motion.div key={step.label}
                initial={{ opacity: 0, x: 8 }} animate={ready ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.44 + i * 0.06, type: 'spring', stiffness: 260, damping: 28 }}
                className="flex items-center gap-3"
              >
                <div className="flex items-center justify-center rounded-[11px] shrink-0 font-black text-xs"
                  style={{ width: 32, height: 32, background: 'rgba(8,145,178,0.07)', border: '1px solid rgba(8,145,178,0.13)', color: W.teal }}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: 12.5, fontWeight: 850, color: W.ink, lineHeight: 1.3 }}>{step.icon} {step.label}</p>
                  <p style={{ fontSize: 10.5, color: W.muted, fontWeight: 560, lineHeight: 1.4 }}>{step.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.56 }}
          style={{ fontSize: 10, color: W.muted, textAlign: 'center', lineHeight: 1.65, fontWeight: 560, marginBottom: 12 }}
        >
          القراءة الأولية لا تُغني عن زيارة الطبيب. طِبرا يُرتّب الصورة ويساعدك تتابع بذكاء.
        </motion.p>

        {/* Secondary CTA */}
        <motion.button
          type="button"
          initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { haptic.selection(); setShowHow(true); }}
          className="rounded-full px-5 py-2.5"
          style={{ background: 'rgba(255,255,255,0.52)', border: '1px solid rgba(255,255,255,0.82)', color: W.sub, fontSize: 12, fontWeight: 820, backdropFilter: 'blur(14px)' }}
        >
          كيف يشتغل التقييم؟
        </motion.button>
      </div>

      {/* Primary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.58, type: 'spring', stiffness: 220, damping: 28 }}
        className="relative z-10"
      >
        <BottomCTA
          label="ابدأ"
          onPress={() => { haptic.impact(); onStart(); }}
          variant="gradient"
          sublabel="آمن · سري · مجاني تماماً"
        />
      </motion.div>

      {/* How it works bottom sheet */}
      <AnimatePresence>
        {showHow && <HowItWorksSheet onClose={() => setShowHow(false)} />}
      </AnimatePresence>
    </div>
  );
}

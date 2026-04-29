'use client';
// StepEmotional — Full Native Glass Redesign

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, ChevronDown, PenLine } from 'lucide-react';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

const C = {
  bg:     'linear-gradient(168deg,#EDE9FE 0%,#E0F2FE 34%,#F3FBFD 100%)',
  ink:    '#073B52',
  sub:    '#0F6F8F',
  muted:  '#64748B',
  violet: '#7C3AED',
};

const OPTIONS = [
  { id: 'none',        emoji: '🌿', title: 'لا يوجد عامل واضح',   desc: 'الأعراض تبدو مستقلة عن الضغط.',    color: '#059669' },
  { id: 'work_stress', emoji: '⚡', title: 'ضغط أو توتر',          desc: 'يزداد العرض مع الانشغال أو التوتر.', color: '#D97706' },
  { id: 'anger',       emoji: '🌊', title: 'كبت أو تراكم',         desc: 'مشاعر مؤجلة أو كلام لم يُقل.',      color: '#BE185D' },
  { id: 'fear',        emoji: '🔮', title: 'خوف صحي أو قلق',       desc: 'مراقبة زائدة للجسم أو قلق من معنى العرض.', color: '#7C3AED' },
  { id: 'burnout',     emoji: '🕯️', title: 'إرهاق وإنهاك',         desc: 'استنزاف طويل يجعل الجسم أكثر حساسية.', color: '#0787A5' },
  { id: 'unknown',     emoji: '🌫️', title: 'لا أعرف — مقبول',       desc: 'لا نمط واضح الآن. القراءة تُبنى على الأعراض.', color: '#64748B' },
];

const IMPACT: Record<string, string> = {
  none:        'يُبقي التحليل مرتكزاً على الأعراض الجسدية.',
  work_stress: 'تُضاف طبقة الضغط — تُعدَّل بها خطة المتابعة.',
  anger:       'نمط الكبت يظهر في البوصلة الصحية كمحور نفسي.',
  fear:        'القلق الصحي يعدّل توصيات المراقبة في النتيجة.',
  burnout:     'الاستنزاف يُضاف للبُعد النفسي في البوصلة.',
  unknown:     'لا يؤثر على القراءة — تُبنى على الأعراض.',
};

function OptionRow({ opt, active, onSelect }: {
  opt: typeof OPTIONS[0]; active: boolean; onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.975, y: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      onClick={() => { haptic.selection(); onSelect(); }}
      className="w-full relative overflow-hidden text-right"
      style={{
        borderRadius: 20,
        padding: '12px 14px',
        background: active
          ? `linear-gradient(150deg, rgba(255,255,255,0.94) 0%, ${opt.color}10 100%)`
          : 'rgba(255,255,255,0.54)',
        border: `1.5px solid ${active ? `${opt.color}28` : 'rgba(255,255,255,0.90)'}`,
        backdropFilter: 'blur(20px) saturate(145%)',
        boxShadow: active
          ? `0 8px 24px ${opt.color}12, inset 0 1.5px 0 rgba(255,255,255,0.96)`
          : 'inset 0 1px 0 rgba(255,255,255,0.90)',
        transition: 'background 200ms, border-color 200ms, box-shadow 200ms',
      }}
      aria-pressed={active}
    >
      {/* accent top strip on active */}
      {active && (
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          className="absolute top-0 left-[15%] right-[15%] h-[2px] rounded-b-full pointer-events-none"
          style={{ background: `linear-gradient(90deg,transparent,${opt.color}AA,transparent)`, transformOrigin: 'center' }}
        />
      )}
      <div className="relative z-10 flex items-center gap-3">
        {/* emoji orb */}
        <div className="shrink-0 flex items-center justify-center rounded-[14px]"
          style={{ width: 40, height: 40, background: `${opt.color}0E`, border: `1px solid ${opt.color}20`, fontSize: 18 }}>
          {opt.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <span style={{ fontSize: 14, fontWeight: active ? 900 : 750, color: active ? C.ink : C.sub, display: 'block', lineHeight: 1.35 }}>
            {opt.title}
          </span>
          <AnimatePresence>
            {active && (
              <motion.span
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'block', overflow: 'hidden' }}
              >
                <span style={{ fontSize: 10.5, fontWeight: 700, color: opt.color, display: 'block', marginTop: 3, lineHeight: 1.5 }}>
                  ✦ {IMPACT[opt.id]}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {/* check badge */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 22 }}
              className="shrink-0 flex items-center justify-center rounded-full"
              style={{ width: 24, height: 24, background: opt.color, boxShadow: `0 4px 10px ${opt.color}40` }}
            >
              <Check style={{ width: 12, height: 12, color: '#fff', strokeWidth: 3 }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

export function StepEmotional({ selected, note, onToggle, onNote, onSubmit }: {
  selected: string[];
  note: string;
  onToggle: (id: string) => void;
  onNote: (value: string) => void;
  onSubmit: () => void;
}) {
  const [showNote, setShowNote] = useState(Boolean(note));

  return (
    <div className="relative min-h-screen overflow-hidden" dir="rtl" style={{ background: C.bg }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.62, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -80, left: -70, width: 340, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.17),transparent 64%)', filter: 'blur(54px)' }}
        />
        <div style={{ position: 'absolute', bottom: 90, right: -90, width: 320, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(34,211,238,0.13),transparent 64%)', filter: 'blur(52px)' }} />
      </div>

      <div className="relative z-10 px-4 pt-4" style={{ paddingBottom: 200 }}>
        {/* Header — compact */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 28 }} className="mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-3"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)', backdropFilter: 'blur(14px)' }}>
            <Brain style={{ width: 11, height: 11, color: C.violet }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: C.violet, letterSpacing: '0.06em' }}>السياق العاطفي</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 950, lineHeight: 1.2, color: C.ink, letterSpacing: '-0.015em', marginBottom: 6 }}>
            هل هناك ضغط يزيد الأعراض؟
          </h2>
          <p style={{ fontSize: 12, lineHeight: 1.65, fontWeight: 600, color: C.sub }}>
            لا يعني أنها نفسية — يساعدنا نفهم الصورة الكاملة.
          </p>
        </motion.div>

        {/* Options */}
        <div className="grid gap-2.5 mb-4">
          {OPTIONS.map((opt, i) => (
            <motion.div key={opt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 28 }}>
              <OptionRow opt={opt} active={selected.includes(opt.id)} onSelect={() => onToggle(opt.id)} />
            </motion.div>
          ))}
        </div>

        {/* Note toggle */}
        <motion.button
          type="button"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { haptic.selection(); setShowNote(v => !v); }}
          className="w-full flex items-center justify-center gap-2 rounded-[16px] px-4 py-3"
          style={{
            background: 'rgba(255,255,255,0.44)',
            border: '1px solid rgba(255,255,255,0.78)',
            backdropFilter: 'blur(14px)',
            color: C.sub, fontSize: 12, fontWeight: 800,
          }}
        >
          <PenLine style={{ width: 13, height: 13 }} />
          {showNote ? 'إخفاء الملاحظة' : 'أضف ملاحظة قصيرة (اختياري)'}
          <motion.span animate={{ rotate: showNote ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown style={{ width: 13, height: 13 }} />
          </motion.span>
        </motion.button>

        <AnimatePresence initial={false}>
          {showNote && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <textarea
                value={note}
                onChange={e => onNote(e.target.value)}
                rows={3}
                placeholder="مثال: الأعراض تزيد وقت الضغط أو بعد موقف معيّن..."
                className="mt-2.5 w-full rounded-[18px] p-4 resize-none outline-none"
                style={{
                  background: 'rgba(255,255,255,0.68)',
                  border: '1.5px solid rgba(255,255,255,0.90)',
                  backdropFilter: 'blur(18px)',
                  color: C.ink, fontSize: 13, fontWeight: 650, lineHeight: 1.7,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomCTA
        label="التالي"
        onPress={onSubmit}
        variant="gradient"
        sublabel={selected.length > 0 ? `${selected.length} عامل مختار · نُضيف السياق للخريطة` : 'لا نحكم — نقرأ النمط فقط'}
      />
    </div>
  );
}

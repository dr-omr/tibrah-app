'use client';
// StepPersonalHistory — Rebuilt with clear section separation

import { useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, UserRound, SkipForward } from 'lucide-react';
import type { PersonalHistoryAnswers } from '../types';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

const C = {
  bg:     'linear-gradient(158deg,#F8FDFF 0%,#E4FAF6 22%,#E8F1FF 52%,#FFFFFF 100%)',
  glass:  'rgba(255,255,255,0.68)',
  border: 'rgba(255,255,255,0.90)',
  ink:    '#073B52',
  sub:    '#0F6F8F',
  muted:  '#639CAF',
  teal:   '#0787A5',
  green:  '#059669',
};

const EMPTY: PersonalHistoryAnswers = {
  age: '', sex: '', weight: '', height: '', pregnant: '', allergies: '',
  chronicConditions: [], medicationUse: '', medicationsText: '',
  surgeryHistory: '', surgeryText: '', familyHistory: [],
};

/* ── Chip multi-select ─────────────────────────────────────── */
function ChipGroup({ options, selected, accent, exclusive = [], onToggle }: {
  options: string[]; selected: string[]; accent: string;
  exclusive?: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <motion.button
            key={opt} type="button" whileTap={{ scale: 0.95 }}
            onClick={() => { haptic.selection(); onToggle(opt); }}
            className="rounded-full px-3.5 py-2 text-right"
            style={{
              background: active ? `${accent}14` : 'rgba(255,255,255,0.68)',
              border: `1.5px solid ${active ? `${accent}30` : 'rgba(255,255,255,0.90)'}`,
              color: active ? accent : C.sub, fontSize: 12, fontWeight: active ? 900 : 720,
              transition: 'background 180ms, border-color 180ms',
            }}
          >
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Single-select pills ───────────────────────────────────── */
function PillGroup({ options, value, accent, onChange }: {
  options: { value: string; label: string }[];
  value?: string; accent: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <motion.button key={opt.value} type="button" whileTap={{ scale: 0.95 }}
            onClick={() => { haptic.selection(); onChange(opt.value); }}
            className="rounded-full px-4 py-2"
            style={{
              background: active ? `${accent}14` : 'rgba(255,255,255,0.70)',
              border: `1.5px solid ${active ? `${accent}30` : 'rgba(255,255,255,0.90)'}`,
              color: active ? accent : C.sub, fontSize: 12.5, fontWeight: active ? 900 : 720,
              transition: 'all 180ms',
            }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Text input ────────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value?: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <label className="block">
      <span style={{ display: 'block', fontSize: 11.5, fontWeight: 900, color: C.sub, marginBottom: 5 }}>{label}</span>
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-[14px] px-3 py-3 text-right focus:outline-none"
        style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.92)', color: C.ink, fontSize: 13, fontWeight: 700 }} />
    </label>
  );
}

/* ── Textarea ──────────────────────────────────────────────── */
function Notes({ label, value, onChange, placeholder }: {
  label: string; value?: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <label className="block">
      <span style={{ display: 'block', fontSize: 11.5, fontWeight: 900, color: C.sub, marginBottom: 5 }}>{label}</span>
      <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        rows={3} className="w-full rounded-[14px] px-3 py-3 text-right resize-none focus:outline-none"
        style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.92)', color: C.ink, fontSize: 13, fontWeight: 700 }} />
    </label>
  );
}

/* ── Accordion ─────────────────────────────────────────────── */
function Section({ id, title, emoji, openId, setOpen, children, completionCount }: {
  id: string; title: string; emoji: string;
  openId: string; setOpen: (s: string) => void;
  children: ReactNode; completionCount?: number;
}) {
  const open = openId === id;
  return (
    <div className="rounded-[22px] overflow-hidden"
      style={{ background: C.glass, border: `1.5px solid ${C.border}`, backdropFilter: 'blur(22px)', boxShadow: '0 6px 20px rgba(8,145,178,0.06), inset 0 1.5px 0 rgba(255,255,255,0.94)' }}>
      <button type="button" onClick={() => { haptic.selection(); setOpen(open ? '' : id); }}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-right">
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <span style={{ fontSize: 14, fontWeight: 950, color: C.ink, flex: 1 }}>{title}</span>
        {completionCount !== undefined && completionCount > 0 && !open && (
          <span className="rounded-full px-2 py-0.5"
            style={{ background: 'rgba(8,145,178,0.10)', color: C.teal, fontSize: 10, fontWeight: 900 }}>
            {completionCount} ✓
          </span>
        )}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown style={{ width: 16, height: 16, color: C.muted }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}>
            <div className="px-4 pb-5 grid gap-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function toggleExclusive(list: string[], item: string, exclusive: string[]) {
  if (exclusive.includes(item)) return list.includes(item) ? [] : [item];
  const clean = list.filter(v => !exclusive.includes(v));
  return clean.includes(item) ? clean.filter(v => v !== item) : [...clean, item];
}

/* ── Main component ────────────────────────────────────────── */
export function StepPersonalHistory({ value, onChange, onNext, onSkip }: {
  value?: PersonalHistoryAnswers;
  onChange: (v: PersonalHistoryAnswers) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const h = { ...EMPTY, ...(value ?? {}) };
  const [open, setOpen] = useState<string>('basic');
  const patch = (next: Partial<PersonalHistoryAnswers>) => onChange({ ...h, ...next });

  const basicCount = [h.age, h.sex, h.weight, h.height].filter(Boolean).length;
  const chronicCount = h.chronicConditions.length;
  const medsCount = h.medicationUse ? 1 : 0;
  const surgeryCount = h.surgeryHistory ? 1 : 0;
  const familyCount = h.familyHistory.length;

  return (
    <div className="relative min-h-screen overflow-hidden" dir="rtl" style={{ background: C.bg }}>
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position: 'absolute', top: -80, right: -70, width: 340, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(34,211,238,0.16),transparent 64%)', filter: 'blur(52px)' }} />
      </div>

      <div className="relative z-10 px-4 pt-4 pb-52">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 28 }} className="mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-3"
            style={{ background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.18)' }}>
            <UserRound style={{ width: 11, height: 11, color: C.teal }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: C.teal }}>معلومات عنك</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 950, lineHeight: 1.25, color: C.ink, letterSpacing: '-0.015em', marginBottom: 6 }}>
            قبل الأعراض… نحتاج نعرف عنك شوي
          </h2>
          <p style={{ fontSize: 12, lineHeight: 1.7, color: C.sub, fontWeight: 650 }}>
            معلومات بسيطة تساعدنا نفهم حالتك بشكل أدق. تقدر تتخطى أي سؤال ما تعرفه.
          </p>
        </motion.div>

        <div className="grid gap-3">
          {/* A — Basic info */}
          <Section id="basic" title="معلومات أساسية" emoji="👤" openId={open} setOpen={setOpen} completionCount={basicCount}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="العمر" type="number" value={h.age} onChange={age => patch({ age })} placeholder="مثلاً 35" />
              <Field label="الوزن (اختياري)" type="number" value={h.weight} onChange={weight => patch({ weight })} placeholder="كجم" />
              <Field label="الطول (اختياري)" type="number" value={h.height} onChange={height => patch({ height })} placeholder="سم" />
            </div>
            <div>
              <p style={{ fontSize: 11.5, fontWeight: 900, color: C.sub, marginBottom: 8 }}>الجنس</p>
              <PillGroup
                options={[{ value: 'male', label: 'ذكر' }, { value: 'female', label: 'أنثى' }, { value: 'unknown', label: 'ما أحب أجاوب' }]}
                value={h.sex} accent={C.teal}
                onChange={sex => patch({ sex: sex as PersonalHistoryAnswers['sex'] })}
              />
            </div>
            {h.sex === 'female' && (
              <div>
                <p style={{ fontSize: 11.5, fontWeight: 900, color: '#DB2777', marginBottom: 8 }}>هل أنت حامل؟</p>
                <PillGroup
                  options={[{ value: 'no', label: 'لا' }, { value: 'yes', label: 'نعم' }, { value: 'possible', label: 'ممكن' }, { value: 'unknown', label: 'لا أعرف' }]}
                  value={h.pregnant} accent="#DB2777"
                  onChange={pregnant => patch({ pregnant: pregnant as PersonalHistoryAnswers['pregnant'] })}
                />
              </div>
            )}
          </Section>

          {/* B — Chronic conditions */}
          <Section id="chronic" title="أمراض مزمنة" emoji="🫀" openId={open} setOpen={setOpen} completionCount={chronicCount}>
            <p style={{ fontSize: 11.5, color: C.sub, fontWeight: 650, lineHeight: 1.65 }}>
              هل عندك أي من هذه الأمراض؟ اختر كل اللي ينطبق.
            </p>
            <ChipGroup
              options={['سكري', 'ضغط', 'ربو أو حساسية صدر', 'أمراض قلب', 'غدة درقية', 'كلى', 'كبد', 'قولون/معدة', 'فقر دم', 'مناعة/روماتيزم', 'لا يوجد', 'لا أعرف']}
              selected={h.chronicConditions}
              accent={C.green}
              exclusive={['لا يوجد', 'لا أعرف']}
              onToggle={item => patch({ chronicConditions: toggleExclusive(h.chronicConditions, item, ['لا يوجد', 'لا أعرف']) })}
            />
          </Section>

          {/* C — Medications & Allergies */}
          <Section id="meds" title="أدوية وحساسية" emoji="💊" openId={open} setOpen={setOpen} completionCount={medsCount}>
            <div>
              <p style={{ fontSize: 11.5, fontWeight: 900, color: C.sub, marginBottom: 8 }}>هل تستخدم أدوية بشكل مستمر؟</p>
              <PillGroup
                options={[{ value: 'no', label: 'لا' }, { value: 'yes', label: 'نعم' }, { value: 'unknown_names', label: 'لا أعرف الأسماء' }]}
                value={h.medicationUse} accent="#6366F1"
                onChange={medicationUse => patch({ medicationUse: medicationUse as PersonalHistoryAnswers['medicationUse'] })}
              />
            </div>
            {h.medicationUse === 'yes' && (
              <Notes label="اكتب أسماء الأدوية إذا تعرفها"
                value={h.medicationsText} onChange={medicationsText => patch({ medicationsText })}
                placeholder="مثلاً: ميتفورمين، أملوديبين..." />
            )}
            <Notes label="هل عندك حساسية من أدوية أو أكل؟"
              value={h.allergies} onChange={allergies => patch({ allergies })}
              placeholder="مثلاً: بنسلين، مكسرات، لا يوجد..." />
          </Section>

          {/* D — Surgery / hospital */}
          <Section id="surgery" title="عمليات أو دخول مستشفى" emoji="🏥" openId={open} setOpen={setOpen} completionCount={surgeryCount}>
            <p style={{ fontSize: 11.5, fontWeight: 900, color: C.sub, marginBottom: 8 }}>
              هل سبق عملت عملية أو دخلت المستشفى بسبب مرض مهم؟
            </p>
            <PillGroup
              options={[{ value: 'no', label: 'لا' }, { value: 'yes', label: 'نعم' }, { value: 'not_remember', label: 'لا أذكر' }]}
              value={h.surgeryHistory} accent="#0EA5E9"
              onChange={surgeryHistory => patch({ surgeryHistory: surgeryHistory as PersonalHistoryAnswers['surgeryHistory'] })}
            />
            {h.surgeryHistory === 'yes' && (
              <Notes label="اكتب العملية أو سبب دخول المستشفى إذا تذكر"
                value={h.surgeryText} onChange={surgeryText => patch({ surgeryText })}
                placeholder="مثلاً: استئصال زائدة، ولادة قيصرية..." />
            )}
          </Section>

          {/* E — Family history */}
          <Section id="family" title="تاريخ عائلي" emoji="👨‍👩‍👧" openId={open} setOpen={setOpen} completionCount={familyCount}>
            <p style={{ fontSize: 11.5, color: C.sub, fontWeight: 650, lineHeight: 1.65 }}>
              هل في العائلة أمراض مهمة؟ اختر كل اللي تعرفه.
            </p>
            <ChipGroup
              options={['سكري', 'ضغط', 'قلب', 'سرطان', 'أمراض وراثية', 'لا يوجد', 'لا أعرف']}
              selected={h.familyHistory}
              accent="#D97706"
              exclusive={['لا يوجد', 'لا أعرف']}
              onToggle={item => patch({ familyHistory: toggleExclusive(h.familyHistory, item, ['لا يوجد', 'لا أعرف']) })}
            />
          </Section>
        </div>
      </div>

      {/* Skip button */}
      <div className="fixed inset-x-0 z-[901] px-4" style={{ bottom: 140 }}>
        <motion.button type="button" whileTap={{ scale: 0.97 }}
          onClick={() => { haptic.selection(); onSkip(); }}
          className="w-full flex items-center justify-center gap-2 rounded-full py-2.5"
          style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(255,255,255,0.88)', color: C.sub, fontSize: 12, fontWeight: 900, backdropFilter: 'blur(16px)' }}>
          <SkipForward style={{ width: 13, height: 13 }} />
          تخطَّ الآن
        </motion.button>
      </div>

      <BottomCTA label="التالي" onPress={onNext} variant="teal" sublabel="تقدر تتخطى أي سؤال ما تعرفه" />
    </div>
  );
}

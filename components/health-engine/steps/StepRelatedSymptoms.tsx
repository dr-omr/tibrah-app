'use client';
// StepRelatedSymptoms — Collapsible groups, full system lists, native glass

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, PlusCircle, Check } from 'lucide-react';
import type { ChiefComplaintAnswers } from '../types';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

const C = {
  bg:    'linear-gradient(158deg,#F8FDFF 0%,#E4FAF6 22%,#E8F1FF 52%,#FFFFFF 100%)',
  glass: 'rgba(255,255,255,0.68)',
  border:'rgba(255,255,255,0.90)',
  ink:   '#073B52',
  sub:   '#0F6F8F',
  muted: '#639CAF',
  teal:  '#0787A5',
};

/* ── System-specific symptom groups ────────────────────────── */
const GROUPS: Record<string, { group: string; symptoms: string[] }[]> = {
  digestive: [
    { group: 'الهضم',     symptoms: ['انتفاخ', 'غازات', 'حموضة', 'ارتجاع', 'إمساك', 'إسهال'] },
    { group: 'الغثيان',   symptoms: ['غثيان', 'قيء', 'فقدان شهية'] },
    { group: 'تحذيري',    symptoms: ['دم بالبراز', 'ألم شديد مفاجئ', 'حرارة مع البطن'] },
  ],
  respiratory: [
    { group: 'النفس',     symptoms: ['ضيق نفس', 'صفير', 'بلغم أبيض', 'بلغم أصفر/أخضر'] },
    { group: 'الصدر',     symptoms: ['ألم صدر', 'كحة ليلية', 'تعب شديد'] },
    { group: 'أخرى',      symptoms: ['حرارة', 'صداع', 'انسداد أنف'] },
  ],
  neuro: [
    { group: 'الصداع',    symptoms: ['زغللة', 'حساسية للضوء', 'غثيان مع الصداع'] },
    { group: 'الأعصاب',   symptoms: ['تنميل', 'وخز', 'ضعف في طرف'] },
    { group: 'أخرى',      symptoms: ['دوخة', 'ضعف تركيز', 'فقدان وعي مؤقت'] },
  ],
  musculoskeletal: [
    { group: 'المفاصل',   symptoms: ['تورم', 'احمرار', 'تيبس صباحي'] },
    { group: 'العضلات',   symptoms: ['ضعف', 'تقلص', 'ألم بعد الراحة'] },
    { group: 'أعصاب',     symptoms: ['تنميل', 'وخز نازل', 'ألم مع الحركة'] },
  ],
  cardio: [
    { group: 'القلب',     symptoms: ['ضيق نفس', 'خفقان', 'تعرق مع الألم'] },
    { group: 'تحذيري',    symptoms: ['ألم ينتقل للذراع أو الفك', 'دوخة مفاجئة', 'تورم الرجلين'] },
  ],
  urinary: [
    { group: 'التبول',    symptoms: ['كثرة تبول', 'ضغط للتبول', 'بول بالليل'] },
    { group: 'ألم',       symptoms: ['ألم جنب', 'ألم أسفل البطن'] },
    { group: 'تحذيري',    symptoms: ['دم في البول', 'تغير لون البول', 'تورم الوجه أو الرجلين'] },
  ],
  skin_hair: [
    { group: 'الجلد',     symptoms: ['حكة', 'تورم', 'تدفؤ موضعي', 'إفرازات'] },
    { group: 'أخرى',      symptoms: ['حرارة', 'انتشار سريع', 'نزيف'] },
  ],
  ent: [
    { group: 'الأنف',     symptoms: ['انسداد', 'سيلان', 'رائحة كريهة'] },
    { group: 'الحلق',     symptoms: ['صعوبة بلع', 'بحة صوت', 'ألم مع البلع'] },
    { group: 'الأذن',     symptoms: ['ألم أذن', 'طنين', 'صمم مؤقت'] },
    { group: 'عام',       symptoms: ['حرارة', 'كحة', 'بلغم', 'تعب'] },
  ],
  eye: [
    { group: 'الحالة',    symptoms: ['ألم', 'حكة', 'احمرار شديد', 'إفرازات'] },
    { group: 'الرؤية',    symptoms: ['زغللة', 'رؤية مزدوجة', 'حساسية للضوء'] },
  ],
  dental: [
    { group: 'اللثة',     symptoms: ['تورم', 'نزيف', 'ألم مع اللمس'] },
    { group: 'عام',       symptoms: ['حرارة', 'رائحة فم', 'صعوبة مضغ'] },
  ],
  hormones: [
    { group: 'الطاقة',    symptoms: ['تعب مزمن', 'برودة', 'نعاس زائد'] },
    { group: 'الوزن',     symptoms: ['زيادة وزن بدون سبب', 'نقص وزن بدون سبب'] },
    { group: 'أخرى',      symptoms: ['تعرق', 'خفقان', 'تغير دورة', 'تساقط شعر'] },
  ],
  women: [
    { group: 'الدورة',    symptoms: ['ألم شديد', 'غزارة الدورة', 'تأخر', 'عدم انتظام'] },
    { group: 'الحوض',     symptoms: ['ألم أسفل البطن', 'إفرازات غير عادية', 'ألم مع العلاقة'] },
    { group: 'تحذيري',    symptoms: ['نزيف خارج الدورة', 'حرارة مع ألم'] },
  ],
  mental: [
    { group: 'الجسم',     symptoms: ['خفقان', 'ضيق نفس', 'شد عضلي', 'يد ترتجف'] },
    { group: 'النوم',     symptoms: ['أرق', 'كوابيس', 'صعوبة هدوء العقل'] },
    { group: 'أخرى',      symptoms: ['تعب جسدي', 'خوف صحي مبالغ', 'دوخة'] },
  ],
  sleep: [
    { group: 'النهار',    symptoms: ['نعاس نهاري', 'صداع صباحي', 'صعوبة تركيز'] },
    { group: 'الليل',     symptoms: ['صحوات كثيرة', 'كوابيس', 'خفقان مع النوم'] },
    { group: 'عام',       symptoms: ['تعب رغم النوم', 'تنفس صعب أثناء النوم'] },
  ],
  general: [
    { group: 'عام',       symptoms: ['حرارة', 'تعب شديد', 'دوخة', 'نقص وزن', 'ضعف شهية'] },
  ],
  uncertain: [
    { group: 'شائعة',     symptoms: ['تعب', 'دوخة', 'ألم', 'غثيان', 'قلق', 'أرق'] },
  ],
};

function getGroups(system?: string) {
  return GROUPS[system ?? 'uncertain'] ?? GROUPS.uncertain;
}

/* ── Symptom chip ──────────────────────────────────────────── */
function SymptomChip({ label, selected, onToggle }: {
  label: string; selected: boolean; onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94, y: 1 }}
      onClick={() => { haptic.selection(); onToggle(); }}
      className="relative rounded-full flex items-center gap-1.5 px-3.5 py-2"
      style={{
        background: selected ? 'linear-gradient(150deg,rgba(255,255,255,0.92),rgba(8,145,178,0.10))' : 'rgba(255,255,255,0.60)',
        border: `1.5px solid ${selected ? 'rgba(8,145,178,0.28)' : 'rgba(255,255,255,0.90)'}`,
        backdropFilter: 'blur(14px)',
        boxShadow: selected ? '0 4px 12px rgba(8,145,178,0.10), inset 0 1px 0 rgba(255,255,255,0.94)' : 'inset 0 1px 0 rgba(255,255,255,0.88)',
        transition: 'background 180ms, border-color 180ms',
      }}
    >
      <AnimatePresence>
        {selected && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 24 }}>
            <Check style={{ width: 10, height: 10, color: C.teal, strokeWidth: 3 }} />
          </motion.span>
        )}
      </AnimatePresence>
      <span style={{ fontSize: 12.5, fontWeight: selected ? 900 : 720, color: selected ? C.ink : C.sub, transition: 'color 150ms' }}>
        {label}
      </span>
    </motion.button>
  );
}

/* ── Collapsible group ─────────────────────────────────────── */
function SymptomGroup({ group, symptoms, selected, onToggle, defaultOpen = false }: {
  group: string; symptoms: string[];
  selected: string[]; onToggle: (v: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const activeInGroup = symptoms.filter(s => selected.includes(s)).length;

  return (
    <div className="rounded-[18px] overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.52)', border: '1px solid rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)' }}>
      <button type="button" onClick={() => { haptic.selection(); setOpen(v => !v); }}
        className="w-full px-4 py-3 flex items-center gap-2 text-right">
        <span style={{ fontSize: 12.5, fontWeight: 900, color: C.ink, flex: 1 }}>{group}</span>
        {activeInGroup > 0 && !open && (
          <span className="rounded-full px-2 py-0.5"
            style={{ background: 'rgba(8,145,178,0.10)', color: C.teal, fontSize: 10, fontWeight: 900 }}>
            {activeInGroup} ✓
          </span>
        )}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown style={{ width: 14, height: 14, color: C.muted }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}>
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {symptoms.map(s => (
                <SymptomChip key={s} label={s} selected={selected.includes(s)} onToggle={() => onToggle(s)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */
export function StepRelatedSymptoms({ complaint, selected, onChange, onNext }: {
  complaint?: ChiefComplaintAnswers;
  selected: string[];
  onChange: (v: string[]) => void;
  onNext: () => void;
}) {
  const groups = getGroups(complaint?.system);
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]);

  return (
    <div className="relative min-h-screen overflow-hidden" dir="rtl" style={{ background: C.bg }}>
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position: 'absolute', top: -80, right: -60, width: 320, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(34,211,238,0.16),transparent 64%)', filter: 'blur(50px)' }} />
      </div>

      <div className="relative z-10 px-4 pt-4 pb-44">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 28 }} className="mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-3"
            style={{ background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.18)' }}>
            <PlusCircle style={{ width: 11, height: 11, color: C.teal }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: C.teal }}>أعراض مرافقة</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 950, lineHeight: 1.2, color: C.ink, letterSpacing: '-0.015em', marginBottom: 6 }}>
            هل معه شيء ثاني؟
          </h2>
          <p style={{ fontSize: 12, lineHeight: 1.65, color: C.sub, fontWeight: 650 }}>
            اختر فقط الأشياء الموجودة الآن مع{' '}
            <span style={{ fontWeight: 900, color: C.teal }}>{complaint?.complaintLabel ?? 'العرض'}</span>.
            {' '}إذا ما في شيء، اضغط التالي مباشرة.
          </p>
        </motion.div>

        {/* Groups */}
        <div className="grid gap-2.5">
          {groups.map((g, i) => (
            <motion.div key={g.group}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 28 }}>
              <SymptomGroup
                group={g.group}
                symptoms={g.symptoms}
                selected={selected}
                onToggle={toggle}
                defaultOpen={i === 0}
              />
            </motion.div>
          ))}
        </div>

        {/* Selected summary */}
        <AnimatePresence>
          {selected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              className="mt-4 rounded-[18px] p-3.5"
              style={{ background: 'rgba(8,145,178,0.07)', border: '1px solid rgba(8,145,178,0.15)', backdropFilter: 'blur(14px)' }}
            >
              <p style={{ fontSize: 11, fontWeight: 900, color: C.teal, marginBottom: 6 }}>
                اخترت {selected.length} أعراض مرافقة:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selected.map(s => (
                  <span key={s} className="rounded-full px-2.5 py-1"
                    style={{ background: 'rgba(8,145,178,0.10)', border: '1px solid rgba(8,145,178,0.18)', color: C.ink, fontSize: 10.5, fontWeight: 820 }}>
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomCTA
        label="التالي"
        onPress={onNext}
        variant="teal"
        sublabel={selected.length > 0 ? `${selected.length} أعراض مرافقة · ندخلها في القراءة` : 'لا بأس إذا ما في أعراض إضافية'}
      />
    </div>
  );
}

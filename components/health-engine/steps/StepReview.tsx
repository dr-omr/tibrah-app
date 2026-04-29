'use client';
// StepReview — Simple Arabic copy + HOPI/ChiefComplaint in summary

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Edit3, ChevronDown,
  SlidersHorizontal, Clock, Brain, Leaf,
  BarChart2, MessageSquare, ArrowLeft,
} from 'lucide-react';
import type { EngineAnswers } from '../types';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';
import type { AssessmentDirectorState } from '@/lib/assessment/assessment-director';
import { isUncertainAnswerValue } from '@/components/health-engine/assessment/questions/questionExperience';

const C = {
  bg:    'linear-gradient(168deg,#E8F8FB 0%,#E0F2FE 34%,#F3FBFD 100%)',
  ink:   '#073B52',
  sub:   '#0F6F8F',
  muted: '#639CAF',
  teal:  '#0787A5',
  green: '#059669',
  amber: '#D97706',
};

/* ── Collapsible summary row ───────────────────────────────── */
function SummaryRow({
  icon, label, value, color, onEdit, children, index,
}: {
  icon: React.ReactNode; label: string; value: string;
  color: string; onEdit?: () => void; children?: React.ReactNode; index: number;
}) {
  const [open, setOpen] = useState(false);
  const hasDetail = Boolean(children);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, type: 'spring', stiffness: 260, damping: 28 }}
      className="relative overflow-hidden"
      style={{
        borderRadius: 20,
        background: 'rgba(255,255,255,0.68)',
        border: '1.5px solid rgba(255,255,255,0.90)',
        backdropFilter: 'blur(22px) saturate(140%)',
        boxShadow: '0 4px 16px rgba(8,145,178,0.05), inset 0 1.5px 0 rgba(255,255,255,0.94)',
      }}
    >
      <div className="absolute top-0 left-[14%] right-[14%] h-[2px] rounded-b-full pointer-events-none"
        style={{ background: `linear-gradient(90deg,transparent,${color}70,transparent)` }} />

      <button
        type="button"
        className="w-full flex items-center gap-3 text-right"
        style={{ padding: '12px 14px', background: 'none', border: 'none', cursor: hasDetail ? 'pointer' : 'default' }}
        onClick={() => { if (hasDetail) { haptic.selection(); setOpen(v => !v); } }}
      >
        <div className="shrink-0 flex items-center justify-center rounded-[13px]"
          style={{ width: 36, height: 36, background: `${color}0E`, border: `1px solid ${color}1E` }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0 text-right">
          <span style={{ fontSize: 10, fontWeight: 900, color, display: 'block', marginBottom: 1 }}>{label}</span>
          <span style={{ fontSize: 13.5, fontWeight: 900, color: C.ink, display: 'block', lineHeight: 1.3 }}>{value}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onEdit && (
            <button type="button"
              onClick={e => { e.stopPropagation(); haptic.selection(); onEdit(); }}
              className="rounded-full px-2.5 py-1 inline-flex items-center gap-1"
              style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.90)', color: C.sub, fontSize: 10, fontWeight: 900 }}>
              <Edit3 style={{ width: 10, height: 10 }} />
              تعديل
            </button>
          )}
          {hasDetail && (
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown style={{ width: 14, height: 14, color: C.muted }} />
            </motion.span>
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && children && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${color}14` }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TagChips({ items, color }: { items: string[]; color: string }) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-3">
      {items.map(item => (
        <span key={item} className="rounded-full px-2.5 py-1"
          style={{ background: `${color}08`, border: `1px solid ${color}18`, color: C.ink, fontSize: 10.5, fontWeight: 820 }}>
          {item}
        </span>
      ))}
    </div>
  );
}

function ReadinessChip({ readiness, meaning }: { readiness: string; meaning: string }) {
  const map: Record<string, { label: string; color: string; emoji: string }> = {
    enough:      { label: 'النتيجة واضحة بشكل كافٍ',   color: '#059669', emoji: '✅' },
    preliminary: { label: 'النتيجة أولية',              color: '#D97706', emoji: '⚡' },
    weak:        { label: 'البيانات محدودة — قراءة خفيفة', color: '#DC2626', emoji: '⚠️' },
  };
  const cfg = map[readiness] ?? map.preliminary;

  return (
    <div className="rounded-[18px] p-3.5"
      style={{ background: `${cfg.color}07`, border: `1px solid ${cfg.color}1A`, backdropFilter: 'blur(14px)' }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span style={{ fontSize: 14 }}>{cfg.emoji}</span>
        <span style={{ fontSize: 11, fontWeight: 900, color: cfg.color }}>{cfg.label}</span>
      </div>
      <p style={{ fontSize: 11, lineHeight: 1.65, color: C.sub, fontWeight: 700 }}>{meaning}</p>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */
export function StepReview({
  answers, directorState,
  onEditPathway, onEditClinical, onEditEmotional, onEditNutrition, onAnalyze,
}: {
  answers: EngineAnswers;
  directorState: AssessmentDirectorState;
  onEditPathway: () => void;
  onEditClinical: () => void;
  onEditEmotional: () => void;
  onEditNutrition: () => void;
  onAnalyze: () => void;
}) {
  const cc             = answers.chiefComplaint;
  const hopi           = answers.hopi;
  const emotionalCount = answers.emotionalContext.filter(i => i !== 'none').length;
  const nutritionMode  = directorState.tayyibatMode;
  const hasNutrition   = nutritionMode !== 'none';
  const snap           = directorState.flowSnapshot;

  const ONSET_LABEL: Record<string, string> = {
    hours: 'اليوم', days: 'من أيام', week: 'من أسبوع',
    weeks: 'من أسابيع', months: 'من أشهر', recur: 'متكرر من زمان', unknown: 'غير واضح',
  };

  const uncertainAnswers = [
    ...(answers.duration === 'unknown' ? ['مدة الأعراض'] : []),
    ...Object.entries(answers.clinicalAnswers)
      .filter(([, v]) => isUncertainAnswerValue(v))
      .map(([k]) => k),
  ];

  const nutritionLabel: Record<typeof nutritionMode, string> = {
    none: 'لم تظهر كطبقة أساسية',
    educational_only: 'رؤية تعريفية',
    beginner: 'بداية عملية',
    pattern_followup: 'متابعة نمط',
  };

  return (
    <div className="relative min-h-screen overflow-hidden" dir="rtl" style={{ background: C.bg }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.36, 0.66, 0.36] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -80, right: -80, width: 350, height: 330, borderRadius: '50%', background: 'radial-gradient(circle,rgba(34,211,238,0.18),transparent 64%)', filter: 'blur(54px)' }} />
        <div style={{ position: 'absolute', bottom: 90, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(5,150,105,0.11),transparent 64%)', filter: 'blur(52px)' }} />
      </div>

      <div className="relative z-10 px-4 pt-4" style={{ paddingBottom: 200 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 28 }} className="mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-3"
            style={{ background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.18)', backdropFilter: 'blur(14px)' }}>
            <CheckCircle2 style={{ width: 11, height: 11, color: C.teal }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: C.teal }}>قبل ما نبني ملخص حالتك</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 950, lineHeight: 1.2, color: C.ink, letterSpacing: '-0.015em', marginBottom: 6 }}>
            شوف اللي جمعناه
          </h2>
          <p style={{ fontSize: 12, lineHeight: 1.6, fontWeight: 600, color: C.sub }}>
            اضغط على أي قسم تشوف التفاصيل أو تعدّله.
          </p>
        </motion.div>

        <div className="grid gap-2.5">
          {/* Chief Complaint */}
          {cc && (
            <SummaryRow index={0}
              icon={<span style={{ fontSize: 18 }}>💬</span>}
              label="إيش يضايقك"
              value={cc.complaintLabel}
              color={C.teal}
              onEdit={onEditPathway}
            >
              <div className="pt-3 grid gap-1.5">
                <p style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>
                  الجهاز: {cc.systemLabel}
                </p>
                {cc.secondaryComplaints.length > 0 && (
                  <>
                    <p style={{ fontSize: 10.5, color: C.muted, fontWeight: 720 }}>أعراض إضافية:</p>
                    <TagChips items={cc.secondaryComplaints} color={C.teal} />
                  </>
                )}
              </div>
            </SummaryRow>
          )}

          {/* HOPI summary */}
          {hopi && (
            <SummaryRow index={1}
              icon={<MessageSquare style={{ width: 16, height: 16, color: '#6366F1' }} />}
              label="تفاصيل العرض"
              value={[hopi.onset ? ONSET_LABEL[hopi.onset] ?? hopi.onset : null, hopi.course].filter(Boolean).join(' · ') || 'مدوّن'}
              color="#6366F1"
              onEdit={onEditClinical}
            >
              <div className="pt-3 grid gap-1">
                {hopi.onset && <p style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>متى بدأ: {ONSET_LABEL[hopi.onset] ?? hopi.onset}</p>}
                {hopi.course && <p style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>كيف ماشي: {hopi.course}</p>}
                {hopi.location && <p style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>المكان: {hopi.location}</p>}
                {hopi.character && <p style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>نوع الألم: {hopi.character}</p>}
                {hopi.aggravating.length > 0 && <p style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>يزيده: {hopi.aggravating.join('، ')}</p>}
                {hopi.relieving.length > 0 && <p style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>يخففه: {hopi.relieving.join('، ')}</p>}
                {hopi.functionalImpact && <p style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>تأثيره عليك: {hopi.functionalImpact}</p>}
              </div>
            </SummaryRow>
          )}

          {/* Severity + Duration */}
          <div className="grid grid-cols-2 gap-2.5">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 28 }}
              className="relative overflow-hidden rounded-[20px] p-3.5"
              style={{ background: 'rgba(255,255,255,0.68)', border: '1.5px solid rgba(255,255,255,0.90)', backdropFilter: 'blur(22px)', boxShadow: '0 4px 16px rgba(217,119,6,0.06)' }}>
              <div className="absolute top-0 left-[14%] right-[14%] h-[2px] rounded-b-full"
                style={{ background: `linear-gradient(90deg,transparent,${C.amber}70,transparent)` }} />
              <div className="flex items-center gap-1.5 mb-2">
                <SlidersHorizontal style={{ width: 12, height: 12, color: C.amber }} />
                <span style={{ fontSize: 10, fontWeight: 900, color: C.amber }}>الشدة</span>
              </div>
              <p style={{ fontSize: 22, fontWeight: 950, color: C.ink }}>
                {answers.severity}<span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>/10</span>
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 260, damping: 28 }}
              className="relative overflow-hidden rounded-[20px] p-3.5"
              style={{ background: 'rgba(255,255,255,0.68)', border: '1.5px solid rgba(255,255,255,0.90)', backdropFilter: 'blur(22px)', boxShadow: '0 4px 16px rgba(99,102,241,0.06)' }}>
              <div className="absolute top-0 left-[14%] right-[14%] h-[2px] rounded-b-full"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.70),transparent)' }} />
              <div className="flex items-center gap-1.5 mb-2">
                <Clock style={{ width: 12, height: 12, color: '#6366F1' }} />
                <span style={{ fontSize: 10, fontWeight: 900, color: '#6366F1' }}>المدة</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 950, color: C.ink }}>
                {ONSET_LABEL[answers.duration] ?? (answers.duration || 'غير محددة')}
              </p>
            </motion.div>
          </div>

          {/* Clinical signals */}
          {directorState.keyAnsweredSignals.length > 0 && (
            <SummaryRow index={3}
              icon={<BarChart2 style={{ width: 16, height: 16, color: C.teal }} />}
              label="إشارات مهمة من إجاباتك"
              value={`${directorState.keyAnsweredSignals.length} إشارة`}
              color={C.teal}
              onEdit={onEditClinical}
            >
              <TagChips items={directorState.keyAnsweredSignals.slice(0, 6)} color={C.teal} />
            </SummaryRow>
          )}

          {/* Related symptoms */}
          {(answers.relatedSymptoms ?? []).length > 0 && (
            <SummaryRow index={4}
              icon={<span style={{ fontSize: 16 }}>➕</span>}
              label="أعراض مرافقة"
              value={`${answers.relatedSymptoms!.length} عرض`}
              color="#0EA5E9"
            >
              <TagChips items={answers.relatedSymptoms!} color="#0EA5E9" />
            </SummaryRow>
          )}

          {/* Emotional */}
          <SummaryRow index={5}
            icon={<Brain style={{ width: 16, height: 16, color: '#7C3AED' }} />}
            label="أشياء ممكن تزيد الحالة"
            value={emotionalCount > 0 ? `${emotionalCount} عامل ظهر` : 'ما ظهر عامل واضح'}
            color="#7C3AED"
            onEdit={onEditEmotional}
          >
            {answers.emotionalContext.filter(i => i !== 'none' && i !== 'unknown').length > 0 && (
              <TagChips items={answers.emotionalContext.filter(i => i !== 'none' && i !== 'unknown')} color="#7C3AED" />
            )}
          </SummaryRow>

          {/* Nutrition */}
          <SummaryRow index={6}
            icon={<Leaf style={{ width: 16, height: 16, color: C.green }} />}
            label="الأكل والنوم والروتين"
            value={answers.nutritionAnswers
              ? `${Object.keys({ ...answers.nutritionAnswers.gateAnswers, ...answers.nutritionAnswers.deepAnswers }).length} إجابة`
              : nutritionLabel[nutritionMode]}
            color={C.green}
            onEdit={(hasNutrition || answers.nutritionAnswers) ? onEditNutrition : undefined}
          >
            {!hasNutrition && !answers.nutritionAnswers && (
              <p style={{ fontSize: 10.5, color: C.sub, fontWeight: 650, paddingTop: 4 }}>
                اختصرنا هذا الجزء — إجاباتك الحالية كافية لقراءة أولية.
              </p>
            )}
          </SummaryRow>

          {/* Uncertain */}
          {uncertainAnswers.length > 0 && (
            <SummaryRow index={7}
              icon={<span style={{ fontSize: 16 }}>⚠️</span>}
              label="إجابات غير مؤكدة"
              value={`${uncertainAnswers.length} نقطة — القراءة تبقى أولية`}
              color={C.amber}
            >
              <TagChips items={uncertainAnswers.slice(0, 5)} color={C.amber} />
              <p style={{ fontSize: 10, color: C.sub, fontWeight: 650, marginTop: 6 }}>
                لا مشكلة — تقدر ترفع الدقة لاحقاً.
              </p>
            </SummaryRow>
          )}

          {/* Readiness */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 28 }}>
            <ReadinessChip
              readiness={snap.confidenceReadiness}
              meaning={directorState.userProgressMeaning}
            />
          </motion.div>
        </div>
      </div>

      <BottomCTA
        label="ابنِ ملخص حالتي"
        onPress={onAnalyze}
        variant="teal"
        sublabel="تم حفظ إجاباتك · تقدر ترجع للتعديل"
      />
    </div>
  );
}

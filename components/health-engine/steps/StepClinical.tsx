// components/health-engine/steps/StepClinical.tsx
'use client';

import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { PATHWAYS } from '../constants';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';
import type { AnswerValue, AssessmentFlowSnapshot, ClinicalQuestion } from '../types';
import { getDeepQuestionsForPathway } from '@/lib/clinical/deep-intake-questions';
import { getAdaptiveFoodQuestions } from '@/lib/clinical/tayyibat-adaptive-screening';
import { AdaptiveReasonRibbon } from '@/components/health-engine/assessment/questions/AdaptiveReasonRibbon';
import { DurationSelectorCard } from '@/components/health-engine/assessment/questions/DurationSelectorCard';
import { NOT_SURE_VALUE } from '@/components/health-engine/assessment/questions/NotSureOption';
import { OptionCardGroup, type SmartOption } from '@/components/health-engine/assessment/questions/OptionCardGroup';
import { SeverityScaleCard } from '@/components/health-engine/assessment/questions/SeverityScaleCard';
import { SmartQuestionCard } from '@/components/health-engine/assessment/questions/SmartQuestionCard';
import {
  countAnswered,
  impactForSmartQuestion,
  whyForSmartQuestion,
} from '@/components/health-engine/assessment/questions/questionExperience';

const W = {
  pageBg: 'linear-gradient(168deg, #E8F8FB 0%, #D9F1F7 24%, #E7F3FF 56%, #F7FCFD 100%)',
  ink: '#073B52',
  sub: '#0F6F8F',
  muted: '#639CAF',
  teal: '#0787A5',
  green: '#059669',
};

function readableSignals(pathwayId: string, severity: number, clinicalAnswers: Record<string, AnswerValue>) {
  const text = Object.values(clinicalAnswers).flat().join(' ');
  const signals: string[] = [];
  if (text.includes('أكل') || text.includes('سكر') || text.includes('انتفاخ') || text.includes('حموضة')) signals.push('غذاء أو هضم');
  if (text.includes('نوم') || text.includes('أرق') || pathwayId === 'sleep') signals.push('نوم أو إيقاع');
  if (text.includes('توتر') || text.includes('قلق') || pathwayId === 'anxiety') signals.push('ضغط أو قلق');
  if (severity >= 7) signals.push('شدة مرتفعة');
  return signals;
}

function SectionTitle({ title, accent }: { title: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 my-3 px-1">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, ${accent}30, transparent)` }} />
      <span className="rounded-full px-3 py-1"
        style={{ background: `${accent}0E`, border: `1px solid ${accent}1E`, color: accent, fontSize: 10, fontWeight: 950, letterSpacing: '0.04em' }}>
        {title}
      </span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${accent}30, transparent)` }} />
    </div>
  );
}

function optionList(question: ClinicalQuestion): SmartOption[] {
  return [
    ...(question.options ?? []).map(option => ({ value: option, label: option })),
    { value: NOT_SURE_VALUE, label: 'لا أعرف / لست متأكدًا', subtext: 'لا مشكلة. سنبقي القراءة أولية ويمكنك رفع الدقة لاحقًا.' },
  ];
}

function SmartClinicalQuestion({
  question,
  value,
  color,
  mode,
  index,
  impactOverride,
  onSingle,
  onMulti,
}: {
  question: ClinicalQuestion;
  value: AnswerValue | undefined;
  color: string;
  mode: 'core' | 'deep' | 'food';
  index: number;
  impactOverride?: string;
  onSingle: (qId: string, opt: string) => void;
  onMulti: (qId: string, opt: string) => void;
}) {
  const stageLabel = mode === 'food' ? 'الغذاء والإيقاع' : mode === 'deep' ? 'تعميق القراءة' : 'قراءة النمط';
  const count = countAnswered(value);

  return (
    <SmartQuestionCard
      title={question.text}
      stageLabel={stageLabel}
      whyWeAsk={whyForSmartQuestion(question, mode)}
      impact={impactForSmartQuestion(question, mode, impactOverride)}
      accent={color}
      selectedCount={count}
      priorityMode={mode === 'food'}
      index={index}
    >
      <OptionCardGroup
        options={optionList(question)}
        value={value}
        multiple={question.type === 'multiple'}
        accent={color}
        onChange={(optionValue) => question.type === 'multiple'
          ? onMulti(question.id, optionValue)
          : onSingle(question.id, optionValue)}
      />
    </SmartQuestionCard>
  );
}

export function StepClinical({
  pathwayId,
  severity,
  duration,
  clinicalAnswers,
  shouldShowDeepQuestions = true,
  shouldShowFoodQuestions = false,
  adaptiveTriggers = [],
  questionImpactMap = {},
  onSeverity,
  onDuration,
  onAnswer,
  onNext,
}: {
  pathwayId: string;
  severity: number;
  duration: string;
  clinicalAnswers: Record<string, AnswerValue>;
  shouldShowDeepQuestions?: boolean;
  shouldShowFoodQuestions?: boolean;
  adaptiveTriggers?: AssessmentFlowSnapshot['adaptiveTriggers'];
  questionImpactMap?: Record<string, string>;
  onSeverity: (v: number) => void;
  onDuration: (v: string) => void;
  onAnswer: (qId: string, value: AnswerValue) => void;
  onNext: () => void;
}) {
  const pathway = PATHWAYS.find(p => p.id === pathwayId);
  if (!pathway) return null;

  const deepQuestions = shouldShowDeepQuestions ? getDeepQuestionsForPathway(pathwayId, severity) : [];
  const foodQuestions = shouldShowFoodQuestions
    ? getAdaptiveFoodQuestions(pathwayId, severity, clinicalAnswers, 3)
    : [];
  const adaptiveSignals = adaptiveTriggers.length
    ? adaptiveTriggers.map(item => item.trigger)
    : readableSignals(pathwayId, severity, clinicalAnswers);
  const nutritionTriggers = adaptiveTriggers.filter(item =>
    item.trigger.includes('غذاء') || item.trigger.includes('هضم') || item.caused.includes('الغذاء') || item.caused.includes('الإيقاع')
  );
  const patternTriggers = adaptiveTriggers.filter(item => !nutritionTriggers.includes(item));

  const setSingle = (qId: string, opt: string) => {
    haptic.selection();
    onAnswer(qId, clinicalAnswers[qId] === opt ? '' : opt);
  };

  const setMulti = (qId: string, opt: string) => {
    haptic.selection();
    const current = Array.isArray(clinicalAnswers[qId]) ? clinicalAnswers[qId] as string[] : [];
    if (opt === NOT_SURE_VALUE) {
      onAnswer(qId, current.includes(NOT_SURE_VALUE) ? [] : [NOT_SURE_VALUE]);
      return;
    }
    const withoutUncertain = current.filter(item => item !== NOT_SURE_VALUE);
    onAnswer(qId, withoutUncertain.includes(opt)
      ? withoutUncertain.filter(item => item !== opt)
      : [...withoutUncertain, opt]);
  };

  const requiredAnswered = pathway.clinicalQuestions.filter(q => {
    const value = clinicalAnswers[q.id];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }).length;

  return (
    <div className="relative min-h-screen overflow-hidden" dir="rtl" style={{ background: W.pageBg }}>
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.42, 0.72, 0.42] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -90, right: -70, width: 360, height: 330, borderRadius: '50%', background: `radial-gradient(circle, ${pathway.color}24, transparent 64%)`, filter: 'blur(54px)' }}
        />
        <div style={{ position: 'absolute', bottom: 70, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.13), transparent 64%)', filter: 'blur(52px)' }} />
      </div>

      <div className="relative z-10 px-4 pt-4" style={{ paddingBottom: 200 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 28 }} className="mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-3"
            style={{ background: `${pathway.color}10`, border: `1px solid ${pathway.color}22`, backdropFilter: 'blur(16px)' }}>
            <SlidersHorizontal style={{ width: 11, height: 11, color: pathway.color }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: pathway.color }}>فهم الشدة والمدة</span>
          </div>
          <h2 style={{ fontSize: 25, fontWeight: 950, lineHeight: 1.2, color: W.ink, letterSpacing: '-0.015em', marginBottom: 6 }}>
            صف الأعراض كما تشعر بها
          </h2>
          <p style={{ fontSize: 11.5, lineHeight: 1.6, fontWeight: 650, color: W.sub }}>
            فقط صف ما يحدث — عن <span style={{ fontWeight: 900, color: pathway.color }}>{pathway.label}</span>.
          </p>
        </motion.div>

        <SectionTitle title="نحدد العرض" accent={pathway.color} />
        <SeverityScaleCard value={severity} onChange={onSeverity} index={0} />
        <DurationSelectorCard
          value={duration}
          accent={pathway.color}
          onChange={onDuration}
          index={1}
        />

        <SectionTitle title="نقرأ النمط" accent={pathway.color} />
        <div className="flex items-center justify-between mb-3 px-1">
          <p style={{ fontSize: 12, fontWeight: 950, color: W.ink }}>قراءة الإشارات</p>
          <p style={{ fontSize: 11, fontWeight: 800, color: W.muted }}>{requiredAnswered}/{pathway.clinicalQuestions.length} أسئلة أساسية</p>
        </div>

        {pathway.clinicalQuestions.map((question, index) => (
          <SmartClinicalQuestion
            key={question.id}
            question={question}
            value={clinicalAnswers[question.id]}
            color={pathway.color}
            mode="core"
            index={index}
            impactOverride={questionImpactMap[question.id]}
            onSingle={setSingle}
            onMulti={setMulti}
          />
        ))}

        {deepQuestions.length > 0 && (
          <>
            <AdaptiveReasonRibbon
              triggers={patternTriggers.slice(0, 2)}
              fallback="أضفنا هذه الأسئلة لأن البيانات الحالية تحتاج تعميقًا بسيطًا قبل بناء الخريطة."
              accent={W.green}
            />
            {deepQuestions.map((question, index) => (
              <SmartClinicalQuestion
                key={question.id}
                question={question}
                value={clinicalAnswers[question.id]}
                color={W.green}
                mode="deep"
                index={index}
                impactOverride={questionImpactMap[question.id]}
                onSingle={setSingle}
                onMulti={setMulti}
              />
            ))}
          </>
        )}

        {foodQuestions.length > 0 && (
          <>
            <SectionTitle title="نضيف السياق" accent={W.green} />
            <AdaptiveReasonRibbon
              triggers={nutritionTriggers.length ? nutritionTriggers : adaptiveTriggers}
              fallback={`أضفنا أسئلة الغذاء والإيقاع لأنك ذكرت: ${adaptiveSignals.slice(0, 2).join('، ') || 'إشارة قد ترتبط بالغذاء أو النوم أو الضغط'}.`}
              accent={W.green}
            />
            {foodQuestions.map((question, index) => {
              const options: SmartOption[] = [
                ...question.options.map(option => ({
                  value: option.value,
                  label: `${option.emoji ?? ''} ${option.label}`.trim(),
                })),
                { value: NOT_SURE_VALUE, label: 'لا أعرف / لست متأكدًا', subtext: 'سنحفظها كنقطة غير مؤكدة لا كخطأ منك.' },
              ];

              return (
                <SmartQuestionCard
                  key={question.id}
                  title={question.text}
                  stageLabel="الغذاء والإيقاع"
                  whyWeAsk="نبحث إن كان الغذاء يغيّر شدة الأعراض أو توقيتها."
                  impact="إذا ظهرت علاقة، ستدخل طبقة الغذاء والإيقاع في النتيجة."
                  accent={W.green}
                  selectedCount={countAnswered(clinicalAnswers[question.id])}
                  priorityMode
                  index={index}
                >
                  <OptionCardGroup
                    options={options}
                    value={clinicalAnswers[question.id]}
                    accent={W.green}
                    onChange={(optionValue) => setSingle(question.id, optionValue)}
                  />
                </SmartQuestionCard>
              );
            })}
          </>
        )}

        {!shouldShowDeepQuestions && deepQuestions.length === 0 && adaptiveTriggers.some(item => item.caused.includes('اختصار') || item.trigger.includes('علامة أولوية')) && (
          <AdaptiveReasonRibbon
            triggers={adaptiveTriggers}
            fallback="اختصرنا هذا الجزء لأن البيانات الحالية تكفي لقراءة أولية."
            accent={pathway.color}
          />
        )}
      </div>

      <BottomCTA
        label="التالي"
        onPress={onNext}
        variant="teal"
        sublabel={`${requiredAnswered}/${pathway.clinicalQuestions.length} أسئلة · لا نحكم عليك، نقرأ النمط فقط`}
      />
    </div>
  );
}

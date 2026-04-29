'use client';

import { SeveritySlider } from '@/components/health-engine/ui/SeveritySlider';
import { SmartQuestionCard } from './SmartQuestionCard';
import { SEVERITY_QUESTION_META } from './questionExperience';

export function getSeverityInterpretation(value: number) {
  if (value <= 3) return { label: 'خفيف', color: '#059669', text: 'يمكن مراقبته إذا لم توجد علامات أولوية.' };
  if (value <= 6) return { label: 'متوسط', color: '#D97706', text: 'يستحق فهمًا أوضح للنمط والمدة.' };
  if (value <= 8) return { label: 'شديد', color: '#EA580C', text: 'نأخذ الشدة بجدية ونرفع أولوية المتابعة.' };
  return { label: 'شديد جداً', color: '#DC2626', text: 'هذه الدرجة تجعل السلامة أولوية قبل التفاصيل.' };
}

export function SeverityScaleCard({
  value,
  onChange,
  index = 0,
}: {
  value: number;
  onChange: (value: number) => void;
  index?: number;
}) {
  const severity = getSeverityInterpretation(value);

  return (
    <SmartQuestionCard
      title="درجة الشدة الآن"
      stageLabel="نحدد العرض"
      whyWeAsk={SEVERITY_QUESTION_META.whyWeAsk}
      impact={SEVERITY_QUESTION_META.impact}
      accent={severity.color}
      selectedCount={1}
      badge={`${value}/10 · ${severity.label}`}
      priorityMode={value >= 7}
      index={index}
    >
      <SeveritySlider value={value} onChange={onChange} />
      <div className="rounded-[16px] px-3 py-2 mt-4" style={{ background: `${severity.color}0D`, border: `1px solid ${severity.color}20` }}>
        <p style={{ fontSize: 11.5, lineHeight: 1.7, color: '#0369A1', fontWeight: 700 }}>{severity.text}</p>
      </div>
    </SmartQuestionCard>
  );
}

'use client';

import { haptic } from '@/lib/HapticFeedback';
import { SmartQuestionCard } from './SmartQuestionCard';
import { OptionCardGroup, type SmartOption } from './OptionCardGroup';
import { NotSureOption } from './NotSureOption';
import { DURATION_QUESTION_META } from './questionExperience';

export const DURATION_OPTIONS: SmartOption[] = [
  { value: 'hours', label: 'اليوم', subtext: 'بدأ خلال الساعات الأخيرة' },
  { value: 'days', label: 'منذ أيام', subtext: 'يومان إلى أسبوع' },
  { value: 'week', label: 'منذ أسبوع', subtext: 'أكثر من أسبوع' },
  { value: 'weeks', label: 'منذ أسابيع', subtext: 'ثلاثة أسابيع أو أكثر' },
  { value: 'months', label: 'منذ أشهر', subtext: 'ثلاثة أشهر أو أكثر' },
  { value: 'recur', label: 'يتكرر منذ فترة', subtext: 'يأتي ويذهب بشكل متكرر' },
];

export function DurationSelectorCard({
  value,
  accent,
  onChange,
  index = 1,
}: {
  value: string;
  accent: string;
  onChange: (value: string) => void;
  index?: number;
}) {
  return (
    <SmartQuestionCard
      title="مدة الأعراض"
      stageLabel="نحدد العرض"
      whyWeAsk={DURATION_QUESTION_META.whyWeAsk}
      impact={DURATION_QUESTION_META.impact}
      accent="#6366F1"
      selectedCount={value ? 1 : 0}
      index={index}
    >
      <OptionCardGroup
        options={DURATION_OPTIONS}
        value={value}
        accent={accent}
        onChange={(next) => {
          haptic.selection();
          onChange(next);
        }}
      />
      <NotSureOption
        selected={value === 'unknown'}
        accent="#6366F1"
        label="غير واضحة"
        subtext="لا مشكلة. سنبقي القراءة أولية ويمكنك رفع الدقة لاحقًا."
        onSelect={() => {
          haptic.selection();
          onChange(value === 'unknown' ? '' : 'unknown');
        }}
      />
    </SmartQuestionCard>
  );
}

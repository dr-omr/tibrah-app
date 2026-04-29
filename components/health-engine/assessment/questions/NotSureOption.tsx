'use client';

import { OptionCard } from './OptionCardGroup';

export const NOT_SURE_VALUE = 'not_sure';

export function NotSureOption({
  selected,
  accent,
  onSelect,
  label = 'لا أعرف / لست متأكدًا',
  subtext = 'لا مشكلة. سنبقي القراءة أولية ويمكنك رفع الدقة لاحقًا.',
}: {
  selected: boolean;
  accent: string;
  onSelect: () => void;
  label?: string;
  subtext?: string;
}) {
  return (
    <div className="mt-2">
      <OptionCard
        option={{ value: NOT_SURE_VALUE, label, subtext }}
        selected={selected}
        accent={accent}
        onSelect={onSelect}
      />
    </div>
  );
}

import React from 'react';
import { EVIDENCE_LEVELS, EvidenceLevel } from '@/types/therapeuticSessionTypes';

interface EvidenceBadgeProps {
  level: EvidenceLevel;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export default function EvidenceBadge({ level, size = 'sm', showLabel = true }: EvidenceBadgeProps) {
  const info = EVIDENCE_LEVELS[level];
  if (!info) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium
        ${info.bg_color} ${info.color}
        ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'}
      `}
      title={info.description_ar}
    >
      <span className="leading-none">{info.icon}</span>
      {showLabel && <span>{info.label_ar}</span>}
    </span>
  );
}

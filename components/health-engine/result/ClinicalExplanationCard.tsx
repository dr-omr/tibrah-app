// components/health-engine/result/ClinicalExplanationCard.tsx
'use client';
import { BookOpen } from 'lucide-react';
import type { ResultInsightBlock } from '../types';
import type { DomainVisConfig } from './shared/design-tokens';
import { W } from './shared/design-tokens';
import { GlassCard, AccentIconBox, SectionLabel } from './shared/GlassCard';

interface Props { block: ResultInsightBlock; vis: DomainVisConfig; on: boolean; }

export function ClinicalExplanationCard({ block, vis, on }: Props) {
    return (
        <GlassCard delay={0.60} on={on} className="mx-4 mb-4 p-5">
            <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                    <AccentIconBox color={vis.particleColor}>
                        <BookOpen style={{ width: 16, height: 16, color: vis.textColor }} />
                    </AccentIconBox>
                    <SectionLabel text={block.sectionLabel} color={vis.textColor} />
                </div>
                <p style={{ fontSize: 12.5, color: W.textPrimary, lineHeight: 1.85, fontWeight: 500 }}>
                    {block.body}
                </p>
            </div>
        </GlassCard>
    );
}

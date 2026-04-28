// components/health-engine/result/SeekCareCard.tsx
'use client';
import { AlertTriangle } from 'lucide-react';
import type { ResultEscalationBlock } from '../types';
import { W } from './shared/design-tokens';
import { GlassCard, AccentIconBox, SectionLabel } from './shared/GlassCard';

interface Props { block: ResultEscalationBlock; on: boolean; }

const RED = '#DC2626';

export function SeekCareCard({ block, on }: Props) {
    return (
        <GlassCard delay={0.72} on={on} className="mx-4 mb-4 p-4">
            <div className="absolute top-0 bottom-0 right-0 w-1 rounded-l-full"
                style={{ background: `linear-gradient(to bottom, ${RED}, ${RED}50)` }} />
            <div className="flex items-start gap-3 relative z-10">
                <AccentIconBox color={RED}>
                    <AlertTriangle style={{ width: 16, height: 16, color: RED }} />
                </AccentIconBox>
                <div>
                    <SectionLabel text={block.sectionLabel} color="#991B1B" />
                    <p style={{ fontSize: 11.5, fontWeight: 500, color: W.textPrimary, lineHeight: 1.75 }}>
                        {block.body}
                    </p>
                </div>
            </div>
        </GlassCard>
    );
}

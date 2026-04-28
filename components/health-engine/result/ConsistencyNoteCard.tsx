// components/health-engine/result/ConsistencyNoteCard.tsx
'use client';
import { AlertTriangle } from 'lucide-react';
import type { ConsistencyNoteBlock } from '../types';
import { W } from './shared/design-tokens';
import { GlassCard, AccentIconBox, SectionLabel } from './shared/GlassCard';

interface Props { block: ConsistencyNoteBlock; on: boolean; }

const AMBER = '#D97706';

export function ConsistencyNoteCard({ block, on }: Props) {
    return (
        <GlassCard delay={0.73} on={on} className="mx-4 mb-4 p-4">
            <div className="absolute top-0 bottom-0 right-0 w-1 rounded-l-full"
                style={{ background: `linear-gradient(to bottom, ${AMBER}, ${AMBER}50)` }} />
            <div className="flex items-start gap-3 relative z-10">
                <AccentIconBox color={AMBER}>
                    <AlertTriangle style={{ width: 16, height: 16, color: AMBER }} />
                </AccentIconBox>
                <div className="flex-1">
                    <SectionLabel text="ملاحظة اتساق" color="#92400E" />
                    <div className="space-y-2">
                        {block.notes.map((note, i) => (
                            <p key={i} style={{ fontSize: 11, fontWeight: 500, color: W.textPrimary, lineHeight: 1.7 }}>
                                · {note}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}

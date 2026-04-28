// components/health-engine/result/PriorityCard.tsx
'use client';
import { Star } from 'lucide-react';
import { W } from './shared/design-tokens';
import { GlassCard, AccentIconBox, SectionLabel } from './shared/GlassCard';

interface Props {
    priorityText: string;
    domainColor: string;
    on: boolean;
    delay?: number;
}

export function PriorityCard({ priorityText, domainColor, on, delay = 0.66 }: Props) {
    return (
        <GlassCard delay={delay} on={on} className="mx-4 mb-4 p-4">
            <div className="absolute top-0 bottom-0 right-0 w-1 rounded-l-full"
                style={{ background: `linear-gradient(to bottom, ${domainColor}, ${domainColor}50)` }} />
            <div className="flex items-start gap-3 relative z-10">
                <AccentIconBox color={domainColor}>
                    <Star style={{ width: 16, height: 16, color: domainColor }} />
                </AccentIconBox>
                <div>
                    <SectionLabel text="أولويتك هذا الأسبوع" color={domainColor} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: W.textPrimary, lineHeight: 1.65 }}>
                        {priorityText}
                    </p>
                </div>
            </div>
        </GlassCard>
    );
}

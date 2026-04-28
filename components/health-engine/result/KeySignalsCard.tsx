// components/health-engine/result/KeySignalsCard.tsx
'use client';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import type { KeySignalPresentation } from '../types';
import type { DomainVisConfig } from './shared/design-tokens';
import { W } from './shared/design-tokens';
import { GlassCard, AccentIconBox, SectionLabel } from './shared/GlassCard';

interface Props {
    signals: KeySignalPresentation[];
    vis: DomainVisConfig;
    on: boolean;
}

export function KeySignalsCard({ signals, vis, on }: Props) {
    if (signals.length === 0) return null;

    return (
        <GlassCard delay={0.75} on={on} className="mx-4 mb-4 p-4">
            <div className="flex items-center gap-2.5 mb-3 relative z-10">
                <AccentIconBox color={vis.particleColor} size={32}>
                    <Activity style={{ width: 14, height: 14, color: vis.textColor }} />
                </AccentIconBox>
                <SectionLabel text="الإشارات التي وجّهت تقييمك" color={vis.textColor} />
            </div>
            <div className="space-y-2 relative z-10">
                {signals.map((sig, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={on ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.78 + i * 0.06 }}
                        className="flex items-start gap-2.5 rounded-[12px] px-3 py-2"
                        style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.75)' }}>
                        <span style={{ fontSize: 10, marginTop: 1 }}>{sig.emoji}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: W.textPrimary, lineHeight: 1.55 }}>{sig.label}</span>
                    </motion.div>
                ))}
            </div>
        </GlassCard>
    );
}

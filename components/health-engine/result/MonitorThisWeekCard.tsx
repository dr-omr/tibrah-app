// components/health-engine/result/MonitorThisWeekCard.tsx
'use client';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import type { ResultMonitoringBlock } from '../types';
import type { DomainVisConfig } from './shared/design-tokens';
import { W } from './shared/design-tokens';
import { GlassCard, AccentIconBox, SectionLabel } from './shared/GlassCard';

interface Props { block: ResultMonitoringBlock; vis: DomainVisConfig; on: boolean; }

export function MonitorThisWeekCard({ block, vis, on }: Props) {
    return (
        <GlassCard delay={0.68} on={on} className="mx-4 mb-4 p-4">
            <div className="flex items-center gap-2.5 mb-3 relative z-10">
                <AccentIconBox color={W.teal} size={32}>
                    <Eye style={{ width: 14, height: 14, color: W.tealDeep }} />
                </AccentIconBox>
                <SectionLabel text={block.sectionLabel} color={W.tealDeep} />
            </div>
            <div className="space-y-2 relative z-10">
                {block.items.map((item, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={on ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.72 + i * 0.06 }}
                        className="flex items-center gap-2.5 rounded-[12px] px-3 py-2.5"
                        style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.75)' }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: vis.particleColor }} />
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: W.textPrimary }}>{item}</span>
                    </motion.div>
                ))}
            </div>
        </GlassCard>
    );
}

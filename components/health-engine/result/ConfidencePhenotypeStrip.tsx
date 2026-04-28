// components/health-engine/result/ConfidencePhenotypeStrip.tsx
'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Activity } from 'lucide-react';
import type { ConfidencePhenotypeBlock } from '../types';
import type { DomainVisConfig } from './shared/design-tokens';
import { W } from './shared/design-tokens';

interface Props {
    block: ConfidencePhenotypeBlock;
    vis: DomainVisConfig;
    on: boolean;
}

export function ConfidencePhenotypeStrip({ block, vis, on }: Props) {
    const confColor =
        block.confidenceBand === 'high'   ? '#059669' :
        block.confidenceBand === 'medium' ? '#D97706' : '#DC2626';

    const confBg =
        block.confidenceBand === 'high'   ? 'rgba(5,150,105,0.10)'  :
        block.confidenceBand === 'medium' ? 'rgba(245,158,11,0.10)' : 'rgba(220,38,38,0.10)';

    const confBorder =
        block.confidenceBand === 'high'   ? 'rgba(5,150,105,0.25)'  :
        block.confidenceBand === 'medium' ? 'rgba(245,158,11,0.25)' : 'rgba(220,38,38,0.25)';

    const confTextColor =
        block.confidenceBand === 'high'   ? '#065F46' :
        block.confidenceBand === 'medium' ? '#92400E'  : '#991B1B';

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={on ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.55 }}
            className="mx-4 mb-3 space-y-2">

            {/* Confidence row */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: confBg, border: `1px solid ${confBorder}`, backdropFilter: 'blur(12px)' }}>
                    {block.confidenceBand === 'high'
                        ? <CheckCircle style={{ width: 11, height: 11, color: '#059669' }} />
                        : <Activity style={{ width: 11, height: 11, color: confColor }} />}
                    <span style={{ fontSize: 10, fontWeight: 800, color: confTextColor }}>
                        {block.confidenceLabel}
                        {block.confidenceScore > 0 && (
                            <span style={{ opacity: 0.65, marginRight: 4 }}>({block.confidenceScore}%)</span>
                        )}
                    </span>
                </div>
                {block.confidenceFactors.map((f, i) => (
                    <span key={i} style={{
                        fontSize: 9, fontWeight: 700,
                        color: 'rgba(100,116,139,0.9)',
                        background: 'rgba(255,255,255,0.5)',
                        border: '1px solid rgba(203,213,225,0.4)',
                        borderRadius: 99,
                        padding: '3px 8px',
                    }}>{f}</span>
                ))}
            </div>

            {/* Phenotype row */}
            {block.showPhenotype && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-[12px]"
                    style={{ background: `${vis.particleColor}0D`, border: `1px solid ${vis.particleColor}22`, backdropFilter: 'blur(12px)' }}>
                    <span style={{ fontSize: 13, marginTop: 2 }}>🔬</span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <p style={{ fontSize: 9, fontWeight: 800, color: vis.textColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                النمط السريري المُستنتج
                            </p>
                            {block.phenotypeMatchScore > 0 && (
                                <span style={{
                                    fontSize: 9, fontWeight: 900,
                                    color:      block.phenotypeMatchScore >= 50 ? '#059669' : '#D97706',
                                    background: block.phenotypeMatchScore >= 50 ? 'rgba(5,150,105,0.10)' : 'rgba(245,158,11,0.10)',
                                    borderRadius: 99,
                                    padding: '2px 7px',
                                    flexShrink: 0,
                                }}>
                                    {block.phenotypeMatchScore}%
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: 11.5, fontWeight: 700, color: W.textPrimary, lineHeight: 1.4 }}>
                            {block.phenotypeLabel}
                        </p>
                        {block.phenotypeDescription && (
                            <p style={{ fontSize: 10.5, color: W.textSub, marginTop: 4, lineHeight: 1.5 }}>
                                {block.phenotypeDescription}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

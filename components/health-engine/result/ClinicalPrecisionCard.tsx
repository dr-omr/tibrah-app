// components/health-engine/result/ClinicalPrecisionCard.tsx
'use client';
import { Activity, Clock, Target, AlertTriangle, Zap, Network } from 'lucide-react';
import type { ClinicalPrecisionResult } from '@/lib/clinical-precision-engine';
import type { DomainVisConfig } from './shared/design-tokens';
import { W } from './shared/design-tokens';
import { GlassCard, AccentIconBox, SectionLabel } from './shared/GlassCard';

interface Props { 
    data: ClinicalPrecisionResult; 
    vis: DomainVisConfig; 
    on: boolean; 
}

export function ClinicalPrecisionCard({ data, vis, on }: Props) {
    if (!data) return null;

    return (
        <GlassCard delay={0.65} on={on} className="mx-4 mb-4 p-5">
            <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-4">
                    <AccentIconBox color={vis.particleColor}>
                        <Activity style={{ width: 16, height: 16, color: vis.textColor }} />
                    </AccentIconBox>
                    <SectionLabel text="التحليل السريري الدقيق" color={vis.textColor} />
                </div>

                <div className="flex flex-col gap-3">
                    {/* Timeline & Recurrence */}
                    <div className="flex items-start gap-2.5 bg-white/40 rounded-xl p-3 border border-white/50">
                        <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: vis.textColor }} />
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: W.textPrimary }}>المسار الزمني: {data.timeline.durationText}</p>
                            <p style={{ fontSize: 11, color: W.textSub, marginTop: 2, lineHeight: 1.6 }}>
                                {data.recurrence.pattern}. {data.timeline.timeOfDayPattern && `(${data.timeline.timeOfDayPattern})`}
                            </p>
                        </div>
                    </div>

                    {/* Triggers & Relievers */}
                    {data.triggerMap && (data.triggerMap.triggers.length > 0 || data.triggerMap.relievers.length > 0) && (
                        <div className="flex items-start gap-2.5 bg-white/40 rounded-xl p-3 border border-white/50">
                            <Target className="w-4 h-4 mt-0.5 shrink-0" style={{ color: vis.textColor }} />
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: W.textPrimary }}>المحفزات والمهدئات</p>
                                <div className="mt-2 flex flex-col gap-1.5">
                                    {data.triggerMap.triggers.length > 0 && (
                                        <p style={{ fontSize: 11, color: W.textSub }}>
                                            <span style={{ color: '#EF4444', fontWeight: 600 }}>تسوء مع:</span> {data.triggerMap.triggers.join('، ')}
                                        </p>
                                    )}
                                    {data.triggerMap.relievers.length > 0 && (
                                        <p style={{ fontSize: 11, color: W.textSub }}>
                                            <span style={{ color: '#10B981', fontWeight: 600 }}>تتحسن مع:</span> {data.triggerMap.relievers.join('، ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Food-Symptom Signals */}
                    {data.foodSymptomSignals && data.foodSymptomSignals.length > 0 && (
                        <div className="flex items-start gap-2.5 bg-white/40 rounded-xl p-3 border border-white/50">
                            <Zap className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: W.textPrimary }}>روابط التغذية</p>
                                <div className="mt-2 flex flex-col gap-2">
                                    {data.foodSymptomSignals.map((signal, idx) => (
                                        <div key={idx}>
                                            <p style={{ fontSize: 11.5, color: W.textPrimary, fontWeight: 500 }}>• {signal.signal}</p>
                                            <p style={{ fontSize: 10.5, color: W.textSub, marginTop: 1, paddingRight: 8 }}>↳ {signal.action}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Symptom Clusters (Multi-signal Patterns) */}
                    {data.symptomClusters && data.symptomClusters.length > 0 && (
                        <div className="flex items-start gap-2.5 bg-white/40 rounded-xl p-3 border border-white/50">
                            <Network className="w-4 h-4 mt-0.5 shrink-0" style={{ color: vis.textColor }} />
                            <div className="flex-1">
                                <p style={{ fontSize: 13, fontWeight: 700, color: W.textPrimary }}>الأنماط السريرية المكتشفة</p>
                                <div className="mt-2 flex flex-col gap-2.5">
                                    {data.symptomClusters.map((cluster) => (
                                        <div key={cluster.id} className="bg-white/30 rounded-lg p-2.5 border border-white/40">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <p style={{ fontSize: 11.5, color: vis.textColor, fontWeight: 700 }}>{cluster.name}</p>
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/60 text-[#0C4A6E]">
                                                    ثقة {cluster.confidence}%
                                                </span>
                                            </div>
                                            <p style={{ fontSize: 10.5, color: W.textSub, lineHeight: 1.5, marginBottom: 6 }}>{cluster.significance}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {cluster.matchedSignals.map((sig, sIdx) => {
                                                    const cleanSig = sig.startsWith('[عاطفي:') ? sig.replace('[عاطفي: ', 'عاطفياً: ').replace(']', '') : sig;
                                                    return (
                                                        <span key={sIdx} className="text-[9px] font-medium bg-white/50 px-1.5 py-0.5 rounded text-[#475569]">
                                                            {cleanSig}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sustaining Factors */}
                    {data.sustainingFactors && data.sustainingFactors.length > 0 && (
                        <div className="flex items-start gap-2.5 bg-white/40 rounded-xl p-3 border border-white/50">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: W.textPrimary }}>عوامل الاستمرار المحتملة</p>
                                <ul className="mt-1 flex flex-col gap-1 pr-1">
                                    {data.sustainingFactors.slice(0, 2).map((factor, idx) => (
                                        <li key={idx} style={{ fontSize: 11, color: W.textSub, lineHeight: 1.5 }}>• {factor}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}

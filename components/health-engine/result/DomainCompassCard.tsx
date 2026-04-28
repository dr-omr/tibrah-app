// components/health-engine/result/DomainCompassCard.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH v9 — Domain Compass — Deep Water Glass Redesign
// ════════════════════════════════════════════════════════════════
'use client';
import { motion } from 'framer-motion';
import type { DomainCompassBlock, DomainId } from '../types';
import { DOMAIN_BY_ID } from '@/lib/domain-routing-map';
import { W, DOMAIN_VIS } from './shared/design-tokens';
import { GlassCard, AnimatedNum } from './shared/GlassCard';

interface Props { compass: DomainCompassBlock; on: boolean; }

export function DomainCompassCard({ compass, on }: Props) {
    const primary   = DOMAIN_BY_ID[compass.primaryDomainId];
    const secondary = DOMAIN_BY_ID[compass.secondaryDomainId];
    const vis       = DOMAIN_VIS[compass.primaryDomainId];
    const secVis    = DOMAIN_VIS[compass.secondaryDomainId];
    const domains: DomainId[] = ['jasadi', 'nafsi', 'fikri', 'ruhi'];
    const maxScore  = Math.max(...domains.map(d => compass.domainScores[d] ?? 0), 1);

    return (
        <GlassCard delay={0.30} on={on} className="mx-4 mb-4 p-5">
            {/* Colored accent top strip */}
            <div className="absolute top-0 left-[15%] right-[15%] h-[3px] rounded-b-full pointer-events-none"
                style={{ background: `linear-gradient(90deg, ${vis.particleColor}50, ${vis.particleColor}, ${vis.particleColor}50)` }} />

            {/* Header */}
            <div className="flex items-center gap-3 mb-5 relative z-10">
                {/* Primary domain orb */}
                <div className="relative w-12 h-12 flex-shrink-0">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-12 h-12 rounded-[16px] flex items-center justify-center relative overflow-hidden"
                        style={{
                            background: vis.grad,
                            border: '1.5px solid rgba(255,255,255,0.88)',
                            boxShadow: `0 6px 20px ${vis.glow}, inset 0 1.5px 0 rgba(255,255,255,0.9)`,
                        }}>
                        <div className="absolute top-0 left-0 right-0 h-[48%]"
                            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 100%)', borderRadius: '15px 15px 0 0' }} />
                        <span style={{ fontSize: 20, position: 'relative', zIndex: 1 }}>{primary?.emoji}</span>
                    </motion.div>
                    {/* Secondary orb badge */}
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                            background: secVis.grad,
                            border: '2px solid rgba(255,255,255,0.92)',
                            boxShadow: `0 2px 8px ${secVis.glow}`,
                            fontSize: 11,
                        }}>
                        {secondary?.emoji}
                    </div>
                </div>

                <div>
                    <p style={{ fontSize: 8.5, fontWeight: 900, color: W.textMuted, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 3 }}>
                        خريطة الأقسام الأربعة
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 900, color: W.textPrimary }}>
                        {primary?.arabicName}
                        <span style={{ fontSize: 12, fontWeight: 600, color: W.textSub }}> + {secondary?.arabicName}</span>
                    </p>
                </div>
            </div>

            {/* Primary / Secondary chips */}
            <div className="flex gap-2 mb-5 relative z-10">
                {[
                    { label: 'القسم الرئيسي', dom: primary, dv: vis },
                    { label: 'القسم المساند', dom: secondary, dv: secVis },
                ].map(({ label, dom, dv }) => (
                    <div key={label} className="flex-1 rounded-[18px] p-3 relative overflow-hidden"
                        style={{
                            background: dv.tint,
                            border: `1.5px solid ${dv.border}`,
                            backdropFilter: 'blur(10px)',
                            boxShadow: `0 4px 12px ${dv.glow}, inset 0 1px 0 rgba(255,255,255,0.55)`,
                        }}>
                        <div className="absolute inset-x-0 top-0 h-[45%]"
                            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%)', borderRadius: '17px 17px 0 0' }} />
                        <p style={{ fontSize: 7.5, fontWeight: 900, color: dv.textColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, position: 'relative', zIndex: 1 }}>
                            {label}
                        </p>
                        <div className="flex items-center gap-1.5" style={{ position: 'relative', zIndex: 1 }}>
                            <span style={{ fontSize: 16 }}>{dom?.emoji}</span>
                            <span style={{ fontSize: 13, fontWeight: 900, color: W.textPrimary }}>{dom?.arabicName}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Score bars — radar feel */}
            <div className="space-y-3 relative z-10 mb-5">
                {domains.map((domId, i) => {
                    const dom       = DOMAIN_BY_ID[domId];
                    const dv        = DOMAIN_VIS[domId];
                    const score     = compass.domainScores[domId] ?? 0;
                    const pct       = maxScore > 0 ? (score / maxScore) * 100 : 0;
                    const isPrimary = domId === compass.primaryDomainId;
                    const isSec     = domId === compass.secondaryDomainId;

                    return (
                        <motion.div key={domId}
                            initial={{ opacity: 0, x: -12 }}
                            animate={on ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.38 + i * 0.07, type: 'spring', stiffness: 280, damping: 28 }}
                            style={{ opacity: score === 0 ? 0.30 : 1 }}
                            className="flex items-center gap-3">
                            {/* Label */}
                            <div className="flex items-center gap-1.5 flex-shrink-0" style={{ width: 68 }}>
                                <span style={{ fontSize: 14 }}>{dom?.emoji}</span>
                                <span style={{ fontSize: 9.5, fontWeight: 800, color: isPrimary ? dv.textColor : W.textMuted }}>
                                    {dom?.arabicName}
                                </span>
                            </div>
                            {/* Bar track */}
                            <div className="flex-1 rounded-full overflow-hidden"
                                style={{ height: isPrimary ? 9 : 7, background: `${dv.particleColor}12` }}>
                                <motion.div className="h-full rounded-full"
                                    style={{
                                        background: isPrimary
                                            ? `linear-gradient(90deg, ${dv.particleColor}, ${W.tealLight})`
                                            : isSec
                                                ? `${dv.particleColor}70`
                                                : `${dv.particleColor}40`,
                                        boxShadow: isPrimary ? `0 0 10px ${dv.particleColor}50` : 'none',
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ delay: 0.44 + i * 0.07, duration: 1.1, ease: [0.05, 0.7, 0.1, 1] }}
                                />
                            </div>
                            {/* Score */}
                            <span style={{
                                fontSize: 10.5, fontWeight: 900,
                                color: isPrimary ? dv.textColor : W.textMuted,
                                width: 34, textAlign: 'right', flexShrink: 0,
                            }}>
                                {isPrimary
                                    ? <AnimatedNum value={score} delay={0.52 + i * 0.07} suffix="%" />
                                    : `${score}%`
                                }
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Why divider */}
            <div className="h-px mb-4 relative z-10"
                style={{ background: `linear-gradient(90deg, transparent, ${vis.particleColor}35, transparent)` }} />

            {/* Why text */}
            <div className="relative z-10 rounded-[18px] p-3.5"
                style={{
                    background: vis.tint,
                    border: `1px solid ${vis.border}`,
                    backdropFilter: 'blur(8px)',
                }}>
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: vis.particleColor }} />
                    <p style={{ fontSize: 9, fontWeight: 900, color: vis.textColor, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        لماذا هذا التوجيه؟
                    </p>
                </div>
                <p style={{ fontSize: 12, color: W.textSub, lineHeight: 1.8, fontWeight: 500 }}>
                    {compass.whyText}
                </p>
            </div>
        </GlassCard>
    );
}

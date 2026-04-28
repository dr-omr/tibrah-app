// components/health-engine/result/ResultHeroCard.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH v9 — Result Hero — Deep Water Glass Redesign
// ════════════════════════════════════════════════════════════════
'use client';
import { motion } from 'framer-motion';
import type { ResultHeroBlock } from '../types';
import type { DomainVisConfig } from './shared/design-tokens';
import { W } from './shared/design-tokens';
import { WaterAmbient, WaterScoreRing, AnimatedNum } from './shared/GlassCard';

interface Props {
    hero: ResultHeroBlock;
    vis: DomainVisConfig;
    on: boolean;
}

export function ResultHeroCard({ hero, vis, on }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={on ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.08 }}
            className="relative overflow-hidden mx-4 mb-4"
            style={{
                borderRadius: 32,
                background: vis.heroGrad,
                boxShadow: `0 24px 60px ${vis.glow}, 0 4px 16px rgba(0,0,0,0.06), inset 0 1.5px 0 rgba(255,255,255,0.92)`,
                border: `1.5px solid rgba(255,255,255,0.90)`,
            }}>

            {/* Glass sheen layers */}
            <div className="absolute inset-x-0 top-0 pointer-events-none"
                style={{ height: '55%', background: 'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.08) 60%, transparent 100%)', borderRadius: '32px 32px 0 0' }} />
            {/* Specular highlight */}
            <div className="absolute pointer-events-none"
                style={{ top: 8, right: 14, width: 60, height: 32, background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%)', filter: 'blur(4px)' }} />
            <div className="absolute pointer-events-none"
                style={{ top: 18, right: 30, width: 20, height: 20, background: 'radial-gradient(ellipse, rgba(255,255,255,0.40) 0%, transparent 70%)', filter: 'blur(2px)' }} />
            {/* Caustic refraction bottom */}
            <div className="absolute bottom-0 inset-x-0 pointer-events-none"
                style={{ height: '35%', background: `linear-gradient(0deg, ${vis.particleColor}10 0%, transparent 100%)`, borderRadius: '0 0 32px 32px' }} />

            <WaterAmbient domainColor={vis.particleColor} />

            {/* Floating micro-bubbles */}
            {[
                { top: '20%', left: '15%', size: 5 },
                { top: '55%', left: '30%', size: 3 },
                { top: '35%', left: '65%', size: 4 },
            ].map((b, i) => (
                <motion.div key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{ top: b.top, left: b.left, width: b.size, height: b.size, background: `${vis.particleColor}50`, filter: 'blur(0.5px)' }}
                    animate={{ y: [-4, 4, -4], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3 + i * 0.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                />
            ))}

            <div className="relative z-10 p-5 pb-5">
                {/* Top bar: badge + score */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                        {/* Triage badge */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={on ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.18 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                            style={{
                                background: 'rgba(255,255,255,0.40)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255,255,255,0.65)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
                            }}>
                            <div className="w-2 h-2 rounded-full" style={{ background: vis.particleColor }} />
                            <span style={{ fontSize: 10, fontWeight: 900, color: vis.textColor, letterSpacing: '0.04em' }}>
                                {hero.triageBadge}
                            </span>
                        </motion.div>

                        {/* Domain label */}
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={on ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.22 }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: vis.textColor, marginBottom: 4, letterSpacing: '0.02em' }}>
                                نظام طِبرَا · {hero.domainArabicName}
                            </p>
                            <h1 style={{ fontSize: 24, fontWeight: 900, color: W.textPrimary, letterSpacing: '-0.025em', lineHeight: 1.2, maxWidth: 200 }}>
                                خريطة توجيهك الشخصية
                            </h1>
                        </motion.div>
                    </div>

                    {/* Score ring */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.55 }}
                        animate={on ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 350, damping: 22 }}>
                        <WaterScoreRing score={hero.score} color={vis.particleColor} />
                    </motion.div>
                </div>

                {/* Stats grid */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={on ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.30 }}
                    className="grid grid-cols-3 gap-2 mb-4">
                    {[
                        { label: 'الشكوى',  value: `${hero.pathwayEmoji} ${hero.pathwayLabel}` },
                        { label: 'الشدة',   value: hero.severityDisplay },
                        { label: 'المدة',   value: hero.durationDisplay },
                    ].map((d, i) => (
                        <div key={i} className="text-center py-2.5 rounded-[14px] relative overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.32)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.55)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.60)',
                            }}>
                            <div className="absolute inset-x-0 top-0 h-[45%]"
                                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.40) 0%, transparent 100%)', borderRadius: '14px 14px 0 0' }} />
                            <p style={{ fontSize: 7.5, color: vis.textColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', position: 'relative', zIndex: 1 }}>{d.label}</p>
                            <p style={{ fontSize: 11.5, fontWeight: 900, color: W.textPrimary, marginTop: 2, position: 'relative', zIndex: 1 }}>{d.value}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Integrative insight */}
                {hero.integrativeInsight && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={on ? { opacity: 1 } : {}}
                        transition={{ delay: 0.40 }}
                        className="rounded-[16px] p-3"
                        style={{
                            background: 'rgba(255,255,255,0.22)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.40)',
                        }}>
                        <p style={{ fontSize: 9, fontWeight: 900, color: vis.textColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>
                            ✦ رأي طِبرَا السريري
                        </p>
                        <p style={{ fontSize: 12, fontWeight: 500, color: W.textPrimary, lineHeight: 1.75 }}>
                            {hero.integrativeInsight}
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

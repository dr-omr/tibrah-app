// components/health-engine/result/EscalationBanner.tsx
// ═══════════════════════════════════════════════════════════════
// TIBRAH v12 — Ultra-Rich Escalation Banner
// Pulsing glow border · heartbeat icon · urgency pulse rings
// Glass layers · shimmer sweep · cinematic CTA
// ═══════════════════════════════════════════════════════════════
'use client';
import { motion } from 'framer-motion';
import { Shield, Phone, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { EscalationBannerBlock } from '../types';
import { haptic } from '@/lib/HapticFeedback';
import { trackEvent } from '@/lib/analytics';

interface Props { block: EscalationBannerBlock; on: boolean; }

export function EscalationBanner({ block, on }: Props) {
    const isEmergency = block.isEmergency;
    const glow = isEmergency ? 'rgba(220,38,38,0.45)' : 'rgba(245,158,11,0.35)';
    const accent = isEmergency ? '#EF4444' : '#F59E0B';
    const accentSoft = isEmergency ? 'rgba(255,120,120,0.18)' : 'rgba(255,200,80,0.14)';

    return (
        <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.05, type: 'spring', stiffness: 280, damping: 24 }}
            className="mx-4 mb-3 relative overflow-hidden rounded-[26px]">

            {/* ── Pulsing glow border ── */}
            <motion.div
                className="absolute inset-0 rounded-[26px] pointer-events-none"
                animate={{
                    boxShadow: [
                        `0 0 0 0px transparent, 0 14px 40px ${glow}`,
                        `0 0 0 3px ${accent}20, 0 18px 50px ${glow}`,
                        `0 0 0 0px transparent, 0 14px 40px ${glow}`,
                    ],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* ── Main card body ── */}
            <div className="relative rounded-[26px] p-5" style={{
                background: isEmergency
                    ? 'linear-gradient(155deg, rgba(80,10,10,0.94) 0%, rgba(127,29,29,0.88) 50%, rgba(80,10,10,0.92) 100%)'
                    : 'linear-gradient(155deg, rgba(60,30,5,0.94) 0%, rgba(92,52,8,0.88) 50%, rgba(60,30,5,0.92) 100%)',
                border: `1.5px solid ${accent}30`,
            }}>
                {/* Glass sheen top */}
                <div className="absolute inset-x-0 top-0 pointer-events-none"
                    style={{
                        height: '48%',
                        background: `linear-gradient(180deg, ${accentSoft} 0%, transparent 100%)`,
                        borderRadius: '26px 26px 0 0',
                    }} />

                {/* Specular highlight */}
                <div className="absolute pointer-events-none"
                    style={{ top: '10%', left: '20%', width: 50, height: 12, borderRadius: '50%', background: `${accent}12`, filter: 'blur(8px)' }} />

                {/* Shimmer sweep */}
                <motion.div className="absolute inset-0 pointer-events-none"
                    style={{ background: `linear-gradient(110deg, transparent 30%, ${accent}10 50%, transparent 70%)` }}
                    animate={{ x: ['-120%', '200%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 1.5 }}
                />

                <div className="relative z-10">
                    {/* Title row */}
                    <div className="flex items-center gap-3 mb-3">
                        {/* Pulsing icon orb */}
                        <div className="relative flex-shrink-0" style={{ width: 40, height: 40 }}>
                            {/* Pulse rings */}
                            {[0, 1].map(i => (
                                <motion.div key={i}
                                    className="absolute rounded-[14px] pointer-events-none"
                                    animate={{
                                        scale: [1, 1.35, 1],
                                        opacity: [0.25, 0, 0.25],
                                    }}
                                    transition={{
                                        duration: isEmergency ? 1.5 : 2.5,
                                        repeat: Infinity,
                                        ease: 'easeOut',
                                        delay: i * 0.5,
                                    }}
                                    style={{
                                        inset: 0,
                                        border: `2px solid ${accent}40`,
                                        borderRadius: 14,
                                    }}
                                />
                            ))}
                            <motion.div
                                animate={{ scale: [1, 1.12, 1] }}
                                transition={{ duration: isEmergency ? 0.8 : 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-full h-full rounded-[14px] flex items-center justify-center relative overflow-hidden"
                                style={{
                                    background: `linear-gradient(145deg, ${accent}35 0%, ${accent}20 100%)`,
                                    border: `1.5px solid ${accent}40`,
                                    boxShadow: `0 4px 18px ${accent}30, inset 0 1px 0 ${accent}20`,
                                }}>
                                <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
                                    style={{ background: `linear-gradient(180deg, ${accent}18 0%, transparent 100%)`, borderRadius: '12px 12px 0 0' }} />
                                {isEmergency
                                    ? <AlertTriangle style={{ width: 18, height: 18, color: '#FCA5A5', position: 'relative', zIndex: 1 }} />
                                    : <Shield style={{ width: 18, height: 18, color: '#FDE68A', position: 'relative', zIndex: 1 }} />
                                }
                            </motion.div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                {isEmergency && (
                                    <motion.div
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: '#EF4444', boxShadow: '0 0 8px #EF4444' }}
                                    />
                                )}
                                <span style={{
                                    fontSize: 13, fontWeight: 900,
                                    color: isEmergency ? 'rgba(255,160,160,0.95)' : 'rgba(255,210,100,0.95)',
                                    letterSpacing: '-0.01em',
                                }}>
                                    {block.title}
                                </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full"
                                style={{
                                    fontSize: 7.5, fontWeight: 900,
                                    background: `${accent}18`, border: `1px solid ${accent}25`,
                                    color: isEmergency ? '#FCA5A5' : '#FDE68A',
                                    textTransform: 'uppercase', letterSpacing: '0.12em',
                                }}>
                                {isEmergency ? '⚡ تنبيه حرج' : '⚠️ يحتاج انتباه'}
                            </span>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="rounded-[18px] p-3.5 mb-4 relative overflow-hidden"
                        style={{
                            background: `${accent}08`,
                            border: `1px solid ${accent}15`,
                        }}>
                        <div className="absolute inset-x-0 top-0 h-[42%] pointer-events-none"
                            style={{ background: `linear-gradient(180deg, ${accent}08 0%, transparent 100%)`, borderRadius: '18px 18px 0 0' }} />
                        <p style={{
                            fontSize: 12, lineHeight: 1.75, fontWeight: 500,
                            color: isEmergency ? 'rgba(255,190,190,0.90)' : 'rgba(255,210,120,0.90)',
                            position: 'relative', zIndex: 1,
                        }}>
                            {block.body}
                        </p>
                    </div>

                    {/* CTA button */}
                    <Link href={block.ctaHref}
                        onClick={() => {
                            haptic.impact();
                            trackEvent('booking_from_routing', {
                                triage_level: block.level,
                                from: 'escalation_banner',
                            });
                        }}>
                        <motion.div whileTap={{ scale: 0.96, y: 1 }}
                            className="flex items-center justify-center gap-2.5 py-3 rounded-[18px] relative overflow-hidden"
                            style={{
                                background: isEmergency
                                    ? 'linear-gradient(160deg, rgba(220,38,38,0.90) 0%, rgba(185,28,28,0.85) 100%)'
                                    : 'linear-gradient(160deg, rgba(217,119,6,0.85) 0%, rgba(180,83,9,0.80) 100%)',
                                border: `1.5px solid ${accent}45`,
                                boxShadow: `0 6px 24px ${accent}35, inset 0 1px 0 ${accent}25`,
                            }}>
                            <div className="absolute inset-x-0 top-0 h-[50%] pointer-events-none"
                                style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)`, borderRadius: '18px 18px 0 0' }} />
                            {/* Shimmer */}
                            <motion.div className="absolute inset-0 pointer-events-none"
                                style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)' }}
                                animate={{ x: ['-150%', '250%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 2 }}
                            />
                            {isEmergency
                                ? <Phone style={{ width: 15, height: 15, color: '#fff', position: 'relative', zIndex: 1 }} />
                                : <Calendar style={{ width: 15, height: 15, color: '#78350F', position: 'relative', zIndex: 1 }} />}
                            <span style={{
                                fontSize: 14, fontWeight: 900,
                                color: isEmergency ? '#fff' : '#78350F',
                                position: 'relative', zIndex: 1,
                            }}>
                                {block.ctaLabel}
                            </span>
                        </motion.div>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

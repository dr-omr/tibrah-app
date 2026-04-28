// components/health-engine/result/RecommendationRail.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH v9 — Recommendation Rail — Deep Water Glass Redesign
// ════════════════════════════════════════════════════════════════
'use client';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft, Shield, Zap, TestTube2, PlayCircle, BarChart3, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { RecommendationGroup, RankedRecommendation } from '../types';
import { W } from './shared/design-tokens';
import { haptic } from '@/lib/HapticFeedback';
import { trackEvent } from '@/lib/analytics';
import { markToolOpened } from '@/lib/care-plan-store';

/* ── Icon by tool type ─────────────────────────────────── */
const TYPE_ICON: Record<string, typeof Shield> = {
    protocol: Shield,
    practice: Zap,
    test:     TestTube2,
    workshop: PlayCircle,
    tracker:  BarChart3,
};

const TYPE_LABEL: Record<string, string> = {
    protocol: 'بروتوكول',
    practice: 'تطبيق',
    test:     'اختبار',
    workshop: 'ورشة',
    tracker:  'متابعة',
};

/* ── Effort badge colour ───────────────────────────────── */
const EFFORT_COLOR: Record<string, string> = {
    low:    '#059669',
    medium: '#D97706',
    high:   '#DC2626',
};

/* ── Single recommendation card ────────────────────────── */
function RecommendationCard({ rec, index, on }: {
    rec: RankedRecommendation;
    index: number;
    on: boolean;
}) {
    const Icon   = TYPE_ICON[rec.type] ?? Shield;
    const accent = rec.accentColor;

    const handleClick = () => {
        haptic.tap();
        markToolOpened(rec.id);
        trackEvent('primary_recommendation_clicked', {
            tool_id:   rec.id,
            tool_type: rec.type,
            tool_name: rec.englishName,
            group:     rec.group,
            is_free:   String(rec.isFree),
        });
        if (rec.type === 'protocol') trackEvent('start_protocol_clicked', { tool_id: rec.id });
        else trackEvent('start_tool_clicked', { tool_id: rec.id, tool_type: rec.type });
    };

    return (
        <Link href={rec.href} onClick={handleClick}>
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={on ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.70 + index * 0.07, type: 'spring', stiffness: 250, damping: 26 }}
                whileTap={{ scale: 0.97, y: 1 }}
                className="relative overflow-hidden rounded-[24px] cursor-pointer mb-3"
                style={{
                    background: `linear-gradient(155deg, rgba(255,255,255,0.72) 0%, ${accent}06 70%, ${accent}03 100%)`,
                    border: `1.5px solid rgba(255,255,255,0.88)`,
                    backdropFilter: 'blur(26px)',
                    boxShadow: `0 6px 24px ${accent}12, 0 2px 8px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.95)`,
                }}>

                {/* Glass sheen */}
                <div className="absolute inset-x-0 top-0 pointer-events-none"
                    style={{ height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 100%)', borderRadius: '24px 24px 0 0' }} />
                {/* Top shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                    style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)` }} />
                {/* Right accent bar */}
                <div className="absolute top-3 bottom-3 right-0 w-[3px] rounded-l-full pointer-events-none"
                    style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}50)`, boxShadow: `0 0 6px ${accent}35` }} />
                {/* Bottom ambient tint */}
                <div className="absolute bottom-0 inset-x-0 pointer-events-none"
                    style={{ height: '35%', background: `linear-gradient(0deg, ${accent}06 0%, transparent 100%)`, borderRadius: '0 0 24px 24px' }} />

                {/* Main content */}
                <div className="flex items-start gap-3 p-4 pr-5 relative z-10">
                    {/* Icon orb */}
                    <div className="relative flex-shrink-0 w-13 h-13">
                        <div className="w-13 h-13 rounded-[16px] flex items-center justify-center overflow-hidden relative"
                            style={{
                                width: 52, height: 52,
                                background: `linear-gradient(145deg, rgba(255,255,255,0.88) 0%, ${accent}14 100%)`,
                                border: `1.5px solid rgba(255,255,255,0.88)`,
                                boxShadow: `0 4px 16px ${accent}18, inset 0 1.5px 0 rgba(255,255,255,0.95)`,
                            }}>
                            <div className="absolute inset-x-0 top-0 h-[48%]"
                                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.60) 0%, transparent 100%)', borderRadius: '15px 15px 0 0' }} />
                            <span style={{ fontSize: 22, position: 'relative', zIndex: 1 }}>{rec.emoji}</span>

                            {/* Type badge */}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: accent, border: '2px solid rgba(255,255,255,0.92)', boxShadow: `0 2px 6px ${accent}40` }}>
                                <Icon className="text-white" style={{ width: 9, height: 9 }} />
                            </div>
                        </div>
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span style={{
                                fontSize: 8.5, fontWeight: 900, color: accent,
                                textTransform: 'uppercase', letterSpacing: '0.1em',
                            }}>
                                {TYPE_LABEL[rec.type] ?? rec.type}
                            </span>
                            {!rec.isFree && (
                                <span className="px-1.5 py-0.5 rounded-full"
                                    style={{ fontSize: 7, fontWeight: 800, background: 'rgba(251,191,36,0.14)', color: '#92400E', border: '1px solid rgba(251,191,36,0.28)' }}>
                                    PRO
                                </span>
                            )}
                            <span style={{
                                fontSize: 7.5, fontWeight: 800,
                                color: EFFORT_COLOR[rec.effortLevel] ?? '#059669',
                                background: `${EFFORT_COLOR[rec.effortLevel] ?? '#059669'}10`,
                                border: `1px solid ${EFFORT_COLOR[rec.effortLevel] ?? '#059669'}22`,
                                borderRadius: 99, padding: '1px 7px',
                            }}>
                                {rec.effortLabel}
                            </span>
                        </div>

                        {/* Name */}
                        <p style={{ fontSize: 14, fontWeight: 900, color: W.textPrimary, lineHeight: 1.25, marginBottom: 4 }}>
                            {rec.arabicName}
                        </p>

                        {/* Why now */}
                        <p className="line-clamp-2" style={{ fontSize: 10, color: W.textSub, fontWeight: 500, lineHeight: 1.6, marginBottom: 6 }}>
                            {rec.whyNow}
                        </p>

                        {/* CTA pill */}
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                            style={{
                                background: `${accent}10`,
                                border: `1px solid ${accent}20`,
                                boxShadow: `0 2px 8px ${accent}10`,
                            }}>
                            <span style={{ fontSize: 9.5, fontWeight: 900, color: accent }}>{rec.ctaLabel}</span>
                            <ChevronLeft style={{ width: 9, height: 9, color: accent }} />
                        </div>
                    </div>

                    {/* Duration + nav */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-2 pt-0.5">
                        {rec.durationHint && (
                            <div className="flex items-center gap-0.5">
                                <Clock style={{ width: 9, height: 9, color: W.textMuted }} />
                                <span style={{ fontSize: 8.5, fontWeight: 700, color: W.textMuted }}>{rec.durationHint}</span>
                            </div>
                        )}
                        <div className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: `${accent}12`, border: `1.5px solid ${accent}20`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.7)` }}>
                            <ChevronLeft style={{ width: 12, height: 12, color: accent }} />
                        </div>
                    </div>
                </div>

                {/* Expected benefit footer */}
                <div className="px-4 pb-3.5 relative z-10">
                    <div className="flex items-start gap-1.5 rounded-[12px] px-3 py-2"
                        style={{ background: `${accent}07`, border: `1px solid ${accent}12` }}>
                        <Sparkles style={{ width: 10, height: 10, color: accent, flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 9.5, color: W.textSub, fontWeight: 500, lineHeight: 1.55 }}>
                            {rec.expectedBenefit}
                        </p>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

/* ── Group section header ──────────────────────────────── */
function GroupHeader({ header, color, totalCount }: { header: string; color: string; totalCount: number }) {
    return (
        <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}28)` }} />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                <p style={{ fontSize: 8.5, fontWeight: 900, color: W.textMuted, textTransform: 'uppercase', letterSpacing: '0.16em', whiteSpace: 'nowrap' }}>
                    {header}
                </p>
                <span style={{ fontSize: 9, fontWeight: 900, color, background: `${color}15`, borderRadius: 99, padding: '1px 6px' }}>
                    {totalCount}
                </span>
            </div>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}28)` }} />
        </div>
    );
}

/* ── Rail: all groups ──────────────────────────────────── */
interface Props {
    groups: RecommendationGroup[];
    domainColor: string;
    on: boolean;
}

export function RecommendationRail({ groups, domainColor, on }: Props) {
    if (groups.length === 0) return null;

    let cardIndex = 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={on ? { opacity: 1 } : {}}
            transition={{ delay: 0.64 }}>
            {groups.map(group => (
                <div key={group.key} className="mx-4 mb-2">
                    <GroupHeader header={group.header} color={domainColor} totalCount={group.recommendations.length} />
                    {group.recommendations.map(rec => {
                        const idx = cardIndex++;
                        return (
                            <RecommendationCard key={rec.id} rec={rec} index={idx} on={on} />
                        );
                    })}
                </div>
            ))}
        </motion.div>
    );
}

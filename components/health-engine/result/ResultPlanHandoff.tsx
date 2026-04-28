// components/health-engine/result/ResultPlanHandoff.tsx
'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Calendar, FileBarChart } from 'lucide-react';
import Link from 'next/link';
import type { ResultPlanHandoffModel } from '../types';
import type { DomainVisConfig } from './shared/design-tokens';
import { W } from './shared/design-tokens';
import { haptic } from '@/lib/HapticFeedback';
import { trackEvent } from '@/lib/analytics';
import { hasCompletedSession } from '@/lib/assessment-session-store';

interface Props {
    plan: ResultPlanHandoffModel;
    vis: DomainVisConfig;
    on: boolean;
}

export function ResultPlanHandoff({ plan, vis, on }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={on ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.0 }}
            className="mx-4 mb-4">

            {/* Narrative block */}
            <div className="relative overflow-hidden rounded-[22px] p-4"
                style={{
                    background: W.glass,
                    border: `1px solid ${W.glassBorder}`,
                    backdropFilter: 'blur(24px)',
                    boxShadow: W.glassShadow,
                }}>
                {/* Top sheen */}
                <div className="absolute inset-x-0 top-0 pointer-events-none h-[50%]"
                    style={{ background: W.sheen, borderRadius: '22px 22px 0 0' }} />
                {/* Domain color accent bar */}
                <div className="absolute top-0 bottom-0 right-0 w-1 rounded-l-full"
                    style={{ background: `linear-gradient(to bottom, ${vis.particleColor}, ${vis.particleColor}40)` }} />

                <div className="relative z-10">
                    {/* Header */}
                    <p style={{ fontSize: 9, fontWeight: 900, color: vis.textColor, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 12 }}>
                        خلاصة مسارك الآن
                    </p>

                    {/* Four narrative rows */}
                    <div className="space-y-3">
                        {[
                            { emoji: '🧭', label: 'اتجاهك الرئيسي', value: plan.mainDirection },
                            { emoji: '⚡', label: 'ابدأ اليوم بـ',  value: plan.startTodayStep },
                            { emoji: '🔄', label: 'راجع بعد قليل', value: plan.revisitNote },
                            { emoji: '🔔', label: 'أعد التقييم إذا', value: plan.reassessmentCondition },
                        ].map(({ emoji, label, value }) => (
                            <div key={label} className="flex items-start gap-2.5 rounded-[14px] px-3 py-2.5"
                                style={{ background: 'rgba(255,255,255,0.42)', border: '1px solid rgba(255,255,255,0.72)' }}>
                                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{emoji}</span>
                                <div>
                                    <p style={{ fontSize: 8, fontWeight: 900, color: vis.textColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
                                        {label}
                                    </p>
                                    <p style={{ fontSize: 11, fontWeight: 500, color: W.textPrimary, lineHeight: 1.65 }}>
                                        {value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA row: booking OR my-plan */}
            <div className="mt-3 space-y-2.5">
                {plan.showBookingCta ? (
                    <Link href="/book-appointment"
                        onClick={() => {
                            haptic.impact();
                            trackEvent('booking_suggested', { from: 'plan_handoff' });
                        }}>
                        <motion.div whileTap={{ scale: 0.97 }}
                            className="relative overflow-hidden h-13 rounded-[22px] flex items-center gap-3 px-5 cursor-pointer py-3.5"
                            style={{
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(254,202,202,0.85) 40%, rgba(220,38,38,0.65) 100%)',
                                boxShadow: '0 6px 28px rgba(220,38,38,0.25), 0 2px 0 rgba(255,255,255,0.9) inset',
                                border: '1.5px solid rgba(255,255,255,0.88)',
                            }}>
                            <Calendar style={{ width: 18, height: 18, color: '#DC2626', position: 'relative', zIndex: 1 }} />
                            <div className="flex-1 text-right" style={{ position: 'relative', zIndex: 1 }}>
                                <p style={{ fontSize: 14, fontWeight: 900, color: '#7F1D1D' }}>احجز مع د. عمر الآن</p>
                                <p style={{ fontSize: 10, fontWeight: 600, color: '#991B1B' }}>جلسة تشخيصية مباشرة</p>
                            </div>
                            <ArrowLeft style={{ width: 16, height: 16, color: '#DC2626', opacity: 0.7, position: 'relative', zIndex: 1 }} />
                        </motion.div>
                    </Link>
                ) : (
                    <Link href="/my-plan"
                        onClick={() => {
                            haptic.impact();
                            trackEvent('result_to_plan_clicked', { from: 'plan_handoff' });
                        }}>
                        <motion.div whileTap={{ scale: 0.97 }}
                            className="relative overflow-hidden h-13 rounded-[22px] flex items-center gap-3 px-5 cursor-pointer py-3.5"
                            style={{
                                background: vis.grad,
                                boxShadow: `0 6px 24px ${vis.glow}, 0 2px 0 rgba(255,255,255,0.9) inset`,
                                border: '1.5px solid rgba(255,255,255,0.88)',
                            }}>
                            <div className="absolute top-0 left-0 w-[50%] h-[50%]"
                                style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.45) 0%, transparent 70%)', borderRadius: 20 }} />
                            <div className="flex-1 text-right" style={{ position: 'relative', zIndex: 1 }}>
                                <p style={{ fontSize: 14, fontWeight: 900, color: W.textPrimary }}>خطتي العلاجية</p>
                                <p style={{ fontSize: 10, fontWeight: 600, color: vis.textColor }}>عرض الأدوات والمتابعة</p>
                            </div>
                            <ArrowLeft style={{ width: 16, height: 16, color: vis.textColor, opacity: 0.7, position: 'relative', zIndex: 1 }} />
                        </motion.div>
                    </Link>
                )}

                {/* Reassessment hint */}
                {plan.showReassessmentCta && (
                    <p style={{ fontSize: 9.5, color: W.textMuted, textAlign: 'center', fontWeight: 500, lineHeight: 1.6 }}>
                        <RefreshCw style={{ width: 9, height: 9, display: 'inline', marginLeft: 4 }} />
                        {plan.reassessmentCondition}
                    </p>
                )}

                {/* Return to result page link */}
                {hasCompletedSession() && (
                    <Link href="/assessment-result"
                        onClick={() => {
                            haptic.selection();
                            trackEvent('result_return_clicked', { from: 'plan_handoff' });
                        }}>
                        <motion.div whileTap={{ scale: 0.97 }}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-[14px] mt-1"
                            style={{
                                background: 'rgba(255,255,255,0.35)',
                                border: '1px solid rgba(255,255,255,0.65)',
                            }}>
                            <FileBarChart style={{ width: 12, height: 12, color: W.textMuted }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: W.textSub }}>العودة إلى نتيجة التحليل</span>
                        </motion.div>
                    </Link>
                )}
            </div>
        </motion.div>
    );
}

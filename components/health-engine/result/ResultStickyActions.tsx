// components/health-engine/result/ResultStickyActions.tsx
// ════════════════════════════════════════════════════════════════
// Fixed bottom bar — primary CTA + restart, safe-area aware.
// Context-aware: escalation → booking / emergency call.
// Normal → enter domain section.
// No collision with bottom nav or FAB.
// ════════════════════════════════════════════════════════════════
'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Phone, Calendar, Edit3 } from 'lucide-react';
import Link from 'next/link';
import type { ResultViewModel } from '../types';
import type { DomainVisConfig } from './shared/design-tokens';
import { W } from './shared/design-tokens';
import { DOMAIN_BY_ID } from '@/lib/domain-routing-map';
import { haptic } from '@/lib/HapticFeedback';
import { trackEvent } from '@/lib/analytics';
import { createPageUrl } from '@/utils';

interface Props {
    vm: ResultViewModel;
    vis: DomainVisConfig;
    on: boolean;
    onRestart: () => void;
    sessionId?: string | null;
}

export function ResultStickyActions({ vm, vis, on, onRestart, sessionId }: Props) {
    const primary     = DOMAIN_BY_ID[vm.domainId];
    const isEmergency = vm.hero.triageLevel === 'emergency';
    const emergencyPhone = process.env.NEXT_PUBLIC_EMERGENCY_PHONE?.trim();
    const emergencyHref = emergencyPhone ? `tel:${emergencyPhone}` : '#';

    // Determine primary CTA
    const primaryHref = vm.escalationNeeded
        ? (isEmergency ? emergencyHref : createPageUrl('BookAppointment'))
        : vm.primarySectionHref;

    const primaryLabel = vm.escalationNeeded
        ? (isEmergency ? (emergencyPhone ? 'اتصل بالطوارئ' : 'توجه لأقرب طوارئ فوراً') : 'احجز مع د. عمر الآن')
        : `ادخل قسم ${primary?.arabicName ?? ''}`;

    const primaryIcon = vm.escalationNeeded
        ? (isEmergency ? Phone : Calendar)
        : ArrowLeft;

    const PrimaryIcon = primaryIcon;

    const primaryStyle = vm.escalationNeeded
        ? {
            background: isEmergency
                ? 'linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(254,202,202,0.85) 40%, rgba(220,38,38,0.65) 100%)'
                : vis.grad,
            boxShadow: isEmergency
                ? '0 6px 28px rgba(220,38,38,0.25), 0 2px 0 rgba(255,255,255,0.9) inset'
                : `0 6px 28px ${vis.glow}, 0 2px 0 rgba(255,255,255,0.9) inset`,
            border: '1.5px solid rgba(255,255,255,0.88)',
        }
        : {
            background: vis.grad,
            boxShadow: `0 6px 28px ${vis.glow}, 0 2px 0 rgba(255,255,255,0.9) inset`,
            border: '1.5px solid rgba(255,255,255,0.88)',
        };

    const primaryTextColor = vm.escalationNeeded && isEmergency ? '#7F1D1D' : W.textPrimary;

    const handlePrimary = (event?: React.MouseEvent<HTMLAnchorElement>) => {
        if (isEmergency && !emergencyPhone) event?.preventDefault();
        haptic.impact();
        if (vm.escalationNeeded) {
            trackEvent('booking_suggested', { triage_level: vm.hero.triageLevel, from: 'sticky_cta' });
        } else {
            trackEvent('start_protocol_clicked', { domain: vm.domainId, from: 'sticky_cta' });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={on ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.15, type: 'spring', stiffness: 280, damping: 30 }}
            className="mx-4 space-y-2.5">

            {/* Primary CTA */}
            <Link href={primaryHref} onClick={handlePrimary}>
                <motion.div whileTap={{ scale: 0.97 }}
                    className="relative overflow-hidden h-14 rounded-[26px] flex items-center gap-3 px-5 cursor-pointer"
                    style={primaryStyle}>
                    <div className="absolute top-0 left-0 w-[55%] h-[55%]"
                        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.4) 0%, transparent 70%)', borderRadius: 26 }} />
                    {/* Caustic dot */}
                    <div className="absolute top-3 right-[100px] w-2 h-2 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.7)', filter: 'blur(1px)' }} />

                    <div className="w-9 h-9 rounded-[13px] flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.42)', border: '1px solid rgba(255,255,255,0.7)' }}>
                        <PrimaryIcon style={{ width: 16, height: 16, color: isEmergency ? '#DC2626' : vis.textColor, position: 'relative', zIndex: 1 }} />
                    </div>

                    <div className="flex-1 text-right" style={{ position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 900, color: primaryTextColor, lineHeight: 1.2 }}>
                            {primaryLabel}
                        </p>
                        {!vm.escalationNeeded && primary && (
                            <p style={{ fontSize: 10, color: vis.textColor, fontWeight: 600 }}>
                                {primary.englishName} Care Portal
                            </p>
                        )}
                    </div>
                    <ArrowLeft style={{ width: 16, height: 16, color: isEmergency ? '#DC2626' : vis.textColor, opacity: 0.7, position: 'relative', zIndex: 1 }} />
                </motion.div>
            </Link>

            {/* WhatsApp row (only when escalation) */}
            {vm.escalationNeeded && (
                <Link href="https://wa.me/967771447111"
                    onClick={() => { haptic.selection(); trackEvent('booking_suggested', { from: 'whatsapp_sticky' }); }}>
                    <motion.div whileTap={{ scale: 0.97 }}
                        className="relative overflow-hidden h-12 rounded-[20px] flex items-center justify-center gap-2.5 cursor-pointer"
                        style={{ background: 'rgba(240,253,244,0.9)', border: '1.5px solid rgba(187,247,208,0.7)', backdropFilter: 'blur(16px)' }}>
                        <span style={{ fontSize: 14 }}>💬</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>تواصل عبر واتساب</span>
                    </motion.div>
                </Link>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-2.5 rounded-[18px] p-3.5"
                style={{ background: W.glass, border: `1px solid ${W.glassBorder}`, backdropFilter: 'blur(18px)' }}>
                <span style={{ fontSize: 11, flexShrink: 0, marginTop: 1 }}>✨</span>
                <p style={{ fontSize: 10, color: W.textSub, lineHeight: 1.6, fontWeight: 500 }}>
                    هذا التحليل استرشادي وليس تشخيصاً طبياً. في الحالات الطارئة، توجه للطوارئ فوراً.
                </p>
            </div>

            {/* Restart */}
            <motion.div className="pb-1 space-y-2">
                {/* Edit symptoms (only if session exists) */}
                {sessionId && (
                    <Link href={`/symptom-checker?edit=${sessionId}`}
                        onClick={() => {
                            haptic.selection();
                            trackEvent('symptoms_edited_from_result', {
                                session_id: sessionId,
                                from: 'sticky_actions',
                            });
                        }}>
                        <motion.div whileTap={{ scale: 0.97 }}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px]"
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: `1px solid ${W.glassBorder}`,
                                backdropFilter: 'blur(16px)',
                            }}>
                            <Edit3 style={{ width: 13, height: 13, color: vis.textColor }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: W.textSub }}>تعديل الأعراض وإعادة التقييم</span>
                        </motion.div>
                    </Link>
                )}

                <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => { haptic.selection(); onRestart(); }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px]"
                    style={{ background: W.glass, border: `1px solid ${W.glassBorder}`, backdropFilter: 'blur(16px)' }}>
                    <RefreshCw style={{ width: 13, height: 13, color: W.textMuted }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: W.textSub }}>تحليل حالة جديدة</span>
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

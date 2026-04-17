'use client';
/**
 * SectionStatusBar.tsx — شريط الحالة الذكي
 * ──────────────────────────────────────────
 * Two modes:
 *   1. Real mode  — plan exists → shows primary/secondary subdomain + day count
 *   2. Fallback   — no plan    → guides user to start assessment
 *
 * Reads from care-plan-store. Never renders empty.
 */

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, ArrowLeft, Zap, Activity } from 'lucide-react';
import { getActiveCarePlan, getProtocolDay, getProtocolProgress, getProtocolReassessment } from '@/lib/care-plan-store';
import { getProtocol } from '@/lib/protocol-engine';
import { DOMAIN_BY_ID } from '@/lib/domain-routing-map';
import type { DomainId, SubdomainId } from '@/components/health-engine/types';

interface SectionStatusBarProps {
    /** Which domain this bar belongs to */
    domainId: DomainId;
    /** Theme color */
    color: string;
    colorAlt: string;
    /** CTA link for fallback state */
    assessHref?: string;
    /** Fallback text when no plan exists */
    fallbackText?: string;
}

/** Lookup subdomain arabic name from domain-routing-map */
function getSubdomainName(domainId: DomainId, subdomainId: SubdomainId): string {
    const domain = DOMAIN_BY_ID[domainId];
    if (!domain) return '';
    const sub = domain.subdomains.find(s => s.id === subdomainId);
    return sub?.arabicName ?? '';
}

/** Lookup domain arabic name */
function getDomainName(domainId: DomainId): string {
    const names: Record<DomainId, string> = {
        jasadi: 'جسدي',
        nafsi: 'نفسي',
        fikri: 'فكري',
        ruhi: 'روحي',
    };
    return names[domainId] ?? '';
}

export function SectionStatusBar({
    domainId,
    color,
    colorAlt,
    assessHref = '/symptom-checker',
    fallbackText = 'ابدأ تقييمك لتحديد مسارك العلاجي',
}: SectionStatusBarProps) {
    const plan = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return getActiveCarePlan();
    }, []);

    // Is this section the user's primary or secondary domain?
    const isRelevant = plan && (
        plan.routing.primary_domain === domainId ||
        plan.routing.secondary_domain === domainId
    );

    const dayNumber = useMemo(() => {
        if (!plan) return 0;
        const created = new Date(plan.createdAt).getTime();
        return Math.max(1, Math.floor((Date.now() - created) / 86400000) + 1);
    }, [plan]);

    /* ─── Protocol reassessment detection ─── */
    const protocolReassessment = useMemo(() => {
        if (!plan || !isRelevant) return null;
        const protocol = getProtocol(plan.routing.primary_subdomain);
        if (!protocol) return null;
        return getProtocolReassessment(plan, protocol);
    }, [plan, isRelevant]);

    /* ─── Real mode: plan exists and relevant ─── */
    if (plan && isRelevant) {
        // ── State: Protocol needs reassessment ──
        if (protocolReassessment?.needed) {
            const isUrgent = protocolReassessment.urgency === 'high';
            const reasonMap: Record<string, string> = {
                time:        'وصلت اليوم 7 — هل تحسّن وضعك؟',
                completion:  'أكملت البروتوكول مبكراً!',
                bad_outcome: 'لا تقدم منذ أيام — ربما تحتاج دعم أعمق',
                none:        '',
            };
            return (
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="mx-4 mb-3 px-4 py-3 rounded-[18px] relative overflow-hidden"
                    style={{
                        background: isUrgent
                            ? 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.04))'
                            : `linear-gradient(135deg, ${color}14, ${colorAlt}0C)`,
                        border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.25)' : color + '22'}`,
                    }}
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[14px]" style={{ flexShrink: 0 }}>
                                {isUrgent ? '🚨' : '⏰'}
                            </span>
                            <span className="text-[11px] font-black text-slate-700 flex-1">
                                {reasonMap[protocolReassessment.reason]}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-slate-400 flex-1">
                                {isUrgent
                                    ? 'يبدو أن هناك عائق — الدعم المباشر أفضل الآن'
                                    : 'استمر أو غيّر مسارك بناءً على التحسن'}
                            </span>
                            <Link href={isUrgent ? '/book-appointment' : '/symptom-checker'}
                                className="flex items-center gap-1">
                                <span className="text-[8.5px] font-black"
                                    style={{ color: isUrgent ? '#DC2626' : color }}>
                                    {isUrgent ? 'احجز الآن' : 'أعد التقييم'}
                                </span>
                                <ArrowLeft className="w-2.5 h-2.5"
                                    style={{ color: isUrgent ? '#DC2626' : color }} />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            );
        }

        // ── State: Normal plan display ──
        const isPrimary = plan.routing.primary_domain === domainId;
        const primarySubName = getSubdomainName(
            plan.routing.primary_domain,
            plan.routing.primary_subdomain
        );
        const secondaryDomName = getDomainName(plan.routing.secondary_domain);
        const secondarySubName = getSubdomainName(
            plan.routing.secondary_domain,
            plan.routing.secondary_subdomain
        );

        return (
            <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="mx-4 mb-3 px-4 py-3 rounded-[18px] relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${color}14, ${colorAlt}0C)`,
                    border: `1px solid ${color}22`,
                }}
            >
                {/* Shimmer */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `linear-gradient(108deg, transparent 30%, ${color}08 50%, transparent 70%)` }}
                    animate={{ x: ['-120%', '120%'] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 8, ease: 'easeInOut' }}
                />

                <div className="relative z-10">
                    {/* Main status line */}
                    <div className="flex items-center gap-2 mb-1.5">
                        <motion.div
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 1.6, repeat: Infinity }}
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: color }}
                        />
                        <span className="text-[11px] font-black text-slate-700">
                            {isPrimary ? 'مسارك الرئيسي' : 'مسار الدعم المساند'}
                            {': '}
                            <span style={{ color }}>{primarySubName}</span>
                        </span>
                        <span className="mr-auto text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${color}14`, color }}>
                            اليوم {dayNumber}
                        </span>
                    </div>

                    {/* Secondary info */}
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400">
                            المسار المساند: {secondaryDomName} / {secondarySubName}
                        </span>
                        <Link href="/my-plan" className="mr-auto flex items-center gap-1">
                            <span className="text-[8.5px] font-black" style={{ color }}>خطتي</span>
                            <ArrowLeft className="w-2.5 h-2.5" style={{ color }} />
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    /* ─── Plan exists but this section is not the user's domain ─── */
    if (plan && !isRelevant) {
        const primaryDomName = getDomainName(plan.routing.primary_domain);
        const primarySubName = getSubdomainName(
            plan.routing.primary_domain,
            plan.routing.primary_subdomain
        );

        return (
            <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="mx-4 mb-3 px-4 py-2.5 rounded-[16px]"
                style={{
                    background: 'rgba(241,245,249,0.7)',
                    border: '1px solid rgba(226,232,240,0.6)',
                }}
            >
                <div className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-slate-500 flex-1">
                        خطتك الحالية في {primaryDomName} / {primarySubName}
                    </span>
                    <Link href={`/sections/${plan.routing.primary_domain}`} className="flex items-center gap-1">
                        <span className="text-[8.5px] font-black text-slate-500">افتح</span>
                        <ArrowLeft className="w-2.5 h-2.5 text-slate-400" />
                    </Link>
                </div>
            </motion.div>
        );
    }

    /* ─── Fallback: no plan at all ─── */
    return (
        <Link href={assessHref}>
            <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                whileTap={{ scale: 0.97 }}
                className="mx-4 mb-3 px-4 py-3 rounded-[18px] relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${color}18, ${colorAlt}10)`,
                    border: `1.5px dashed ${color}35`,
                }}
            >
                {/* Pulse glow */}
                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -right-4 -top-4 w-16 h-16 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${color}20, transparent 70%)` }}
                />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
                        <Zap className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[11px] font-black text-slate-700">{fallbackText}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">تقييم سريع ← مسار مخصص ← خطة يومية</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 flex-shrink-0" style={{ color, opacity: 0.6 }} />
                </div>
            </motion.div>
        </Link>
    );
}

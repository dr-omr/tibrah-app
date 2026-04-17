// pages/my-plan.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — خطتي العلاجية
// تصميم: مائي · زجاجي · فيزيائي · ملمس عميق · ناتف
// ════════════════════════════════════════════════════════════════════
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    ChevronLeft, Clock, Calendar, RefreshCw, ArrowLeft,
    Shield, Sparkles, CheckCircle2, BookOpen, TestTube2,
    BarChart3, PlayCircle, Zap, AlertTriangle, Phone,
    ExternalLink, Star, Activity, Layers,
} from 'lucide-react';
import SEO from '@/components/common/SEO';
import { haptic } from '@/lib/HapticFeedback';
import { trackEvent } from '@/lib/analytics';
import { createPageUrl } from '@/utils';
import {
    getActiveCarePlan, touchCarePlan, markToolOpened,
    getToolEngagement, shouldReassess, getPlanSummary,
    getTodayChecklist, saveDailyChecklist, getCompletionRate, getStreak,
    getProtocolDay, getProtocolProgress, getProtocolReassessment,
    type SavedCarePlan,
} from '@/lib/care-plan-store';
import { getProtocol, PHASE_LABELS } from '@/lib/protocol-engine';
import { AdaptiveHandoff } from '@/components/sections/shared/AdaptiveHandoff';
import { getRegisteredProtocol } from '@/lib/protocol-registry';
import { getPlanId } from '@/lib/outcome-store';
import { getTrackerInsight, getLegacyTrackerInsight } from '@/lib/insight-rules';
import { DOMAIN_BY_ID, SUBDOMAIN_BY_ID } from '@/lib/domain-routing-map';
import { hasToolPage, getToolPageUrl } from '@/lib/tool-content-map';
import type { DomainId, ToolRecommendation, ToolType } from '@/components/health-engine/types';

/* ══════════════════════════════════════════════════════════════════
   TRACKER INSIGHT CARD (Sprint 5 — insight-rules.ts powered)
   ══════════════════════════════════════════════════════════════════ */
function TrackerInsightCard({ plan, domainColor }: { plan: SavedCarePlan; domainColor: string }) {
    const planId     = getPlanId(plan.createdAt);
    const subdomainId = plan.routing.primary_subdomain;

    // تحقّق من الريجستري أولاً ثم المسار القديم
    const insight = React.useMemo(() => {
        const fromRegistry = getTrackerInsight(subdomainId, planId);
        if (fromRegistry) return fromRegistry;
        return getLegacyTrackerInsight(planId); // fallback
    }, [planId, subdomainId]);

    if (!insight) return null;

    const levelBg: Record<string, string> = {
        low:    'rgba(239,68,68,0.07)',
        medium: `${domainColor}08`,
        high:   'rgba(0,200,140,0.07)',
    };
    const levelBorder: Record<string, string> = {
        low:    'rgba(239,68,68,0.20)',
        medium: `${domainColor}20`,
        high:   'rgba(0,200,140,0.20)',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 py-3 rounded-[16px] flex items-start gap-3"
            style={{
                background: levelBg[insight.level],
                border: `1px solid ${levelBorder[insight.level]}`,
            }}
        >
            <span className="text-[20px] flex-shrink-0 mt-0.5">{insight.emoji}</span>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest mb-0.5"
                    style={{ color: insight.level === 'high' ? 'rgba(0,140,90,0.85)' : insight.level === 'low' ? '#EF4444' : domainColor }}>
                    تسجيل اليوم — {insight.label}
                </p>
                <p className="text-slate-700 text-[12px] font-medium leading-snug">
                    {insight.message}
                </p>
            </div>
            {insight.score !== null && (
                <div className="flex-shrink-0 flex flex-col items-center">
                    <span className="text-[20px] font-black tabular-nums leading-none"
                        style={{ color: insight.level === 'high' ? 'rgba(0,140,90,0.85)' : insight.level === 'low' ? '#EF4444' : domainColor }}>
                        {insight.score}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold">{insight.unit}</span>
                </div>
            )}
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — Light Water · Physical Glass · Native
   زجاج مائي فاتح · ملمس فيزيائي · ألوان طبية
   ══════════════════════════════════════════════════════════════════ */

const PAGE_BG = 'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)';

const WATER_CAUSTIC = {
    a: 'radial-gradient(ellipse 60% 40% at 80% 20%, rgba(34,211,238,0.16) 0%, transparent 65%)',
    b: 'radial-gradient(ellipse 50% 60% at 20% 70%, rgba(129,140,248,0.12) 0%, transparent 55%)',
    c: 'radial-gradient(ellipse 40% 35% at 60% 85%, rgba(52,211,153,0.10) 0%, transparent 60%)',
};

const GLASS = {
    base:   'rgba(255,255,255,0.58)',
    border: 'rgba(255,255,255,0.85)',
    sheen:  'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
    spec:   'radial-gradient(ellipse 50% 25% at 22% 12%, rgba(255,255,255,0.55) 0%, transparent 70%)',
    shadow: '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.92)',
    shadowSm: '0 6px 20px rgba(8,145,178,0.08), 0 1.5px 6px rgba(0,0,0,0.03), inset 0 1.5px 0 rgba(255,255,255,0.90)',
};

const TXT = {
    primary: '#0C4A6E',
    secondary: '#0369A1',
    muted:   '#7DD3FC',
    accent:  '#0891B2',
};

const DOMAIN_GLASS: Record<DomainId, {
    glow: string; tint: string; accent: string; accentSoft: string;
    heroGrad: string; borderGlow: string;
}> = {
    jasadi: {
        glow:       'rgba(8,145,178,0.18)',
        tint:       'rgba(8,145,178,0.06)',
        accent:     '#0891B2',
        accentSoft: 'rgba(8,145,178,0.12)',
        heroGrad:   'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(186,230,253,0.75) 50%, rgba(8,145,178,0.30) 100%)',
        borderGlow: 'rgba(8,145,178,0.25)',
    },
    nafsi: {
        glow:       'rgba(129,140,248,0.18)',
        tint:       'rgba(129,140,248,0.06)',
        accent:     '#818CF8',
        accentSoft: 'rgba(129,140,248,0.12)',
        heroGrad:   'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(233,213,255,0.75) 50%, rgba(129,140,248,0.28) 100%)',
        borderGlow: 'rgba(129,140,248,0.25)',
    },
    fikri: {
        glow:       'rgba(245,158,11,0.16)',
        tint:       'rgba(245,158,11,0.05)',
        accent:     '#F59E0B',
        accentSoft: 'rgba(245,158,11,0.10)',
        heroGrad:   'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(254,243,199,0.75) 50%, rgba(245,158,11,0.26) 100%)',
        borderGlow: 'rgba(245,158,11,0.22)',
    },
    ruhi: {
        glow:       'rgba(34,211,238,0.18)',
        tint:       'rgba(34,211,238,0.06)',
        accent:     '#22D3EE',
        accentSoft: 'rgba(34,211,238,0.12)',
        heroGrad:   'linear-gradient(170deg, rgba(255,255,255,0.90) 0%, rgba(207,250,254,0.75) 50%, rgba(34,211,238,0.28) 100%)',
        borderGlow: 'rgba(34,211,238,0.22)',
    },
};

const TOOL_ICON: Record<ToolType, typeof BookOpen> = {
    protocol: Shield, practice: Zap, test: TestTube2,
    workshop: PlayCircle, tracker: BarChart3,
};
const TOOL_LABEL: Record<ToolType, string> = {
    protocol: 'بروتوكول', practice: 'تطبيق',
    test: 'اختبار', workshop: 'ورشة', tracker: 'متابعة',
};

/* ══════════════════════════════════════════════════════════════════
   COMPONENT: DeepGlassCard — البطاقة الزجاجية ذات العمق الفيزيائي
   ══════════════════════════════════════════════════════════════════ */
function DeepGlassCard({
    children, className = '', style = {},
    tint = GLASS.base, noSheen = false,
}: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    tint?: string;
    noSheen?: boolean;
}) {
    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{
                background: tint,
                border: `1px solid ${GLASS.border}`,
                backdropFilter: 'blur(24px) saturate(160%)',
                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                boxShadow: GLASS.shadow,
                borderRadius: 24,
                ...style,
            }}
        >
            {/* الوميض العلوي — الضوء يكسر على حافة الزجاج */}
            {!noSheen && (
                <div
                    className="absolute inset-x-0 top-0 pointer-events-none"
                    style={{ height: '52%', background: GLASS.sheen, borderRadius: '24px 24px 0 0' }}
                />
            )}
            {/* نقطة الانعكاس الجانبية */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: GLASS.spec, borderRadius: 24 }}
            />
            {/* المحتوى */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT: WaterParticle — جزيئات المياه المتحركة
   ══════════════════════════════════════════════════════════════════ */
function WaterParticles({ color }: { color: string }) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: 'inherit' }}>
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: 3 + i * 1.5,
                        height: 3 + i * 1.5,
                        background: color,
                        opacity: 0.4 - i * 0.06,
                        left: `${15 + i * 18}%`,
                        top: `${25 + (i % 2) * 35}%`,
                        filter: 'blur(1px)',
                    }}
                    animate={{
                        y: [-4, 4, -4],
                        opacity: [0.3 - i * 0.04, 0.5 - i * 0.06, 0.3 - i * 0.04],
                    }}
                    transition={{
                        duration: 2.5 + i * 0.7,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.4,
                    }}
                />
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT: DomainScoreBar — شريط النقاط بعمق فيزيائي
   ══════════════════════════════════════════════════════════════════ */
function DomainScoreBar({
    label, emoji, score, color, delay = 0, isPrimary = false,
}: {
    label: string; emoji: string; score: number;
    color: string; delay?: number; isPrimary?: boolean;
}) {
    return (
        <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, type: 'spring', stiffness: 260, damping: 26 }}
        >
            <div className="flex items-center gap-1.5 w-[35%]">
                <span style={{ fontSize: isPrimary ? 16 : 13 }}>{emoji}</span>
                <span style={{
                    fontSize: isPrimary ? 12 : 10.5,
                    fontWeight: isPrimary ? 800 : 600,
                    color: isPrimary ? TXT.primary : TXT.secondary,
                    letterSpacing: '-0.01em',
                }}>{label}</span>
            </div>
            {/* Track — منخفض كالقناة */}
            <div
                className="flex-1 relative overflow-hidden"
                style={{
                    height: isPrimary ? 8 : 5,
                    borderRadius: 99,
                    background: 'rgba(255,255,255,0.07)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }}
            >
                <motion.div
                    style={{
                        height: '100%',
                        borderRadius: 99,
                        background: isPrimary
                            ? `linear-gradient(90deg, ${color}88, ${color})`
                            : `${color}60`,
                        boxShadow: isPrimary ? `0 0 10px ${color}60, 0 0 4px ${color}40` : 'none',
                    }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.2, ease: [0.05, 0.7, 0.1, 1], delay: delay + 0.2 }}
                />
            </div>
            <span style={{
                fontSize: isPrimary ? 14 : 11,
                fontWeight: isPrimary ? 900 : 600,
                color: isPrimary ? color : TXT.muted,
                width: 34,
                textAlign: 'right',
                letterSpacing: '-0.02em',
            }}>{score}%</span>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT: StartTodayBar — شريط ابدأ يومك
   ══════════════════════════════════════════════════════════════════ */
function StartTodayBar({
    tools, domainColor, openedIds, completedIds, onTap,
}: {
    tools: ToolRecommendation[];
    domainColor: string;
    openedIds: string[];
    completedIds: string[];
    onTap: (tool: ToolRecommendation) => void;
}) {
    // اختار أداة اليوم: practice أولاً، ثم test، ثم tracker
    const todayIndex = (new Date().getDate()) % tools.length;
    const priority = ['practice', 'test', 'tracker', 'workshop', 'protocol'] as ToolType[];
    const pending = tools.filter(t => !completedIds.includes(t.id));
    const todayTool = pending.find(t => t.type === 'practice')
        ?? pending.find(t => t.type === 'test')
        ?? pending.find(t => t.type === 'tracker')
        ?? pending[0]
        ?? tools[todayIndex];

    if (!todayTool) return null;
    const isComplete = completedIds.includes(todayTool.id);
    const toolHref = hasToolPage(todayTool.id)
        ? getToolPageUrl(todayTool.type, todayTool.id)
        : todayTool.href;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.04 }}
        >
            <Link href={toolHref} onClick={() => onTap(todayTool)}>
                <motion.div
                    whileTap={{ scale: 0.97, y: 1 }}
                    className="relative overflow-hidden"
                    style={{
                        borderRadius: 22,
                        background: isComplete
                            ? 'rgba(0,200,140,0.10)'
                            : `linear-gradient(145deg, rgba(255,255,255,0.88) 0%, ${domainColor}22 100%)`,
                        border: `1.5px solid ${isComplete ? 'rgba(0,200,140,0.40)' : domainColor + '45'}`,
                        boxShadow: `0 12px 36px ${domainColor}22, 0 4px 12px rgba(0,0,0,0.08), inset 0 1.5px 0 rgba(255,255,255,0.95)`,
                        padding: '16px 18px',
                    }}
                >
                    {/* شريط ضوء علوي */}
                    <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
                        height: '50%',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 100%)',
                        borderRadius: '22px 22px 0 0',
                    }} />

                    <div className="relative z-10 flex items-center gap-3">
                        {/* الأيقونة */}
                        <div style={{
                            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                            background: isComplete ? 'rgba(0,200,140,0.12)' : `${domainColor}18`,
                            border: `1px solid ${isComplete ? 'rgba(0,200,140,0.30)' : domainColor + '30'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <span style={{ fontSize: 24 }}>{todayTool.emoji}</span>
                            {isComplete && (
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'rgba(0,200,140,0.20)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <CheckCircle2 size={20} style={{ color: 'rgba(0,200,140,0.9)' }} />
                                </div>
                            )}
                        </div>

                        {/* النص */}
                        <div className="flex-1 min-w-0">
                            <p style={{
                                fontSize: 10, fontWeight: 900,
                                color: isComplete ? 'rgba(0,180,120,0.8)' : domainColor,
                                letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 3,
                            }}>
                                {isComplete ? '✓ مكتمل' : '⚡ اليوم'}
                            </p>
                            <p style={{
                                fontSize: 15, fontWeight: 900, color: '#0C4A6E',
                                letterSpacing: '-0.01em', lineHeight: 1.3,
                            }}>{todayTool.arabicName}</p>
                            {todayTool.durationMinutes > 0 && (
                                <p style={{ fontSize: 11, color: '#0369A1', fontWeight: 500, marginTop: 2 }}>
                                    {todayTool.durationMinutes} دقيقة
                                </p>
                            )}
                        </div>

                        {/* السهم */}
                        <div style={{
                            width: 34, height: 34, borderRadius: 99, flexShrink: 0,
                            background: `linear-gradient(135deg, ${domainColor}, ${domainColor}CC)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 4px 12px ${domainColor}40`,
                        }}>
                            <ArrowLeft style={{ width: 14, height: 14, color: '#fff', transform: 'rotate(180deg)' }} />
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT: DailyChecklist — چك ليست اليوم
   ══════════════════════════════════════════════════════════════════ */
function DailyChecklist({
    tools, domainColor, plan, onToggle,
}: {
    tools: ToolRecommendation[];
    domainColor: string;
    plan: SavedCarePlan;
    onToggle: (toolId: string) => void;
}) {
    const todayKey = new Date().toDateString();
    const checked = getTodayChecklist(plan);

    // عرض أول 3 أدوات فقط في الـ checklist
    const displayTools = tools.slice(0, 3);
    const doneCount = displayTools.filter(t => checked.includes(t.id)).length;
    const progress = Math.round((doneCount / displayTools.length) * 100);

    const dateStr = new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });
    // احسب اليوم من الخطة
    const dayNum = Math.floor((Date.now() - new Date(plan.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const streak = getStreak(plan);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.09, type: 'spring', stiffness: 250, damping: 26 }}
        >
            <div className="relative overflow-hidden" style={{
                borderRadius: 22,
                background: 'rgba(255,255,255,0.70)',
                border: '1px solid rgba(255,255,255,0.90)',
                backdropFilter: 'blur(24px) saturate(160%)',
                boxShadow: '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.95)',
                padding: '18px 18px 14px',
            }}>
                {/* sheen */}
                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
                    height: '45%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)',
                    borderRadius: '22px 22px 0 0',
                }} />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p style={{ fontSize: 11, fontWeight: 900, color: domainColor, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                                    اليوم {dayNum} من مسارك
                                </p>
                                {streak > 0 && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 800, color: '#F59E0B',
                                        background: 'rgba(245,158,11,0.12)', padding: '2px 7px',
                                        borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 3
                                    }}>
                                        🔥 {streak} {streak === 1 ? 'يوم' : streak === 2 ? 'يومان' : streak > 10 ? 'يوماً' : 'أيام'}
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#0369A1' }}>{dateStr}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 18, fontWeight: 900, color: domainColor, lineHeight: 1 }}>{doneCount}/{displayTools.length}</p>
                            <p style={{ fontSize: 9, color: '#7DD3FC', fontWeight: 700 }}>اكتمال</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 3, borderRadius: 99, background: 'rgba(0,0,0,0.06)', marginBottom: 12, overflow: 'hidden' }}>
                        <motion.div
                            style={{ height: '100%', borderRadius: 99, background: doneCount === displayTools.length ? 'rgba(0,200,140,0.8)' : domainColor }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: [0.05, 0.7, 0.1, 1] }}
                        />
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2">
                        {displayTools.map((tool, i) => {
                            const isChecked = checked.includes(tool.id);
                            const toolHref = hasToolPage(tool.id)
                                ? getToolPageUrl(tool.type, tool.id)
                                : tool.href;
                            return (
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, x: 8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.12 + i * 0.05 }}
                                    className="flex items-center gap-3"
                                    style={{
                                        padding: '10px 12px', borderRadius: 14,
                                        background: isChecked ? 'rgba(0,200,140,0.06)' : 'rgba(255,255,255,0.55)',
                                        border: `1px solid ${isChecked ? 'rgba(0,200,140,0.22)' : 'rgba(255,255,255,0.82)'}`,
                                    }}
                                >
                                    {/* Checkbox */}
                                    <motion.button
                                        whileTap={{ scale: 0.80 }}
                                        onClick={() => onToggle(tool.id)}
                                        style={{
                                            width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                                            background: isChecked ? 'rgba(0,200,140,0.85)' : 'rgba(255,255,255,0.70)',
                                            border: `1.5px solid ${isChecked ? 'rgba(0,200,140,0.9)' : domainColor + '40'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: isChecked ? '0 2px 6px rgba(0,200,140,0.35)' : 'inset 0 1px 3px rgba(0,0,0,0.08)',
                                        }}
                                    >
                                        {isChecked && <CheckCircle2 size={13} style={{ color: '#fff' }} />}
                                    </motion.button>

                                    {/* Tool Name */}
                                    <Link href={toolHref} className="flex-1 min-w-0">
                                        <p style={{
                                            fontSize: 13, fontWeight: 700,
                                            color: isChecked ? 'rgba(0,160,110,0.75)' : '#0C4A6E',
                                            textDecoration: isChecked ? 'line-through' : 'none',
                                            lineHeight: 1.3,
                                        }}>{tool.arabicName}</p>
                                        <p style={{ fontSize: 10, color: '#7DD3FC', fontWeight: 600 }}>
                                            {TOOL_LABEL[tool.type]}{tool.durationMinutes > 0 ? ` · ${tool.durationMinutes}د` : ''}
                                        </p>
                                    </Link>

                                    <span style={{ fontSize: 18 }}>{tool.emoji}</span>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* All done message - Next Best Action */}
                    {doneCount === displayTools.length && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                marginTop: 12, padding: '12px 14px', borderRadius: 14,
                                background: 'linear-gradient(135deg, rgba(0,200,140,0.10) 0%, rgba(0,200,140,0.03) 100%)',
                                border: '1px solid rgba(0,200,140,0.22)',
                                display: 'flex', flexDirection: 'column', gap: 5
                            }}
                        >
                            <p style={{ fontSize: 13, fontWeight: 800, color: 'rgba(0,140,90,0.95)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={16} /> رائع! أكملت مهام اليوم.
                            </p>
                            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,140,90,0.80)', lineHeight: 1.5 }}>
                                الخطوة الأفضل الآن هي الاسترخاء والمحافظة على طاقتك للغد، أو استكشاف مكتبة المعرفة.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT: ReassessmentBanner — تذكير إعادة التقييم
   ══════════════════════════════════════════════════════════════════ */
function ReassessmentBanner({ daysSince }: { daysSince: number }) {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed) return null;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        >
            <div style={{
                borderRadius: 20, padding: '14px 16px',
                background: 'linear-gradient(145deg, rgba(245,158,11,0.10), rgba(245,158,11,0.05))',
                border: '1px solid rgba(245,158,11,0.30)',
                backdropFilter: 'blur(16px)',
            }}>
                <div className="flex items-start gap-3">
                    <div style={{ fontSize: 24, flexShrink: 0 }}>⏰</div>
                    <div className="flex-1">
                        <p style={{ fontSize: 13, fontWeight: 900, color: '#0C4A6E', marginBottom: 4 }}>
                            مرّ {daysSince} أيام على خطتك
                        </p>
                        <p style={{ fontSize: 11, color: '#0369A1', lineHeight: 1.6, marginBottom: 12 }}>
                            هل تحسّن وضعك؟ إعادة التقييم تُعطيك توجيهاً أدق بناءً على التغييرات.
                        </p>
                        <div className="flex gap-2">
                            <Link href="/symptom-checker">
                                <motion.div whileTap={{ scale: 0.94 }}
                                    style={{
                                        padding: '8px 16px', borderRadius: 12,
                                        background: 'rgba(245,158,11,0.85)',
                                        color: '#fff', fontSize: 12, fontWeight: 800,
                                    }}
                                >
                                    إعادة التقييم
                                </motion.div>
                            </Link>
                            <motion.button whileTap={{ scale: 0.94 }} onClick={() => setDismissed(true)}
                                style={{
                                    padding: '8px 14px', borderRadius: 12,
                                    background: 'rgba(255,255,255,0.50)',
                                    border: '1px solid rgba(255,255,255,0.80)',
                                    color: '#0369A1', fontSize: 12, fontWeight: 700,
                                }}
                            >
                                لاحقاً
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT: ToolCard — بطاقة الأداة القابلة للتفعيل
   ══════════════════════════════════════════════════════════════════ */
function ToolCard({
    tool, index, isOpened, domainColor, onTap,
}: {
    tool: ToolRecommendation;
    index: number;
    isOpened: boolean;
    domainColor: string;
    onTap: () => void;
}) {
    const Icon = TOOL_ICON[tool.type] ?? BookOpen;

    // توجيه لصفحة الأداة الحقيقية إذا وُجدت
    const toolHref = hasToolPage(tool.id)
        ? getToolPageUrl(tool.type, tool.id)
        : tool.href;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.08, type: 'spring', stiffness: 240, damping: 24 }}
        >
            <Link href={toolHref} onClick={onTap}>
                <motion.div
                    whileTap={{ scale: 0.965, y: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="relative overflow-hidden"
                    style={{
                        borderRadius: 20,
                        marginBottom: 10,
                        background: isOpened
                            ? 'rgba(0,255,180,0.07)'
                            : GLASS.base,
                        border: `1px solid ${isOpened
                            ? 'rgba(0,255,180,0.25)'
                            : GLASS.border}`,
                        backdropFilter: 'blur(20px)',
                        boxShadow: isOpened
                            ? `${GLASS.shadowSm}, 0 0 24px rgba(0,255,180,0.12)`
                            : GLASS.shadowSm,
                    }}
                >
                    {/* شريط اللون الجانبي — 4px الأهمية البصرية */}
                    <div
                        className="absolute right-0 top-3 bottom-3"
                        style={{
                            width: 3.5,
                            borderRadius: 99,
                            background: isOpened
                                ? `linear-gradient(to bottom, rgba(0,255,180,0.9), rgba(0,255,180,0.4))`
                                : `linear-gradient(to bottom, ${domainColor}, ${domainColor}44)`,
                            boxShadow: `0 0 8px ${isOpened ? 'rgba(0,255,180,0.5)' : `${domainColor}50`}`,
                        }}
                    />
                    {/* وميض علوي */}
                    <div
                        className="absolute inset-x-0 top-0 pointer-events-none"
                        style={{
                            height: '45%',
                            background: GLASS.sheen,
                            borderRadius: '20px 20px 0 0',
                        }}
                    />

                    <div className="flex items-center gap-3 px-4 py-3.5 pr-6">
                        {/* أيقونة الأداة */}
                        <div
                            className="relative flex-shrink-0 flex items-center justify-center overflow-hidden"
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 16,
                                background: isOpened
                                    ? 'rgba(0,255,180,0.12)'
                                    : `${domainColor}18`,
                                border: `1px solid ${isOpened ? 'rgba(0,255,180,0.30)' : `${domainColor}28`}`,
                                boxShadow: isOpened
                                    ? '0 4px 12px rgba(0,255,180,0.15), inset 0 1px 0 rgba(255,255,255,0.15)'
                                    : 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 10px rgba(0,0,0,0.25)',
                            }}
                        >
                            {/* انعكاس */}
                            <div
                                className="absolute inset-x-0 top-0"
                                style={{
                                    height: '50%',
                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.20) 0%, transparent 100%)',
                                    borderRadius: '15px 15px 0 0',
                                }}
                            />
                            <span style={{ fontSize: 22, position: 'relative', zIndex: 1 }}>{tool.emoji}</span>
                            {isOpened && (
                                <div
                                    className="absolute -bottom-0.5 -left-0.5 flex items-center justify-center"
                                    style={{
                                        width: 18, height: 18,
                                        borderRadius: 99,
                                        background: 'rgba(0,200,140,0.95)',
                                        border: '1.5px solid rgba(255,255,255,0.9)',
                                        boxShadow: '0 2px 6px rgba(0,200,140,0.5)',
                                    }}
                                >
                                    <CheckCircle2 style={{ width: 9, height: 9, color: '#fff' }} />
                                </div>
                            )}
                        </div>

                        {/* محتوى */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span style={{
                                    fontSize: 9,
                                    fontWeight: 900,
                                    color: isOpened ? 'rgba(0,255,180,0.85)' : domainColor,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                }}>{TOOL_LABEL[tool.type]}</span>
                                {isOpened && (
                                    <span style={{
                                        fontSize: 8,
                                        fontWeight: 800,
                                        background: 'rgba(0,200,140,0.15)',
                                        color: 'rgba(0,200,140,0.9)',
                                        padding: '1px 6px',
                                        borderRadius: 99,
                                        border: '1px solid rgba(0,200,140,0.25)',
                                    }}>✓ مفتوح</span>
                                )}
                                {!tool.isFree && (
                                    <span style={{
                                        fontSize: 8,
                                        fontWeight: 900,
                                        background: 'rgba(245,158,11,0.18)',
                                        color: '#F59E0B',
                                        padding: '1px 6px',
                                        borderRadius: 99,
                                        border: '1px solid rgba(245,158,11,0.30)',
                                    }}>PRO</span>
                                )}
                            </div>
                            <p style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: TXT.primary,
                                lineHeight: 1.3,
                                marginBottom: 3,
                                letterSpacing: '-0.01em',
                            }}>{tool.arabicName}</p>
                            <p className="line-clamp-1" style={{
                                fontSize: 11,
                                color: TXT.secondary,
                                fontWeight: 500,
                                lineHeight: 1.4,
                            }}>{tool.description}</p>
                        </div>

                        {/* Meta + arrow */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                            {tool.durationMinutes > 0 && (
                                <div className="flex items-center gap-1">
                                    <Clock style={{ width: 9, height: 9, color: TXT.muted }} />
                                    <span style={{ fontSize: 9, fontWeight: 700, color: TXT.muted }}>
                                        {tool.durationMinutes}د
                                    </span>
                                </div>
                            )}
                            <div
                                style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 99,
                                    background: `${domainColor}18`,
                                    border: `1px solid ${domainColor}28`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <ArrowLeft style={{ width: 11, height: 11, color: domainColor, opacity: 0.8, transform: 'rotate(180deg)' }} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT: ProtocolProgressCard — تقدم البروتوكول اليومي
   ══════════════════════════════════════════════════════════════════ */
function ProtocolProgressCard({
    plan, domainColor,
}: { plan: SavedCarePlan; domainColor: string }) {
    const protocol = getProtocol(plan.routing.primary_subdomain)
                  ?? getRegisteredProtocol(plan.routing.primary_subdomain);
    if (!protocol) return null;

    const currentDay   = getProtocolDay(plan);
    const progress     = getProtocolProgress(plan, protocol);
    const reassessment = getProtocolReassessment(plan, protocol);
    const phaseInfo    = PHASE_LABELS[progress.phase];

    const PHASES: Array<{ key: typeof progress.phase; label: string; emoji: string; days: string }> = [
        { key: 'understand', label: 'الفهم',       emoji: '🔍', days: '١-٢' },
        { key: 'practice',   label: 'التطبيق',    emoji: '⚡', days: '٣-٤' },
        { key: 'measure',    label: 'القياس',      emoji: '📊', days: '٥-٦' },
        { key: 'assess',     label: 'التقييم',     emoji: '🔄', days: '٧' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04, type: 'spring', stiffness: 260, damping: 26 }}
        >
            <div className="relative overflow-hidden" style={{
                borderRadius: 22,
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.90)',
                backdropFilter: 'blur(24px) saturate(160%)',
                boxShadow: '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.95)',
                padding: '18px 18px 14px',
            }}>
                {/* sheen */}
                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
                    height: '45%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)',
                    borderRadius: '22px 22px 0 0',
                }} />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-1">
                            <span style={{ fontSize: 15 }}>🗓️</span>
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 900, color: domainColor, letterSpacing: '-0.01em' }}>
                                    {protocol.arabicTitle}
                                </p>
                                <p style={{ fontSize: 9, color: '#7DD3FC', fontWeight: 700 }}>
                                    {protocol.weekGoal}
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 18, fontWeight: 900, color: domainColor, lineHeight: 1 }}>
                                {progress.adherencePercent}%
                            </p>
                            <p style={{ fontSize: 9, color: '#7DD3FC', fontWeight: 700 }}>التزام</p>
                        </div>
                    </div>

                    {/* Day dots */}
                    <div className="flex items-center gap-1 mb-3 justify-between">
                        {Array.from({ length: protocol.totalDays }, (_, i) => {
                            const d = i + 1;
                            const isDone  = d < currentDay && progress.completedDays >= d;
                            const isCurrent = d === currentDay;
                            const isFuture  = d > currentDay;
                            return (
                                <div key={d} className="flex flex-col items-center gap-0.5">
                                    <motion.div
                                        style={{
                                            width: 28, height: 28,
                                            borderRadius: isCurrent ? 10 : 8,
                                            background: isDone
                                                ? 'rgba(0,200,140,0.85)'
                                                : isCurrent
                                                    ? domainColor
                                                    : 'rgba(0,0,0,0.05)',
                                            border: isCurrent ? `2px solid ${domainColor}` : '1.5px solid transparent',
                                            boxShadow: isCurrent ? `0 4px 12px ${domainColor}40` : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                        animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <span style={{
                                            fontSize: isDone ? 10 : 9,
                                            fontWeight: 900,
                                            color: isDone || isCurrent ? '#fff' : 'rgba(0,0,0,0.25)',
                                        }}>
                                            {isDone ? '✓' : d}
                                        </span>
                                    </motion.div>
                                    {d === currentDay && (
                                        <span style={{ fontSize: 7, fontWeight: 800, color: domainColor }}>اليوم</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Phase pipeline */}
                    <div className="grid grid-cols-4 gap-1 mb-3">
                        {PHASES.map(ph => {
                            const isActive  = ph.key === progress.phase;
                            const isPast    = PHASES.indexOf(ph) < PHASES.findIndex(p => p.key === progress.phase);
                            return (
                                <div key={ph.key} className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-[10px]" style={{
                                    background: isActive ? `${domainColor}14` : isPast ? 'rgba(0,200,140,0.07)' : 'rgba(0,0,0,0.03)',
                                    border: `1px solid ${isActive ? domainColor + '28' : 'transparent'}`,
                                }}>
                                    <span style={{ fontSize: 13 }}>{ph.emoji}</span>
                                    <p style={{
                                        fontSize: 8.5, fontWeight: isActive ? 900 : 600,
                                        color: isActive ? domainColor : isPast ? 'rgba(0,140,90,0.7)' : 'rgba(0,0,0,0.28)',
                                        textAlign: 'center', lineHeight: 1.2,
                                    }}>
                                        {ph.label}
                                    </p>
                                    <span style={{ fontSize: 7, color: 'rgba(0,0,0,0.2)', fontWeight: 600 }}>يوم {ph.days}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Current phase description */}
                    <div style={{
                        padding: '8px 12px', borderRadius: 12,
                        background: `${domainColor}09`, border: `1px solid ${domainColor}18`,
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <span style={{ fontSize: 14 }}>{phaseInfo.emoji}</span>
                        <div className="flex-1">
                            <p style={{ fontSize: 10, fontWeight: 900, color: domainColor, letterSpacing: '0.06em', marginBottom: 1 }}>
                                أنت في مرحلة: {phaseInfo.ar}
                            </p>
                            <p style={{ fontSize: 9, color: '#0369A1', fontWeight: 600, lineHeight: 1.4 }}>
                                {progress.phase === 'understand' && 'ركّز على الفهم — لا ضغط على التغيير الآن'}
                                {progress.phase === 'practice'   && 'طبّق الأداة بانتظام — التكرار هو ما يُرسّخ العادة'}
                                {progress.phase === 'measure'    && 'قِس التحسن — قارن اليوم بالبداية'}
                                {progress.phase === 'assess'     && 'حان وقت إعادة التقييم — هل تحسّن وضعك؟'}
                            </p>
                        </div>
                        {reassessment.needed && (
                            <Link href="/symptom-checker">
                                <motion.div whileTap={{ scale: 0.94 }} style={{
                                    padding: '6px 10px', borderRadius: 10,
                                    background: reassessment.urgency === 'high' ? 'rgba(239,68,68,0.12)' : `${domainColor}18`,
                                    border: `1px solid ${reassessment.urgency === 'high' ? 'rgba(239,68,68,0.30)' : domainColor + '28'}`,
                                }}>
                                    <p style={{ fontSize: 9, fontWeight: 900, color: reassessment.urgency === 'high' ? '#DC2626' : domainColor, whiteSpace: 'nowrap' }}>
                                        أعد التقييم ←
                                    </p>
                                </motion.div>
                            </Link>
                        )}
                        {!reassessment.needed && reassessment.daysTill > 0 && (
                            <p style={{ fontSize: 8.5, fontWeight: 700, color: '#7DD3FC', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                بعد {reassessment.daysTill}د
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════ */
export default function MyPlanPage() {
    const router = useRouter();
    const [plan, setPlan] = useState<SavedCarePlan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const p = getActiveCarePlan();
        setPlan(p);
        setLoading(false);
        if (p) {
            touchCarePlan();
            trackEvent('page_view', { page_name: 'my_plan', has_plan: true });
        } else {
            trackEvent('page_view', { page_name: 'my_plan', has_plan: false });
        }
    }, []);

    if (loading) return null;

    // ── Empty State ──────────────────────────────────────────────
    if (!plan) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" dir="rtl"
                style={{ background: PAGE_BG }}>
                <SEO title="خطتي — طِبرَا" description="خطتك العلاجية الشخصية" />

                {/* water caustics */}
                <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                    {Object.values(WATER_CAUSTIC).map((g, i) => (
                        <div key={i} className="absolute inset-0" style={{ background: g }} />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 26 }}
                    className="relative z-10 text-center max-w-xs w-full"
                >
                    {/* Floating orb */}
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="mx-auto mb-8 relative"
                        style={{ width: 90, height: 90 }}
                    >
                        <div style={{
                            width: 90, height: 90,
                            borderRadius: '50%',
                            background: DOMAIN_GLASS.jasadi.heroGrad,
                            border: '1px solid rgba(0,183,235,0.35)',
                            boxShadow: `0 20px 50px rgba(0,183,235,0.35), 0 0 40px rgba(0,183,235,0.20), inset 0 1px 0 rgba(255,255,255,0.25)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: GLASS.sheen,
                                borderRadius: '50%',
                            }} />
                            <Star className="relative z-10" style={{ width: 38, height: 38, color: '#00B7EB' }} />
                        </div>
                    </motion.div>

                    <h2 style={{ fontSize: 22, fontWeight: 900, color: TXT.primary, marginBottom: 10, letterSpacing: '-0.02em' }}>
                        لم تُكمل تقييمك بعد
                    </h2>
                    <p style={{ fontSize: 13, color: TXT.secondary, fontWeight: 500, marginBottom: 36, lineHeight: 1.7 }}>
                        أكمل التقييم أولاً لإنشاء خطتك العلاجية الشخصية
                    </p>
                    <Link href="/symptom-checker">
                        <motion.div
                            whileTap={{ scale: 0.96, y: 1 }}
                            style={{
                                background: DOMAIN_GLASS.jasadi.heroGrad,
                                border: '1px solid rgba(0,183,235,0.38)',
                                borderRadius: 22,
                                padding: '16px 24px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: `0 12px 36px rgba(0,183,235,0.30), inset 0 1px 0 rgba(255,255,255,0.20)`,
                                position: 'relative', overflow: 'hidden',
                            }}
                        >
                            <div style={{ position: 'absolute', inset: 0, background: GLASS.sheen }} />
                            <span style={{ fontSize: 15, fontWeight: 900, color: TXT.primary, position: 'relative', zIndex: 1 }}>
                                ابدأ التقييم
                            </span>
                            <ArrowLeft style={{ width: 15, height: 15, color: '#00B7EB', transform: 'rotate(180deg)', position: 'relative', zIndex: 1 }} />
                        </motion.div>
                    </Link>
                </motion.div>
            </div>
        );
    }

    // ── Has Plan ──────────────────────────────────────────────
    const summary      = getPlanSummary(plan);
    const engagement   = getToolEngagement(plan);
    const dVis         = DOMAIN_GLASS[plan.routing.primary_domain];
    const dVisSec      = DOMAIN_GLASS[plan.routing.secondary_domain];
    const primaryDom   = DOMAIN_BY_ID[plan.routing.primary_domain];
    const secondaryDom = DOMAIN_BY_ID[plan.routing.secondary_domain];
    const primarySub   = SUBDOMAIN_BY_ID[plan.routing.primary_subdomain];
    const scores       = plan.routing.domain_scores;
    const createdDate  = new Date(plan.createdAt);
    const dateStr      = createdDate.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' });
    const needsEsc     = summary.escalation === 'emergency' || summary.escalation === 'urgent' || summary.escalation === 'needs_doctor';
    const completionRate = getCompletionRate(plan);

    // Booking CTA ذكي بناءً على الحالة
    const getSmartBookingMsg = () => {
        if (summary.escalation === 'emergency') return null; // يُعالَج في escalation block
        if (summary.confidence === 'low') return 'ثقة التوجيه منخفضة — جلسة تشخيصية تُساعدك أكثر';
        if (summary.daysSinceCreation >= 7 && completionRate < 30) return 'أسبوع بلا تقدم كافٍ — إشراف مباشر قد يُسرّع تعافيك';
        if (summary.escalation === 'needs_doctor') return 'نمطك يوصي بمتابعة متخصصة قريباً';
        return null;
    };
    const smartBookingMsg = getSmartBookingMsg();

    const handleToolClick = (tool: ToolRecommendation) => {
        haptic.tap();
        markToolOpened(tool.id);
        trackEvent('routing_tool_opened', {
            tool_id: tool.id, tool_type: tool.type,
            domain: plan.routing.primary_domain, is_free: tool.isFree,
        });
        setPlan(getActiveCarePlan());
    };

    const handleDailyToggle = (toolId: string) => {
        haptic.tap();
        const current = getTodayChecklist(plan);
        const next = current.includes(toolId)
            ? current.filter(id => id !== toolId)
            : [...current, toolId];
        saveDailyChecklist(next);
        setPlan(getActiveCarePlan());
        trackEvent('daily_checklist_toggle', { tool_id: toolId, checked: !current.includes(toolId) });
    };

    return (
        <div dir="rtl" className="min-h-screen" style={{ background: PAGE_BG }}>
            <SEO title="خطتي العلاجية — طِبرَا" description="خطتك العلاجية المخصصة من محرك طِبرَا" />

            {/* ── طبقة المياه المضيئة ── */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                {Object.values(WATER_CAUSTIC).map((g, i) => (
                    <div key={i} className="absolute inset-0" style={{ background: g }} />
                ))}
                {/* هالة القسم الرئيسي */}
                <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', top: -100, right: -80,
                        width: 320, height: 320, borderRadius: '50%',
                        background: `radial-gradient(circle, ${dVis.glow} 0%, transparent 65%)`,
                        filter: 'blur(50px)',
                    }}
                />
                <div style={{
                    position: 'absolute', bottom: 60, left: -60,
                    width: 260, height: 260, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 65%)',
                    filter: 'blur(55px)',
                }} />
            </div>

            <div className="relative z-10 pb-36">

                {/* ══ HEADER ══════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                    className="sticky top-0 z-30 px-4 pt-14 pb-3"
                    style={{
                        background: 'rgba(2,24,40,0.72)',
                        backdropFilter: 'blur(28px) saturate(160%)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        {/* Back */}
                        <motion.button
                            whileTap={{ scale: 0.88 }}
                            onClick={() => router.back()}
                            style={{
                                width: 38, height: 38,
                                borderRadius: '50%',
                                background: GLASS.base,
                                border: `1px solid ${GLASS.border}`,
                                backdropFilter: 'blur(16px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: GLASS.shadowSm,
                                flexShrink: 0,
                            }}
                        >
                            <ChevronLeft style={{ width: 17, height: 17, color: TXT.secondary, transform: 'rotate(180deg)' }} />
                        </motion.button>

                        <div className="flex-1">
                            <p style={{ fontSize: 11, fontWeight: 700, color: dVis.accent, letterSpacing: '0.06em', marginBottom: 1 }}>
                                {primaryDom?.arabicName}
                            </p>
                            <h1 style={{ fontSize: 19, fontWeight: 900, color: TXT.primary, letterSpacing: '-0.02em' }}>
                                خطّتي العلاجية
                            </h1>
                        </div>

                        {/* Progress chip */}
                        <div style={{
                            padding: '6px 12px',
                            borderRadius: 99,
                            background: `${dVis.accentSoft}`,
                            border: `1px solid ${dVis.borderGlow}`,
                            backdropFilter: 'blur(12px)',
                            display: 'flex', alignItems: 'center', gap: 5,
                        }}>
                            <Activity style={{ width: 12, height: 12, color: dVis.accent }} />
                            <span style={{ fontSize: 11, fontWeight: 900, color: dVis.accent }}>
                                {summary.toolsOpened}/{summary.toolsTotal}
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="px-4 pt-4 space-y-3">

                    {/* ══ START TODAY BAR ═══════════════════ */}
                    <StartTodayBar
                        tools={plan.routing.recommended_tools}
                        domainColor={dVis.accent}
                        openedIds={plan.toolsOpened}
                        completedIds={plan.toolsCompleted ?? []}
                        onTap={handleToolClick}
                    />

                    {/* ══ PROTOCOL PROGRESS ══════════════════ */}
                    <ProtocolProgressCard plan={plan} domainColor={dVis.accent} />

                    {/* ══ ADAPTIVE HANDOFF ═══════════════ */}
                    <AdaptiveHandoff plan={plan} domainColor={dVis.accent} />

                    {/* ══ TRACKER INSIGHT (Sprint 4) ══════ */}
                    <TrackerInsightCard plan={plan} domainColor={dVis.accent} />

                    {/* ══ DAILY CHECKLIST ═══════════════════ */}
                    <DailyChecklist
                        tools={plan.routing.recommended_tools}
                        domainColor={dVis.accent}
                        plan={plan}
                        onToggle={handleDailyToggle}
                    />

                    {/* ══ SMART BOOKING CTA ══════════════════ */}
                    {smartBookingMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 26 }}
                        >
                            <Link
                                href={createPageUrl('BookAppointment')}
                                onClick={() => { haptic.impact(); trackEvent('smart_booking_cta', { reason: smartBookingMsg, confidence: summary.confidence }); }}
                            >
                                <motion.div whileTap={{ scale: 0.97 }}
                                    style={{
                                        borderRadius: 18, padding: '13px 16px',
                                        background: 'linear-gradient(145deg, rgba(129,140,248,0.12), rgba(129,140,248,0.06))',
                                        border: '1px solid rgba(129,140,248,0.28)',
                                        display: 'flex', alignItems: 'center', gap: 10,
                                    }}
                                >
                                    <span style={{ fontSize: 20, flexShrink: 0 }}>🤝</span>
                                    <div className="flex-1">
                                        <p style={{ fontSize: 12, fontWeight: 800, color: '#0C4A6E', marginBottom: 1 }}>{smartBookingMsg}</p>
                                        <p style={{ fontSize: 10, color: '#818CF8', fontWeight: 700 }}>احجز جلسة تشخيصية &larr;</p>
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>
                    )}

                    {/* ══ REASSESSMENT BANNER ════════════════ */}
                    {summary.needsReassessment && (
                        <ReassessmentBanner daysSince={summary.daysSinceCreation} />
                    )}

                    {/* ══ ESCALATION ══════════════════════════ */}
                    <AnimatePresence>
                        {needsEsc && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                            >
                                <div
                                    className="relative overflow-hidden"
                                    style={{
                                        borderRadius: 20,
                                        background: summary.escalation === 'emergency'
                                            ? 'linear-gradient(145deg, rgba(80,10,10,0.90) 0%, rgba(140,15,15,0.80) 100%)'
                                            : 'linear-gradient(145deg, rgba(60,30,5,0.90) 0%, rgba(110,50,5,0.80) 100%)',
                                        border: `1px solid ${summary.escalation === 'emergency' ? 'rgba(255,80,80,0.40)' : 'rgba(245,158,11,0.38)'}`,
                                        boxShadow: summary.escalation === 'emergency'
                                            ? '0 16px 40px rgba(200,0,0,0.30), inset 0 1px 0 rgba(255,120,120,0.20)'
                                            : '0 16px 40px rgba(180,80,0,0.25), inset 0 1px 0 rgba(245,158,11,0.18)',
                                    }}
                                >
                                    {/* حاف ضوئية */}
                                    <div className="absolute inset-x-0 top-0" style={{
                                        height: '45%',
                                        background: summary.escalation === 'emergency'
                                            ? 'linear-gradient(180deg, rgba(255,120,120,0.18) 0%, transparent 100%)'
                                            : 'linear-gradient(180deg, rgba(255,200,80,0.14) 0%, transparent 100%)',
                                        borderRadius: '20px 20px 0 0',
                                    }} />
                                    <div className="relative z-10 flex items-center gap-3 p-4">
                                        <motion.div
                                            animate={{ scale: [1, 1.15, 1] }}
                                            transition={{ duration: 1.8, repeat: Infinity }}
                                        >
                                            <AlertTriangle style={{
                                                width: 22, height: 22,
                                                color: summary.escalation === 'emergency' ? '#FF6B6B' : '#F59E0B',
                                                flexShrink: 0,
                                            }} />
                                        </motion.div>
                                        <div className="flex-1">
                                            <p style={{ fontSize: 13, fontWeight: 900, color: TXT.primary, marginBottom: 2 }}>
                                                {summary.escalation === 'emergency'
                                                    ? 'حالة طارئة — تحتاج تدخل فوري'
                                                    : summary.escalation === 'urgent'
                                                    ? 'يُنصح بمراجعة الطبيب خلال ٢٤ ساعة'
                                                    : 'يُنصح بمتابعة دورية مع الطبيب'}
                                            </p>
                                            <p style={{ fontSize: 10, color: TXT.secondary, fontWeight: 500 }}>
                                                {summary.escalation === 'emergency'
                                                    ? 'الأعراض تستدعي تقييماً طبياً عاجلاً'
                                                    : 'التقييم يوضح نمطاً يحتاج متابعة متخصصة'}
                                            </p>
                                        </div>
                                        <Link
                                            href={summary.escalation === 'emergency' ? 'tel:911' : createPageUrl('BookAppointment')}
                                            onClick={() => {
                                                haptic.impact();
                                                trackEvent('booking_from_routing', { triage_level: summary.triageLevel, from: 'my_plan' });
                                            }}
                                        >
                                            <motion.div
                                                whileTap={{ scale: 0.94 }}
                                                style={{
                                                    borderRadius: 14,
                                                    padding: '8px 14px',
                                                    background: summary.escalation === 'emergency'
                                                        ? 'rgba(255,50,50,0.88)'
                                                        : 'rgba(245,158,11,0.88)',
                                                    boxShadow: summary.escalation === 'emergency'
                                                        ? '0 4px 16px rgba(255,50,50,0.40)'
                                                        : '0 4px 16px rgba(245,158,11,0.35)',
                                                    display: 'flex', alignItems: 'center', gap: 4,
                                                }}
                                            >
                                                {summary.escalation === 'emergency'
                                                    ? <Phone style={{ width: 12, height: 12, color: '#fff' }} />
                                                    : <Calendar style={{ width: 12, height: 12, color: '#fff' }} />}
                                                <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>
                                                    {summary.escalation === 'emergency' ? 'اتصل الآن' : 'احجز'}
                                                </span>
                                            </motion.div>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ══ HERO — القسم الرئيسي (الأهم بصرياً) ══ */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, type: 'spring', stiffness: 240, damping: 26 }}
                    >
                        <div
                            className="relative overflow-hidden"
                            style={{
                                borderRadius: 28,
                                background: dVis.heroGrad,
                                border: `1px solid ${dVis.borderGlow}`,
                                boxShadow: `0 28px 65px ${dVis.glow}, 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.22)`,
                                padding: '22px 22px 20px',
                            }}
                        >
                            {/* طبقة وميض علوية */}
                            <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
                                height: '55%',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 40%, transparent 100%)',
                                borderRadius: '28px 28px 0 0',
                            }} />
                            {/* نقطة انعكاس */}
                            <div className="absolute pointer-events-none" style={{
                                top: 12, right: 18,
                                width: 60, height: 30,
                                background: 'radial-gradient(ellipse, rgba(255,255,255,0.22) 0%, transparent 70%)',
                                filter: 'blur(6px)',
                            }} />
                            {/* جزيئات مياه */}
                            <WaterParticles color={dVis.accent} />

                            {/* ── Primary ── */}
                            <div className="relative z-10">
                                <div className="flex items-start gap-4">
                                    {/* أيقونة القسم */}
                                    <div style={{
                                        width: 60, height: 60,
                                        borderRadius: 20,
                                        background: 'rgba(255,255,255,0.10)',
                                        border: '1px solid rgba(255,255,255,0.22)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: `0 8px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.22)`,
                                        flexShrink: 0, position: 'relative', overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: GLASS.sheen,
                                            borderRadius: 19,
                                        }} />
                                        <span style={{ fontSize: 28, position: 'relative', zIndex: 1 }}>
                                            {primaryDom?.emoji}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <p style={{
                                            fontSize: 10,
                                            fontWeight: 900,
                                            color: dVis.accent,
                                            letterSpacing: '0.14em',
                                            textTransform: 'uppercase',
                                            marginBottom: 4,
                                        }}>القسم الرئيسي</p>
                                        <h2 style={{
                                            fontSize: 24,
                                            fontWeight: 900,
                                            color: TXT.primary,
                                            letterSpacing: '-0.02em',
                                            lineHeight: 1.1,
                                            marginBottom: 4,
                                        }}>{primaryDom?.arabicName}</h2>
                                        {/* Subdomain chip */}
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center',
                                            padding: '3px 10px',
                                            background: `${dVis.accentSoft}`,
                                            border: `1px solid ${dVis.borderGlow}`,
                                            borderRadius: 99,
                                        }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: dVis.accent }}>
                                                {primarySub?.arabicName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Score — ضخم */}
                                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                                        <p style={{
                                            fontSize: 44,
                                            fontWeight: 900,
                                            color: dVis.accent,
                                            lineHeight: 1,
                                            letterSpacing: '-0.04em',
                                            textShadow: `0 0 24px ${dVis.glow}`,
                                        }}>
                                            {scores[plan.routing.primary_domain]}
                                        </p>
                                        <p style={{ fontSize: 11, fontWeight: 700, color: TXT.secondary, marginTop: 1 }}>%</p>
                                    </div>
                                </div>

                                {/* ── Priority Strip (داخل البطاقة الرئيسية) ── */}
                                <div
                                    className="mt-4 pt-4"
                                    style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
                                >
                                    <p style={{ fontSize: 9, fontWeight: 900, color: TXT.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                                        أولويتك هذا الأسبوع
                                    </p>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: TXT.secondary, lineHeight: 1.6 }}>
                                        {plan.routing.priority}
                                    </p>
                                </div>

                                {/* ── Secondary domain (داخل البطاقة مصغّر) ── */}
                                <div
                                    className="mt-3 pt-3 flex items-center gap-2.5"
                                    style={{ borderTop: '1px solid rgba(255,255,255,0.09)' }}
                                >
                                    <div style={{
                                        width: 30, height: 30,
                                        borderRadius: 10,
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <span style={{ fontSize: 16 }}>{DOMAIN_BY_ID[plan.routing.secondary_domain]?.emoji}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p style={{ fontSize: 8.5, fontWeight: 900, color: TXT.muted, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                                            ثانوي
                                        </p>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: TXT.secondary }}>
                                            {DOMAIN_BY_ID[plan.routing.secondary_domain]?.arabicName}
                                        </p>
                                    </div>
                                    <p style={{ fontSize: 20, fontWeight: 900, color: dVisSec.accent, letterSpacing: '-0.03em' }}>
                                        {scores[plan.routing.secondary_domain]}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ══ DOMAIN SCORE BARS ══════════════════ */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12, type: 'spring', stiffness: 240, damping: 26 }}
                    >
                        <DeepGlassCard style={{ padding: '18px 20px' }}>
                            <p style={{
                                fontSize: 9,
                                fontWeight: 900,
                                color: TXT.muted,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                marginBottom: 14,
                            }}>خريطة توجيهك</p>
                            <div className="space-y-4">
                                {Object.entries(scores).map(([domId, score], i) => {
                                    const dom = DOMAIN_BY_ID[domId as DomainId];
                                    const vis = DOMAIN_GLASS[domId as DomainId];
                                    return (
                                        <DomainScoreBar
                                            key={domId}
                                            label={dom?.arabicName}
                                            emoji={dom?.emoji}
                                            score={score}
                                            color={vis?.accent}
                                            delay={0.14 + i * 0.05}
                                            isPrimary={domId === plan.routing.primary_domain}
                                        />
                                    );
                                })}
                            </div>
                        </DeepGlassCard>
                    </motion.div>

                    {/* ══ TOOLS — أدواتك (المحور الرئيسي) ══ */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Section header + progress */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div>
                                <h3 style={{ fontSize: 17, fontWeight: 900, color: TXT.primary, letterSpacing: '-0.02em' }}>
                                    خطة عملك
                                </h3>
                                <p style={{ fontSize: 10, color: TXT.muted, fontWeight: 600 }}>
                                    {plan.routing.recommended_tools.length} أدوات موصى بها
                                </p>
                            </div>
                            {/* Circular progress */}
                            <div style={{ position: 'relative', width: 48, height: 48 }}>
                                <svg width="48" height="48" viewBox="0 0 48 48">
                                    {/* Track */}
                                    <circle cx="24" cy="24" r="19"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.10)"
                                        strokeWidth="3.5"
                                    />
                                    {/* Progress */}
                                    <motion.circle cx="24" cy="24" r="19"
                                        fill="none"
                                        stroke={dVis.accent}
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 19}`}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 19 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 19 * (1 - engagement / 100) }}
                                        transition={{ duration: 1.4, ease: [0.05, 0.7, 0.1, 1], delay: 0.3 }}
                                        transform="rotate(-90 24 24)"
                                        style={{ filter: `drop-shadow(0 0 5px ${dVis.accent}60)` }}
                                    />
                                </svg>
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <span style={{ fontSize: 11, fontWeight: 900, color: dVis.accent }}>
                                        {engagement}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tool cards */}
                        {plan.routing.recommended_tools.map((tool, i) => (
                            <ToolCard
                                key={tool.id}
                                tool={tool}
                                index={i}
                                isOpened={plan.toolsOpened.includes(tool.id)}
                                domainColor={dVis.accent}
                                onTap={() => handleToolClick(tool)}
                            />
                        ))}
                    </motion.div>

                    {/* ══ WHY — لماذا هذا التوجيه ══════════ */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.48, type: 'spring', stiffness: 240, damping: 26 }}
                    >
                        <DeepGlassCard style={{ padding: '18px 20px' }}>
                            <p style={{
                                fontSize: 9,
                                fontWeight: 900,
                                color: TXT.muted,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                marginBottom: 8,
                            }}>لماذا هذا التوجيه؟</p>
                            <p style={{ fontSize: 13, color: TXT.secondary, lineHeight: 1.75, fontWeight: 500 }}>
                                {plan.routing.why}
                            </p>
                        </DeepGlassCard>
                    </motion.div>

                    {/* ══ META chips ══════════════════════════ */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.54 }}
                    >
                        <div className="grid grid-cols-3 gap-2.5">
                            {/* Confidence */}
                            <div
                                style={{
                                    borderRadius: 18,
                                    padding: '14px 8px',
                                    background: GLASS.base,
                                    border: `1px solid ${GLASS.border}`,
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: GLASS.shadowSm,
                                    textAlign: 'center',
                                    position: 'relative', overflow: 'hidden',
                                }}
                            >
                                <div className="absolute inset-x-0 top-0" style={{
                                    height: '45%', background: GLASS.sheen, borderRadius: '18px 18px 0 0'
                                }} />
                                <p style={{ fontSize: 8, fontWeight: 800, color: TXT.muted, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>
                                    الثقة
                                </p>
                                <p style={{
                                    fontSize: 15, fontWeight: 900,
                                    color: plan.confidence === 'high' ? '#22D3EE' : plan.confidence === 'medium' ? '#F59E0B' : '#F87171',
                                    textShadow: plan.confidence === 'high' ? '0 0 12px rgba(34,211,238,0.5)' : 'none',
                                }}>
                                    {plan.confidence === 'high' ? 'عالية' : plan.confidence === 'medium' ? 'متوسطة' : 'منخفضة'}
                                </p>
                            </div>
                            {/* Days */}
                            <div
                                style={{
                                    borderRadius: 18,
                                    padding: '14px 8px',
                                    background: GLASS.base,
                                    border: `1px solid ${GLASS.border}`,
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: GLASS.shadowSm,
                                    textAlign: 'center',
                                    position: 'relative', overflow: 'hidden',
                                }}
                            >
                                <div className="absolute inset-x-0 top-0" style={{
                                    height: '45%', background: GLASS.sheen, borderRadius: '18px 18px 0 0'
                                }} />
                                <p style={{ fontSize: 8, fontWeight: 800, color: TXT.muted, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>
                                    منذ
                                </p>
                                <p style={{ fontSize: 15, fontWeight: 900, color: TXT.primary }}>
                                    {summary.daysSinceCreation}
                                    <span style={{ fontSize: 10, color: TXT.secondary }}> يوم</span>
                                </p>
                            </div>
                            {/* Severity */}
                            <div
                                style={{
                                    borderRadius: 18,
                                    padding: '14px 8px',
                                    background: GLASS.base,
                                    border: `1px solid ${GLASS.border}`,
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: GLASS.shadowSm,
                                    textAlign: 'center',
                                    position: 'relative', overflow: 'hidden',
                                }}
                            >
                                <div className="absolute inset-x-0 top-0" style={{
                                    height: '45%', background: GLASS.sheen, borderRadius: '18px 18px 0 0'
                                }} />
                                <p style={{ fontSize: 8, fontWeight: 800, color: TXT.muted, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>
                                    الشدة
                                </p>
                                <p style={{ fontSize: 15, fontWeight: 900, color: TXT.primary }}>
                                    {plan.answers.severity}
                                    <span style={{ fontSize: 10, color: TXT.secondary }}>/10</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* ══ REASSESS NOTICE — removed (moved to top) ══ */}

                    {/* ══ DISCLAIMER ═════════════════════════ */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.62 }}
                    >
                        <div style={{
                            borderRadius: 16,
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                        }}>
                            <Sparkles style={{ width: 12, height: 12, color: TXT.muted, flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: 10.5, color: TXT.muted, lineHeight: 1.65, fontWeight: 500 }}>
                                هذا التحليل استرشادي وليس تشخيصاً طبياً. في الحالات الطارئة، توجّه للطوارئ فوراً.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ══ STICKY BOTTOM CTAs ══════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 240, damping: 28 }}
                className="fixed bottom-0 inset-x-0 z-40 px-4 pb-8 pt-3"
                style={{
                    background: 'linear-gradient(0deg, rgba(2,18,32,0.96) 0%, rgba(2,18,32,0.80) 70%, transparent 100%)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                {/* Book CTA — الأهم */}
                <Link
                    href={createPageUrl('BookAppointment')}
                    onClick={() => {
                        haptic.impact();
                        trackEvent('booking_from_routing', { from: 'my_plan_cta', triage_level: summary.triageLevel });
                    }}
                >
                    <motion.div
                        whileTap={{ scale: 0.97, y: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="relative overflow-hidden flex items-center gap-3 justify-center mb-2.5"
                        style={{
                            height: 58,
                            borderRadius: 22,
                            background: dVis.heroGrad,
                            border: `1px solid ${dVis.borderGlow}`,
                            boxShadow: `0 12px 36px ${dVis.glow}, 0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.22)`,
                        }}
                    >
                        <div className="absolute inset-x-0 top-0" style={{
                            height: '50%',
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, transparent 100%)',
                            borderRadius: '22px 22px 0 0',
                        }} />
                        <Calendar style={{ width: 19, height: 19, color: dVis.accent, position: 'relative', zIndex: 1 }} />
                        <span style={{
                            fontSize: 16, fontWeight: 900, color: TXT.primary,
                            position: 'relative', zIndex: 1, letterSpacing: '-0.01em',
                        }}>احجز مع د. عمر</span>
                        <ArrowLeft style={{
                            width: 14, height: 14, color: dVis.accent,
                            transform: 'rotate(180deg)', position: 'relative', zIndex: 1, opacity: 0.7,
                        }} />
                    </motion.div>
                </Link>

                {/* Reassess — ثانوي خفيف */}
                <Link href="/symptom-checker" onClick={() => haptic.selection()}>
                    <div style={{
                        textAlign: 'center', padding: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                        <RefreshCw style={{ width: 12, height: 12, color: TXT.muted }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: TXT.secondary }}>
                            أعد التقييم
                        </span>
                    </div>
                </Link>
            </motion.div>
        </div>
    );
}

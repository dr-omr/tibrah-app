// pages/my-plan.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — خطتي العلاجية
// Sprint G: Refactored — all sub-components extracted to components/my-plan/
// ════════════════════════════════════════════════════════════════════
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    ChevronLeft, Calendar, RefreshCw, ArrowLeft,
    Sparkles, AlertTriangle, Phone, Star, Activity,
} from 'lucide-react';
import SEO from '@/components/common/SEO';
import { haptic } from '@/lib/HapticFeedback';
import { trackEvent } from '@/lib/analytics';
import { createPageUrl } from '@/utils';
import {
    getActiveCarePlan, touchCarePlan, markToolOpened,
    getToolEngagement, getPlanSummary,
    getTodayChecklist, saveDailyChecklist, getCompletionRate,
    type SavedCarePlan,
} from '@/lib/care-plan-store';
import { AdaptiveHandoff } from '@/components/sections/shared/AdaptiveHandoff';
import { DOMAIN_BY_ID, SUBDOMAIN_BY_ID } from '@/lib/domain-routing-map';
import { getCompletedToolIds } from '@/lib/tool-progress-store';
import { sequenceTools } from '@/lib/recommendation-sequencer';
import type { ToolRecommendation } from '@/components/health-engine/types';
import { hasCompletedSession } from '@/lib/assessment-session-store';

// ── Extracted components ──
import {
    PAGE_BG, WATER_CAUSTIC, GLASS, TXT, DOMAIN_GLASS,
} from '@/components/my-plan/plan-tokens';
import { DeepGlassCard, WaterParticles, DomainScoreBar } from '@/components/my-plan/plan-shared';
import { TrackerInsightCard } from '@/components/my-plan/TrackerInsightCard';
import { StartTodayBar } from '@/components/my-plan/StartTodayBar';
import { DailyChecklist } from '@/components/my-plan/DailyChecklist';
import { ToolCard } from '@/components/my-plan/ToolCard';
import { ReassessmentBanner } from '@/components/my-plan/ReassessmentBanner';
import { ProtocolProgressCard } from '@/components/my-plan/ProtocolProgressCard';
import { MyPlanSkeleton } from '@/components/sections/shared/SectionSkeleton';
import { TayyibatPlanHandoff } from '@/components/nutrition/TayyibatPlanHandoff';
import { AdaptivePriorityCard } from '@/components/my-plan/AdaptivePriorityCard';

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

    if (loading) return <MyPlanSkeleton />;

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
                            width: 90, height: 90, borderRadius: '50%',
                            background: DOMAIN_GLASS.jasadi.heroGrad,
                            border: '1px solid rgba(0,183,235,0.35)',
                            boxShadow: `0 20px 50px rgba(0,183,235,0.35), 0 0 40px rgba(0,183,235,0.20), inset 0 1px 0 rgba(255,255,255,0.25)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{ position: 'absolute', inset: 0, background: GLASS.sheen, borderRadius: '50%' }} />
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
                                borderRadius: 22, padding: '16px 24px',
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
    const primaryDom   = DOMAIN_BY_ID[plan.routing.primary_domain];
    const primarySub   = SUBDOMAIN_BY_ID[plan.routing.primary_subdomain];
    const scores       = plan.routing.domain_scores;
    const completionRate = getCompletionRate(plan);
    const needsEsc     = summary.escalation === 'emergency' || summary.escalation === 'urgent' || summary.escalation === 'needs_doctor';

    // Booking CTA ذكي بناءً على الحالة
    const getSmartBookingMsg = () => {
        if (summary.escalation === 'emergency') return null;
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
                        <motion.button
                            whileTap={{ scale: 0.88 }}
                            onClick={() => router.back()}
                            style={{
                                width: 38, height: 38, borderRadius: '50%',
                                background: GLASS.base, border: `1px solid ${GLASS.border}`,
                                backdropFilter: 'blur(16px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: GLASS.shadowSm, flexShrink: 0,
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

                        <div style={{
                            padding: '6px 12px', borderRadius: 99,
                            background: `${dVis.accentSoft}`, border: `1px solid ${dVis.borderGlow}`,
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

                    {/* ══ ADAPTIVE PRIORITY (Daily Decision Center) ════ */}
                    <AdaptivePriorityCard plan={plan} domainColor={dVis.accent} />

                    {/* ══ ADAPTIVE HANDOFF ═══════════════ */}
                    <AdaptiveHandoff plan={plan} domainColor={dVis.accent} />

                    {/* ══ TRACKER INSIGHT ══════════════════ */}
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
                                <div className="relative overflow-hidden" style={{
                                    borderRadius: 20,
                                    background: summary.escalation === 'emergency'
                                        ? 'linear-gradient(145deg, rgba(80,10,10,0.90) 0%, rgba(140,15,15,0.80) 100%)'
                                        : 'linear-gradient(145deg, rgba(60,30,5,0.90) 0%, rgba(110,50,5,0.80) 100%)',
                                    border: `1px solid ${summary.escalation === 'emergency' ? 'rgba(255,80,80,0.40)' : 'rgba(245,158,11,0.38)'}`,
                                    boxShadow: summary.escalation === 'emergency'
                                        ? '0 16px 40px rgba(200,0,0,0.30), inset 0 1px 0 rgba(255,120,120,0.20)'
                                        : '0 16px 40px rgba(180,80,0,0.25), inset 0 1px 0 rgba(245,158,11,0.18)',
                                }}>
                                    <div className="absolute inset-x-0 top-0" style={{
                                        height: '45%',
                                        background: summary.escalation === 'emergency'
                                            ? 'linear-gradient(180deg, rgba(255,120,120,0.18) 0%, transparent 100%)'
                                            : 'linear-gradient(180deg, rgba(255,200,80,0.14) 0%, transparent 100%)',
                                        borderRadius: '20px 20px 0 0',
                                    }} />
                                    <div className="relative z-10 flex items-center gap-3 p-4">
                                        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
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
                                            <motion.div whileTap={{ scale: 0.94 }} style={{
                                                borderRadius: 14, padding: '8px 14px',
                                                background: summary.escalation === 'emergency' ? 'rgba(255,50,50,0.88)' : 'rgba(245,158,11,0.88)',
                                                boxShadow: summary.escalation === 'emergency' ? '0 4px 16px rgba(255,50,50,0.40)' : '0 4px 16px rgba(245,158,11,0.35)',
                                                display: 'flex', alignItems: 'center', gap: 4,
                                            }}>
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

                    {/* ══ HERO — القسم الرئيسي ══════════════ */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, type: 'spring', stiffness: 240, damping: 26 }}
                    >
                        <div className="relative overflow-hidden" style={{
                            borderRadius: 28,
                            background: dVis.heroGrad,
                            border: `1px solid ${dVis.borderGlow}`,
                            boxShadow: `0 28px 65px ${dVis.glow}, 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.22)`,
                            padding: '22px 22px 20px',
                        }}>
                            <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
                                height: '55%',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 40%, transparent 100%)',
                                borderRadius: '28px 28px 0 0',
                            }} />
                            <div className="absolute pointer-events-none" style={{
                                top: 12, right: 18, width: 60, height: 30,
                                background: 'radial-gradient(ellipse, rgba(255,255,255,0.22) 0%, transparent 70%)',
                                filter: 'blur(6px)',
                            }} />
                            <WaterParticles color={dVis.accent} />

                            <div className="relative z-10">
                                <div className="flex items-start gap-4">
                                    <div style={{
                                        width: 60, height: 60, borderRadius: 20,
                                        background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: `0 8px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.22)`,
                                        flexShrink: 0, position: 'relative', overflow: 'hidden',
                                    }}>
                                        <div style={{ position: 'absolute', inset: 0, background: GLASS.sheen, borderRadius: 19 }} />
                                        <span style={{ fontSize: 28, position: 'relative', zIndex: 1 }}>{primaryDom?.emoji}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p style={{ fontSize: 10, fontWeight: 900, color: dVis.accent, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>
                                            القسم الرئيسي
                                        </p>
                                        <h2 style={{ fontSize: 24, fontWeight: 900, color: TXT.primary, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 4 }}>
                                            {primaryDom?.arabicName}
                                        </h2>
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
                                            background: `${dVis.accentSoft}`, border: `1px solid ${dVis.borderGlow}`, borderRadius: 99,
                                        }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: dVis.accent }}>{primarySub?.arabicName}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Domain Scores */}
                                <div className="mt-4 space-y-2">
                                    {Object.entries(scores).map(([domId, score], i) => {
                                        const domInfo = DOMAIN_BY_ID[domId as keyof typeof DOMAIN_BY_ID];
                                        const domVis = DOMAIN_GLASS[domId as keyof typeof DOMAIN_GLASS];
                                        if (!domInfo || !domVis) return null;
                                        return (
                                            <DomainScoreBar
                                                key={domId}
                                                label={domInfo.arabicName}
                                                emoji={domInfo.emoji}
                                                score={score}
                                                color={domVis.accent}
                                                delay={0.08 + i * 0.06}
                                                isPrimary={domId === plan.routing.primary_domain}
                                            />
                                        );
                                    })}
                                </div>

                                {/* Engagement ring */}
                                <div className="mt-4 flex items-center gap-3">
                                    <div style={{ width: 44, height: 44, position: 'relative' }}>
                                        <svg width={44} height={44} viewBox="0 0 44 44">
                                            <circle cx={22} cy={22} r={18} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
                                            <motion.circle
                                                cx={22} cy={22} r={18} fill="none"
                                                stroke={dVis.accent} strokeWidth={3} strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 18}`}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 18 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 18 * (1 - engagement / 100) }}
                                                transition={{ duration: 1.5, ease: [0.05, 0.7, 0.1, 1], delay: 0.3 }}
                                                style={{ filter: `drop-shadow(0 0 6px ${dVis.accent}50)` }}
                                                transform="rotate(-90 22 22)"
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

                                {/* Tool cards — sequenced */}
                                {(() => {
                                    const completedIds = typeof window !== 'undefined' ? getCompletedToolIds() : [];
                                    const sequenced = sequenceTools(plan.routing.recommended_tools, completedIds);
                                    return sequenced.map((st, i) => {
                                        const tool = plan.routing.recommended_tools.find(t => t.id === st.id)!;
                                        return (
                                            <ToolCard
                                                key={tool.id}
                                                tool={tool}
                                                index={i}
                                                isOpened={plan.toolsOpened.includes(tool.id)}
                                                isCompleted={st.isCompleted}
                                                badge={st.badge}
                                                badgeAr={st.badgeAr}
                                                domainColor={dVis.accent}
                                                onTap={() => handleToolClick(tool)}
                                            />
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </motion.div>

                    {/* ══ WHY — لماذا هذا التوجيه ══════════ */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.48, type: 'spring', stiffness: 240, damping: 26 }}
                    >
                        <DeepGlassCard style={{ padding: '18px 20px' }}>
                            <p style={{
                                fontSize: 9, fontWeight: 900, color: TXT.muted,
                                letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8,
                            }}>لماذا هذا التوجيه</p>
                            <p style={{ fontSize: 13, color: TXT.primary, fontWeight: 600, lineHeight: 1.8 }}>
                                {(plan.routing as any).explanation ?? 'بناءً على تحليل أعراضك ونمط حياتك'}
                            </p>
                        </DeepGlassCard>
                    </motion.div>

                    {/* ══ META STATS ══════════════════════════ */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, type: 'spring', stiffness: 240, damping: 26 }}
                        className="grid grid-cols-3 gap-2"
                    >
                        {/* Confidence */}
                        <div style={{
                            borderRadius: 18, padding: '14px 8px',
                            background: GLASS.base, border: `1px solid ${GLASS.border}`,
                            backdropFilter: 'blur(20px)', boxShadow: GLASS.shadowSm,
                            textAlign: 'center', position: 'relative', overflow: 'hidden',
                        }}>
                            <div className="absolute inset-x-0 top-0" style={{
                                height: '45%', background: GLASS.sheen, borderRadius: '18px 18px 0 0'
                            }} />
                            <p style={{ fontSize: 8, fontWeight: 800, color: TXT.muted, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>الثقة</p>
                            <p style={{
                                fontSize: 15, fontWeight: 900,
                                color: plan.confidence === 'high' ? '#22D3EE' : plan.confidence === 'medium' ? '#F59E0B' : '#F87171',
                                textShadow: plan.confidence === 'high' ? '0 0 12px rgba(34,211,238,0.5)' : 'none',
                            }}>
                                {plan.confidence === 'high' ? 'عالية' : plan.confidence === 'medium' ? 'متوسطة' : 'منخفضة'}
                            </p>
                        </div>
                        {/* Days */}
                        <div style={{
                            borderRadius: 18, padding: '14px 8px',
                            background: GLASS.base, border: `1px solid ${GLASS.border}`,
                            backdropFilter: 'blur(20px)', boxShadow: GLASS.shadowSm,
                            textAlign: 'center', position: 'relative', overflow: 'hidden',
                        }}>
                            <div className="absolute inset-x-0 top-0" style={{
                                height: '45%', background: GLASS.sheen, borderRadius: '18px 18px 0 0'
                            }} />
                            <p style={{ fontSize: 8, fontWeight: 800, color: TXT.muted, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>منذ</p>
                            <p style={{ fontSize: 15, fontWeight: 900, color: TXT.primary }}>
                                {summary.daysSinceCreation}
                                <span style={{ fontSize: 10, color: TXT.secondary }}> يوم</span>
                            </p>
                        </div>
                        {/* Severity */}
                        <div style={{
                            borderRadius: 18, padding: '14px 8px',
                            background: GLASS.base, border: `1px solid ${GLASS.border}`,
                            backdropFilter: 'blur(20px)', boxShadow: GLASS.shadowSm,
                            textAlign: 'center', position: 'relative', overflow: 'hidden',
                        }}>
                            <div className="absolute inset-x-0 top-0" style={{
                                height: '45%', background: GLASS.sheen, borderRadius: '18px 18px 0 0'
                            }} />
                            <p style={{ fontSize: 8, fontWeight: 800, color: TXT.muted, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>الشدة</p>
                            <p style={{ fontSize: 15, fontWeight: 900, color: TXT.primary }}>
                                {plan.answers.severity}
                                <span style={{ fontSize: 10, color: TXT.secondary }}>/10</span>
                            </p>
                        </div>
                    </motion.div>

                    {/* ══ TAYYIBAT NUTRITION HANDOFF ═════════════════ */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}>
                        <TayyibatPlanHandoff />
                    </motion.div>

                    {/* ══ DISCLAIMER ═════════════════════════ */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.62 }}>
                        <div style={{
                            borderRadius: 16, padding: '12px 16px',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
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
                            height: 58, borderRadius: 22,
                            background: dVis.heroGrad, border: `1px solid ${dVis.borderGlow}`,
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

                {/* Return to assessment result */}
                {hasCompletedSession() && (
                    <Link href="/assessment-result"
                        onClick={() => {
                            haptic.selection();
                            trackEvent('result_return_clicked', { from: 'my_plan_bottom' });
                        }}>
                        <div style={{
                            textAlign: 'center', padding: '4px 8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}>
                            <Activity style={{ width: 11, height: 11, color: TXT.muted }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: TXT.muted }}>
                                العودة إلى نتيجة التحليل
                            </span>
                        </div>
                    </Link>
                )}
            </motion.div>
        </div>
    );
}

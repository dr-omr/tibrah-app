'use client';
/**
 * pages/tools/[type]/[id].tsx — Universal Tool Renderer
 * ════════════════════════════════════════════════════════════════════
 * Sprint G: Refactored — all renderers + chrome extracted to components/tools/
 *
 * يُعالج كل أنواع الأدوات في صفحة واحدة:
 *   practice  → PracticeRenderer  (خطوات متسلسلة مع مؤقت)
 *   test      → TestRenderer      (أسئلة واحدة - نتيجة)
 *   workshop  → WorkshopRenderer  (أقسام قابلة للتوسيع)
 *   tracker   → TrackerRenderer   (حقول + حفظ يومي)
 *   protocol  → ProtocolRenderer  (مهام اليوم من tool-content-map)
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { haptic } from '@/lib/HapticFeedback';
import {
    getToolContent,
    type WorkshopContent,
} from '@/lib/tool-content-map';
import {
    getActiveCarePlan, markToolOpened, markToolCompleted, getProtocolDay,
} from '@/lib/care-plan-store';
import { getPlanId, hasTodayOutcome } from '@/lib/outcome-store';
import { trackEvent } from '@/lib/analytics';
import {
    saveToolProgress, markToolStarted, markToolProgressCompleted,
} from '@/lib/tool-progress-store';
import { getNextTool } from '@/lib/recommendation-sequencer';
import YouTubeEmbed from '@/components/tools/YouTubeEmbed';

// ── Extracted components ──
import { DOMAIN_COLORS } from '@/components/tools/tool-tokens';
import { ToolHeader, ToolContextBar, ProtocolContextStrip, StickyBottomBar } from '@/components/tools/ToolChrome';
import { CompletionScreen } from '@/components/tools/CompletionScreen';
import { PracticeRenderer } from '@/components/tools/renderers/PracticeRenderer';
import { TestRenderer } from '@/components/tools/renderers/TestRenderer';
import { WorkshopRenderer } from '@/components/tools/renderers/WorkshopRenderer';
import { TrackerRenderer } from '@/components/tools/renderers/TrackerRenderer';
import { ProtocolRenderer } from '@/components/tools/renderers/ProtocolRenderer';

/* ════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════ */
export default function ToolPage() {
    const router = useRouter();
    const { type, id } = router.query as { type?: string; id?: string };

    const [completed, setCompleted] = useState(false);

    const ctx = useMemo(() => {
        if (!id || !type || typeof window === 'undefined') return null;
        const content = getToolContent(id);
        const plan    = getActiveCarePlan();
        const planId  = plan ? getPlanId(plan.createdAt) : 'no-plan';
        const idDomain = id.split('_')[0];
        const domainId = (['jasadi','nafsi','fikri','ruhi'].includes(idDomain) ? idDomain : plan?.routing.primary_domain) ?? 'jasadi';
        const subdomain = plan?.routing.primary_subdomain ?? '';
        const colors  = DOMAIN_COLORS[domainId] ?? DOMAIN_COLORS.jasadi;
        const hasCheckinToday = plan
            ? hasTodayOutcome(planId, getProtocolDay(plan))
            : false;
        return { content, plan, planId, domainId, subdomain, colors, hasCheckinToday };
    }, [id, type]);

    // Mark tool opened + fire tool_page_viewed
    useEffect(() => {
        if (!id) return;
        markToolOpened(id);
        markToolStarted(id);
        trackEvent('tool_page_viewed', { tool_id: id, tool_type: type ?? '' });

        let didComplete = false;
        const handleComplete = () => { didComplete = true; };
        window.addEventListener('tibrah:tool_completed', handleComplete);

        const handleRouteChange = () => {
            if (!didComplete) {
                trackEvent('tool_abandoned', { tool_id: id, tool_type: type ?? '' });
            }
        };
        router.events.on('routeChangeStart', handleRouteChange);
        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
            window.removeEventListener('tibrah:tool_completed', handleComplete);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleComplete = () => {
        haptic.impact();
        if (id) {
            markToolCompleted(id);
            markToolProgressCompleted(id);
            trackEvent('tool_completed', { tool_id: id, tool_type: type ?? '' });
            trackEvent('protocol_day_completed', { tool_id: id, tool_type: type ?? '' });
            window.dispatchEvent(new Event('tibrah:tool_completed'));
        }
        setCompleted(true);
    };

    const handleSaveExit = useCallback(() => {
        if (id) {
            saveToolProgress(id, { status: 'in_progress' });
            trackEvent('tool_saved_exit', { tool_id: id, tool_type: type ?? '' });
        }
        router.back();
    }, [id, type, router]);

    // ── Next tool computation (Sprint F — Phase 4) ──
    // MUST BE BEFORE EARLY RETURNS to prevent "Rendered fewer hooks" crash on route pop
    const nextTool = useMemo(() => {
        if (!id) return null;
        const plan = getActiveCarePlan();
        if (!plan) return null;
        const completedIds = plan.toolsCompleted ?? [];
        const withCurrent = completedIds.includes(id) ? completedIds : [...completedIds, id];
        return getNextTool(plan.routing.recommended_tools, withCurrent);
    }, [id]);

    // ── Loading / Invalid ──
    if (!ctx || !id || !type) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
                <p className="text-slate-400 text-sm">جارٍ التحميل...</p>
            </div>
        );
    }

    // ── No content ──
    if (!ctx.content) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center" dir="rtl">
                <p className="text-[32px] mb-4">🚧</p>
                <p className="text-slate-700 text-[17px] font-black mb-2">هذه الأداة قيد التطوير</p>
                <p className="text-slate-400 text-[13px] font-medium mb-6">المحتوى سيكون متاحاً قريباً</p>
                <Link href="/my-plan">
                    <span className="text-[13px] font-black" style={{ color: ctx.colors.color }}>← عُد لخطتي</span>
                </Link>
            </div>
        );
    }

    const { content, colors, planId, domainId, subdomain, hasCheckinToday } = ctx;
    const { color, colorAlt } = colors;

    const duration = 'durationMinutes' in content ? (content as any).durationMinutes as number : undefined;
    const rawGoal = ('goal' in content ? (content as any).goal as string : '') ?? '';
    const toolName = rawGoal.length > 0
        ? rawGoal.length > 42 ? rawGoal.slice(0, 40) + '…' : rawGoal
        : ({ practice: 'تمرين الجلسة', test: 'اختبار تقييم', workshop: 'ورشة تعلم', tracker: 'متابعة يومية', protocol: 'بروتوكول' }[content.type] ?? 'الأداة');



    return (
        <div className="min-h-screen bg-slate-50" dir="rtl">
            <ToolHeader
                toolName={toolName}
                toolType={type}
                duration={duration}
                color={color}
                onBack={() => router.back()}
            />

            <div className="pt-4 pb-40">
                <ToolContextBar domainId={domainId} toolType={content.type} color={color} />
                {subdomain && <ProtocolContextStrip subdomain={subdomain} color={color} />}

                <div className="px-5" style={{ lineHeight: '1.8' }}>
                    <AnimatePresence mode="wait">
                        {completed ? (
                            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <CompletionScreen
                                    toolName={toolName}
                                    color={color}
                                    colorAlt={colorAlt}
                                    hasCheckinToday={hasCheckinToday}
                                    toolId={id}
                                />
                                {nextTool && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-4 p-4 rounded-[18px]"
                                        style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                                        <p className="text-[10px] text-slate-400 font-bold mb-2">الخطوة التالية في مسارك</p>
                                        <Link href={`/tools/${nextTool.type}/${nextTool.id}`}>
                                            <motion.div whileTap={{ scale: 0.97 }}
                                                className="flex items-center gap-3 p-3 rounded-[14px]"
                                                style={{ background: `${color}12`, border: `1px solid ${color}22` }}>
                                                <span className="text-[18px]">{nextTool.badgeEmoji}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-black text-slate-700 truncate">{nextTool.badgeAr}</p>
                                                    <p className="text-[9px] text-slate-400 font-medium">{nextTool.type}</p>
                                                </div>
                                                <span className="text-[10px] font-black" style={{ color }}>التالي ←</span>
                                            </motion.div>
                                        </Link>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="active"
                                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }}>

                                {'goal' in content && (
                                    <div className="mb-4 px-3 py-2.5 rounded-[14px]"
                                        style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                                        <p className="text-[13px] text-slate-600 font-medium" style={{ lineHeight: '1.8' }}>
                                            {(content as any).goal}
                                        </p>
                                    </div>
                                )}

                                {content.type === 'workshop' && (content as WorkshopContent).heroVideoId && (
                                    <YouTubeEmbed
                                        videoId={(content as WorkshopContent).heroVideoId!}
                                        title={(content as WorkshopContent).heroVideoTitle}
                                        color={color}
                                    />
                                )}

                                {content.type === 'practice' && (
                                    <PracticeRenderer content={content} color={color} onComplete={handleComplete} />
                                )}
                                {content.type === 'test' && (
                                    <TestRenderer content={content} color={color} onComplete={handleComplete} />
                                )}
                                {content.type === 'workshop' && (
                                    <WorkshopRenderer content={content} color={color} onComplete={handleComplete} />
                                )}
                                {content.type === 'tracker' && (
                                    <TrackerRenderer content={content} color={color} toolId={id} planId={planId} onComplete={handleComplete} />
                                )}
                                {content.type === 'protocol' && (
                                    <ProtocolRenderer content={content} color={color} onComplete={handleComplete} />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {!completed && (
                <StickyBottomBar
                    color={color}
                    primaryLabel={content.type === 'test' ? 'أكمل الاختبار' : content.type === 'protocol' ? 'أنهِ اليوم' : 'أكملت ✓'}
                    primaryAction={handleComplete}
                    showSaveExit={content.type !== 'test'}
                    onSaveExit={handleSaveExit}
                />
            )}
        </div>
    );
}

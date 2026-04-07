// components/home/PatientHome.tsx
// Tibrah — Patient Home Screen (Orchestrator)
// This file is intentionally lean. All rendering lives in sub-components.
// Job: fetch data → hand it to the right component → handle FAB & AI sheet.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, WifiOff, Activity, Zap, HeartPulse, Sparkles } from 'lucide-react';
import { useHealthDashboard }       from '@/hooks/useHealthDashboard';
import { haptic }                   from '@/lib/HapticFeedback';
import AIAnalysisSheet              from '@/components/ai/AIAnalysisSheet';
import { useCloudSync }             from '@/lib/useCloudSync';
import { STAGGER_CONTAINER, STAGGER_ITEM, SPRING_BOUNCY } from '@/lib/tibrah-motion';
import { T }                        from './home-tokens';

// Sub-components (each is its own polished file)
import { HeroCard }      from './HeroCard';
import { SmartInsight }  from './SmartInsight';
import { VitalsStrip }   from './VitalsStrip';
import { QuickActions }  from './QuickActions';
import { CareAccordion } from './CareAccordion';
import { ShopStrip }     from './ShopStrip';

/* ── Section label ── */
function SL({
    label, icon: Icon, color = T.primary, href, action,
}: {
    label:  string;
    icon:   React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color?: string;
    href?:  string;
    action?: string;
}) {
    return (
        <motion.div variants={STAGGER_ITEM} className="px-5 flex items-center gap-2">
            <div className="w-5 h-5 rounded-[7px] flex items-center justify-center"
                style={{ background: `${color}13` }}>
                <Icon className="w-3 h-3" style={{ color }} />
            </div>
            <span className="text-[10.5px] font-extrabold uppercase tracking-[0.1em]"
                style={{ color: `${color}90` }}>
                {label}
            </span>
            <div className="flex-1 h-px"
                style={{ background: `linear-gradient(to left, transparent, ${color}15)` }} />
            {href && action && (
                <Link href={href} onClick={() => haptic.selection()}
                    className="text-[11px] font-bold" style={{ color }}>
                    {action}
                </Link>
            )}
        </motion.div>
    );
}

/* ── Loading skeleton ── */
function LoadingSkeleton() {
    return (
        <div className="flex flex-col gap-4 pb-24 px-4 pt-2">
            {/* Hero placeholder */}
            <div className="h-[460px] rounded-[32px] bg-slate-100/70 animate-pulse" />
            {/* Vitals placeholders */}
            <div className="flex gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex-1 h-24 rounded-[22px] bg-slate-100/70 animate-pulse"
                        style={{ animationDelay: `${i * 80}ms` }} />
                ))}
            </div>
            {/* Actions grid */}
            <div className="grid grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-20 rounded-[18px] bg-slate-100/70 animate-pulse"
                        style={{ animationDelay: `${i * 50}ms` }} />
                ))}
            </div>
        </div>
    );
}

/* ── Floating action button ── */
function FAB({ show }: { show: boolean }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.4, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.4, y: 24 }}
                    transition={SPRING_BOUNCY}
                    className="fixed bottom-24 left-4 z-50"
                >
                    <Link href="/quick-check-in" onClick={() => haptic.impact()}>
                        <motion.div
                            whileTap={{ scale: 0.88 }}
                            // Breathing ring pulse
                            animate={{
                                boxShadow: [
                                    '0 0 0 0px rgba(99,102,241,0.45)',
                                    '0 0 0 14px rgba(99,102,241,0)',
                                    '0 0 0 0px rgba(99,102,241,0)',
                                ],
                            }}
                            transition={{ duration: 2.6, repeat: Infinity }}
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                boxShadow: '0 8px 28px rgba(99,102,241,0.42)',
                            }}
                        >
                            <Plus className="w-6 h-6 text-white" />
                        </motion.div>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════ */
export default function PatientHome() {
    const dashboard = useHealthDashboard();
    const { isOnline } = useCloudSync();
    const [aiOpen, setAiOpen]       = useState(false);
    const [showFAB, setShowFAB]     = useState(false);

    // Show FAB after 5 s if patient hasn't logged today
    useEffect(() => {
        if (!dashboard.loading && !dashboard.hasLoggedToday) {
            const t = setTimeout(() => setShowFAB(true), 5000);
            return () => clearTimeout(t);
        }
    }, [dashboard.loading, dashboard.hasLoggedToday]);

    if (dashboard.loading) return <LoadingSkeleton />;

    return (
        <>
            <motion.div
                className="flex flex-col gap-4 pb-28 pt-2"
                initial="hidden"
                animate="show"
                variants={STAGGER_CONTAINER}
            >

                {/* ── Offline banner ── */}
                <AnimatePresence>
                    {!isOnline && (
                        <motion.div variants={STAGGER_ITEM} className="mx-4">
                            <div className="flex items-center gap-2 py-2 px-4 rounded-full"
                                style={{
                                    background: 'rgba(245,158,11,0.08)',
                                    border:     '1px solid rgba(245,158,11,0.2)',
                                }}>
                                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[11.5px] font-semibold text-amber-700 dark:text-amber-400">
                                    وضع الأوفلاين — بياناتك محفوظة محلياً
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 1. Hero Health Score */}
                <HeroCard dashboard={dashboard} onAIOpen={() => setAiOpen(true)} />

                {/* 2. Smart Insight (drag to cycle) */}
                <SmartInsight dashboard={dashboard} />

                {/* 3. Vitals Strip */}
                <SL label="مؤشراتك الفورية" icon={Activity} color="#0d9488"
                    href="/health-tracker" action="السجل" />
                <VitalsStrip dashboard={dashboard} />

                {/* 4. Quick Actions */}
                <SL label="إجراءات سريعة" icon={Zap} color="#6366f1" />
                <QuickActions onAIOpen={() => setAiOpen(true)} dashboard={dashboard} />

                {/* 5. Care & Journey */}
                <SL label="رعايتي ورحلتي" icon={HeartPulse} color="#0d9488" />
                <CareAccordion dashboard={dashboard} />

                {/* 6. Shop & Library */}
                <SL label="المتجر والمكتبة" icon={Sparkles} color="#7c3aed"
                    href="/shop" action="تصفح" />
                <ShopStrip />

            </motion.div>

            {/* Global overlays */}
            <FAB show={showFAB} />
            <AIAnalysisSheet
                isOpen={aiOpen}
                onClose={() => setAiOpen(false)}
                dashboard={dashboard}
            />
        </>
    );
}

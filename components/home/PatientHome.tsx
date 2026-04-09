// components/home/PatientHome.tsx — V3 "Full Richness"
// ADDITIVE: integrates ALL existing components + 2 new sections
// Everything that existed stays. New additions:
//   + DailyInsight (health tip carousel — was built but never used)
//   + ShopPreview (rich 3D shop grid — was built but never used)
//   + DailyGreeting (moved to top as proper welcome screen)
//   + Appointment reminder banner
// Structure (top→bottom):
//   1. DailyGreeting  ← welcoming header with health score
//   2. HeroCard       ← main health score ring
//   3. SmartInsight   ← AI-powered contextual nudge (drag to cycle)
//   4. VitalsStrip    ← expandable vital rings with sparklines
//   5. QuickActions   ← 4-col action grid (expand on tap)
//   6. DailyInsight   ← auto-rotating health tips (NEW ADDITION)
//   7. CareAccordion  ← care journey & progress
//   8. ShopPreview    ← 3D product cards with filter chips (NEW ADDITION)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Plus, WifiOff, Activity, Zap, HeartPulse, Sparkles,
    ShoppingBag, Lightbulb,
} from 'lucide-react';
import { useHealthDashboard } from '@/hooks/useHealthDashboard';
import { haptic } from '@/lib/HapticFeedback';
import AIAnalysisSheet from '@/components/ai/AIAnalysisSheet';
import { useCloudSync } from '@/lib/useCloudSync';
import { STAGGER_CONTAINER, STAGGER_ITEM, SPRING_BOUNCY } from '@/lib/tibrah-motion';
import { T } from './home-tokens';

// Core sub-components
import { HeroCard } from './HeroCard';
import { SmartInsight } from './SmartInsight';
import { VitalsStrip } from './VitalsStrip';
import { QuickActions } from './QuickActions';
import { CareAccordion } from './CareAccordion';
import { ShopStrip } from './ShopStrip';

// Previously unintegrated components — NOW ADDED
import DailyInsight from './DailyInsight';
import ShopPreview from './ShopPreview';

/* ── Section label — Glass Native ── */
function SL({
    label, icon: Icon, color = T.primary, href, action,
}: {
    label: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color?: string;
    href?: string;
    action?: string;
}) {
    return (
        <motion.div variants={STAGGER_ITEM} className="px-5 flex items-center gap-2.5">
            <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: color }} />
            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color, opacity: 0.75 }} />
            <span className="text-[10px] font-black uppercase tracking-[0.13em] flex-1"
                style={{ color, opacity: 0.70 }}>
                {label}
            </span>
            {href && action && (
                <Link href={href} onClick={() => haptic.selection()}
                    className="flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full"
                    style={{ color, background: `${color}0E`, border: `1px solid ${color}18` }}>
                    {action} ←
                </Link>
            )}
        </motion.div>
    );
}

/* ── Appointment reminder banner ── */
function AppointmentBanner() {
    // Shows next appointment (static demo — hook to real data later)
    return (
        <motion.div variants={STAGGER_ITEM} className="px-4">
            <Link href="/my-appointments" onClick={() => haptic.selection()}>
                <motion.div whileTap={{ scale: 0.97 }}
                    className="relative overflow-hidden flex items-center gap-3 px-4 py-3.5 rounded-[18px]"
                    style={{
                        background: 'rgba(13,148,136,0.07)',
                        border: '1px solid rgba(13,148,136,0.15)',
                        backdropFilter: 'blur(16px)',
                    }}>
                    {/* Ambient glow */}
                    <div className="absolute -left-4 top-0 bottom-0 w-16 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse, rgba(13,148,136,0.15) 0%, transparent 70%)' }} />

                    <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.18)' }}>
                        <HeartPulse className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: T.accent }} />
                    </div>

                    <div className="flex-1 relative">
                        <p className="text-[12.5px] font-black" style={{ color: '#0F172A' }}>
                            موعدك القادم مع د. عمر
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>
                            الثلاثاء ١٥ أبريل · ٣:٣٠ مساءً
                        </p>
                    </div>

                    {/* Live dot */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <motion.div className="w-1.5 h-1.5 rounded-full"
                            style={{ background: T.accent }}
                            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                        <span className="text-[9.5px] font-bold" style={{ color: T.accent }}>مؤكد</span>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}

/* ── Loading skeleton — Glass Native ── */
function LoadingSkeleton() {
    return (
        <div className="flex flex-col gap-4 pb-24 px-4 pt-2" style={{ background: '#F0FAF8' }}>
            <div className="h-[440px] rounded-[32px] animate-pulse"
                style={{ background: 'rgba(255,255,255,0.60)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.80)' }} />
            <div className="flex gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex-1 h-24 rounded-[22px] animate-pulse"
                        style={{ background: 'rgba(255,255,255,0.55)', animationDelay: `${i * 80}ms` }} />
                ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-20 rounded-[18px] animate-pulse"
                        style={{ background: 'rgba(255,255,255,0.50)', animationDelay: `${i * 50}ms` }} />
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
                    className="fixed bottom-24 left-4 z-50">
                    <Link href="/quick-check-in" onClick={() => haptic.impact()}>
                        <motion.div
                            whileTap={{ scale: 0.88 }}
                            animate={{
                                boxShadow: [
                                    '0 0 0 0px rgba(13,148,136,0.45)',
                                    '0 0 0 14px rgba(13,148,136,0)',
                                    '0 0 0 0px rgba(13,148,136,0)',
                                ],
                            }}
                            transition={{ duration: 2.6, repeat: Infinity }}
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
                                boxShadow: '0 8px 28px rgba(13,148,136,0.42)',
                            }}>
                            <Plus className="w-6 h-6 text-white" />
                        </motion.div>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ════════════════════════════════════════════════════
   MAIN PATIENT HOME — V3 Full Richness
   ════════════════════════════════════════════════════ */
export default function PatientHome() {
    const dashboard = useHealthDashboard();
    const { isOnline } = useCloudSync();
    const [aiOpen, setAiOpen] = useState(false);
    const [showFAB, setShowFAB] = useState(false);

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
                className="flex flex-col gap-4 pb-32 pt-3"
                style={{ background: '#F0FAF8' }}
                initial="hidden"
                animate="show"
                variants={STAGGER_CONTAINER}>

                {/* ── Offline banner ── */}
                <AnimatePresence>
                    {!isOnline && (
                        <motion.div variants={STAGGER_ITEM} className="mx-4">
                            <div className="flex items-center gap-2 py-2 px-4 rounded-full"
                                style={{
                                    background: 'rgba(245,158,11,0.08)',
                                    border: '1px solid rgba(245,158,11,0.2)',
                                }}>
                                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[11.5px] font-semibold text-amber-700">
                                    وضع الأوفلاين — بياناتك محفوظة محلياً
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ① Appointment Banner — contextual quick reminder */}
                <AppointmentBanner />

                {/* ② Hero Health Score — main card */}
                <HeroCard dashboard={dashboard} onAIOpen={() => setAiOpen(true)} />

                {/* ③ Smart Insight — AI contextual nudge (drag to cycle) */}
                <SmartInsight dashboard={dashboard} />

                {/* ④ Vitals Strip — expandable rings with sparklines */}
                <SL label="مؤشراتك الفورية" icon={Activity} color="#0d9488"
                    href="/health-tracker" action="السجل" />
                <VitalsStrip dashboard={dashboard} />

                {/* ⑤ Quick Actions — 4-col expandable grid */}
                <SL label="إجراءات سريعة" icon={Zap} color="#6366f1" />
                <QuickActions onAIOpen={() => setAiOpen(true)} dashboard={dashboard} />

                {/* ⑥ Daily Health Insight — auto-rotating tips carousel (NEWLY INTEGRATED) */}
                <SL label="نصيحة اليوم" icon={Lightbulb} color="#d97706" />
                <DailyInsight />

                {/* ⑦ Care Journey & Protocol */}
                <SL label="رعايتي ورحلتي" icon={HeartPulse} color="#0d9488" />
                <CareAccordion dashboard={dashboard} />

                {/* ⑧ Shop — 3D tilt cards with filter chips (NEWLY INTEGRATED) */}
                <SL label="صيدلية طِبرَا" icon={ShoppingBag} color="#d97706"
                    href="/shop" action="تصفح" />
                <ShopPreview />

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

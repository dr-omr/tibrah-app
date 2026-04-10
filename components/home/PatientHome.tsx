/**
 * PatientHome.tsx — طِبرَا Domain-First Home (Orchestrator)
 * ──────────────────────────────────────────────────────────
 * مُنسّق بسيط — كل منطق حقيقي في ملفاته المخصصة:
 *
 *   domain-data.ts       ← بيانات الأقسام الخمسة
 *   GreetingHeader.tsx   ← الهيدر السينمائي
 *   AppointmentBanner.tsx← تذكير الموعد
 *   DomainGrid.tsx       ← الشبكة الزجاجية المائية
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, WifiOff } from 'lucide-react';
import { useHealthDashboard } from '@/hooks/useHealthDashboard';
import { haptic } from '@/lib/HapticFeedback';
import AIAnalysisSheet from '@/components/ai/AIAnalysisSheet';
import { useCloudSync } from '@/lib/useCloudSync';
import { STAGGER_CONTAINER, STAGGER_ITEM, SPRING_BOUNCY } from '@/lib/tibrah-motion';

import GreetingHeader    from './GreetingHeader';
import AppointmentBanner from './AppointmentBanner';
import DomainGrid        from './DomainGrid';

/* ── Loading skeleton ─────────────────────────── */
function LoadingSkeleton() {
    // Row heights: [جسدي tall, نفسي], [فكري, روحي tall], [أخرى full]
    const gridItems = [
        { h: 228, full: false }, { h: 196, full: false },
        { h: 196, full: false }, { h: 228, full: false },
        { h: 132, full: true  },
    ];
    return (
        <div className="flex flex-col gap-4 pb-28 pt-4">
            {/* Greeting header skeleton */}
            <div className="mx-4 h-[300px] rounded-[32px] animate-pulse"
                style={{ background: 'linear-gradient(160deg, rgba(7,33,31,0.60), rgba(13,61,56,0.50))', animationDelay: '0ms' }} />
            {/* Appointment banner skeleton */}
            <div className="mx-4 h-[60px] rounded-[22px] animate-pulse"
                style={{ background: 'rgba(255,255,255,0.55)', animationDelay: '80ms' }} />
            {/* Domain grid skeleton */}
            <div className="mx-4 flex flex-col gap-3">
                <div className="h-3 w-36 rounded-full animate-pulse"
                    style={{ background: 'rgba(0,0,0,0.06)', animationDelay: '120ms' }} />
                <div className="grid gap-2.5" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {gridItems.map((item, i) => (
                        <div
                            key={i}
                            className={`rounded-[28px] animate-pulse ${item.full ? 'col-span-2' : ''}`}
                            style={{
                                height: item.h,
                                background: 'rgba(255,255,255,0.64)',
                                animationDelay: `${140 + i * 55}ms`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── FAB (Floating Action) ────────────────────── */
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
                                boxShadow: '0 8px 28px rgba(13,148,136,0.40)',
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

/* ════════════════════════════════════════════════
   MAIN EXPORT — PatientHome
════════════════════════════════════════════════ */
export default function PatientHome() {
    const dashboard = useHealthDashboard();
    const { isOnline } = useCloudSync();
    const [aiOpen,  setAiOpen]  = useState(false);
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
            {/* ── Page background: multi-aurora canvas ── */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(175deg, #E2F5F3 0%, #EBF0FF 40%, #F5EEFF 72%, #F0FDF6 100%)',
                }}
            />
            {/* Aurora orb 1 — teal top-right */}
            <div className="fixed -top-10 -right-10 w-80 h-80 rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.08), transparent 68%)' }} />
            {/* Aurora orb 2 — indigo bottom-left */}
            <div className="fixed bottom-24 -left-16 w-72 h-72 rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.07), transparent 68%)' }} />
            {/* Aurora orb 3 — amber mid-right */}
            <div className="fixed top-1/2 -right-8 w-56 h-56 rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.05), transparent 68%)' }} />
            {/* Aurora orb 4 — emerald mid-left */}
            <div className="fixed top-1/3 -left-8 w-48 h-48 rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.05), transparent 68%)' }} />

            {/* ── Scroll container ── */}
            <motion.div
                className="relative z-10 flex flex-col gap-4 pb-32 pt-3"
                initial="hidden"
                animate="show"
                variants={STAGGER_CONTAINER}
            >
                {/* Offline banner */}
                <AnimatePresence>
                    {!isOnline && (
                        <motion.div variants={STAGGER_ITEM} className="mx-4">
                            <div className="flex items-center gap-2.5 py-2.5 px-4 rounded-[16px]"
                                style={{
                                    background: 'linear-gradient(150deg, rgba(245,158,11,0.10), rgba(255,255,255,0.75) 60%)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(245,158,11,0.20)',
                                    borderTop: '1px solid rgba(255,255,255,0.80)',
                                    boxShadow: '0 1.5px 0 rgba(255,255,255,0.90) inset, 0 4px 14px rgba(245,158,11,0.08)',
                                }}>
                                <WifiOff className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                <span className="text-[11.5px] font-bold text-amber-700">
                                    وضع الأوفلاين — بياناتك محفوظة محلياً
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ① Cinematic greeting */}
                <GreetingHeader onAIOpen={() => setAiOpen(true)} />

                {/* ② Appointment reminder */}
                <AppointmentBanner />

                {/* ③ The 5 Domains — Liquid Glass Bento Grid */}
                <DomainGrid />

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

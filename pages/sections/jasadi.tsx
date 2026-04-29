'use client';
/**
 * pages/sections/jasadi.tsx — نظام جسدي: محطة الرحلة العلاجية
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Journey Hub Architecture:
 *
 *  ① HeroHeader          — صورة الطبيب + glass
 *  ② CrossDomainBar      — تنقل بين الأقسام
 *  ③ SectionStatusBar    — حالة المسار الحالي أو CTA للتقييم
 *  ④ PhysicalDashboard   — لوحة Health Score + مؤشرات حية
 *  ⑤ StartNowZone        — أهم أدوات البدء (3 حالات)
 *  ⑥ SubdomainRail       — شريط المسارات الفرعية (filter)
 *  ⑦ TodayBlock          — مهام اليوم الذكية
 *  ⑧ SmartInsightCard    — توصية ذكية اليوم
 *  ⑨ Subsections         — الوحدات العلاجية (مع filter)
 *  ⑩ EscalationCard      — متى تحتاج الطبيب؟
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Activity, Droplets, Moon, Heart, Zap, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { JASADI } from '@/components/sections/section-tokens';
import { SectionAuthGate }  from '@/components/sections/SectionAuthGate';
import { CrossDomainBar }   from '@/components/sections/CrossDomainBar';
import { JasadiHeroHeader } from '@/components/sections/jasadi';
import { SmartInsightCard } from '@/components/sections/shared/SmartInsightCard';
import { haptic } from '@/lib/HapticFeedback';
import { getActiveCarePlan } from '@/lib/care-plan-store';
import { getSubdomains, SUBDOMAIN_BY_ID } from '@/lib/domain-routing-map';
import type { SubdomainId } from '@/components/health-engine/types';
import { SectionSkeleton } from '@/components/sections/shared/SectionSkeleton';

// Journey components
import { SectionStatusBar } from '@/components/sections/shared/SectionStatusBar';
import { SubdomainRail }    from '@/components/sections/shared/SubdomainRail';
import { StartNowZone }     from '@/components/sections/shared/StartNowZone';
import { TodayBlock }       from '@/components/sections/shared/TodayBlock';
import { EscalationCard }   from '@/components/sections/shared/EscalationCard';

// Existing subsection components
import {
    JasadiDiagnosis, JasadiPrograms,
    JasadiTools, JasadiLibrary, JasadiCourses,
} from '@/components/sections/jasadi';

const C  = '#0D9488';
const CA = '#059669';

/* ─── Health vitals (demo data) ────────────────── */
const VITALS = [
    { icon: Heart,     value: '72',   unit: 'bpm',  label: 'القلب',   color: '#EF4444' },
    { icon: Droplets,  value: '1.8',  unit: 'L',    label: 'الماء',   color: '#06B6D4' },
    { icon: Moon,      value: '6.5',  unit: 'h',    label: 'النوم',   color: '#4338CA' },
    { icon: Activity,  value: '4.2k', unit: 'خطوة', label: 'الحركة', color: C },
];

const SCORE = 74; // Health score out of 100

/* ─── Physical Dashboard ─────────────────────── */
function PhysicalDashboard() {
    const dashStroke = 2 * Math.PI * 36; // circumference for r=36
    const offset = dashStroke * (1 - SCORE / 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.05 }}
            className="mx-4 mb-4 relative overflow-hidden rounded-[26px] p-5"
            style={{
                background: [
                    'linear-gradient(148deg,',
                    '  rgba(255,255,255,0.94) 0%,',
                    '  rgba(255,255,255,0.86) 55%,',
                    `  ${C}0E 100%`,
                    ')',
                ].join(''),
                border: '1px solid rgba(255,255,255,0.82)',
                borderTop: '1px solid rgba(255,255,255,0.97)',
                backdropFilter: 'blur(40px) saturate(2)',
                WebkitBackdropFilter: 'blur(40px) saturate(2)',
                boxShadow: [
                    '0 2px 0 rgba(255,255,255,0.96) inset',
                    `0 16px 48px ${C}16`,
                    '0 4px 16px rgba(0,0,0,0.06)',
                ].join(', '),
            }}
        >
            {/* Color pool */}
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${C}16, transparent 70%)`, filter: 'blur(12px)' }} />
            {/* Shimmer */}
            <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.30) 48%, transparent 68%)' }}
                animate={{ x: ['-140%', '140%'] }} transition={{ duration: 5, repeat: Infinity, repeatDelay: 7, ease: 'easeInOut' }} />

            <div className="relative z-10 flex items-start gap-5">
                {/* Score ring */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="relative">
                        <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
                            {/* Track */}
                            <circle cx="44" cy="44" r="36" fill="none" stroke={`${C}16`} strokeWidth="7" />
                            {/* Progress */}
                            <motion.circle
                                cx="44" cy="44" r="36" fill="none"
                                stroke={`url(#healthGrad)`} strokeWidth="7"
                                strokeLinecap="round"
                                strokeDasharray={dashStroke}
                                initial={{ strokeDashoffset: dashStroke }}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                            />
                            <defs>
                                <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor={C} /><stop offset="100%" stopColor={CA} />
                                </linearGradient>
                            </defs>
                        </svg>
                        {/* Score text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span className="text-[24px] font-black leading-none"
                                style={{ color: C }}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                                {SCORE}
                            </motion.span>
                            <span className="text-[8px] font-bold text-slate-400">/ 100</span>
                        </div>
                    </div>
                    <p className="text-[9px] font-black text-slate-500">درجة الصحة</p>
                </div>

                {/* Vitals grid */}
                <div className="flex-1 grid grid-cols-2 gap-2">
                    {VITALS.map((v) => (
                        <motion.div key={v.label}
                            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28, delay: 0.12 }}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-[14px]"
                            style={{ background: `${v.color}0E`, border: `1px solid ${v.color}1A` }}>
                            <v.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: v.color }} />
                            <div className="min-w-0">
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-[13px] font-black leading-none" style={{ color: v.color }}>{v.value}</span>
                                    <span className="text-[7.5px] font-bold text-slate-400">{v.unit}</span>
                                </div>
                                <p className="text-[8px] text-slate-400 font-medium">{v.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer status */}
            <div className="relative z-10 mt-3.5 pt-3 flex items-center gap-2"
                style={{ borderTop: `1px solid ${C}14` }}>
                <motion.div className="w-2 h-2 rounded-full" style={{ background: C }}
                    animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
                <span className="text-[9px] font-bold text-slate-500 flex-1">آخر قراءة: اليوم ١١:٣٢ ص</span>
                <Link href="/record-health" onClick={() => haptic.tap()}>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                        style={{ background: `${C}12`, border: `1px solid ${C}20` }}>
                        <Zap className="w-2.5 h-2.5" style={{ color: C }} />
                        <span className="text-[8.5px] font-black" style={{ color: C }}>سجّل الآن</span>
                    </div>
                </Link>
            </div>
        </motion.div>
    );
}

/* ─── Smart Insight ──────────────────────────── */
const DAILY_INSIGHT = {
    label: 'توصية الذكاء الاصطناعي',
    title: 'نومك أقل من المستهدف بساعة',
    body: 'بناءً على قراءاتك الأخيرة، نومك المتوسط ٦.٥ ساعة. يُنصح بـ ٧.٥-٨ ساعة لمستوى طاقتك.',
    cta: 'برنامج النوم العلاجي',
    href: '/programs/sleep',
    emoji: '🌙',
    urgency: 'high' as const,
};

/* ─── StartNow default items ─────────────────── */
const START_NOW_ITEMS = [
    { emoji: '🩺', label: 'مدقق الأعراض', sub: 'تشخيص سريري ذكي', href: '/symptom-checker', pulse: true },
    { emoji: '📋', label: 'الفحص السريع', sub: 'كيف تشعر الآن؟', href: '/quick-check-in' },
    { emoji: '🗺️', label: 'خريطة الجسم', sub: 'حدد موقع الألم', href: '/body-map' },
    { emoji: '📝', label: 'الاستبيان الأولي', sub: 'تاريخ مرضي كامل', href: '/intake' },
];

/* ─── Escalation hints ───────────────────────── */
const JASADI_ESCALATION = [
    'الأعراض لم تتحسن بعد ٧ أيام',
    'ألم شديد أو حاد لا يخف',
    'حرارة مرتفعة مستمرة',
    'فقدان وزن غير مبرر',
];

/* ═════════════════════════════════════════════
   FILTERED SUBSECTIONS — shows only subdomain-relevant items
═════════════════════════════════════════════ */
function FilteredSubsections({ activeSubdomain }: { activeSubdomain: SubdomainId | null }) {
    if (!activeSubdomain) {
        // Show all sections normally
        return (
            <>
                <JasadiDiagnosis />
                <JasadiPrograms />
                <JasadiTools />
                <JasadiLibrary />
                <JasadiCourses />
            </>
        );
    }

    // When a subdomain is active, show its tools from routing map
    const sub = SUBDOMAIN_BY_ID[activeSubdomain];
    if (!sub) return null;

    return (
        <motion.div
            key={activeSubdomain}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
            {/* Subdomain header */}
            <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-[16px]">{sub.emoji}</span>
                <div>
                    <p className="text-[13px] font-black text-slate-700">{sub.arabicName}</p>
                    <p className="text-[9px] text-slate-400">{sub.description}</p>
                </div>
            </div>

            {/* Tools grid */}
            <div className="grid grid-cols-2 gap-2.5">
                {sub.tools.map((tool, i) => (
                    <Link key={tool.id} href={tool.href} onClick={() => haptic.tap()}>
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileTap={{ scale: 0.95 }}
                            className="rounded-[16px] p-3 relative overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.85)',
                                border: '1px solid rgba(226,232,240,0.5)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}
                        >
                            <span className="text-[18px] block mb-1.5">{tool.emoji}</span>
                            <p className="text-[10px] font-black text-slate-700 leading-tight mb-0.5">{tool.arabicName}</p>
                            <p className="text-[8px] text-slate-400 leading-snug">{tool.description}</p>
                            <div className="flex items-center gap-1 mt-2">
                                <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded-full"
                                    style={{
                                        background: tool.type === 'test' ? `${C}14`
                                            : tool.type === 'protocol' ? '#F59E0B14'
                                            : tool.type === 'practice' ? '#06B6D414'
                                            : tool.type === 'tracker' ? '#8B5CF614'
                                            : '#64748B14',
                                        color: tool.type === 'test' ? C
                                            : tool.type === 'protocol' ? '#F59E0B'
                                            : tool.type === 'practice' ? '#06B6D4'
                                            : tool.type === 'tracker' ? '#8B5CF6'
                                            : '#64748B',
                                    }}>
                                    {tool.type === 'test' ? 'اختبار'
                                        : tool.type === 'protocol' ? 'بروتوكول'
                                        : tool.type === 'practice' ? 'تطبيق'
                                        : tool.type === 'tracker' ? 'متابعة'
                                        : 'ورشة'}
                                </span>
                                {tool.durationMinutes > 0 && (
                                    <span className="text-[7px] text-slate-300">{tool.durationMinutes} د</span>
                                )}
                                {!tool.isFree && (
                                    <span className="text-[7px] font-bold text-amber-400 mr-auto">👑</span>
                                )}
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Show all sections below filtered view */}
            <div className="mt-6">
                <div className="flex items-center gap-3 px-1 mb-4">
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${C}25)` }} />
                    <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
                        كل أدوات جسدي
                    </p>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${C}25)` }} />
                </div>
                <JasadiDiagnosis />
                <JasadiPrograms />
                <JasadiTools />
                <JasadiLibrary />
                <JasadiCourses />
            </div>
        </motion.div>
    );
}

/* ═════════════════════════════════════════════
   PAGE — Journey Hub
═════════════════════════════════════════════ */
export default function JasadiPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Subdomain filter state
    const [activeSubdomain, setActiveSubdomain] = useState<SubdomainId | null>(null);

    // Get recommended subdomain from plan
    const recommendedSubdomain = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const plan = getActiveCarePlan();
        if (!plan) return null;
        if (plan.routing.primary_domain === 'jasadi') return plan.routing.primary_subdomain;
        if (plan.routing.secondary_domain === 'jasadi') return plan.routing.secondary_subdomain;
        return null;
    }, []);

    const handleSubdomainSelect = useCallback((id: SubdomainId | null) => {
        setActiveSubdomain(id);
    }, []);

    if (loading) return <SectionSkeleton color="#0D9488" bg="linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #F0FAFB 88%)" />;
    if (!user) return <SectionAuthGate section={JASADI} />;

    return (
        <div className="relative min-h-screen pb-28 overflow-hidden">
            {/* Aurora BG */}
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{ background: 'linear-gradient(182deg, rgba(13,148,136,0.08) 0%, #EEF9F8 40%, #F0FDF4 80%, rgba(5,150,105,0.04) 100%)' }} />
            <motion.div animate={{ scale: [1, 1.10, 1], opacity: [0.40, 0.65, 0.40] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="fixed -top-20 -right-20 w-72 h-72 rounded-full z-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.22), transparent 70%)', filter: 'blur(28px)' }} />
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3.5 }}
                className="fixed bottom-20 -left-16 w-60 h-60 rounded-full z-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.18), transparent 70%)', filter: 'blur(22px)' }} />

            <div className="relative z-10">
                {/* ① Hero */}
                <JasadiHeroHeader section={JASADI} onBack={() => router.back()} />

                {/* ② Cross-domain nav */}
                <div style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.75)', boxShadow: '0 1px 0 rgba(255,255,255,0.90) inset' }}>
                    <CrossDomainBar currentSlug="jasadi" />
                </div>

                {/* ③ Status Bar — مسارك الحالي أو CTA */}
                <div className="pt-4">
                    <SectionStatusBar
                        domainId="jasadi"
                        color={C}
                        colorAlt={CA}
                        assessHref="/symptom-checker"
                        fallbackText="ابدأ تقييمك الجسدي لتحديد مسارك"
                    />
                </div>

                {/* ④ Physical Dashboard */}
                <div>
                    <div className="flex items-center justify-between px-5 mb-3">
                        <p className="text-[11px] font-black text-slate-600 tracking-tight">لوحة صحتك اليوم</p>
                        <Link href="/health-tracker" onClick={() => haptic.tap()}>
                            <div className="flex items-center gap-1" style={{ color: C }}>
                                <span className="text-[9px] font-black">تفاصيل</span>
                                <ArrowLeft className="w-3 h-3" />
                            </div>
                        </Link>
                    </div>
                    <PhysicalDashboard />
                </div>

                {/* ⑤ Start Now Zone — 3 حالات ذكية */}
                <StartNowZone
                    domainId="jasadi"
                    color={C}
                    colorAlt={CA}
                    defaultItems={START_NOW_ITEMS}
                    startHref="/symptom-checker"
                    startLabel="ابدأ التقييم الجسدي"
                />

                {/* ⑥ Subdomain Rail — فلتر المسارات */}
                <SubdomainRail
                    domainId="jasadi"
                    color={C}
                    colorAlt={CA}
                    activeSubdomain={activeSubdomain}
                    recommendedSubdomain={recommendedSubdomain}
                    onSelect={handleSubdomainSelect}
                />

                {/* ⑦ Today Block — مهام اليوم */}
                <TodayBlock
                    domainId="jasadi"
                    color={C}
                    colorAlt={CA}
                    question="ماذا يحتاج جسدك اليوم؟"
                />

                {/* ⑧ Smart Insight */}
                <SmartInsightCard color={C} colorAlt={CA} insight={DAILY_INSIGHT} />

                {/* ⑨ Subsections separator */}
                <div className="flex items-center gap-3 px-5 mb-4">
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${C}30)` }} />
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {activeSubdomain ? 'المسار المحدد + كل الأدوات' : 'الوحدات العلاجية'}
                    </p>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${C}30)` }} />
                </div>

                {/* ⑨ Subsections (filtered or full) */}
                <div className="px-4">
                    <FilteredSubsections activeSubdomain={activeSubdomain} />
                </div>

                {/* ⑩ Escalation Card */}
                <EscalationCard
                    color={C}
                    hints={JASADI_ESCALATION}
                    bookingHref="/book-appointment"
                />

                {/* Footer */}
                <div className="flex flex-col items-center gap-2 pb-8">
                    <div className="w-16 h-[1.5px] rounded-full"
                        style={{ background: `linear-gradient(to right, transparent, ${C}AA, transparent)` }} />
                    <p className="text-[8.5px] font-semibold text-slate-300 tracking-widest uppercase">
                        جسدي · Journey Hub · طِبرَا
                    </p>
                </div>
            </div>
        </div>
    );
}

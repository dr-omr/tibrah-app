'use client';
/**
 * pages/sections/nafsi.tsx — نظام نفسي: محطة الرحلة العلاجية
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Journey Hub Architecture (same pattern as Jasadi pilot)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Heart, Wind, Smile, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NAFSI } from '@/components/sections/section-tokens';
import { SectionAuthGate }  from '@/components/sections/SectionAuthGate';
import { CrossDomainBar }   from '@/components/sections/CrossDomainBar';
import { DomainHeroHeader } from '@/components/sections/shared/DomainHeroHeader';
import { SmartInsightCard } from '@/components/sections/shared/SmartInsightCard';
import { haptic } from '@/lib/HapticFeedback';
import { getActiveCarePlan } from '@/lib/care-plan-store';
import { SUBDOMAIN_BY_ID } from '@/lib/domain-routing-map';
import type { SubdomainId } from '@/components/health-engine/types';
import { SectionSkeleton } from '@/components/sections/shared/SectionSkeleton';

import { SectionStatusBar } from '@/components/sections/shared/SectionStatusBar';
import { SubdomainRail }    from '@/components/sections/shared/SubdomainRail';
import { StartNowZone }     from '@/components/sections/shared/StartNowZone';
import { TodayBlock }       from '@/components/sections/shared/TodayBlock';
import { EscalationCard }   from '@/components/sections/shared/EscalationCard';

import { NafsiDiagnosis, NafsiPrograms, NafsiTools, NafsiLibrary, NafsiCourses } from '@/components/sections/nafsi';

const C  = '#7C3AED';
const CA = '#6D28D9';

/* ─── Emotional dimensions ───────────────────── */
const EMO_DIMS = [
    { label: 'الهدوء',     value: 62, color: '#A78BFA' },
    { label: 'الانتماء',   value: 45, color: '#818CF8' },
    { label: 'الطاقة',     value: 78, color: '#C084FC' },
    { label: 'الوضوح',     value: 38, color: '#7DD3FC' },
];

const TEMP = 6.4;

function EmotionalDashboard() {
    const [refreshed, setRefreshed] = useState(false);
    const gradPercent = ((TEMP - 1) / 9) * 100;
    const indicator = gradPercent;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.05 }}
            className="mx-4 mb-4 relative overflow-hidden rounded-[26px] p-5"
            style={{
                background: `linear-gradient(148deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.86) 55%, ${C}0C 100%)`,
                border: '1px solid rgba(255,255,255,0.82)', borderTop: '1px solid rgba(255,255,255,0.97)',
                backdropFilter: 'blur(40px) saturate(2)', WebkitBackdropFilter: 'blur(40px) saturate(2)',
                boxShadow: `0 2px 0 rgba(255,255,255,0.96) inset, 0 16px 48px ${C}12, 0 4px 16px rgba(0,0,0,0.06)`,
            }}>
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${C}12, transparent 70%)`, filter: 'blur(12px)' }} />
            <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.28) 48%, transparent 68%)' }}
                animate={{ x: ['-140%', '140%'] }} transition={{ duration: 5, repeat: Infinity, repeatDelay: 7, ease: 'easeInOut' }} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Smile className="w-4 h-4" style={{ color: C }} />
                        <p className="text-[11px] font-black text-slate-700">الحرارة العاطفية</p>
                    </div>
                    <motion.button whileTap={{ scale: 0.90, rotate: 180 }}
                        onClick={() => { setRefreshed(r => !r); haptic.tap(); }}
                        className="p-1.5 rounded-full" style={{ background: `${C}10` }}>
                        <RefreshCw className="w-3.5 h-3.5" style={{ color: C }} />
                    </motion.button>
                </div>
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[8.5px] font-bold text-slate-400">محطوط</span>
                        <div className="flex items-baseline gap-1">
                            <motion.span className="text-[26px] font-black leading-none" style={{ color: C }}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                {TEMP.toFixed(1)}
                            </motion.span>
                            <span className="text-[10px] font-bold text-slate-400">/١٠</span>
                        </div>
                        <span className="text-[8.5px] font-bold text-slate-400">ممتاز</span>
                    </div>
                    <div className="relative h-[10px] rounded-full overflow-hidden"
                        style={{ background: 'linear-gradient(to right, #EF444430, #F59E0B30, #10B98130, #06B6D430)' }}>
                        <div className="h-full rounded-full"
                            style={{ width: `${indicator}%`, background: 'linear-gradient(to right, #EF4444, #F59E0B, #10B981, #06B6D4)', transition: 'width 1s ease' }} />
                        <motion.div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
                            style={{ left: `calc(${indicator}% - 10px)`, background: '#fff', boxShadow: `0 2px 8px ${C}40, 0 0 0 2.5px ${C}` }}
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring', stiffness: 500, damping: 28 }} />
                    </div>
                    <p className="text-[9px] text-slate-400 text-center mt-1.5">بخير — الاتزان العاطفي جيد</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {EMO_DIMS.map((d, i) => (
                        <div key={d.label} className="px-3 py-2.5 rounded-[14px] flex items-center gap-2"
                            style={{ background: `${d.color}10`, border: `1px solid ${d.color}1E` }}>
                            <div className="flex-1">
                                <p className="text-[9px] font-black mb-1" style={{ color: d.color }}>{d.label}</p>
                                <div className="h-[5px] rounded-full overflow-hidden" style={{ background: `${d.color}22` }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${d.value}%` }}
                                        transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: 'easeOut' }}
                                        className="h-full rounded-full" style={{ background: d.color }} />
                                </div>
                            </div>
                            <span className="text-[11px] font-black flex-shrink-0" style={{ color: d.color }}>{d.value}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-3.5 pt-3 flex items-center gap-2" style={{ borderTop: `1px solid ${C}12` }}>
                    <motion.div className="w-2 h-2 rounded-full" style={{ background: '#10B981' }}
                        animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
                    <span className="text-[9px] font-bold text-slate-500 flex-1">يُحدَّث يومياً بناءً على تقييماتك</span>
                    <Link href="/emotional-medicine" onClick={() => haptic.tap()}>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                            style={{ background: `${C}12`, border: `1px solid ${C}20` }}>
                            <span className="text-[8.5px] font-black" style={{ color: C }}>تقييم الآن</span>
                        </div>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

const DAILY_INSIGHT = {
    label: 'رؤية نفسية اليوم',
    title: 'اكتشف نمط التعلّق الذي يؤثر في علاقاتك',
    body: 'أنماط التعلّق تحدد ردود أفعالك العاطفية — والخبر الجيد: تستطيع تغييرها.',
    cta: 'ابدأ تقييم التعلّق',
    href: '/assess/attachment',
    emoji: '🔗',
};

const START_NOW_ITEMS = [
    { emoji: '💜', label: 'الطب الشعوري', sub: 'تقييم عاطفي شامل', href: '/emotional-medicine', pulse: true },
    { emoji: '📊', label: 'تقييم القلق', sub: 'GAD-7 سريري', href: '/assess/anxiety' },
    { emoji: '🧘', label: 'تأمل الآن', sub: 'جلسة هدوء فوري', href: '/meditation' },
    { emoji: '✍️', label: 'كتابة علاجية', sub: 'فرّغ مشاعرك', href: '/tools/journal' },
];

const NAFSI_TODAY_ACTIONS = [
    { id: 'breathe', emoji: '🫁', label: 'تمرين تنفس ٣ دقائق', href: '/breathe' },
    { id: 'journal', emoji: '✍️', label: 'اكتب ٣ مشاعر اليوم', href: '/tools/journal' },
    { id: 'ground', emoji: '🌳', label: 'تمرين تأريض ٥-٤-٣-٢-١', href: '/tools/grounding' },
    { id: 'checkin', emoji: '💜', label: 'سجّل حالتك النفسية', href: '/quick-check-in' },
];

const NAFSI_ESCALATION = [
    'نوبات هلع متكررة أو شديدة',
    'أفكار إيذاء النفس',
    'عدم القدرة على ممارسة الحياة اليومية',
    'أعراض لم تتحسن بعد أسبوعين',
];

/* ─── Filtered Subsections ─── */
function FilteredSubsections({ activeSubdomain }: { activeSubdomain: SubdomainId | null }) {
    if (!activeSubdomain) {
        return (<>
            <NafsiDiagnosis /><NafsiPrograms /><NafsiTools /><NafsiLibrary /><NafsiCourses />
        </>);
    }
    const sub = SUBDOMAIN_BY_ID[activeSubdomain];
    if (!sub) return null;

    return (
        <motion.div key={activeSubdomain} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
            <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-[16px]">{sub.emoji}</span>
                <div>
                    <p className="text-[13px] font-black text-slate-700">{sub.arabicName}</p>
                    <p className="text-[9px] text-slate-400">{sub.description}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
                {sub.tools.map((tool, i) => (
                    <Link key={tool.id} href={tool.href} onClick={() => haptic.tap()}>
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }} whileTap={{ scale: 0.95 }}
                            className="rounded-[16px] p-3" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(226,232,240,0.5)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <span className="text-[18px] block mb-1.5">{tool.emoji}</span>
                            <p className="text-[10px] font-black text-slate-700 leading-tight mb-0.5">{tool.arabicName}</p>
                            <p className="text-[8px] text-slate-400 leading-snug">{tool.description}</p>
                            <div className="flex items-center gap-1 mt-2">
                                <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded-full"
                                    style={{ background: `${C}14`, color: C }}>{
                                    tool.type === 'test' ? 'اختبار' : tool.type === 'protocol' ? 'بروتوكول'
                                    : tool.type === 'practice' ? 'تطبيق' : tool.type === 'tracker' ? 'متابعة' : 'ورشة'}</span>
                                {tool.durationMinutes > 0 && <span className="text-[7px] text-slate-300">{tool.durationMinutes} د</span>}
                                {!tool.isFree && <span className="text-[7px] font-bold text-amber-400 mr-auto">👑</span>}
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
            <div className="mt-6">
                <div className="flex items-center gap-3 px-1 mb-4">
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${C}25)` }} />
                    <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">كل أدوات نفسي</p>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${C}25)` }} />
                </div>
                <NafsiDiagnosis /><NafsiPrograms /><NafsiTools /><NafsiLibrary /><NafsiCourses />
            </div>
        </motion.div>
    );
}

export default function NafsiPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeSubdomain, setActiveSubdomain] = useState<SubdomainId | null>(null);

    const recommendedSubdomain = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const plan = getActiveCarePlan();
        if (!plan) return null;
        if (plan.routing.primary_domain === 'nafsi') return plan.routing.primary_subdomain;
        if (plan.routing.secondary_domain === 'nafsi') return plan.routing.secondary_subdomain;
        return null;
    }, []);

    const handleSubdomainSelect = useCallback((id: SubdomainId | null) => { setActiveSubdomain(id); }, []);

    if (loading) return <SectionSkeleton color="#7C3AED" bg="linear-gradient(168deg, #F5F3FF 0%, #EDE9FE 50%, #F5F3FF 100%)" />;
    if (!user) return <SectionAuthGate section={NAFSI} />;

    return (
        <div className="relative min-h-screen pb-28 overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{ background: 'linear-gradient(182deg, rgba(124,58,237,0.07) 0%, #F5F3FF 45%, #EDE9FE 80%, rgba(109,40,217,0.04) 100%)' }} />
            <motion.div animate={{ scale: [1, 1.10, 1], opacity: [0.38, 0.62, 0.38] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="fixed -top-20 -right-20 w-72 h-72 rounded-full z-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.22), transparent 68%)', filter: 'blur(28px)' }} />
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.22, 0.42, 0.22] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                className="fixed bottom-20 -left-16 w-60 h-60 rounded-full z-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.18), transparent 68%)', filter: 'blur(22px)' }} />

            <div className="relative z-10">
                <DomainHeroHeader section={NAFSI} onBack={() => router.back()} />
                <div style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.75)' }}>
                    <CrossDomainBar currentSlug="nafsi" />
                </div>

                <div className="pt-4">
                    <SectionStatusBar domainId="nafsi" color={C} colorAlt={CA}
                        assessHref="/emotional-medicine" fallbackText="ابدأ تقييمك النفسي لتحديد مسارك" />
                </div>

                <div>
                    <div className="flex items-center justify-between px-5 mb-3">
                        <p className="text-[11px] font-black text-slate-600 tracking-tight">لوحتك العاطفية اليوم</p>
                        <Link href="/emotional-medicine" onClick={() => haptic.tap()}>
                            <div className="flex items-center gap-1" style={{ color: C }}>
                                <span className="text-[9px] font-black">تفاصيل</span>
                                <ArrowLeft className="w-3 h-3" />
                            </div>
                        </Link>
                    </div>
                    <EmotionalDashboard />
                </div>

                <StartNowZone domainId="nafsi" color={C} colorAlt={CA} defaultItems={START_NOW_ITEMS}
                    startHref="/emotional-medicine" startLabel="ابدأ التقييم النفسي" />

                <SubdomainRail domainId="nafsi" color={C} colorAlt={CA}
                    activeSubdomain={activeSubdomain} recommendedSubdomain={recommendedSubdomain}
                    onSelect={handleSubdomainSelect} />

                <TodayBlock domainId="nafsi" color={C} colorAlt={CA}
                    question="ماذا يحتاج جهازك العصبي اليوم؟"
                    fallbackActions={NAFSI_TODAY_ACTIONS} />

                <SmartInsightCard color={C} colorAlt={CA} insight={DAILY_INSIGHT} />

                <div className="flex items-center gap-3 px-5 mb-4">
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${C}30)` }} />
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {activeSubdomain ? 'المسار المحدد + كل الأدوات' : 'الوحدات النفسية'}
                    </p>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${C}30)` }} />
                </div>

                <div className="px-4">
                    <FilteredSubsections activeSubdomain={activeSubdomain} />
                </div>

                <EscalationCard color={C} hints={NAFSI_ESCALATION} bookingHref="/book-appointment" />

                <div className="flex flex-col items-center gap-2 pb-8">
                    <div className="w-16 h-[1.5px] rounded-full"
                        style={{ background: `linear-gradient(to right, transparent, ${C}AA, transparent)` }} />
                    <p className="text-[8.5px] font-semibold text-slate-300 tracking-widest uppercase">نفسي · Journey Hub · طِبرَا</p>
                </div>
            </div>
        </div>
    );
}

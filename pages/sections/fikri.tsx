'use client';
/**
 * pages/sections/fikri.tsx — نظام فكري: محطة الرحلة العلاجية
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Journey Hub Architecture (same pattern as Jasadi pilot)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Flame, CheckCircle2, BookOpen, ArrowLeft, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FIKRI } from '@/components/sections/section-tokens';
import { SectionAuthGate }  from '@/components/sections/SectionAuthGate';
import { CrossDomainBar }   from '@/components/sections/CrossDomainBar';
import { DomainHeroHeader } from '@/components/sections/shared/DomainHeroHeader';
import { SmartInsightCard } from '@/components/sections/shared/SmartInsightCard';
import { haptic } from '@/lib/HapticFeedback';
import { getActiveCarePlan } from '@/lib/care-plan-store';
import { SUBDOMAIN_BY_ID } from '@/lib/domain-routing-map';
import type { SubdomainId } from '@/components/health-engine/types';

import { SectionStatusBar } from '@/components/sections/shared/SectionStatusBar';
import { SubdomainRail }    from '@/components/sections/shared/SubdomainRail';
import { StartNowZone }     from '@/components/sections/shared/StartNowZone';
import { TodayBlock }       from '@/components/sections/shared/TodayBlock';
import { EscalationCard }   from '@/components/sections/shared/EscalationCard';

import { FikriDiagnosis, FikriPrograms, FikriTools, FikriLibrary, FikriCourses } from '@/components/sections/fikri';

const C  = '#D97706';
const CA = '#EA580C';

/* ─── Mind Dashboard ─────────────────────────── */
const GOALS = [
    { label: 'قراءة ٢٠ ص يومياً',   done: true  },
    { label: 'مراجعة أهداف الأسبوع', done: true  },
    { label: 'كتابة يومية ١٠ دقائق', done: false },
    { label: 'مراجعة المعتقدات',      done: false },
];

const HABITS_STREAK = [
    { emoji: '📖', label: 'قراءة',    streak: 12 },
    { emoji: '✍️', label: 'كتابة',    streak: 7  },
    { emoji: '🎯', label: 'أهداف',    streak: 21 },
];

function MindDashboard() {
    const doneCount = GOALS.filter(g => g.done).length;
    const focusScore = Math.round((doneCount / GOALS.length) * 100);
    const circumference = 2 * Math.PI * 34;
    const offset = circumference * (1 - focusScore / 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.05 }}
            className="mx-4 mb-4 relative overflow-hidden rounded-[26px] p-5"
            style={{
                background: 'linear-gradient(148deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.86) 55%, rgba(217,119,6,0.06) 100%)',
                border: '1px solid rgba(255,255,255,0.82)', borderTop: '1px solid rgba(255,255,255,0.97)',
                backdropFilter: 'blur(40px) saturate(2)', WebkitBackdropFilter: 'blur(40px) saturate(2)',
                boxShadow: '0 2px 0 rgba(255,255,255,0.96) inset, 0 16px 48px rgba(217,119,6,0.12), 0 4px 16px rgba(0,0,0,0.06)',
            }}>
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${C}12, transparent 70%)`, filter: 'blur(12px)' }} />
            <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.28) 48%, transparent 68%)' }}
                animate={{ x: ['-140%', '140%'] }} transition={{ duration: 5, repeat: Infinity, repeatDelay: 7, ease: 'easeInOut' }} />

            <div className="relative z-10">
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className="relative">
                            <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="40" cy="40" r="34" fill="none" stroke={`${C}16`} strokeWidth="6" />
                                <motion.circle cx="40" cy="40" r="34" fill="none"
                                    stroke={`url(#mindGrad)`} strokeWidth="6" strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset: offset }}
                                    transition={{ duration: 1.1, delay: 0.4, ease: 'easeOut' }} />
                                <defs>
                                    <linearGradient id="mindGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor={C} /><stop offset="100%" stopColor={CA} />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span className="text-[22px] font-black leading-none" style={{ color: C }}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                                    {focusScore}%
                                </motion.span>
                                <span className="text-[7.5px] font-bold text-slate-400">إنتاج</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                        {GOALS.map((g, i) => (
                            <motion.div key={g.label} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.08 + i * 0.06 }}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[10px]"
                                style={{ background: g.done ? `${CA}0E` : 'rgba(0,0,0,0.03)', border: `1px solid ${g.done ? CA + '22' : 'transparent'}` }}>
                                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: g.done ? CA : '#CBD5E1' }} />
                                <span className="text-[9px] font-bold"
                                    style={{ color: g.done ? '#44403C' : '#94A3B8', textDecoration: g.done ? 'line-through' : 'none' }}>
                                    {g.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${C}14` }}>
                    {HABITS_STREAK.map((h) => (
                        <div key={h.label} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-[12px]"
                            style={{ background: `${C}0C`, border: `1px solid ${C}18` }}>
                            <span className="text-[18px] leading-none">{h.emoji}</span>
                            <div className="flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5" style={{ color: '#F97316' }} />
                                <span className="text-[10px] font-black" style={{ color: C }}>{h.streak}</span>
                            </div>
                            <span className="text-[8px] font-bold text-slate-400">{h.label}</span>
                        </div>
                    ))}
                    <Link href="/tools/annual-plan" onClick={() => haptic.tap()} className="flex-1">
                        <div className="flex flex-col items-center gap-1 py-2 rounded-[12px]"
                            style={{ background: `${C}16`, border: `1px solid ${C}28` }}>
                            <Target className="w-4.5 h-4.5" style={{ color: C }} />
                            <span className="text-[8px] font-black" style={{ color: C }}>أهدافي السنوية</span>
                        </div>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

const DAILY_INSIGHT = {
    label: 'رؤية فكرية اليوم',
    title: 'أكمل ٧ أيام متتالية في القراءة 🔥',
    body: 'نمط الالتزام بالقراءة يومياً من أقوى المحركات للنمو الفكري. استمر!',
    cta: 'راجع خطتي الأسبوعية',
    href: '/tools/weekly-plan',
    emoji: '📖',
};

const START_NOW_ITEMS = [
    { emoji: '🧩', label: 'تقييم المعتقدات', sub: 'اكتشف أنماطك الفكرية', href: '/assess/beliefs', pulse: true },
    { emoji: '🎯', label: 'خطتي الأسبوعية', sub: 'نظّم أهدافك', href: '/tools/weekly-plan' },
    { emoji: '✍️', label: 'كتابة يومية', sub: 'صفّي ذهنك', href: '/tools/journal' },
    { emoji: '📚', label: 'مكتبة المعرفة', sub: 'مقالات وأبحاث', href: '/glass-library' },
];

const FIKRI_TODAY_ACTIONS = [
    { id: 'read', emoji: '📖', label: 'اقرأ ٢٠ صفحة اليوم' },
    { id: 'write', emoji: '✍️', label: 'اكتب في يومياتك ١٠ دقائق', href: '/tools/journal' },
    { id: 'goals', emoji: '🎯', label: 'راجع أهدافك الأسبوعية', href: '/tools/weekly-plan' },
    { id: 'believe', emoji: '🧠', label: 'تحدّ معتقدًا واحدًا مقيّدًا', href: '/assess/beliefs' },
];

const FIKRI_ESCALATION = [
    'أفكار وسواسية لا يمكن السيطرة عليها',
    'صعوبة مستمرة في التركيز أو التذكر',
    'أفكار سلبية حادة تعطل حياتك اليومية',
    'أعراض ذهانية (أفكار غريبة / هلوسات)',
];

/* ─── Filtered Subsections ─── */
function FilteredSubsections({ activeSubdomain }: { activeSubdomain: SubdomainId | null }) {
    if (!activeSubdomain) {
        return (<>
            <FikriDiagnosis /><FikriPrograms /><FikriTools /><FikriLibrary /><FikriCourses />
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
                    <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">كل أدوات فكري</p>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${C}25)` }} />
                </div>
                <FikriDiagnosis /><FikriPrograms /><FikriTools /><FikriLibrary /><FikriCourses />
            </div>
        </motion.div>
    );
}

export default function FikriPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeSubdomain, setActiveSubdomain] = useState<SubdomainId | null>(null);

    const recommendedSubdomain = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const plan = getActiveCarePlan();
        if (!plan) return null;
        if (plan.routing.primary_domain === 'fikri') return plan.routing.primary_subdomain;
        if (plan.routing.secondary_domain === 'fikri') return plan.routing.secondary_subdomain;
        return null;
    }, []);

    const handleSubdomainSelect = useCallback((id: SubdomainId | null) => { setActiveSubdomain(id); }, []);

    if (loading) return <div className="min-h-screen" style={{ background: 'linear-gradient(168deg, #FFFBEB 0%, #FEF3C7 50%, #FFFBEB 100%)' }} />;
    if (!user) return <SectionAuthGate section={FIKRI} />;

    return (
        <div className="relative min-h-screen pb-28 overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{ background: 'linear-gradient(182deg, rgba(217,119,6,0.07) 0%, #FFFBEB 45%, #FEF3C7 80%, rgba(234,88,12,0.04) 100%)' }} />
            <motion.div animate={{ scale: [1, 1.10, 1], opacity: [0.40, 0.65, 0.40] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="fixed -top-20 -right-20 w-72 h-72 rounded-full z-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.22), transparent 68%)', filter: 'blur(28px)' }} />
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.22, 0.40, 0.22] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                className="fixed bottom-20 -left-16 w-60 h-60 rounded-full z-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.18), transparent 68%)', filter: 'blur(22px)' }} />

            <div className="relative z-10">
                <DomainHeroHeader section={FIKRI} onBack={() => router.back()} />
                <div style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.75)' }}>
                    <CrossDomainBar currentSlug="fikri" />
                </div>

                <div className="pt-4">
                    <SectionStatusBar domainId="fikri" color={C} colorAlt={CA}
                        assessHref="/symptom-checker" fallbackText="ابدأ تقييمك الفكري لتحديد مسارك" />
                </div>

                <div>
                    <div className="flex items-center justify-between px-5 mb-3">
                        <p className="text-[11px] font-black text-slate-600 tracking-tight">إنتاجيتك اليوم</p>
                        <Link href="/tools/weekly-plan" onClick={() => haptic.tap()}>
                            <div className="flex items-center gap-1" style={{ color: C }}>
                                <span className="text-[9px] font-black">الخطة</span>
                                <ArrowLeft className="w-3 h-3" />
                            </div>
                        </Link>
                    </div>
                    <MindDashboard />
                </div>

                <StartNowZone domainId="fikri" color={C} colorAlt={CA} defaultItems={START_NOW_ITEMS}
                    startHref="/symptom-checker" startLabel="ابدأ التقييم الفكري" />

                <SubdomainRail domainId="fikri" color={C} colorAlt={CA}
                    activeSubdomain={activeSubdomain} recommendedSubdomain={recommendedSubdomain}
                    onSelect={handleSubdomainSelect} />

                <TodayBlock domainId="fikri" color={C} colorAlt={CA}
                    question="ماذا يحتاج عقلك اليوم؟"
                    fallbackActions={FIKRI_TODAY_ACTIONS} />

                <SmartInsightCard color={C} colorAlt={CA} insight={DAILY_INSIGHT} />

                <div className="flex items-center gap-3 px-5 mb-4">
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${C}30)` }} />
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {activeSubdomain ? 'المسار المحدد + كل الأدوات' : 'الوحدات الفكرية'}
                    </p>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${C}30)` }} />
                </div>

                <div className="px-4">
                    <FilteredSubsections activeSubdomain={activeSubdomain} />
                </div>

                <EscalationCard color={C} hints={FIKRI_ESCALATION} bookingHref="/booking" />

                <div className="flex flex-col items-center gap-2 pb-8">
                    <div className="w-16 h-[1.5px] rounded-full"
                        style={{ background: `linear-gradient(to right, transparent, ${C}AA, transparent)` }} />
                    <p className="text-[8.5px] font-semibold text-slate-300 tracking-widest uppercase">فكري · Journey Hub · طِبرَا</p>
                </div>
            </div>
        </div>
    );
}

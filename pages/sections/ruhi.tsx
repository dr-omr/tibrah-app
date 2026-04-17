'use client';
/**
 * pages/sections/ruhi.tsx — نظام روحي: محطة الرحلة العلاجية
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Journey Hub Architecture (same pattern as Jasadi pilot)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Play, Pause, Moon, Wind, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RUHI } from '@/components/sections/section-tokens';
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

import { RuhiDiagnosis, RuhiPrograms, RuhiTools, RuhiLibrary, RuhiCourses } from '@/components/sections/ruhi';

const C  = '#2563EB';
const CA = '#4F46E5';

/* ─── Spiritual dimensions ───────────────────── */
const SPIRIT_DIMS = [
    { label: 'السكون',     value: 72, color: '#60A5FA' },
    { label: 'المعنى',     value: 48, color: '#818CF8' },
    { label: 'الاتصال',    value: 65, color: '#A78BFA' },
    { label: 'الامتنان',   value: 80, color: '#34D399' },
    { label: 'الحضور',     value: 40, color: '#7DD3FC' },
];

const BREATH_PHASES = ['شهيق', 'احبس', 'زفير', 'راحة'];
const BREATH_TIMES  = [4, 4, 6, 2];
const BREATH_COLORS = ['#60A5FA', '#A78BFA', '#34D399', '#7DD3FC'];

function BreathTimer() {
    const [active, setActive]   = useState(false);
    const [phase,  setPhase]    = useState(0);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!active) { setElapsed(0); return; }
        const interval = setInterval(() => {
            setElapsed(e => {
                if (e >= BREATH_TIMES[phase] - 1) {
                    setPhase(p => (p + 1) % BREATH_PHASES.length);
                    return 0;
                }
                return e + 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [active, phase]);

    const progress = BREATH_TIMES[phase] > 0 ? elapsed / BREATH_TIMES[phase] : 0;
    const phaseColor = BREATH_COLORS[phase];
    const circumference = 2 * Math.PI * 30;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-[80px] h-[80px]">
                <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${phaseColor}28, transparent 72%)` }}
                    animate={active ? { scale: phase === 0 ? [1, 1.3] : phase === 2 ? [1.3, 1] : 1.3 } : { scale: 1 }}
                    transition={{ duration: BREATH_TIMES[phase], ease: 'easeInOut' }} />
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="40" cy="40" r="30" fill="none" stroke={`${phaseColor}18`} strokeWidth="5" />
                    <motion.circle cx="40" cy="40" r="30" fill="none"
                        stroke={phaseColor} strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress)}
                        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-black" style={{ color: phaseColor }}>
                        {active ? BREATH_PHASES[phase] : '🫁'}
                    </span>
                    {active && <span className="text-[8px] text-slate-400">{BREATH_TIMES[phase] - elapsed}ث</span>}
                </div>
            </div>
            <motion.button whileTap={{ scale: 0.88 }}
                onClick={() => { setActive(a => !a); if (!active) { setPhase(0); setElapsed(0); } haptic.impact(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                    background: active ? 'rgba(239,68,68,0.12)' : `${C}18`,
                    border: `1px solid ${active ? 'rgba(239,68,68,0.25)' : C + '28'}`,
                }}>
                {active
                    ? <><Pause className="w-3 h-3 text-red-400" /><span className="text-[9px] font-black text-red-400">إيقاف</span></>
                    : <><Play  className="w-3 h-3" style={{ color: C }} /><span className="text-[9px] font-black" style={{ color: C }}>ابدأ التنفس</span></>
                }
            </motion.button>
        </div>
    );
}

function SpiritualDashboard() {
    const balanceScore = Math.round(SPIRIT_DIMS.reduce((s, d) => s + d.value, 0) / SPIRIT_DIMS.length);

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.05 }}
            className="mx-4 mb-4 relative overflow-hidden rounded-[26px] p-5"
            style={{
                background: 'linear-gradient(148deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.86) 55%, rgba(37,99,235,0.06) 100%)',
                border: '1px solid rgba(255,255,255,0.82)', borderTop: '1px solid rgba(255,255,255,0.97)',
                backdropFilter: 'blur(40px) saturate(2)', WebkitBackdropFilter: 'blur(40px) saturate(2)',
                boxShadow: `0 2px 0 rgba(255,255,255,0.96) inset, 0 16px 48px ${C}12, 0 4px 16px rgba(0,0,0,0.06)`,
            }}>
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${C}10, transparent 70%)`, filter: 'blur(12px)' }} />
            <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.28) 48%, transparent 68%)' }}
                animate={{ x: ['-140%', '140%'] }} transition={{ duration: 5, repeat: Infinity, repeatDelay: 7, ease: 'easeInOut' }} />

            <div className="relative z-10">
                <div className="flex items-start gap-4 mb-4">
                    <BreathTimer />
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-black text-slate-600">اتزانك الداخلي</p>
                            <span className="text-[14px] font-black" style={{ color: C }}>{balanceScore}%</span>
                        </div>
                        {SPIRIT_DIMS.map((d, i) => (
                            <div key={d.label} className="flex items-center gap-2">
                                <span className="text-[8.5px] font-bold w-12 flex-shrink-0 text-right text-slate-400">{d.label}</span>
                                <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: `${d.color}18` }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${d.value}%` }}
                                        transition={{ duration: 0.55, delay: 0.1 + i * 0.07, ease: 'easeOut' }}
                                        className="h-full rounded-full" style={{ background: d.color }} />
                                </div>
                                <span className="text-[8px] font-black w-6 flex-shrink-0" style={{ color: d.color }}>{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="pt-3 flex items-center gap-2" style={{ borderTop: `1px solid ${C}12` }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: C }} />
                    <span className="text-[9px] font-bold text-slate-500 flex-1">جلسة تنفس واعٍ · ٤-٤-٦-٢</span>
                    <Link href="/breathe" onClick={() => haptic.tap()}>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                            style={{ background: `${C}12`, border: `1px solid ${C}20` }}>
                            <span className="text-[8.5px] font-black" style={{ color: C }}>جلسة كاملة</span>
                        </div>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

const DAILY_INSIGHT = {
    label: 'رؤية روحية اليوم',
    title: 'ابدأ يومك بثلاث دقائق من الصمت الواعي',
    body: '٣ دقائق صمت كاملة في الصباح تعادل ٢٠ دقيقة تأمل تقليدي — وفق دراسات الـ Mindfulness.',
    cta: 'جلسة صمت واعٍ الآن',
    href: '/breathe',
    emoji: '🌅',
};

const START_NOW_ITEMS = [
    { emoji: '〰️', label: 'ترددات شفائية', sub: 'موجات صوتية علاجية', href: '/frequencies', pulse: true },
    { emoji: '🫁', label: 'تنفس واعٍ', sub: 'جلسة ٤-٤-٦-٢', href: '/breathe' },
    { emoji: '🙏', label: 'تمرين الامتنان', sub: '٣ دقائق يومياً', href: '/tools/gratitude' },
    { emoji: '🧘', label: 'تأمل موجّه', sub: 'صفاء ذهني', href: '/meditation' },
];

const RUHI_TODAY_ACTIONS = [
    { id: 'breathe', emoji: '🫁', label: 'تمرين تنفس ٣ دقائق', href: '/breathe' },
    { id: 'gratitude', emoji: '🙏', label: 'اكتب ٣ أشياء ممتن لها', href: '/tools/gratitude' },
    { id: 'silence', emoji: '🤫', label: 'صمت واعٍ ٥ دقائق' },
    { id: 'freq', emoji: '〰️', label: 'استمع لتردد شفائي', href: '/frequencies' },
];

const RUHI_ESCALATION = [
    'فقدان المعنى أو الرغبة في الحياة',
    'أزمة روحية حادة تعطل حياتك',
    'أفكار انتحارية أو يأس عميق',
    'انفصال كامل عن المحيط والعلاقات',
];

/* ─── Filtered Subsections ─── */
function FilteredSubsections({ activeSubdomain }: { activeSubdomain: SubdomainId | null }) {
    if (!activeSubdomain) {
        return (<>
            <RuhiDiagnosis /><RuhiPrograms /><RuhiTools /><RuhiLibrary /><RuhiCourses />
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
                    <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">كل أدوات روحي</p>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${C}25)` }} />
                </div>
                <RuhiDiagnosis /><RuhiPrograms /><RuhiTools /><RuhiLibrary /><RuhiCourses />
            </div>
        </motion.div>
    );
}

export default function RuhiPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeSubdomain, setActiveSubdomain] = useState<SubdomainId | null>(null);

    const recommendedSubdomain = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const plan = getActiveCarePlan();
        if (!plan) return null;
        if (plan.routing.primary_domain === 'ruhi') return plan.routing.primary_subdomain;
        if (plan.routing.secondary_domain === 'ruhi') return plan.routing.secondary_subdomain;
        return null;
    }, []);

    const handleSubdomainSelect = useCallback((id: SubdomainId | null) => { setActiveSubdomain(id); }, []);

    if (loading) return <div className="min-h-screen" style={{ background: 'linear-gradient(168deg, #EFF6FF 0%, #EEF2FF 50%, #EFF6FF 100%)' }} />;
    if (!user) return <SectionAuthGate section={RUHI} />;

    return (
        <div className="relative min-h-screen pb-28 overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{ background: 'linear-gradient(182deg, rgba(37,99,235,0.07) 0%, #EFF6FF 45%, #EEF2FF 80%, rgba(79,70,229,0.04) 100%)' }} />
            <motion.div animate={{ scale: [1, 1.10, 1], opacity: [0.38, 0.60, 0.38] }}
                transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
                className="fixed -top-20 -right-20 w-72 h-72 rounded-full z-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.22), transparent 68%)', filter: 'blur(28px)' }} />
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.20, 0.38, 0.20] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4.5 }}
                className="fixed bottom-20 -left-16 w-60 h-60 rounded-full z-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.18), transparent 68%)', filter: 'blur(22px)' }} />

            <div className="relative z-10">
                <DomainHeroHeader section={RUHI} onBack={() => router.back()} />
                <div style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.75)' }}>
                    <CrossDomainBar currentSlug="ruhi" />
                </div>

                <div className="pt-4">
                    <SectionStatusBar domainId="ruhi" color={C} colorAlt={CA}
                        assessHref="/symptom-checker" fallbackText="ابدأ تقييمك الروحي لتحديد مسارك" />
                </div>

                <div>
                    <div className="flex items-center justify-between px-5 mb-3">
                        <p className="text-[11px] font-black text-slate-600 tracking-tight">اتزانك الروحي اليوم</p>
                        <Link href="/assess/inner-balance" onClick={() => haptic.tap()}>
                            <div className="flex items-center gap-1" style={{ color: C }}>
                                <span className="text-[9px] font-black">تقييم</span>
                                <ArrowLeft className="w-3 h-3" />
                            </div>
                        </Link>
                    </div>
                    <SpiritualDashboard />
                </div>

                <StartNowZone domainId="ruhi" color={C} colorAlt={CA} defaultItems={START_NOW_ITEMS}
                    startHref="/symptom-checker" startLabel="ابدأ التقييم الروحي" />

                <SubdomainRail domainId="ruhi" color={C} colorAlt={CA}
                    activeSubdomain={activeSubdomain} recommendedSubdomain={recommendedSubdomain}
                    onSelect={handleSubdomainSelect} />

                <TodayBlock domainId="ruhi" color={C} colorAlt={CA}
                    question="ماذا تحتاج روحك اليوم؟"
                    fallbackActions={RUHI_TODAY_ACTIONS} />

                <SmartInsightCard color={C} colorAlt={CA} insight={DAILY_INSIGHT} />

                <div className="flex items-center gap-3 px-5 mb-4">
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${C}30)` }} />
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {activeSubdomain ? 'المسار المحدد + كل الأدوات' : 'الوحدات الروحية'}
                    </p>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${C}30)` }} />
                </div>

                <div className="px-4">
                    <FilteredSubsections activeSubdomain={activeSubdomain} />
                </div>

                <EscalationCard color={C} hints={RUHI_ESCALATION} bookingHref="/booking" />

                <div className="flex flex-col items-center gap-2 pb-8">
                    <div className="w-16 h-[1.5px] rounded-full"
                        style={{ background: `linear-gradient(to right, transparent, ${C}AA, transparent)` }} />
                    <p className="text-[8.5px] font-semibold text-slate-300 tracking-widest uppercase">روحي · Journey Hub · طِبرَا</p>
                </div>
            </div>
        </div>
    );
}

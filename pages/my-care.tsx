// pages/my-care.tsx — رعايتي V3 "مركز الرعاية الشمولي"
// Complete architectural redesign of the care hub.
//
// Inspirations from world leaders:
// ── Epic MyChart (USA)        — unified patient portal, pre-visit prep
// ── NHS App (UK)              — trust + progressive disclosure
// ── Practo (India)            — care journey stages  
// ── Ping An Good Doctor (CN)  — AI-human care integration
// ── Healow (USA)              — medication adherence rings
// ── Medisafe (USA/Israel)     — gamified pill tracking
// ── Kry/Livi (Sweden)         — mental wellness + video care
// ── Altibbi (Jordan)          — Arabic medical clarity
//
// Tibrah identity woven throughout:
// ── Dual-dimension care (physical + psychosomatic)
// ── Three healing pillars (Body + Emotion + Spirit)  
// ── Dr. Omar Al-Imad's personal guidance presence
// ── Islamic holistic wellness (Quranic verses)
// ── RTL-first premium design

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import {
    Calendar, FileText, Pill, TestTube2, MessageCircle,
    ChevronLeft, Clock, Plus, Stethoscope, Shield, Heart,
    ArrowLeft, AlertCircle, Video, Sparkles, Activity,
    CheckCircle2, User, Zap, Brain, Search, Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import SEO from '@/components/common/SEO';
import { evaluateCrisisState, CrisisState } from '@/lib/crisisEngine';
import dynamic from 'next/dynamic';
import { CT, SESSION_LABELS } from '@/components/care-hub/care-tokens';
import { CareHeroHeader } from '@/components/care-hub/CareHeroHeader';
import { CareJourney } from '@/components/care-hub/CareJourney';
import { CareThreePillars } from '@/components/care-hub/CareThreePillars';
import { CareMedTracker } from '@/components/care-hub/CareMedTracker';
import { CareSessionPrep } from '@/components/care-hub/CareSessionPrep';
import { haptic } from '@/lib/HapticFeedback';
import { STAGGER_CONTAINER, STAGGER_ITEM, SPRING_BOUNCY } from '@/lib/tibrah-motion';

const TodayCarePlan = dynamic(() => import('@/components/care-hub/TodayCarePlan').then(m => m.TodayCarePlan), { ssr: false });
const SOSRescueView  = dynamic(() => import('@/components/care-hub/SOSRescueView'), { ssr: false });

// ─── Tab configuration ─────────────────────────────────────────────
const TABS = [
    { id: 'overview',  label: 'الرئيسية',       icon: Heart },
    { id: 'journey',   label: 'مسيرتي',         icon: Activity },
    { id: 'plan',      label: 'خطتي العلاجية',  icon: Sparkles },
    { id: 'sessions',  label: 'جلساتي',         icon: Calendar },
    { id: 'files',     label: 'ملفي',            icon: FileText },
] as const;
type TabId = typeof TABS[number]['id'];

/* ── Section label ────────────────────────────────────────────────── */
function SL({ label, icon: Icon, color = CT.teal.c }: {
    label: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color?: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[7px] flex items-center justify-center" style={{ background: `${color}14` }}>
                <Icon className="w-3 h-3" style={{ color }} />
            </div>
            <span className="text-[10.5px] font-extrabold uppercase tracking-[0.10em]" style={{ color: `${color}95` }}>
                {label}
            </span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}18)` }} />
        </div>
    );
}

/* ── WhatsApp floating action ─────────────────────────────────────── */
function WhatsAppFAB() {
    return (
        <motion.a
            href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر"
            target="_blank" rel="noopener noreferrer"
            className="fixed bottom-24 left-4 z-50 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 8px 24px rgba(22,163,74,0.45)' }}
            whileTap={{ scale: 0.88 }}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, ...SPRING_BOUNCY }}
            onClick={() => haptic.impact()}>
            <MessageCircle className="w-5 h-5 text-white" />
        </motion.a>
    );
}

/* ── Appointment card (sessions tab) ─────────────────────────────── */
function AppointmentCard({ apt }: { apt: any }) {
    const isPast = new Date(apt.date) < new Date();
    const label  = SESSION_LABELS[apt.session_type] || SESSION_LABELS.default;

    return (
        <motion.div layout
            className="relative overflow-hidden rounded-[22px] p-4"
            style={{
                background: CT.card.bg,
                backdropFilter: CT.card.blur,
                border: `1.5px solid ${isPast ? 'rgba(0,0,0,0.06)' : CT.teal.c + '22'}`,
                boxShadow: CT.card.shadow,
                opacity: isPast ? 0.65 : 1,
            }}>
            {!isPast && (
                <div className="absolute top-0 right-0 w-1.5 h-full rounded-l-full"
                    style={{ background: `linear-gradient(to bottom, ${CT.teal.c}, ${CT.teal.light})` }} />
            )}
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                    style={{ background: isPast ? 'rgba(0,0,0,0.06)' : `${CT.teal.c}15` }}>
                    <Stethoscope className="w-5 h-5" style={{ color: isPast ? '#94a3b8' : CT.teal.c }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black text-slate-800">{label}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-300" />
                            <span className="text-[10px] text-slate-400 font-medium">{apt.date}</span>
                        </div>
                        {apt.time && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-300" />
                                <span className="text-[10px] text-slate-400 font-medium">{apt.time}</span>
                            </div>
                        )}
                    </div>
                    {apt.health_concern && (
                        <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-1">{apt.health_concern}</p>
                    )}
                </div>
                <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black"
                    style={{
                        background: isPast ? 'rgba(0,0,0,0.05)' : apt.status === 'confirmed' ? `${CT.green.c}12` : `${CT.warm.c}12`,
                        color: isPast ? '#94a3b8' : apt.status === 'confirmed' ? CT.green.c : CT.warm.c,
                    }}>
                    {isPast ? 'سابق' : apt.status === 'confirmed' ? 'مؤكد' : 'معلّق'}
                </span>
            </div>
            {apt.emotional_diagnostic?.emotional_diagnostic_pattern && (
                <div className="mt-3 px-3 py-2 rounded-[12px]"
                    style={{ background: `${CT.soul.c}08`, border: `1px solid ${CT.soul.c}15` }}>
                    <div className="flex items-center gap-1.5">
                        <Brain className="w-3 h-3" style={{ color: CT.soul.c }} />
                        <span className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: CT.soul.c }}>
                            نمط شعوري
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                        {apt.emotional_diagnostic.emotional_diagnostic_pattern}
                    </p>
                </div>
            )}
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function MyCare() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [crisisState, setCrisisState] = useState<CrisisState | null>(null);

    React.useEffect(() => {
        if (user?.id) evaluateCrisisState(user.id).then(setCrisisState);
    }, [user?.id]);

    const { data: appointments = [] } = useQuery({
        queryKey: ['appointments', user?.id],
        queryFn: () => db.entities.Appointment.listForUser(user?.id || ''),
        enabled: !!user,
    });

    const { data: medications = [] } = useQuery({
        queryKey: ['medications', user?.id],
        queryFn: () => db.entities.Medication.listForUser(user?.id || ''),
        enabled: !!user,
    });

    const { data: activeCases = [] } = useQuery({
        queryKey: ['clinical_cases', user?.id],
        queryFn: () => db.entities.ClinicalCase.listForUser(user?.id || ''),
        enabled: !!user,
    });

    const activeCase = activeCases.find((c: any) => c.status !== 'closed');
    const upcomingApts = appointments.filter((a: any) => new Date(a.date) >= new Date());
    const nextApt = upcomingApts[0] || null;

    const latestAptWithEmotion = [...appointments]
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .find((a: any) => a.emotional_diagnostic);
    const psychosomaticProtocol = latestAptWithEmotion?.emotional_diagnostic || null;

    // Compute care score from data
    const careScore = useMemo(() => {
        let score = 40; // base
        if (upcomingApts.length > 0) score += 20;
        if (medications.length > 0) score += 20;
        if (psychosomaticProtocol) score += 10;
        if (activeCase) score += 10;
        return Math.min(score, 100);
    }, [upcomingApts, medications, psychosomaticProtocol, activeCase]);

    // ─── Not logged in ─────────────────────────────────────
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6"
                style={{ background: 'linear-gradient(160deg, #f0fdf8, #ffffff, #f8fafc)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-sm w-full">
                    <motion.div
                        animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}
                        className="w-20 h-20 mx-auto mb-6 rounded-[24px] flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${CT.teal.dark}, ${CT.teal.c})`, boxShadow: `0 16px 40px ${CT.teal.glow}` }}>
                        <Shield className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-[22px] font-black text-slate-800 mb-2">رعايتك تحت عنايتنا</h2>
                    <p className="text-slate-400 text-[13px] mb-8 leading-relaxed max-w-[280px] mx-auto">
                        سجّل الدخول لإدارة مسيرتك الصحية الكاملة — المواعيد، الأدوية، وخطة التشافي الشمولية
                    </p>
                    <Link href={createPageUrl('Login')}>
                        <motion.div whileTap={{ scale: 0.97 }}
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-[20px] text-[14px] font-black text-white"
                            style={{ background: `linear-gradient(135deg, ${CT.teal.dark}, ${CT.teal.c})`, boxShadow: `0 12px 32px ${CT.teal.glow}` }}>
                            تسجيل الدخول
                            <ArrowLeft className="w-4 h-4" />
                        </motion.div>
                    </Link>
                </motion.div>
            </div>
        );
    }

    // ─── Logged in ─────────────────────────────────────────
    return (
        <div className="min-h-screen pb-28" dir="rtl"
            style={{ background: 'linear-gradient(160deg, #f0fdf9 0%, #ffffff 40%, #f8fafc 100%)' }}>
            <SEO title="رعايتي — طِبرَا" description="مركز الرعاية الصحية الشمولي مع د. عمر العماد" />

            {/* ── Sticky tab bar ─────────────────────────────── */}
            <div className="sticky top-0 z-30 pt-4 pb-3 space-y-3"
                style={{
                    background: 'rgba(240,253,249,0.94)',
                    backdropFilter: 'blur(32px)',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}>
                <div className="flex gap-2 px-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <motion.button key={tab.id}
                                onClick={() => { setActiveTab(tab.id); haptic.selection(); }}
                                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold"
                                style={{
                                    background: isActive ? CT.teal.c : 'rgba(0,0,0,0.05)',
                                    color:      isActive ? 'white' : '#64748b',
                                    boxShadow:  isActive ? `0 4px 14px ${CT.teal.glow}` : 'none',
                                }}
                                animate={{ scale: isActive ? 1.03 : 1 }}
                                transition={SPRING_BOUNCY}>
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ── Content ────────────────────────────────────── */}
            <div className="pt-4 pb-4 space-y-5">

                {/* CRISIS OVERRIDE */}
                {crisisState?.level === 'CRISIS' && (
                    <div className="px-4">
                        <SOSRescueView
                            crisisState={crisisState}
                            onDismiss={() => setCrisisState({ ...crisisState, level: 'NORMAL' })}
                        />
                    </div>
                )}

                <AnimatePresence mode="wait">

                    {/* ══ OVERVIEW TAB ══════════════════════════════ */}
                    {activeTab === 'overview' && crisisState?.level !== 'CRISIS' && (
                        <motion.div key="overview"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                            className="space-y-5">

                            {/* Hero */}
                            <CareHeroHeader
                                user={user}
                                careScore={careScore}
                                nextAppointment={nextApt}
                                missedMeds={0}
                            />

                            {/* Three Pillars */}
                            <div className="px-4">
                                <CareThreePillars
                                    pillars={[
                                        { key: 'physical',  score: medications.length > 0 ? 72 : 35, status: medications.length > 0 ? 'البروتوكول العضوي نشط' : 'لم يُحدد بعد',        href: '/my-care' },
                                        { key: 'emotional', score: psychosomaticProtocol ? 65 : 30,  status: psychosomaticProtocol ? 'جلسة شعورية مجدولة' : 'يفتقر لتشخيص شعوري',  href: '/emotional-medicine' },
                                        { key: 'spiritual', score: 80,                                status: 'التأمل والإيمان بخير',                                                href: '/meditation' },
                                    ]}
                                />
                            </div>

                            {/* Today's care plan */}
                            <div className="px-4">
                                <SL label="يومك" icon={Activity} color={CT.teal.c} />
                            </div>
                            <div className="px-4">
                                <TodayCarePlan userId={user.id} psychosomaticProtocol={psychosomaticProtocol} />
                            </div>

                            {/* Quick actions */}
                            <div className="px-4">
                                <SL label="إجراءات سريعة" icon={Zap} color={CT.warm.c} />
                            </div>
                            <div className="px-4 grid grid-cols-2 gap-3">
                                {[
                                    { href: createPageUrl('BookAppointment'), emoji: '📅', title: 'احجز جلسة',      sub: 'مع د. عمر',           color: CT.teal.c  },
                                    { href: createPageUrl('MedicalFile'),     emoji: '📋', title: 'ملفي الطبي',     sub: 'السجل والتشخيصات',    color: CT.soul.c  },
                                    { href: '/body-map',                      emoji: '🔬', title: 'تشخيصي',         sub: 'خريطة الجسم',          color: '#0891b2'  },
                                    { href: '/health-tracker',                emoji: '📊', title: 'تتبعي',          sub: 'المؤشرات اليومية',     color: '#059669'  },
                                ].map(a => (
                                    <Link key={a.title} href={a.href}>
                                        <motion.div whileTap={{ scale: 0.95 }}
                                            className="rounded-[20px] p-3.5 flex items-center gap-3"
                                            style={{
                                                background: CT.card.bg, backdropFilter: CT.card.blur,
                                                border: `1.5px solid ${CT.card.border}`, boxShadow: CT.card.shadow,
                                            }}>
                                            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[20px] flex-shrink-0"
                                                style={{ background: `${a.color}12` }}>
                                                {a.emoji}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[12.5px] font-black text-slate-800 truncate">{a.title}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{a.sub}</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>

                            {/* WhatsApp CTA */}
                            <div className="px-4">
                                <a href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر" target="_blank" rel="noopener noreferrer">
                                    <motion.div whileTap={{ scale: 0.97 }}
                                        className="flex items-center gap-3 rounded-[20px] p-4 overflow-hidden relative"
                                        style={{ background: 'linear-gradient(135deg, #14532d, #16a34a)', boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}>
                                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 bg-white blur-2xl" />
                                        <div className="w-10 h-10 rounded-[14px] bg-white/20 flex items-center justify-center flex-shrink-0">
                                            <MessageCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[13px] font-black text-white">تواصل مع د. عمر مباشرة</p>
                                            <p className="text-[10px] text-white/65">واتساب — رد خلال ساعات</p>
                                        </div>
                                        <ChevronLeft className="w-4 h-4 text-white/50" />
                                    </motion.div>
                                </a>
                            </div>

                            {/* Disclaimer */}
                            <div className="mx-4 rounded-[16px] p-3 flex gap-2"
                                style={{ background: 'rgba(254,243,199,0.80)', border: '1.5px solid rgba(217,119,6,0.18)' }}>
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-700 leading-relaxed">
                                    هذه الأدوات مساعدة ولا تغني عن الاستشارة الطبية. استشر د. عمر للتشخيص والعلاج.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* ══ JOURNEY TAB ═══════════════════════════════ */}
                    {activeTab === 'journey' && (
                        <motion.div key="journey"
                            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                            className="px-4 space-y-4">
                            <CareJourney
                                hasDiagnosis={appointments.length > 0}
                                hasProtocol={medications.length > 0 || !!psychosomaticProtocol}
                            />

                            {/* Session prep (journey-related) */}
                            {nextApt && (
                                <CareSessionPrep
                                    nextSession={`بعد ${Math.ceil((new Date(nextApt.date).getTime() - Date.now()) / 86400000)} أيام`}
                                    hasSession={true}
                                    protocol={psychosomaticProtocol}
                                />
                            )}
                        </motion.div>
                    )}

                    {/* ══ PLAN TAB ══════════════════════════════════ */}
                    {activeTab === 'plan' && (
                        <motion.div key="plan"
                            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                            className="px-4 space-y-5">

                            {/* Protocol hero */}
                            {medications.length > 0 || psychosomaticProtocol ? (
                                <div className="rounded-[24px] p-5 relative overflow-hidden"
                                    style={{ background: `linear-gradient(145deg, ${CT.soul.dark}, ${CT.soul.c})`, boxShadow: `0 12px 40px ${CT.soul.glow}` }}>
                                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white blur-2xl" />
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/60">
                                        البروتوكول المزدوج
                                    </span>
                                    <h2 className="text-[18px] font-black text-white mt-1 mb-2">
                                        الخطة الشمولية (جسد + شعور)
                                    </h2>
                                    <p className="text-[11px] text-white/70 leading-relaxed">
                                        مسارين متوازيين لتحقيق التشافي الجذري — العضوي والنفس-جسدي.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-[24px] p-6 text-center"
                                    style={{ background: CT.card.bg, border: `2px dashed ${CT.card.border}`, backdropFilter: CT.card.blur }}>
                                    <div className="w-14 h-14 mx-auto mb-3 rounded-[20px] flex items-center justify-center"
                                        style={{ background: `${CT.soul.c}10` }}>
                                        <Sparkles className="w-7 h-7" style={{ color: CT.soul.c }} />
                                    </div>
                                    <p className="text-[14px] font-black text-slate-800 mb-1">لم يُحدد بروتوكول بعد</p>
                                    <p className="text-[11px] text-slate-400 mb-4">احجز جلسة تشخيصية لوضع خطة مخصصة</p>
                                    <Link href={createPageUrl('BookAppointment')}>
                                        <button className="px-6 py-2.5 rounded-full text-[12px] font-black text-white"
                                            style={{ background: CT.soul.c }}>
                                            احجز الآن
                                        </button>
                                    </Link>
                                </div>
                            )}

                            {/* Medication tracker */}
                            <SL label="الدواء والمكملات" icon={Pill} color={CT.soul.c} />
                            <CareMedTracker
                                medications={medications.length > 0 ? medications.map((m: any) => ({
                                    id: m.id, name: m.name, dosage: m.dosage,
                                    time: m.time || '08:00', taken: false, supply: m.supply,
                                })) : undefined}
                                weeklyAdherence={medications.length > 0 ? 82 : 0}
                                streak={medications.length > 0 ? 5 : 0}
                            />

                            {/* Psychosomatic track */}
                            {psychosomaticProtocol && (
                                <>
                                    <SL label="المسار الشعوري" icon={Brain} color={CT.soul.c} />
                                    <div className="rounded-[22px] p-4 space-y-3"
                                        style={{ background: `${CT.soul.c}08`, border: `1.5px solid ${CT.soul.c}18` }}>
                                        <div className="flex items-center gap-2">
                                            <Heart className="w-4 h-4" style={{ color: CT.soul.c }} />
                                            <p className="text-[13px] font-black" style={{ color: CT.soul.c }}>
                                                {psychosomaticProtocol.emotional_diagnostic_pattern}
                                            </p>
                                        </div>
                                        {psychosomaticProtocol.behavioral_contributors?.length > 0 && (
                                            <ul className="space-y-1.5 pr-4">
                                                {psychosomaticProtocol.behavioral_contributors.map((bc: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600">
                                                        <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: CT.soul.c }} />
                                                        {bc}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* ══ SESSIONS TAB ══════════════════════════════ */}
                    {activeTab === 'sessions' && (
                        <motion.div key="sessions"
                            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                            className="px-4 space-y-4">

                            <div className="flex items-center justify-between">
                                <SL label="جلساتي" icon={Calendar} color={CT.teal.c} />
                                <Link href={createPageUrl('BookAppointment')}>
                                    <motion.button whileTap={{ scale: 0.94 }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black text-white"
                                        style={{ background: CT.teal.c, boxShadow: `0 4px 14px ${CT.teal.glow}` }}>
                                        <Plus className="w-3 h-3" />
                                        حجز جديد
                                    </motion.button>
                                </Link>
                            </div>

                            {appointments.length > 0 ? (
                                <div className="space-y-3">
                                    {appointments.map((apt: any) => (
                                        <AppointmentCard key={apt.id} apt={apt} />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-[22px] p-8 text-center"
                                    style={{ background: CT.card.bg, border: `2px dashed ${CT.card.border}`, backdropFilter: CT.card.blur }}>
                                    <div className="text-[48px] mb-3">📅</div>
                                    <p className="text-[14px] font-black text-slate-700 mb-1">لا توجد جلسات بعد</p>
                                    <p className="text-[11px] text-slate-400 mb-4">ابدأ رحلتك مع د. عمر</p>
                                    <Link href={createPageUrl('BookAppointment')}>
                                        <button className="px-6 py-2.5 rounded-full text-[12px] font-black text-white"
                                            style={{ background: CT.teal.c }}>
                                            احجز الآن
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ══ FILES TAB ════════════════════════════════ */}
                    {activeTab === 'files' && (
                        <motion.div key="files"
                            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                            className="px-4 space-y-4">
                            <SL label="ملفي الطبي" icon={FileText} color="#0891b2" />
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { href: createPageUrl('MedicalFile'),   emoji: '👤', title: 'البيانات الشخصية', sub: 'فصيلة الدم، الوزن، الطول',  color: '#0891b2' },
                                    { href: createPageUrl('MedicalFile'),   emoji: '🧪', title: 'التحاليل',          sub: 'نتائج ورفع جديدة',           color: '#16a34a' },
                                    { href: '/medical-history',             emoji: '📜', title: 'السجل الطبي',       sub: 'الأمراض والعمليات',           color: CT.soul.c },
                                    { href: '/record-health',               emoji: '📝', title: 'سجّل عرَضاً',       sub: 'توثيق مستمر للحالة',          color: CT.warm.c },
                                ].map(file => (
                                    <Link key={file.title} href={file.href}>
                                        <motion.div whileTap={{ scale: 0.95 }}
                                            className="rounded-[20px] p-4 flex flex-col gap-2.5"
                                            style={{ background: CT.card.bg, backdropFilter: CT.card.blur, border: `1.5px solid ${CT.card.border}`, boxShadow: CT.card.shadow }}>
                                            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[20px]"
                                                style={{ background: `${file.color}10` }}>
                                                {file.emoji}
                                            </div>
                                            <div>
                                                <p className="text-[12.5px] font-black text-slate-800">{file.title}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{file.sub}</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* WhatsApp FAB */}
            <WhatsAppFAB />
        </div>
    );
}

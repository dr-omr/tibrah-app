// pages/body-map.tsx — تشخيصي V2 "الأطلس الشامل"
// Complete redesign of the diagnosis section.
// Inspired by:
// - Ada Health (Germany) — guided symptom intelligence
// - Babylon Health (UK) — AI triage flows  
// - TouchTribe / Visible Body (USA) — 3D anatomical UX
// - Altibbi (Jordan) — Arabic medical clarity
// - Halodoc (Indonesia) — speed + urgency triage
//
// New: Diagnosis Hub → 4 entry points in a premium grid,
//      AI-powered urgency banner, recent sessions, body map

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
    Search, Activity, Stethoscope, Scan, Brain,
    Heart, AlertTriangle, ChevronLeft, Sparkles,
    Phone, Clock, ArrowLeft, MapPin, FlaskConical,
    Bot, MessageCircle, Zap,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { useRouter } from 'next/router';
import { motion as m } from 'framer-motion';
import SEO from '@/components/common/SEO';
import { createPageUrl } from '../utils';
import { masterDictionary } from '@/data/anatomy/masterDictionary';
import { db } from '@/lib/db';
import { useQuery } from '@tanstack/react-query';
import { emotionalDiseases, preloadEmotionalData } from '@/data/emotionalMedicineData';
import { aiClient } from '@/components/ai/aiClient';
import { SPRING_BOUNCY, SPRING_SMOOTH, STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/tibrah-motion';

const InteractiveBody     = dynamic(() => import('@/components/body-map/InteractiveBody'),       { ssr: false });
const RegionInspectionPanel = dynamic(() => import('@/components/body-map/RegionInspectionPanel'), { ssr: false });
const AnatomySearchModal  = dynamic(() => import('@/components/body-map/AnatomySearchModal'),    { ssr: false });

// ─── Design tokens ────────────────────────────────────────────────
const DIAG_COLORS = {
    bodymap:  { from: '#0d9488', to: '#14b8a6', glow: 'rgba(13,148,136,0.30)' },
    symptoms: { from: '#7c3aed', to: '#8b5cf6', glow: 'rgba(124,58,237,0.28)' },
    ai:       { from: '#dc2626', to: '#ef4444', glow: 'rgba(220,38,38,0.26)' },
    emotional:{ from: '#d97706', to: '#f59e0b', glow: 'rgba(217,119,6,0.26)' },
};

// ─── Urgency Entry Points ──────────────────────────────────────────
const URGENCY_SIGNALS = [
    { label: 'ألم في الصدر',   emoji: '💔', urgent: true  },
    { label: 'ضيق تنفس',       emoji: '🫁', urgent: true  },
    { label: 'دوار شديد',      emoji: '🌀', urgent: true  },
    { label: 'صداع',           emoji: '🧠', urgent: false },
    { label: 'ألم بطن',        emoji: '🫀', urgent: false },
    { label: 'حرارة',          emoji: '🌡️', urgent: false },
    { label: 'تعب عام',        emoji: '😓', urgent: false },
    { label: 'آلام مفاصل',     emoji: '🦵', urgent: false },
];

/* ── Emergency Banner ── */
function EmergencyBanner() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-1 rounded-[18px] overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#7f1d1d,#dc2626)', boxShadow: '0 8px 24px rgba(220,38,38,0.30)' }}>
            <div className="flex items-center gap-3 px-4 py-3">
                <motion.div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
                    animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
                    <AlertTriangle className="w-4 h-4 text-white" />
                </motion.div>
                <div className="flex-1">
                    <p className="text-[12px] font-black text-white">حالة طارئة؟</p>
                    <p className="text-[10px] text-white/70">اتصل بالإسعاف مباشرة</p>
                </div>
                <a href="tel:997"
                    onClick={() => haptic.trigger('heavy')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full">
                    <Phone className="w-3 h-3 text-red-600" />
                    <span className="text-[11px] font-black text-red-600">997</span>
                </a>
            </div>
        </motion.div>
    );
}

/* ── Quick Symptom chips ── */
function QuickSymptoms({ onSelect }: { onSelect: (s: string) => void }) {
    return (
        <div className="px-4">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">الأكثر شيوعاً</p>
            <div className="flex flex-wrap gap-2">
                {URGENCY_SIGNALS.map(sig => (
                    <motion.button key={sig.label}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => { haptic.selection(); onSelect(sig.label); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-bold"
                        style={{
                            background: sig.urgent ? 'rgba(220,38,38,0.08)' : 'rgba(0,0,0,0.05)',
                            border:     sig.urgent ? '1.5px solid rgba(220,38,38,0.22)' : '1.5px solid rgba(0,0,0,0.08)',
                            color:      sig.urgent ? '#dc2626' : '#475569',
                        }}>
                        <span>{sig.emoji}</span>
                        {sig.label}
                        {sig.urgent && (
                            <motion.div className="w-1.5 h-1.5 rounded-full bg-red-500"
                                animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

/* ── Diagnosis Mode Cards ── */
interface ModeCard {
    id:     string;
    title:  string;
    sub:    string;
    emoji:  string;
    href:   string;
    colors: { from: string; to: string; glow: string };
    badge?: string;
}

const MODES: ModeCard[] = [
    {
        id: 'bodymap', title: 'خريطة جسمي',    sub: 'انقر على العضو للتشخيص',
        emoji: '🫀', href: '#bodymap',          colors: DIAG_COLORS.bodymap,
    },
    {
        id: 'symptoms', title: 'مدقق الأعراض', sub: 'استبيان ذكي مدعوم طبياً',
        emoji: '🔍', href: '/symptom-checker',  colors: DIAG_COLORS.symptoms,
    },
    {
        id: 'ai', title: 'تشخيص بالذكاء',   sub: 'تحليل فوري بالذكاء الاصطناعي',
        emoji: '🤖', href: '/symptom-analysis', colors: DIAG_COLORS.ai, badge: 'جديد',
    },
    {
        id: 'emotional', title: 'الطب الشعوري', sub: 'رسائل الجسم والعواطف',
        emoji: '💫', href: '/emotional-medicine', colors: DIAG_COLORS.emotional,
    },
];

function ModeGrid({ onBodyMap }: { onBodyMap: () => void }) {
    return (
        <motion.div variants={STAGGER_CONTAINER} initial="hidden" animate="show"
            className="grid grid-cols-2 gap-3 px-4">
            {MODES.map(mode => (
                <motion.div key={mode.id} variants={STAGGER_ITEM}>
                    {mode.id === 'bodymap' ? (
                        <motion.button whileTap={{ scale: 0.95 }}
                            onClick={onBodyMap}
                            className="relative w-full overflow-hidden rounded-[22px] p-4 text-right flex flex-col gap-2"
                            style={{
                                background: `linear-gradient(145deg, ${mode.colors.from}, ${mode.colors.to})`,
                                boxShadow:  `0 8px 28px ${mode.colors.glow}`,
                            }}>
                            <span className="text-[28px]">{mode.emoji}</span>
                            <div>
                                <p className="text-[14px] font-black text-white">{mode.title}</p>
                                <p className="text-[10px] text-white/70 mt-0.5">{mode.sub}</p>
                            </div>
                            <div className="absolute top-3 left-3 opacity-10 text-[60px] leading-none">{mode.emoji}</div>
                        </motion.button>
                    ) : (
                        <Link href={mode.href}>
                            <motion.div whileTap={{ scale: 0.95 }}
                                className="relative overflow-hidden rounded-[22px] p-4 text-right flex flex-col gap-2"
                                style={{
                                    background: `linear-gradient(145deg, ${mode.colors.from}, ${mode.colors.to})`,
                                    boxShadow:  `0 8px 28px ${mode.colors.glow}`,
                                }}>
                                <div className="flex items-start justify-between">
                                    <span className="text-[28px]">{mode.emoji}</span>
                                    {mode.badge && (
                                        <span className="text-[9px] font-black text-white bg-white/25 px-2 py-0.5 rounded-full">
                                            {mode.badge}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[14px] font-black text-white">{mode.title}</p>
                                    <p className="text-[10px] text-white/70 mt-0.5">{mode.sub}</p>
                                </div>
                                <div className="absolute top-3 left-3 opacity-10 text-[60px] leading-none">{mode.emoji}</div>
                            </motion.div>
                        </Link>
                    )}
                </motion.div>
            ))}
        </motion.div>
    );
}

/* ── AI Triage Chip strip (worldwide inspiration) ── */
function AiTriageStrip({ onSelect }: { onSelect: (q: string) => void }) {
    const questions = [
        'هل الألم مستمر أم متقطع؟',
        'منذ متى بدأت الأعراض؟',
        'هل تتحسن مع الراحة؟',
        'هل يصاحبها حرارة؟',
    ];
    return (
        <div className="px-4 space-y-2">
            <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-500" />
                <p className="text-[10.5px] font-extrabold text-violet-500 uppercase tracking-widest">تريدني أسألك؟</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {questions.map((q, i) => (
                    <motion.button key={i} whileTap={{ scale: 0.94 }}
                        onClick={() => { haptic.selection(); onSelect(q); }}
                        className="flex-shrink-0 px-3 py-2 rounded-[14px] text-[11px] font-bold text-violet-600"
                        style={{ background: 'rgba(124,58,237,0.08)', border: '1.5px solid rgba(124,58,237,0.18)' }}>
                        {q}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

/* ── Section label ── */
function SL({ label, icon: Icon, color = '#0d9488' }: {
    label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color?: string;
}) {
    return (
        <div className="flex items-center gap-2 px-4">
            <div className="w-5 h-5 rounded-[7px] flex items-center justify-center" style={{ background: `${color}12` }}>
                <Icon className="w-3 h-3" style={{ color }} />
            </div>
            <span className="text-[10.5px] font-extrabold uppercase tracking-[0.1em]" style={{ color: `${color}90` }}>{label}</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}14)` }} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function BodyMap() {
    const router = useRouter();
    const [showBodyMap, setShowBodyMap]     = useState(false);
    const [selectedSystem, setSelectedSystem] = useState<any>(null);
    const [isSearchOpen, setIsSearchOpen]   = useState(false);
    const [aiInsight, setAiInsight]         = useState<any>(null);
    const [aiLoading, setAiLoading]         = useState(false);
    const [searchQuery, setSearchQuery]     = useState('');
    const [showSearch, setShowSearch]       = useState(false);

    useEffect(() => { preloadEmotionalData(); }, []);

    const { data: allProducts = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => db.entities.Product.list(),
    });

    const runAiBodyAnalysis = async (targetName: string, targetEmotion: string) => {
        setAiLoading(true); setAiInsight(null);
        try {
            const result = await aiClient.analyzeBodyMap(targetName, [targetEmotion]);
            setAiInsight(result);
        } catch { /* silent */ } finally { setAiLoading(false); }
    };

    const handleSelectPart = (id: string) => {
        if (!id) { setSelectedSystem(null); return; }
        const map: Record<string, string> = {
            head: 'head', face: 'head', brain: 'head', eyes: 'head', jaw: 'head',
            throat: 'throat', neck: 'throat', thyroid: 'throat',
            chest: 'chest', heart: 'chest', lungs: 'chest',
            abdomen: 'abdomen', stomach: 'abdomen', liver: 'abdomen',
            back: 'back', spine: 'back', lower_back: 'back', shoulders_back: 'back',
            upper_limb: 'upper_limb', arm: 'upper_limb', shoulder: 'upper_limb',
            lower_limb: 'lower_limb', legs: 'lower_limb', foot: 'lower_limb',
        };
        const data = masterDictionary[map[id] || id];
        if (data) setSelectedSystem(data);
    };

    const relatedDiseases = selectedSystem ? (() => {
        const kw = [selectedSystem.name, ...selectedSystem.tissues.map((t: any) => t.name)];
        return emotionalDiseases.filter(d => kw.some(k => d.targetOrgan.includes(k))).slice(0, 3);
    })() : [];

    return (
        <div className="min-h-screen pb-28" dir="rtl"
            style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%)' }}>
            <SEO title="تشخيصي — طِبرَا" description="مركز التشخيص الصحي بالذكاء الاصطناعي" />

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-30 pb-3 pt-4 space-y-3"
                style={{
                    background: 'rgba(248,250,252,0.95)',
                    backdropFilter: 'blur(32px)',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}>
                {/* Title row */}
                <div className="flex items-center justify-between px-4">
                    <motion.button whileTap={{ scale: 0.90 }} onClick={() => router.back()}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.05)' }}>
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </motion.button>
                    <div className="text-center">
                        <h1 className="text-[17px] font-black text-slate-900">تشخيصي</h1>
                        <p className="text-[10px] text-slate-400">مركز التحليل الصحي</p>
                    </div>
                    <motion.button whileTap={{ scale: 0.90 }}
                        onClick={() => { setShowSearch(s => !s); haptic.selection(); }}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.05)' }}>
                        <Search className="w-4.5 h-4.5 text-slate-600" style={{ width: 18, height: 18 }} />
                    </motion.button>
                </div>

                {/* Search bar */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.div className="px-4"
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}>
                            <input type="text" value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن عرَض أو عضو..."
                                autoFocus
                                className="w-full rounded-[16px] px-4 py-3 text-[13px] outline-none font-medium"
                                style={{
                                    background: 'rgba(0,0,0,0.05)',
                                    border: '1.5px solid rgba(0,0,0,0.08)',
                                }}
                                onFocus={() => setIsSearchOpen(true)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-col gap-5 pt-4">

                {/* Emergency banner */}
                <EmergencyBanner />

                {/* Quick symptom chips */}
                <QuickSymptoms onSelect={(s) => {
                    setSearchQuery(s);
                    router.push('/symptom-checker');
                }} />

                {/* Diagnostic modes grid */}
                <SL label="اختر طريقة التشخيص" icon={Stethoscope} color="#0d9488" />
                <ModeGrid onBodyMap={() => {
                    setShowBodyMap(true);
                    haptic.impact();
                    setTimeout(() => {
                        document.getElementById('bodymap-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }} />

                {/* AI triage strip */}
                <SL label="تشخيص بالذكاء" icon={Bot} color="#7c3aed" />
                <AiTriageStrip onSelect={(q) => router.push(`/symptom-analysis?q=${encodeURIComponent(q)}`)} />

                {/* Body map section */}
                <AnimatePresence>
                    {showBodyMap && (
                        <motion.div id="bodymap-section"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }} transition={SPRING_SMOOTH}>
                            <SL label="خريطة الجسم" icon={MapPin} color="#0d9488" />
                            <div className="relative">
                                <InteractiveBody onSelectPart={handleSelectPart} className="mb-4" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Holistic links */}
                <SL label="صحة شاملة" icon={Heart} color="#d97706" />
                <div className="px-4 grid grid-cols-2 gap-3">
                    {[
                        { title: 'الطب الشعوري', sub: 'رسائل الجسم', emoji: '💫', href: '/emotional-medicine' },
                        { title: 'مسح الوجه',   sub: 'تحليل الحالة', emoji: '🔬', href: '/diagnosis/face-scan' },
                        { title: 'سجل الأعراض', sub: 'توثيق مستمر',  emoji: '📋', href: '/record-health' },
                        { title: 'احجز طبيب',   sub: 'استشارة مباشرة',emoji: '🩺', href: '/book-appointment' },
                    ].map(item => (
                        <Link key={item.title} href={item.href}>
                            <motion.div whileTap={{ scale: 0.96 }}
                                className="rounded-[18px] p-3.5 flex flex-col gap-2"
                                style={{
                                    background: 'rgba(255,255,255,0.92)',
                                    border: '1.5px solid rgba(0,0,0,0.07)',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                    backdropFilter: 'blur(20px)',
                                }}>
                                <span className="text-[24px]">{item.emoji}</span>
                                <div>
                                    <p className="text-[12.5px] font-black text-slate-800">{item.title}</p>
                                    <p className="text-[10px] text-slate-400">{item.sub}</p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* WhatsApp CTA */}
                <div className="mx-4 rounded-[22px] overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,#0d9488,#059669)', boxShadow: '0 8px 28px rgba(13,148,136,0.35)' }}>
                    <div className="p-5 text-center">
                        <p className="text-[15px] font-black text-white mb-1">تحتاج رأي متخصص؟</p>
                        <p className="text-[11px] text-white/70 mb-4">احجز جلسة تشخيصية مع د. عمر العماد</p>
                        <a href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20جلسة%20تشخيصية"
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white text-teal-700 font-black px-6 py-2.5 rounded-full text-[13px]"
                            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                            <MessageCircle className="w-4 h-4" />
                            احجز عبر واتساب
                        </a>
                    </div>
                </div>
            </div>

            {/* Body region panel */}
            <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
                <div className="pointer-events-auto">
                    <RegionInspectionPanel
                        region={selectedSystem}
                        onClose={() => setSelectedSystem(null)}
                        aiInsight={aiInsight}
                        aiLoading={aiLoading}
                        onRunAiAnalysis={runAiBodyAnalysis}
                        relatedDiseases={relatedDiseases}
                        suggestedProducts={selectedSystem ? allProducts.slice(0, 3) : []}
                    />
                </div>
            </div>

            {/* Anatomy search modal */}
            <AnatomySearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelectSubTissue={(sysId: string) => {
                    const data = masterDictionary[sysId];
                    if (data) { setSelectedSystem(data); setShowBodyMap(true); }
                    setIsSearchOpen(false);
                }}
            />
        </div>
    );
}

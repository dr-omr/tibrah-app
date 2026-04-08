'use client';
/**
 * EMDetailSheet.tsx — شيت تفاصيل الحالة الشعورية
 * 4 تبويبات: الجذر / البروتوكول / التأكيدات / الذكاء الاصطناعي
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Volume2, VolumeX, Copy, Check, ChevronLeft,
    Brain, Heart, Zap, Sparkles, Play, Pause,
    Target, BookOpen, Wind, Loader2,
} from 'lucide-react';
import { EmotionalCondition, ORGAN_SYSTEM_LABELS } from './em-types';

interface Props {
    condition: EmotionalCondition | null;
    onClose: () => void;
    onAIAnalysis: (c: EmotionalCondition) => void;
    aiLoading: boolean;
    aiInsight: string | null;
}

const TABS = [
    { id: 'root',     label: 'الجذر',    icon: Brain    },
    { id: 'protocol', label: 'الشفاء',   icon: Target   },
    { id: 'affirm',   label: 'تأكيدات',  icon: Heart    },
    { id: 'ai',       label: 'AI تحليل', icon: Sparkles },
] as const;

type Tab = typeof TABS[number]['id'];

export function EMDetailSheet({ condition: c, onClose, onAIAnalysis, aiLoading, aiInsight }: Props) {
    const [tab, setTab]       = useState<Tab>('root');
    const [copied, setCopied] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    const system = c ? ORGAN_SYSTEM_LABELS[c.organSystem] : null;

    /* Text-to-speech */
    const speak = useCallback((text: string) => {
        if (typeof window === 'undefined') return;
        if (speaking) {
            speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ar-SA';
        u.rate = 0.85;
        u.onstart = () => setSpeaking(true);
        u.onend   = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        speechSynthesis.speak(u);
    }, [speaking]);

    /* Copy affirmation */
    const copy = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    const SP = { type: 'spring' as const, stiffness: 380, damping: 34 };

    return (
        <AnimatePresence>
            {c && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80]"
                        style={{ background: 'rgba(10,5,25,0.70)', backdropFilter: 'blur(18px)' }}
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={SP}
                        className="fixed bottom-0 left-0 right-0 z-[90] rounded-t-[32px] overflow-hidden flex flex-col"
                        style={{
                            maxHeight: '92dvh',
                            background: 'linear-gradient(165deg,#1e0a2e,#150820 50%,#0a1628)',
                            border: '1px solid rgba(255,255,255,0.10)',
                            boxShadow: '0 -24px 80px rgba(0,0,0,0.40)',
                        }}
                        dir="rtl">

                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.20)' }} />
                        </div>

                        {/* ── Top header */}
                        <div className="px-5 pt-2 pb-4 flex-shrink-0"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="flex items-start gap-3">
                                {/* Organ icon */}
                                <div className="w-[52px] h-[52px] rounded-[16px] flex items-center justify-center flex-shrink-0 relative"
                                    style={{
                                        background: `${c.color}18`,
                                        border: `1.5px solid ${c.color}30`,
                                    }}>
                                    <div className="absolute top-0 left-2 right-2 h-px"
                                        style={{ background: 'rgba(255,255,255,0.12)' }} />
                                    <span className="text-2xl">{system?.emoji}</span>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                            style={{ background: `${c.color}20`, color: c.color }}>
                                            {system?.ar}
                                        </span>
                                    </div>
                                    <h2 className="text-[17px] font-black text-white leading-tight">{c.symptom}</h2>
                                    <p className="text-[10.5px] text-white/40 mt-0.5">{c.targetOrgan}</p>
                                </div>

                                <button onClick={onClose}
                                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ background: 'rgba(255,255,255,0.08)' }}>
                                    <X className="w-4 h-4 text-white/50" />
                                </button>
                            </div>
                        </div>

                        {/* ── Tabs */}
                        <div className="flex gap-1.5 px-5 pt-3 pb-2 flex-shrink-0">
                            {TABS.map(t => {
                                const Icon = t.icon;
                                const active = tab === t.id;
                                return (
                                    <motion.button key={t.id}
                                        whileTap={{ scale: 0.93 }}
                                        onClick={() => {
                                            setTab(t.id as Tab);
                                            if (t.id === 'ai' && !aiInsight && !aiLoading) onAIAnalysis(c);
                                        }}
                                        className="flex-1 flex flex-col items-center gap-1 py-2 rounded-[14px] transition-all"
                                        style={{
                                            background: active ? c.color : 'rgba(255,255,255,0.06)',
                                            border: active ? `1px solid ${c.color}` : '1px solid rgba(255,255,255,0.08)',
                                        }}>
                                        <Icon style={{ width: 13, height: 13, color: active ? 'white' : 'rgba(255,255,255,0.40)' }} />
                                        <span className={`text-[9px] font-black ${active ? 'text-white' : 'text-white/40'}`}>
                                            {t.label}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* ── Content */}
                        <div className="flex-1 overflow-y-auto px-5 pb-10" style={{ scrollbarWidth: 'none' }}>
                            <AnimatePresence mode="wait">
                                {/* ════ ROOT TAB ════ */}
                                {tab === 'root' && (
                                    <motion.div key="root"
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

                                        {/* Emotional conflict */}
                                        <div className="mt-4 rounded-[20px] p-4"
                                            style={{ background: `${c.color}12`, border: `1px solid ${c.color}20` }}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Zap style={{ width: 14, height: 14, color: c.color }} />
                                                <span className="text-[10.5px] font-black text-white/70">الصراع الشعوري الجذر</span>
                                            </div>
                                            <p className="text-[13.5px] text-white leading-relaxed font-semibold">
                                                {c.emotionalConflict}
                                            </p>
                                        </div>

                                        {/* Biological purpose */}
                                        <div className="mt-3 rounded-[20px] p-4"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Brain className="w-3.5 h-3.5 text-purple-400" />
                                                <span className="text-[10.5px] font-black text-white/60">الغرض البيولوجي</span>
                                            </div>
                                            <p className="text-[12.5px] text-white/75 leading-relaxed">
                                                {c.biologicalPurpose}
                                            </p>
                                        </div>

                                        {/* Trigger emotions */}
                                        <div className="mt-3">
                                            <p className="text-[10px] font-black text-white/50 mb-2">المشاعر المحركة</p>
                                            <div className="flex flex-wrap gap-2">
                                                {c.triggerEmotions.map((e, i) => (
                                                    <motion.div key={e}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.07 }}
                                                        className="px-3 py-1.5 rounded-full"
                                                        style={{
                                                            background: `${c.color}15`,
                                                            border: `1px solid ${c.color}25`,
                                                        }}>
                                                        <span className="text-[11px] font-bold" style={{ color: c.color }}>{e}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Chakra if exists */}
                                        {c.affectedChakra && (
                                            <div className="mt-3 rounded-[16px] p-3 flex items-center gap-3"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span className="text-xl">🌀</span>
                                                <div>
                                                    <p className="text-[9px] text-white/40 font-bold">الطاقة المرتبطة</p>
                                                    <p className="text-[12px] text-white/75 font-semibold">{c.affectedChakra}</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* ════ PROTOCOL TAB ════ */}
                                {tab === 'protocol' && (
                                    <motion.div key="protocol"
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

                                        <p className="text-[10.5px] text-white/40 font-semibold mt-4 mb-3">
                                            بروتوكول شفاء {c.healingSteps.length} خطوات — اتبعه يومياً لمدة ٢١ يوماً
                                        </p>

                                        <div className="relative">
                                            {/* Vertical line */}
                                            <div className="absolute top-0 bottom-0 right-[22px] w-[2px]"
                                                style={{ background: `linear-gradient(to bottom,${c.color}40,transparent)` }} />

                                            {c.healingSteps.map((step, i) => (
                                                <motion.div key={step.step}
                                                    initial={{ opacity: 0, x: -16 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="flex gap-3 mb-4">
                                                    {/* Step circle */}
                                                    <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl relative z-10"
                                                        style={{
                                                            background: `${c.color}18`,
                                                            border: `2px solid ${c.color}30`,
                                                        }}>
                                                        {step.icon}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 rounded-[16px] p-3.5"
                                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <h4 className="text-[13px] font-black text-white">{step.title}</h4>
                                                            {step.duration && (
                                                                <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                                                    style={{ background: `${c.color}18`, color: c.color }}>
                                                                    {step.duration}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11.5px] text-white/60 leading-relaxed">
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Breathing technique */}
                                        {c.breathingTech && (
                                            <div className="mt-2 rounded-[16px] p-3.5 flex items-center gap-3"
                                                style={{ background: 'rgba(8,145,178,0.12)', border: '1px solid rgba(8,145,178,0.20)' }}>
                                                <Wind className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                                                <div>
                                                    <p className="text-[9px] text-cyan-400/70 font-bold">تقنية التنفس الموصى بها</p>
                                                    <p className="text-[12px] text-white/80 font-bold">{c.breathingTech}</p>
                                                </div>
                                                <ChevronLeft className="w-4 h-4 text-cyan-400/50 mr-auto" />
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* ════ AFFIRMATIONS TAB ════ */}
                                {tab === 'affirm' && (
                                    <motion.div key="affirm"
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

                                        {/* Main affirmation card */}
                                        <div className="mt-4 relative overflow-hidden rounded-[24px] p-5"
                                            style={{ background: `linear-gradient(135deg,${c.color}25,${c.color}08)`, border: `1.5px solid ${c.color}30` }}>
                                            <div className="absolute top-0 left-0 right-0 h-px"
                                                style={{ background: 'rgba(255,255,255,0.12)' }} />
                                            <Heart className="w-5 h-5 mb-3" style={{ color: c.color }} fill="currentColor" />
                                            <p className="text-[15.5px] font-black text-white leading-relaxed mb-2">
                                                {c.healingAffirmation}
                                            </p>
                                            <p className="text-[11px] text-white/40 italic mb-4">{c.affirmationEn}</p>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <motion.button whileTap={{ scale: 0.92 }}
                                                    onClick={() => speak(c.healingAffirmation)}
                                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-[11px] font-bold text-[11px]"
                                                    style={{ background: speaking ? c.color : 'rgba(255,255,255,0.10)', color: 'white' }}>
                                                    {speaking
                                                        ? <><Pause className="w-3.5 h-3.5" /> إيقاف</>
                                                        : <><Play  className="w-3.5 h-3.5" /> استمع</>}
                                                </motion.button>

                                                <motion.button whileTap={{ scale: 0.92 }}
                                                    onClick={() => copy(c.healingAffirmation)}
                                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-[11px] font-bold text-[11px]"
                                                    style={{ background: 'rgba(255,255,255,0.10)', color: 'white' }}>
                                                    {copied
                                                        ? <><Check className="w-3.5 h-3.5 text-green-400" /> تم النسخ</>
                                                        : <><Copy  className="w-3.5 h-3.5" /> نسخ</>}
                                                </motion.button>
                                            </div>
                                        </div>

                                        {/* How to use affirmations */}
                                        <div className="mt-4 rounded-[20px] p-4"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <BookOpen className="w-3.5 h-3.5 text-white/40" />
                                                <p className="text-[10px] font-black text-white/50">كيف تستخدم التأكيدات بفاعلية؟</p>
                                            </div>
                                            {[
                                                { n: '١', t: 'أمام المرآة', d: 'قل التأكيد وأنت تنظر في عينيك. ٥ مرات صباحاً.' },
                                                { n: '٢', t: 'قبل النوم', d: 'كررها ١٠ مرات بينما تضع يدك على قلبك.' },
                                                { n: '٣', t: 'اكتبها', d: 'اكتبها يومياً في دفتر. الكتابة تُرسّخ البرمجة العصبية.' },
                                            ].map(tip => (
                                                <div key={tip.n} className="flex gap-2.5 mb-3">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                                                        style={{ background: `${c.color}20`, color: c.color }}>
                                                        {tip.n}
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-white/80">{tip.t}</p>
                                                        <p className="text-[10px] text-white/45">{tip.d}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ════ AI TAB ════ */}
                                {tab === 'ai' && (
                                    <motion.div key="ai"
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

                                        <div className="mt-4">
                                            {aiLoading ? (
                                                <div className="flex flex-col items-center py-16 gap-4">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                                                        <Loader2 className="w-9 h-9" style={{ color: c.color }} />
                                                    </motion.div>
                                                    <p className="text-[13px] text-white/50 font-semibold">
                                                        الذكاء الاصطناعي يُحلّل الحالة...
                                                    </p>
                                                </div>
                                            ) : aiInsight ? (
                                                <div className="rounded-[20px] p-4"
                                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Sparkles className="w-4 h-4" style={{ color: c.color }} />
                                                        <p className="text-[11px] font-black text-white/60">رؤية AI الشخصية</p>
                                                    </div>
                                                    <p className="text-[13px] text-white/80 leading-relaxed">{aiInsight}</p>
                                                    <button onClick={() => onAIAnalysis(c)}
                                                        className="mt-4 text-[10px] font-bold text-white/40 underline">
                                                        تحديث التحليل
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                                                        style={{ background: `${c.color}18` }}>
                                                        <Sparkles className="w-7 h-7" style={{ color: c.color }} />
                                                    </div>
                                                    <p className="text-[14px] font-bold text-white/60 mb-2">جاهز للتحليل الذكي</p>
                                                    <p className="text-[11px] text-white/35 mb-6">
                                                        سيُحلّل الذكاء الاصطناعي حالتك ويُقدّم رؤية شخصية معمّقة
                                                    </p>
                                                    <motion.button whileTap={{ scale: 0.95 }}
                                                        onClick={() => onAIAnalysis(c)}
                                                        className="px-7 py-3 rounded-[14px] font-black text-[13px] text-white"
                                                        style={{ background: c.color, boxShadow: `0 8px 24px ${c.color}35` }}>
                                                        ابدأ التحليل الذكي ✨
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

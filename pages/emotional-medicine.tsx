'use client';
/**
 * pages/emotional-medicine.tsx — الطب الشعوري
 * الصفحة الرئيسية: تنسيق جميع مكونات النظام
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Wind, Radio, ScanLine, BookOpen, ChevronLeft,
} from 'lucide-react';

import { EMHero }          from '@/components/emotional-medicine/EMHero';
import { EMSystemFilter }  from '@/components/emotional-medicine/EMSystemFilter';
import { EMConditionCard } from '@/components/emotional-medicine/EMConditionCard';
import { EMDetailSheet }   from '@/components/emotional-medicine/EMDetailSheet';
import { EMOTIONAL_CONDITIONS, searchConditions } from '@/components/emotional-medicine/em-data';
import { EmotionalCondition, OrganSystem } from '@/components/emotional-medicine/em-types';
import { aiClient } from '@/components/ai/aiClient';
import { haptic } from '@/lib/HapticFeedback';

/* ── Related resources */
const RESOURCES = [
    { title: 'تمارين التنفس',    emoji: '🌬️', href: '/breathe',          color: '#0891B2' },
    { title: 'الترددات العلاجية', emoji: '🎵', href: '/frequencies',       color: '#7C3AED' },
    { title: 'خريطة الجسد',      emoji: '🧘', href: '/body-map',          color: '#059669' },
    { title: 'تحليل الأعراض',    emoji: '🔍', href: '/symptom-analysis',  color: '#EA580C' },
    { title: 'التأمل',            emoji: '🌿', href: '/meditation',        color: '#4F46E5' },
    { title: 'المكتبة الصحية',    emoji: '📚', href: '/library',           color: '#D97706' },
];

export default function EmotionalMedicinePage() {
    const [search,   setSearch]   = useState('');
    const [system,   setSystem]   = useState<OrganSystem | null>(null);
    const [selected, setSelected] = useState<EmotionalCondition | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [aiLoading,   setAiLoading]   = useState(false);
    const [aiInsight,   setAiInsight]   = useState<string | null>(null);

    /* ── Cleanup TTS on unmount */
    useEffect(() => () => {
        if (typeof window !== 'undefined') speechSynthesis.cancel();
    }, []);

    /* ── Reset ai when condition changes */
    useEffect(() => { setAiInsight(null); }, [selected?.id]);

    /* ── Filtered list */
    const conditions = useMemo(() => {
        let list = search.trim()
            ? searchConditions(search)
            : EMOTIONAL_CONDITIONS;
        if (system) list = list.filter(c => c.organSystem === system);
        return list;
    }, [search, system]);

    /* ── Voice search */
    const handleVoiceSearch = useCallback(() => {
        if (typeof window === 'undefined') return;
        const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SR) return;
        const rec = new SR();
        rec.lang = 'ar-SA';
        rec.onstart  = () => setIsListening(true);
        rec.onend    = () => setIsListening(false);
        rec.onerror  = () => setIsListening(false);
        rec.onresult = (e: any) => setSearch(e.results[0][0].transcript);
        rec.start();
    }, []);

    /* ── AI Analysis */
    const handleAI = useCallback(async (c: EmotionalCondition) => {
        setAiLoading(true);
        setAiInsight(null);
        try {
            const result = await aiClient.analyzeBodyMap(
                c.targetOrgan,
                [c.symptom, c.emotionalConflict, ...c.triggerEmotions],
            );
            setAiInsight(
                typeof result === 'string'
                    ? result
                    : result?.summary || JSON.stringify(result)
            );
        } catch {
            setAiInsight('حدث خطأ في التحليل. تأكد من اتصالك بالإنترنت وحاول مجدداً.');
        } finally {
            setAiLoading(false);
        }
    }, []);

    /* ── Select condition */
    const handleSelect = useCallback((c: EmotionalCondition) => {
        haptic.impact();
        setSelected(c);
    }, []);

    return (
        <>
            <Head>
                <title>الطب الشعوري | طِبرَا</title>
                <meta name="description"
                    content="اكتشف الجذر الشعوري لأعراضك الجسدية مع بروتوكولات الشفاء المتكاملة — الطب الشعوري على طِبرَا" />
            </Head>

            {/* ── Dark theme page background */}
            <div className="min-h-screen pb-28" dir="rtl"
                style={{ background: 'linear-gradient(180deg,#1e0a2e 0%,#0f0a1e 300px,#f8fafc 300px)' }}>

                {/* ── Hero */}
                <EMHero
                    searchQuery={search}
                    setSearchQuery={setSearch}
                    isListening={isListening}
                    onVoiceSearch={handleVoiceSearch}
                    onSelectSuggestion={setSearch}
                />

                {/* ── Transition wave */}
                <div className="relative" style={{ marginTop: -2 }}>
                    <svg viewBox="0 0 390 32" className="w-full" style={{ display: 'block' }}>
                        <path d="M0,20 Q97.5,0 195,16 Q292.5,32 390,12 L390,32 L0,32 Z"
                            fill="#f8fafc" />
                    </svg>
                </div>

                {/* ── Light section */}
                <div style={{ background: '#f8fafc' }}>

                    {/* System filter */}
                    <div className="pt-2 pb-1">
                        <EMSystemFilter selected={system} onSelect={setSystem} />
                    </div>

                    {/* Results header */}
                    <AnimatePresence>
                        <motion.div
                            key={conditions.length}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex items-center justify-between px-5 py-2">
                            <p className="text-[12px] font-black text-slate-800">
                                {search || system
                                    ? `${conditions.length} نتيجة`
                                    : `${conditions.length} حالة شعورية`}
                            </p>
                            {(search || system) && (
                                <button
                                    onClick={() => { setSearch(''); setSystem(null); }}
                                    className="text-[10.5px] font-bold text-rose-500">
                                    مسح الفلاتر
                                </button>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Condition cards grid */}
                    <div className="px-4 pb-6">
                        {conditions.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                className="mt-16 flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(225,29,72,0.10)' }}>
                                    <span className="text-2xl">🧠</span>
                                </div>
                                <p className="text-[14px] text-slate-500 font-bold">
                                    لا توجد نتائج لـ "{search}"
                                </p>
                                <p className="text-[11px] text-slate-400">
                                    جرب البحث بكلمات مختلفة
                                </p>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {conditions.map((c, i) => (
                                    <EMConditionCard key={c.id} condition={c} index={i} onSelect={handleSelect} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Related Resources */}
                    {!search && !system && (
                        <div className="px-5 pt-2 pb-6">
                            <h2 className="text-[15px] font-black text-slate-800 mb-4 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-rose-500" />
                                موارد شفاء مرتبطة
                            </h2>
                            <div className="grid grid-cols-3 gap-2.5">
                                {RESOURCES.map((r, i) => (
                                    <Link key={r.href} href={r.href}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            whileTap={{ scale: 0.94 }}
                                            className="relative overflow-hidden rounded-[18px] p-3.5"
                                            style={{
                                                background: `${r.color}10`,
                                                border: `1.5px solid ${r.color}18`,
                                            }}>
                                            <div className="absolute top-0 left-2 right-2 h-px"
                                                style={{ background: 'rgba(255,255,255,0.6)' }} />
                                            <span className="text-2xl block mb-2">{r.emoji}</span>
                                            <p className="text-[10.5px] font-black leading-tight"
                                                style={{ color: r.color }}>
                                                {r.title}
                                            </p>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── WhatsApp CTA */}
                    {!search && !system && (
                        <div className="mx-5 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="relative overflow-hidden rounded-[28px] p-6"
                                style={{
                                    background: 'linear-gradient(135deg,#1e0a2e,#2d1145)',
                                    boxShadow: '0 16px 48px rgba(30,10,46,0.22)',
                                }}>
                                <div className="absolute top-0 left-0 right-0 h-px"
                                    style={{ background: 'rgba(255,255,255,0.10)' }} />
                                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full"
                                    style={{ background: 'rgba(225,29,72,0.12)', filter: 'blur(32px)' }} />
                                <div className="relative text-center">
                                    <motion.span
                                        className="text-4xl block mb-3"
                                        animate={{ scale: [1, 1.12, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}>
                                        ❤️
                                    </motion.span>
                                    <h3 className="text-[18px] font-black text-white mb-2">
                                        تحتاج استشارة خاصة؟
                                    </h3>
                                    <p className="text-[11.5px] text-white/55 mb-5 leading-relaxed">
                                        د. عمر العماد — متخصص في الطب الشعوري والعلاج بالوعي.
                                        احجز جلستك الآن.
                                    </p>
                                    <a href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20استشارة%20في%20الطب%20الشعوري"
                                        target="_blank" rel="noopener noreferrer">
                                        <motion.div
                                            whileTap={{ scale: 0.96 }}
                                            className="flex items-center justify-center gap-2 py-3.5 rounded-[16px] font-black text-[13.5px] text-white"
                                            style={{
                                                background: 'linear-gradient(135deg,#E11D48,#D97706)',
                                                boxShadow: '0 6px 20px rgba(225,29,72,0.30)',
                                            }}>
                                            <MessageCircle className="w-4.5 h-4.5" />
                                            تواصل عبر واتساب
                                        </motion.div>
                                    </a>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Detail bottom sheet */}
            <EMDetailSheet
                condition={selected}
                onClose={() => setSelected(null)}
                onAIAnalysis={handleAI}
                aiLoading={aiLoading}
                aiInsight={aiInsight}
            />
        </>
    );
}

'use client';
/**
 * EMHero.tsx — قسم الطب الشعوري: الهيدر الرئيسي المتحرك
 * Brain-Heart animated connection + live stats + smart search
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Search, Mic, X, Heart, Brain, Sparkles, ArrowRight } from 'lucide-react';
import { EMOTIONAL_CONDITIONS } from './em-data';

interface Props {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    isListening: boolean;
    onVoiceSearch: () => void;
    onSelectSuggestion: (q: string) => void;
}

const QUICK_SEARCHES = ['صداع', 'قولون', 'ظهر', 'ضغط الدم', 'إرهاق', 'أرق', 'حلق', 'جلد'];

export function EMHero({ searchQuery, setSearchQuery, isListening, onVoiceSearch, onSelectSuggestion }: Props) {
    const [focused, setFocused] = useState(false);
    const [tick, setTick] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    /* Pulse animation tick */
    useEffect(() => {
        const t = setInterval(() => setTick(n => n + 1), 2400);
        return () => clearInterval(t);
    }, []);

    const STATS = [
        { label: 'حالة شعورية', value: EMOTIONAL_CONDITIONS.length + '+', emoji: '🧠' },
        { label: 'بروتوكول شفاء', value: '٦٠+', emoji: '✨' },
        { label: 'تأكيد شفائي', value: '١٢٠+', emoji: '💬' },
    ];

    return (
        <div className="relative overflow-hidden" dir="rtl">
            {/* ── Layered background */}
            <div className="absolute inset-0">
                <div style={{ background: 'linear-gradient(160deg,#1e0a2e 0%,#150820 40%,#0a1628 100%)' }}
                    className="absolute inset-0" />
                {/* Animated orbs */}
                <motion.div className="absolute top-8 right-8 w-56 h-56 rounded-full"
                    style={{ background: 'radial-gradient(circle,rgba(225,29,72,0.22),transparent 70%)' }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
                <motion.div className="absolute bottom-16 left-4 w-44 h-44 rounded-full"
                    style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.20),transparent 70%)' }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
                <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
                    style={{ background: 'radial-gradient(circle,rgba(79,70,229,0.12),transparent 70%)' }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
                {/* Subtle grid */}
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px,transparent 1px)',
                    backgroundSize: '28px 28px',
                }} />
            </div>

            <div className="relative px-5 pt-14 pb-8">

                {/* ── Brain-Heart connection SVG animation */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-48 h-24 flex items-center justify-between">
                        {/* Brain */}
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="relative z-10">
                            <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(124,58,237,0.18)', border: '1.5px solid rgba(124,58,237,0.35)' }}>
                                <Brain className="w-6 h-6 text-purple-400" />
                            </div>
                            <motion.div className="absolute inset-0 rounded-full"
                                style={{ border: '2px solid rgba(124,58,237,0.4)' }}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2.4, repeat: Infinity }} />
                        </motion.div>

                        {/* Animated connection line */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 192 96">
                            <defs>
                                <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#7C3AED" />
                                    <stop offset="50%" stopColor="#E11D48" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#E11D48" />
                                </linearGradient>
                            </defs>
                            <motion.path
                                d="M 58 48 C 88 28, 104 68, 134 48"
                                fill="none"
                                stroke="url(#connGrad)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray="10 6"
                                animate={{ strokeDashoffset: [0, -32] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            />
                            {/* Pulse dot */}
                            <motion.circle r="4" fill="#EC4899"
                                animate={{
                                    cx: [58, 88, 118, 134],
                                    cy: [48, 30, 66, 48],
                                    opacity: [0, 1, 1, 0],
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        </svg>

                        {/* Heart */}
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], y: [0, -4, 0] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                            className="relative z-10">
                            <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(225,29,72,0.18)', border: '1.5px solid rgba(225,29,72,0.35)' }}>
                                <Heart className="w-5 h-5 text-rose-400" fill="currentColor" />
                            </div>
                            <motion.div className="absolute inset-0 rounded-full"
                                style={{ border: '2px solid rgba(225,29,72,0.4)' }}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2.4, repeat: Infinity, delay: 0.6 }} />
                        </motion.div>
                    </div>
                </div>

                {/* ── Badge */}
                <div className="flex justify-center mb-3">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
                        style={{
                            background: 'rgba(225,29,72,0.15)',
                            border: '1px solid rgba(225,29,72,0.30)',
                            color: '#FDA4AF',
                        }}>
                        <Sparkles className="w-3 h-3" />
                        الطب الشعوري — العقل والجسم كنظام واحد
                    </motion.div>
                </div>

                {/* ── Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-[26px] font-black text-white leading-tight mb-2">
                    جسمك يتكلم
                    <br />
                    <span style={{ background: 'linear-gradient(to left,#F472B6,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        هل تستمع له؟
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                    className="text-center text-[12px] text-white/50 mb-6 leading-relaxed px-4">
                    كل عرض جسدي له جذر شعوري. اكتشف الصراع — ثم اشفَ من الداخل.
                </motion.p>

                {/* ── Search bar */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    className="relative">
                    <div className="flex items-center gap-2.5 px-4 h-[50px] rounded-[16px] mx-1"
                        style={{
                            background: focused ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.09)',
                            border: focused ? '1.5px solid rgba(244,114,182,0.50)' : '1.5px solid rgba(255,255,255,0.12)',
                            boxShadow: focused ? '0 0 0 3px rgba(244,114,182,0.12)' : 'none',
                            transition: 'all 0.25s',
                        }}>
                        <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                        <input ref={inputRef} type="text" dir="rtl"
                            placeholder="ابحث عن عرض جسدي أو مشاعر..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setTimeout(() => setFocused(false), 200)}
                            className="flex-1 bg-transparent text-[13px] font-semibold text-white placeholder-white/30 outline-none text-right"
                        />
                        {searchQuery ? (
                            <button onClick={() => setSearchQuery('')}
                                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(255,255,255,0.15)' }}>
                                <X className="w-3 h-3 text-white/60" />
                            </button>
                        ) : (
                            <motion.button onClick={onVoiceSearch}
                                whileTap={{ scale: 0.85 }}
                                animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: isListening ? 'rgba(244,114,182,0.35)' : 'rgba(255,255,255,0.10)' }}>
                                <Mic className={`w-3.5 h-3.5 ${isListening ? 'text-pink-300' : 'text-white/50'}`} />
                            </motion.button>
                        )}
                    </div>

                    {/* Quick search pills */}
                    <AnimatePresence>
                        {!searchQuery && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-wrap gap-1.5 mt-3 px-1">
                                {QUICK_SEARCHES.map((q, i) => (
                                    <motion.button key={q}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.04 }}
                                        whileTap={{ scale: 0.92 }}
                                        onClick={() => { setSearchQuery(q); onSelectSuggestion(q); }}
                                        className="px-3 py-1 rounded-full text-[10.5px] font-bold"
                                        style={{
                                            background: 'rgba(255,255,255,0.08)',
                                            border: '1px solid rgba(255,255,255,0.14)',
                                            color: 'rgba(255,255,255,0.65)',
                                        }}>
                                        {q}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── Stats strip */}
                <div className="grid grid-cols-3 gap-2 mt-6 mx-1">
                    {STATS.map((s, i) => (
                        <motion.div key={s.label}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 + i * 0.08 }}
                            className="flex flex-col items-center py-3 rounded-[14px]"
                            style={{
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.10)',
                            }}>
                            <span className="text-base mb-0.5">{s.emoji}</span>
                            <p className="text-[15px] font-black text-white">{s.value}</p>
                            <p className="text-[9px] text-white/40 font-semibold">{s.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

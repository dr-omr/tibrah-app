'use client';
/**
 * RuhiPrograms.tsx — برامج السكون والحضور
 * ──────────────────────────────────────────
 * ✦ Featured: الصوت والترددات — Frequency Wave Card
 * ✦ Live frequency wave animation + 4 برامج
 */
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Volume2, ArrowLeft, Radio } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { ServiceTile } from '@/components/sections/ServiceTile';
import { SP, SP_SLOW } from '@/components/sections/section-shared';

const C  = '#2563EB';
const CA = '#4F46E5';

const ITEMS = [
    { href: '/programs/frequencies',     label: 'الصوت والترددات',            sub: 'علاج تكميلي بالموجات الصوتية',  isNew: true, type: 'practical' as const },
    { href: '/programs/meditation',      label: 'برنامج التأمل التدريجي',      sub: 'من المبتدئ للمتعمق',            type: 'practical' as const },
    { href: '/programs/morning-ritual',  label: 'الطقوس اليومية',              sub: 'روتين صباحي ومسائي روحي',      type: 'practical' as const },
    { href: '/programs/meaning-journey', label: 'رحلة المعنى والرسالة',        sub: 'لماذا تعيش؟ ما رسالتك؟',        type: 'practical' as const },
];

/* Wave bars — 12 bars animate like equalizer */
const WAVE_BARS = Array.from({ length: 12 }, (_, i) => ({
    height: 20 + Math.sin(i * 0.8) * 16 + Math.random() * 10,
    delay: i * 0.08,
    duration: 0.9 + (i % 3) * 0.3,
}));

const FREQ_PRESETS = [
    { hz: '432 Hz', label: 'التناسق',  color: '#60A5FA' },
    { hz: '528 Hz', label: 'الشفاء',   color: '#34D399' },
    { hz: '741 Hz', label: 'الصحوة',   color: '#A78BFA' },
];

function FeaturedFrequencyCard() {
    const [playing, setPlaying] = useState(false);
    const [activeFreq, setActiveFreq] = useState(0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SP, delay: 0.04 }}
            className="relative overflow-hidden rounded-[24px] mb-3 p-5"
            style={{
                background: [
                    'linear-gradient(148deg,',
                    '  rgba(8,15,60,0.97) 0%,',
                    '  rgba(12,20,80,0.95) 50%,',
                    '  rgba(5,10,50,0.97) 100%',
                    ')',
                ].join(''),
                border: '1px solid rgba(96,165,250,0.14)',
                borderTop: '1px solid rgba(129,140,248,0.22)',
                boxShadow: [
                    '0 2px 0 rgba(129,140,248,0.12) inset',
                    `0 18px 52px ${C}2C`,
                    '0 6px 22px rgba(0,0,0,0.30)',
                ].join(', '),
                minHeight: 160,
            }}
        >
            {/* Glow pool */}
            <motion.div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 100%, rgba(37,99,235,0.18), transparent 70%)` }}
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(108deg, transparent 25%, rgba(129,140,248,0.06) 46%, transparent 67%)' }}
                animate={{ x: ['-130%', '130%'] }}
                transition={{ duration: 6, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }} />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                        <motion.div className="w-1.5 h-1.5 rounded-full"
                            style={{ background: playing ? '#34D399' : 'rgba(129,140,248,0.5)' }}
                            animate={{ opacity: playing ? [1, 0.3, 1] : 1 }}
                            transition={{ duration: 0.8, repeat: playing ? Infinity : 0 }} />
                        <span className="text-[8.5px] font-black text-blue-300/55 uppercase tracking-[0.16em]">
                            الترددات العلاجية · Healing Frequencies
                        </span>
                    </div>
                    <Radio className="w-4 h-4 text-blue-300/60" />
                </div>

                <h3 className="text-[21px] font-black text-white leading-tight tracking-tight mb-1"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.30)' }}>
                    الصوت والترددات
                </h3>
                <p className="text-[10px] text-white/48 leading-relaxed mb-3">
                    اختر ترددك واستمع للفرق في دقيقة واحدة
                </p>

                {/* Frequency selector */}
                <div className="flex items-center gap-2 mb-3">
                    {FREQ_PRESETS.map((f, i) => (
                        <motion.button
                            key={f.hz}
                            whileTap={{ scale: 0.90 }}
                            onClick={() => { setActiveFreq(i); haptic.tap(); }}
                            className="flex-1 py-1.5 rounded-[10px] flex flex-col items-center gap-0.5"
                            style={{
                                background: activeFreq === i ? `${f.color}22` : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${activeFreq === i ? f.color + '40' : 'rgba(255,255,255,0.08)'}`,
                                transition: 'all 0.15s',
                            }}
                        >
                            <span className="text-[10px] font-black" style={{ color: activeFreq === i ? f.color : 'rgba(255,255,255,0.45)' }}>{f.hz}</span>
                            <span className="text-[7px] font-bold" style={{ color: activeFreq === i ? f.color + 'AA' : 'rgba(255,255,255,0.25)' }}>{f.label}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Wave visualizer */}
                <div className="flex items-end justify-center gap-[3px] h-[44px] mb-3">
                    {WAVE_BARS.map((bar, i) => (
                        <motion.div
                            key={i}
                            className="rounded-full flex-shrink-0"
                            style={{
                                width: 3,
                                background: `linear-gradient(to top, ${C}, ${FREQ_PRESETS[activeFreq].color})`,
                                opacity: 0.7,
                            }}
                            animate={playing
                                ? { height: [bar.height * 0.4, bar.height, bar.height * 0.55, bar.height * 0.85, bar.height * 0.4] }
                                : { height: bar.height * 0.2 }
                            }
                            transition={playing
                                ? { duration: bar.duration, repeat: Infinity, ease: 'easeInOut', delay: bar.delay }
                                : { duration: 0.3 }
                            }
                        />
                    ))}
                </div>

                {/* Play CTA */}
                <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { setPlaying(p => !p); haptic.impact(); }}
                    className="w-full py-2.5 rounded-[14px] flex items-center justify-center gap-2"
                    style={{
                        background: playing
                            ? 'rgba(239,68,68,0.20)'
                            : `linear-gradient(135deg, ${C}CC, ${CA}CC)`,
                        border: `1px solid ${playing ? 'rgba(239,68,68,0.30)' : 'rgba(255,255,255,0.15)'}`,
                    }}
                >
                    <Volume2 className="w-4 h-4 text-white" />
                    <span className="text-[11px] font-black text-white">
                        {playing ? 'إيقاف الجلسة' : 'ابدأ جلسة الاستماع'}
                    </span>
                </motion.button>
            </div>
        </motion.div>
    );
}

export default function RuhiPrograms() {
    const [open, setOpen] = useState(true);
    const rest = ITEMS.slice(1);
    return (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...SP, delay: 0.06 }} className="mb-5">
            <motion.button className="w-full flex items-center gap-2.5 mb-3 px-1"
                whileTap={{ scale: 0.97 }}
                onClick={() => { setOpen(o => !o); haptic.selection(); }} aria-expanded={open}>
                <div className="w-[3.5px] h-[18px] rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(to bottom, ${C}, ${CA})` }} />
                <span className="text-[14px] leading-none flex-shrink-0">🕊️</span>
                <span className="text-[12.5px] font-black text-slate-700 flex-1 text-right tracking-tight">برامج السكون والحضور</span>
                <span className="text-[7.5px] font-black px-1.5 py-[3px] rounded-full text-white"
                    style={{ background: `linear-gradient(135deg, ${C}, ${CA})`, boxShadow: `0 2px 6px ${C}30` }}>أدوات</span>
                <span className="text-[8px] font-black px-2 py-1 rounded-full mr-0.5"
                    style={{ background: `${C}12`, color: C, border: `1px solid ${C}20` }}>{ITEMS.length}</span>
                <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ ...SP, duration: 0.18 }}>
                    <ChevronDown className="w-4 h-4" style={{ color: C, opacity: 0.55 }} />
                </motion.div>
            </motion.button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div key="g" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={SP_SLOW} style={{ overflow: 'hidden' }}>
                        <FeaturedFrequencyCard />
                        <div className="grid gap-2.5" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
                            {rest.map((item, i) => (
                                <ServiceTile key={item.href + item.label} item={item} color={C} colorAlt={CA} index={i + 1} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

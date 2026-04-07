// components/health-tracker/TrackerQuickLog.tsx
// Health Tracker — Quick Log Bottom Sheet
// Tap a metric card → instant input → save with haptic feedback.
// Design: iOS action sheet feel — fast, minimal friction.

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Droplets, Moon, Activity, Smile, Pill, Scale,
    X, Plus, Minus, Check,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { METRIC, type MetricKey } from './tracker-tokens';
import { SPRING_SMOOTH, SPRING_BOUNCY } from '@/lib/tibrah-motion';

/* ── Metric cards ── */
interface LogCard {
    key:     MetricKey;
    icon:    React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    input:   'stepper' | 'slider' | 'picker';
    unit:    string;
    min:     number;
    max:     number;
    step:    number;
    default: number;
    options?: { value: number; label: string; emoji: string }[];
}

const LOG_CARDS: LogCard[] = [
    {
        key: 'water', icon: Droplets,
        input: 'stepper', unit: 'كوب', min: 0, max: 20, step: 1, default: 1,
    },
    {
        key: 'sleep', icon: Moon,
        input: 'stepper', unit: 'ساعة', min: 0, max: 12, step: 0.5, default: 7,
    },
    {
        key: 'activity', icon: Activity,
        input: 'stepper', unit: 'دقيقة', min: 0, max: 120, step: 5, default: 30,
    },
    {
        key: 'mood', icon: Smile,
        input: 'picker', unit: '/10', min: 1, max: 10, step: 1, default: 7,
        options: [
            { value: 10, label: 'ممتاز',   emoji: '🤩' },
            { value: 8,  label: 'جيد جداً', emoji: '😊' },
            { value: 6,  label: 'عادي',     emoji: '😐' },
            { value: 4,  label: 'متعب',     emoji: '😓' },
            { value: 2,  label: 'سيئ',      emoji: '😔' },
        ],
    },
    {
        key: 'meds', icon: Pill,
        input: 'stepper', unit: 'جرعة', min: 0, max: 10, step: 1, default: 1,
    },
    {
        key: 'weight', icon: Scale,
        input: 'stepper', unit: 'كجم', min: 30, max: 200, step: 0.5, default: 70,
    },
];

/* ── Individual input components ── */
function Stepper({
    value, min, max, step, unit, color,
    onChange,
}: {
    value: number; min: number; max: number; step: number; unit: string; color: string;
    onChange: (v: number) => void;
}) {
    const dec = () => { if (value > min) { onChange(+(value - step).toFixed(2)); haptic.selection(); } };
    const inc = () => { if (value < max) { onChange(+(value + step).toFixed(2)); haptic.selection(); } };
    return (
        <div className="flex items-center gap-4 py-2">
            <motion.button whileTap={{ scale: 0.85 }}
                onClick={dec}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${color}14`, border: `1px solid ${color}28` }}>
                <Minus className="w-4 h-4" style={{ color }} />
            </motion.button>
            <div className="flex-1 text-center">
                <span className="text-[40px] font-black tabular-nums" style={{ color }}>{value}</span>
                <span className="text-[13px] text-slate-400 font-bold mr-1">{unit}</span>
            </div>
            <motion.button whileTap={{ scale: 0.85 }}
                onClick={inc}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${color}14`, border: `1px solid ${color}28` }}>
                <Plus className="w-4 h-4" style={{ color }} />
            </motion.button>
        </div>
    );
}

function MoodPicker({
    value, options, color, onChange,
}: {
    value: number;
    options: NonNullable<LogCard['options']>;
    color: string;
    onChange: (v: number) => void;
}) {
    return (
        <div className="flex flex-col gap-2 py-1">
            {options.map(opt => (
                <motion.button key={opt.value} whileTap={{ scale: 0.97 }}
                    onClick={() => { onChange(opt.value); haptic.selection(); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-[16px] text-right"
                    style={{
                        background: value === opt.value ? `${color}12` : 'rgba(0,0,0,0.03)',
                        border: `1.5px solid ${value === opt.value ? color + '30' : 'transparent'}`,
                    }}>
                    <span className="text-[22px]">{opt.emoji}</span>
                    <span className="text-[14px] font-bold text-slate-700">{opt.label}</span>
                    {value === opt.value && (
                        <div className="mr-auto w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: color }}>
                            <Check className="w-3 h-3 text-white" />
                        </div>
                    )}
                </motion.button>
            ))}
        </div>
    );
}

/* ── Metric selector row ── */
function MetricSelector({
    selected, onSelect,
}: {
    selected: MetricKey;
    onSelect: (k: MetricKey) => void;
}) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {LOG_CARDS.map(card => {
                const m    = METRIC[card.key];
                const Icon = card.icon;
                const isActive = card.key === selected;
                return (
                    <motion.button key={card.key}
                        whileTap={{ scale: 0.90 }}
                        onClick={() => { onSelect(card.key); haptic.selection(); }}
                        className="flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-[16px]"
                        style={{
                            background: isActive ? m.color : 'rgba(0,0,0,0.05)',
                            boxShadow:  isActive ? `0 4px 12px ${m.color}35` : 'none',
                        }}
                        animate={{ scale: isActive ? 1.05 : 1 }}
                        transition={SPRING_BOUNCY}>
                        <Icon className="w-4 h-4" style={{ color: isActive ? 'white' : m.color }} />
                        <span className="text-[9px] font-bold" style={{ color: isActive ? 'white' : '#64748b' }}>
                            {m.label}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}

/* ════════════════════════════════════════════════════
   QUICK LOG SHEET (main export)
   ════════════════════════════════════════════════════ */
interface TrackerQuickLogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (key: MetricKey, value: number) => void;
    initialTab?: MetricKey;
}

export function TrackerQuickLog({
    isOpen,
    onClose,
    onSave,
    initialTab = 'water',
}: TrackerQuickLogProps) {
    const [activeKey, setActiveKey] = useState<MetricKey>(initialTab);
    const [values, setValues] = useState<Partial<Record<MetricKey, number>>>(
        Object.fromEntries(LOG_CARDS.map(c => [c.key, c.default]))
    );
    const [saved, setSaved] = useState<MetricKey | null>(null);

    const card  = LOG_CARDS.find(c => c.key === activeKey)!;
    const m     = METRIC[activeKey];
    const value = values[activeKey] ?? card.default;

    const handleChange = useCallback((v: number) => {
        setValues(prev => ({ ...prev, [activeKey]: v }));
    }, [activeKey]);

    const handleSave = useCallback(() => {
        haptic.impact();
        onSave?.(activeKey, value);
        setSaved(activeKey);
        setTimeout(() => setSaved(null), 1600);
    }, [activeKey, value, onSave]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div className="fixed inset-0 z-[500] flex items-end"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}>
                    {/* Backdrop */}
                    <div className="absolute inset-0"
                        style={{ background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(8px)' }} />

                    {/* Sheet */}
                    <motion.div
                        className="relative w-full rounded-t-[32px] overflow-hidden"
                        style={{
                            background: 'rgba(252,252,253,0.98)',
                            backdropFilter: 'blur(48px)',
                            boxShadow: '0 -8px 48px rgba(0,0,0,0.18)',
                            maxHeight: '88vh',
                            border: '0.5px solid rgba(255,255,255,0.8)',
                        }}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={SPRING_SMOOTH}
                        onClick={e => e.stopPropagation()}>

                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-0">
                            <div className="w-10 h-1 rounded-full bg-slate-200" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4">
                            <div>
                                <h2 className="text-[18px] font-black text-slate-900">تسجيل سريع</h2>
                                <p className="text-[11px] text-slate-400 mt-0.5">اختر ما تريد تسجيله</p>
                            </div>
                            <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100">
                                <X className="w-4 h-4 text-slate-500" />
                            </motion.button>
                        </div>

                        {/* Metric selector */}
                        <div className="px-5 pb-3">
                            <MetricSelector selected={activeKey} onSelect={setActiveKey} />
                        </div>

                        <div className="h-px bg-slate-100 mx-5" />

                        {/* Input area */}
                        <div className="px-5 py-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-[11px] flex items-center justify-center"
                                    style={{ background: m.color }}>
                                    <card.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[15px] font-black text-slate-800">{m.label}</span>
                            </div>

                            {card.input === 'picker' && card.options ? (
                                <MoodPicker value={value} options={card.options} color={m.color} onChange={handleChange} />
                            ) : (
                                <Stepper value={value} min={card.min} max={card.max}
                                    step={card.step} unit={card.unit} color={m.color}
                                    onChange={handleChange} />
                            )}
                        </div>

                        {/* Save CTA */}
                        <div className="px-5 pb-8 pt-2">
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={handleSave}
                                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[20px] text-white text-[15px] font-black"
                                style={{ background: m.color, boxShadow: `0 8px 24px ${m.color}40` }}>
                                <AnimatePresence mode="wait">
                                    {saved === activeKey ? (
                                        <motion.div key="saved"
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
                                            className="flex items-center gap-2">
                                            <Check className="w-5 h-5" />
                                            <span>تم الحفظ ✓</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="save"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="flex items-center gap-2">
                                            <Check className="w-5 h-5" />
                                            <span>حفظ {value} {card.unit}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

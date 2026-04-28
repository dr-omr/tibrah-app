// components/nutrition/TayyibatMealLogger.tsx
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Tayyibat Meal Logger (Daily Compliance Tracker)
// ════════════════════════════════════════════════════════════════════════
//
// 6-period meal tracker:
//   1. فطور        2. تصبيرة صباح
//   3. غداء        4. تصبيرة عصر
//   5. عشاء        6. مشروبات
//
// Each item classified in real-time: ✅ مسموح / ❌ ممنوع / ❓ غير مؤكد
// Violations show instantly with badge counts.
// ════════════════════════════════════════════════════════════════════════

'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, AlertTriangle, HelpCircle, Utensils, Coffee, Sun, Moon, Droplets, Cookie } from 'lucide-react';

import { logMeal, type AdherenceMealTag, ADHERENCE_MEAL_LABELS, getTodayLog } from '@/lib/nutrition/tayyibat-adherence';
import { classifyFoodItem, type FoodClassification } from '@/lib/nutrition/tayyibat-engine';
import { analyzeMealTiming } from '@/lib/nutrition/tayyibat-timing-engine';
import { trackEvent } from '@/lib/analytics';
import { haptic } from '@/lib/HapticFeedback';

/* ── Design Tokens ── */
const W = {
    glass:       'rgba(255,255,255,0.58)',
    glassHigh:   'rgba(255,255,255,0.72)',
    glassBorder: 'rgba(255,255,255,0.85)',
    glassShadow: '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04)',
    textPrimary: '#0C4A6E',
    textSub:     '#0369A1',
    textMuted:   '#7DD3FC',
    green:       '#059669',
    greenBg:     'rgba(5,150,105,0.08)',
    greenBorder: 'rgba(5,150,105,0.25)',
    red:         '#DC2626',
    redBg:       'rgba(220,38,38,0.06)',
    redBorder:   'rgba(220,38,38,0.18)',
    amber:       '#D97706',
    amberBg:     'rgba(217,119,6,0.06)',
    amberBorder: 'rgba(217,119,6,0.18)',
};

const MEAL_ICONS: Record<AdherenceMealTag, React.ReactNode> = {
    breakfast:       <Sun style={{ width: 16, height: 16, color: '#F59E0B' }} />,
    morning_snack:   <Cookie style={{ width: 16, height: 16, color: '#D97706' }} />,
    lunch:           <Utensils style={{ width: 16, height: 16, color: '#0891B2' }} />,
    afternoon_snack: <Coffee style={{ width: 16, height: 16, color: '#8B5CF6' }} />,
    dinner:          <Moon style={{ width: 16, height: 16, color: '#6366F1' }} />,
    drinks:          <Droplets style={{ width: 16, height: 16, color: '#06B6D4' }} />,
};

const CLASSIFICATION_META: Record<FoodClassification, { emoji: string; color: string; bg: string; border: string; label: string }> = {
    allowed:   { emoji: '✅', color: W.green,  bg: W.greenBg,  border: W.greenBorder,  label: 'مسموح' },
    forbidden: { emoji: '❌', color: W.red,    bg: W.redBg,    border: W.redBorder,    label: 'ممنوع' },
    uncertain: { emoji: '❓', color: W.amber,  bg: W.amberBg,  border: W.amberBorder,  label: 'غير مؤكد' },
};

interface ClassifiedItem {
    raw: string;
    classification: FoodClassification;
    matchedItem?: string;
}

interface MealState {
    items: ClassifiedItem[];
    inputText: string;
    saved: boolean;
}

export function TayyibatMealLogger() {
    const [activeMeal, setActiveMeal] = useState<AdherenceMealTag | null>(null);
    const [mealStates, setMealStates] = useState<Record<string, MealState>>({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const todayLog = useMemo(() => getTodayLog(), [refreshTrigger]);
    const timingAnalysis = useMemo(() => todayLog ? analyzeMealTiming(todayLog) : null, [todayLog]);

    const getMealState = useCallback((tag: AdherenceMealTag): MealState => {
        if (mealStates[tag]) return mealStates[tag];
        // Restore from today's log if exists
        const existing = todayLog?.meals[tag];
        if (existing) {
            return {
                items: existing.items.map(i => ({
                    raw: i.raw,
                    classification: i.classification,
                    matchedItem: i.matchedItem,
                })),
                inputText: '',
                saved: true,
            };
        }
        return { items: [], inputText: '', saved: false };
    }, [mealStates, todayLog]);

    const updateMealState = useCallback((tag: AdherenceMealTag, update: Partial<MealState>) => {
        setMealStates(prev => ({
            ...prev,
            [tag]: { ...getMealState(tag), ...update },
        }));
    }, [getMealState]);

    const addItem = useCallback((tag: AdherenceMealTag) => {
        const state = getMealState(tag);
        const text = state.inputText.trim();
        if (!text) return;

        haptic.selection();
        const result = classifyFoodItem(text);
        const item: ClassifiedItem = {
            raw: text,
            classification: result.classification,
            matchedItem: result.matchedItem,
        };

        updateMealState(tag, {
            items: [...state.items, item],
            inputText: '',
            saved: false,
        });

        if (result.classification === 'forbidden') {
            trackEvent('tayyibat_violation_detected', {
                meal: tag,
                item: text,
                matched: result.matchedItem || '',
            });
        }
    }, [getMealState, updateMealState]);

    const removeItem = useCallback((tag: AdherenceMealTag, index: number) => {
        haptic.selection();
        const state = getMealState(tag);
        updateMealState(tag, {
            items: state.items.filter((_, i) => i !== index),
            saved: false,
        });
    }, [getMealState, updateMealState]);

    const saveMeal = useCallback((tag: AdherenceMealTag) => {
        const state = getMealState(tag);
        if (state.items.length === 0) return;

        haptic.impact();
        logMeal(tag, state.items.map(i => i.raw));
        updateMealState(tag, { saved: true });
        setRefreshTrigger(p => p + 1);

        trackEvent('tayyibat_meal_logged', {
            meal: tag,
            item_count: String(state.items.length),
            violations: String(state.items.filter(i => i.classification === 'forbidden').length),
        });
    }, [getMealState, updateMealState]);

    return (
        <div className="space-y-3" style={{ direction: 'rtl' }}>
            {/* Meal Period Buttons */}
            <div className="grid grid-cols-3 gap-2">
                {(Object.keys(ADHERENCE_MEAL_LABELS) as AdherenceMealTag[]).map(tag => {
                    const state = getMealState(tag);
                    const violations = state.items.filter(i => i.classification === 'forbidden').length;
                    const isActive = activeMeal === tag;
                    const hasSaved = state.saved;

                    return (
                        <motion.button
                            key={tag}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { haptic.selection(); setActiveMeal(isActive ? null : tag); }}
                            className="relative rounded-[16px] px-3 py-3.5 flex flex-col items-center gap-1.5"
                            style={{
                                background: isActive
                                    ? 'linear-gradient(145deg, rgba(8,145,178,0.10), rgba(34,211,238,0.06))'
                                    : hasSaved ? W.greenBg : W.glass,
                                border: `1.5px solid ${isActive ? 'rgba(8,145,178,0.30)' : hasSaved ? W.greenBorder : W.glassBorder}`,
                                boxShadow: isActive ? '0 4px 16px rgba(8,145,178,0.10)' : 'none',
                            }}
                        >
                            {MEAL_ICONS[tag]}
                            <span style={{ fontSize: 10, fontWeight: 700, color: W.textSub }}>
                                {ADHERENCE_MEAL_LABELS[tag]}
                            </span>

                            {/* Violation badge */}
                            {violations > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1.5 -left-1.5"
                                    style={{
                                        width: 18, height: 18, borderRadius: '50%',
                                        background: W.red, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <span style={{ fontSize: 9, fontWeight: 900, color: '#fff' }}>{violations}</span>
                                </motion.div>
                            )}

                            {/* Saved check */}
                            {hasSaved && violations === 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -left-1"
                                    style={{
                                        width: 16, height: 16, borderRadius: '50%',
                                        background: W.green, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <Check style={{ width: 9, height: 9, color: '#fff' }} />
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Active Meal Panel */}
            <AnimatePresence>
                {activeMeal && (
                    <motion.div
                        key={activeMeal}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden rounded-[22px]"
                        style={{
                            background: W.glassHigh,
                            border: `1px solid ${W.glassBorder}`,
                            boxShadow: W.glassShadow,
                        }}
                    >
                        <div className="p-4 space-y-3">
                            {/* Header */}
                            <div className="flex items-center gap-2">
                                {MEAL_ICONS[activeMeal]}
                                <span style={{ fontSize: 14, fontWeight: 800, color: W.textPrimary }}>
                                    {ADHERENCE_MEAL_LABELS[activeMeal]}
                                </span>
                            </div>

                            {/* Items list */}
                            {getMealState(activeMeal).items.length > 0 && (
                                <div className="space-y-1.5">
                                    {getMealState(activeMeal).items.map((item, i) => {
                                        const meta = CLASSIFICATION_META[item.classification];
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center gap-2 rounded-[14px] px-3 py-2.5"
                                                style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
                                            >
                                                <span style={{ fontSize: 14 }}>{meta.emoji}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="truncate" style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>
                                                        {item.raw}
                                                    </p>
                                                    {item.matchedItem && item.matchedItem !== item.raw && (
                                                        <p className="truncate" style={{ fontSize: 9, fontWeight: 500, color: W.textMuted }}>
                                                            ← {item.matchedItem}
                                                        </p>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: 9, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                                                <motion.button
                                                    whileTap={{ scale: 0.85 }}
                                                    onClick={() => removeItem(activeMeal!, i)}
                                                    style={{
                                                        width: 20, height: 20, borderRadius: '50%',
                                                        background: 'rgba(0,0,0,0.04)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}
                                                >
                                                    <X style={{ width: 10, height: 10, color: W.textMuted }} />
                                                </motion.button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={getMealState(activeMeal).inputText}
                                    onChange={e => updateMealState(activeMeal!, { inputText: e.target.value })}
                                    onKeyDown={e => { if (e.key === 'Enter') addItem(activeMeal!); }}
                                    placeholder="أضف عنصراً... (مثال: أرز، فراخ)"
                                    className="flex-1 rounded-[14px] px-3.5 py-3"
                                    style={{
                                        background: W.glass,
                                        border: `1px solid ${W.glassBorder}`,
                                        fontSize: 13, fontWeight: 600, color: W.textPrimary,
                                        outline: 'none', direction: 'rtl',
                                    }}
                                />
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => addItem(activeMeal!)}
                                    style={{
                                        width: 44, height: 44, borderRadius: 14,
                                        background: 'linear-gradient(145deg, rgba(8,145,178,0.12), rgba(34,211,238,0.06))',
                                        border: '1px solid rgba(8,145,178,0.25)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <Plus style={{ width: 18, height: 18, color: '#0891B2' }} />
                                </motion.button>
                            </div>

                            {/* Save button */}
                            {getMealState(activeMeal).items.length > 0 && !getMealState(activeMeal).saved && (
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => saveMeal(activeMeal!)}
                                    className="w-full rounded-[16px] py-3 flex items-center justify-center gap-2"
                                    style={{
                                        background: 'linear-gradient(145deg, rgba(5,150,105,0.12), rgba(34,211,153,0.08))',
                                        border: `1.5px solid ${W.greenBorder}`,
                                    }}
                                >
                                    <Check style={{ width: 14, height: 14, color: W.green }} />
                                    <span style={{ fontSize: 13, fontWeight: 800, color: W.green }}>حفظ الوجبة</span>
                                </motion.button>
                            )}

                            {getMealState(activeMeal).saved && (
                                <div className="space-y-2 py-1">
                                    <div className="flex items-center justify-center gap-2 py-1">
                                        <Check style={{ width: 12, height: 12, color: W.green }} />
                                        <span style={{ fontSize: 11, fontWeight: 700, color: W.green }}>تم الحفظ</span>
                                    </div>
                                    {timingAnalysis && timingAnalysis.issues.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                            className="rounded-[12px] p-2.5 mt-2"
                                            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
                                        >
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle style={{ width: 12, height: 12, color: '#F59E0B', marginTop: 2, flexShrink: 0 }} />
                                                <div>
                                                    <p style={{ fontSize: 11, fontWeight: 800, color: W.textPrimary }}>
                                                        {timingAnalysis.issues[0].message}
                                                    </p>
                                                    <p style={{ fontSize: 10, color: W.textSub, marginTop: 1, lineHeight: 1.5 }}>
                                                        {timingAnalysis.issues[0].suggestion}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

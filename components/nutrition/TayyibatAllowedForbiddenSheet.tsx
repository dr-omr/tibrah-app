// components/nutrition/TayyibatAllowedForbiddenSheet.tsx
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Complete Tayyibat Reference Sheet
// ════════════════════════════════════════════════════════════════════════
//
// Full display of allowed/forbidden items with:
//   - Tab switching: مسموح / ممنوع / ملاحظات
//   - Search filter
//   - Category grouping
// ════════════════════════════════════════════════════════════════════════

'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, X, AlertTriangle, Info, ChevronDown, Leaf } from 'lucide-react';

import {
    TAYYIBAT_SOURCE,
    FOOD_CATEGORY_LABELS,
    MEAL_TAG_LABELS,
    getAllowedCategories,
    getSpecialNotes,
    type FoodCategory,
} from '@/lib/nutrition/tayyibat-source';

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
    greenBg:     'rgba(5,150,105,0.06)',
    greenBorder: 'rgba(5,150,105,0.20)',
    red:         '#DC2626',
    redBg:       'rgba(220,38,38,0.05)',
    redBorder:   'rgba(220,38,38,0.15)',
    amber:       '#D97706',
    amberBg:     'rgba(217,119,6,0.06)',
    amberBorder: 'rgba(217,119,6,0.18)',
};

type TabId = 'allowed' | 'forbidden' | 'notes';

const TABS: Array<{ id: TabId; label: string; emoji: string; color: string }> = [
    { id: 'allowed',   label: 'المسموح',    emoji: '✅', color: W.green },
    { id: 'forbidden', label: 'الممنوع',    emoji: '❌', color: W.red },
    { id: 'notes',     label: 'ملاحظات',   emoji: '📝', color: W.amber },
];

export function TayyibatAllowedForbiddenSheet() {
    const [activeTab, setActiveTab] = useState<TabId>('allowed');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

    const toggleCategory = (cat: string) => {
        setExpandedCats(prev => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat); else next.add(cat);
            return next;
        });
    };

    // ── Filtered allowed items ──
    const filteredAllowed = useMemo(() => {
        const items = TAYYIBAT_SOURCE.allowed;
        if (!searchQuery.trim()) return items;
        const q = searchQuery.trim().toLowerCase();
        return items.filter(i => i.item.includes(q) || FOOD_CATEGORY_LABELS[i.category].includes(q));
    }, [searchQuery]);

    // ── Group by category ──
    const allowedByCategory = useMemo(() => {
        const groups: Record<string, typeof filteredAllowed> = {};
        for (const item of filteredAllowed) {
            const cat = item.category;
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        }
        return groups;
    }, [filteredAllowed]);

    // ── Filtered forbidden items ──
    const filteredForbidden = useMemo(() => {
        const items = [...TAYYIBAT_SOURCE.forbidden_primary, ...TAYYIBAT_SOURCE.forbidden_secondary];
        if (!searchQuery.trim()) return items;
        const q = searchQuery.trim().toLowerCase();
        return items.filter(i => i.item.includes(q) || (i.reason && i.reason.includes(q)));
    }, [searchQuery]);

    const forbiddenByCategory = useMemo(() => {
        const groups: Record<string, typeof filteredForbidden> = {};
        for (const item of filteredForbidden) {
            const cat = item.category;
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        }
        return groups;
    }, [filteredForbidden]);

    return (
        <div className="space-y-4" style={{ direction: 'rtl' }}>
            {/* Tab bar */}
            <div className="flex gap-1.5 p-1 rounded-[16px]"
                style={{ background: 'rgba(8,145,178,0.04)', border: `1px solid ${W.glassBorder}` }}>
                {TABS.map(tab => (
                    <motion.button
                        key={tab.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex-1 rounded-[12px] py-2.5 flex items-center justify-center gap-1.5"
                        style={{
                            background: activeTab === tab.id ? W.glassHigh : 'transparent',
                            border: activeTab === tab.id ? `1px solid ${W.glassBorder}` : '1px solid transparent',
                            boxShadow: activeTab === tab.id ? W.glassShadow : 'none',
                        }}
                    >
                        <span style={{ fontSize: 12 }}>{tab.emoji}</span>
                        <span style={{
                            fontSize: 11, fontWeight: 800,
                            color: activeTab === tab.id ? tab.color : W.textMuted,
                        }}>{tab.label}</span>
                    </motion.button>
                ))}
            </div>

            {/* Search */}
            {activeTab !== 'notes' && (
                <div className="relative">
                    <Search style={{
                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        width: 15, height: 15, color: W.textMuted,
                    }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن طعام..."
                        className="w-full rounded-[14px] py-3 pr-10 pl-4"
                        style={{
                            background: W.glass,
                            border: `1px solid ${W.glassBorder}`,
                            fontSize: 13, fontWeight: 600, color: W.textPrimary,
                            outline: 'none',
                        }}
                    />
                </div>
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'allowed' && (
                    <motion.div
                        key="allowed"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-2"
                    >
                        {Object.entries(allowedByCategory).map(([cat, items]) => (
                            <div key={cat} className="rounded-[18px] overflow-hidden"
                                style={{ background: W.glass, border: `1px solid ${W.glassBorder}` }}>
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => toggleCategory(cat)}
                                    className="w-full flex items-center gap-2.5 px-4 py-3"
                                >
                                    <Check style={{ width: 14, height: 14, color: W.green }} />
                                    <span style={{ fontSize: 13, fontWeight: 800, color: W.textPrimary, flex: 1, textAlign: 'right' }}>
                                        {FOOD_CATEGORY_LABELS[cat as FoodCategory]}
                                    </span>
                                    <span style={{ fontSize: 10, fontWeight: 600, color: W.textMuted }}>
                                        {items.length} عنصر
                                    </span>
                                    <motion.div
                                        animate={{ rotate: expandedCats.has(cat) ? 180 : 0 }}
                                    >
                                        <ChevronDown style={{ width: 14, height: 14, color: W.textMuted }} />
                                    </motion.div>
                                </motion.button>
                                <AnimatePresence>
                                    {expandedCats.has(cat) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-3 space-y-1">
                                                {items.map((item, i) => (
                                                    <div key={i} className="flex items-start gap-2 py-1.5"
                                                        style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.5)' : 'none' }}>
                                                        <span style={{ fontSize: 10, color: W.green, marginTop: 2 }}>●</span>
                                                        <div className="flex-1">
                                                            <p style={{ fontSize: 12, fontWeight: 700, color: W.textPrimary }}>{item.item}</p>
                                                            {item.note && (
                                                                <p style={{ fontSize: 9, color: W.textMuted, fontWeight: 500 }}>{item.note}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {item.mealTags.filter(t => t !== 'any').slice(0, 2).map(t => (
                                                                <span key={t} style={{
                                                                    fontSize: 8, fontWeight: 600, color: W.textMuted,
                                                                    background: 'rgba(8,145,178,0.06)',
                                                                    padding: '1px 5px', borderRadius: 6,
                                                                }}>
                                                                    {MEAL_TAG_LABELS[t]}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'forbidden' && (
                    <motion.div
                        key="forbidden"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-2"
                    >
                        {Object.entries(forbiddenByCategory).map(([cat, items]) => (
                            <div key={cat} className="rounded-[18px] overflow-hidden"
                                style={{ background: W.glass, border: `1px solid ${W.glassBorder}` }}>
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => toggleCategory(`f_${cat}`)}
                                    className="w-full flex items-center gap-2.5 px-4 py-3"
                                >
                                    <X style={{ width: 14, height: 14, color: W.red }} />
                                    <span style={{ fontSize: 13, fontWeight: 800, color: W.textPrimary, flex: 1, textAlign: 'right' }}>
                                        {FOOD_CATEGORY_LABELS[cat as FoodCategory]}
                                    </span>
                                    <span style={{ fontSize: 10, fontWeight: 600, color: W.textMuted }}>
                                        {items.length} عنصر
                                    </span>
                                    <motion.div
                                        animate={{ rotate: expandedCats.has(`f_${cat}`) ? 180 : 0 }}
                                    >
                                        <ChevronDown style={{ width: 14, height: 14, color: W.textMuted }} />
                                    </motion.div>
                                </motion.button>
                                <AnimatePresence>
                                    {expandedCats.has(`f_${cat}`) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-3 space-y-1">
                                                {items.map((item, i) => (
                                                    <div key={i} className="flex items-start gap-2 py-1.5"
                                                        style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.5)' : 'none' }}>
                                                        <span style={{ fontSize: 10, color: W.red, marginTop: 2 }}>●</span>
                                                        <div className="flex-1">
                                                            <p style={{ fontSize: 12, fontWeight: 700, color: W.textPrimary }}>{item.item}</p>
                                                            {item.reason && (
                                                                <p style={{ fontSize: 9, color: W.red, fontWeight: 500, opacity: 0.7 }}>{item.reason}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'notes' && (
                    <motion.div
                        key="notes"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-2"
                    >
                        {getSpecialNotes().map((note, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="rounded-[16px] p-4 flex items-start gap-3"
                                style={{
                                    background: note.priority === 'high' ? W.redBg : W.amberBg,
                                    border: `1px solid ${note.priority === 'high' ? W.redBorder : W.amberBorder}`,
                                }}
                            >
                                {note.priority === 'high'
                                    ? <AlertTriangle style={{ width: 14, height: 14, color: W.red, flexShrink: 0, marginTop: 2 }} />
                                    : <Info style={{ width: 14, height: 14, color: W.amber, flexShrink: 0, marginTop: 2 }} />}
                                <p style={{ fontSize: 12, fontWeight: 600, color: W.textPrimary, lineHeight: 1.7 }}>
                                    {note.text}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

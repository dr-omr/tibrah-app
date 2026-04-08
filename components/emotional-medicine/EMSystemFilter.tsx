'use client';
/**
 * EMSystemFilter.tsx — فلتر أجهزة الجسم
 * أزرار pill أفقية قابلة للتمرير مع عدد الحالات لكل جهاز
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { OrganSystem, ORGAN_SYSTEM_LABELS } from './em-types';
import { EMOTIONAL_CONDITIONS } from './em-data';

interface Props {
    selected: OrganSystem | null;
    onSelect: (s: OrganSystem | null) => void;
}

export function EMSystemFilter({ selected, onSelect }: Props) {
    const ALL_SYSTEMS = Object.entries(ORGAN_SYSTEM_LABELS) as [OrganSystem, { ar: string; emoji: string; color: string }][];

    const countBySystem = (sys: OrganSystem) =>
        EMOTIONAL_CONDITIONS.filter(c => c.organSystem === sys).length;

    return (
        <div className="relative" dir="rtl">
            {/* Horizontal scroll container */}
            <div className="flex gap-2 overflow-x-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
                {/* All button */}
                <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => onSelect(null)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full whitespace-nowrap flex-shrink-0"
                    style={{
                        background: !selected ? 'rgba(15,23,42,0.90)' : 'rgba(255,255,255,0.80)',
                        border: !selected ? '1.5px solid rgba(255,255,255,0.15)' : '1.5px solid rgba(15,23,42,0.10)',
                        boxShadow: !selected ? '0 4px 14px rgba(0,0,0,0.14)' : '0 2px 8px rgba(0,0,0,0.05)',
                    }}>
                    <span className="text-[11px]">🌐</span>
                    <span className={`text-[11px] font-black ${!selected ? 'text-white' : 'text-slate-600'}`}>
                        الكل
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${!selected ? 'text-white/70 bg-white/15' : 'text-slate-400 bg-slate-100'}`}>
                        {EMOTIONAL_CONDITIONS.length}
                    </span>
                </motion.button>

                {/* System pills */}
                {ALL_SYSTEMS.map(([sys, meta]) => {
                    const count   = countBySystem(sys);
                    if (!count) return null;
                    const active  = selected === sys;

                    return (
                        <motion.button key={sys}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => onSelect(active ? null : sys)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full whitespace-nowrap flex-shrink-0 relative overflow-hidden"
                            style={{
                                background: active
                                    ? meta.color
                                    : 'rgba(255,255,255,0.80)',
                                border: active
                                    ? `1.5px solid ${meta.color}`
                                    : `1.5px solid ${meta.color}20`,
                                boxShadow: active
                                    ? `0 4px 16px ${meta.color}35`
                                    : '0 2px 8px rgba(0,0,0,0.05)',
                            }}>
                            {/* Top shine when active */}
                            {active && (
                                <div className="absolute top-0 left-4 right-4 h-px"
                                    style={{ background: 'rgba(255,255,255,0.35)' }} />
                            )}
                            <span className="text-[11px]">{meta.emoji}</span>
                            <span className={`text-[11px] font-black ${active ? 'text-white' : 'text-slate-600'}`}>
                                {meta.ar}
                            </span>
                            <AnimatePresence>
                                {active ? (
                                    <motion.div key="x" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <X className="w-3 h-3 text-white/70" />
                                    </motion.div>
                                ) : (
                                    <motion.span key="count"
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full"
                                        style={{ background: `${meta.color}14`, color: meta.color }}>
                                        {count}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </div>

            {/* Active filter indicator */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mx-4 mb-2 flex items-center gap-2 px-3 py-1.5 rounded-[10px]"
                        style={{
                            background: `${ORGAN_SYSTEM_LABELS[selected].color}10`,
                            border: `1px solid ${ORGAN_SYSTEM_LABELS[selected].color}18`,
                        }}>
                        <span className="text-[11px]">{ORGAN_SYSTEM_LABELS[selected].emoji}</span>
                        <p className="text-[10px] font-bold flex-1" style={{ color: ORGAN_SYSTEM_LABELS[selected].color }}>
                            عرض {countBySystem(selected)} حالة من {ORGAN_SYSTEM_LABELS[selected].ar}
                        </p>
                        <button onClick={() => onSelect(null)} className="text-[9px] text-slate-400 font-semibold">
                            إلغاء الفلتر
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

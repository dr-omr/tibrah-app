'use client';
/**
 * EMConditionCard.tsx — بطاقة الحالة الشعورية
 * Glass card: عرض الأعراض + الصراع الشعوري + زر اكتشاف
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Eye } from 'lucide-react';
import { EmotionalCondition, ORGAN_SYSTEM_LABELS } from './em-types';

interface Props {
    condition: EmotionalCondition;
    index: number;
    onSelect: (c: EmotionalCondition) => void;
}

const SEVERITY_LABEL: Record<string, { ar: string; color: string }> = {
    mild:     { ar: 'خفيف',    color: '#059669' },
    moderate: { ar: 'متوسط',   color: '#D97706' },
    severe:   { ar: 'مكثّف',  color: '#E11D48' },
};

export function EMConditionCard({ condition: c, index, onSelect }: Props) {
    const system = ORGAN_SYSTEM_LABELS[c.organSystem];
    const sev    = SEVERITY_LABEL[c.severity];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, type: 'spring', stiffness: 360, damping: 32 }}
            whileTap={{ scale: 0.975 }}
            onClick={() => onSelect(c)}
            className="relative overflow-hidden rounded-[22px] p-4 cursor-pointer active:opacity-90"
            dir="rtl"
            style={{
                background: 'rgba(255,255,255,0.82)',
                border: `1.5px solid ${c.color}18`,
                boxShadow: `0 2px 0 rgba(255,255,255,1) inset, 0 8px 28px rgba(15,23,42,0.07), 0 0 0 0.5px ${c.color}12`,
            }}>

            {/* Top shine */}
            <div className="absolute top-px left-8 right-8 h-px"
                style={{ background: 'rgba(255,255,255,0.95)' }} />

            {/* Color accent left bar */}
            <div className="absolute top-4 right-0 w-1 h-8 rounded-l-full"
                style={{ background: c.color }} />

            {/* Subtle color blob */}
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle,${c.color}12,transparent 70%)` }} />

            {/* Header row */}
            <div className="flex items-start gap-3 mb-3">
                {/* Icon */}
                <div className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center flex-shrink-0 relative"
                    style={{ background: `${c.color}12`, border: `1.5px solid ${c.color}20` }}>
                    <div className="absolute top-0 left-2 right-2 h-px"
                        style={{ background: 'rgba(255,255,255,0.8)' }} />
                    <span className="text-[22px]">{system.emoji}</span>
                </div>

                {/* Title & org system */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        {/* System badge */}
                        <span className="text-[8.5px] font-black px-2 py-0.5 rounded-full"
                            style={{ background: `${c.color}12`, color: c.color }}>
                            {system.ar}
                        </span>
                        {/* Severity */}
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: `${sev.color}10`, color: sev.color }}>
                            {sev.ar}
                        </span>
                    </div>
                    <h3 className="text-[14px] font-black text-slate-900 leading-tight">
                        {c.symptom}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{c.targetOrgan}</p>
                </div>
            </div>

            {/* Emotional conflict preview */}
            <div className="rounded-[14px] p-3 mb-3 relative"
                style={{ background: `${c.color}08`, border: `1px solid ${c.color}12` }}>
                <div className="flex items-start gap-2">
                    <Zap style={{ width: 12, height: 12, color: c.color, marginTop: 2, flexShrink: 0 }} />
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                        {c.emotionalConflict}
                    </p>
                </div>
            </div>

            {/* Trigger emotions */}
            <div className="flex flex-wrap gap-1 mb-3">
                {c.triggerEmotions.slice(0, 3).map(e => (
                    <span key={e} className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-slate-500"
                        style={{ background: 'rgba(71,85,105,0.07)', border: '1px solid rgba(71,85,105,0.10)' }}>
                        {e}
                    </span>
                ))}
                {c.triggerEmotions.length > 3 && (
                    <span className="text-[9px] text-slate-400 font-medium px-1">
                        +{c.triggerEmotions.length - 3}
                    </span>
                )}
            </div>

            {/* CTA row */}
            <div className="flex items-center justify-between">
                {/* Prevalence bar */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[8.5px] text-slate-400 font-semibold">الشيوع</span>
                    <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="w-3 h-1.5 rounded-full"
                                style={{
                                    background: i < Math.round(c.prevalence / 2)
                                        ? c.color
                                        : 'rgba(0,0,0,0.08)',
                                }} />
                        ))}
                    </div>
                </div>

                {/* Discover button */}
                <motion.div whileTap={{ scale: 0.92 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px]"
                    style={{ background: c.color, boxShadow: `0 4px 14px ${c.color}30` }}>
                    <Eye className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-black text-white">اكتشف الشفاء</span>
                    <ArrowLeft className="w-3 h-3 text-white/70" />
                </motion.div>
            </div>
        </motion.div>
    );
}

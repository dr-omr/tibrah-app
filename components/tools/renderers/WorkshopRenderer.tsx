// components/tools/renderers/WorkshopRenderer.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Workshop Renderer (expandable sections + key takeaways)
// ════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { WorkshopContent } from '@/lib/tool-content-map';

export function WorkshopRenderer({
    content, color, onComplete,
}: { content: WorkshopContent; color: string; onComplete: () => void }) {
    const [expanded, setExpanded] = useState<number>(0);

    return (
        <div className="flex flex-col gap-3">
            {/* Goal chip */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-[12px]"
                style={{ background: `${color}09`, border: `1px solid ${color}20` }}>
                <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                <span className="text-[10px] font-bold text-slate-500">{content.durationMinutes} دقيقة قراءة</span>
                <span className="text-[10px] font-bold text-slate-400 flex-1 text-left">{content.goal}</span>
            </div>

            {/* Sections */}
            {content.sections.map((sec, i) => (
                <motion.div key={i}
                    className="rounded-[18px] overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.80)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-right"
                        onClick={() => { haptic.tap(); setExpanded(expanded === i ? -1 : i); }}>
                        <span className="text-[22px] flex-shrink-0">{sec.emoji}</span>
                        <span className="text-slate-800 text-[13px] font-black flex-1">{sec.title}</span>
                        {expanded === i
                            ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    </button>
                    <AnimatePresence>
                        {expanded === i && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ overflow: 'hidden' }}>
                                <p className="text-slate-600 text-[13px] font-medium leading-relaxed px-4 pb-4">
                                    {sec.body}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}

            {/* Key takeaways */}
            <div className="rounded-[18px] p-4"
                style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color }}>الأفكار الرئيسية</p>
                {content.keyTakeaways.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1.5 last:mb-0">
                        <span style={{ color }} className="text-[10px] font-black mt-0.5">✦</span>
                        <p className="text-slate-700 text-[12px] font-medium flex-1">{t}</p>
                    </div>
                ))}
            </div>

            {/* Closing action */}
            <div className="rounded-[14px] px-4 py-3"
                style={{ background: 'rgba(0,200,140,0.07)', border: '1px solid rgba(0,200,140,0.18)' }}>
                <p className="text-[10px] font-black mb-1" style={{ color: 'rgba(0,140,90,0.9)' }}>إجراء اليوم</p>
                <p className="text-slate-700 text-[12px] font-medium">{content.closingAction}</p>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={onComplete}
                className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                style={{ background: `${color}20`, border: `1.5px solid ${color}35` }}>
                <span className="text-slate-800 font-black text-[14px]">أكملت القراءة ✓</span>
            </motion.button>
        </div>
    );
}

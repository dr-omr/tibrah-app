// components/tools/renderers/ProtocolRenderer.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Protocol Renderer (day navigator + task checklist)
// ════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { ProtocolContent } from '@/lib/tool-content-map';

export function ProtocolRenderer({
    content, color, onComplete,
}: { content: ProtocolContent; color: string; onComplete: () => void }) {
    const [dayIdx, setDayIdx]       = useState(0);
    const [checked, setChecked]     = useState<Record<string, boolean>>({});
    const [showHowItWorks, setShow] = useState(false);

    const currentDay = content.days[dayIdx];
    const allChecked = currentDay.tasks.every(t => checked[t.id]);

    const toggle = (taskId: string) => {
        haptic.tap();
        setChecked(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Day navigator */}
            <div className="flex items-center gap-1 justify-center">
                {content.days.map((d, i) => (
                    <button key={d.day} onClick={() => { haptic.tap(); setDayIdx(i); setChecked({}); }}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all"
                        style={{
                            background: i === dayIdx ? color : i < dayIdx ? 'rgba(0,200,140,0.20)' : 'rgba(0,0,0,0.06)',
                            border: `1.5px solid ${i === dayIdx ? color : 'transparent'}`,
                        }}>
                        <span className="text-[10px] font-black"
                            style={{ color: i === dayIdx ? '#fff' : i < dayIdx ? 'rgba(0,140,90,0.7)' : '#94A3B8' }}>
                            {d.day}
                        </span>
                    </button>
                ))}
            </div>

            {/* Day card */}
            <AnimatePresence mode="wait">
                <motion.div key={dayIdx}
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                    <div className="rounded-[20px] p-5 mb-3"
                        style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color }}>
                            اليوم {currentDay.day}
                        </p>
                        <h3 className="text-slate-800 text-[17px] font-black mb-0.5">{currentDay.title}</h3>
                        <p className="text-slate-400 text-[11px] font-medium mb-4">{currentDay.subtitle}</p>

                        <div className="flex flex-col gap-2">
                            {currentDay.tasks.map(task => (
                                <button key={task.id} onClick={() => toggle(task.id)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-right"
                                    style={{
                                        background: checked[task.id] ? 'rgba(0,200,140,0.08)' : 'rgba(0,0,0,0.03)',
                                        border: `1.5px solid ${checked[task.id] ? 'rgba(0,200,140,0.25)' : 'rgba(0,0,0,0.06)'}`,
                                    }}>
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: checked[task.id] ? 'rgba(0,200,140,0.85)' : 'rgba(0,0,0,0.08)' }}>
                                        {checked[task.id] && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="text-[13px] flex-shrink-0">{task.emoji}</span>
                                    <p className="text-slate-700 text-[12px] font-medium flex-1 text-right leading-snug">{task.text}</p>
                                    {task.durationMinutes > 0 && (
                                        <span className="text-[9px] text-slate-400 font-bold flex-shrink-0">{task.durationMinutes}د</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* How it works */}
            <button onClick={() => setShow(s => !s)}
                className="flex items-center gap-2 px-3 py-2 rounded-[12px]"
                style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="text-[11px] font-bold text-slate-500 flex-1 text-right">كيف يعمل هذا البروتوكول؟</span>
                {showHowItWorks ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            {showHowItWorks && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-slate-500 text-[12px] font-medium leading-relaxed px-2">
                    {content.howItWorks}
                </motion.p>
            )}

            {/* Complete day */}
            {allChecked && (
                <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.97 }} onClick={onComplete}
                    className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                    style={{ background: `${color}22`, border: `1.5px solid ${color}40`, boxShadow: `0 8px 24px ${color}20` }}>
                    <span className="text-slate-800 font-black text-[14px]">أكملت اليوم {currentDay.day} ✓</span>
                </motion.button>
            )}
        </div>
    );
}

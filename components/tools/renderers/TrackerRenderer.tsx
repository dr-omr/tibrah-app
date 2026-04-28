// components/tools/renderers/TrackerRenderer.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Tracker Renderer (daily logging: scale, choice, boolean, text)
// ════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import { trackEvent } from '@/lib/analytics';
import type { TrackerContent } from '@/lib/tool-content-map';

export function TrackerRenderer({
    content, color, toolId, planId, onComplete,
}: { content: TrackerContent; color: string; toolId: string; planId: string; onComplete: () => void }) {
    const storageKey = `tibrah_tracker_${planId}_${toolId}_${new Date().toDateString()}`;
    const [values, setValues] = useState<Record<string, string | number | boolean>>({});
    const [saved, setSaved]   = useState(false);

    const handleSave = () => {
        haptic.impact();
        if (typeof window !== 'undefined') {
            try { localStorage.setItem(storageKey, JSON.stringify({ ...values, savedAt: new Date().toISOString() })); }
            catch { /* quota */ }
        }
        trackEvent('protocol_outcome_logged', { tool_id: toolId, tracker_fields: Object.keys(values).length });
        setSaved(true);
        setTimeout(onComplete, 1200);
    };

    return (
        <div className="flex flex-col gap-4">
            <p className="text-slate-600 text-[13px] font-medium leading-relaxed">{content.intro}</p>

            {content.fields.map(field => (
                <div key={field.id} className="rounded-[16px] p-4"
                    style={{ background: 'rgba(255,255,255,0.80)', border: '1px solid rgba(0,0,0,0.07)' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[18px]">{field.emoji}</span>
                        <p className="text-slate-700 text-[12px] font-black">{field.label}</p>
                    </div>

                    {field.type === 'scale' && (
                        <div>
                            <input type="range" min={field.min ?? 0} max={field.max ?? 10}
                                value={(values[field.id] as number) ?? Math.round(((field.min ?? 0) + (field.max ?? 10)) / 2)}
                                onChange={e => setValues(v => ({ ...v, [field.id]: Number(e.target.value) }))}
                                className="w-full h-2 rounded-full cursor-pointer"
                                style={{ accentColor: color }} />
                            <div className="flex justify-between mt-1">
                                <span className="text-[9px] text-slate-400">{field.min ?? 0}</span>
                                <span className="text-[13px] font-black" style={{ color }}>
                                    {(values[field.id] as number) ?? Math.round(((field.min ?? 0) + (field.max ?? 10)) / 2)}
                                </span>
                                <span className="text-[9px] text-slate-400">{field.max ?? 10}</span>
                            </div>
                        </div>
                    )}

                    {field.type === 'choice' && field.options && (
                        <div className="flex flex-wrap gap-1.5">
                            {field.options.map(opt => (
                                <button key={opt} onClick={() => { haptic.tap(); setValues(v => ({ ...v, [field.id]: opt })); }}
                                    className="px-3 py-1.5 rounded-[10px] text-[11px] font-bold transition-all"
                                    style={{
                                        background: values[field.id] === opt ? `${color}20` : 'rgba(0,0,0,0.05)',
                                        border: `1.5px solid ${values[field.id] === opt ? color : 'transparent'}`,
                                        color: values[field.id] === opt ? color : '#64748B',
                                    }}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {field.type === 'boolean' && (
                        <div className="flex gap-2">
                            {['نعم', 'لا'].map(opt => (
                                <button key={opt} onClick={() => { haptic.tap(); setValues(v => ({ ...v, [field.id]: opt === 'نعم' })); }}
                                    className="flex-1 py-2 rounded-[10px] text-[12px] font-bold"
                                    style={{
                                        background: (values[field.id] === true && opt === 'نعم') || (values[field.id] === false && opt === 'لا')
                                            ? `${color}18` : 'rgba(0,0,0,0.05)',
                                        border: `1.5px solid ${(values[field.id] === true && opt === 'نعم') || (values[field.id] === false && opt === 'لا')
                                            ? color : 'transparent'}`,
                                        color: (values[field.id] === true && opt === 'نعم') || (values[field.id] === false && opt === 'لا')
                                            ? color : '#64748B',
                                    }}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {field.type === 'text' && (
                        <textarea rows={2} placeholder="اكتب هنا..."
                            value={(values[field.id] as string) ?? ''}
                            onChange={e => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-[10px] text-[12px] font-medium resize-none"
                            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', outline: 'none', fontFamily: 'inherit', color: '#334155' }} />
                    )}
                </div>
            ))}

            <div className="px-3 py-2.5 rounded-[12px]"
                style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                <p className="text-[11px] font-medium text-slate-500 italic">💡 {content.insight}</p>
            </div>

            {!saved ? (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
                    className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                    style={{ background: `${color}20`, border: `1.5px solid ${color}35` }}>
                    <span className="text-slate-800 font-black text-[14px]">حفظ التسجيل ✓</span>
                </motion.button>
            ) : (
                <div className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                    style={{ background: 'rgba(0,200,140,0.10)', border: '1px solid rgba(0,200,140,0.22)' }}>
                    <span className="text-[14px]">✅</span>
                    <span className="text-[13px] font-black" style={{ color: 'rgba(0,140,90,0.9)' }}>تم الحفظ!</span>
                </div>
            )}
        </div>
    );
}

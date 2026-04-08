// components/home/visitor/VisitorWhyTibrah.tsx
// "Traditional Medicine vs Tibrah" comparison — Microsoft Fluent table style
// Clean, surgical, trust-building

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';

const G = {
    canvas:    '#EFF9F7',
    glass:     'rgba(255,255,255,0.72)',
    blur:      'blur(24px) saturate(180%)',
    border:    'rgba(255,255,255,0.78)',
    borderTop: 'rgba(255,255,255,0.95)',
    shadow:    '0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 28px rgba(0,0,0,0.07)',
    accent:    '#0D9488',
    ink:       '#0F172A',
    sub:       '#475569',
    muted:     '#94A3B8',
};
const SPRING = { type: 'spring' as const, stiffness: 480, damping: 34 };

const ROWS = [
    { label: 'يعالج السبب الجذري',     tibrah: true,  trad: false },
    { label: 'بروتوكول مخصص لك',       tibrah: true,  trad: false },
    { label: 'يجمع الجسد والعقل',      tibrah: true,  trad: false },
    { label: 'متابعة مستمرة',          tibrah: true,  trad: false },
    { label: 'يسمع قصتك كاملة',        tibrah: true,  trad: false },
    { label: 'تحليل وظيفي متقدم',      tibrah: true,  trad: false },
    { label: 'علاج الأعراض فقط',       tibrah: false, trad: true  },
    { label: 'وصفة سريعة + وداع',       tibrah: false, trad: true  },
];

export default function VisitorWhyTibrah() {
    return (
        <section dir="rtl" className="relative px-4 py-5 overflow-hidden" style={{ background: G.canvas }}>
            {/* Ambient */}
            <div className="absolute bottom-0 left-0 w-56 h-32 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(13,148,136,0.08) 0%, transparent 70%)', filter: 'blur(36px)' }} />

            <div className="mb-5 relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: G.muted }}>لماذا طِبرَا؟</p>
                <h2 className="text-[22px] font-black leading-tight" style={{ color: G.ink }}>
                    الطب الوظيفي<br />
                    <span style={{ color: G.accent }}>يختلف تماماً</span>
                </h2>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={SPRING}
                className="relative rounded-[24px] overflow-hidden"
                style={{ background: G.glass, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${G.border}`, boxShadow: G.shadow }}>

                {/* Top edge */}
                <div className="absolute top-0 left-5 right-5 h-px z-10" style={{ background: G.borderTop }} />

                {/* Column headers */}
                <div className="grid grid-cols-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.50)' }}>
                    <div className="col-span-1" />
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold uppercase tracking-[0.10em] mb-0.5" style={{ color: G.muted }}>تقليدي</span>
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                            <X className="w-3 h-3 text-slate-400" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold uppercase tracking-[0.10em] mb-0.5" style={{ color: G.accent }}>طِبرَا</span>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: G.accent }}>
                            <Check className="w-3 h-3 text-white" />
                        </div>
                    </div>
                </div>

                {/* Rows */}
                {ROWS.map((row, i) => (
                    <motion.div key={row.label}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, ...SPRING }}
                        className="grid grid-cols-3 items-center px-4 py-3"
                        style={{ borderBottom: i < ROWS.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>

                        <p className="text-[11.5px] font-semibold col-span-1" style={{ color: G.sub }}>{row.label}</p>

                        {/* Traditional */}
                        <div className="flex justify-center">
                            {row.trad
                                ? <div className="w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(220,38,38,0.08)' }}>
                                    <Check className="w-3 h-3 text-red-400" />
                                  </div>
                                : <div className="w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(0,0,0,0.04)' }}>
                                    <X className="w-3 h-3 text-slate-300" />
                                  </div>
                            }
                        </div>

                        {/* Tibrah */}
                        <div className="flex justify-center">
                            {row.tibrah
                                ? <motion.div className="w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ background: `${G.accent}15` }}
                                    initial={{ scale: 0 }} whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 + 0.1, type: 'spring', stiffness: 500, damping: 24 }}>
                                    <Check className="w-3 h-3" style={{ color: G.accent }} />
                                  </motion.div>
                                : <div className="w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(0,0,0,0.04)' }}>
                                    <X className="w-3 h-3 text-slate-300" />
                                  </div>
                            }
                        </div>
                    </motion.div>
                ))}

                {/* Bottom summary */}
                <div className="px-4 py-3.5"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.55)', background: 'rgba(13,148,136,0.05)' }}>
                    <p className="text-[11px] font-bold text-center" style={{ color: G.accent }}>
                        طِبرَا يعالج الإنسان — لا مجرد المرض
                    </p>
                </div>
            </motion.div>
        </section>
    );
}

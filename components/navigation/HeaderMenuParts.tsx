// components/navigation/HeaderMenuParts.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — HeaderMenu Sub-Components: HealthRing, Row, Section
// ════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { type AppItem, SECTION_META, SP, SP_SLOW } from './header-menu-data';

/* ── SVG Health Ring ──────────────────────────────── */
export function HealthRing({
    score, scoreAr, size = 64, showChip = false,
}: {
    score: number; scoreAr?: string; size?: number; showChip?: boolean;
}) {
    const r    = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const dash = Math.min(score / 100, 1) * circ;

    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
                <circle cx={size / 2} cy={size / 2} r={r}
                    strokeWidth="5" stroke="rgba(13,148,136,0.10)" fill="none" />
                <motion.circle cx={size / 2} cy={size / 2} r={r}
                    strokeWidth="5" stroke="url(#hRingG)" fill="none" strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - dash }}
                    transition={{ duration: 1.4, ease: [0.34, 1.1, 0.64, 1], delay: 0.2 }}
                />
                <defs>
                    <linearGradient id="hRingG" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0D9488" />
                        <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                </defs>
            </svg>
            {showChip && scoreAr && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.2, type: 'spring', stiffness: 500 }}
                    className="absolute -bottom-1 -right-2 px-1.5 py-[3px] rounded-full text-white font-black"
                    style={{
                        fontSize: 8, lineHeight: 1.2,
                        background: 'linear-gradient(135deg,#0D9488,#10B981)',
                        boxShadow: '0 2px 6px rgba(13,148,136,0.30), 0 0 0 1.5px white',
                    }}>
                    {scoreAr}
                </motion.div>
            )}
        </div>
    );
}

/* ── Row — single navigation item ─────────────────── */
export function Row({ item, onClose, hl }: { item: AppItem; onClose: () => void; hl?: string }) {
    const Icon = item.icon;
    const matched = hl && item.label.includes(hl);
    return (
        <Link href={item.href} onClick={() => { haptic.tap(); uiSounds.tap(); onClose(); }}>
            <motion.div
                className="flex items-center gap-3.5 px-4 py-[11px]"
                whileTap={{ backgroundColor: `${item.color}08`, scale: 0.99 }}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.55)' }}>
                <div className="relative w-[38px] h-[38px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                    style={{ background: item.bg, border: `1px solid ${item.color}18` }}>
                    <div className="absolute top-0 left-2 right-2 h-px rounded-full"
                        style={{ background: 'rgba(255,255,255,0.80)' }} />
                    <Icon style={{ width: 17, height: 17, color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <p className={`text-[13px] font-bold leading-tight ${matched ? 'text-teal-700' : 'text-slate-800'}`}>
                            {item.label}
                        </p>
                        {item.isNew && (
                            <span className="text-[8px] font-black px-1.5 py-[2px] rounded-full text-white"
                                style={{ background: item.color, lineHeight: 1 }}>جديد</span>
                        )}
                        {item.badge && !item.isNew && (
                            <span className="text-[8px] font-semibold px-1.5 py-[2px] rounded-full"
                                style={{ background: `${item.color}12`, color: item.color, lineHeight: 1 }}>
                                {item.badge}
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{item.sub}</p>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            </motion.div>
        </Link>
    );
}

/* ── Expandable Section ───────────────────────────── */
export function Section({ sk, items, onClose, hl }: { sk: string; items: AppItem[]; onClose: () => void; hl?: string }) {
    const [open, setOpen] = useState(true);
    const meta = SECTION_META[sk];
    if (!items.length) return null;

    return (
        <div className="mt-4">
            <motion.button whileTap={{ scale: 0.97 }}
                className="w-full flex items-center gap-2.5 px-0.5 mb-2.5"
                onClick={() => { setOpen(o => !o); haptic.selection(); }}>
                <div className="w-1 h-[18px] rounded-full flex-shrink-0" style={{ background: meta.color }} />
                <span className="text-[11px] font-black text-slate-700 flex-1 text-right">
                    {meta.emoji}&nbsp;{sk}
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${meta.color}12`, color: meta.color }}>
                    {items.length}
                </span>
                <motion.div animate={{ rotate: open ? -90 : 0 }} transition={SP} className="flex-shrink-0">
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
                </motion.div>
            </motion.button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={SP_SLOW}
                        style={{ overflow: 'hidden' }}>
                        <div className="rounded-[20px] overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.84)',
                                border: `1.5px solid ${meta.color}10`,
                                boxShadow: `0 2px 0 rgba(255,255,255,1) inset, 0 6px 24px rgba(15,23,42,0.06)`,
                            }}>
                            <div className="h-[3px]" style={{ background: `linear-gradient(to left,${meta.color}35,transparent)` }} />
                            {items.map(item => <Row key={item.href} item={item} onClose={onClose} hl={hl} />)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ── Time Context Hook ────────────────────────────── */
export function useTimeCtx() {
    const h = new Date().getHours();
    if (h >= 5  && h < 11) return { label: 'صباح الخير 🌅', hrefs: ['/daily-log', '/meal-planner', '/breathe'] };
    if (h >= 11 && h < 14) return { label: 'وقت الغداء 🍽️', hrefs: ['/meal-planner', '/record-health', '/health-tracker'] };
    if (h >= 14 && h < 18) return { label: 'بعد الظهر ☀️', hrefs: ['/quick-check-in', '/symptom-checker', '/frequencies'] };
    if (h >= 18 && h < 22) return { label: 'المساء 🌙', hrefs: ['/meditation', '/breathe', '/radio'] };
    return { label: 'وقت النوم 🌙', hrefs: ['/breathe', '/meditation', '/radio'] };
}

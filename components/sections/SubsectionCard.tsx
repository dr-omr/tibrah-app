'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { SectionItem } from './section-tokens';
import { ServiceTile } from './ServiceTile';
import { SP, SP_SLOW } from './section-shared';

/* ════════════════════════════════════════════════════
   SUBSECTION CARD 
   عنوان القسم وتوسيع/الطي + شبكة الخدمات
════════════════════════════════════════════════════ */
export function SubsectionCard({
    title, items, color, colorAlt, index,
}: {
    title: string; items: SectionItem[];
    color: string; colorAlt: string; index: number;
}) {
    const [open, setOpen] = useState(index === 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SP, delay: 0.06 * index }}
            className="mb-5"
        >
            {/* ── Header ── */}
            <motion.button
                className="w-full flex items-center gap-2.5 mb-3 px-1"
                whileTap={{ scale: 0.97 }}
                onClick={() => { setOpen(o => !o); haptic.selection(); }}
            >
                <div className="w-[3.5px] h-[18px] rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(to bottom, ${color}, ${colorAlt})` }} />
                <span className="text-[12.5px] font-black text-slate-700 flex-1 text-right tracking-tight">
                    {title}
                </span>
                <span className="text-[8px] font-black px-2.5 py-1 rounded-full"
                    style={{ background: `${color}12`, color, border: `1px solid ${color}1E` }}>
                    {items.length}
                </span>
                <motion.div animate={{ rotate: open ? 0 : -90 }} transition={SP}>
                    <ChevronDown className="w-4 h-4" style={{ color, opacity: 0.55 }} />
                </motion.div>
            </motion.button>

            {/* ── 2-Col Grid ── */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="grid"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={SP_SLOW}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="grid gap-2.5" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
                            {items.map((item, i) => (
                                <ServiceTile
                                    key={item.href + item.label}
                                    item={item}
                                    color={color}
                                    colorAlt={colorAlt}
                                    index={i}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

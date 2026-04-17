'use client';
/**
 * SubsectionPanel.tsx — مكوّن القسم الفرعي المشترك
 * ──────────────────────────────────────────────────
 * يُستخدم من كل أقسام الـ 4 domains.
 * Props: title, icon, items, color, colorAlt, index, defaultOpen?
 *
 * يدعم:
 *  - collapse / expand مع animation
 *  - شبكة 2-column من ServiceTile
 *  - badge عداد الخدمات
 *  - slot اختياري للـ footer (مثل CTA card)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { SectionItem } from '@/components/sections/section-tokens';
import { ServiceTile }   from '@/components/sections/ServiceTile';
import { SP, SP_SLOW }   from '@/components/sections/section-shared';

interface SubsectionPanelProps {
    title: string;
    icon: string;
    items: SectionItem[];
    color: string;
    colorAlt: string;
    index?: number;
    defaultOpen?: boolean;
    footer?: React.ReactNode;
}

export function SubsectionPanel({
    title, icon, items, color, colorAlt,
    index = 0, defaultOpen = false, footer,
}: SubsectionPanelProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SP, delay: 0.05 * index }}
            className="mb-5"
        >
            {/* ── Header button ── */}
            <motion.button
                className="w-full flex items-center gap-2.5 mb-3 px-1"
                whileTap={{ scale: 0.97 }}
                onClick={() => { setOpen(o => !o); haptic.selection(); }}
                aria-expanded={open}
            >
                {/* left accent bar */}
                <div
                    className="w-[3.5px] h-[18px] rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(to bottom, ${color}, ${colorAlt})` }}
                />
                {/* emoji */}
                <span className="text-[15px] leading-none flex-shrink-0">{icon}</span>
                {/* title */}
                <span className="text-[12.5px] font-black text-slate-700 flex-1 text-right tracking-tight">
                    {title}
                </span>
                {/* count badge */}
                <span
                    className="text-[8px] font-black px-2 py-[3.5px] rounded-full"
                    style={{
                        background: `${color}12`,
                        color,
                        border: `1px solid ${color}22`,
                    }}
                >
                    {items.length}
                </span>
                {/* chevron */}
                <motion.div
                    animate={{ rotate: open ? 0 : -90 }}
                    transition={{ ...SP, duration: 0.2 }}
                >
                    <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color, opacity: 0.55 }} />
                </motion.div>
            </motion.button>

            {/* ── Collapsible grid ── */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={SP_SLOW}
                        style={{ overflow: 'hidden' }}
                    >
                        <div
                            className="grid gap-2.5"
                            style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}
                        >
                            {items.map((item, i) => (
                                <ServiceTile
                                    key={`${item.href}-${item.label}`}
                                    item={item}
                                    color={color}
                                    colorAlt={colorAlt}
                                    index={i}
                                />
                            ))}
                        </div>
                        {footer && <div className="mt-3">{footer}</div>}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

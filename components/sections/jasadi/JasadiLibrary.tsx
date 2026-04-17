'use client';
/**
 * JasadiLibrary.tsx — مكتبة الصحة الجسدية
 * ──────────────────────────────────────────
 * ✦ إضافة: Featured Article Card — مقال مميز بتصميم مجلة طبية
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, ArrowLeft, Clock } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { ServiceTile } from '@/components/sections/ServiceTile';
import { SP, SP_SLOW } from '@/components/sections/section-shared';

const COLOR     = '#0D9488';
const COLOR_ALT = '#059669';

export const JASADI_LIBRARY_ITEMS = [
    { href: '/library?domain=jasadi', label: 'مقالات طبية موثوقة',  sub: 'أبحاث ومراجع علمية مراجعة',      type: 'educational' as const },
    { href: '/library/movement',      label: 'مكتبة الحركة',         sub: 'كتب وملاحق الحركة العلاجية',     type: 'educational' as const },
    { href: '/library/nutrition',     label: 'مكتبة التغذية',        sub: 'أعمق محتوى غذائي طبي',           type: 'educational' as const },
    { href: '/library/symptoms',      label: 'دليل الأعراض',         sub: 'فهم أعراضك بالمنطق السريري',     type: 'educational' as const },
];

/* ─── Featured Article ────────────────────────── */
const FEATURED_ARTICLE = {
    tag: 'طب وظيفي',
    title: 'لماذا تشعر بالإرهاق رغم النوم الكافي؟',
    summary: 'الإرهاق المزمن ليس كسلاً، بل رسالة من جسدك. تعرف على 5 أسباب طبية خفية.',
    readTime: '٦ دقائق',
    href: '/library?domain=jasadi',
};

function FeaturedArticleCard() {
    return (
        <Link href={FEATURED_ARTICLE.href} onClick={() => haptic.tap()}>
            <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...SP, delay: 0.04 }}
                whileTap={{ scale: 0.968, rotate: -0.3 }}
                className="relative overflow-hidden rounded-[22px] mb-3 p-4"
                style={{
                    background: [
                        'linear-gradient(148deg,',
                        '  rgba(255,255,255,0.92) 0%,',
                        '  rgba(255,255,255,0.84) 55%,',
                        `  ${COLOR}0C 100%`,
                        ')',
                    ].join(''),
                    border: '1px solid rgba(255,255,255,0.78)',
                    borderTop: '1px solid rgba(255,255,255,0.96)',
                    backdropFilter: 'blur(36px) saturate(2)',
                    WebkitBackdropFilter: 'blur(36px) saturate(2)',
                    boxShadow: [
                        '0 2px 0 rgba(255,255,255,0.95) inset',
                        `0 14px 40px ${COLOR}14`,
                        '0 3px 12px rgba(0,0,0,0.06)',
                    ].join(', '),
                }}
            >
                {/* Color pool */}
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${COLOR}1A, transparent 70%)`, filter: 'blur(10px)' }} />
                {/* Bubble */}
                <div className="absolute top-3 left-4 w-2 h-2 rounded-full pointer-events-none"
                    style={{ background: 'rgba(255,255,255,0.65)', filter: 'blur(1px)' }} />
                {/* Shimmer */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.30) 48%, transparent 68%)' }}
                    animate={{ x: ['-140%', '140%'] }}
                    transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 6.5, ease: 'easeInOut' }}
                />

                <div className="relative z-10">
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-[7px] flex items-center justify-center"
                                style={{ background: `${COLOR}14` }}>
                                <BookOpen className="w-3 h-3" style={{ color: COLOR }} />
                            </div>
                            <span className="text-[8.5px] font-black uppercase tracking-[0.14em]"
                                style={{ color: COLOR }}>
                                {FEATURED_ARTICLE.tag}
                            </span>
                        </div>
                        <div className="flex items-center gap-1"
                            style={{ color: '#94A3B8' }}>
                            <Clock className="w-2.5 h-2.5" />
                            <span className="text-[8px] font-medium">{FEATURED_ARTICLE.readTime} قراءة</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-[14.5px] font-black text-slate-800 leading-snug mb-1.5 tracking-tight">
                        {FEATURED_ARTICLE.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                        {FEATURED_ARTICLE.summary}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full self-start w-fit"
                        style={{ background: `${COLOR}12`, border: `1px solid ${COLOR}22` }}>
                        <span className="text-[9.5px] font-black" style={{ color: COLOR }}>اقرأ المقال</span>
                        <ArrowLeft className="w-3 h-3" style={{ color: COLOR }} />
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

export default function JasadiLibrary() {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SP, delay: 0.18 }}
            className="mb-5"
        >
            <motion.button
                className="w-full flex items-center gap-2.5 mb-3 px-1"
                whileTap={{ scale: 0.97 }}
                onClick={() => { setOpen(o => !o); haptic.selection(); }}
                aria-expanded={open}
            >
                <div className="w-[3.5px] h-[18px] rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(to bottom, ${COLOR}, ${COLOR_ALT})` }} />
                <span className="text-[14px] leading-none flex-shrink-0">📚</span>
                <span className="text-[12.5px] font-black text-slate-700 flex-1 text-right tracking-tight">
                    مكتبة الصحة الجسدية
                </span>
                <span className="text-[7.5px] font-black px-1.5 py-[3px] rounded-full text-white"
                    style={{ background: `linear-gradient(135deg, #2563EB, #0891B2)`, boxShadow: '0 2px 6px rgba(37,99,235,0.28)' }}>
                    تعليم
                </span>
                <span className="text-[8px] font-black px-2 py-1 rounded-full mr-0.5"
                    style={{ background: `${COLOR}12`, color: COLOR, border: `1px solid ${COLOR}20` }}>
                    {JASADI_LIBRARY_ITEMS.length}
                </span>
                <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ ...SP, duration: 0.18 }}>
                    <ChevronDown className="w-4 h-4" style={{ color: COLOR, opacity: 0.55 }} />
                </motion.div>
            </motion.button>

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
                        {/* Featured article */}
                        <FeaturedArticleCard />

                        {/* Library tiles */}
                        <div className="grid gap-2.5"
                            style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
                            {JASADI_LIBRARY_ITEMS.map((item, i) => (
                                <ServiceTile key={item.href} item={item} color={COLOR} colorAlt={COLOR_ALT} index={i} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

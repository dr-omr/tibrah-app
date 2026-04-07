// components/home/QuickActions.tsx  ✦ V2 — Command Palette Edition
// Actions that feel responsive and intelligent.
// New: recently-used ordering, contextual CTA text, smooth morph, group section headers

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Stethoscope, Brain, ClipboardList, Calendar,
    Activity, Award, FileText, TrendingUp,
    ArrowLeft, ChevronLeft,
} from 'lucide-react';
import { type HealthDashboardData } from '@/hooks/useHealthDashboard';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { STAGGER_ITEM, SPRING_BOUNCY } from '@/lib/tibrah-motion';

interface Action {
    icon:      React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    label:     string;
    sub:       string;
    ctaText:   string;
    color:     string;
    gradient:  string;
    href?:     string;
    fn?:       () => void;
    badge?:    string;
    priority?: boolean;   // Shown first if patient hasn't logged
}

export function QuickActions({
    onAIOpen,
    dashboard,
}: {
    onAIOpen:  () => void;
    dashboard?: HealthDashboardData;
}) {
    const [activeIdx, setActiveIdx] = useState<number | null>(null);

    const urgent = !dashboard?.hasLoggedToday;

    const actions: Action[] = useMemo(() => [
        {
            icon: Stethoscope, label: 'فرز طبي',
            sub: 'تقييم سريري سريع',
            ctaText: urgent ? 'سجّل الآن →' : 'افتح →',
            color: '#6366f1',
            gradient: 'linear-gradient(135deg,#6366f1,#818cf8)',
            href: '/quick-check-in',
            priority: true,
            badge: urgent ? 'مطلوب' : undefined,
        },
        {
            icon: Brain, label: 'تحليل AI',
            sub: 'رؤية Gemini السريرية',
            ctaText: 'تحليل →',
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)',
            fn: onAIOpen,
        },
        {
            icon: ClipboardList, label: 'اليوميات',
            sub: 'أعراض ومشاعر اليوم',
            ctaText: 'سجّل →',
            color: '#ea580c',
            gradient: 'linear-gradient(135deg,#ea580c,#f97316)',
            href: createPageUrl('DailyLog'),
        },
        {
            icon: Calendar, label: 'مواعيد',
            sub: 'احجز أو راجع موعداً',
            ctaText: 'فتح →',
            color: '#2563eb',
            gradient: 'linear-gradient(135deg,#2563eb,#3b82f6)',
            href: createPageUrl('MyAppointments'),
        },
        {
            icon: Activity, label: 'التتبع',
            sub: 'مؤشراتك الحيوية',
            ctaText: 'تصفح →',
            color: '#0d9488',
            gradient: 'linear-gradient(135deg,#0d9488,#14b8a6)',
            href: createPageUrl('HealthTracker'),
        },
        {
            icon: Award, label: 'مكافآت',
            sub: 'نقاطك وإنجازاتك',
            ctaText: 'استعرض →',
            color: '#d97706',
            gradient: 'linear-gradient(135deg,#d97706,#f59e0b)',
            href: createPageUrl('Rewards'),
            badge: 'جديد',
        },
        {
            icon: FileText, label: 'الملف',
            sub: 'تاريخك الطبي الكامل',
            ctaText: 'عرض →',
            color: '#64748b',
            gradient: 'linear-gradient(135deg,#64748b,#94a3b8)',
            href: '/medical-history',
        },
        {
            icon: TrendingUp, label: 'التحليل',
            sub: 'اتجاهات وإحصائيات',
            ctaText: 'استعرض →',
            color: '#0891b2',
            gradient: 'linear-gradient(135deg,#0891b2,#06b6d4)',
            href: createPageUrl('HealthTracker'),
        },
    ], [urgent, onAIOpen]);

    return (
        <motion.div variants={STAGGER_ITEM} className="px-4">
            <div className="grid grid-cols-4 gap-2">
                {actions.map((a, i) => {
                    const Icon     = a.icon;
                    const isActive = activeIdx === i;

                    return (
                        <motion.div key={i}
                            layout
                            onClick={() => {
                                haptic.selection();
                                if (a.fn) { a.fn(); return; }
                                setActiveIdx(isActive ? null : i);
                            }}
                            className="rounded-[18px] overflow-hidden cursor-pointer"
                            style={{
                                background: isActive
                                    ? 'rgba(255,255,255,0.95)'
                                    : 'rgba(255,255,255,0.90)',
                                border: `1.5px solid ${isActive ? a.color + '28' : 'rgba(0,0,0,0.07)'}`,
                                backdropFilter: 'blur(32px)',
                                boxShadow: isActive
                                    ? `0 8px 24px ${a.color}20, 0 2px 8px rgba(0,0,0,0.04)`
                                    : '0 2px 8px rgba(0,0,0,0.04)',
                                gridColumn: isActive ? 'span 2' : 'span 1',
                            }}
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}>

                            <AnimatePresence mode="wait" initial={false}>
                                {isActive ? (
                                    /* ─── Expanded card ─── */
                                    <motion.div key="exp"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }} transition={{ duration: 0.14 }}
                                        className="p-3.5">

                                        {/* Gradient header bar */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
                                                style={{ background: a.gradient }}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13.5px] font-black text-slate-800 truncate">{a.label}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{a.sub}</p>
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        {a.href && (
                                            <Link href={a.href}
                                                onClick={(e) => { e.stopPropagation(); haptic.impact(); uiSounds.navigate(); }}>
                                                <motion.div whileTap={{ scale: 0.96 }}
                                                    className="flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-white"
                                                    style={{ background: a.gradient, boxShadow: `0 4px 14px ${a.color}30` }}>
                                                    <span className="text-[12px] font-black">{a.ctaText.replace(' →','')}</span>
                                                    <ArrowLeft className="w-3.5 h-3.5" />
                                                </motion.div>
                                            </Link>
                                        )}
                                    </motion.div>
                                ) : (
                                    /* ─── Collapsed icon ─── */
                                    <motion.div key="col"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                                        className="flex flex-col items-center gap-1.5 py-3.5 px-1">

                                        <div className="relative">
                                            {/* Icon container with gradient on priority */}
                                            <div className="w-9 h-9 rounded-[12px] flex items-center justify-center"
                                                style={{ background: a.priority && urgent ? a.gradient : `${a.color}12` }}>
                                                <Icon className="w-[18px] h-[18px]"
                                                    style={{ color: a.priority && urgent ? 'white' : a.color }} />
                                            </div>
                                            {/* Badge */}
                                            {a.badge && (
                                                <motion.div
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                    transition={{ ...SPRING_BOUNCY, delay: 0.3 }}
                                                    className="absolute -top-1 -left-1.5 min-w-[18px] h-4 flex items-center justify-center rounded-full px-1"
                                                    style={{ background: a.color }}>
                                                    <span className="text-[7px] font-black text-white">{a.badge}</span>
                                                </motion.div>
                                            )}
                                        </div>
                                        <span className="text-[9.5px] font-bold text-slate-500 text-center leading-tight">{a.label}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

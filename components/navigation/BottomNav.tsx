'use client';

/**
 * BottomNav — Premium Native Medical Navigation Bar
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * مميزات نسخة 3.0:
 * - Center bubble مرتفع مع pulse ring طبية
 * - Indicator أنيق تحت الأيقونة النشطة (dot + glow)
 * - Active icon يتحول للون التيل ويكبر
 * - Quick Actions sheet عند Long Press
 * - Scroll-hide مع Safe Area حقيقية
 * - Glass background مطابق للكروت
 */

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '../../utils';
import {
    Home, HeartPulse, Activity, ShoppingBag,
    Stethoscope, Calendar, FileText, Settings,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useNative } from '@/contexts/NativeContext';
import { PAGE_TO_TAB } from '@/lib/routes';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────

interface NavItem {
    name: string;
    icon: React.ElementType;
    page: string;
    badge?: number;
    quickActions?: QuickAction[];
}

interface QuickAction {
    label: string;
    icon: React.ElementType;
    href: string;
}

interface BottomNavProps {
    currentPageName?: string;
}

// ─── Nav Items Config ─────────────────────────────────────────────

const navItems: NavItem[] = [
    {
        name: 'الرئيسية',
        icon: Home,
        page: 'Home',
        quickActions: [
            { label: 'السجل اليومي', icon: FileText, href: '/daily-log' },
            { label: 'الإعدادات', icon: Settings, href: '/settings' },
        ],
    },
    {
        name: 'التشخيص',
        icon: Stethoscope,
        page: 'BodyMap',
        quickActions: [
            { label: 'تحليل الأعراض', icon: Activity, href: '/symptom-analysis' },
        ],
    },
    {
        // ── المركز البارز ──
        name: 'رعايتي',
        icon: HeartPulse,
        page: 'MyCare',
        quickActions: [
            { label: 'مواعيدي', icon: Calendar, href: '/my-appointments' },
            { label: 'ملفي الطبي', icon: FileText, href: '/medical-file' },
        ],
    },
    {
        name: 'تتبعي',
        icon: Activity,
        page: 'HealthTracker',
        quickActions: [
            { label: 'تسجيل صحتي', icon: Activity, href: '/record-health' },
        ],
    },
    {
        name: 'الصيدلية',
        icon: ShoppingBag,
        page: 'Shop',
    },
];

// ─── Regular Tab Item ─────────────────────────────────────────────

function TabItem({
    item, isActive, onPress, onLongPress,
}: {
    item: NavItem;
    isActive: boolean;
    onPress: () => void;
    onLongPress: () => void;
}) {
    const Icon = item.icon;
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wasLong = useRef(false);

    const onTouchStart = useCallback(() => {
        wasLong.current = false;
        timer.current = setTimeout(() => {
            wasLong.current = true;
            haptic.trigger('heavy');
            onLongPress();
        }, 500);
    }, [onLongPress]);

    const onTouchEnd = useCallback(() => {
        if (timer.current) { clearTimeout(timer.current); timer.current = null; }
        if (!wasLong.current) onPress();
    }, [onPress]);

    return (
        <div
            className="flex flex-col items-center justify-center flex-1 relative select-none cursor-pointer py-2"
            role="button"
            aria-pressed={isActive}
            aria-label={item.name}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchCancel={() => { if (timer.current) clearTimeout(timer.current); }}
            onClick={wasLong.current ? undefined : onPress}
        >
            {/* Icon */}
            <motion.div
                className="relative flex items-center justify-center mb-1"
                animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{ width: 30, height: 30 }}
            >
                {/* Active pill glow */}
                {isActive && (
                    <motion.div
                        layoutId="activeTabGlow"
                        className="absolute inset-0 rounded-xl"
                        style={{ backgroundColor: 'rgba(13,148,136,0.12)', boxShadow: '0 0 14px rgba(13,148,136,0.18)' }}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                )}
                <Icon
                    style={{ width: 21, height: 21 }}
                    className={`relative z-10 transition-colors duration-150 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                />
                {/* Badge */}
                {item.badge && item.badge > 0 && (
                    <motion.span
                        className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] rounded-full bg-rose-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900"
                        style={{ fontSize: 8, fontWeight: 800, padding: '0 2px' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 600 }}
                    >
                        {item.badge > 99 ? '99+' : item.badge}
                    </motion.span>
                )}
            </motion.div>

            {/* Label */}
            <motion.span
                animate={{
                    color: isActive ? '#0d9488' : '#94a3b8',
                    fontWeight: isActive ? 700 : 500,
                    scale: isActive ? 1.02 : 1,
                }}
                transition={{ duration: 0.15 }}
                style={{ fontSize: 10, letterSpacing: '-0.1px', lineHeight: 1 }}
            >
                {item.name}
            </motion.span>

            {/* Active dot indicator */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        exit={{ scaleX: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                        className="absolute bottom-0 w-4 h-[3px] rounded-full bg-teal-500"
                        style={{ boxShadow: '0 0 6px rgba(13,148,136,0.5)' }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Center Bubble Tab ────────────────────────────────────────────

function CenterTab({ item, isActive, onPress, onLongPress }: {
    item: NavItem;
    isActive: boolean;
    onPress: () => void;
    onLongPress: () => void;
}) {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wasLong = useRef(false);

    const onTouchStart = useCallback(() => {
        wasLong.current = false;
        timer.current = setTimeout(() => {
            wasLong.current = true;
            haptic.trigger('heavy');
            onLongPress();
        }, 500);
    }, [onLongPress]);

    const onTouchEnd = useCallback(() => {
        if (timer.current) { clearTimeout(timer.current); timer.current = null; }
        if (!wasLong.current) onPress();
    }, [onPress]);

    return (
        <div
            className="flex flex-col items-center justify-end flex-1 relative pb-2 select-none cursor-pointer"
            role="button"
            aria-pressed={isActive}
            aria-label={item.name}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchCancel={() => { if (timer.current) clearTimeout(timer.current); }}
            onClick={wasLong.current ? undefined : onPress}
        >
            {/* Elevated circle */}
            <motion.div
                className="absolute flex items-center justify-center rounded-full"
                animate={{
                    scale: isActive ? 1.06 : 1,
                    y: isActive ? -1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                    width: 56,
                    height: 56,
                    top: -20,
                    background: isActive
                        ? 'linear-gradient(135deg, #0d9488 0%, #059669 100%)'
                        : 'linear-gradient(135deg, rgba(13,148,136,0.12) 0%, rgba(5,150,105,0.08) 100%)',
                    border: isActive ? 'none' : '1.5px solid rgba(13,148,136,0.28)',
                    boxShadow: isActive
                        ? '0 8px 24px rgba(13,148,136,0.40), 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                        : '0 4px 14px rgba(0,0,0,0.08)',
                }}
            >
                <HeartPulse
                    style={{ width: 24, height: 24 }}
                    className={isActive ? 'text-white' : 'text-teal-500'}
                    strokeWidth={isActive ? 2.4 : 1.9}
                />
                {/* Pulse ring when active */}
                {isActive && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-teal-400/50"
                        animate={{ scale: [1, 1.4, 1.6], opacity: [0.6, 0.2, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                    />
                )}
            </motion.div>

            {/* Label */}
            <motion.span
                animate={{ color: isActive ? '#0d9488' : '#94a3b8', fontWeight: isActive ? 700 : 500 }}
                style={{ fontSize: 10, letterSpacing: '-0.1px', lineHeight: 1, marginTop: 2 }}
            >
                {item.name}
            </motion.span>
        </div>
    );
}

// ─── Quick Actions Sheet ──────────────────────────────────────────

function QuickActionsSheet({ item, onClose }: { item: NavItem; onClose: () => void }) {
    if (!item.quickActions?.length) return null;
    return (
        <motion.div
            className="fixed inset-0 z-[2000] flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }} />
            <motion.div
                className="relative w-full mx-4 mb-32 rounded-3xl overflow-hidden"
                style={{
                    background: 'rgba(254,252,245,0.97)',
                    backdropFilter: 'blur(40px)',
                    boxShadow: '0 -4px 40px rgba(0,0,0,0.15), 0 0 0 0.5px rgba(0,0,0,0.06)',
                }}
                initial={{ y: 50, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 420, damping: 35 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-8 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>

                <div className="flex items-center gap-2.5 px-5 py-3 border-b border-black/[0.05]">
                    <div className="w-9 h-9 rounded-[12px] bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
                        <item.icon className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" strokeWidth={2} />
                    </div>
                    <span className="text-[14px] font-black text-slate-800 dark:text-slate-100">{item.name}</span>
                </div>

                <div className="py-2">
                    {item.quickActions.map((action, idx) => (
                        <Link
                            key={idx}
                            href={action.href}
                            onClick={() => { haptic.trigger('light'); onClose(); }}
                            className="flex items-center gap-3 px-5 py-3.5 transition-colors active:bg-slate-50 dark:active:bg-slate-800/50 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0"
                        >
                            <div className="w-9 h-9 rounded-[12px] bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
                                <action.icon className="w-4 h-4 text-teal-600 dark:text-teal-400" strokeWidth={2} />
                            </div>
                            <span className="text-[13.5px] font-semibold text-slate-700 dark:text-slate-200">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────

export default function BottomNav({ currentPageName }: BottomNavProps) {
    const activeTab = PAGE_TO_TAB[currentPageName || ''] || 'Home';
    const scrollDirection = useScrollDirection();
    const { safeAreaInsets, isNative } = useNative();
    const [longPressedItem, setLongPressedItem] = useState<NavItem | null>(null);

    const safeBottom = isNative ? Math.max(safeAreaInsets.bottom, 0) : 0;
    const isHidden = scrollDirection === 'down';

    const handlePress = useCallback((item: NavItem, isActive: boolean) => {
        if (!isActive) { haptic.trigger('selection'); uiSounds.navigate(); }
        else haptic.trigger('light');
    }, []);

    const handleLongPress = useCallback((item: NavItem) => {
        if (item.quickActions?.length) setLongPressedItem(item);
    }, []);

    return (
        <>
            <motion.nav
                className={`md:hidden fixed bottom-0 left-0 right-0 z-[1000] transition-transform duration-300 ease-in-out ${isHidden ? 'translate-y-[140%]' : 'translate-y-0'}`}
                style={{ paddingBottom: safeBottom }}
                role="tablist"
                aria-label="التنقل الرئيسي"
            >
                {/* Liquid Glass Light background */}
                <div
                    className="absolute inset-0 rounded-t-[28px]"
                    style={{
                        background: 'rgba(240,250,248,0.95)',
                        backdropFilter: 'blur(48px) saturate(200%)',
                        WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                        borderTop: '1px solid rgba(255,255,255,1)',
                        boxShadow: '0 -1px 0 rgba(255,255,255,1), 0 -8px 32px rgba(15,23,42,0.05)',
                    }}
                />
                {/* Fluent top shine — 1px white line just below the border */}
                <div className="absolute top-[1px] left-6 right-6 h-px rounded-full pointer-events-none"
                    style={{ background: 'rgba(255,255,255,0.90)' }} />

                {/* Dark mode layer */}
                <div className="absolute inset-0 rounded-t-[28px] hidden dark:block"
                    style={{
                        background: 'rgba(15,23,42,0.90)',
                        backdropFilter: 'blur(48px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(48px) saturate(180%)',
                        borderTop: '0.5px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 -8px 32px rgba(0,0,0,0.25)',
                    }}
                />

                {/* Tabs */}
                <div className="relative flex justify-around items-end h-[64px] px-1">
                    {navItems.map((item, idx) => {
                        const isActive = activeTab === item.page;
                        const isCenter = idx === 2;

                        return (
                            <Link
                                key={item.page}
                                href={createPageUrl(item.page)}
                                className="flex flex-1 h-full"
                                style={{ textDecoration: 'none' }}
                                tabIndex={-1}
                                aria-hidden="true"
                            >
                                {isCenter ? (
                                    <CenterTab
                                        item={item}
                                        isActive={isActive}
                                        onPress={() => handlePress(item, isActive)}
                                        onLongPress={() => handleLongPress(item)}
                                    />
                                ) : (
                                    <TabItem
                                        item={item}
                                        isActive={isActive}
                                        onPress={() => handlePress(item, isActive)}
                                        onLongPress={() => handleLongPress(item)}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </motion.nav>

            {/* Quick Actions Sheet */}
            <AnimatePresence>
                {longPressedItem && (
                    <QuickActionsSheet
                        item={longPressedItem}
                        onClose={() => setLongPressedItem(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

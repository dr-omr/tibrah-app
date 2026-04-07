'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '../../utils';
import {
    Home, HeartPulse, ShoppingBag, User, Calendar,
    LogIn, LogOut, Settings, ChevronDown, Search,
    Menu, Stethoscope, Brain, WifiOff, Zap
} from 'lucide-react';
import { NotificationCenter } from '../notification-engine';
import ThemeToggle from '../common/ThemeToggle';
import LanguageToggle from '../common/LanguageToggle';
import { useAuth } from '@/contexts/AuthContext';
import HeaderMenu from './HeaderMenu';
import { haptic } from '@/lib/HapticFeedback';
import { useHealthDashboard } from '@/hooks/useHealthDashboard';
import { useSearch } from '@/components/search-engine';
import { uiSounds } from '@/lib/uiSounds';
import { CloudSyncDot } from '../CloudSyncIndicator';
import { useCloudSync } from '@/lib/useCloudSync';
import { SPRING_BOUNCY } from '@/lib/tibrah-motion';

interface HeaderProps {
    currentPageName?: string;
}

/* ═══════════════════════════════════════
   TIBRAH VECTOR LOGO
   ═══════════════════════════════════════ */
function TibrahLogoIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18" />
            <path d="M12 14c-3.866 0-7-3.134-7-7 0-3.866 3.134-7 7-7" />
            <circle cx="12" cy="11" r="2" fill="currentColor" className="opacity-40" />
        </svg>
    );
}

/* ═══════════════════════════════════════
   HEALTH MINI BAR (در dropdown)
   ═══════════════════════════════════════ */
function HealthMiniBar({ score, scoreAr, streak, streakAr }: {
    score: number; scoreAr: string; streak: number; streakAr: string;
}) {
    return (
        <div className="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/40">
            <div className="flex-1 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(to left, #10b981, #0d9488)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 tabular-nums">{scoreAr}</span>
            </div>
            {streak > 0 && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10">
                    <span className="text-[9px]">🔥</span>
                    <span className="text-[9px] font-bold text-orange-700 dark:text-orange-300">{streakAr}</span>
                </div>
            )}
        </div>
    );
}

const desktopNavItems = [
    { name: 'الرئيسية', icon: Home, page: 'Home' },
    { name: 'الأعراض', icon: Stethoscope, page: 'BodyMap' },
    { name: 'رعايتي', icon: HeartPulse, page: 'MyCare' },
    { name: 'الصيدلية', icon: ShoppingBag, page: 'Shop' },
];

export default function Header({ currentPageName }: HeaderProps) {
    const { openSearch } = useSearch();
    const { user, loading, signOut } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const dashboard = useHealthDashboard();
    const { status: syncStatus, isOnline } = useCloudSync();

    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useMotionValueEvent(scrollY, 'change', (latest) => {
        const prev = scrollY.getPrevious() ?? 0;
        setHidden(latest > prev && latest > 120);
        setIsScrolled(latest > 20);
    });

    return (
        <>
            {/* ═══════════════════ DESKTOP HEADER ═══════════════════ */}
            <motion.header
                variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
                animate={hidden ? 'hidden' : 'visible'}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="hidden md:block sticky top-0 z-50"
            >
                <div className={`absolute inset-0 transition-all duration-300 liquid-nav ${isScrolled ? '' : 'opacity-95'}`} />
                <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href={createPageUrl('Home')} className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 ring-1 ring-white/20">
                                <TibrahLogoIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-[16px] text-slate-900 dark:text-white leading-tight tracking-tight">طِبرَا</span>
                                <span className="text-[10.5px] text-teal-600 dark:text-teal-400 font-bold -mt-0.5 tracking-wide">العيادة الرقمية</span>
                            </div>
                        </Link>

                        {/* Nav */}
                        <nav className="flex items-center gap-0.5">
                            {desktopNavItems.map((item) => {
                                const isActive = currentPageName === item.page;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.page}
                                        href={createPageUrl(item.page)}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-[13px] transition-all duration-200 ${isActive
                                            ? 'bg-teal-50/80 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300'
                                            : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" strokeWidth={isActive ? 2.2 : 1.7} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5">
                            <ThemeToggle size="sm" />
                            <LanguageToggle variant="minimal" />
                            <div className="flex items-center justify-center p-1 px-2 rounded-full bg-slate-50 dark:bg-slate-800/80">
                                <CloudSyncDot status={syncStatus} />
                            </div>
                            <NotificationCenter />
                            <Link
                                href={createPageUrl('BookAppointment')}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold text-[13px] rounded-xl shadow-sm shadow-teal-500/20 transition-all duration-200"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>احجز موعد</span>
                            </Link>

                            {/* Auth */}
                            {loading ? (
                                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            ) : user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        aria-label="قائمة حساب المستخدم"
                                        className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        {user.photoURL ? (
                                            <Image src={user.photoURL} alt={user.displayName || ''} width={34} height={34} className="w-[34px] h-[34px] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" />
                                        ) : (
                                            <div className="w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showUserMenu && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute end-0 mt-2 w-64 rounded-2xl py-1 z-50 overflow-hidden"
                                                style={{
                                                    background: 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(245,247,250,0.88))',
                                                    backdropFilter: 'blur(40px)',
                                                    boxShadow: '0 20px 60px -10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
                                                }}
                                            >
                                                <div className="px-4 py-3.5 border-b border-slate-100/80">
                                                    <div className="flex items-center gap-3">
                                                        {user.photoURL ? (
                                                            <Image src={user.photoURL} alt="" width={44} height={44} className="w-11 h-11 rounded-xl border-2 border-white shadow-sm" />
                                                        ) : (
                                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                                                                {user.displayName?.charAt(0) || 'U'}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-[14px] text-slate-800 truncate">{user.displayName || 'مستخدم'}</p>
                                                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <HealthMiniBar
                                                        score={dashboard.healthScore}
                                                        scoreAr={dashboard.healthScoreAr}
                                                        streak={dashboard.streak}
                                                        streakAr={dashboard.streakAr}
                                                    />
                                                </div>

                                                {/* Links */}
                                                <div className="py-1">
                                                    {[
                                                        { href: createPageUrl('Profile'), icon: User, label: 'الملف الشخصي' },
                                                        { href: createPageUrl('Settings'), icon: Settings, label: 'الإعدادات' },
                                                    ].map((link) => (
                                                        <Link
                                                            key={link.href}
                                                            href={link.href}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                                            onClick={() => setShowUserMenu(false)}
                                                        >
                                                            <link.icon className="w-4 h-4 text-slate-400" />
                                                            <span>{link.label}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                                <div className="mx-3 h-px bg-slate-100" />
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => { signOut(); setShowUserMenu(false); }}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        <span>تسجيل الخروج</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <Link href={createPageUrl('Login')} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-teal-200 dark:border-teal-700/50 bg-teal-50/60 dark:bg-teal-500/8 text-teal-700 dark:text-teal-300 font-semibold text-[13px] hover:bg-teal-50 transition-colors">
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span>تسجيل الدخول</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* ═══════════════════ MOBILE HEADER ═══════════════════ */}
            <motion.header
                variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
                animate={hidden ? 'hidden' : 'visible'}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="md:hidden sticky top-0 z-40"
            >
                {/* Glass background */}
                <div
                    className={`absolute inset-0 transition-all duration-300 liquid-nav ${isScrolled ? '' : 'opacity-95'}`}
                />

                <div className="relative flex items-center justify-between px-4 h-[54px]">

                    {/* Logo (فades on scroll) */}
                    <motion.div
                        animate={{ opacity: isScrolled ? 0 : 1, x: isScrolled ? -10 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 pointer-events-none"
                        style={{ pointerEvents: isScrolled ? 'none' : 'auto' }}
                    >
                        <Link href={createPageUrl('Home')} className="flex items-center gap-2">
                            {/* Logo mark */}
                            <div className="relative w-8 h-8 rounded-[11px] bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/25 ring-1 ring-white/20">
                                <TibrahLogoIcon className="w-4 h-4 text-white" />
                                {/* Live dot */}
                                <motion.div
                                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900"
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 2.5, repeat: Infinity }}
                                />
                            </div>
                            <div>
                                <span className="font-black text-[16px] text-slate-900 dark:text-white tracking-tight leading-none block">طِبرَا</span>
                                <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 leading-none">العيادة الرقمية</span>
                            </div>
                        </Link>
                    </motion.div>

                    {/* ── DYNAMIC ISLAND PILL (on scroll) ── */}
                    <AnimatePresence>
                        {isScrolled && (
                            <motion.div
                                initial={{ y: -56, scale: 0.8, opacity: 0 }}
                                animate={{ y: 0, scale: 1, opacity: 1 }}
                                exit={{ y: -56, scale: 0.8, opacity: 0 }}
                                transition={SPRING_BOUNCY}
                                className="absolute inset-x-0 top-2 flex justify-center pointer-events-none z-50"
                            >
                                <div className="pointer-events-auto h-10 px-4 rounded-full flex items-center gap-3"
                                    style={{
                                        background: 'rgba(15,23,42,0.92)',
                                        backdropFilter: 'blur(24px)',
                                        border: '0.5px solid rgba(255,255,255,0.12)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                                    }}>
                                    {/* Brand chip */}
                                    <div className="flex items-center gap-1.5 border-e border-white/10 pe-3">
                                        <motion.div
                                            className="w-2 h-2 rounded-full bg-teal-400"
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <span className="text-[11px] font-black text-white tracking-wide">طِبرَا</span>
                                    </div>
                                    {/* Health score chip */}
                                    {!dashboard.loading && (
                                        <div className="flex items-center gap-1 border-e border-white/10 pe-3">
                                            <HeartPulse className="w-3 h-3 text-teal-400" />
                                            <span className="text-[11px] font-bold text-teal-300 tabular-nums">{dashboard.healthScoreAr}</span>
                                        </div>
                                    )}
                                    {/* Offline indicator */}
                                    {!isOnline && (
                                        <div className="flex items-center gap-1 border-e border-white/10 pe-3">
                                            <WifiOff className="w-3 h-3 text-amber-400" />
                                            <span className="text-[9px] font-bold text-amber-300">أوفلاين</span>
                                        </div>
                                    )}
                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button onClick={openSearch} className="text-white/60 hover:text-white transition-colors">
                                            <Search className="w-3.5 h-3.5" />
                                        </button>
                                        <NotificationCenter />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Right side actions (fades on scroll) */}
                    <motion.div
                        animate={{ opacity: isScrolled ? 0 : 1, x: isScrolled ? 10 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1.5"
                        style={{ pointerEvents: isScrolled ? 'none' : 'auto' }}
                    >
                        {/* Search */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={openSearch}
                            className="w-8 h-8 rounded-[10px] bg-white/60 dark:bg-slate-800/80 flex items-center justify-center border border-slate-100/80 dark:border-white/[0.06]"
                            aria-label="بحث"
                        >
                            <Search className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </motion.button>

                        {/* Sync dot */}
                        <div className="w-8 h-8 flex items-center justify-center">
                            <CloudSyncDot status={syncStatus} />
                        </div>

                        {/* Notifications */}
                        <NotificationCenter />

                        {/* User / login */}
                        {!loading && (
                            user ? (
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => { setShowMobileMenu(true); haptic.tap(); }}
                                    aria-label="فتح قائمة المستخدم"
                                    className="w-8 h-8 rounded-[10px] overflow-hidden flex-shrink-0 ring-2 ring-teal-500/25 shadow-sm"
                                    style={{ border: '2px solid rgba(13,148,136,0.3)' }}
                                >
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-black text-xs">
                                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </motion.button>
                            ) : (
                                <>
                                    <Link
                                        href={createPageUrl('Login')}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-[11px] border border-teal-100 dark:border-teal-700/40"
                                    >
                                        <LogIn className="w-3 h-3" />
                                        دخول
                                    </Link>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => { setShowMobileMenu(true); haptic.tap(); }}
                                        className="w-8 h-8 rounded-[10px] bg-white/60 dark:bg-slate-800/80 flex items-center justify-center border border-slate-100/80 dark:border-white/[0.06]"
                                    >
                                        <Menu className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                    </motion.button>
                                </>
                            )
                        )}
                    </motion.div>
                </div>

                {/* Offline banner under header */}
                <AnimatePresence>
                    {!isOnline && !isScrolled && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex items-center justify-center gap-2 py-1.5 bg-amber-50/90 dark:bg-amber-900/20 border-t border-amber-100 dark:border-amber-700/20">
                                <WifiOff className="w-3 h-3 text-amber-500" />
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                    وضع الأوفلاين — بياناتك محفوظة محلياً
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* Mobile Slide Menu */}
            <HeaderMenu isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
        </>
    );
}

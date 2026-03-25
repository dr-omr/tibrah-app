'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { createPageUrl } from '../../utils';
import { Home, HeartPulse, GraduationCap, ShoppingBag, User, Calendar, LogIn, LogOut, Settings, ChevronDown, Search, Menu, Stethoscope, TrendingUp, Brain } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import ThemeToggle from '../common/ThemeToggle';
import LanguageToggle from '../common/LanguageToggle';
import { useAuth } from '@/contexts/AuthContext';
import HeaderMenu from './HeaderMenu';
import { haptic } from '@/lib/HapticFeedback';
import { useHealthDashboard } from '@/hooks/useHealthDashboard';

interface HeaderProps {
    currentPageName?: string;
}

const desktopNavItems = [
    { name: 'الرئيسية', icon: Home, page: 'Home' },
    { name: 'الأعراض', icon: Stethoscope, page: 'BodyMap' },
    { name: 'رعايتي', icon: HeartPulse, page: 'MyCare' },
    { name: 'الصيدلية', icon: ShoppingBag, page: 'Shop' },
];

export default function Header({ currentPageName }: HeaderProps) {
    const { user, loading, signOut } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const dashboard = useHealthDashboard();

    // Scroll-aware states
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
        setIsScrolled(latest > 20);
    });

    return (
        <>
            {/* Desktop/Tablet Header */}
            <motion.header 
                variants={{
                    visible: { y: 0 },
                    hidden: { y: "-100%" }
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="hidden md:block sticky top-0 z-50"
            >
                <div className={`absolute inset-0 transition-all duration-300 ${
                    isScrolled 
                        ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]' 
                        : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg'
                }`} />

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href={createPageUrl('Home')} className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-base">ط</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-[15px] text-slate-800 dark:text-white leading-tight tracking-tight">طِبرَا</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium -mt-0.5">العيادة الرقمية</span>
                            </div>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="flex items-center gap-0.5">
                            {desktopNavItems.map((item) => {
                                const isActive = currentPageName === item.page;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.page}
                                        href={createPageUrl(item.page)}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-[13px] transition-all duration-200 ${isActive
                                            ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.7} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5">
                            <ThemeToggle size="sm" />
                            <LanguageToggle variant="minimal" />
                            <NotificationBell variant="header" />

                            {/* Book Appointment */}
                            <Link
                                href={createPageUrl('BookAppointment')}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[13px] rounded-xl shadow-sm transition-colors duration-200"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>احجز موعد</span>
                            </Link>

                            {/* Auth Surface */}
                            {loading ? (
                                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            ) : user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        {user.photoURL ? (
                                            <Image
                                                src={user.photoURL}
                                                alt={user.displayName || 'User'}
                                                width={34}
                                                height={34}
                                                className="w-[34px] h-[34px] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Account Dropdown */}
                                    {showUserMenu && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                                                className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/8 dark:shadow-slate-900/40 border border-slate-100 dark:border-slate-700 py-1 z-50 overflow-hidden"
                                            >
                                                {/* User info header */}
                                                <div className="px-4 py-3.5 border-b border-slate-100/80 dark:border-slate-700">
                                                    <div className="flex items-center gap-3">
                                                        {user.photoURL ? (
                                                            <Image
                                                                src={user.photoURL}
                                                                alt={user.displayName || ''}
                                                                width={44}
                                                                height={44}
                                                                className="w-11 h-11 rounded-xl border-2 border-white dark:border-slate-700 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700"
                                                            />
                                                        ) : (
                                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-[14px] text-slate-800 dark:text-white truncate">{user.displayName || 'مستخدم'}</p>
                                                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                                                        </div>
                                                    </div>

                                                    {/* Health mini-bar */}
                                                    <div className="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-slate-50 dark:border-slate-700/40">
                                                        <div className="flex items-center gap-1.5 flex-1">
                                                            <HeartPulse className="w-3.5 h-3.5 text-teal-500" />
                                                            <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                                                <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400" style={{ width: `${dashboard.healthScore}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">{dashboard.healthScoreAr}</span>
                                                        </div>
                                                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10">
                                                            <span className="text-[9px]">🔥</span>
                                                            <span className="text-[9px] font-bold text-amber-700 dark:text-amber-200">{dashboard.streakAr}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="py-1">
                                                    <Link
                                                        href={createPageUrl('Profile')}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <User className="w-4 h-4 text-slate-400" />
                                                        <span>الملف الشخصي</span>
                                                    </Link>
                                                    <Link
                                                        href={createPageUrl('Settings')}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <Settings className="w-4 h-4 text-slate-400" />
                                                        <span>الإعدادات</span>
                                                    </Link>
                                                </div>

                                                <div className="mx-3 h-px bg-slate-100 dark:bg-slate-700" />

                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            signOut();
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full"
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
                                <Link
                                    href={createPageUrl('Login')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-teal-200 dark:border-teal-700/50 bg-teal-50/60 dark:bg-teal-500/8 text-teal-700 dark:text-teal-300 font-semibold text-[13px] hover:bg-teal-50 dark:hover:bg-teal-500/12 transition-colors duration-200"
                                >
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span>تسجيل الدخول</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Header */}
            <motion.header 
                variants={{
                    visible: { y: 0 },
                    hidden: { y: "-100%" }
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="md:hidden sticky top-0 z-40"
            >
                <div className={`absolute inset-0 transition-all duration-300 ${
                    isScrolled 
                        ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]' 
                        : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg'
                }`} />

                <div className="relative flex items-center justify-between px-4 h-[52px]">
                    {/* Logo */}
                    <Link href={createPageUrl('Home')} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-sm">ط</span>
                        </div>
                        <span className="font-bold text-[15px] text-slate-800 dark:text-white tracking-tight">طِبرَا</span>
                    </Link>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1.5">
                        {/* Search */}
                        <button
                            onClick={() => {
                                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                                window.dispatchEvent(event);
                            }}
                            className="w-8 h-8 rounded-[10px] bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            aria-label="بحث"
                        >
                            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        </button>

                        <NotificationBell variant="header" />

                        {/* Auth button — guest: clean sign-in, logged-in: avatar */}
                        {!loading && (
                            user ? (
                                <button
                                    onClick={() => { setShowMobileMenu(true); haptic.tap(); }}
                                    className="w-8 h-8 rounded-[10px] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0"
                                >
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
                                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </button>
                            ) : (
                                <Link
                                    href={createPageUrl('Login')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-[11px] border border-teal-100/80 dark:border-teal-700/40 hover:bg-teal-100 dark:hover:bg-teal-500/15 transition-colors"
                                >
                                    <LogIn className="w-3 h-3" />
                                    دخول
                                </Link>
                            )
                        )}

                        {/* Menu Button */}
                        <button
                            onClick={() => {
                                setShowMobileMenu(true);
                                haptic.tap();
                            }}
                            className="w-8 h-8 rounded-[10px] bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            aria-label="القائمة"
                        >
                            <Menu className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu Slide-over */}
            <HeaderMenu isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
        </>
    );
}

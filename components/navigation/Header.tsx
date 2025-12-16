'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPageUrl } from '../../utils';
import { Home, HeartPulse, GraduationCap, ShoppingBag, User, Calendar, LogOut, Settings, ChevronDown } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
    currentPageName?: string;
}

const desktopNavItems = [
    { name: 'الرئيسية', icon: Home, page: 'Home' },
    { name: 'خريطة الجسم', icon: HeartPulse, page: 'BodyMap' },
    { name: 'الدورات', icon: GraduationCap, page: 'Courses' },
    { name: 'المتجر', icon: ShoppingBag, page: 'Shop' },
];

export default function Header({ currentPageName }: HeaderProps) {
    const { user, loading, signOut, signInWithGoogle } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <>
            {/* Desktop/Tablet Header - Hidden on Mobile */}
            <header className="hidden md:block sticky top-0 z-50">
                {/* Glassmorphism background */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-slate-100/80" />

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo - Left */}
                        <Link href={createPageUrl('Home')} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] flex items-center justify-center shadow-lg shadow-[#2D9B83]/25 group-hover:shadow-[#2D9B83]/40 transition-shadow">
                                <span className="text-white font-bold text-lg">ط</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-slate-800 leading-tight">طِبرَا</span>
                                <span className="text-[10px] text-slate-400 font-medium -mt-0.5">العيادة الرقمية</span>
                            </div>
                        </Link>

                        {/* Navigation Links - Center */}
                        <nav className="flex items-center gap-1">
                            {desktopNavItems.map((item) => {
                                const isActive = currentPageName === item.page;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.page}
                                        href={createPageUrl(item.page)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${isActive
                                            ? 'bg-[#2D9B83]/10 text-[#2D9B83]'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" strokeWidth={isActive ? 2.2 : 1.8} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Actions - Right */}
                        <div className="flex items-center gap-3">
                            {/* Notification Bell */}
                            <NotificationBell variant="header" />

                            {/* Book Appointment Button */}
                            <Link
                                href={createPageUrl('BookAppointment')}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2D9B83] to-[#3FB39A] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#2D9B83]/25 hover:shadow-[#2D9B83]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>احجز موعد</span>
                            </Link>

                            {/* User Profile / Login */}
                            {loading ? (
                                <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                            ) : user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
                                    >
                                        {user.photoURL ? (
                                            <Image
                                                src={user.photoURL}
                                                alt={user.displayName || 'User'}
                                                width={40}
                                                height={40}
                                                className="w-10 h-10 rounded-full border-2 border-[#2D9B83]"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] flex items-center justify-center text-white font-bold">
                                                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showUserMenu && (
                                        <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-slate-100">
                                                <p className="font-semibold text-slate-800 truncate">{user.displayName || 'مستخدم'}</p>
                                                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                href={createPageUrl('Profile')}
                                                className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                <span>الملف الشخصي</span>
                                            </Link>
                                            <Link
                                                href={createPageUrl('Settings')}
                                                className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>الإعدادات</span>
                                            </Link>
                                            <hr className="my-2 border-slate-100" />
                                            <button
                                                onClick={() => {
                                                    signOut();
                                                    setShowUserMenu(false);
                                                }}
                                                className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>تسجيل الخروج</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={signInWithGoogle}
                                    className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 rounded-xl text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span>تسجيل الدخول</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Header - Simplified */}
            <header className="md:hidden sticky top-0 z-40">
                {/* Glassmorphism background */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-slate-100/50" />

                <div className="relative flex items-center justify-between px-4 h-14">
                    {/* Logo */}
                    <Link href={createPageUrl('Home')} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] flex items-center justify-center shadow-md shadow-[#2D9B83]/20">
                            <span className="text-white font-bold text-sm">ط</span>
                        </div>
                        <span className="font-bold text-base text-slate-800">طِبرَا</span>
                    </Link>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        <NotificationBell variant="header" />

                        {/* User Avatar on Mobile */}
                        {!loading && user && (
                            <Link href={createPageUrl('Profile')}>
                                {user.photoURL ? (
                                    <Image
                                        src={user.photoURL}
                                        alt={user.displayName || 'User'}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full border-2 border-[#2D9B83]"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] flex items-center justify-center text-white font-bold text-sm">
                                        {user.displayName?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </Link>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}

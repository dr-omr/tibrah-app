'use client';

import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '../../utils';
import { Home, HeartPulse, GraduationCap, ShoppingBag, User, Calendar } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

interface HeaderProps {
    currentPageName?: string;
}

const desktopNavItems = [
    { name: 'الرئيسية', icon: Home, page: 'Home' },
    { name: 'خريطة الجسم', icon: HeartPulse, page: 'BodyMap' },
    { name: 'الدورات', icon: GraduationCap, page: 'Courses' },
    { name: 'المتجر', icon: ShoppingBag, page: 'Shop' },
    { name: 'حسابي', icon: User, page: 'Profile' },
];

export default function Header({ currentPageName }: HeaderProps) {
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

                            <Link
                                href={createPageUrl('BookAppointment')}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2D9B83] to-[#3FB39A] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#2D9B83]/25 hover:shadow-[#2D9B83]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>احجز موعد</span>
                            </Link>
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
                    </div>
                </div>
            </header>
        </>
    );
}

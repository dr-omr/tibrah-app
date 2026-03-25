'use client';

import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '../../utils';
import { Home, HeartPulse, Activity, ShoppingBag, Stethoscope } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { PAGE_TO_TAB } from '@/lib/routes';

interface BottomNavProps {
    currentPageName?: string;
}

const navItems = [
    { name: 'الرئيسية', icon: Home, page: 'Home' },
    { name: 'التشخيص', icon: Stethoscope, page: 'BodyMap' },
    { name: 'رعايتي', icon: HeartPulse, page: 'MyCare' },
    { name: 'تتبعي', icon: Activity, page: 'HealthTracker' },
    { name: 'الصيدلية', icon: ShoppingBag, page: 'Shop' },
];

// Map pages to their parent nav tab — imported from centralized route config
const pageToTab = PAGE_TO_TAB;

export default function BottomNav({ currentPageName }: BottomNavProps) {
    const activeTab = pageToTab[currentPageName || ''] || 'Home';
    const scrollDirection = useScrollDirection();

    const handleNavClick = (isActive: boolean) => {
        if (!isActive) {
            haptic.selection();
            uiSounds.navigate();
        }
    };

    return (
        <nav
            className={`md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe transition-transform duration-300 ease-in-out ${scrollDirection === 'down' ? 'translate-y-[150%]' : 'translate-y-0'
                }`}
        >
            {/* Glassmorphism background - iOS style */}
            <div
                className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md"
                style={{
                    boxShadow: '0 -1px 0 rgba(0,0,0,0.05), 0 -8px 32px rgba(0,0,0,0.08)'
                }}
            />

            {/* Top highlight line */}
            <div className="absolute top-0 left-0 right-0 h-[0.5px] bg-gradient-to-r from-transparent via-slate-200/80 dark:via-slate-700/80 to-transparent" />

            {/* Navigation items */}
            <div className="relative flex justify-around items-end h-[56px] px-1">
                {navItems.map((item) => {
                    const isActive = activeTab === item.page;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.page}
                            href={createPageUrl(item.page)}
                            aria-label={item.name}
                            onClick={() => handleNavClick(isActive)}
                            className={`flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition-all duration-150 
                                ${isActive
                                    ? 'bg-primary/8'
                                    : 'active:scale-95 active:bg-slate-100/50 dark:active:bg-slate-800/50'
                                }`}
                        >
                            {/* Icon container */}
                            <div
                                className={`relative flex items-center justify-center w-7 h-7 mb-0.5 transition-transform duration-150 
                                    ${isActive ? 'scale-105' : ''}`}
                            >
                                <Icon
                                    className={`w-[22px] h-[22px] transition-colors duration-150 ${isActive
                                        ? 'text-primary'
                                        : 'text-slate-400 dark:text-slate-500'
                                        }`}
                                    strokeWidth={isActive ? 2.2 : 1.8}
                                    aria-hidden="true"
                                />
                                {/* Active indicator dot */}
                                {isActive && (
                                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={`text-xs tracking-tight transition-all duration-150 ${isActive
                                    ? 'text-primary font-bold'
                                    : 'text-slate-400 dark:text-slate-500 font-semibold'
                                    }`}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Safe area spacer for iPhone home indicator */}
            <div
                className="h-[env(safe-area-inset-bottom,0px)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md"
                style={{ minHeight: '4px' }}
            />
        </nav>
    );
}

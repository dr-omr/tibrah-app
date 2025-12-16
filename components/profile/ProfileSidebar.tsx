import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '@/utils';
import {
    User, LayoutDashboard, Heart, Calendar, Settings,
    LogOut, Crown, Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProfileSidebarProps {
    user: {
        avatar_url?: string;
        full_name?: string;
        email?: string;
        settings?: {
            displayName?: string;
        };
        role?: string;
    } | null;
    activePage?: string;
    onLogout?: () => void;
}

const navItems = [
    { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard, page: 'Profile' },
    { id: 'health', label: 'تتبع صحتي', icon: Heart, page: 'HealthTracker' },
    { id: 'appointments', label: 'المواعيد', icon: Calendar, page: 'BookAppointment' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, page: 'settings' },
];

export default function ProfileSidebar({ user, activePage = 'overview', onLogout }: ProfileSidebarProps) {
    const displayName = user?.settings?.displayName || user?.full_name || 'مستخدم جديد';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* User Profile Header */}
            <div className="bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] p-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                            <Crown className="w-3.5 h-3.5 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-white font-bold text-lg truncate">{displayName}</h2>
                        <p className="text-white/70 text-sm truncate">{user?.email || ''}</p>
                        <Badge className="mt-1 bg-white/20 text-white border-0 text-xs">
                            عضو مميز
                        </Badge>
                    </div>
                </div>

                {/* Vitality Score Mini */}
                <div className="mt-4 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-white/80" />
                            <span className="text-white/80 text-sm">مؤشر الحيوية</span>
                        </div>
                        <span className="text-white font-bold text-lg">75%</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '75%' }} />
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-3">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePage === item.id;
                        return (
                            <li key={item.id}>
                                <Link href={createPageUrl(item.page)}>
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                        ${isActive
                                            ? 'bg-[#2D9B83]/10 text-[#2D9B83]'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#2D9B83]' : 'text-slate-400'}`} />
                                        <span className="font-medium">{item.label}</span>
                                        {isActive && (
                                            <div className="mr-auto w-1.5 h-1.5 bg-[#2D9B83] rounded-full" />
                                        )}
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Admin Link (if admin) */}
            {(user?.role === 'admin' || user?.email === 'dr.omar@tibrah.com') && (
                <div className="px-3 pb-3">
                    <Link href={createPageUrl('AdminDashboard')}>
                        <Button className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl h-11">
                            <LayoutDashboard className="w-4 h-4 ml-2" />
                            لوحة الإدارة
                        </Button>
                    </Link>
                </div>
            )}

            {/* Logout Button */}
            <div className="p-3 border-t border-slate-100">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">تسجيل الخروج</span>
                </button>
            </div>
        </div>
    );
}

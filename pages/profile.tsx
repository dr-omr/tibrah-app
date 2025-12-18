import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRouter } from 'next/router';
import {
    User, FileText, TrendingUp, Heart, Settings, Bell, Shield, Palette,
    ChevronLeft, HelpCircle, MessageCircle, Info, LogOut, Sparkles,
    Calendar, BookOpen, Activity, Pill, Moon, Droplets
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Link from 'next/link';
import { createPageUrl } from '../utils';
import { ProfileSkeleton } from '../components/common/Skeletons';

// TypeScript Interfaces
interface UserData {
    id?: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
    settings?: {
        displayName?: string;
        notifications?: boolean;
        darkMode?: boolean;
        [key: string]: unknown;
    };
}

interface MenuItemProps {
    icon: React.ElementType;
    label: string;
    href?: string;
    onClick?: () => void;
    badge?: string;
    badgeColor?: string;
    chevron?: boolean;
    toggle?: boolean;
    toggleValue?: boolean;
    onToggle?: (value: boolean) => void;
    danger?: boolean;
}

interface MenuSectionProps {
    title: string;
    children: React.ReactNode;
}

export default function Profile() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const router = useRouter();

    useEffect(() => {
        base44.auth.me().then((data: UserData | null) => {
            setUser(data);
            setNotifications(data?.settings?.notifications !== false);
            setDarkMode(data?.settings?.darkMode === true);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, []);

    const handleLogout = async () => {
        await base44.auth.logout();
        router.push('/login');
    };

    if (loading) return <ProfileSkeleton />;

    // Reusable Menu Item Component
    const MenuItem = ({
        icon: Icon,
        label,
        href,
        onClick,
        badge,
        badgeColor = 'bg-[#2D9B83]',
        chevron = true,
        toggle = false,
        toggleValue = false,
        onToggle,
        danger = false
    }: MenuItemProps) => {
        const content = (
            <div
                className={`flex items-center gap-4 p-4 transition-colors ${danger ? 'hover:bg-red-50' : 'hover:bg-slate-50'
                    } active:bg-slate-100`}
                onClick={onClick}
            >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-slate-100'
                    }`}>
                    <Icon className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-slate-600'}`} />
                </div>
                <span className={`flex-1 font-medium ${danger ? 'text-red-500' : 'text-slate-700'}`}>
                    {label}
                </span>
                {badge && (
                    <Badge className={`${badgeColor} text-white border-0 text-xs`}>
                        {badge}
                    </Badge>
                )}
                {toggle ? (
                    <Switch
                        checked={toggleValue}
                        onCheckedChange={onToggle}
                        className="data-[state=checked]:bg-[#2D9B83]"
                    />
                ) : chevron && (
                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                )}
            </div>
        );

        if (href) {
            return <Link href={href}>{content}</Link>;
        }
        return <div className="cursor-pointer">{content}</div>;
    };

    // Menu Section Component
    const MenuSection = ({ title, children }: MenuSectionProps) => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
            <div className="px-4 pt-4 pb-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">{title}</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {children}
            </div>
        </div>
    );

    // Stats data
    const stats = [
        { label: 'الأيام النشطة', value: '12', icon: Activity, color: 'text-[#2D9B83]', bg: 'bg-[#2D9B83]/10' },
        { label: 'الأكواب', value: '45', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-50' },
        { label: 'ساعات النوم', value: '52', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'الجرعات', value: '28', icon: Pill, color: 'text-rose-500', bg: 'bg-rose-50' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] pt-8 pb-20 px-6 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#D4AF37]/20 rounded-full blur-2xl" />

                {/* Profile Info */}
                <div className="relative flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm border-2 border-white/30">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-white truncate">
                            {user?.settings?.displayName || user?.full_name || 'مستخدم جديد'}
                        </h1>
                        <p className="text-white/70 text-sm truncate">{user?.email || ''}</p>
                        <Badge className="mt-2 bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                            <Sparkles className="w-3 h-3 ml-1" />
                            عضو مميز
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Overlapping Header */}
            <div className="px-4 -mt-12 relative z-10">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4">
                    <div className="grid grid-cols-4 gap-2">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="text-center">
                                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                                        <Icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <div className="text-lg font-bold text-slate-800">{stat.value}</div>
                                    <div className="text-[10px] text-slate-500">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="px-4 pt-6">
                {/* My Services */}
                <MenuSection title="خدماتي">
                    <MenuItem
                        icon={FileText}
                        label="ملفي الطبي"
                        href={createPageUrl('MedicalFile')}
                        badge="3 تقارير"
                    />
                    <MenuItem
                        icon={TrendingUp}
                        label="متتبع الصحة"
                        href="/health-tracker"
                        badge="جديد"
                        badgeColor="bg-[#D4AF37]"
                    />
                    <MenuItem
                        icon={Calendar}
                        label="مواعيدي"
                        href={createPageUrl('MyAppointments')}
                    />
                    <MenuItem
                        icon={BookOpen}
                        label="دوراتي"
                        href={createPageUrl('Courses')}
                        badge="2 نشطة"
                        badgeColor="bg-amber-500"
                    />
                    <MenuItem
                        icon={Heart}
                        label="خريطة الجسم"
                        href={createPageUrl('BodyMap')}
                    />
                </MenuSection>

                {/* Settings */}
                <MenuSection title="الإعدادات">
                    <MenuItem
                        icon={User}
                        label="تعديل الملف الشخصي"
                        href={createPageUrl('Settings')}
                    />
                    <MenuItem
                        icon={Bell}
                        label="الإشعارات"
                        toggle
                        toggleValue={notifications}
                        onToggle={(value) => {
                            setNotifications(value);
                            base44.auth.updateMe({
                                settings: { ...user?.settings, notifications: value }
                            });
                        }}
                        chevron={false}
                    />
                    <MenuItem
                        icon={Shield}
                        label="الأمان والخصوصية"
                        href={createPageUrl('Settings')}
                    />
                    <MenuItem
                        icon={Palette}
                        label="الوضع الداكن"
                        toggle
                        toggleValue={darkMode}
                        onToggle={(value) => {
                            setDarkMode(value);
                            document.documentElement.classList.toggle('dark', value);
                            base44.auth.updateMe({
                                settings: { ...user?.settings, darkMode: value }
                            });
                        }}
                        chevron={false}
                    />
                </MenuSection>

                {/* Support */}
                <MenuSection title="الدعم والمساعدة">
                    <MenuItem
                        icon={HelpCircle}
                        label="مركز المساعدة"
                        href="/help"
                    />
                    <MenuItem
                        icon={MessageCircle}
                        label="تواصل معنا"
                        href="/contact"
                    />
                    <MenuItem
                        icon={Info}
                        label="عن طِبرَا"
                        href="/about"
                    />
                </MenuSection>

                {/* Logout Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
                    <MenuItem
                        icon={LogOut}
                        label="تسجيل الخروج"
                        onClick={handleLogout}
                        danger
                        chevron={false}
                    />
                </div>

                {/* App Version */}
                <p className="text-center text-sm text-slate-400 py-4">
                    طِبرَا الإصدار ٢.٠.٠
                </p>
            </div>
        </div>
    );
}

// pages/profile.tsx
// Premium Creative Profile with Touch Interactions

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserStats, UserStats } from '@/lib/statsService';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import {
    User, FileText, TrendingUp, Heart, Bell, Shield, Palette,
    ChevronLeft, HelpCircle, MessageCircle, Info, LogOut, Sparkles,
    Calendar, BookOpen, Activity, Pill, Moon, Droplets, Crown,
    Star, Award, Zap, Gift, Settings, Share2, QrCode
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { createPageUrl } from '../utils';

interface UserData {
    id: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    settings?: any;
    created_at?: string;
}

const ProfileSkeleton = () => (
    <div className="p-6 space-y-4">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
);

export default function Profile() {
    const { user: authUser, signOut } = useAuth();
    const [user, setUser] = useState<UserData | null>(null);
    const [statsData, setStatsData] = useState<UserStats>({ activeDays: 0, waterCups: 0, sleepHours: 0, dosesTaken: 0 });
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const router = useRouter();
    const { isDarkMode, toggleDarkMode } = useTheme();

    // Handle Share
    const handleShare = async () => {
        const shareData = {
            title: 'طِبرَا - العيادة الرقمية',
            text: `انضم لي في تطبيق طِبرَا للصحة والعافية! ${user?.full_name || 'مستخدم'}`,
            url: typeof window !== 'undefined' ? window.location.origin : 'https://tibrah.app',
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success('تمت المشاركة بنجاح!');
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareData.url);
                toast.success('تم نسخ الرابط!');
            }
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    // Generate QR Code using free API
    const handleQRCode = async () => {
        try {
            const url = typeof window !== 'undefined' ? window.location.origin : 'https://tibrah.app';
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}&color=2D9B83`;
            setQrCodeUrl(qrUrl);
            setShowQRModal(true);
        } catch (error) {
            toast.error('حدث خطأ في إنشاء الكود');
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (!authUser) {
                setLoading(false);
                return;
            }

            try {
                const stats = await fetchUserStats();
                setStatsData(stats);

                const dbUser = await db.entities.User.get(authUser.id) as unknown as UserData;
                const fullUserData = {
                    ...authUser,
                    settings: dbUser?.settings || {},
                };

                setUser(fullUserData as UserData);
                setNotifications(dbUser?.settings?.notifications !== false);
                setDarkMode(dbUser?.settings?.darkMode === true);
            } catch (e) {
                console.error("Profile Load Error", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [authUser]);

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    const updateSetting = async (key: string, value: boolean) => {
        if (!authUser?.id) return;

        if (key === 'notifications') setNotifications(value);
        if (key === 'darkMode') {
            setDarkMode(value);
            document.documentElement.classList.toggle('dark', value);
        }

        try {
            const currentDbUser = await db.entities.User.get(authUser.id) || { id: authUser.id };
            const newSettings = { ...((currentDbUser as any).settings || {}), [key]: value };

            if ((currentDbUser as any).created_at) {
                await db.entities.User.update(authUser.id, { settings: newSettings });
            } else {
                await db.entities.User.create({ ...currentDbUser, settings: newSettings });
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <ProfileSkeleton />;

    // Guest mode - show welcome card for non-authenticated users
    if (!authUser) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
                <motion.div
                    className="relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2D9B83] via-[#3FB39A] to-[#2D9B83]">
                        <motion.div
                            className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                            animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 8 }}
                        />
                    </div>
                    <div className="relative pt-12 pb-28 px-6 text-center">
                        <motion.div
                            className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-sm border-2 border-white/40 mx-auto mb-6"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                        >
                            <User className="w-12 h-12 text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white mb-2">مرحباً بك في طِبرَا</h1>
                        <p className="text-white/70 text-sm">سجل حسابك عشان تستفيد من كل الميزات</p>
                    </div>
                </motion.div>

                <div className="px-4 -mt-16 relative z-10 space-y-4">
                    {/* Benefits Card */}
                    <motion.div
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-center">ليش تسجل حسابك؟</h3>
                        <div className="space-y-3">
                            {[
                                { icon: Activity, text: 'تتبع صحتك يومياً', color: '#2D9B83' },
                                { icon: Sparkles, text: 'نصائح ذكية مخصصة لك', color: '#D4AF37' },
                                { icon: Calendar, text: 'احفظ مواعيدك وبياناتك', color: '#3B82F6' },
                                { icon: Heart, text: 'تقارير صحية أسبوعية', color: '#EC4899' },
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={i}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                    >
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + '15' }}>
                                            <Icon className="w-5 h-5" style={{ color: item.color }} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.text}</span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Link href="/register" className="flex-1">
                                <motion.button
                                    className="w-full py-3 bg-gradient-to-r from-[#2D9B83] to-[#3FB39A] text-white font-bold rounded-xl"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    إنشاء حساب
                                </motion.button>
                            </Link>
                            <Link href="/login" className="flex-1">
                                <motion.button
                                    className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    تسجيل دخول
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Quick Access still available for guests */}
                    <motion.div
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">استكشف</h4>
                        {[
                            { icon: HelpCircle, label: 'مركز المساعدة', href: '/help', color: '#3B82F6' },
                            { icon: MessageCircle, label: 'تواصل معنا', href: '/contact', color: '#22C55E' },
                            { icon: Info, label: 'عن طِبرَا', href: '/about', color: '#6366F1' },
                        ].map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <Link key={index} href={item.href}>
                                    <div className="flex items-center gap-4 p-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                            <Icon className="w-5 h-5" style={{ color: item.color }} />
                                        </div>
                                        <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                                        <ChevronLeft className="w-5 h-5 text-slate-300" />
                                    </div>
                                </Link>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        );
    }

    // Stats with pastel colors
    const stats = [
        { label: 'الأيام النشطة', value: statsData.activeDays, icon: Activity, color: '#2D9B83', bg: 'bg-emerald-50' },
        { label: 'أكواب الماء', value: statsData.waterCups, icon: Droplets, color: '#06B6D4', bg: 'bg-cyan-50' },
        { label: 'ساعات النوم', value: statsData.sleepHours, icon: Moon, color: '#8B5CF6', bg: 'bg-violet-50' },
        { label: 'الجرعات', value: statsData.dosesTaken, icon: Pill, color: '#F43F5E', bg: 'bg-rose-50' },
    ];

    // Quick actions with creative icons
    const quickActions = [
        { icon: FileText, label: 'ملفي الطبي', href: createPageUrl('MedicalFile'), color: '#2D9B83', bg: 'bg-emerald-50' },
        { icon: TrendingUp, label: 'متتبع الصحة', href: '/health-tracker', color: '#F59E0B', bg: 'bg-amber-50', badge: 'جديد' },
        { icon: Calendar, label: 'مواعيدي', href: createPageUrl('MyAppointments'), color: '#3B82F6', bg: 'bg-blue-50' },
        { icon: Heart, label: 'خريطة الجسم', href: createPageUrl('BodyMap'), color: '#EC4899', bg: 'bg-pink-50' },
        { icon: BookOpen, label: 'دوراتي', href: createPageUrl('Courses'), color: '#8B5CF6', bg: 'bg-violet-50' },
        { icon: Gift, label: 'المكافآت', href: '/rewards', color: '#D4AF37', bg: 'bg-amber-50', badge: 'جديد' },
    ];

    // Settings items
    const settingsItems = [
        { icon: User, label: 'تعديل الملف الشخصي', href: createPageUrl('Settings'), color: '#6366F1' },
        { icon: Bell, label: 'الإشعارات', toggle: true, value: notifications, onToggle: (v: boolean) => updateSetting('notifications', v), color: '#F59E0B' },
        { icon: Palette, label: 'الوضع الداكن', toggle: true, value: isDarkMode, onToggle: () => toggleDarkMode(), color: '#8B5CF6' },
        { icon: Shield, label: 'الأمان والخصوصية', href: createPageUrl('Settings'), color: '#10B981' },
    ];

    // Support items
    const supportItems = [
        { icon: HelpCircle, label: 'مركز المساعدة', href: '/help', color: '#3B82F6' },
        { icon: MessageCircle, label: 'تواصل معنا', href: '/contact', color: '#22C55E' },
        { icon: Info, label: 'عن طِبرَا', href: '/about', color: '#6366F1' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            {/* Creative Header with Avatar */}
            <motion.div
                className="relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2D9B83] via-[#3FB39A] to-[#2D9B83]">
                    <motion.div
                        className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 8 }}
                    />
                    <motion.div
                        className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-2xl"
                        animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
                        transition={{ repeat: Infinity, duration: 6 }}
                    />
                </div>

                <div className="relative pt-8 pb-24 px-6">
                    {/* Top Actions */}
                    <div className="flex justify-between items-center mb-6">
                        <motion.button
                            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                            whileTap={{ scale: 0.9 }}
                        >
                            <Settings className="w-5 h-5 text-white" />
                        </motion.button>
                        <div className="flex gap-2">
                            <motion.button
                                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                                whileTap={{ scale: 0.9 }}
                                onClick={handleShare}
                            >
                                <Share2 className="w-5 h-5 text-white" />
                            </motion.button>
                            <motion.button
                                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                                whileTap={{ scale: 0.9 }}
                                onClick={handleQRCode}
                            >
                                <QrCode className="w-5 h-5 text-white" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <motion.div
                        className="flex flex-col items-center text-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Avatar with Ring */}
                        <motion.div
                            className="relative mb-4"
                            whileTap={{ scale: 0.95, rotate: 5 }}
                        >
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center backdrop-blur-sm border-2 border-white/40 shadow-2xl overflow-hidden">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-white" />
                                )}
                            </div>
                            {/* Crown Badge */}
                            <motion.div
                                className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] rounded-xl flex items-center justify-center shadow-lg"
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                            >
                                <Crown className="w-4 h-4 text-white" />
                            </motion.div>
                            {/* Verified Badge */}
                            <motion.div
                                className="absolute -bottom-1 -left-1 w-7 h-7 bg-white rounded-xl flex items-center justify-center shadow-lg"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, type: 'spring' }}
                            >
                                <Sparkles className="w-4 h-4 text-[#2D9B83]" />
                            </motion.div>
                        </motion.div>

                        {/* User Name */}
                        <h1 className="text-2xl font-bold text-white mb-1">
                            {user?.settings?.displayName || user?.full_name || 'مستخدم جديد'}
                        </h1>
                        <p className="text-white/60 text-sm mb-3">{user?.email || ''}</p>

                        {/* Membership Badge */}
                        <motion.div
                            className="flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full backdrop-blur-sm"
                            whileTap={{ scale: 0.95 }}
                        >
                            <Star className="w-4 h-4 text-[#D4AF37]" />
                            <span className="text-white text-sm font-medium">عضو مميز</span>
                            <Award className="w-4 h-4 text-[#D4AF37]" />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Stats Grid - Overlapping */}
            <div className="px-4 -mt-16 relative z-10">
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-4"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="grid grid-cols-4 gap-2">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={index}
                                    className="text-center p-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <motion.div
                                        className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}
                                        whileTap={{ rotate: 10 }}
                                    >
                                        <Icon className="w-6 h-6" style={{ color: stat.color }} strokeWidth={1.5} />
                                    </motion.div>
                                    <div className="text-xl font-bold text-slate-800 dark:text-white">{stat.value}</div>
                                    <div className="text-[10px] text-slate-500">{stat.label}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions - 3 column grid */}
            <div className="px-4 pt-6">
                <motion.h3
                    className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 px-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    خدماتي
                </motion.h3>
                <div className="grid grid-cols-3 gap-3">
                    {quickActions.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Link key={index} href={item.href}>
                                <motion.div
                                    className="relative bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {item.badge && (
                                        <motion.span
                                            className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[8px] font-bold"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.6, type: 'spring' }}
                                        >
                                            {item.badge}
                                        </motion.span>
                                    )}
                                    <motion.div
                                        className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-2`}
                                        whileTap={{ rotate: -10, scale: 0.9 }}
                                    >
                                        <Icon className="w-6 h-6" style={{ color: item.color }} strokeWidth={1.5} />
                                    </motion.div>
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Settings Section */}
            <div className="px-4 pt-6">
                <motion.h3
                    className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 px-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    الإعدادات
                </motion.h3>
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {settingsItems.map((item, index) => {
                        const Icon = item.icon;
                        const content = (
                            <motion.div
                                className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-700 last:border-0"
                                whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                            >
                                <motion.div
                                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                                    whileTap={{ scale: 0.9, rotate: 5 }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                                </motion.div>
                                <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                                {item.toggle ? (
                                    <Switch
                                        checked={item.value}
                                        onCheckedChange={item.onToggle}
                                        className="data-[state=checked]:bg-[#2D9B83]"
                                    />
                                ) : (
                                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                                )}
                            </motion.div>
                        );
                        return item.href ? (
                            <Link key={index} href={item.href}>{content}</Link>
                        ) : (
                            <div key={index}>{content}</div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Support Section */}
            <div className="px-4 pt-6">
                <motion.h3
                    className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 px-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    الدعم والمساعدة
                </motion.h3>
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    {supportItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Link key={index} href={item.href}>
                                <motion.div
                                    className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-700 last:border-0"
                                    whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                >
                                    <motion.div
                                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                                        whileTap={{ scale: 0.9, rotate: 5 }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                                    </motion.div>
                                    <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                                </motion.div>
                            </Link>
                        );
                    })}
                </motion.div>
            </div>

            {/* Logout Button */}
            <div className="px-4 pt-6">
                <motion.button
                    className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-500 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <LogOut className="w-5 h-5" />
                    تسجيل الخروج
                </motion.button>
            </div>

            {/* Version & Admin */}
            <motion.div
                className="text-center pt-6 pb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <p className="text-sm text-slate-400 mb-4">طِبرَا الإصدار ٢.٠.٠</p>
                <Link href="/admin-dashboard" className="text-xs text-slate-300 hover:text-[#2D9B83] transition-colors flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" />
                    لوحة الإدارة
                </Link>
            </motion.div>

            {/* QR Code Modal */}
            <AnimatePresence>
                {showQRModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowQRModal(false)}
                    >
                        <motion.div
                            className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full text-center"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <QrCode className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">كود التطبيق</h3>
                            <p className="text-sm text-slate-500 mb-4">امسح الكود لمشاركة التطبيق</p>

                            {qrCodeUrl && (
                                <motion.div
                                    className="bg-white p-4 rounded-2xl inline-block mb-4 shadow-lg"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                >
                                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
                                </motion.div>
                            )}

                            <motion.button
                                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowQRModal(false)}
                            >
                                إغلاق
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

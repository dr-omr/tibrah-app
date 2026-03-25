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
import { LogOut, Shield } from 'lucide-react';
import { GuestProfile } from '@/components/profile/GuestProfile';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStatsGrid } from '@/components/profile/ProfileStatsGrid';
import { ProfileQuickActions } from '@/components/profile/ProfileQuickActions';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { ProfileSupport } from '@/components/profile/ProfileSupport';
import { QRCodeModal } from '@/components/profile/QRCodeModal';
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
        return <GuestProfile />;
    }


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            <ProfileHeader 
                user={user} 
                onShare={handleShare} 
                onQRCode={handleQRCode} 
            />
            <ProfileStatsGrid statsData={statsData} />
            <ProfileQuickActions />
            <ProfileSettings 
                notifications={notifications}
                isDarkMode={isDarkMode}
                updateSetting={updateSetting}
                toggleDarkMode={toggleDarkMode}
            />
            <ProfileSupport />

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
                <Link href="/admin-dashboard" className="text-xs text-slate-300 hover:text-primary transition-colors flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" />
                    لوحة الإدارة
                </Link>
            </motion.div>

            {/* QR Code Modal */}
            <QRCodeModal 
                show={showQRModal} 
                onClose={() => setShowQRModal(false)}
                qrCodeUrl={qrCodeUrl}
            />
        </div>
    );
}

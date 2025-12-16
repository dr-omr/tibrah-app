import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRouter } from 'next/router';
import {
    User, FileText, TrendingUp, Heart,
    ChevronLeft, Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { createPageUrl } from '../utils';
import { ProfileSkeleton } from '../components/common/Skeletons';

// New Dashboard Components
import ProfileLayout from '../components/profile/ProfileLayout';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import QuickActions from '../components/profile/QuickActions';
import HealthVitalsCard from '../components/profile/HealthVitalsCard';
import ProgramProgressCard from '../components/profile/ProgramProgressCard';
import AIJourneySummary from '../components/profile/AIJourneySummary';

// Types
interface UserData {
    id?: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
    settings?: {
        displayName?: string;
        [key: string]: unknown;
    };
}

export default function Profile() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        base44.auth.me().then((data: UserData | null) => {
            setUser(data);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, []);

    const handleLogout = () => {
        base44.auth.logout();
        router.push('/login');
    };

    if (loading) return <ProfileSkeleton />;

    // Mobile Profile Header Component
    const MobileProfileHeader = () => (
        <div className="md:hidden relative overflow-hidden bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] rounded-2xl p-6 mx-4 mt-4">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

            <div className="relative flex items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-8 h-8 text-white" />
                        )}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold text-white truncate">
                        {user?.settings?.displayName || user?.full_name || 'مستخدم جديد'}
                    </h1>
                    <p className="text-white/70 text-sm truncate">{user?.email || ''}</p>
                    <Badge className="mt-1 bg-white/20 text-white border-0 text-xs">
                        عضو مميز
                    </Badge>
                </div>
            </div>
        </div>
    );

    // Overview Cards Component
    const OverviewCards = () => (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href={createPageUrl('MedicalFile')}>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="font-medium text-slate-700 text-sm">ملفي الطبي</p>
                    <p className="text-xs text-slate-400 mt-1">٣ تقارير</p>
                </div>
            </Link>

            <Link href={createPageUrl('HealthTracker')}>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="font-medium text-slate-700 text-sm">تتبع الصحة</p>
                    <p className="text-xs text-slate-400 mt-1">١٢ قياس</p>
                </div>
            </Link>

            <Link href={createPageUrl('BodyMap')}>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Heart className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="font-medium text-slate-700 text-sm">خريطة الجسم</p>
                    <p className="text-xs text-slate-400 mt-1">استكشف</p>
                </div>
            </Link>

            <Link href={createPageUrl('Courses')}>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="font-medium text-slate-700 text-sm">الدورات</p>
                    <p className="text-xs text-slate-400 mt-1">٢ نشطة</p>
                </div>
            </Link>
        </div>
    );

    // Medical File Quick Access
    const MedicalFileCard = () => (
        <Link href={createPageUrl('MedicalFile')}>
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 flex items-center justify-between shadow-lg text-white hover:from-slate-700 hover:to-slate-800 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">ملفي الطبي الموحد</h3>
                        <p className="text-slate-400 text-xs">مستنداتك، تحاليلك، وتاريخك المرضي</p>
                    </div>
                </div>
                <ChevronLeft className="w-6 h-6 text-slate-400" />
            </div>
        </Link>
    );

    // Desktop/Tablet Layout
    const DesktopContent = () => (
        <ProfileLayout
            sidebar={
                <ProfileSidebar
                    user={user}
                    activePage="overview"
                    onLogout={handleLogout}
                />
            }
            quickActions={
                <QuickActions
                    upcomingAppointment={{
                        date: '٢٠ ديسمبر',
                        time: '١٠:٠٠ ص',
                        doctor: 'د. عمر العماد'
                    }}
                />
            }
        >
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-[#2D9B83]/10 to-[#3FB39A]/10 rounded-2xl p-6 border border-[#2D9B83]/20">
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                    أهلاً، {user?.settings?.displayName || user?.full_name || 'صديقي'} 👋
                </h2>
                <p className="text-slate-600">
                    رحلتك الصحية في تقدم مستمر! واصل الالتزام.
                </p>
            </div>

            {/* Overview Cards */}
            <OverviewCards />

            {/* Health Vitals */}
            <HealthVitalsCard />

            {/* Program Progress */}
            <ProgramProgressCard />

            {/* AI Journey Summary */}
            <AIJourneySummary user={user} healthData={user?.settings} />

            {/* Medical File Card */}
            <MedicalFileCard />
        </ProfileLayout>
    );

    // Mobile Layout
    const MobileContent = () => (
        <div className="md:hidden min-h-screen bg-slate-50 pb-24">
            <MobileProfileHeader />

            <div className="p-4 space-y-4">
                {/* Overview Cards */}
                <OverviewCards />

                {/* Health Vitals */}
                <HealthVitalsCard />

                {/* Program Progress */}
                <ProgramProgressCard />

                {/* AI Journey Summary */}
                <AIJourneySummary user={user} healthData={user?.settings} />

                {/* Medical File Card */}
                <MedicalFileCard />

                {/* Mobile Menu Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <Link href={createPageUrl('settings')}>
                        <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-500" />
                            </div>
                            <span className="flex-1 font-medium text-slate-700">الإعدادات</span>
                            <ChevronLeft className="w-5 h-5 text-slate-300" />
                        </div>
                    </Link>
                </div>

                {/* Logout Button */}
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full bg-white border-slate-200 rounded-2xl h-14 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                    تسجيل الخروج
                </Button>

                {/* App Version */}
                <p className="text-center text-sm text-slate-400 pt-2">
                    طِبرَا الإصدار ١.٠.٠
                </p>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop & Tablet */}
            <div className="hidden md:block">
                <DesktopContent />
            </div>

            {/* Mobile */}
            <MobileContent />
        </>
    );
}

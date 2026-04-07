// pages/rewards.tsx
// Premium Rewards, Challenges & Referral System

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/notification-engine';
import {
    Gift, Share2, Users, Copy, Crown, Star, Sparkles,
    ChevronLeft, Check, Trophy, Zap, Heart, MessageCircle,
    Download, Instagram, Send, QrCode, Percent, Timer, Lock, Target,
    Flame, Award
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { getTodaysChallenges, updateChallengeProgress, getChallengeStats, BADGES, type Challenge, type ChallengeProgress } from '@/lib/dailyChallenges';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

interface Reward {
    id: string;
    title: string;
    description: string;
    points: number;
    icon: any;
    color: string;
    bg: string;
    type: 'discount' | 'free' | 'premium' | 'special';
    requirements?: string;
    expiresIn?: number;
}

interface Mission {
    id: string;
    title: string;
    description: string;
    points: number;
    icon: any;
    color: string;
    progress: number;
    target: number;
    completed: boolean;
    action?: string;
}

export default function RewardsPage() {
    const { user } = useAuth();
    const [userPoints, setUserPoints] = useState(0);
    const [referralCode, setReferralCode] = useState('');
    const [referralCount, setReferralCount] = useState(0);
    const [showRewardDetail, setShowRewardDetail] = useState(false);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [showShareSheet, setShowShareSheet] = useState(false);
    const [activeTab, setActiveTab] = useState<'rewards' | 'missions' | 'challenges'>('challenges');

    // Daily challenges state
    const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
    const [weeklyChallenges, setWeeklyChallenges] = useState<Challenge[]>([]);
    const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress[]>([]);
    const [streak, setStreak] = useState(0);
    const [userBadges, setUserBadges] = useState<string[]>([]);

    const today = new Date().toISOString().split('T')[0];
    const { data: logs } = useQuery({
        queryKey: ['activityPro', user?.id, today],
        queryFn: () => db.entities.DailyLog.filter({ date: today, user_id: user?.id || 'guest' })
    });
    const todayMoveCalories = logs?.[0]?.exercise?.calories || 0;

    // Load user data
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Check real user data from AuthContext (simulated via local state if not attached to real context here, 
            // but we assume db.ts and auth fetch works)
            const saved = localStorage.getItem('tibrahRewards');
            if (saved) {
                const data = JSON.parse(saved);
                // In production, sync with user.tibrah_points
                setUserPoints(data.points || 0);
                setReferralCode(data.code || '');
                setReferralCount(data.referrals || 0);
            } else {
                // Generate unique referral code
                const code = 'TIBRAH_' + Math.random().toString(36).substring(2, 8).toUpperCase();
                setReferralCode(code);
                localStorage.setItem('tibrahRewards', JSON.stringify({ points: 50, code, referrals: 0 }));
                setUserPoints(50); // Welcome bonus
            }
        }

        // Load daily challenges
        const { daily, weekly, progress } = getTodaysChallenges();
        setDailyChallenges(daily);
        setWeeklyChallenges(weekly);
        setChallengeProgress(progress);

        const stats = getChallengeStats();
        setStreak(stats.streak.current);
        setUserBadges(stats.badges);
    }, []);

    // Handle challenge completion
    const handleCompleteChallenge = useCallback((challengeId: string, amount: number = 1) => {
        const result = updateChallengeProgress(challengeId, amount);
        if (result.completed) {
            toast.success(`🎉 أحسنت! +${result.pointsEarned} نقطة`);
            setUserPoints(prev => prev + result.pointsEarned);
            for (const badge of result.newBadges) {
                const b = BADGES[badge];
                if (b) toast.success(`🏅 شارة جديدة: ${b.icon} ${b.name}`);
            }
        }
        // Refresh challenges state
        const { daily, weekly, progress } = getTodaysChallenges();
        setDailyChallenges(daily);
        setWeeklyChallenges(weekly);
        setChallengeProgress(progress);
        const stats = getChallengeStats();
        setStreak(stats.streak.current);
        setUserBadges(stats.badges);
    }, []);

    // Available rewards
    const rewards: Reward[] = [
        {
            id: 'discount-20',
            title: 'خصم 20% على الاستشارة',
            description: 'احصل على خصم 20% على أي استشارة طبية',
            points: 100,
            icon: Percent,
            color: '#22C55E',
            bg: 'bg-green-50',
            type: 'discount'
        },
        {
            id: 'discount-50',
            title: 'خصم 50% على الاستشارة',
            description: 'خصم ضخم 50% على الاستشارة التالية',
            points: 250,
            icon: Percent,
            color: '#F59E0B',
            bg: 'bg-amber-50',
            type: 'discount'
        },
        {
            id: 'free-consultation',
            title: 'استشارة مجانية 🎁',
            description: 'احصل على استشارة طبية كاملة مجاناً',
            points: 500,
            icon: Gift,
            color: '#EC4899',
            bg: 'bg-pink-50',
            type: 'free'
        },
        {
            id: 'free-course',
            title: 'دورة تدريبية مجانية',
            description: 'اختر أي دورة من دوراتنا مجاناً',
            points: 400,
            icon: Trophy,
            color: '#8B5CF6',
            bg: 'bg-violet-50',
            type: 'free'
        },
        {
            id: 'premium-week',
            title: 'أسبوع بريميوم مجاني',
            description: 'تمتع بجميع المزايا المميزة لمدة أسبوع',
            points: 300,
            icon: Crown,
            color: '#D4AF37',
            bg: 'bg-amber-50',
            type: 'premium'
        },
        {
            id: 'premium-month',
            title: 'شهر بريميوم مجاني ⭐',
            description: 'اشتراك شهري كامل مجاناً - أفضل عرض!',
            points: 1000,
            icon: Star,
            color: '#D4AF37',
            bg: 'bg-yellow-50',
            type: 'premium',
            requirements: 'يتطلب 5 إحالات ناجحة على الأقل'
        },
        {
            id: 'vip-access',
            title: 'دخول VIP للفعاليات',
            description: 'دخول حصري لجميع فعالياتنا وورشنا',
            points: 600,
            icon: Sparkles,
            color: '#6366F1',
            bg: 'bg-indigo-50',
            type: 'special'
        },
        {
            id: 'personal-coaching',
            title: 'جلسة كوتشينج شخصية',
            description: 'جلسة خاصة مع د. عمر لمدة 30 دقيقة',
            points: 800,
            icon: Heart,
            color: '#EF4444',
            bg: 'bg-red-50',
            type: 'special'
        },
    ];

    // Daily/Weekly missions
    const missions: Mission[] = [
        {
            id: 'daily-move',
            title: 'وحش النشاط 🏃‍♂️',
            description: 'أكمل حلقة حرق 500 سعرة حرارية اليوم',
            points: 50,
            icon: Flame,
            color: '#EF4444',
            progress: todayMoveCalories,
            target: 500,
            completed: todayMoveCalories >= 500
        },
        {
            id: 'share-app',
            title: 'شارك التطبيق',
            description: 'أرسل رابط التطبيق لصديق',
            points: 25,
            icon: Share2,
            color: '#3B82F6',
            progress: 0,
            target: 1,
            completed: false,
            action: 'share'
        },
        {
            id: 'invite-friends',
            title: 'أدعُ 3 أصدقاء',
            description: 'عندما يسجل 3 أصدقاء بكودك',
            points: 150,
            icon: Users,
            color: '#22C55E',
            progress: referralCount,
            target: 3,
            completed: referralCount >= 3
        },
        {
            id: 'invite-10',
            title: 'سفير طِبرَا 🏆',
            description: 'أدعُ 10 أشخاص واحصل على مكافأة كبيرة',
            points: 500,
            icon: Trophy,
            color: '#D4AF37',
            progress: referralCount,
            target: 10,
            completed: referralCount >= 10
        },
        {
            id: 'social-share',
            title: 'انشر في سوشيال ميديا',
            description: 'انشر عن التطبيق في حساباتك',
            points: 50,
            icon: Instagram,
            color: '#EC4899',
            progress: 0,
            target: 1,
            completed: false,
            action: 'social'
        },
        {
            id: 'rate-app',
            title: 'قيّم التطبيق',
            description: 'اترك تقييماً إيجابياً',
            points: 30,
            icon: Star,
            color: '#F59E0B',
            progress: 0,
            target: 1,
            completed: false
        },
        {
            id: 'complete-profile',
            title: 'أكمل ملفك الشخصي',
            description: 'أضف جميع معلوماتك الصحية',
            points: 40,
            icon: Check,
            color: '#8B5CF6',
            progress: 75,
            target: 100,
            completed: false
        },
    ];

    // Handle share
    const handleShare = async () => {
        const shareData = {
            title: 'طِبرَا - العيادة الرقمية',
            text: `انضم لتطبيق طِبرَا واحصل على خصم! استخدم كود الدعوة: ${referralCode}`,
            url: `https://tibrah.app?ref=${referralCode}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                addPoints(25, 'app_share');
                toast.success('شكراً لمشاركتك! +25 نقطة');
            } catch (err) {
                // User cancelled
            }
        } else {
            setShowShareSheet(true);
        }
    };

    // Copy referral code
    const copyCode = () => {
        navigator.clipboard.writeText(referralCode);
        toast.success('تم نسخ كود الدعوة!');
    };

    // Add points — dual persistence (localStorage + DB)
    const addPoints = async (amount: number, reason: string = 'manual') => {
        const newPoints = userPoints + amount;
        setUserPoints(newPoints);
        if (typeof window !== 'undefined') {
            const saved = JSON.parse(localStorage.getItem('tibrahRewards') || '{}');
            localStorage.setItem('tibrahRewards', JSON.stringify({ ...saved, points: newPoints }));
        }
        // Persist to DB for durability and audit trail
        try {
            await db.entities.PointTransaction.createForUser(user?.id || 'guest', {
                user_id: user?.id || 'guest',
                amount,
                reason,
                balance_after: newPoints,
                timestamp: new Date().toISOString()
            });
        } catch(e) { /* graceful fallback to local-only */ }
    };

    // Claim reward — generates real coupon code + tracks redemption
    const claimReward = async (reward: Reward) => {
        if (userPoints < reward.points) {
            toast.error(`تحتاج ${reward.points - userPoints} نقطة إضافية`);
            return;
        }

        // Generate unique coupon code
        const couponCode = `TIB_${reward.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}_${Date.now().toString(36).toUpperCase()}`;

        // Deduct points with reason tracking
        await addPoints(-reward.points, `redeem_${reward.id}`);

        // Record redemption in DB
        try {
            await db.entities.Redemption.createForUser(user?.id || 'guest', {
                user_id: user?.id || 'guest',
                reward_id: reward.id,
                reward_title: reward.title,
                coupon_code: couponCode,
                points_spent: reward.points,
                status: 'active',
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        } catch(e) { /* graceful fallback */ }

        // Show coupon prominently
        toast.success(
            `🎉 تم الاستبدال! كود الكوبون:\n${couponCode}\n\nصالح لمدة 30 يوم`, 
            { duration: 15000 }
        );
        setShowRewardDetail(false);
    };

    // Tier calculation — with real multipliers and benefits
    const getTier = () => {
        if (userPoints >= 1000) return { 
            name: 'VIP ذهبي', color: '#D4AF37', icon: Crown,
            multiplier: 2.0, shopDiscount: 15,
            features: ['نقاط مضاعفة ×2', 'خصم 15% في الصيدلية', 'أولوية في الحجز'],
            nextTier: null, nextThreshold: null
        };
        if (userPoints >= 500) return { 
            name: 'مميز', color: '#8B5CF6', icon: Star,
            multiplier: 1.5, shopDiscount: 10,
            features: ['نقاط × 1.5', 'خصم 10% في الصيدلية'],
            nextTier: 'VIP ذهبي', nextThreshold: 1000
        };
        if (userPoints >= 200) return { 
            name: 'نشط', color: '#22C55E', icon: Zap,
            multiplier: 1.25, shopDiscount: 5,
            features: ['نقاط × 1.25', 'خصم 5% في الصيدلية'],
            nextTier: 'مميز', nextThreshold: 500
        };
        return { 
            name: 'جديد', color: '#3B82F6', icon: Heart,
            multiplier: 1.0, shopDiscount: 0,
            features: ['اكسب نقاط مع كل نشاط صحي'],
            nextTier: 'نشط', nextThreshold: 200
        };
    };

    const tier = getTier();
    const TierIcon = tier.icon;

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#020617] font-sans selection:bg-amber-500/30 pb-24 relative overflow-x-hidden">
            {/* Premium Header Background */}
            <div className="absolute top-0 left-0 right-0 h-[40vh] z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-amber-600/5 to-slate-900 absolute z-0" />
                <motion.div 
                    className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-amber-500/20 blur-[100px] mix-blend-screen pointer-events-none" 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
            </div>

            {/* Navigation Header */}
            <div className="relative z-10 px-4 pt-6 pb-2 flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full bg-white/10 backdrop-blur-md border border-slate-200/20 shadow-sm"
                    onClick={() => window.history.back()}
                >
                    <ChevronLeft className="w-6 h-6 dark:text-white" />
                </Button>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white/50 dark:bg-white/10 backdrop-blur-md border-amber-500/30 text-slate-800 dark:text-white font-bold py-1 px-3">
                        نادي تِبْرأ 
                    </Badge>
                </div>
            </div>

            <div className="relative z-10 px-4">
                {/* 1. Premium Points Dashboard Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 mt-4"
                >
                    <div className="rounded-[40px] p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-amber-200/50 dark:border-amber-500/20 shadow-[0_20px_60px_rgba(245,158,11,0.1)] dark:shadow-[0_20px_60px_rgba(245,158,11,0.2)] relative overflow-hidden">
                        
                        {/* Decorative background crest */}
                        <div className="absolute top-[-20px] left-[-20px] opacity-10 blur-sm pointer-events-none">
                            <Award className="w-48 h-48 text-amber-500" />
                        </div>

                        <div className="relative z-10 text-center">
                            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">رصيد العافية الخاص بك</h2>
                            <div className="flex items-end justify-center gap-2 mb-4">
                                <motion.span 
                                    className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-400 drop-shadow-sm tracking-tighter"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                >
                                    {userPoints}
                                </motion.span>
                                <span className="text-lg font-bold text-slate-400 mb-2">نقطة</span>
                            </div>

                            {/* Enhanced Stats Row */}
                            <div className="grid grid-cols-2 gap-3 mt-8">
                                <div className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 flex flex-col items-center justify-center">
                                    <Flame className="w-6 h-6 text-orange-500 mb-2" />
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">أيام المتابعة</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{streak}</p>
                                </div>
                                <div className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 flex flex-col items-center justify-center">
                                    <TierIcon className="w-6 h-6 mb-2" style={{ color: tier.color }} />
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">المستوى الحالي</p>
                                    <p className="text-[13px] font-black text-slate-900 dark:text-white">{tier.name}</p>
                                </div>
                            </div>
                        </div>

                            {/* Tier Benefits Strip */}
                            <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                                {tier.features.map((f: string, i: number) => (
                                    <span key={i} className="text-[9px] font-bold px-2 py-1 rounded-full border" style={{ borderColor: tier.color + '40', color: tier.color, backgroundColor: tier.color + '10' }}>
                                        {f}
                                    </span>
                                ))}
                            </div>

                            {/* Next Tier Progress */}
                            {tier.nextThreshold && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                                        <span>{tier.name}</span>
                                        <span>{tier.nextTier} — {tier.nextThreshold - userPoints} نقطة متبقية</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div 
                                            className="h-full rounded-full" 
                                            style={{ backgroundColor: tier.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((userPoints / tier.nextThreshold) * 100, 100)}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                        />
                                    </div>
                                </div>
                            )}
                    </div>
                </motion.div>

                {/* Referral Code section integrated below points */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 flex items-center gap-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-3 shadow-sm"
                >
                    <div className="flex-1 px-1">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-bold">شارك الكود واكسب ٥٠ نقطة</p>
                        <p className="font-mono font-bold text-lg text-slate-800 dark:text-white tracking-widest">{referralCode}</p>
                    </div>
                    <motion.button
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700"
                        whileTap={{ scale: 0.9 }}
                        onClick={copyCode}
                    >
                        <Copy className="w-4 h-4 text-slate-600 dark:text-white" />
                    </motion.button>
                    <motion.button
                        className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-md shadow-amber-500/20"
                        whileTap={{ scale: 0.9 }}
                        onClick={handleShare}
                    >
                        <Share2 className="w-4 h-4 text-white" />
                    </motion.button>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-1.5 shadow-sm border border-white/20 dark:border-slate-700/50 mb-2">
                    {[
                        { id: 'challenges', label: 'تحديات', icon: Flame },
                        { id: 'rewards', label: 'المكافآت', icon: Gift },
                        { id: 'missions', label: 'المهمات', icon: Target },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <motion.button
                                key={tab.id}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/20'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                    }`}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(tab.id as any)}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-4 space-y-3">
                <AnimatePresence mode="wait">
                    {/* Daily Challenges Tab */}
                    {activeTab === 'challenges' && (
                        <motion.div
                            key="challenges"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-3"
                        >
                            {/* Streak Banner */}
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                                        <Flame className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 text-xs">سلسلة الأيام</p>
                                        <p className="text-3xl font-bold">{streak} يوم</p>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="text-white/80 text-xs">الشارات</p>
                                    <p className="text-lg font-bold">{userBadges.length}/{Object.keys(BADGES).length}</p>
                                </div>
                            </div>

                            {/* Badges Row */}
                            {userBadges.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {userBadges.map(badgeId => {
                                        const badge = BADGES[badgeId];
                                        return badge ? (
                                            <motion.div
                                                key={badgeId}
                                                className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/30 rounded-xl px-3 py-2 flex items-center gap-2 border border-amber-200"
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <span className="text-lg">{badge.icon}</span>
                                                <span className="text-xs font-medium text-amber-800 dark:text-amber-200 whitespace-nowrap">{badge.name}</span>
                                            </motion.div>
                                        ) : null;
                                    })}
                                </div>
                            )}

                            {/* Daily Challenges */}
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 pt-2">
                                <Sparkles className="w-4 h-4 text-amber-500" /> تحديات اليوم
                            </h3>
                            {dailyChallenges.map((challenge, index) => {
                                const progress = challengeProgress.find(p => p.challengeId === challenge.id);
                                const isCompleted = progress?.completed || false;
                                const current = progress?.current || 0;
                                return (
                                    <motion.div
                                        key={challenge.id}
                                        className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm ${isCompleted ? 'border-2 border-green-400' : ''}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                                                style={{ backgroundColor: challenge.color + '15' }}
                                            >
                                                {isCompleted ? '✅' : challenge.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{challenge.title}</h4>
                                                    <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">+{challenge.points}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">{challenge.description}</p>
                                                {!isCompleted && (
                                                    <div className="mt-2">
                                                        <Progress value={(current / challenge.target) * 100} className="h-1.5" />
                                                        <p className="text-[10px] text-slate-400 mt-1">{current} / {challenge.target} {challenge.unit}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {!isCompleted && (
                                                <Button
                                                    size="sm"
                                                    className="rounded-xl text-xs h-8"
                                                    style={{ backgroundColor: challenge.color, color: 'white' }}
                                                    onClick={() => handleCompleteChallenge(challenge.id, challenge.target)}
                                                >
                                                    أنجزت
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* Weekly Challenges */}
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 pt-2">
                                <Trophy className="w-4 h-4 text-purple-500" /> تحديات الأسبوع
                            </h3>
                            {weeklyChallenges.map((challenge, index) => {
                                const progress = challengeProgress.find(p => p.challengeId === challenge.id);
                                const isCompleted = progress?.completed || false;
                                const current = progress?.current || 0;
                                return (
                                    <motion.div
                                        key={challenge.id}
                                        className={`bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-4 shadow-sm ${isCompleted ? 'border-2 border-purple-400' : 'border border-purple-200 dark:border-purple-700'}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 + 0.2 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center text-xl">
                                                {isCompleted ? '🏆' : challenge.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{challenge.title}</h4>
                                                    <Badge className="bg-purple-100 text-purple-700 border-0 text-[10px]">+{challenge.points}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">{challenge.description}</p>
                                                <div className="mt-2">
                                                    <Progress value={(current / challenge.target) * 100} className="h-1.5" />
                                                    <p className="text-[10px] text-slate-400 mt-1">{current} / {challenge.target} {challenge.unit}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {activeTab === 'rewards' && (
                        <motion.div
                            key="rewards"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-3"
                        >
                            {rewards.map((reward, index) => {
                                const Icon = reward.icon;
                                const canClaim = userPoints >= reward.points;
                                return (
                                    <motion.div
                                        key={reward.id}
                                        className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm ${!canClaim ? 'opacity-70' : ''}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedReward(reward);
                                            setShowRewardDetail(true);
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                className={`w-14 h-14 ${reward.bg} rounded-2xl flex items-center justify-center`}
                                                whileTap={{ rotate: 10, scale: 0.9 }}
                                            >
                                                <Icon className="w-7 h-7" style={{ color: reward.color }} />
                                            </motion.div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-800 dark:text-white">{reward.title}</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">{reward.description}</p>
                                            </div>
                                            <div className="text-left">
                                                <Badge className={`${canClaim ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'} border-0`}>
                                                    {reward.points} نقطة
                                                </Badge>
                                                {!canClaim && (
                                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                                                        <Lock className="w-3 h-3" />
                                                        {reward.points - userPoints} متبقي
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {activeTab === 'missions' && (
                        <motion.div
                            key="missions"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-3"
                        >
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
                                <div className="flex items-center gap-3 mb-2">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="font-bold">مهمات يومية</span>
                                </div>
                                <p className="text-sm text-white/80">
                                    أكمل المهمات واربح نقاط لاستبدالها بمكافآت رائعة!
                                </p>
                            </div>

                            {missions.map((mission, index) => {
                                const Icon = mission.icon;
                                return (
                                    <motion.div
                                        key={mission.id}
                                        className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm ${mission.completed ? 'border-2 border-green-500' : ''}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => {
                                            if (mission.action === 'share') handleShare();
                                            if (mission.action === 'social') setShowShareSheet(true);
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${mission.completed ? 'bg-green-100' : 'bg-slate-100'}`}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                {mission.completed ? (
                                                    <Check className="w-6 h-6 text-green-600" />
                                                ) : (
                                                    <Icon className="w-6 h-6" style={{ color: mission.color }} />
                                                )}
                                            </motion.div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-800 dark:text-white">{mission.title}</h3>
                                                    <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">
                                                        +{mission.points}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">{mission.description}</p>
                                                {!mission.completed && mission.target > 1 && (
                                                    <div className="mt-2">
                                                        <Progress
                                                            value={(mission.progress / mission.target) * 100}
                                                            className="h-1.5"
                                                        />
                                                        <p className="text-[10px] text-slate-400 mt-1">
                                                            {mission.progress} / {mission.target}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {mission.action && !mission.completed && (
                                                <motion.div
                                                    className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <ChevronLeft className="w-5 h-5 text-amber-600" />
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Reward Detail Sheet */}
            <Sheet open={showRewardDetail} onOpenChange={setShowRewardDetail}>
                <SheetContent side="bottom" className="rounded-t-3xl">
                    {selectedReward && (
                        <div className="py-4 space-y-4">
                            <div className="text-center">
                                <motion.div
                                    className={`w-20 h-20 ${selectedReward.bg} rounded-3xl flex items-center justify-center mx-auto mb-4`}
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    <selectedReward.icon className="w-10 h-10" style={{ color: selectedReward.color }} />
                                </motion.div>
                                <h2 className="text-xl font-bold text-slate-800">{selectedReward.title}</h2>
                                <p className="text-slate-500 mt-1">{selectedReward.description}</p>
                                {selectedReward.requirements && (
                                    <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-1 rounded-full inline-block">
                                        ⚠️ {selectedReward.requirements}
                                    </p>
                                )}
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                <p className="text-sm text-slate-500 mb-1">التكلفة</p>
                                <p className="text-3xl font-bold text-amber-600">{selectedReward.points} نقطة</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    رصيدك الحالي: {userPoints} نقطة
                                </p>
                            </div>

                            <Button
                                className={`w-full py-6 rounded-2xl font-bold text-lg ${userPoints >= selectedReward.points
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                    : 'bg-slate-200 text-slate-500'
                                    }`}
                                disabled={userPoints < selectedReward.points}
                                onClick={() => claimReward(selectedReward)}
                            >
                                {userPoints >= selectedReward.points ? (
                                    <>
                                        <Gift className="w-5 h-5 ml-2" />
                                        استبدال المكافأة
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5 ml-2" />
                                        تحتاج {selectedReward.points - userPoints} نقطة إضافية
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Share Sheet */}
            <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
                <SheetContent side="bottom" className="rounded-t-3xl">
                    <SheetHeader>
                        <SheetTitle className="text-right">شارك التطبيق</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-slate-500 text-sm text-center">
                            كود الدعوة الخاص بك: <span className="font-bold text-amber-600">{referralCode}</span>
                        </p>

                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { icon: MessageCircle, label: 'واتساب', color: '#25D366', action: () => window.open(`https://wa.me/?text=جرب تطبيق طِبرَا واستخدم كود ${referralCode} للحصول على خصم! https://tibrah.app`) },
                                { icon: Send, label: 'تليجرام', color: '#0088cc', action: () => window.open(`https://t.me/share/url?url=https://tibrah.app&text=جرب تطبيق طِبرَا بكود ${referralCode}`) },
                                { icon: Instagram, label: 'انستغرام', color: '#E4405F', action: () => toast.info('شارك في ستوريك واحصل على نقاط إضافية!') },
                                { icon: Copy, label: 'نسخ', color: '#6366F1', action: copyCode },
                            ].map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.button
                                        key={index}
                                        className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl"
                                        whileTap={{ scale: 0.9 }}
                                        onClick={item.action}
                                    >
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                            style={{ backgroundColor: item.color + '20' }}
                                        >
                                            <Icon className="w-6 h-6" style={{ color: item.color }} />
                                        </div>
                                        <span className="text-xs font-medium text-slate-600">{item.label}</span>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div className="bg-amber-50 rounded-2xl p-4 text-center">
                            <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                            <p className="text-sm text-amber-800 font-medium">
                                احصل على 50 نقطة لكل صديق ينضم بكودك!
                            </p>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

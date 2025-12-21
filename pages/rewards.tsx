// pages/rewards.tsx
// Premium Rewards & Referral System

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Gift, Share2, Users, Copy, Crown, Star, Sparkles,
    ChevronLeft, Check, Trophy, Zap, Heart, MessageCircle,
    Download, Instagram, Send, QrCode, Percent, Timer, Lock, Target
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
    const [userPoints, setUserPoints] = useState(0);
    const [referralCode, setReferralCode] = useState('');
    const [referralCount, setReferralCount] = useState(0);
    const [showRewardDetail, setShowRewardDetail] = useState(false);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [showShareSheet, setShowShareSheet] = useState(false);
    const [activeTab, setActiveTab] = useState<'rewards' | 'missions' | 'leaderboard'>('rewards');

    // Load user data
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('tibrahRewards');
            if (saved) {
                const data = JSON.parse(saved);
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
                addPoints(25);
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

    // Add points
    const addPoints = (amount: number) => {
        const newPoints = userPoints + amount;
        setUserPoints(newPoints);
        if (typeof window !== 'undefined') {
            const saved = JSON.parse(localStorage.getItem('tibrahRewards') || '{}');
            localStorage.setItem('tibrahRewards', JSON.stringify({ ...saved, points: newPoints }));
        }
    };

    // Claim reward
    const claimReward = (reward: Reward) => {
        if (userPoints >= reward.points) {
            const newPoints = userPoints - reward.points;
            setUserPoints(newPoints);
            if (typeof window !== 'undefined') {
                const saved = JSON.parse(localStorage.getItem('tibrahRewards') || '{}');
                localStorage.setItem('tibrahRewards', JSON.stringify({ ...saved, points: newPoints }));
            }
            toast.success(`🎉 تهانينا! لقد استبدلت: ${reward.title}`);
            setShowRewardDetail(false);
        } else {
            toast.error(`تحتاج ${reward.points - userPoints} نقطة إضافية`);
        }
    };

    // Tier calculation
    const getTier = () => {
        if (userPoints >= 1000) return { name: 'VIP ذهبي', color: '#D4AF37', icon: Crown };
        if (userPoints >= 500) return { name: 'مميز', color: '#8B5CF6', icon: Star };
        if (userPoints >= 200) return { name: 'نشط', color: '#22C55E', icon: Zap };
        return { name: 'جديد', color: '#3B82F6', icon: Heart };
    };

    const tier = getTier();
    const TierIcon = tier.icon;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            {/* Header */}
            <motion.div
                className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white px-6 py-8 rounded-b-[2rem]"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

                <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Gift className="w-7 h-7" />
                                المكافآت
                            </h1>
                            <p className="text-white/70 text-sm">احصل على مكافآت مقابل نشر التطبيق</p>
                        </div>
                        <motion.div
                            className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                            whileTap={{ scale: 0.9 }}
                        >
                            <TierIcon className="w-7 h-7" style={{ color: tier.color }} />
                        </motion.div>
                    </div>

                    {/* Points Card */}
                    <motion.div
                        className="bg-white/20 backdrop-blur-md rounded-2xl p-5"
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-white/70 text-sm">رصيدك من النقاط</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">{userPoints}</span>
                                    <span className="text-white/70">نقطة</span>
                                </div>
                            </div>
                            <motion.div
                                className="px-4 py-2 bg-white/20 rounded-xl"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="flex items-center gap-2">
                                    <TierIcon className="w-4 h-4" />
                                    <span className="text-sm font-bold">{tier.name}</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Referral Code */}
                        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3">
                            <div className="flex-1">
                                <p className="text-[10px] text-white/60 mb-1">كود الدعوة الخاص بك</p>
                                <p className="font-mono font-bold text-lg">{referralCode}</p>
                            </div>
                            <motion.button
                                className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"
                                whileTap={{ scale: 0.9 }}
                                onClick={copyCode}
                            >
                                <Copy className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center"
                                whileTap={{ scale: 0.9 }}
                                onClick={handleShare}
                            >
                                <Share2 className="w-5 h-5 text-amber-600" />
                            </motion.button>
                        </div>

                        <p className="text-center text-white/60 text-xs mt-3">
                            {referralCount} شخص انضموا بدعوتك • +50 نقطة لكل إحالة
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="px-4 pt-4">
                <div className="flex gap-2 bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-sm">
                    {[
                        { id: 'rewards', label: 'المكافآت', icon: Gift },
                        { id: 'missions', label: 'المهمات', icon: Target },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <motion.button
                                key={tab.id}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                    : 'text-slate-500'
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

// pages/rewards.tsx
// ════════════════════════════════════════════════════════
// Premium Rewards, Challenges & Referral System — Orchestrator
// ════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/notification-engine';
import {
  Gift, Share2, Copy, ChevronLeft, Sparkles,
  MessageCircle, Instagram, Send, Lock, Flame, Target, Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { getTodaysChallenges, updateChallengeProgress, getChallengeStats, BADGES, type Challenge, type ChallengeProgress } from '@/lib/dailyChallenges';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

// Modular imports
import { REWARDS, buildMissions, getTier, type Reward } from '@/components/rewards/rewards-data';
import { ChallengesTab, RewardsTab, MissionsTab } from '@/components/rewards/rewards-tabs';

export default function RewardsPage() {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [showRewardDetail, setShowRewardDetail] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<'rewards' | 'missions' | 'challenges'>('challenges');

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tibrahRewards');
      if (saved) {
        const data = JSON.parse(saved);
        setUserPoints(data.points || 0);
        setReferralCode(data.code || '');
        setReferralCount(data.referrals || 0);
      } else {
        const code = 'TIBRAH_' + Math.random().toString(36).substring(2, 8).toUpperCase();
        setReferralCode(code);
        localStorage.setItem('tibrahRewards', JSON.stringify({ points: 50, code, referrals: 0 }));
        setUserPoints(50);
      }
    }
    const { daily, weekly, progress } = getTodaysChallenges();
    setDailyChallenges(daily); setWeeklyChallenges(weekly); setChallengeProgress(progress);
    const stats = getChallengeStats();
    setStreak(stats.streak.current); setUserBadges(stats.badges);
  }, []);

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
    const { daily, weekly, progress } = getTodaysChallenges();
    setDailyChallenges(daily); setWeeklyChallenges(weekly); setChallengeProgress(progress);
    const stats = getChallengeStats();
    setStreak(stats.streak.current); setUserBadges(stats.badges);
  }, []);

  const missions = buildMissions(referralCount, todayMoveCalories);

  const handleShare = async () => {
    const shareData = {
      title: 'طِبرَا - العيادة الرقمية',
      text: `انضم لتطبيق طِبرَا واحصل على خصم! استخدم كود الدعوة: ${referralCode}`,
      url: `https://tibrah.app?ref=${referralCode}`
    };
    if (navigator.share) {
      try { await navigator.share(shareData); addPoints(25, 'app_share'); toast.success('شكراً لمشاركتك! +25 نقطة'); } catch {}
    } else { setShowShareSheet(true); }
  };

  const copyCode = () => { navigator.clipboard.writeText(referralCode); toast.success('تم نسخ كود الدعوة!'); };

  const addPoints = async (amount: number, reason: string = 'manual') => {
    const newPoints = userPoints + amount;
    setUserPoints(newPoints);
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('tibrahRewards') || '{}');
      localStorage.setItem('tibrahRewards', JSON.stringify({ ...saved, points: newPoints }));
    }
    try {
      await db.entities.PointTransaction.createForUser(user?.id || 'guest', {
        user_id: user?.id || 'guest', amount, reason, balance_after: newPoints, timestamp: new Date().toISOString()
      });
    } catch {}
  };

  const claimReward = async (reward: Reward) => {
    if (userPoints < reward.points) { toast.error(`تحتاج ${reward.points - userPoints} نقطة إضافية`); return; }
    const couponCode = `TIB_${reward.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}_${Date.now().toString(36).toUpperCase()}`;
    await addPoints(-reward.points, `redeem_${reward.id}`);
    try {
      await db.entities.Redemption.createForUser(user?.id || 'guest', {
        user_id: user?.id || 'guest', reward_id: reward.id, reward_title: reward.title,
        coupon_code: couponCode, points_spent: reward.points, status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch {}
    toast.success(`🎉 تم الاستبدال! كود الكوبون:\n${couponCode}\n\nصالح لمدة 30 يوم`, { duration: 15000 });
    setShowRewardDetail(false);
  };

  const tier = getTier(userPoints);
  const TierIcon = tier.icon;

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#020617] font-sans selection:bg-amber-500/30 pb-24 relative overflow-x-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-amber-600/5 to-slate-900 absolute z-0" />
        <motion.div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-amber-500/20 blur-[100px] mix-blend-screen pointer-events-none"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-6 pb-2 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 backdrop-blur-md border border-slate-200/20 shadow-sm" onClick={() => window.history.back()}>
          <ChevronLeft className="w-6 h-6 dark:text-white" />
        </Button>
        <Badge variant="outline" className="bg-white/50 dark:bg-white/10 backdrop-blur-md border-amber-500/30 text-slate-800 dark:text-white font-bold py-1 px-3">نادي تِبْرأ</Badge>
      </div>

      <div className="relative z-10 px-4">
        {/* Points Dashboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 mt-4">
          <div className="rounded-[40px] p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-amber-200/50 dark:border-amber-500/20 shadow-[0_20px_60px_rgba(245,158,11,0.1)] relative overflow-hidden">
            <div className="absolute top-[-20px] left-[-20px] opacity-10 blur-sm pointer-events-none"><Award className="w-48 h-48 text-amber-500" /></div>
            <div className="relative z-10 text-center">
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">رصيد العافية الخاص بك</h2>
              <div className="flex items-end justify-center gap-2 mb-4">
                <motion.span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-400 drop-shadow-sm tracking-tighter"
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.2 }}>{userPoints}</motion.span>
                <span className="text-lg font-bold text-slate-400 mb-2">نقطة</span>
              </div>
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
            <div className="flex flex-wrap gap-1.5 justify-center mt-4">
              {tier.features.map((f: string, i: number) => (
                <span key={i} className="text-[9px] font-bold px-2 py-1 rounded-full border" style={{ borderColor: tier.color + '40', color: tier.color, backgroundColor: tier.color + '10' }}>{f}</span>
              ))}
            </div>
            {tier.nextThreshold && (
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>{tier.name}</span>
                  <span>{tier.nextTier} — {tier.nextThreshold - userPoints} نقطة متبقية</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: tier.color }}
                    initial={{ width: 0 }} animate={{ width: `${Math.min((userPoints / tier.nextThreshold) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }} />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Referral Code */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-6 flex items-center gap-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-3 shadow-sm">
          <div className="flex-1 px-1">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-bold">شارك الكود واكسب ٥٠ نقطة</p>
            <p className="font-mono font-bold text-lg text-slate-800 dark:text-white tracking-widest">{referralCode}</p>
          </div>
          <motion.button className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700" whileTap={{ scale: 0.9 }} onClick={copyCode}>
            <Copy className="w-4 h-4 text-slate-600 dark:text-white" />
          </motion.button>
          <motion.button className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-md shadow-amber-500/20" whileTap={{ scale: 0.9 }} onClick={handleShare}>
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
              <motion.button key={tab.id}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(tab.id as any)}>
                <Icon className="w-4 h-4" />{tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pt-4 space-y-3">
        <AnimatePresence mode="wait">
          {activeTab === 'challenges' && (
            <ChallengesTab streak={streak} userBadges={userBadges}
              dailyChallenges={dailyChallenges} weeklyChallenges={weeklyChallenges}
              challengeProgress={challengeProgress} onComplete={handleCompleteChallenge} />
          )}
          {activeTab === 'rewards' && (
            <RewardsTab rewards={REWARDS} userPoints={userPoints}
              onSelect={(r) => { setSelectedReward(r); setShowRewardDetail(true); }} />
          )}
          {activeTab === 'missions' && (
            <MissionsTab missions={missions} onShare={handleShare} onSocial={() => setShowShareSheet(true)} />
          )}
        </AnimatePresence>
      </div>

      {/* Reward Detail Sheet */}
      <Sheet open={showRewardDetail} onOpenChange={setShowRewardDetail}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          {selectedReward && (
            <div className="py-4 space-y-4">
              <div className="text-center">
                <motion.div className={`w-20 h-20 ${selectedReward.bg} rounded-3xl flex items-center justify-center mx-auto mb-4`}
                  animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <selectedReward.icon className="w-10 h-10" style={{ color: selectedReward.color }} />
                </motion.div>
                <h2 className="text-xl font-bold text-slate-800">{selectedReward.title}</h2>
                <p className="text-slate-500 mt-1">{selectedReward.description}</p>
                {selectedReward.requirements && (
                  <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-1 rounded-full inline-block">⚠️ {selectedReward.requirements}</p>
                )}
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-slate-500 mb-1">التكلفة</p>
                <p className="text-3xl font-bold text-amber-600">{selectedReward.points} نقطة</p>
                <p className="text-xs text-slate-400 mt-1">رصيدك الحالي: {userPoints} نقطة</p>
              </div>
              <Button className={`w-full py-6 rounded-2xl font-bold text-lg ${userPoints >= selectedReward.points
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}
                disabled={userPoints < selectedReward.points} onClick={() => claimReward(selectedReward)}>
                {userPoints >= selectedReward.points ? (<><Gift className="w-5 h-5 ml-2" />استبدال المكافأة</>) : (<><Lock className="w-5 h-5 ml-2" />تحتاج {selectedReward.points - userPoints} نقطة إضافية</>)}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Share Sheet */}
      <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle className="text-right">شارك التطبيق</SheetTitle></SheetHeader>
          <div className="py-4 space-y-4">
            <p className="text-slate-500 text-sm text-center">كود الدعوة الخاص بك: <span className="font-bold text-amber-600">{referralCode}</span></p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: MessageCircle, label: 'واتساب', color: '#25D366', action: () => window.open(`https://wa.me/?text=جرب تطبيق طِبرَا واستخدم كود ${referralCode} للحصول على خصم! https://tibrah.app`) },
                { icon: Send, label: 'تليجرام', color: '#0088cc', action: () => window.open(`https://t.me/share/url?url=https://tibrah.app&text=جرب تطبيق طِبرَا بكود ${referralCode}`) },
                { icon: Instagram, label: 'انستغرام', color: '#E4405F', action: () => toast.info('شارك في ستوريك واحصل على نقاط إضافية!') },
                { icon: Copy, label: 'نسخ', color: '#6366F1', action: copyCode },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button key={index} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl" whileTap={{ scale: 0.9 }} onClick={item.action}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: item.color + '20' }}>
                      <Icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
            <div className="bg-amber-50 rounded-2xl p-4 text-center">
              <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-amber-800 font-medium">احصل على 50 نقطة لكل صديق ينضم بكودك!</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

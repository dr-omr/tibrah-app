// components/rewards/rewards-tabs.tsx
// ════════════════════════════════════════════════════════
// Tab content components for Rewards page
// ════════════════════════════════════════════════════════

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Trophy, Flame, Check, ChevronLeft, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BADGES, type Challenge, type ChallengeProgress } from '@/lib/dailyChallenges';
import type { Reward, Mission } from './rewards-data';

/* ─── ChallengesTab ──────────────────────────── */
export function ChallengesTab({
  streak, userBadges, dailyChallenges, weeklyChallenges, challengeProgress, onComplete,
}: {
  streak: number;
  userBadges: string[];
  dailyChallenges: Challenge[];
  weeklyChallenges: Challenge[];
  challengeProgress: ChallengeProgress[];
  onComplete: (id: string, amount: number) => void;
}) {
  return (
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
              <motion.div key={badgeId}
                className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/30 rounded-xl px-3 py-2 flex items-center gap-2 border border-amber-200"
                whileTap={{ scale: 0.95 }}>
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
        const prog = challengeProgress.find(p => p.challengeId === challenge.id);
        const isCompleted = prog?.completed || false;
        const current = prog?.current || 0;
        return (
          <motion.div key={challenge.id}
            className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm ${isCompleted ? 'border-2 border-green-400' : ''}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                style={{ backgroundColor: challenge.color + '15' }}>
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
                <Button size="sm" className="rounded-xl text-xs h-8"
                  style={{ backgroundColor: challenge.color, color: 'white' }}
                  onClick={() => onComplete(challenge.id, challenge.target)}>
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
        const prog = challengeProgress.find(p => p.challengeId === challenge.id);
        const isCompleted = prog?.completed || false;
        const current = prog?.current || 0;
        return (
          <motion.div key={challenge.id}
            className={`bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-4 shadow-sm ${isCompleted ? 'border-2 border-purple-400' : 'border border-purple-200 dark:border-purple-700'}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.2 }}>
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
  );
}

/* ─── RewardsTab ─────────────────────────────── */
export function RewardsTab({
  rewards, userPoints, onSelect,
}: {
  rewards: Reward[];
  userPoints: number;
  onSelect: (r: Reward) => void;
}) {
  return (
    <motion.div key="rewards" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
      {rewards.map((reward, index) => {
        const Icon = reward.icon;
        const canClaim = userPoints >= reward.points;
        return (
          <motion.div key={reward.id}
            className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm ${!canClaim ? 'opacity-70' : ''}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(reward)}>
            <div className="flex items-center gap-4">
              <motion.div className={`w-14 h-14 ${reward.bg} rounded-2xl flex items-center justify-center`}
                whileTap={{ rotate: 10, scale: 0.9 }}>
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
                    <Lock className="w-3 h-3" />{reward.points - userPoints} متبقي
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ─── MissionsTab ────────────────────────────── */
export function MissionsTab({
  missions, onShare, onSocial,
}: {
  missions: Mission[];
  onShare: () => void;
  onSocial: () => void;
}) {
  return (
    <motion.div key="missions" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold">مهمات يومية</span>
        </div>
        <p className="text-sm text-white/80">أكمل المهمات واربح نقاط لاستبدالها بمكافآت رائعة!</p>
      </div>

      {missions.map((mission, index) => {
        const Icon = mission.icon;
        return (
          <motion.div key={mission.id}
            className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm ${mission.completed ? 'border-2 border-green-500' : ''}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              if (mission.action === 'share') onShare();
              if (mission.action === 'social') onSocial();
            }}>
            <div className="flex items-center gap-4">
              <motion.div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${mission.completed ? 'bg-green-100' : 'bg-slate-100'}`}
                whileTap={{ scale: 0.9 }}>
                {mission.completed ? <Check className="w-6 h-6 text-green-600" /> : <Icon className="w-6 h-6" style={{ color: mission.color }} />}
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-white">{mission.title}</h3>
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">+{mission.points}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{mission.description}</p>
                {!mission.completed && mission.target > 1 && (
                  <div className="mt-2">
                    <Progress value={(mission.progress / mission.target) * 100} className="h-1.5" />
                    <p className="text-[10px] text-slate-400 mt-1">{mission.progress} / {mission.target}</p>
                  </div>
                )}
              </div>
              {mission.action && !mission.completed && (
                <motion.div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                  <ChevronLeft className="w-5 h-5 text-amber-600" />
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

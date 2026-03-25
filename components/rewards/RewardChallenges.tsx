import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BADGES, type Challenge, type ChallengeProgress } from '@/lib/dailyChallenges';

interface RewardChallengesProps {
    streak: number;
    userBadges: string[];
    dailyChallenges: Challenge[];
    weeklyChallenges: Challenge[];
    challengeProgress: ChallengeProgress[];
    handleCompleteChallenge: (challengeId: string, amount: number) => void;
}

export const RewardChallenges: React.FC<RewardChallengesProps> = ({
    streak,
    userBadges,
    dailyChallenges,
    weeklyChallenges,
    challengeProgress,
    handleCompleteChallenge
}) => {
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
                                    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">+{challenge.points}</Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">{challenge.description}</p>
                                {!isCompleted && (
                                    <div className="mt-2">
                                        <Progress value={(current / challenge.target) * 100} className="h-1.5" />
                                        <p className="text-xs text-slate-400 mt-1">{current} / {challenge.target} {challenge.unit}</p>
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
                                    <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">+{challenge.points}</Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">{challenge.description}</p>
                                <div className="mt-2">
                                    <Progress value={(current / challenge.target) * 100} className="h-1.5" />
                                    <p className="text-xs text-slate-400 mt-1">{current} / {challenge.target} {challenge.unit}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

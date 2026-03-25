import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Reward {
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

interface RewardItemsProps {
    rewards: Reward[];
    userPoints: number;
    onSelectReward: (reward: Reward) => void;
}

export const RewardItems: React.FC<RewardItemsProps> = ({ rewards, userPoints, onSelectReward }) => {
    return (
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
                        onClick={() => onSelectReward(reward)}
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
                                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
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
    );
};

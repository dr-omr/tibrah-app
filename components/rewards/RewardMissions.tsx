import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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

interface RewardMissionsProps {
    missions: Mission[];
    handleShare: () => void;
    setShowShareSheet: (show: boolean) => void;
}

export const RewardMissions: React.FC<RewardMissionsProps> = ({ missions, handleShare, setShowShareSheet }) => {
    return (
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
                                    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
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
                                        <p className="text-xs text-slate-400 mt-1">
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
    );
};

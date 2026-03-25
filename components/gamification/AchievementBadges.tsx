import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Star, Target, Droplets, Moon, Zap, ShieldCheck } from 'lucide-react';

const BADGES = [
    { id: 'streak_3', title: 'شعلة البداية', desc: 'التزام 3 أيام متتالية بالروتين', icon: Flame, color: 'from-orange-400 to-rose-500', achieved: true, progress: 100 },
    { id: 'water_master', title: 'سيد الارتواء', desc: 'تحقيق هدف الماء لـ 7 أيام', icon: Droplets, color: 'from-blue-400 to-cyan-500', achieved: true, progress: 100 },
    { id: 'sleep_guru', title: 'نوم عميق', desc: '8 ساعات نوم 3 ليالي', icon: Moon, color: 'from-indigo-400 to-purple-600', achieved: false, progress: 66 },
    { id: 'health_shield', title: 'درع المناعة', desc: 'إكمال الفيلق المكملاتي 10 أيام', icon: ShieldCheck, color: 'from-emerald-400 to-teal-600', achieved: false, progress: 30 },
    { id: 'fasting_pro', title: 'بطل الصيام', desc: '16 ساعة صيام لـ 5 أيام', icon: Zap, color: 'from-amber-400 to-yellow-600', achieved: false, progress: 80 },
    { id: 'ai_friend', title: 'صديق الطبيب', desc: 'أول 5 تحليلات ذكية', icon: Star, color: 'from-violet-400 to-fuchsia-500', achieved: true, progress: 100 },
];

export default function AchievementBadges() {
    return (
        <div className="bg-slate-900 rounded-3xl p-5 shadow-2xl relative overflow-hidden border border-white/10">
            {/* Elegant Background Styling */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            أوسمة التعافي
                        </h2>
                        <p className="text-xs font-medium text-slate-400 mt-1">تكريم التزامك بالخطة العلاجية</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10">
                        <span className="text-lg font-bold text-amber-400">3</span>
                        <span className="text-xs text-white/70 mr-1">أوسمة</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {BADGES.map((badge, index) => {
                        const Icon = badge.icon;
                        return (
                            <motion.div
                                key={badge.id}
                                className={`relative rounded-2xl p-3 border overflow-hidden ${badge.achieved ? 'bg-white/5 border-white/10' : 'bg-slate-800/50 border-slate-700/50 grayscale opacity-70'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: badge.achieved ? 1 : 0.7, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileTap={{ scale: 0.96 }}
                            >
                                {/* Active Badge Glow */}
                                {badge.achieved && (
                                    <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${badge.color} rounded-full blur-2xl opacity-20`} />
                                )}

                                <div className="flex gap-2.5 items-start">
                                    <div className={`w-10 h-10 shrink-0 rounded-[14px] flex items-center justify-center shadow-lg ${badge.achieved ? `bg-gradient-to-br ${badge.color} shadow-black/20 text-white` : 'bg-slate-700 text-slate-400'}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 mt-0.5">
                                        <h3 className={`text-xs font-bold leading-tight mb-1 ${badge.achieved ? 'text-white' : 'text-slate-300'}`}>{badge.title}</h3>
                                        <p className="text-[9px] text-slate-400 leading-tight line-clamp-2">{badge.desc}</p>
                                    </div>
                                </div>

                                {/* Progress Bar for unachieved */}
                                {!badge.achieved && (
                                    <div className="mt-3">
                                        <div className="flex justify-between text-[8px] font-bold text-slate-500 mb-1">
                                            <span>{badge.progress}%</span>
                                            <span>التقدم</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-slate-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${badge.progress}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

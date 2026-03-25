// components/health-tracker/ActionGrid.tsx
// iOS-style horizontal scrollable quick actions

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Droplets, Apple, Dumbbell, Moon, Heart, Scale, Pill, Timer, Brain, Activity, Zap } from 'lucide-react';

interface ActionItem {
    id: string;
    icon: LucideIcon;
    label: string;
    tintBg: string;
    tintColor: string;
    onClick?: () => void;
}

interface ActionGridProps {
    onActionClick?: (actionId: string) => void;
    customActions?: ActionItem[];
    activeAction?: string;
}

const defaultActions: ActionItem[] = [
    { id: 'water', icon: Droplets, label: 'الماء', tintBg: 'bg-cyan-100/80 dark:bg-cyan-900/20', tintColor: 'text-cyan-500' },
    { id: 'calories', icon: Apple, label: 'السعرات', tintBg: 'bg-red-100/80 dark:bg-red-900/20', tintColor: 'text-red-500' },
    { id: 'weight', icon: Scale, label: 'الوزن', tintBg: 'bg-violet-100/80 dark:bg-violet-900/20', tintColor: 'text-violet-500' },
    { id: 'meals', icon: Apple, label: 'الوجبات', tintBg: 'bg-green-100/80 dark:bg-green-900/20', tintColor: 'text-green-500' },
    { id: 'workout', icon: Dumbbell, label: 'التمارين', tintBg: 'bg-orange-100/80 dark:bg-orange-900/20', tintColor: 'text-orange-500' },
    { id: 'sleep', icon: Moon, label: 'النوم', tintBg: 'bg-indigo-100/80 dark:bg-indigo-900/20', tintColor: 'text-indigo-500' },
    { id: 'heart', icon: Heart, label: 'القلب', tintBg: 'bg-pink-100/80 dark:bg-pink-900/20', tintColor: 'text-pink-500' },
    { id: 'meds', icon: Pill, label: 'الأدوية', tintBg: 'bg-teal-100/80 dark:bg-teal-900/20', tintColor: 'text-teal-500' },
];

export default function ActionGrid({ onActionClick, customActions, activeAction }: ActionGridProps) {
    const actions = customActions || defaultActions;

    return (
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-primary" />
                    إجراءات سريعة
                </h3>
                <span className="text-xs text-slate-400 font-medium">{actions.length} خيار</span>
            </div>

            {/* Horizontal Scrollable Cards */}
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide scroll-x-mobile">
                {actions.map((action) => {
                    const isActive = activeAction === action.id;
                    const Icon = action.icon;

                    return (
                        <motion.button
                            key={action.id}
                            className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-2.5 rounded-xl min-w-[64px] transition-all ${isActive
                                ? 'bg-primary shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                                }`}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => onActionClick?.(action.id)}
                        >
                            {/* Icon Container */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive
                                ? 'bg-white/20'
                                : `${action.tintBg}`
                                }`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : action.tintColor}`} />
                            </div>

                            {/* Label */}
                            <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                                }`}>
                                {action.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

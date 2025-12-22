// components/health-tracker/ActionGrid.tsx
// Premium Horizontal Scrollable Quick Actions

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Droplets, Apple, Dumbbell, Moon, Heart, Scale, Pill, Timer, Brain, Activity } from 'lucide-react';

interface ActionItem {
    id: string;
    icon: LucideIcon;
    label: string;
    gradient: string;
    bgLight: string;
    iconColor: string;
    onClick?: () => void;
}

interface ActionGridProps {
    onActionClick?: (actionId: string) => void;
    customActions?: ActionItem[];
    activeAction?: string;
}

const defaultActions: ActionItem[] = [
    { id: 'water', icon: Droplets, label: 'الماء', gradient: 'from-cyan-400 to-teal-500', bgLight: 'bg-cyan-50', iconColor: '#06B6D4' },
    { id: 'calories', icon: Apple, label: 'السعرات', gradient: 'from-red-400 to-rose-500', bgLight: 'bg-red-50', iconColor: '#EF4444' },
    { id: 'weight', icon: Scale, label: 'الوزن', gradient: 'from-violet-500 to-purple-600', bgLight: 'bg-violet-50', iconColor: '#8B5CF6' },
    { id: 'meals', icon: Apple, label: 'الوجبات', gradient: 'from-green-400 to-emerald-500', bgLight: 'bg-green-50', iconColor: '#22C55E' },
    { id: 'workout', icon: Dumbbell, label: 'التمارين', gradient: 'from-orange-400 to-amber-500', bgLight: 'bg-orange-50', iconColor: '#F97316' },
    { id: 'sleep', icon: Moon, label: 'النوم', gradient: 'from-indigo-400 to-blue-500', bgLight: 'bg-indigo-50', iconColor: '#6366F1' },
    { id: 'heart', icon: Heart, label: 'القلب', gradient: 'from-pink-400 to-rose-500', bgLight: 'bg-pink-50', iconColor: '#EC4899' },
    { id: 'meds', icon: Pill, label: 'الأدوية', gradient: 'from-teal-400 to-cyan-500', bgLight: 'bg-teal-50', iconColor: '#14B8A6' },
];

export default function ActionGrid({ onActionClick, customActions, activeAction }: ActionGridProps) {
    const actions = customActions || defaultActions;

    return (
        <div className="bg-white rounded-3xl p-5 shadow-lg shadow-black/5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">إجراءات سريعة</h3>
                <span className="text-xs text-slate-400">{actions.length} خيار</span>
            </div>

            {/* Horizontal Scrollable Cards */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-x-mobile">
                {actions.map((action) => {
                    const isActive = activeAction === action.id;
                    const Icon = action.icon;

                    return (
                        <motion.button
                            key={action.id}
                            className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl min-w-[72px] transition-all relative ${isActive
                                    ? `bg-gradient-to-br ${action.gradient} shadow-lg`
                                    : `${action.bgLight} hover:shadow-md`
                                }`}
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onActionClick?.(action.id)}
                        >
                            {/* Icon Container */}
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/25' : 'bg-white shadow-sm'
                                }`}>
                                <motion.div
                                    initial={{ rotate: 0 }}
                                    whileHover={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Icon
                                        className={`w-5 h-5 ${isActive ? 'text-white' : ''}`}
                                        style={{ color: isActive ? undefined : action.iconColor }}
                                    />
                                </motion.div>
                            </div>

                            {/* Label */}
                            <span className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-slate-600'
                                }`}>
                                {action.label}
                            </span>

                            {/* Active Indicator */}
                            {isActive && (
                                <motion.div
                                    className="absolute -bottom-1 w-1.5 h-1.5 bg-white rounded-full shadow"
                                    layoutId="activeActionIndicator"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}


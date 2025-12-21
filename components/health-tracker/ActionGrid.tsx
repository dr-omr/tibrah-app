// components/health-tracker/ActionGrid.tsx
// Apple-style quick action grid (inspired by Omo's feature grid)

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Droplets, Apple, Dumbbell, Moon, Heart, LineChart, Scale, Pill } from 'lucide-react';

interface ActionItem {
    id: string;
    icon: LucideIcon;
    label: string;
    color: string;
    bgColor: string;
    onClick?: () => void;
}

interface ActionGridProps {
    onActionClick?: (actionId: string) => void;
    customActions?: ActionItem[];
}

const defaultActions: ActionItem[] = [
    { id: 'water', icon: Droplets, label: 'متتبع الماء', color: '#3B82F6', bgColor: 'bg-blue-50' },
    { id: 'weight', icon: Scale, label: 'الوزن', color: '#8B5CF6', bgColor: 'bg-purple-50' },
    { id: 'calories', icon: Apple, label: 'السعرات', color: '#EF4444', bgColor: 'bg-red-50' },
    { id: 'meals', icon: Apple, label: 'خطة الوجبات', color: '#22C55E', bgColor: 'bg-green-50' },
    { id: 'workout', icon: Dumbbell, label: 'التمارين', color: '#F97316', bgColor: 'bg-orange-50' },
    { id: 'sleep', icon: Moon, label: 'النوم', color: '#6366F1', bgColor: 'bg-indigo-50' },
    { id: 'heart', icon: Heart, label: 'معدل القلب', color: '#EC4899', bgColor: 'bg-pink-50' },
    { id: 'meds', icon: Pill, label: 'الأدوية', color: '#14B8A6', bgColor: 'bg-teal-50' },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 20
        }
    }
};

export default function ActionGrid({ onActionClick, customActions }: ActionGridProps) {
    const actions = customActions || defaultActions;

    return (
        <div className="bg-white rounded-3xl p-5 shadow-lg shadow-black/5">
            <h3 className="text-lg font-bold text-slate-800 mb-4">إجراءات سريعة</h3>

            <motion.div
                className="grid grid-cols-4 gap-3"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {actions.map((action) => (
                    <motion.button
                        key={action.id}
                        variants={item}
                        whileHover={{ scale: 1.08, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onActionClick?.(action.id)}
                        className={`${action.bgColor} flex flex-col items-center justify-center p-3 rounded-2xl transition-shadow hover:shadow-md`}
                    >
                        <motion.div
                            initial={{ rotate: 0 }}
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.4 }}
                        >
                            <action.icon
                                className="w-7 h-7 mb-2"
                                style={{ color: action.color }}
                            />
                        </motion.div>
                        <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">
                            {action.label}
                        </span>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
}

import React from 'react';
import { statsConfig } from './data';

interface CourseStatsProps {
    statsValues: Record<string, string | number>;
}

export const CourseStats: React.FC<CourseStatsProps> = ({ statsValues }) => {
    return (
        <div className="px-4 pt-4">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-3 shadow-sm border border-slate-200/60 dark:border-slate-700/50">
                <div className="grid grid-cols-4 gap-1">
                    {statsConfig.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.key} className={`text-center py-1.5 ${i > 0 ? 'border-r border-slate-100 dark:border-slate-700/50' : ''}`}>
                                <div className="flex items-center justify-center gap-1 mb-0.5">
                                    <Icon className={`w-3.5 h-3.5 ${stat.color} ${stat.fill ? 'fill-amber-400' : ''}`} />
                                    <span className="text-lg font-bold text-slate-800 dark:text-white">{statsValues[stat.key]}</span>
                                </div>
                                <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

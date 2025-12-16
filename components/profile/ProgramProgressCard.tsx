import React, { useState } from 'react';
import { Check, Calendar, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DayTask {
    id: string;
    title: string;
    completed: boolean;
}

interface DayProgress {
    day: number;
    date: string;
    tasks: DayTask[];
    completed: boolean;
}

interface ProgramProgressCardProps {
    programName?: string;
    currentDay?: number;
    totalDays?: number;
    dailyProgress?: DayProgress[];
}

const generateDefaultProgress = (): DayProgress[] => {
    const today = new Date();
    const progress: DayProgress[] = [];

    for (let i = 0; i < 21; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (14 - i)); // Start from 14 days ago

        const tasks: DayTask[] = [
            { id: `${i}-1`, title: 'شرب ٨ أكواب ماء', completed: i < 14 },
            { id: `${i}-2`, title: 'المشي ٣٠ دقيقة', completed: i < 13 },
            { id: `${i}-3`, title: 'تناول الفيتامينات', completed: i < 14 },
            { id: `${i}-4`, title: 'النوم قبل ١١ مساءً', completed: i < 12 },
        ];

        progress.push({
            day: i + 1,
            date: date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
            tasks,
            completed: i < 12
        });
    }

    return progress;
};

export default function ProgramProgressCard({
    programName = 'برنامج ٢١ يوم',
    currentDay = 14,
    totalDays = 21,
    dailyProgress = generateDefaultProgress()
}: ProgramProgressCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const progressPercentage = (currentDay / totalDays) * 100;
    const remainingDays = totalDays - currentDay;

    const completedDays = dailyProgress.filter(d => d.completed).length;
    const completionRate = Math.round((completedDays / currentDay) * 100);

    const selectedDayData = selectedDay !== null ? dailyProgress[selectedDay - 1] : null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{programName}</h3>
                            <p className="text-white/60 text-sm">التزامك مميز!</p>
                        </div>
                    </div>
                    <div className="text-left">
                        <p className="text-3xl font-bold">{currentDay}</p>
                        <p className="text-white/60 text-sm">من {totalDays} يوم</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#2D9B83] to-[#3FB39A] rounded-full transition-all duration-700"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    {/* Day Markers */}
                    <div className="flex justify-between mt-2">
                        <span className="text-xs text-white/40">اليوم ١</span>
                        <span className="text-xs text-white/40">اليوم {totalDays}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold">{remainingDays}</p>
                        <p className="text-xs text-white/60">أيام متبقية</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold">{completionRate}%</p>
                        <p className="text-xs text-white/60">نسبة الإنجاز</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold">🔥 {completedDays}</p>
                        <p className="text-xs text-white/60">أيام متتالية</p>
                    </div>
                </div>
            </div>

            {/* Expand Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center gap-2 py-3 text-[#2D9B83] hover:bg-[#2D9B83]/5 transition-colors"
            >
                <span className="text-sm font-medium">
                    {isExpanded ? 'إخفاء التفاصيل' : 'عرض المهام اليومية'}
                </span>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                ) : (
                    <ChevronDown className="w-4 h-4" />
                )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 border-t border-slate-100">
                    {/* Day Selector */}
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                        {dailyProgress.slice(0, currentDay).map((day) => (
                            <button
                                key={day.day}
                                onClick={() => setSelectedDay(day.day)}
                                className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all
                                    ${selectedDay === day.day
                                        ? 'bg-[#2D9B83] text-white'
                                        : day.completed
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-600'
                                    }
                                `}
                            >
                                <span className="text-xs opacity-70">{day.date}</span>
                                <span className="font-bold">{day.day}</span>
                            </button>
                        ))}
                    </div>

                    {/* Selected Day Tasks */}
                    {selectedDayData && (
                        <div className="mt-4 space-y-2">
                            <h4 className="font-medium text-slate-700 mb-3">
                                مهام اليوم {selectedDayData.day}
                            </h4>
                            {selectedDayData.tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors
                                        ${task.completed ? 'bg-green-50' : 'bg-slate-50'}
                                    `}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center
                                        ${task.completed
                                            ? 'bg-green-500 text-white'
                                            : 'border-2 border-slate-300'
                                        }
                                    `}>
                                        {task.completed && <Check className="w-4 h-4" />}
                                    </div>
                                    <span className={`flex-1 ${task.completed ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                                        {task.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {!selectedDay && (
                        <div className="text-center py-6 text-slate-400">
                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>اختر يوماً لعرض المهام</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// components/courses/CourseProgress.tsx
// Course progress tracking with animated progress rings and lesson completion

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Play, Lock, Clock, Trophy, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

interface Lesson {
    id: string;
    title: string;
    duration: string;
    isLocked: boolean;
}

interface CourseProgressProps {
    courseId: string;
    courseName: string;
    lessons: Lesson[];
    totalLessons: number;
}

// ============================================
// PROGRESS RING
// ============================================

function ProgressRing({ progress, size = 80, strokeWidth = 6 }: { progress: number; size?: number; strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke="url(#progressGradient)"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2D9B83" />
                        <stop offset="100%" stopColor="#3FB39A" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-[#2D9B83]">{Math.round(progress)}%</span>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CourseProgress({ courseId, courseName, lessons, totalLessons }: CourseProgressProps) {
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentLesson, setCurrentLesson] = useState<string | null>(null);

    // Load progress from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`course_progress_${courseId}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                setCompletedLessons(parsed.completed || []);
                setCurrentLesson(parsed.current || null);
            }
        }
    }, [courseId]);

    // Save progress
    const saveProgress = (completed: string[], current: string | null) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`course_progress_${courseId}`, JSON.stringify({
                completed,
                current,
                lastUpdated: new Date().toISOString()
            }));
        }
    };

    const toggleLesson = (lessonId: string) => {
        const isCompleted = completedLessons.includes(lessonId);
        let updated: string[];

        if (isCompleted) {
            updated = completedLessons.filter(id => id !== lessonId);
        } else {
            updated = [...completedLessons, lessonId];
            // Find next uncompleted lesson
            const lessonIndex = lessons.findIndex(l => l.id === lessonId);
            const nextLesson = lessons.find((l, i) => i > lessonIndex && !updated.includes(l.id));

            if (updated.length === totalLessons) {
                toast.success('🎉 مبروك! أكملت الدورة بالكامل!');
            } else {
                toast.success('✅ تم إكمال الدرس');
            }

            setCurrentLesson(nextLesson?.id || null);
        }

        setCompletedLessons(updated);
        saveProgress(updated, currentLesson);
    };

    const progress = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;
    const visibleLessons = isExpanded ? lessons : lessons.slice(0, 4);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            {/* Header with Progress Ring */}
            <div className="p-5 flex items-center gap-4 bg-gradient-to-l from-[#2D9B83]/5 to-transparent">
                <ProgressRing progress={progress} />
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">تقدمك في الدورة</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {completedLessons.length} من {totalLessons} درس مكتمل
                    </p>
                    {progress === 100 && (
                        <motion.div
                            className="flex items-center gap-1 mt-2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">مبروك! أكملت الدورة 🎉</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Lessons List */}
            <div className="px-4 pb-3">
                <div className="space-y-1">
                    {visibleLessons.map((lesson, idx) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        const isCurrent = currentLesson === lesson.id || (!currentLesson && idx === completedLessons.length);
                        const isAvailable = !lesson.isLocked;

                        return (
                            <motion.button
                                key={lesson.id}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all ${isCompleted
                                        ? 'bg-emerald-50 dark:bg-emerald-900/15'
                                        : isCurrent
                                            ? 'bg-[#2D9B83]/5 ring-1 ring-[#2D9B83]/20'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                                onClick={() => isAvailable && toggleLesson(lesson.id)}
                                disabled={!isAvailable}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileTap={isAvailable ? { scale: 0.98 } : undefined}
                            >
                                {/* Status Icon */}
                                <div className="flex-shrink-0">
                                    {isCompleted ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500 }}
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        </motion.div>
                                    ) : lesson.isLocked ? (
                                        <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                    ) : isCurrent ? (
                                        <div className="w-5 h-5 rounded-full bg-[#2D9B83] flex items-center justify-center">
                                            <Play className="w-3 h-3 text-white fill-white" />
                                        </div>
                                    ) : (
                                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                    )}
                                </div>

                                {/* Lesson Info */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isCompleted
                                            ? 'text-emerald-700 dark:text-emerald-400 line-through'
                                            : lesson.isLocked
                                                ? 'text-slate-400 dark:text-slate-500'
                                                : 'text-slate-700 dark:text-slate-200'
                                        }`}>
                                        {lesson.title}
                                    </p>
                                </div>

                                {/* Duration */}
                                <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Show More Button */}
                {lessons.length > 4 && (
                    <Button
                        variant="ghost"
                        className="w-full mt-2 text-xs text-slate-500 hover:text-[#2D9B83] h-8"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <><ChevronUp className="w-4 h-4 ml-1" /> عرض أقل</>
                        ) : (
                            <><ChevronDown className="w-4 h-4 ml-1" /> عرض {lessons.length - 4} دروس أخرى</>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}

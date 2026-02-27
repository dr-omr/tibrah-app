// components/courses/LessonViewer.tsx
// Interactive lesson viewer with video, notes, and quiz sections

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, SkipBack, SkipForward, CheckCircle2,
    BookOpen, FileText, HelpCircle, ChevronLeft, ChevronRight,
    Clock, Award, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Lesson {
    id: string;
    title: string;
    duration: string;
    completed: boolean;
    locked?: boolean;
    type: 'video' | 'reading' | 'quiz';
}

interface LessonViewerProps {
    courseTitle: string;
    lessons: Lesson[];
    currentLessonIndex: number;
    onLessonChange: (index: number) => void;
    onComplete: (lessonId: string) => void;
}

export default function LessonViewer({
    courseTitle, lessons, currentLessonIndex,
    onLessonChange, onComplete
}: LessonViewerProps) {
    const [showSidebar, setShowSidebar] = useState(false);
    const currentLesson = lessons[currentLessonIndex];
    const completedCount = lessons.filter(l => l.completed).length;
    const progress = Math.round((completedCount / lessons.length) * 100);

    const typeIcon = {
        video: Play,
        reading: BookOpen,
        quiz: HelpCircle,
    };

    const typeLabel = {
        video: 'فيديو',
        reading: 'قراءة',
        quiz: 'اختبار',
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate max-w-[200px]">{courseTitle}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{completedCount}/{lessons.length}</span>
                    <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <motion.button
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                        whileTap={{ scale: 0.85 }}
                        onClick={() => setShowSidebar(!showSidebar)}
                    >
                        <FileText className="w-4 h-4 text-slate-500" />
                    </motion.button>
                </div>
            </div>

            <div className="flex">
                {/* Main Content */}
                <div className="flex-1">
                    {/* Content Area */}
                    <div className="bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center relative">
                        {currentLesson?.type === 'video' ? (
                            <div className="text-center">
                                <motion.div
                                    className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-3 cursor-pointer shadow-xl shadow-emerald-500/20"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Play className="w-7 h-7 text-white mr-[-2px]" />
                                </motion.div>
                                <p className="text-sm text-slate-500">{currentLesson.title}</p>
                            </div>
                        ) : currentLesson?.type === 'quiz' ? (
                            <div className="text-center">
                                <HelpCircle className="w-16 h-16 text-indigo-400 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">اختبار: {currentLesson.title}</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <BookOpen className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">{currentLesson?.title}</p>
                            </div>
                        )}
                    </div>

                    {/* Lesson Controls */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">{currentLesson?.title}</h4>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {currentLesson?.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        {React.createElement(typeIcon[currentLesson?.type || 'video'], { className: 'w-3 h-3' })}
                                        {typeLabel[currentLesson?.type || 'video']}
                                    </span>
                                </div>
                            </div>
                            {currentLesson && !currentLesson.completed && (
                                <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs"
                                    onClick={() => onComplete(currentLesson.id)}
                                >
                                    <CheckCircle2 className="w-4 h-4 ml-1" />
                                    إتمام الدرس
                                </Button>
                            )}
                            {currentLesson?.completed && (
                                <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                                    <CheckCircle2 className="w-4 h-4" />
                                    مكتمل
                                </span>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                            <motion.button
                                className="flex items-center gap-1 text-sm text-slate-500 disabled:opacity-30"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onLessonChange(currentLessonIndex - 1)}
                                disabled={currentLessonIndex <= 0}
                            >
                                <ChevronRight className="w-4 h-4" />
                                الدرس السابق
                            </motion.button>

                            {progress === 100 && (
                                <motion.div
                                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring' }}
                                >
                                    <Award className="w-3.5 h-3.5" />
                                    مبروك! أكملت الدورة 🎉
                                </motion.div>
                            )}

                            <motion.button
                                className="flex items-center gap-1 text-sm text-emerald-600 font-medium disabled:opacity-30"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onLessonChange(currentLessonIndex + 1)}
                                disabled={currentLessonIndex >= lessons.length - 1}
                            >
                                الدرس التالي
                                <ChevronLeft className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Sidebar — Lesson List */}
                <AnimatePresence>
                    {showSidebar && (
                        <motion.div
                            className="w-64 border-r border-slate-100 dark:border-slate-800 overflow-y-auto max-h-[500px]"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 256, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="p-3">
                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">الدروس ({lessons.length})</h4>
                                <div className="space-y-1">
                                    {lessons.map((lesson, idx) => {
                                        const Icon = typeIcon[lesson.type];
                                        const isActive = idx === currentLessonIndex;
                                        return (
                                            <motion.button
                                                key={lesson.id}
                                                className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-right transition-colors ${isActive
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    } ${lesson.locked ? 'opacity-50' : ''}`}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => !lesson.locked && onLessonChange(idx)}
                                                disabled={lesson.locked}
                                            >
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${lesson.completed ? 'bg-emerald-100 dark:bg-emerald-900/40' :
                                                        isActive ? 'bg-emerald-500' :
                                                            'bg-slate-100 dark:bg-slate-700'
                                                    }`}>
                                                    {lesson.locked ? (
                                                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                                                    ) : lesson.completed ? (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                    ) : (
                                                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-medium truncate ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
                                                        }`}>{lesson.title}</p>
                                                    <p className="text-[10px] text-slate-400">{lesson.duration}</p>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/**
 * CourseQuiz — Interactive quiz component for course lessons
 * Features: multiple choice, instant feedback, score tracking, animated transitions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, XCircle, ArrowLeft, RotateCcw,
    Trophy, Target, Sparkles, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

interface CourseQuizProps {
    title: string;
    questions: QuizQuestion[];
    passingScore?: number; // percentage, default 70
    onComplete: (score: number, passed: boolean) => void;
    onRetry?: () => void;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function CourseQuiz({
    title,
    questions,
    passingScore = 70,
    onComplete,
    onRetry,
}: CourseQuizProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const passed = score >= passingScore;

    const handleSelect = (optionIndex: number) => {
        if (isAnswered) return;
        setSelectedOption(optionIndex);
        setIsAnswered(true);

        if (optionIndex === currentQuestion.correctIndex) {
            setCorrectCount(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
            onComplete(score, passed);
        }
    };

    const handleRetry = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setCorrectCount(0);
        setIsFinished(false);
        onRetry?.();
    };

    // ─── Results Screen ───────────────────────────────────
    if (isFinished) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 px-4"
            >
                {/* Score Circle */}
                <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${passed
                        ? 'bg-gradient-to-br from-green-400 to-emerald-600'
                        : 'bg-gradient-to-br from-orange-400 to-red-500'
                    } shadow-2xl`}>
                    <div className="text-center text-white">
                        <p className="text-3xl font-bold">{score}%</p>
                        <p className="text-xs opacity-80">{correctCount}/{questions.length}</p>
                    </div>
                </div>

                {passed ? (
                    <>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">ممتاز! 🎉</h3>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            لقد اجتزت الاختبار بنجاح. أحسنت!
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">حاول مرة أخرى</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            تحتاج {passingScore}% للنجاح. راجع الدرس وأعد المحاولة!
                        </p>
                    </>
                )}

                <div className="flex gap-3 max-w-sm mx-auto">
                    {!passed && (
                        <Button
                            onClick={handleRetry}
                            className="flex-1 h-14 rounded-2xl gradient-primary text-lg font-bold"
                        >
                            <RotateCcw className="w-5 h-5 ml-2" />
                            إعادة المحاولة
                        </Button>
                    )}
                    {passed && (
                        <Button
                            onClick={() => onComplete(score, true)}
                            className="flex-1 h-14 rounded-2xl gradient-primary text-lg font-bold"
                        >
                            <Sparkles className="w-5 h-5 ml-2" />
                            متابعة
                        </Button>
                    )}
                </div>
            </motion.div>
        );
    }

    // ─── Question Screen ──────────────────────────────────
    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#2D9B83]" />
                    <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {currentIndex + 1} / {questions.length}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-[#2D9B83] to-[#3FB39A] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                >
                    <p className="text-lg font-semibold text-slate-800 dark:text-white leading-relaxed">
                        {currentQuestion.question}
                    </p>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = selectedOption === idx;
                            const isCorrect = idx === currentQuestion.correctIndex;
                            let optionStyle = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#2D9B83]';

                            if (isAnswered) {
                                if (isCorrect) {
                                    optionStyle = 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500';
                                } else if (isSelected && !isCorrect) {
                                    optionStyle = 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500';
                                } else {
                                    optionStyle = 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 opacity-50';
                                }
                            } else if (isSelected) {
                                optionStyle = 'bg-[#2D9B83]/10 border-2 border-[#2D9B83]';
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(idx)}
                                    disabled={isAnswered}
                                    className={`w-full p-4 rounded-2xl text-right flex items-center gap-3 transition-all duration-200 ${optionStyle}`}
                                >
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isAnswered && isCorrect
                                            ? 'bg-green-500 text-white'
                                            : isAnswered && isSelected && !isCorrect
                                                ? 'bg-red-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                        }`}>
                                        {isAnswered && isCorrect ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : isAnswered && isSelected && !isCorrect ? (
                                            <XCircle className="w-5 h-5" />
                                        ) : (
                                            String.fromCharCode(1571 + idx) // Arabic letters أ ب ت ث
                                        )}
                                    </span>
                                    <span className="flex-1 text-slate-700 dark:text-slate-200">{option}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    {isAnswered && currentQuestion.explanation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800"
                        >
                            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                💡 {currentQuestion.explanation}
                            </p>
                        </motion.div>
                    )}

                    {/* Next Button */}
                    {isAnswered && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Button
                                onClick={handleNext}
                                className="w-full h-14 gradient-primary rounded-2xl text-lg font-bold"
                            >
                                {currentIndex < questions.length - 1 ? 'السؤال التالي' : 'عرض النتائج'}
                                <ArrowLeft className="w-5 h-5 mr-2" />
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

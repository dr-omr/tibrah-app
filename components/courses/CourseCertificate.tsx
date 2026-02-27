// components/courses/CourseCertificate.tsx
// Beautiful certificate component for completed courses

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, Calendar, BookOpen, Star } from 'lucide-react';

interface CourseCertificateProps {
    studentName: string;
    courseName: string;
    completionDate: string;
    instructorName?: string;
    hoursCompleted?: number;
    grade?: string;
}

export default function CourseCertificate({
    studentName, courseName, completionDate,
    instructorName = 'د. عمر العماد', hoursCompleted, grade
}: CourseCertificateProps) {
    return (
        <motion.div
            className="relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
        >
            {/* Certificate Card */}
            <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-slate-800 dark:via-slate-900 dark:to-emerald-900/20 rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 p-6 sm:p-8 relative">
                {/* Decorative corners */}
                <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-amber-300/50 rounded-tr-2xl" />
                <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-amber-300/50 rounded-tl-2xl" />
                <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-amber-300/50 rounded-br-2xl" />
                <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-amber-300/50 rounded-bl-2xl" />

                {/* Header */}
                <div className="text-center mb-6">
                    <motion.div
                        className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20"
                        animate={{ rotateY: [0, 360] }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        <Award className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">شهادة إتمام</h3>
                    <p className="text-xs text-slate-400 mt-1">CERTIFICATE OF COMPLETION</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent mb-5" />

                {/* Student Name */}
                <div className="text-center mb-5">
                    <p className="text-xs text-slate-500 mb-1">يشهد بأن</p>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">{studentName}</h2>
                </div>

                {/* Course Name */}
                <div className="text-center mb-5">
                    <p className="text-xs text-slate-500 mb-1">قد أتم بنجاح دورة</p>
                    <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{courseName}</h3>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-center gap-6 mb-5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        {completionDate}
                    </div>
                    {hoursCompleted && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                            {hoursCompleted} ساعة
                        </div>
                    )}
                    {grade && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            {grade}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent mb-4" />

                {/* Instructor */}
                <div className="text-center">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{instructorName}</p>
                    <p className="text-xs text-slate-400">المدرب المعتمد — طِبرَا</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
                <motion.button
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-medium text-sm shadow-lg shadow-emerald-500/20"
                    whileTap={{ scale: 0.95 }}
                >
                    <Download className="w-4 h-4" />
                    تحميل الشهادة
                </motion.button>
                <motion.button
                    className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-sm"
                    whileTap={{ scale: 0.95 }}
                >
                    <Share2 className="w-4 h-4" />
                    مشاركة
                </motion.button>
            </div>
        </motion.div>
    );
}

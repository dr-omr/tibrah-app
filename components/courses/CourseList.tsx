import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Users, Star, Search, RefreshCw, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ListSkeleton } from '@/components/common/Skeletons';
import { createPageUrl } from '@/utils';
import { Course, levelLabels, levelColors } from './data';

interface CourseListProps {
    isLoading: boolean;
    filteredCourses: Course[];
    clearAllFilters: () => void;
    setSearchQuery: (query: string) => void;
    setShowSearch: (show: boolean) => void;
    setActiveCategory: (category: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({
    isLoading,
    filteredCourses,
    clearAllFilters,
    setSearchQuery,
    setShowSearch,
    setActiveCategory
}) => {
    return (
        <div className="px-4 pt-3 space-y-3">
            {isLoading ? (
                <ListSkeleton count={4} />
            ) : filteredCourses.length === 0 ? (
                /* ─── Empty State ─── */
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm p-8 text-center"
                >
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-slate-300 dark:text-slate-500" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">لا توجد نتائج</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
                        لم نجد دورات تتطابق مع بحثك الحالي.<br />
                        جرب تغيير الفئة أو معايير الفلترة.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={clearAllFilters}
                            className="rounded-full bg-primary text-white text-xs px-5 h-9"
                        >
                            <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
                            عرض جميع الدورات
                        </Button>
                    </div>

                    {/* Smart suggestion */}
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                            <span>جرب البحث عن: <button onClick={() => { setSearchQuery('الطب الوظيفي'); setShowSearch(true); setActiveCategory('all'); }} className="text-primary font-semibold hover:underline">الطب الوظيفي</button> أو <button onClick={() => { setSearchQuery('التغذية'); setShowSearch(true); setActiveCategory('all'); }} className="text-primary font-semibold hover:underline">التغذية</button></span>
                        </div>
                    </div>
                </motion.div>
            ) : (
                /* ─── Course Cards ─── */
                filteredCourses.map((course: Course, index: number) => (
                    <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            href={createPageUrl(`CourseDetails?id=${course.id}`)}
                            className="block bg-white dark:bg-slate-800/80 rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-700/50 hover:shadow-md transition-shadow"
                        >
                            <div className="flex gap-3 p-3">
                                {/* Thumbnail */}
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {/* Play overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                        <div className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/80 flex items-center justify-center shadow-sm">
                                            <Play className="w-3.5 h-3.5 text-primary fill-primary mr-[-1px]" />
                                        </div>
                                    </div>
                                    {/* Free badge */}
                                    {course.is_free && (
                                        <div className="absolute top-1.5 right-1.5">
                                            <span className="bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                                                مجاني
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col py-0.5">
                                    <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1 text-sm mb-0.5">{course.title}</h3>
                                    <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed flex-grow">{course.description}</p>

                                    {/* Meta chips */}
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-2">
                                        <span className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-700/40 px-1.5 py-0.5 rounded-md">
                                            <Clock className="w-3 h-3" />
                                            {course.duration_hours}س
                                        </span>
                                        <span className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-700/40 px-1.5 py-0.5 rounded-md">
                                            <BookOpen className="w-3 h-3" />
                                            {course.lessons_count} درس
                                        </span>
                                        <span className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-700/40 px-1.5 py-0.5 rounded-md">
                                            <Users className="w-3 h-3" />
                                            {course.enrolled_count > 1000 ? `${(course.enrolled_count / 1000).toFixed(1)}k` : course.enrolled_count}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${levelColors[course.level] || 'bg-slate-100 text-slate-600'}`}>
                                            {levelLabels[course.level] || course.level}
                                        </span>
                                    </div>

                                    {/* Bottom Row: Rating + Price */}
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{course.rating}</span>
                                            <span className="text-xs text-slate-400">({course.reviews_count})</span>
                                        </div>
                                        {course.is_free ? (
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                                مجاناً
                                            </span>
                                        ) : (
                                            <span className="font-bold text-base text-primary">{course.price} <span className="text-xs text-slate-400">ر.س</span></span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))
            )}
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { db } from '@/lib/db';
import { useQuery } from '@tanstack/react-query';
import { 
    BookOpen, Sparkles, Search, PlayCircle, 
    TrendingUp, Award, Brain, ArrowRight, Loader2, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { aiClient } from '@/components/ai/aiClient';
import { createPageUrl } from '@/utils';
import { Course } from '@/components/courses/data';

type CourseItem = Course & Record<string, any>;

const CATEGORIES = [
    { id: 'all', label: 'الكل' },
    { id: 'functional_medicine', label: 'الطب الوظيفي' },
    { id: 'nutrition', label: 'التغذية العلاجية' },
    { id: 'mental_health', label: 'الطب الشعوري' },
    { id: 'lifestyle', label: 'نمط الحياة' }
];

export default function Courses() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    
    // AI Advisor State
    const [aiRecs, setAiRecs] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);
    
    // Header Scroll
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const { data: courses = [], isLoading } = useQuery<CourseItem[]>({
        queryKey: ['courses'],
        queryFn: async () => {
            try { return (await db.entities.Course.filter({ status: 'published' })) as unknown as CourseItem[]; } 
            catch { return []; }
        },
    });

    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              course.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const featuredCourse = courses.find((c: any) => c.featured) || courses[0];

    const getAiRecommendations = async () => {
        if (!searchQuery && activeCategory === 'all') return;
        haptic.selection();
        setAiLoading(true);
        try {
            const result = await aiClient.recommendCourses({
                interests: [activeCategory !== 'all' ? activeCategory : searchQuery || 'التشافي الشامل'],
                level: 'all',
                available_courses: courses.map(c => c.title).slice(0, 10)
            });
            setAiRecs(result);
            uiSounds.success();
        } catch { }
        finally { setAiLoading(false); }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-teal-500/20 font-sans pb-24 overflow-x-hidden">
            <Head>
                <title>أكاديمية طِبرَا | دورات الطب الوظيفي</title>
                <meta name="theme-color" content="#f8fafc" />
            </Head>

            {/* ═══ Premium Navigation ═══ */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm py-3' : 'bg-transparent py-5'}`}>
                <div className="px-5 max-w-6xl mx-auto flex items-center justify-between">
                    <button onClick={() => { haptic.selection(); router.back(); }} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-sm">
                        <ArrowRight className="w-5 h-5 text-slate-600 rtl:-scale-x-100" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tight text-slate-800">أكاديمية طِبرَا</span>
                        <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
                            <Award className="w-4 h-4 text-teal-600" />
                        </div>
                    </div>
                </div>
            </header>

            {/* ═══ Masterclass Hero Section ═══ */}
            <section className="relative pt-32 pb-16 px-5 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
                <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[80px] pointer-events-none -translate-x-1/2" />

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-200 bg-teal-50 mb-6 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span className="text-xs font-bold tracking-wide text-teal-700">تعلم من الخبراء</span>
                    </motion.div>
                    
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-3xl md:text-5xl font-black mb-6 leading-[1.2] tracking-tight text-slate-900">
                        استعد السيطرة على صحتك <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-600 to-emerald-500">بالمعرفة الجذرية.</span>
                    </motion.h1>
                    
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-[15px] md:text-lg text-slate-500 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
                        دورات مكثفة يقدمها الدكتور عمر العماد ونخبة من الأطباء، تنقلك من مرحلة التشخيص إلى احتراف إدارة جسدك والتشافي الذاتي.
                    </motion.p>

                    {/* Search & AI Advisor Bar */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative max-w-2xl mx-auto group">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-2xl blur-lg opacity-50 transition-opacity duration-500" />
                        <div className="relative bg-white border border-slate-200 rounded-2xl p-2 flex items-center shadow-lg shadow-slate-200/50">
                            <Search className="w-5 h-5 text-teal-500 ml-3 shrink-0" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن دورة (مثال: مقاومة الإنسولين)..."
                                className="flex-1 bg-transparent border-0 text-slate-800 placeholder-slate-400 focus:ring-0 text-sm py-3 font-semibold"
                                onKeyDown={(e) => e.key === 'Enter' && getAiRecommendations()}
                            />
                            <button 
                                onClick={getAiRecommendations}
                                disabled={aiLoading || (!searchQuery && activeCategory === 'all')}
                                className="bg-slate-50 hover:bg-slate-100 text-teal-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 border border-slate-100 disabled:opacity-50"
                            >
                                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4 text-teal-500" />}
                                <span className="hidden sm:inline">أرشدني للأنسب</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ AI Generative Syllabus (Shows on query) ═══ */}
            <AnimatePresence>
                {aiRecs && (
                    <motion.section 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="px-5 max-w-4xl mx-auto overflow-hidden mb-12"
                    >
                        <div className="bg-white border border-indigo-100 rounded-3xl p-6 relative shadow-lg shadow-indigo-100/50">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 blur-3xl rounded-full" />
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                    <Brain className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="font-black text-indigo-900 text-lg">تحليل المستشار التعليمي</h3>
                                    <p className="text-xs text-indigo-500 font-medium">مسار مقترح بناءً على حالتك</p>
                                </div>
                                <button onClick={() => setAiRecs(null)} className="mr-auto text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-1 bg-slate-50 rounded-md border border-slate-100">إغلاق</button>
                            </div>
                            
                            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {aiRecs.recommendations?.map((rec: any, i: number) => (
                                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center border border-indigo-200">{i+1}</span>
                                            <h4 className="font-bold text-slate-800 text-sm">{rec.course || rec.title}</h4>
                                        </div>
                                        <p className="text-[13px] text-slate-500 leading-relaxed font-medium pl-8">{rec.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            <main className="max-w-6xl mx-auto px-5">
                {/* ═══ Custom Scroll Categories ═══ */}
                <div className="mb-10 overflow-x-auto hide-scrollbar pb-4 -mx-5 px-5">
                    <div className="flex gap-3 min-w-max">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => { haptic.selection(); setActiveCategory(cat.id); }}
                                className={`px-6 py-3 rounded-2xl text-[13px] font-bold transition-all border ${
                                    activeCategory === cat.id 
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ═══ Featured Course (Large Interactive Card) ═══ */}
                {featuredCourse && !searchQuery && activeCategory === 'all' && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-16">
                        <Link href={createPageUrl(`CourseDetails?id=${featuredCourse.id}`)}>
                            <div className="relative h-[450px] sm:h-[500px] rounded-[32px] overflow-hidden group border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                                {featuredCourse.image_url ? (
                                    <img src={featuredCourse.image_url} alt={featuredCourse.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                                
                                <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                                    <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
                                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">الدورة الأكثر مبيعاً</span>
                                    </div>
                                    <div className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/20">
                                        <span className="text-[10px] font-black text-white">{featuredCourse.level === 'beginner' ? 'مستوى مبتدئ' : 'متقدم'}</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-8 left-8 right-8 max-w-2xl z-10">
                                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-md group-hover:text-teal-300 transition-colors">
                                        {featuredCourse.title}
                                    </h2>
                                    <p className="text-sm sm:text-[15px] text-white/90 font-medium line-clamp-2 mb-6 leading-relaxed">
                                        {featuredCourse.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-4">
                                        <button className="px-8 py-3.5 rounded-2xl bg-teal-600 text-white font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-teal-600/30">
                                            <PlayCircle className="w-5 h-5" /> ابدأ التعلم
                                        </button>
                                        <div className="flex items-center gap-2 px-4 py-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            <span className="text-xs font-bold text-white">{featuredCourse.rating || 4.9}</span>
                                            <span className="text-xs text-white/70">({featuredCourse.enrolled_count || 1200}+ طالب)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* ═══ Course Grid ═══ */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-teal-600" />
                            {searchQuery ? 'نتائج البحث' : activeCategory !== 'all' ? CATEGORIES.find(c => c.id === activeCategory)?.label : 'جميع الدورات'}
                        </h2>
                        <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">{filteredCourses.length} دورات</span>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="h-72 rounded-3xl bg-slate-200 animate-pulse border border-slate-100" />
                            ))}
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl shadow-sm">
                            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-slate-800 mb-2">لا توجد نتائج</h3>
                            <p className="text-sm text-slate-500 font-medium mb-6">جرب توجيه سؤالك للمستشار التعليمي الذكي بالبحث.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course, i) => (
                                <Link key={course.id} href={createPageUrl(`CourseDetails?id=${course.id}`)}>
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                        whileHover={{ y: -6 }}
                                        className="bg-white border border-slate-200 rounded-3xl overflow-hidden group transition-all h-full flex flex-col shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-teal-200"
                                    >
                                        <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
                                            {course.image_url ? (
                                                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                                            ) : (
                                                <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                                                    <BookOpen className="w-12 h-12 text-slate-300" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg text-[10px] font-bold text-teal-700 uppercase tracking-widest border border-slate-100 shadow-sm">
                                                    {course.is_free ? 'مجانًا' : `${course.price} ر.س`}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6 flex flex-col flex-1 relative bg-white">
                                            <div className="absolute top-0 right-6 -translate-y-1/2 w-12 h-12 rounded-2xl bg-teal-600 border-4 border-white flex items-center justify-center group-hover:bg-teal-500 group-hover:scale-110 transition-all shadow-md">
                                                <PlayCircle className="w-6 h-6 text-white" />
                                            </div>

                                            <div className="flex items-center gap-2 mb-3 mt-2">
                                                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">{course.category}</span>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{course.duration} دقيقة</span>
                                            </div>
                                            
                                            <h3 className="font-black text-slate-800 text-lg mb-2 flex-1 group-hover:text-teal-600 transition-colors">
                                                {course.title}
                                            </h3>
                                            
                                            <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed font-medium mb-4">
                                                {course.description}
                                            </p>
                                            
                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                    <span className="text-[11px] font-bold text-slate-700">{course.rating || 5.0}</span>
                                                    <span className="text-[11px] text-slate-400">({course.enrolled_count || 0})</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[11px] font-bold text-slate-400">التفاصيل</span>
                                                    <ArrowRight className="w-3 h-3 text-slate-400 rtl:-scale-x-100 group-hover:text-teal-500 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

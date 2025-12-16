import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import ArticleCard from '../components/library/ArticleCard';
import LibraryFilters from '../components/library/LibraryFilters';

export default function Library() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeType, setActiveType] = useState('all');
    const [activeCategory, setActiveCategory] = useState('all');

    // مقالات حقيقية ومتنوعة
    const sampleArticles = [
        {
            id: '1',
            title: 'ما هو الطب الوظيفي؟ دليلك الشامل للشفاء الجذري',
            summary: 'تعرف على كيفية علاج الأمراض من جذورها بدلاً من الأعراض فقط - مع مراجع علمية',
            type: 'article',
            category: 'functional_medicine',
            image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
            duration_minutes: 12,
            views: 1250,
            featured: true,
            tags: ['طب وظيفي', 'شفاء جذري', 'صحة شاملة']
        },
        {
            id: '2',
            title: 'الترددات الشفائية: العلم وراء الشفاء بالصوت',
            summary: 'اكتشف ترددات سولفيجيو التسعة وتأثيرها العلمي على الجسم والدماغ',
            type: 'article',
            category: 'frequencies',
            image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
            duration_minutes: 15,
            views: 3420,
            featured: true,
            tags: ['ترددات شفائية', 'سولفيجيو', 'علاج صوتي']
        },
        {
            id: '3',
            title: 'دراسة: تأثير الصيام المتقطع على إصلاح الخلايا',
            summary: 'جائزة نوبل 2016 للالتهام الذاتي - كيف يجدد الصيام خلاياك',
            type: 'study',
            category: 'nutrition',
            image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
            duration_minutes: 12,
            views: 890,
            tags: ['صيام متقطع', 'التهام ذاتي', 'تجديد خلايا']
        },
        {
            id: '4',
            title: 'بروتوكول ديتوكس الكبد: خطوة بخطوة',
            summary: 'دليل عملي مفصل لتنظيف الكبد من السموم وتحسين وظائفه',
            type: 'article',
            category: 'detox',
            image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
            duration_minutes: 10,
            views: 2100,
            tags: ['ديتوكس', 'كبد', 'تنظيف', 'سموم']
        },
        {
            id: '5',
            title: 'أفضل 10 مكملات للطاقة والحيوية',
            summary: 'دليل علمي شامل لأهم المكملات مع الجرعات والمصادر الموثوقة',
            type: 'article',
            category: 'supplements',
            image_url: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800',
            duration_minutes: 8,
            views: 3200,
            featured: true,
            tags: ['مكملات', 'طاقة', 'فيتامينات', 'معادن']
        },
        {
            id: '6',
            title: 'كيف يؤثر النوم على هرموناتك؟',
            summary: 'الكورتيزول، هرمون النمو، اللبتين - كلها تتأثر بنومك',
            type: 'article',
            category: 'lifestyle',
            image_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800',
            duration_minutes: 10,
            views: 1540,
            tags: ['نوم', 'هرمونات', 'صحة']
        },
        {
            id: '7',
            title: 'التأمل والتنفس: مفتاح الصحة النفسية',
            summary: 'تقنيات مثبتة علمياً: 4-7-8، Box Breathing، وتنفس ويم هوف',
            type: 'article',
            category: 'mental_health',
            image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
            duration_minutes: 12,
            views: 2800,
            tags: ['تأمل', 'تنفس', 'صحة نفسية', 'توتر']
        },
        {
            id: '8',
            title: 'صحة الأمعاء: المفتاح الذهبي للصحة الشاملة',
            summary: 'الميكروبيوم، محور الأمعاء-الدماغ، وكيف تحسن صحتك الهضمية',
            type: 'article',
            category: 'nutrition',
            image_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
            duration_minutes: 14,
            views: 1890,
            tags: ['أمعاء', 'ميكروبيوم', 'هضم', 'مناعة']
        },
    ];

    const { data: articles = [] } = useQuery({
        queryKey: ['articles'],
        queryFn: () => base44.entities.KnowledgeArticle.list('-created_date', 50),
        initialData: [],
    });

    const allArticles = articles.length > 0 ? articles : sampleArticles;

    // Filter articles
    const filteredArticles = allArticles.filter(article => {
        const matchesSearch =
            article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = activeType === 'all' || article.type === activeType;
        const matchesCategory = activeCategory === 'all' || article.category === activeCategory;

        return matchesSearch && matchesType && matchesCategory;
    });

    const featuredArticles = allArticles.filter(a => a.featured);
    const trendingArticles = [...allArticles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] px-6 py-8">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">المكتبة</h1>
                            <p className="text-white/80 text-sm">مقالات، فيديوهات ودراسات</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="ابحث عن موضوع..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/90 border-0 rounded-2xl pr-12 h-14 text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 space-y-6">
                {/* Filters */}
                <LibraryFilters
                    activeType={activeType}
                    setActiveType={setActiveType}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />

                {/* Featured Section - Show only when no search/filter */}
                {!searchQuery && activeType === 'all' && activeCategory === 'all' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                            <h2 className="font-bold text-slate-800">محتوى مميز</h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {featuredArticles.slice(0, 3).map((article) => (
                                <div key={article.id} className="min-w-[280px]">
                                    <ArticleCard article={article} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trending Section */}
                {!searchQuery && activeType === 'all' && activeCategory === 'all' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#2D9B83]" />
                            <h2 className="font-bold text-slate-800">الأكثر مشاهدة</h2>
                        </div>
                    </div>
                )}

                {/* Results */}
                <div>
                    {searchQuery || activeType !== 'all' || activeCategory !== 'all' ? (
                        <p className="text-sm text-slate-500 mb-4">
                            {filteredArticles.length} نتيجة
                        </p>
                    ) : null}

                    {filteredArticles.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-600">لا توجد نتائج</h3>
                            <p className="text-slate-400 text-sm">جرب تغيير معايير البحث</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredArticles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

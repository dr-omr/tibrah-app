import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import ArticleCard from '../components/library/ArticleCard';
import LibraryFilters from '../components/library/LibraryFilters';
import { localArticles } from '@/lib/articles';

// Interface for Article
interface Article {
    id: string;
    title?: string;
    summary?: string;
    image_url?: string;
    category?: string;
    type?: string;
    views?: number;
    featured?: boolean;
    tags?: string[];
    created_date?: string;
    content?: string;
}

export default function Library() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeType, setActiveType] = useState('all');
    const [activeCategory, setActiveCategory] = useState('all');


    const { data: dbArticles = [] } = useQuery({
        queryKey: ['articles'],
        queryFn: async () => {
            try {
                const data = await db.entities.KnowledgeArticle.list('-created_date', 50);
                return data as unknown as Article[];
            } catch (e) {
                console.error("Failed to fetch articles", e);
                return [];
            }
        },
        initialData: [],
    });

    // Merge DB articles with Local fallback articles
    // Prefer DB articles if IDs collide (though they shouldn't)
    const articles = [...dbArticles, ...localArticles];

    // Filter articles
    const filteredArticles = articles.filter((article: any) => {
        const matchesSearch =
            article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = activeType === 'all' || article.type === activeType;
        const matchesCategory = activeCategory === 'all' || article.category === activeCategory;

        return matchesSearch && matchesType && matchesCategory;
    });

    const featuredArticles = articles.filter((a: any) => a.featured);
    const trendingArticles = [...articles].sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 4);

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
                            <h2 className="font-bold text-slate-800 dark:text-white">محتوى مميز</h2>
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
                            <h2 className="font-bold text-slate-800 dark:text-white">الأكثر مشاهدة</h2>
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
                            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">لا توجد نتائج</h3>
                            <p className="text-slate-400 dark:text-slate-500 text-sm">جرب تغيير معايير البحث</p>
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

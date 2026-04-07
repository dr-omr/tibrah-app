import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { db } from '@/lib/db';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, Sparkles, TrendingUp, PlayCircle, FileText, Brain, ChevronLeft, ArrowRight, Loader2, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { aiClient } from '@/components/ai/aiClient';
import { localArticles, Article } from '@/lib/articles';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import { createPageUrl } from '@/utils';
import ContentPlayer from '@/components/library/ContentPlayer';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const getStaticProps: GetStaticProps<{ initialArticles: Article[] }> = async () => {
    return { props: { initialArticles: localArticles } };
};

const CATEGORIES = [
    { id: 'all', label: 'الكل' },
    { id: 'functional', label: 'الطب الوظيفي' },
    { id: 'mental', label: 'الصحة النفسية' },
    { id: 'nutrition', label: 'التغذية العلاجية' },
    { id: 'lifestyle', label: 'نمط الحياة' }
];

export default function Library({ initialArticles }: InferGetStaticPropsType<typeof getStaticProps>) {
    const router = useRouter();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    
    // Player State
    const [playerConfig, setPlayerConfig] = useState<any>(null);
    
    // Dynamic Bookmarks (saved locally in user.settings.bookmarks)
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [userSettings, setUserSettings] = useState<any>({});
    
    useEffect(() => {
        const fetchSettings = async () => {
            if (user?.id) {
                const dbUser = await db.entities.User.get(user.id) as any;
                if (dbUser?.settings) {
                    setUserSettings(dbUser.settings);
                    if (dbUser.settings.bookmarks) {
                        setBookmarks(dbUser.settings.bookmarks);
                    }
                }
            }
        };
        fetchSettings();
    }, [user?.id]);

    const toggleBookmark = async (e: React.MouseEvent, articleId: string) => {
        e.preventDefault();
        e.stopPropagation();
        haptic.selection();
        
        if (!user) {
            toast.error('يجب تسجيل الدخول لحفظ المقالات');
            return;
        }

        const newBookmarks = bookmarks.includes(articleId) 
            ? bookmarks.filter(id => id !== articleId)
            : [...bookmarks, articleId];
            
        setBookmarks(newBookmarks);
        
        try {
            await db.entities.User.update(user.id, {
                settings: { ...userSettings, bookmarks: newBookmarks }
            });
            setUserSettings({ ...userSettings, bookmarks: newBookmarks });
            if (!bookmarks.includes(articleId)) {
                toast.success('تمت الإضافة إلى المراجع المحفوظة');
            }
        } catch (e) {
            toast.error('فشل حفظ التغييرات');
        }
    };
    
    // Handle Media Playback
    const playMedia = (e: React.MouseEvent, article: any) => {
        e.preventDefault();
        e.stopPropagation();
        haptic.selection();
        setPlayerConfig({
            title: article.title,
            subtitle: article.category || 'مكتبة طِبرَا',
            type: article.type === 'video' ? 'video' : 'audio',
            src: '#', // In a real app this would be article.media_url
            thumbnail: article.image_url
        });
    };
    
    // AI Semantic Search State
    const [aiAnswer, setAiAnswer] = useState<string | null>(null);
    const [isAiSearching, setIsAiSearching] = useState(false);
    
    // Header scroll effect
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const { data: dbArticles = [] } = useQuery({
        queryKey: ['articles'],
        queryFn: async () => {
            try { return await db.entities.KnowledgeArticle.list('-created_date', 50) as unknown as Article[]; } 
            catch { return []; }
        },
        initialData: [],
    });

    const articles = [...dbArticles, ...initialArticles];

    const filteredArticles = articles.filter((article: any) => {
        const matchesSearch =
            article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.summary?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const featuredArticles = articles.filter((a: any) => a.featured).slice(0, 5);
    const recentArticles = [...articles].sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 6);

    // Trigger AI semantic search when user pauses typing
    useEffect(() => {
        if (searchQuery.length < 5) {
            setAiAnswer(null);
            return;
        }
        
        const delaySearch = setTimeout(async () => {
            setIsAiSearching(true);
            try {
                // Simulate vector search / semantic DB query
                const result = await db.integrations.Core.InvokeLLM({
                    prompt: `أنت باحث طبي عيادي في مكتبة (طِبرَا). يبحث المستخدم عن: "${searchQuery}". 
                    بناءً على مبادئ الطب الوظيفي، قدم إجابة علمية مختصرة ومفيدة جداً (3-4 أسطر كحد أقصى) تجيب على سؤاله أو توضح المفهوم.`
                }) as any;
                setAiAnswer(result?.response || result?.answer);
                uiSounds.success();
            } catch {
                setAiAnswer(null);
            } finally {
                setIsAiSearching(false);
            }
        }, 1200);

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-teal-500/20 font-sans pb-24 overflow-x-hidden">
            <Head>
                <title>طِبرَا | المكتبة الطبية</title>
                <meta name="theme-color" content="#f8fafc" />
            </Head>

            {/* ═══ Header ═══ */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm py-3' : 'bg-transparent py-5'}`}>
                <div className="px-5 max-w-6xl mx-auto flex items-center justify-between">
                    <button onClick={() => { haptic.selection(); router.back(); }} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 shadow-sm">
                        <ArrowRight className="w-5 h-5 text-slate-600 rtl:-scale-x-100" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tight text-slate-800">طِبرَا</span>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-100 text-[10px] font-bold tracking-widest text-teal-700">LIBRARY</span>
                    </div>
                </div>
            </header>

            {/* ═══ Hero & Semantic Search ═══ */}
            <section className="relative pt-32 pb-12 px-5 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
                <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[80px] pointer-events-none -translate-x-1/2" />

                <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50">
                        <BookOpen className="w-8 h-8 text-teal-600" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight text-slate-900 tracking-tight">
                        اكتشف جذور <br className="md:hidden"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-600 to-emerald-500">العافية الحقيقية</span>
                    </h1>
                    <p className="text-slate-500 font-medium mb-10 max-w-md text-[15px] leading-relaxed">
                        مكتبة طبية متكاملة مدعومة بالذكاء الاصطناعي للإجابة على تساؤلاتك الطبية فوراً.
                    </p>

                    {/* AI Smart Search Bar */}
                    <div className="w-full max-w-xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-200 to-emerald-200 rounded-2xl blur-lg opacity-30 group-focus-within:opacity-50 transition-opacity duration-500" />
                        <div className="relative bg-white border border-slate-200 rounded-2xl p-2 flex items-center shadow-lg shadow-slate-200/50">
                            <Search className="w-5 h-5 text-teal-600 ml-3 shrink-0" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث أو اسأل... (مثال: ما فوائد المغنيسيوم؟)"
                                className="flex-1 bg-transparent border-0 text-slate-800 placeholder-slate-400 focus:ring-0 text-[15px] py-3 font-semibold"
                            />
                            {isAiSearching && <Loader2 className="w-5 h-5 text-teal-500 animate-spin shrink-0 ml-3" />}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ AI Generative Answer (Shows when searching) ═══ */}
            <AnimatePresence>
                {(isAiSearching || aiAnswer) && searchQuery.length >= 5 && (
                    <motion.section 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }} 
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="px-5 max-w-2xl mx-auto overflow-hidden"
                    >
                        <div className="bg-white border border-teal-100 rounded-3xl p-6 relative shadow-xl shadow-teal-100/50">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 blur-3xl rounded-full" />
                            <div className="flex items-center gap-2 mb-4 relative z-10">
                                <Brain className="w-5 h-5 text-teal-600" />
                                <h3 className="font-bold text-teal-900 text-sm">خلاصة المكتبة الذكية:</h3>
                            </div>
                            <div className="relative z-10">
                                {isAiSearching ? (
                                    <div className="space-y-3">
                                        <div className="h-3 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                                        <div className="h-3 bg-slate-100 rounded-full w-full animate-pulse" />
                                        <div className="h-3 bg-slate-100 rounded-full w-2/3 animate-pulse" />
                                    </div>
                                ) : (
                                    <p className="text-[15px] text-slate-700 leading-relaxed font-semibold">
                                        {aiAnswer}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* ═══ Main Content Area ═══ */}
            <main className="max-w-6xl mx-auto px-5 mt-10">
                {/* Visual Category Spills */}
                {!searchQuery && (
                    <div className="mb-12 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-4">
                        <div className="flex gap-3 min-w-max">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { haptic.selection(); setActiveCategory(cat.id); }}
                                    className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all border ${
                                        activeCategory === cat.id 
                                        ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20' 
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 shadow-sm'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══ Featured Hero Carousel (Netflix Style but Light/Premium) ═══ */}
                {!searchQuery && activeCategory === 'all' && (
                    <section className="mb-16">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <h2 className="text-xl font-black text-slate-800">قراءات مميزة</h2>
                        </div>
                        
                        <div className="flex overflow-x-auto hide-scrollbar gap-5 pb-8 -mx-5 px-5 snap-x snap-mandatory">
                            {featuredArticles.map((article: any, i) => (
                                <Link key={i} href={createPageUrl(`ArticleDetails?id=${article.id}`)} className="snap-center shrink-0 w-[85vw] md:w-[60vw] max-w-[500px]">
                                    <motion.div 
                                        whileTap={{ scale: 0.98 }}
                                        className="relative h-[400px] md:h-[450px] rounded-[32px] overflow-hidden group border border-slate-200 bg-white shadow-xl shadow-slate-200/50"
                                    >
                                        {article.image_url ? (
                                            <img src={article.image_url} alt={article.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                                        ) : (
                                            <div className="absolute inset-0 bg-slate-100" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                                        
                                        <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
                                            <div className="px-3 py-1 bg-white/95 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
                                                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">{article.category}</span>
                                            </div>
                                            <button 
                                                onClick={(e) => toggleBookmark(e, article.id)}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${
                                                    bookmarks.includes(article.id) 
                                                    ? 'bg-teal-500 text-white border-teal-500' 
                                                    : 'bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30'
                                                }`}
                                            >
                                                <Bookmark className={`w-4 h-4 ${bookmarks.includes(article.id) ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-6 left-6 right-6 z-10">
                                            <h3 className="text-2xl font-black text-white mb-3 leading-tight drop-shadow-md group-hover:text-teal-300 transition-colors">{article.title}</h3>
                                            <p className="text-[13px] text-white/90 font-medium line-clamp-2 mb-4 leading-relaxed">{article.summary}</p>
                                            
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={(e) => (article.type === 'video' || article.type === 'audio') && playMedia(e, article)}
                                                    className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/30 active:scale-95 transition-transform"
                                                >
                                                    <PlayCircle className="w-5 h-5 text-white ml-0.5" />
                                                </button>
                                                <span className="text-xs font-bold text-white uppercase tracking-widest">{article.type === 'video' ? 'شاهد الآن' : article.type === 'audio' ? 'استمع الآن' : 'اقرأ الآن'}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* ═══ Search Results & Grid ═══ */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-teal-600" />
                            <h2 className="text-xl font-black text-slate-800">
                                {searchQuery ? 'نتائج البحث' : activeCategory !== 'all' ? CATEGORIES.find(c => c.id === activeCategory)?.label : 'المُضاف حديثاً'}
                            </h2>
                        </div>
                        {(searchQuery || activeCategory !== 'all') && (
                            <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">{filteredArticles.length} مادة</span>
                        )}
                    </div>

                    {filteredArticles.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white border border-slate-200 shadow-sm rounded-3xl">
                            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-slate-800 mb-2">لا توجد نتائج</h3>
                            <p className="text-sm text-slate-500 font-medium">حاول البحث بكلمات مختلفة أو اسأل المكتبة الذكية أعلى الصفحة.</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredArticles.map((article: any, i: number) => (
                                <Link key={i} href={createPageUrl(`ArticleDetails?id=${article.id}`)}>
                                    <motion.div 
                                        whileHover={{ y: -4 }}
                                        className="bg-white border border-slate-200 hover:border-teal-200 rounded-3xl p-4 flex gap-4 transition-all group shadow-sm hover:shadow-xl hover:shadow-slate-200/50"
                                    >
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 relative">
                                            {article.image_url ? (
                                                <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-teal-50">
                                                    {article.type === 'video' ? <PlayCircle className="w-8 h-8 text-teal-300" /> : <FileText className="w-8 h-8 text-teal-300" />}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 uppercase tracking-wider">{article.category}</span>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-100">{article.read_time} د</span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-[13px] line-clamp-2 leading-snug mb-1.5 group-hover:text-teal-600 transition-colors">
                                                {article.title}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                                {article.summary}
                                            </p>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Global Content Player */}
            {playerConfig && (
                <ContentPlayer 
                    title={playerConfig.title}
                    subtitle={playerConfig.subtitle}
                    type={playerConfig.type}
                    src={playerConfig.src}
                    thumbnail={playerConfig.thumbnail}
                    onClose={() => setPlayerConfig(null)}
                />
            )}
        </div>
    );
}

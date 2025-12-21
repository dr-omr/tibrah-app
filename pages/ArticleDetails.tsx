import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { localArticles, Article } from '@/lib/articles';
import { createPageUrl } from '@/utils';
import {
    ArrowRight, Clock, Eye, Share2, Bookmark,
    Calendar, Tag, User, Facebook, Twitter, Linkedin
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import CommentSection from '@/components/library/CommentSection';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ArticleDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [article, setArticle] = useState<Article | null>(null);

    useEffect(() => {
        if (id) {
            const found = localArticles.find(a => a.id === id);
            setArticle(found || null);
        }
    }, [id]);

    if (!router.isReady || !article) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    const categoryLabels: Record<string, string> = {
        holistic: 'الطب الشمولي',
        emotional: 'الطب الشعوري',
        functional: 'الطب الوظيفي',
        orthomolecular: 'الأورثوموليكولار',
        energy: 'الطب الطاقي',
        herbal: 'طب الأعشاب',
        modern: 'الطب الحديث',
        traditional: 'الطب التقليدي',
        nutrition: 'التغذية الصحية',
        mental: 'الصحة النفسية',
        detox: 'الديتوكس',
        lifestyle: 'نمط الحياة',
        science: 'علوم وطب',
        supplements: 'المكملات'
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#2D9B83]/20">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 h-1 bg-[#2D9B83] z-50 transition-all duration-300 w-full origin-left" />

            {/* Navigation Bar */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href={createPageUrl('Library')}>
                        <Button variant="ghost" className="hover:bg-slate-100 rounded-full gap-2">
                            <ArrowRight className="w-5 h-5 text-slate-600" />
                            <span className="text-slate-600 font-medium">المكتبة</span>
                        </Button>
                    </Link>

                    <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-100">
                            <Bookmark className="w-5 h-5 text-slate-600" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-100">
                            <Share2 className="w-5 h-5 text-slate-600" />
                        </Button>
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                {/* Header Section */}
                <header className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium border-[#2D9B83] text-[#2D9B83] bg-[#2D9B83]/5 rounded-full">
                            {categoryLabels[article.category] || article.category}
                        </Badge>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{article.duration || '5 دقائق'}</span>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-6 font-display">
                        {article.title}
                    </h1>

                    <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
                        {article.summary}
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center justify-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                            <AvatarImage src="/doctor-avatar.jpg" /> {/* Dedicated Author Image if available */}
                            <AvatarFallback className="bg-[#2D9B83] text-white">د.ع</AvatarFallback>
                        </Avatar>
                        <div className="text-right">
                            <p className="font-bold text-slate-900 text-sm">{article.author || 'د. عمر العماد'}</p>
                            <p className="text-slate-500 text-xs flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {article.created_at || '2024'}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Hero Image */}
                <div className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl mb-12 group">
                    <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Main Content */}
                <div className="max-w-prose mx-auto">
                    {/* Social Share Sidebar (Desktop) */}
                    <div className="hidden lg:flex flex-col gap-4 fixed right-[calc(50%-440px)] top-1/3">
                        <Button size="icon" variant="outline" className="rounded-full shadow-sm hover:text-[#1877F2] hover:border-[#1877F2]">
                            <Facebook className="w-5 h-5" />
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-full shadow-sm hover:text-[#1DA1F2] hover:border-[#1DA1F2]">
                            <Twitter className="w-5 h-5" />
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-full shadow-sm hover:text-[#0A66C2] hover:border-[#0A66C2]">
                            <Linkedin className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="prose prose-lg prose-slate max-w-none 
                        prose-headings:font-bold prose-headings:text-slate-900 
                        prose-p:text-slate-700 prose-p:leading-8 
                        prose-a:text-[#2D9B83] prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-[#2D9B83] 
                        prose-blockquote:border-r-4 prose-blockquote:border-[#2D9B83] prose-blockquote:bg-white prose-blockquote:p-6 prose-blockquote:rounded-xl prose-blockquote:shadow-sm prose-blockquote:not-italic
                        prose-img:rounded-2xl prose-img:shadow-lg
                        bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100"
                    >
                        {/* Content Projection (Simplified for now as localArticles doesn't have full MD yet, so we generate it) */}
                        <ReactMarkdown>
                            {article.content || `
## نظرة عامة
${article.summary}

## التفاصيل العلمية
هذا المقال يستند إلى أحدث الأبحاث العلمية في مجال **${categoryLabels[article.category]}**. يهدف هذا النهج العلاجي إلى استعادة التوازن البيولوجي للجسم من خلال معالجة الأسباب الجذرية بدلاً من الاكتفاء بإدارة الأعراض.

### النقاط الرئيسية:
- فهم عميق لآليات الشفاء الذاتي.
- استخدام تقنيات مثبتة علمياً.
- التركيز على الفرد ككل متكامل (جسد، عقل، روح).

> "الطبيب الحقيقي هو الذي يعالج المريض وليس المرض." 

## التطبيق العملي
لتحقيق أقصى استفادة من هذه المعلومات، ننصح باتباع الخطوات التالية:
1. المراقبة الذاتية للأعراض.
2. التدرج في تطبيق التغييرات.
3. الاستمرارية والصبر.

## الخاتمة
تذكر دائماً أن رحلة الشفاء تبدأ بقرار واعي وقناعة داخلية بقدرة جسدك على التعافي.
                            `}
                        </ReactMarkdown>

                        {/* Interactive Elements could go here (Polls, Quizzes) */}
                    </div>

                    {/* Tags */}
                    {article.tags && (
                        <div className="mt-12 flex flex-wrap gap-2 justify-center">
                            {article.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 hover:bg-slate-200">
                                    # {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Author Bio Box */}
                <div className="max-w-3xl mx-auto mt-16 bg-white rounded-3xl p-8 border border-slate-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-right shadow-sm">
                    <Avatar className="w-24 h-24 border-4 border-[#FDFBF7]">
                        <AvatarImage src="/doctor-avatar.jpg" />
                        <AvatarFallback className="bg-[#2D9B83] text-white text-2xl">ع</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">عن الكاتب: {article.author}</h3>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            طبيب وباحث متخصص في الطب الشمولي والطب الوظيفي. يسعى لدمج حكمة الطب القديم مع تطور الطب الحديث لتقديم حلول صحية متكاملة.
                        </p>
                        <Button variant="outline" size="sm" className="rounded-full">
                            عرض كل المقالات
                        </Button>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="max-w-3xl mx-auto mt-12 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <CommentSection articleId={article.id} />
                </div>
            </article>
        </div>
    );
}

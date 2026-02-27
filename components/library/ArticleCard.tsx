import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '../../utils';
import { Clock, Eye, Play, FileText, BookOpen, Mic } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function ArticleCard({ article }: { article: any }) {
    const typeConfig = {
        article: { icon: FileText, label: 'مقال', color: 'bg-blue-500' },
        video: { icon: Play, label: 'فيديو', color: 'bg-red-500' },
        study: { icon: BookOpen, label: 'دراسة', color: 'bg-purple-500' },
        podcast: { icon: Mic, label: 'بودكاست', color: 'bg-orange-500' },
    };

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

    const config = typeConfig[article.type] || typeConfig.article;
    const Icon = config.icon;

    return (
        <Link href={createPageUrl(`ArticleDetails?id=${article.id}`)}>
            <div className="glass rounded-2xl overflow-hidden hover:shadow-glow transition-all duration-300 group">
                {/* Image */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                    {article.image_url ? (
                        <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Icon className="w-12 h-12 text-slate-300" />
                        </div>
                    )}

                    {/* Type Badge */}
                    <div className={`absolute top-3 right-3 ${config.color} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                    </div>

                    {/* Play Button for Videos */}
                    {article.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="w-6 h-6 text-red-500 mr-[-2px]" fill="currentColor" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <Badge variant="outline" className="text-[10px] mb-2 border-[#2D9B83] text-[#2D9B83]">
                        {categoryLabels[article.category]}
                    </Badge>

                    <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-[#2D9B83] transition-colors">
                        {article.title}
                    </h3>

                    {article.summary && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{article.summary}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.duration_minutes || 5} دقائق</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.views || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
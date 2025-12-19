import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, ShoppingBag, Music, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSmartRecommendations, Recommendation } from '@/lib/recommendations';

export default function SmartRecommendations() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecs = async () => {
        setLoading(true);
        // Simulate network delay for "AI thinking" effect
        setTimeout(async () => {
            const data = await getSmartRecommendations();
            setRecommendations(data);
            setLoading(false);
        }, 800);
    };

    useEffect(() => {
        fetchRecs();
    }, []);

    if (loading) {
        return (
            <div className="glass rounded-3xl p-6 min-h-[200px] flex flex-col items-center justify-center space-y-3">
                <Sparkles className="w-8 h-8 text-[#D4AF37] animate-pulse" />
                <p className="text-sm text-slate-500 animate-pulse">جاري تحليل بياناتك الصحية وتجهيز التوصيات...</p>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return null; // Don't show if no relevant suggestions
    }

    // Only show top 2
    const topRecs = recommendations.slice(0, 2);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                    <h2 className="text-lg font-bold text-slate-800">مختار لك اليوم</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchRecs} className="text-slate-400">
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topRecs.map((rec, idx) => (
                    <div
                        key={rec.id}
                        className="glass p-0 rounded-2xl overflow-hidden group hover:shadow-glow transition-all duration-500 relative"
                    >
                        {/* Type Indicator */}
                        <div className="absolute top-3 left-3 z-10">
                            <span className={`
                                px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-md
                                ${rec.type === 'product' ? 'bg-rose-100/80 text-rose-600' :
                                    rec.type === 'frequency' ? 'bg-indigo-100/80 text-indigo-600' : 'bg-cyan-100/80 text-cyan-600'}
                            `}>
                                {rec.type === 'product' && <ShoppingBag className="w-3 h-3" />}
                                {rec.type === 'frequency' && <Music className="w-3 h-3" />}
                                {rec.type === 'article' && <BookOpen className="w-3 h-3" />}
                                {rec.type === 'product' ? 'منتج' : rec.type === 'frequency' ? 'تردد' : 'مقال'}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex gap-4 relative z-10">
                            {/* Icon/Image */}
                            <div className="w-16 h-16 rounded-xl bg-slate-50 flex-shrink-0 overflow-hidden flex items-center justify-center border border-slate-100">
                                {rec.image ? (
                                    <img src={rec.image} alt={rec.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Sparkles className="w-6 h-6 text-slate-300" />
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-xs text-[#2D9B83] font-medium mb-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D9B83]" />
                                    {rec.reason}
                                </p>
                                <h3 className="font-bold text-slate-800 mb-1">{rec.title}</h3>
                                <p className="text-sm text-slate-500 leading-snug mb-3">{rec.subtitle}</p>

                                <Link href={rec.actionLink}>
                                    <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-lg">
                                        {rec.actionLabel}
                                        <ArrowRight className="w-4 h-4 mr-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Background Gradient */}
                        <div className={`
                            absolute inset-0 opacity-10 pointer-events-none transition-opacity group-hover:opacity-20
                            bg-gradient-to-br
                            ${rec.type === 'product' ? 'from-rose-500 to-pink-600' :
                                rec.type === 'frequency' ? 'from-indigo-500 to-purple-600' : 'from-cyan-500 to-blue-600'}
                        `} />
                    </div>
                ))}
            </div>
        </div>
    );
}

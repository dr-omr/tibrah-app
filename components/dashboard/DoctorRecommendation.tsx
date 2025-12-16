import React from 'react';
import {
    Lightbulb, CheckCircle2, Circle, Clock,
    Salad, Pill, Moon, Dumbbell, Sparkles, ArrowLeft
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DoctorRecommendations({ recommendations = [] }) {
    const sampleRecommendations = recommendations.length > 0 ? recommendations : [
        {
            id: 1,
            title: 'زيادة جرعة فيتامين د',
            description: 'تناول ٥٠٠٠ وحدة يومياً مع وجبة دهنية',
            category: 'supplement',
            priority: 'high',
            status: 'in_progress'
        },
        {
            id: 2,
            title: 'تقليل الكربوهيدرات المكررة',
            description: 'استبدال الخبز الأبيض بخبز الحبوب الكاملة',
            category: 'nutrition',
            priority: 'high',
            status: 'pending'
        },
        {
            id: 3,
            title: 'تحسين جودة النوم',
            description: 'النوم قبل الـ ١١ مساءً وإيقاف الشاشات',
            category: 'sleep',
            priority: 'medium',
            status: 'in_progress'
        },
        {
            id: 4,
            title: 'المشي ٣٠ دقيقة يومياً',
            description: 'المشي السريع في الهواء الطلق',
            category: 'exercise',
            priority: 'medium',
            status: 'completed'
        },
    ];

    const categoryConfig = {
        nutrition: { icon: Salad, color: 'from-green-500 to-emerald-500', label: 'تغذية' },
        supplement: { icon: Pill, color: 'from-purple-500 to-pink-500', label: 'مكمل' },
        sleep: { icon: Moon, color: 'from-indigo-500 to-blue-500', label: 'نوم' },
        exercise: { icon: Dumbbell, color: 'from-orange-500 to-red-500', label: 'رياضة' },
        lifestyle: { icon: Sparkles, color: 'from-cyan-500 to-teal-500', label: 'نمط حياة' },
        detox: { icon: Sparkles, color: 'from-amber-500 to-orange-500', label: 'ديتوكس' },
        frequency: { icon: Sparkles, color: 'from-violet-500 to-purple-500', label: 'ترددات' },
        followup: { icon: Clock, color: 'from-slate-500 to-slate-600', label: 'متابعة' },
    };

    const priorityConfig = {
        high: { color: 'bg-red-100 text-red-700', label: 'عالية' },
        medium: { color: 'bg-amber-100 text-amber-700', label: 'متوسطة' },
        low: { color: 'bg-blue-100 text-blue-700', label: 'منخفضة' },
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'in_progress':
                return <Clock className="w-5 h-5 text-amber-500" />;
            default:
                return <Circle className="w-5 h-5 text-slate-300" />;
        }
    };

    return (
        <div className="glass rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">توصيات الطبيب</h3>
                        <p className="text-sm text-slate-500">{sampleRecommendations.length} توصية نشطة</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[#2D9B83]">
                    عرض الكل
                    <ArrowLeft className="w-4 h-4 mr-1" />
                </Button>
            </div>

            <div className="space-y-3">
                {sampleRecommendations.map((rec) => {
                    const catConfig = categoryConfig[rec.category] || categoryConfig.lifestyle;
                    const Icon = catConfig.icon;
                    const priConfig = priorityConfig[rec.priority];

                    return (
                        <div
                            key={rec.id}
                            className={`bg-white/50 rounded-2xl p-4 border border-slate-100 transition-all duration-300 ${rec.status === 'completed' ? 'opacity-60' : 'hover:shadow-md'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <button className="mt-0.5">
                                    {getStatusIcon(rec.status)}
                                </button>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`font-semibold ${rec.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                            {rec.title}
                                        </h4>
                                        <Badge className={`${priConfig.color} border-0 text-[10px]`}>
                                            {priConfig.label}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-2">{rec.description}</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${catConfig.color} flex items-center justify-center`}>
                                            <Icon className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-xs text-slate-500">{catConfig.label}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
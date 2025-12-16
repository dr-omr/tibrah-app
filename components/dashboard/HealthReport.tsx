import React from 'react';
import {
    TrendingUp, TrendingDown, Minus, Heart, Brain,
    Droplets, Zap, Activity, ArrowLeft, AlertCircle
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function HealthReport({ userHealth }) {
    const vitalityScore = userHealth?.vitality_score || 65;
    const progressPercentage = userHealth?.progress_percentage || 45;
    const journeyStage = userHealth?.journey_stage || 'initial';

    const stageLabels = {
        initial: { label: 'المرحلة الأولى', desc: 'التقييم والتشخيص', color: 'bg-blue-500' },
        testing: { label: 'مرحلة الفحوصات', desc: 'جمع البيانات', color: 'bg-purple-500' },
        detox: { label: 'مرحلة الديتوكس', desc: 'تنظيف الجسم', color: 'bg-orange-500' },
        healing: { label: 'مرحلة الشفاء', desc: 'إعادة البناء', color: 'bg-[#2D9B83]' },
        maintenance: { label: 'مرحلة الاستمرارية', desc: 'الحفاظ على الصحة', color: 'bg-green-500' },
    };

    const healthIndicators = [
        {
            name: 'صحة الكبد',
            icon: Droplets,
            score: 72,
            trend: 'up',
            color: 'from-emerald-500 to-teal-500'
        },
        {
            name: 'صحة الأمعاء',
            icon: Activity,
            score: 58,
            trend: 'up',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            name: 'الطاقة',
            icon: Zap,
            score: 65,
            trend: 'stable',
            color: 'from-amber-500 to-orange-500'
        },
        {
            name: 'التركيز',
            icon: Brain,
            score: 70,
            trend: 'down',
            color: 'from-purple-500 to-pink-500'
        },
    ];

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
            default: return <Minus className="w-4 h-4 text-slate-400" />;
        }
    };

    const currentStage = stageLabels[journeyStage];

    return (
        <div className="glass rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">التقرير الصحي</h3>
                        <p className="text-sm text-slate-500">ملخص حالتك الصحية</p>
                    </div>
                </div>
                <Badge className={`${currentStage.color} text-white border-0`}>
                    {currentStage.label}
                </Badge>
            </div>

            {/* Main Score Card */}
            <div className="bg-gradient-to-br from-[#2D9B83]/10 to-[#3FB39A]/10 rounded-2xl p-4 mb-5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-600 font-medium">مؤشر الصحة العامة</span>
                    <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">+٥٪ هذا الأسبوع</span>
                    </div>
                </div>
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-bold text-[#2D9B83]">{vitalityScore}</span>
                    <span className="text-slate-500 text-lg mb-2">/ ١٠٠</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                    <div
                        className="h-full gradient-primary rounded-full transition-all duration-1000"
                        style={{ width: `${vitalityScore}%` }}
                    />
                </div>
            </div>

            {/* Health Indicators Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                {healthIndicators.map((indicator, index) => {
                    const Icon = indicator.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white/50 rounded-2xl p-3 border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${indicator.color} flex items-center justify-center`}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                {getTrendIcon(indicator.trend)}
                            </div>
                            <p className="text-xs text-slate-500 mb-1">{indicator.name}</p>
                            <p className="text-xl font-bold text-slate-800">{indicator.score}%</p>
                        </div>
                    );
                })}
            </div>

            {/* Stage Description */}
            <div className="bg-amber-50 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                    <p className="font-semibold text-amber-800 mb-1">{currentStage.desc}</p>
                    <p className="text-sm text-amber-700">
                        تقدمك في هذه المرحلة: {progressPercentage}%
                    </p>
                </div>
            </div>
        </div>
    );
}
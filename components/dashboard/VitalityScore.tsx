import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';

export default function VitalityScore({ score = 65 }) {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getScoreColor = (score) => {
        if (score >= 80) return '#2D9B83';
        if (score >= 60) return '#3FB39A';
        if (score >= 40) return '#FFD700';
        return '#EF4444';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'ممتاز';
        if (score >= 60) return 'جيد';
        if (score >= 40) return 'متوسط';
        return 'يحتاج تحسين';
    };

    return (
        <div className="glass rounded-3xl p-6 shadow-glow">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#2D9B83]" />
                    <h3 className="font-bold text-slate-800">مؤشر الحيوية</h3>
                </div>
                <div className="flex items-center gap-1 text-green-500 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+٥٪</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Circular Progress */}
                <div className="relative w-28 h-28">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="56"
                            cy="56"
                            r="45"
                            fill="none"
                            stroke="#E2E8F0"
                            strokeWidth="8"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="56"
                            cy="56"
                            r="45"
                            fill="none"
                            stroke={getScoreColor(score)}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-slate-800">{score}</span>
                        <span className="text-xs text-slate-500">من ١٠٠</span>
                    </div>
                </div>

                {/* Score Details */}
                <div className="flex-1">
                    <div
                        className="text-xl font-bold mb-2"
                        style={{ color: getScoreColor(score) }}
                    >
                        {getScoreLabel(score)}
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        يعكس هذا المؤشر صحتك العامة بناءً على تحليل شامل لجميع مؤشراتك الحيوية.
                    </p>
                </div>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-100">
                <div className="text-center">
                    <div className="text-lg font-bold text-[#2D9B83]">٧٢</div>
                    <div className="text-xs text-slate-500">الطاقة</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-[#D4AF37]">٥٨</div>
                    <div className="text-xs text-slate-500">المناعة</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-purple-500">٦٥</div>
                    <div className="text-xs text-slate-500">التوازن</div>
                </div>
            </div>
        </div>
    );
}
import React, { useState, useMemo } from 'react';
import { X, AlertCircle, CheckCircle2, Info, Activity, Heart, Brain, Zap, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Default organs data if not provided
const defaultOrgans = [
    { id: 'brain', name: 'الدماغ', nameEn: 'Brain', x: 50, y: 8, status: 'healthy', score: 85, description: 'مركز التحكم في الجسم', tips: ['النوم الكافي', 'التأمل', 'تمارين ذهنية'], frequencies: ['285 Hz', '396 Hz'] },
    { id: 'heart', name: 'القلب', nameEn: 'Heart', x: 55, y: 32, status: 'healthy', score: 78, description: 'مضخة الحياة', tips: ['المشي يومياً', 'تقليل الملح', 'الدهون الصحية'], frequencies: ['528 Hz', '639 Hz'] },
    { id: 'lungs', name: 'الرئتين', nameEn: 'Lungs', x: 45, y: 30, status: 'attention', score: 62, description: 'جهاز التنفس', tips: ['تمارين التنفس', 'تجنب التدخين', 'الهواء النقي'], frequencies: ['417 Hz'] },
    { id: 'liver', name: 'الكبد', nameEn: 'Liver', x: 40, y: 42, status: 'attention', score: 55, description: 'مصنع الجسم للتنقية', tips: ['شرب الماء', 'تقليل السكر', 'ديتوكس شهري'], frequencies: ['528 Hz', '741 Hz'] },
    { id: 'stomach', name: 'المعدة', nameEn: 'Stomach', x: 50, y: 48, status: 'healthy', score: 72, description: 'مركز الهضم', tips: ['الأكل ببطء', 'تقليل التوتر', 'البروبيوتيك'], frequencies: ['174 Hz', '285 Hz'] },
    { id: 'kidneys', name: 'الكلى', nameEn: 'Kidneys', x: 50, y: 55, status: 'healthy', score: 80, description: 'نظام الترشيح', tips: ['شرب الماء', 'تقليل الصوديوم', 'الفواكه'], frequencies: ['639 Hz'] },
    { id: 'intestines', name: 'الأمعاء', nameEn: 'Intestines', x: 50, y: 65, status: 'attention', score: 58, description: 'الدماغ الثاني', tips: ['الألياف', 'البروبيوتيك', 'تقليل السكر'], frequencies: ['174 Hz', '396 Hz'] },
];

export default function InteractiveBodyMap({
    userHealth,
    organs = defaultOrgans,
    onOrganSelect,
    onFrequencySelect,
    showFrequencies = true,
    interactive = true
}) {
    const [selectedOrgan, setSelectedOrgan] = useState(null);
    const [hoveredOrgan, setHoveredOrgan] = useState(null);

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return '#2D9B83';
            case 'attention': return '#D4AF37';
            case 'critical': return '#EF4444';
            default: return '#94A3B8';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'healthy': return 'bg-emerald-50';
            case 'attention': return 'bg-amber-50';
            case 'critical': return 'bg-red-50';
            default: return 'bg-slate-50';
        }
    };

    const getStatusIcon = (status) => {
        return status === 'healthy' ? CheckCircle2 : AlertCircle;
    };

    const handleOrganClick = (organ) => {
        if (!interactive) return;
        setSelectedOrgan(organ);
        onOrganSelect?.(organ);
    };

    // Calculate overall health score
    const overallScore = useMemo(() => {
        if (!organs.length) return 0;
        return Math.round(organs.reduce((acc, org) => acc + org.score, 0) / organs.length);
    }, [organs]);

    const attentionCount = organs.filter(o => o.status === 'attention' || o.status === 'critical').length;

    return (
        <div className="glass rounded-3xl p-6">
            {/* Header with overall stats */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#2D9B83]" />
                        خريطة الجسم التفاعلية
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">اضغط على أي عضو لمعرفة تفاصيله</p>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-[#2D9B83]">{overallScore}%</div>
                    <span className="text-xs text-slate-500">الصحة العامة</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs mb-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#2D9B83]" />
                    <span className="text-slate-600">سليم</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
                    <span className="text-slate-600">يحتاج اهتمام</span>
                </div>
                {attentionCount > 0 && (
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                        {attentionCount} يحتاج متابعة
                    </Badge>
                )}
            </div>

            {/* Interactive Body SVG */}
            <div className="relative aspect-[1/1.8] max-w-[220px] mx-auto">
                {/* Body outline SVG */}
                <svg viewBox="0 0 100 180" className="w-full h-full">
                    {/* Head */}
                    <ellipse cx="50" cy="12" rx="12" ry="12" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" />
                    {/* Neck */}
                    <rect x="46" y="23" width="8" height="8" fill="#F3F4F6" />
                    {/* Torso */}
                    <path d="M30 31 Q30 80 35 90 L35 110 L65 110 L65 90 Q70 80 70 31 L50 26 Z" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" />
                    {/* Arms */}
                    <path d="M30 35 Q15 45 12 75" fill="none" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round" />
                    <path d="M70 35 Q85 45 88 75" fill="none" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round" />
                    {/* Legs */}
                    <path d="M40 110 L38 160" fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round" />
                    <path d="M60 110 L62 160" fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round" />
                </svg>

                {/* Organ hotspots */}
                {organs.map((organ) => (
                    <button
                        key={organ.id}
                        onClick={() => handleOrganClick(organ)}
                        onMouseEnter={() => setHoveredOrgan(organ.id)}
                        onMouseLeave={() => setHoveredOrgan(null)}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 focus:outline-none ${interactive ? 'hover:scale-125 focus:scale-125 cursor-pointer' : 'cursor-default'
                            }`}
                        style={{
                            left: `${organ.x}%`,
                            top: `${organ.y}%`,
                        }}
                        disabled={!interactive}
                    >
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all ${organ.status === 'healthy' ? 'bg-[#2D9B83]' : 'bg-[#D4AF37] animate-pulse'
                                } ${hoveredOrgan === organ.id ? 'ring-4 ring-offset-2 ring-[#2D9B83]/20 scale-125' : ''}`}
                        >
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        </div>
                        <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap transition-all ${hoveredOrgan === organ.id ? 'text-[#2D9B83] font-bold' : 'text-slate-500'
                            }`}>
                            {organ.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Organ Detail Dialog */}
            <Dialog open={!!selectedOrgan} onOpenChange={() => setSelectedOrgan(null)}>
                <DialogContent className="rounded-3xl max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            {selectedOrgan && (
                                <>
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusBg(selectedOrgan.status)}`}
                                    >
                                        {React.createElement(getStatusIcon(selectedOrgan.status), {
                                            className: "w-6 h-6",
                                            style: { color: getStatusColor(selectedOrgan.status) }
                                        })}
                                    </div>
                                    <div>
                                        <span className="block text-lg">{selectedOrgan.name}</span>
                                        <span className="text-sm font-normal text-slate-400">{selectedOrgan.nameEn}</span>
                                    </div>
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrgan && (
                        <div className="py-4 space-y-5">
                            {/* Score Circle */}
                            <div className={`text-center p-5 rounded-2xl ${getStatusBg(selectedOrgan.status)}`}>
                                <div className="text-5xl font-bold" style={{ color: getStatusColor(selectedOrgan.status) }}>
                                    {selectedOrgan.score}%
                                </div>
                                <p className="text-sm text-slate-500 mt-2">مستوى الصحة</p>
                            </div>

                            {/* Description */}
                            <div className="glass p-4 rounded-xl">
                                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-[#2D9B83]" />
                                    الوظيفة
                                </h4>
                                <p className="text-slate-600 text-sm">{selectedOrgan.description}</p>
                            </div>

                            {/* Tips */}
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    نصائح للتحسين
                                </h4>
                                <div className="space-y-2">
                                    {selectedOrgan.tips.map((tip, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                                            <div className="w-2 h-2 rounded-full bg-[#2D9B83]" />
                                            {tip}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Frequencies */}
                            {showFrequencies && selectedOrgan.frequencies && (
                                <div>
                                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-purple-500" />
                                        الترددات العلاجية المقترحة
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedOrgan.frequencies.map((freq, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onFrequencySelect?.(freq, selectedOrgan)}
                                                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                            >
                                                {freq}
                                                <ChevronRight className="w-3 h-3 mr-1" />
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button
                                className="w-full gradient-primary text-white rounded-xl h-12"
                                onClick={() => onFrequencySelect?.(selectedOrgan.frequencies?.[0], selectedOrgan)}
                            >
                                <Heart className="w-5 h-5 ml-2" />
                                استكشف ترددات الشفاء
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
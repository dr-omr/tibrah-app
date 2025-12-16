import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const organs = [
    { id: 'brain', name: 'الدماغ', nameEn: 'Brain', x: 50, y: 8, status: 'healthy', score: 85, description: 'مركز التحكم في الجسم', tips: ['النوم الكافي', 'التأمل', 'تمارين ذهنية'] },
    { id: 'heart', name: 'القلب', nameEn: 'Heart', x: 55, y: 32, status: 'healthy', score: 78, description: 'مضخة الحياة', tips: ['المشي يومياً', 'تقليل الملح', 'الدهون الصحية'] },
    { id: 'lungs', name: 'الرئتين', nameEn: 'Lungs', x: 45, y: 30, status: 'attention', score: 62, description: 'جهاز التنفس', tips: ['تمارين التنفس', 'تجنب التدخين', 'الهواء النقي'] },
    { id: 'liver', name: 'الكبد', nameEn: 'Liver', x: 40, y: 42, status: 'attention', score: 55, description: 'مصنع الجسم للتنقية', tips: ['شرب الماء', 'تقليل السكر', 'ديتوكس شهري'] },
    { id: 'stomach', name: 'المعدة', nameEn: 'Stomach', x: 50, y: 48, status: 'healthy', score: 72, description: 'مركز الهضم', tips: ['الأكل ببطء', 'تقليل التوتر', 'البروبيوتيك'] },
    { id: 'kidneys', name: 'الكلى', nameEn: 'Kidneys', x: 50, y: 55, status: 'healthy', score: 80, description: 'نظام الترشيح', tips: ['شرب الماء', 'تقليل الصوديوم', 'الفواكه'] },
    { id: 'intestines', name: 'الأمعاء', nameEn: 'Intestines', x: 50, y: 65, status: 'attention', score: 58, description: 'الدماغ الثاني', tips: ['الألياف', 'البروبيوتيك', 'تقليل السكر'] },
];

export default function BodyMap({ userHealth }) {
    const [selectedOrgan, setSelectedOrgan] = useState(null);

    const getStatusColor = (status) => {
        return status === 'healthy' ? '#2D9B83' : '#D4AF37';
    };

    const getStatusIcon = (status) => {
        return status === 'healthy' ? CheckCircle2 : AlertCircle;
    };

    return (
        <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">خريطة الجسم</h3>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-[#2D9B83]" />
                        <span className="text-slate-500">سليم</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
                        <span className="text-slate-500">يحتاج اهتمام</span>
                    </div>
                </div>
            </div>

            {/* Body SVG */}
            <div className="relative aspect-[1/1.8] max-w-[200px] mx-auto">
                {/* Body outline */}
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
                        onClick={() => setSelectedOrgan(organ)}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 focus:scale-125 focus:outline-none"
                        style={{
                            left: `${organ.x}%`,
                            top: `${organ.y}%`,
                        }}
                    >
                        <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${organ.status === 'healthy' ? 'bg-[#2D9B83]' : 'bg-[#D4AF37] animate-pulse'
                                }`}
                        >
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 whitespace-nowrap">
                            {organ.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Organ Detail Dialog */}
            <Dialog open={!!selectedOrgan} onOpenChange={() => setSelectedOrgan(null)}>
                <DialogContent className="rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            {selectedOrgan && (
                                <>
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${getStatusColor(selectedOrgan.status)}20` }}
                                    >
                                        {React.createElement(getStatusIcon(selectedOrgan.status), {
                                            className: "w-5 h-5",
                                            style: { color: getStatusColor(selectedOrgan.status) }
                                        })}
                                    </div>
                                    <div>
                                        <span className="block">{selectedOrgan.name}</span>
                                        <span className="text-sm font-normal text-slate-400">{selectedOrgan.nameEn}</span>
                                    </div>
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrgan && (
                        <div className="py-4 space-y-4">
                            {/* Score */}
                            <div className="text-center p-4 rounded-2xl bg-slate-50">
                                <div className="text-4xl font-bold" style={{ color: getStatusColor(selectedOrgan.status) }}>
                                    {selectedOrgan.score}%
                                </div>
                                <p className="text-sm text-slate-500 mt-1">مستوى الصحة</p>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    الوظيفة
                                </h4>
                                <p className="text-slate-600">{selectedOrgan.description}</p>
                            </div>

                            {/* Tips */}
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2">نصائح للتحسين</h4>
                                <div className="space-y-2">
                                    {selectedOrgan.tips.map((tip, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className="w-2 h-2 rounded-full bg-[#2D9B83]" />
                                            {tip}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button className="w-full gradient-primary text-white rounded-xl">
                                استكشف ترددات الشفاء
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
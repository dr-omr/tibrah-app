import React from 'react';
import { Check, X, Leaf, Pill, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { createPageUrl } from '../../utils';
import { Button } from "@/components/ui/button";

export default function ComparisonTable() {
    const comparisons = [
        { feature: 'علاج السبب الجذري', tibrah: true, traditional: false },
        { feature: 'بدون آثار جانبية', tibrah: true, traditional: false },
        { feature: 'علاج شامل للجسم', tibrah: true, traditional: false },
        { feature: 'تحسين نمط الحياة', tibrah: true, traditional: false },
        { feature: 'متابعة مستمرة', tibrah: true, traditional: false },
        { feature: 'نتائج دائمة', tibrah: true, traditional: false },
    ];

    return (
        <section className="px-6 py-8 pb-32">
            {/* Section Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-sm font-medium text-slate-600">لماذا نحن مختلفون؟</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">لماذا طِبرَا؟</h2>
                <p className="text-slate-500">الفرق بين العلاج الجذري والتقليدي</p>
            </div>

            {/* Comparison Card */}
            <div className="glass rounded-3xl overflow-hidden shadow-xl">
                {/* Header */}
                <div className="grid grid-cols-3 gap-2 p-4 bg-gradient-to-r from-slate-50 to-slate-100">
                    <div className="text-sm font-medium text-slate-500">المقارنة</div>
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-xl shadow-md">
                            <Leaf className="w-4 h-4" />
                            <span className="text-sm font-bold">طِبرَا</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-slate-200 text-slate-600 px-4 py-2 rounded-xl">
                            <Pill className="w-4 h-4" />
                            <span className="text-sm font-medium">التقليدي</span>
                        </div>
                    </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-100">
                    {comparisons.map((item, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-3 gap-2 p-4 items-center hover:bg-gradient-to-r hover:from-[#2D9B83]/5 hover:to-transparent transition-colors"
                        >
                            <div className="text-sm text-slate-700 font-medium">{item.feature}</div>
                            <div className="flex justify-center">
                                {item.tibrah ? (
                                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-md">
                                        <Check className="w-5 h-5 text-white" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <X className="w-5 h-5 text-red-500" />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-center">
                                {item.traditional ? (
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <Check className="w-5 h-5 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <X className="w-5 h-5 text-red-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="p-5 bg-gradient-to-r from-[#2D9B83]/5 to-[#3FB39A]/5">
                    <Link href={createPageUrl('BookAppointment')}>
                        <Button className="w-full gradient-primary text-white rounded-xl h-14 text-lg font-bold shadow-lg group">
                            ابدأ رحلة الشفاء الآن
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-6 text-center">
                <p className="text-sm text-slate-400">
                    انضم لأكثر من <span className="text-[#2D9B83] font-bold">٥٠٠٠+</span> مريض استعادوا صحتهم
                </p>
            </div>
        </section>
    );
}
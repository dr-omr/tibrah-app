import React from 'react';
import { createPageUrl } from '../../utils';
import { Check, Crown, Zap, Flame, ArrowLeft, Sparkles, Gift } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProgramRecommendation from '@/components/assessment/ProgramRecommendation';

export default function HealthPrograms() {
    const programs = [
        {
            id: 'weekly',
            title: 'البرنامج الأسبوعي',
            subtitle: 'بداية رحلتك',
            duration: '٧ أيام',
            price: '٢٩٩',
            icon: Zap,
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-500/10 to-cyan-500/10',
            features: [
                'خطة غذائية مبسطة',
                'بروتوكول ديتوكس خفيف',
                'ترددات شفائية يومية',
                'متابعة يومية',
            ],
        },
        {
            id: '21_days',
            title: 'برنامج ٢١ يوم',
            subtitle: 'التحول الحقيقي',
            duration: '٢١ يوم',
            price: '٧٩٩',
            icon: Crown,
            gradient: 'from-[#2D9B83] to-[#3FB39A]',
            bgGradient: 'from-[#2D9B83]/10 to-[#3FB39A]/10',
            featured: true,
            trial: true,
            features: [
                'تحليل شامل للحالة',
                'بروتوكول ديتوكس متكامل',
                'مكملات غذائية مخصصة',
                'ترددات علاجية يومية',
                'متابعة مستمرة ٢٤/٧',
                'جلسة أسبوعية مع الطبيب',
            ],
        },
        {
            id: '3_months',
            title: 'التحول الشامل',
            subtitle: 'إعادة بناء صحتك',
            duration: '٣ أشهر',
            price: '١٩٩٩',
            icon: Flame,
            gradient: 'from-[#D4AF37] to-[#F4D03F]',
            bgGradient: 'from-[#D4AF37]/10 to-[#F4D03F]/10',
            features: [
                'كل مميزات برنامج ٢١ يوم',
                'تحاليل دورية شاملة',
                'علاج الأسباب الجذرية',
                'إعادة توازن الجسم',
                'دعم نفسي وروحي',
                'ضمان النتائج',
            ],
        },
    ];

    return (
        <section className="px-6 py-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">برامجنا العلاجية</h2>
                    <p className="text-slate-500">اختار الطريق اللي يناسبك للشفاء</p>
                </div>
                <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#D4AF37]" />
                    <Badge className="gradient-gold text-white border-0 text-xs shadow-md">
                        جرب ٣ أيام واحكم بنفسك
                    </Badge>
                </div>
            </div>

            {/* AI Recommendation Button */}
            <div className="mb-8">
                <ProgramRecommendation />
            </div>

            {/* Programs Grid */}
            <div className="space-y-4">
                {programs.map((program) => {
                    const Icon = program.icon;
                    return (
                        <div
                            key={program.id}
                            className={`relative overflow-hidden rounded-3xl transition-all duration-500 ${program.featured
                                ? 'ring-2 ring-[#2D9B83] shadow-glow'
                                : ''
                                }`}
                        >
                            {/* Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${program.bgGradient}`} />

                            {/* Featured Badge */}
                            {program.featured && (
                                <div className={`absolute top-0 right-0 bg-gradient-to-r ${program.gradient} text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl`}>
                                    <span className="flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        الأكثر طلباً
                                    </span>
                                </div>
                            )}

                            <div className="relative glass backdrop-blur-sm p-5">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${program.gradient} flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-slate-800">{program.title}</h3>
                                            {program.trial && (
                                                <Badge variant="outline" className="text-[10px] border-[#2D9B83] text-[#2D9B83] bg-white">
                                                    تجربة مجانية
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 mb-4">{program.subtitle} • {program.duration}</p>

                                        {/* Features */}
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            {program.features.slice(0, program.featured ? 6 : 4).map((feature, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${program.gradient} flex items-center justify-center flex-shrink-0`}>
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-xs text-slate-600">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Price & CTA */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div>
                                                <span className="text-slate-400 text-xs">السعر</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-bold text-slate-800">{program.price}</span>
                                                    <span className="text-slate-500 text-sm">ر.س</span>
                                                </div>
                                            </div>

                                            <a
                                                href={`https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20الاشتراك%20في%20${encodeURIComponent(program.title)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button
                                                    className={`rounded-xl px-5 ${program.featured
                                                        ? `bg-gradient-to-r ${program.gradient} text-white hover:opacity-90 shadow-lg`
                                                        : 'bg-[#2D9B83] text-white hover:bg-[#248a73] shadow-md'
                                                        }`}
                                                >
                                                    {program.trial ? 'ابدأ التجربة' : 'المزيد'}
                                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
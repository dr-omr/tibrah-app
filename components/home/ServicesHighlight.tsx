import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '../../utils';
import { Stethoscope, Calendar, Radio, BookOpen, ArrowLeft, Gift, Sparkles } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function ServicesHighlight() {
    const services = [
        {
            icon: Stethoscope,
            title: 'الجلسة التشخيصية',
            description: 'اكتشف السبب الجذري',
            price: '25 ر.س',
            subPrice: '3,000 ر.ي',
            color: 'from-[#2D9B83] to-[#3FB39A]',
            page: 'BookAppointment',
        },
        {
            icon: Calendar,
            title: 'برامج المتابعة',
            description: '3 أيام تجربة مجانية',
            badge: 'مجاني',
            color: 'from-purple-500 to-pink-500',
            page: 'Services',
        },
        {
            icon: Radio,
            title: 'مكتبة الترددات',
            description: 'صيدلية الشفاء الرقمية',
            badge: 'مجانية',
            color: 'from-blue-500 to-cyan-500',
            page: 'Frequencies',
        },
        {
            icon: BookOpen,
            title: 'الدورات التعليمية',
            description: 'تعلم الطب الوظيفي',
            badge: 'جديد',
            isNew: true,
            color: 'from-amber-500 to-orange-500',
            page: 'Courses',
        },
    ];

    return (
        <section className="px-6 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">خدماتنا</h2>
                    <p className="text-sm text-slate-500">اختر ما يناسب رحلتك الصحية</p>
                </div>
                <Link href={createPageUrl('Services')} className="text-[#2D9B83] text-sm font-medium flex items-center gap-1">
                    المزيد
                    <ArrowLeft className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {services.map((service, index) => {
                    const Icon = service.icon;
                    return (
                        <Link
                            key={index}
                            href={createPageUrl(service.page)}
                            className="relative glass rounded-2xl p-4 hover:shadow-glow transition-all duration-300 group"
                        >
                            {service.isNew && (
                                <div className="absolute -top-2 -left-2">
                                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] px-2 shadow-lg">
                                        <Sparkles className="w-3 h-3 ml-1" />
                                        جديد
                                    </Badge>
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>

                            <h3 className="font-bold text-slate-800 mb-1">{service.title}</h3>
                            <p className="text-xs text-slate-500 mb-2">{service.description}</p>

                            {service.price ? (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-[#2D9B83]">{service.price}</span>
                                    <span className="text-xs text-slate-400">/ {service.subPrice}</span>
                                </div>
                            ) : service.badge ? (
                                <Badge variant="outline" className="border-[#2D9B83] text-[#2D9B83] text-xs">
                                    {service.badge}
                                </Badge>
                            ) : null}
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
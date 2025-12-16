import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '../../utils';
import {
    Stethoscope, Radio, GraduationCap, ShoppingBag, BookOpen,
    MessageCircle, Brain, Sparkles
} from 'lucide-react';

export default function QuickAccessGrid() {
    // الأقسام الأساسية فقط - مبسطة وواضحة
    const mainItems = [
        { icon: Stethoscope, label: 'خدماتنا', page: 'Services', color: 'from-[#2D9B83] to-[#3FB39A]', desc: 'الجلسات والبرامج' },
        { icon: Brain, label: 'الطب الشعوري', page: 'BodyMap', color: 'from-rose-500 to-red-500', desc: 'اكتشف سبب مرضك', badge: 'جديد' },
        { icon: Radio, label: 'الترددات', page: 'Frequencies', color: 'from-purple-500 to-indigo-500', desc: 'العلاج بالصوت' },
        { icon: GraduationCap, label: 'الدورات', page: 'Courses', color: 'from-amber-500 to-orange-500', desc: 'تعلم الطب الوظيفي' },
        { icon: ShoppingBag, label: 'المتجر', page: 'Shop', color: 'from-green-500 to-emerald-500', desc: 'مكملات ومنتجات' },
        { icon: BookOpen, label: 'المكتبة', page: 'Library', color: 'from-blue-500 to-cyan-500', desc: 'مقالات مجانية' },
    ];

    return (
        <section className="px-5 py-6">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-lg font-bold text-slate-800">أبسر ايش عندنا لك</h2>
            </div>

            {/* Main Grid - 2x3 */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                {mainItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={index}
                            href={createPageUrl(item.page)}
                            aria-label={item.label}
                            className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 active:scale-[0.98] transition-all"
                        >
                            {item.badge && (
                                <div className="absolute top-2 left-2 z-10">
                                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                                        {item.badge}
                                    </span>
                                </div>
                            )}

                            <div className="relative p-4">
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-2 shadow-md`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="font-semibold text-slate-800 text-sm">{item.label}</h4>
                                <p className="text-xs text-slate-400">{item.desc}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* WhatsApp CTA */}
            <a
                href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 shadow-md"
            >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">تواصل معي مباشرة</h4>
                    <p className="text-white/80 text-xs">أي سؤال في بالك؟ أنا موجود على الواتساب</p>
                </div>
                <span className="text-white text-lg">←</span>
            </a>
        </section>
    );
}
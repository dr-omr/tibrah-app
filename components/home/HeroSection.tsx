import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '../../utils';
import { MessageCircle, ChevronLeft, Award, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

const whatsappLink = "https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20حجز%20جلسة%20تشخيصية";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#2D9B83]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/15 rounded-full blur-3xl" />

            <div className="relative px-6 py-10">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <span className="text-white text-xl font-bold">ط</span>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-white block">طِبرَا</span>
                        <span className="text-xs text-[#D4AF37]">Tibrah Medical</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
                        عيادة الطب الوظيفي
                    </h1>
                    <p className="text-white/70 text-base mb-4">
                        نعالج السبب الجذري - لا الأعراض فقط
                    </p>

                    {/* Key Points */}
                    <div className="flex flex-col gap-2 items-center text-sm text-white/80 mb-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#2D9B83]" />
                            <span>جلسة تشخيصية شاملة ٤٥-٦٠ دقيقة</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#2D9B83]" />
                            <span>متابعة مباشرة عبر واتساب</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#2D9B83]" />
                            <span>٣ أيام تجربة مجانية للبرامج</span>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="max-w-xs mx-auto mb-8">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full gradient-primary rounded-2xl h-14 text-base font-bold shadow-lg group">
                            <MessageCircle className="w-5 h-5 ml-2" />
                            احجز جلستك الآن
                            <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                    </a>
                    <p className="text-center text-white/50 text-xs mt-2">
                        يبدأ من ٣٥٠ ر.س • أو ٣,٠٠٠ ر.ي
                    </p>
                </div>

                {/* Stats - Real Numbers */}
                <div className="flex items-center justify-center gap-6 text-center border-t border-white/10 pt-6">
                    <div>
                        <div className="text-xl font-bold text-white">+٣٠٠</div>
                        <div className="text-xs text-white/50">مريض</div>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div>
                        <div className="text-xl font-bold text-[#2D9B83]">٨٧%</div>
                        <div className="text-xs text-white/50">تحسن</div>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div>
                        <div className="text-xl font-bold text-[#D4AF37]">+٢٠٠٠</div>
                        <div className="text-xs text-white/50">ساعة محتوى</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
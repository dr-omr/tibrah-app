import React from 'react';
import Link from 'next/link';
import { createPageUrl } from '../../utils';
import { Clock, MessageCircle, Video, ArrowLeft, Sparkles, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ConsultationSection() {
    const features = [
        { icon: Video, text: 'جلسة فيديو مباشرة', color: 'bg-blue-500' },
        { icon: Clock, text: '٤٥-٦٠ دقيقة', color: 'bg-purple-500' },
        { icon: MessageCircle, text: 'متابعة واتساب', color: 'bg-green-500' },
    ];

    const benefits = [
        'تحليل شامل لحالتك الصحية',
        'اكتشاف الأسباب الجذرية',
        'خطة علاجية مخصصة',
        'متابعة مستمرة',
    ];

    return (
        <section className="px-6 py-8">
            {/* Main Consultation Card */}
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl mb-6">
                {/* Background layers */}
                <div className="absolute inset-0 gradient-primary" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">الجلسة التشخيصية</h3>
                            <p className="text-white/80">اكتشف السبب الجذري لمشكلتك</p>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2 mb-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-white/90" />
                                <span className="text-white/90 text-sm">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Features Pills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2"
                                >
                                    <div className={`w-6 h-6 rounded-full ${feature.color} flex items-center justify-center`}>
                                        <Icon className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-white text-sm font-medium">{feature.text}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                        <div>
                            <span className="text-white/70 text-sm block">يبدأ من</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">٣٥٠</span>
                                <span className="text-white/80 text-lg">ر.س</span>
                            </div>
                        </div>

                        <a
                            href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20حجز%20جلسة%20تشخيصية"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button className="bg-white text-[#2D9B83] hover:bg-white/90 rounded-xl px-6 py-6 shadow-lg group font-bold text-lg">
                                <span>احجز الآن</span>
                                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            {/* WhatsApp Quick Contact */}
            <a
                href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20حجز%20جلسة%20تشخيصية"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
            >
                <div className="glass rounded-2xl p-5 flex items-center justify-between hover:shadow-glow transition-all duration-300 group">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                            <MessageCircle className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-lg">تواصل مباشر</p>
                            <p className="text-sm text-slate-500">احجز عبر واتساب الآن</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-green-600 group-hover:-translate-x-1 transition-all" />
                    </div>
                </div>
            </a>
        </section>
    );
}
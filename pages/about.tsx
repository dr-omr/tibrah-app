import React from 'react';
import Link from 'next/link';
import {
    ArrowRight, Heart, Shield, Target, Sparkles, Users, Award,
    BookOpen, Stethoscope, Leaf, Phone, Mail, MapPin, Instagram, MessageCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function About() {
    const features = [
        {
            icon: Stethoscope,
            title: 'طب وظيفي تكاملي',
            description: 'نعالج الجذور لا الأعراض، نفهم جسمك ككل متكامل'
        },
        {
            icon: Heart,
            title: 'رعاية شخصية',
            description: 'كل شخص فريد، وبرنامجك مصمم خصيصاً لاحتياجاتك'
        },
        {
            icon: Shield,
            title: 'خصوصية تامة',
            description: 'بياناتك الصحية محمية بأعلى معايير الأمان'
        },
        {
            icon: BookOpen,
            title: 'تثقيف صحي',
            description: 'نمكنك بالمعرفة لتكون شريكاً في رحلة شفائك'
        }
    ];

    const values = [
        { icon: Target, label: 'الدقة', color: 'bg-blue-500' },
        { icon: Heart, label: 'الرحمة', color: 'bg-rose-500' },
        { icon: Leaf, label: 'الطبيعة', color: 'bg-green-500' },
        { icon: Sparkles, label: 'التميز', color: 'bg-amber-500' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-[#2D9B83] via-[#3FB39A] to-[#2D9B83] text-white px-6 py-12 rounded-b-[3rem] relative overflow-hidden">
                {/* Decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-2xl" />

                {/* Back Button */}
                <Link href="/profile" className="absolute top-6 right-6">
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                        <ArrowRight className="w-6 h-6" />
                    </Button>
                </Link>

                <div className="relative text-center pt-6">
                    {/* Logo */}
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-xl">
                        <span className="text-4xl font-bold">طِ</span>
                    </div>

                    <h1 className="text-3xl font-bold mb-2">طِبرَا</h1>
                    <p className="text-lg text-white/90 mb-2">العيادة الرقمية للطب الوظيفي</p>
                    <p className="text-sm text-white/70">اكتشف صحتك بطريقة جديدة</p>
                </div>
            </div>

            <div className="px-6 -mt-8 relative z-10 space-y-6">
                {/* Mission Card */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#2D9B83]/10 flex items-center justify-center">
                            <Target className="w-6 h-6 text-[#2D9B83]" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">رسالتنا</h2>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                        نؤمن بأن الصحة الحقيقية تبدأ من الداخل. في طِبرَا، نجمع بين حكمة الطب التقليدي وأحدث الأبحاث العلمية لنقدم لك رعاية صحية شاملة تعالج الأسباب الجذرية، لا مجرد الأعراض.
                    </p>
                </div>

                {/* Features Grid */}
                <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">ما يميزنا</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-[#2D9B83]/10 flex items-center justify-center mb-3">
                                        <Icon className="w-5 h-5 text-[#2D9B83]" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm mb-1">{feature.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Values */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">قيمنا</h2>
                    <div className="flex justify-around">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div key={index} className="text-center">
                                    <div className={`w-14 h-14 rounded-2xl ${value.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{value.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Services Overview */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white">
                    <h2 className="text-lg font-bold mb-4">خدماتنا</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                            <Stethoscope className="w-5 h-5 text-[#2D9B83]" />
                            <span className="text-sm">استشارات طبية متخصصة</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                            <span className="text-sm">برامج علاجية مخصصة</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                            <Users className="w-5 h-5 text-cyan-400" />
                            <span className="text-sm">متابعة مستمرة وشخصية</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                            <Award className="w-5 h-5 text-rose-400" />
                            <span className="text-sm">دورات تثقيفية صحية</span>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">تواصل معنا</h2>
                    <div className="space-y-4">
                        <a
                            href="https://wa.me/967777088577"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">واتساب</p>
                                <p className="text-sm text-slate-500">+967 777 088 577</p>
                            </div>
                        </a>

                        <a
                            href="https://instagram.com/tibrah.ye"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                                <Instagram className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">انستغرام</p>
                                <p className="text-sm text-slate-500">@tibrah.ye</p>
                            </div>
                        </a>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">الموقع</p>
                                <p className="text-sm text-slate-500">اليمن - صنعاء</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-4 pb-8">
                    <p className="text-sm text-slate-400">
                        © {new Date().getFullYear()} طِبرَا. جميع الحقوق محفوظة
                    </p>
                    <p className="text-xs text-slate-300 mt-1">الإصدار 2.0.0</p>
                </div>
            </div>
        </div>
    );
}

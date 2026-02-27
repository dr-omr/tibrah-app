import React, { useState } from 'react';
import Link from 'next/link';
import { createPageUrl } from '../utils';
import {
    MessageCircle, Instagram, Youtube, Clock, Users, TrendingUp,
    Check, X, Star, Sparkles, Gift, ArrowLeft, Calendar, Zap,
    Award, Heart, Brain, Shield, Phone, ExternalLink, Play
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIContextAssistant from '@/components/ai/AIContextAssistant';
import { DOCTOR_KNOWLEDGE } from '@/components/ai/knowledge';
import SEO, { pageSEO } from '../components/common/SEO';

export default function Services() {
    const [activeProgram, setActiveProgram] = useState('21_days');

    const doctorInfo = {
        name: 'د. عمر العماد',
        title: 'طبيب عام - خبير الطب الوظيفي',
        education: 'خريج كلية الطب - جامعة صنعاء',
        vision: 'أساعدك تفهم جسمك وتتعافى بشكل حقيقي',
        philosophy: 'علاج السبب الجذري وليس الأعراض فقط',
        whatsapp: '967771447111',
        instagram: 'dr.omr369',
        tiktok: 'dr.omr369',
        youtube: 'dr.omr369',
        stats: {
            content_hours: '2000+',
            patients: '300+',
            success_rate: '87%'
        }
    };

    // عرض الإطلاق - خصم 90%
    const mainService = {
        title: 'الجلسة التشخيصية الشاملة',
        duration: '45-60 دقيقة',
        original_price_yer: '3,000',
        original_price_sar: '25',
        promo_price_yer: '300', // 10% of 3000
        promo_price_sar: '2.5', // 10% of 25
        features: [
            'مراجعة شاملة للتاريخ الصحي',
            'تحليل الأعراض بنهج الطب الوظيفي',
            'خطة علاجية أولية مخصصة',
            'توصيات للتحاليل (إن لزم)'
        ]
    };

    const programs = [
        {
            id: 'weekly',
            title: 'برنامج الأسبوع',
            duration: '7 أيام',
            slogan: '7 Days Transformation',
            icon: '📅',
            description: 'مناسب للحالات البسيطة أو لمن يريد تحسين جانب معين بسرعة (مثل: تحسين الهضم، النوم، الطاقة).',
            features: [
                'خطة غذائية مخصصة لمدة أسبوع',
                'توصيات يومية عبر WhatsApp',
                'متابعة يومية للتقدم',
                'تعديلات فورية عند الحاجة'
            ],
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'from-blue-500/10 to-cyan-500/10'
        },
        {
            id: '21_days',
            title: 'برنامج ال21 يوم',
            duration: '21 يوماً',
            slogan: '3 Weeks Reset',
            icon: '🌱',
            popular: true,
            description: 'البرنامج المثالي لإعادة ضبط الجسم وبناء عادات صحية مستدامة. 21 يوم كافية لتغيير حقيقي يدوم.',
            features: [
                'خطة غذائية وعلاجية متكاملة',
                '3 جلسات متابعة (أسبوعياً)',
                'دعم يومي عبر WhatsApp',
                'تقييم شامل في نهاية البرنامج',
                'محتوى تعليمي مخصص'
            ],
            color: 'from-[#2D9B83] to-[#3FB39A]',
            bgColor: 'from-[#2D9B83]/10 to-[#3FB39A]/10',
            cta: 'ابدأ التحول الحقيقي'
        },
        {
            id: '3_months',
            title: 'برنامج ال3 أشهر',
            duration: '90 يوماً',
            slogan: '90 Days Complete Transformation',
            icon: '🚀',
            description: 'التحول الشامل - للحالات المزمنة والمعقدة. رحلة كاملة نمشيها سوياً حتى تصل لصحة مستدامة بإذن الله.',
            features: [
                'برنامج علاجي شامل ومتدرج',
                '8-10 جلسات متابعة',
                'دعم مستمر طوال الفترة',
                'تحليل دوري للتقدم',
                'خطة صيانة بعد انتهاء البرنامج',
                'أولوية في الرد والمتابعة'
            ],
            color: 'from-[#D4AF37] to-[#F4D03F]',
            bgColor: 'from-[#D4AF37]/10 to-[#F4D03F]/10',
            cta: 'معك للنهاية ←'
        }
    ];

    const comparisons = [
        { feature: 'مدة الاستشارة', doctor: '45-60 دقيقة', traditional: '10-15 دقيقة' },
        { feature: 'النهج العلاجي', doctor: 'علاج السبب الجذري', traditional: 'علاج الأعراض فقط' },
        { feature: 'المتابعة', doctor: 'دعم مباشر عبر WhatsApp', traditional: 'مواعيد متباعدة' },
        { feature: 'الخطة العلاجية', doctor: 'مخصصة 100% لحالتك', traditional: 'Protocols عامة' },
        { feature: 'المحتوى التعليمي', doctor: 'محتوى مجاني مستمر', traditional: 'غير متوفر' },
    ];

    const whatsappLink = `https://wa.me/${doctorInfo.whatsapp}?text=مرحباً%20د.%20عمر،%20أريد%20حجز%20جلسة%20تشخيصية`;

    return (
        <div className="min-h-screen pb-24">
            {/* SEO Meta Tags */}
            <SEO {...pageSEO.services} />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] px-6 py-10">
                <div className="relative z-10 mb-4">
                    <AIContextAssistant
                        contextType="services"
                        contextData={{}}
                        knowledgeBase={DOCTOR_KNOWLEDGE}
                        title="اسألني عن خدمات د. عمر"
                    />
                </div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

                <div className="relative text-center">
                    {/* Doctor Image */}
                    <div className="relative w-32 h-32 mx-auto mb-6">
                        <div className="absolute inset-0 gradient-gold rounded-full blur-lg opacity-50 scale-110" />
                        <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-br from-white/30 to-white/10">
                            <div className="w-full h-full rounded-full overflow-hidden bg-white/20">
                                <img
                                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69287e726ff0e068617e81b7/9185440e5_omar.jpg"
                                    alt={doctorInfo.name}
                                    className="w-full h-full object-cover object-top"
                                />
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <Award className="w-4 h-4 text-[#2D9B83]" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">{doctorInfo.name}</h1>
                    <p className="text-white/90 font-medium mb-2">{doctorInfo.title}</p>
                    <p className="text-white/70 text-sm mb-6">{doctorInfo.education}</p>

                    <div className="glass rounded-2xl p-4 max-w-sm mx-auto">
                        <p className="text-slate-700 font-medium">"{doctorInfo.vision}"</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="px-6 -mt-6 relative z-10">
                <div className="grid grid-cols-3 gap-3">
                    <div className="glass rounded-2xl p-4 text-center shadow-lg">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{doctorInfo.stats.content_hours}</p>
                        <p className="text-xs text-slate-500">ساعة محتوى مجاني</p>
                    </div>
                    <div className="glass rounded-2xl p-4 text-center shadow-lg">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{doctorInfo.stats.patients}</p>
                        <p className="text-xs text-slate-500">مريض ساعدهم</p>
                    </div>
                    <div className="glass rounded-2xl p-4 text-center shadow-lg">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{doctorInfo.stats.success_rate}</p>
                        <p className="text-xs text-slate-500">نسبة التحسن</p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-8 space-y-8">
                {/* Main Service */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                        <h2 className="text-xl font-bold text-slate-800">الخدمة الرئيسية</h2>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl shadow-xl">
                        <div className="absolute inset-0 gradient-primary" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

                        <div className="relative p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                                    <Brain className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{mainService.title}</h3>
                                    <div className="flex items-center gap-2 text-white/80">
                                        <Clock className="w-4 h-4" />
                                        <span>{mainService.duration}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                {mainService.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Check className="w-5 h-5 text-white/90" />
                                        <span className="text-white/90">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
                                {/* عرض الإطلاق Badge */}
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                                        🔥 عرض إطلاق - خصم 90%
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white/80">السعر</span>
                                    <div className="text-left">
                                        {/* السعر الجديد */}
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-white">{mainService.promo_price_yer}</span>
                                            <span className="text-white/80">ر.ي</span>
                                            {/* السعر القديم مشطوب */}
                                            <span className="text-white/50 text-lg line-through mr-2">{mainService.original_price_yer}</span>
                                        </div>
                                        <p className="text-white/60 text-sm">
                                            أو <span className="font-bold text-white">{mainService.promo_price_sar}</span> ر.س
                                            <span className="line-through text-white/40 mr-1">{mainService.original_price_sar}</span>
                                        </p>
                                    </div>
                                </div>
                                <p className="text-white/70 text-sm text-center">
                                    "عرض لفترة محدودة - استغل الفرصة! 💡"
                                </p>
                            </div>

                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <Button className="w-full bg-white text-[#2D9B83] hover:bg-white/90 rounded-xl h-14 text-lg font-bold shadow-lg group">
                                    <MessageCircle className="w-5 h-5 ml-2" />
                                    احجز جلستك الآن عبر WhatsApp
                                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                                </Button>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Free Trial Banner */}
                <section className="bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 rounded-3xl p-5 border border-[#D4AF37]/30">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center flex-shrink-0">
                            <Gift className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1">🎁 3 أيام تجربة مجانية</h3>
                            <p className="text-slate-600 text-sm mb-3">
                                جميع البرامج تبدأ بفترة تجريبية مجانية. جرب أولاً، وبعدها قرر!
                            </p>
                            <div className="space-y-1 text-sm text-slate-500">
                                <p>✓ احجز الجلسة التشخيصية الأولى</p>
                                <p>✓ نختار البرنامج المناسب معاً</p>
                                <p>✓ تبدأ 3 أيام مجانية</p>
                                <p>✓ إذا عجبك النظام، نكمل - وإلا توقف بدون أي رسوم</p>
                            </div>
                            <p className="mt-3 text-[#D4AF37] font-medium text-sm">
                                💡 "بناء ثقة حقيقية - مش أخذ فلوسك بدون نتائج"
                            </p>
                        </div>
                    </div>
                </section>

                {/* Programs */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-[#2D9B83]" />
                        <h2 className="text-xl font-bold text-slate-800">برامج المتابعة الشخصية</h2>
                    </div>

                    <div className="space-y-4">
                        {programs.map((program) => (
                            <div
                                key={program.id}
                                className={`relative overflow-hidden rounded-3xl transition-all duration-500 ${program.popular ? 'ring-2 ring-[#2D9B83] shadow-glow' : ''
                                    }`}
                            >
                                {program.popular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[#2D9B83] to-[#3FB39A] text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl z-10">
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3 h-3" fill="currentColor" />
                                            الأكثر شعبية
                                        </span>
                                    </div>
                                )}

                                <div className={`absolute inset-0 bg-gradient-to-br ${program.bgColor}`} />

                                <div className="relative glass backdrop-blur-sm p-5">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${program.color} flex items-center justify-center shadow-lg text-3xl`}>
                                            {program.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-800 mb-1">{program.title}</h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="text-xs border-slate-300">
                                                    {program.duration}
                                                </Badge>
                                                <span className="text-xs text-slate-500">{program.slogan}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-600 text-sm mb-4">{program.description}</p>

                                    <div className="grid grid-cols-1 gap-2 mb-4">
                                        {program.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${program.color} flex items-center justify-center flex-shrink-0`}>
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-sm text-slate-600">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                        <p className="text-sm text-slate-500">
                                            السعر يُحدد بعد التجربة المجانية
                                        </p>
                                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                            <Button
                                                className={`rounded-xl px-5 ${program.popular
                                                    ? `bg-gradient-to-r ${program.color} text-white hover:opacity-90 shadow-lg`
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {program.cta || 'ابدأ الآن'}
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Comparison Table */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-[#2D9B83]" />
                        <h2 className="text-xl font-bold text-slate-800">ليش تختارني؟</h2>
                    </div>

                    <div className="glass rounded-3xl overflow-hidden shadow-xl">
                        <div className="grid grid-cols-3 gap-2 p-4 bg-gradient-to-r from-slate-50 to-slate-100">
                            <div className="text-sm font-medium text-slate-500">المقارنة</div>
                            <div className="text-center">
                                <div className="inline-flex items-center gap-1 gradient-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                                    مع د. عمر
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs">
                                    التقليدي
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {comparisons.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-3 gap-2 p-4 items-center">
                                    <div className="text-sm text-slate-700 font-medium">{item.feature}</div>
                                    <div className="text-center">
                                        <div className="inline-flex items-center gap-1 text-green-600 text-sm">
                                            <Check className="w-4 h-4" />
                                            <span className="text-xs">{item.doctor}</span>
                                        </div>
                                    </div>
                                    <div className="text-center text-xs text-slate-400">
                                        {item.traditional}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Free Content */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Play className="w-5 h-5 text-[#2D9B83]" />
                        <h2 className="text-xl font-bold text-slate-800">تعلم معي - علم حقيقي ينفعك 📚</h2>
                    </div>

                    <div className="glass rounded-3xl p-5 shadow-lg">
                        <p className="text-slate-600 mb-6">
                            "أشارك محتوى طبي تعليمي مجاني على السوشيال ميديا. هدفي نشر الوعي الصحي الصحيح بعيداً عن الخرافات والتسويق الكاذب."
                        </p>

                        <div className="grid grid-cols-3 gap-3">
                            <a
                                href={`https://instagram.com/${doctorInfo.instagram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                                    <Instagram className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium text-slate-700">Instagram</span>
                            </a>

                            <a
                                href={`https://tiktok.com/@${doctorInfo.tiktok}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-slate-500/10 to-slate-800/10 hover:from-slate-500/20 hover:to-slate-800/20 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-medium text-slate-700">TikTok</span>
                            </a>

                            <a
                                href={`https://youtube.com/@${doctorInfo.youtube}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                                    <Youtube className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium text-slate-700">YouTube</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="relative overflow-hidden rounded-3xl">
                    <div className="absolute inset-0 gradient-primary" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

                    <div className="relative p-6 text-center">
                        <h3 className="text-2xl font-bold text-white mb-3">
                            جاهز تبدأ رحلتك الصحية الحقيقية؟
                        </h3>
                        <p className="text-white/80 mb-6">
                            لا تنتظر - كل يوم تأخر هو يوم صحتك تتعب أكثر. احجز الآن وخلنا نبدأ سوياً.
                        </p>

                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-white text-[#2D9B83] hover:bg-white/90 rounded-xl px-8 h-14 text-lg font-bold shadow-lg group">
                                <MessageCircle className="w-5 h-5 ml-2" />
                                📱 احجز على WhatsApp الآن
                            </Button>
                        </a>

                        <p className="text-white/70 text-sm mt-6">
                            💚 "معي، أنت مش مجرد رقم - كل مريض قصة أهتم فيها شخصياً"
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}

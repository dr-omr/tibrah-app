import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight, Check, Star, Users, Calendar, MessageCircle, Play,
    Brain, Flame, Heart, Sparkles
} from 'lucide-react';

// Program data
const programs = {
    weekly: {
        id: 'weekly',
        title: 'برنامج الأسبوع',
        subtitle: 'تحول سريع',
        duration: '7 أيام',
        description: 'مناسب للحالات البسيطة أو لمن يريد تحسين جانب معين بسرعة',
        color: 'from-blue-500 to-cyan-500',
        icon: Flame,
        price: '150',
        trial: true,
        featured: false,
        features: ['خطة غذائية مخصصة', 'متابعة يومية', 'دعم WhatsApp', 'تعديلات فورية'],
        includes: [
            { text: 'جلسة تشخيصية', included: true },
            { text: 'خطة علاجية', included: true },
            { text: 'متابعة يومية', included: true },
            { text: 'استشارات غير محدودة', included: false },
        ],
        testimonials: [
            { name: 'أحمد', rating: 5, text: 'برنامج رائع ساعدني كثيراً' },
            { name: 'سارة', rating: 5, text: 'تحسن ملحوظ في أسبوع واحد' },
        ]
    },
    '21_days': {
        id: '21_days',
        title: 'برنامج 21 يوم',
        subtitle: 'التحول الحقيقي',
        duration: '21 يوماً',
        description: 'البرنامج المثالي لإعادة ضبط الجسم وبناء عادات صحية مستدامة',
        color: 'from-[#2D9B83] to-[#3FB39A]',
        icon: Brain,
        price: '350',
        trial: true,
        featured: true,
        features: ['خطة شاملة', '3 جلسات متابعة', 'دعم 24/7', 'تقييم نهائي', 'محتوى تعليمي'],
        includes: [
            { text: 'جلسة تشخيصية', included: true },
            { text: 'خطة علاجية', included: true },
            { text: 'متابعة يومية', included: true },
            { text: 'استشارات غير محدودة', included: true },
        ],
        testimonials: [
            { name: 'محمد', rating: 5, text: '21 يوم غيرت حياتي' },
            { name: 'فاطمة', rating: 5, text: 'نتائج مذهلة' },
        ]
    },
    '3_months': {
        id: '3_months',
        title: 'برنامج 3 أشهر',
        subtitle: 'التحول الشامل',
        duration: '90 يوماً',
        description: 'للحالات المزمنة والمعقدة - رحلة كاملة نمشيها سوياً',
        color: 'from-[#D4AF37] to-[#F4D03F]',
        icon: Heart,
        price: '900',
        trial: true,
        featured: false,
        features: ['برنامج متدرج', '10 جلسات', 'دعم مستمر', 'خطة صيانة', 'أولوية الرد'],
        includes: [
            { text: 'جلسة تشخيصية', included: true },
            { text: 'خطة علاجية', included: true },
            { text: 'متابعة يومية', included: true },
            { text: 'استشارات غير محدودة', included: true },
        ],
        testimonials: [
            { name: 'خالد', rating: 5, text: 'تعافيت تماماً بفضل الله ثم هذا البرنامج' },
            { name: 'نورة', rating: 5, text: 'استثمار حقيقي في صحتي' },
        ]
    }
};

export default function ProgramDetails() {
    const router = useRouter();
    const { id: programId } = router.query;
    const queryClient = useQueryClient();
    const [trialStarted, setTrialStarted] = useState(false);

    const program = programs[programId as keyof typeof programs];

    const startTrialMutation = useMutation({
        mutationFn: async () => {
            return db.entities.UserHealth.create({
                trial_started: new Date().toISOString(),
                trial_program: programId as string,
                journey_stage: 'initial',
                vitality_score: 50,
                progress_percentage: 0
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userHealth'] });
            setTrialStarted(true);
            toast.success('تم تفعيل التجربة المجانية!');
        },
    });

    if (!program) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500">البرنامج غير موجود</p>
            </div>
        );
    }

    const Icon = program.icon;

    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <div className={`relative overflow-hidden bg-gradient-to-br ${program.color} px-6 py-8`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

                <div className="relative">
                    <Link href={createPageUrl('Home')}>
                        <Button size="icon" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 mb-4">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            {program.featured && (
                                <Badge className="bg-white/20 text-white border-0 mb-1">الأكثر طلباً</Badge>
                            )}
                            <h1 className="text-2xl font-bold text-white">{program.title}</h1>
                            <p className="text-white/80">{program.subtitle} • {program.duration}</p>
                        </div>
                    </div>

                    <p className="text-white/90 leading-relaxed">{program.description}</p>
                </div>
            </div>

            <div className="px-6 py-6 space-y-6">
                {/* Trial Badge */}
                {program.trial && !trialStarted && (
                    <div className="glass-dark rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Play className="w-8 h-8 text-[#2D9B83]" />
                            <div>
                                <p className="font-bold text-slate-800">جرب ٣ أيام مجاناً</p>
                                <p className="text-sm text-slate-500">بدون التزام، ألغِ في أي وقت</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => startTrialMutation.mutate()}
                            disabled={startTrialMutation.isPending}
                            className="gradient-primary rounded-xl"
                        >
                            ابدأ الآن
                        </Button>
                    </div>
                )}

                {trialStarted && (
                    <div className="glass-dark rounded-2xl p-4 text-center">
                        <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p className="font-bold text-slate-800">تم تفعيل التجربة المجانية!</p>
                        <p className="text-sm text-slate-500">استمتع بـ ٣ أيام مجانية</p>
                    </div>
                )}

                {/* Features */}
                <div>
                    <h3 className="font-bold text-slate-800 mb-4">ماذا يتضمن البرنامج؟</h3>
                    <div className="space-y-3">
                        {program.features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${program.color} flex items-center justify-center flex-shrink-0`}>
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-slate-600">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* What's Included */}
                <div className="glass rounded-2xl p-5">
                    <h3 className="font-bold text-slate-800 mb-4">ما الذي ستحصل عليه؟</h3>
                    <div className="space-y-3">
                        {program.includes.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className={item.included ? 'text-slate-700' : 'text-slate-400'}>
                                    {item.text}
                                </span>
                                {item.included ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <span className="text-xs text-slate-400">غير متاح</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Testimonials */}
                <div>
                    <h3 className="font-bold text-slate-800 mb-4">آراء المشتركين</h3>
                    <div className="space-y-3">
                        {program.testimonials.map((testimonial, index) => (
                            <div key={index} className="glass rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{testimonial.name}</span>
                                </div>
                                <p className="text-slate-600 text-sm">"{testimonial.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="glass rounded-2xl p-4 text-center">
                        <Users className="w-6 h-6 mx-auto text-[#2D9B83] mb-2" />
                        <p className="text-xl font-bold text-slate-800">+٥٠٠</p>
                        <p className="text-xs text-slate-500">مشترك</p>
                    </div>
                    <div className="glass rounded-2xl p-4 text-center">
                        <Star className="w-6 h-6 mx-auto text-[#D4AF37] mb-2" />
                        <p className="text-xl font-bold text-slate-800">٤.٩</p>
                        <p className="text-xs text-slate-500">تقييم</p>
                    </div>
                    <div className="glass rounded-2xl p-4 text-center">
                        <Calendar className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                        <p className="text-xl font-bold text-slate-800">٩٥%</p>
                        <p className="text-xs text-slate-500">نسبة النجاح</p>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 glass p-4 border-t">
                <div className="flex items-center gap-4">
                    <div>
                        <span className="text-slate-500 text-sm">السعر</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-800">{program.price}</span>
                            <span className="text-slate-500">ر.س</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        <a
                            href={`https://wa.me/967771447111?text=مرحباً، أريد الاشتراك في ${program.title}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <Button className={`w-full h-12 bg-gradient-to-r ${program.color} rounded-xl text-white font-bold`}>
                                <MessageCircle className="w-5 h-5 ml-2" />
                                اشترك الآن
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

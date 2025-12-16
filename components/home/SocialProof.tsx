import React, { useState, useEffect } from 'react';
import { Instagram, Youtube, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function SocialProof() {
    const testimonials = [
        {
            name: 'أم محمد',
            text: 'بعد 3 أشهر من المتابعة، تحسنت حالتي الصحية بشكل ملحوظ. الدكتور عمر فهم مشكلتي من الجذور.',
            rating: 5,
            condition: 'مشاكل هضمية'
        },
        {
            name: 'أحمد السعيد',
            text: 'الترددات الشفائية غيرت حياتي. أنام بشكل أفضل وطاقتي تحسنت كثيراً.',
            rating: 5,
            condition: 'اضطرابات النوم'
        },
        {
            name: 'فاطمة علي',
            text: 'أخيراً وجدت طبيب يفهم الطب الوظيفي. النتائج مذهلة والمتابعة ممتازة.',
            rating: 5,
            condition: 'خلل هرموني'
        },
        {
            name: 'عبدالله المهندس',
            text: 'كنت أعاني من إرهاق مزمن، الدكتور عمر حدد السبب الحقيقي. الحمدلله تعافيت.',
            rating: 5,
            condition: 'إرهاق مزمن'
        },
        {
            name: 'منى الشهري',
            text: 'برنامج الديتوكس كان نقطة تحول. شعرت بفرق كبير في طاقتي وصحتي العامة.',
            rating: 5,
            condition: 'سموم متراكمة'
        },
    ];

    const socialLinks = [
        {
            icon: Instagram,
            label: 'Instagram',
            url: 'https://instagram.com/tibrah_medical',
            followers: '+50K',
            color: 'from-pink-500 to-purple-500'
        },
        {
            icon: Youtube,
            label: 'YouTube',
            url: 'https://youtube.com/@tibrah_medical',
            followers: '+100K',
            color: 'from-red-500 to-red-600'
        },
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-rotation every 5 seconds
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, testimonials.length]);

    const goToNext = () => {
        setIsAutoPlaying(false);
        setActiveIndex(prev => prev < testimonials.length - 1 ? prev + 1 : 0);
        // Resume auto-play after 10 seconds
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const goToPrev = () => {
        setIsAutoPlaying(false);
        setActiveIndex(prev => prev > 0 ? prev - 1 : testimonials.length - 1);
        // Resume auto-play after 10 seconds
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    return (
        <section className="px-6 py-8">
            {/* Social Media */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">خليك قريب وتابع جديدنا</h3>
                <div className="flex gap-3">
                    {socialLinks.map((social, index) => {
                        const Icon = social.icon;
                        return (
                            <a
                                key={index}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 glass rounded-2xl p-4 hover:shadow-glow transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="font-bold text-slate-800">{social.followers}</div>
                                <div className="text-xs text-slate-500">{social.label}</div>
                            </a>
                        );
                    })}
                </div>
            </div>

            {/* Testimonials */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">ناس تعافت وارتاحت بفضل الله</h3>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 rounded-full hover:bg-[#2D9B83]/10 hover:border-[#2D9B83] transition-colors"
                            onClick={goToPrev}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 rounded-full hover:bg-[#2D9B83]/10 hover:border-[#2D9B83] transition-colors"
                            onClick={goToNext}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="glass rounded-2xl p-5 relative overflow-hidden">
                    <Quote className="absolute top-4 left-4 w-8 h-8 text-[#2D9B83]/20" />

                    <div className="flex gap-1 mb-3">
                        {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                    </div>

                    <div className="transition-all duration-300 ease-in-out">
                        <p className="text-slate-600 leading-relaxed mb-4">
                            "{testimonials[activeIndex].text}"
                        </p>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-slate-800">{testimonials[activeIndex].name}</p>
                                <p className="text-xs text-slate-400">{testimonials[activeIndex].condition}</p>
                            </div>
                            <div className="flex gap-1">
                                {testimonials.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 rounded-full transition-all ${index === activeIndex ? 'bg-[#2D9B83] w-4' : 'bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
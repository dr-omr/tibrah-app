import React, { useState, useEffect } from 'react';
import { Instagram, Youtube, Star, Quote, ChevronLeft, ChevronRight, Facebook, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Custom icons for TikTok and Snapchat
const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
);

const SnapchatIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.42.42 0 01.3-.039c.099.021.2.06.303.119.225.133.449.39.449.76a.89.89 0 01-.554.83c-.028.015-.107.055-.225.105-.466.203-1.334.58-1.558 1.034-.059.117-.074.222-.045.319.09.289.546.581.82.76l.046.031a.42.42 0 01.181.181c.03.06.043.12.029.18-.015.133-.12.285-.27.42-.36.315-.9.6-1.44.735-.075.015-.135.03-.195.06-.06.03-.121.09-.121.225 0 .015-.06.135-.135.24-.225.3-.675.465-1.305.509-.6.045-1.155-.045-1.305-.09-.36.21-.81.51-1.335.765-1.11.51-2.34.84-3.465.84-1.02 0-2.235-.33-3.33-.78-.525-.24-.975-.555-1.335-.765-.15.045-.72.135-1.305.09-.63-.045-1.08-.21-1.305-.509a.67.67 0 01-.135-.24c0-.135-.06-.195-.12-.225a1.56 1.56 0 00-.196-.06c-.54-.135-1.08-.42-1.44-.735-.15-.135-.255-.285-.27-.42a.36.36 0 01.03-.18.42.42 0 01.18-.181l.046-.031c.274-.179.73-.472.82-.76.029-.097.014-.202-.045-.319-.224-.454-1.092-.831-1.558-1.034-.118-.05-.197-.09-.225-.105a.89.89 0 01-.554-.83c0-.37.225-.627.45-.76a.91.91 0 01.303-.119.42.42 0 01.3.039c.374.18.733.285 1.033.3.199 0 .326-.044.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C6.653 1.069 10.01.793 11 .793h1.206z" />
    </svg>
);

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
            icon: Youtube,
            label: 'YouTube',
            url: 'https://youtube.com/@dr.omr369',
            followers: '+100K',
            color: 'from-red-500 to-red-600'
        },
        {
            icon: Instagram,
            label: 'Instagram',
            url: 'https://instagram.com/dr.omr369',
            followers: '+50K',
            color: 'from-pink-500 to-purple-500'
        },
        {
            icon: Facebook,
            label: 'Facebook',
            url: 'https://facebook.com/dr.omr369',
            followers: '+30K',
            color: 'from-blue-500 to-blue-600'
        },
        {
            icon: TikTokIcon,
            label: 'TikTok',
            url: 'https://tiktok.com/@dr.omr369',
            followers: '+80K',
            color: 'from-slate-800 to-slate-900',
            isCustomIcon: true
        },
        {
            icon: SnapchatIcon,
            label: 'Snapchat',
            url: 'https://snapchat.com/add/dr.omr369',
            followers: '+20K',
            color: 'from-yellow-400 to-yellow-500',
            isCustomIcon: true
        },
        {
            icon: MessageCircle,
            label: 'WhatsApp',
            url: 'https://wa.me/967771447111',
            followers: 'تواصل',
            color: 'from-green-500 to-green-600'
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
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">خليك قريب وتابع جديدنا</h3>
                <div className="grid grid-cols-3 gap-3">
                    {socialLinks.map((social, index) => {
                        const Icon = social.icon;
                        return (
                            <a
                                key={index}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glass rounded-2xl p-3 hover:shadow-glow transition-all group text-center"
                            >
                                <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                                    {social.isCustomIcon ? <Icon /> : <Icon className="w-5 h-5 text-white" />}
                                </div>
                                <div className="font-bold text-slate-800 dark:text-white text-sm">{social.followers}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">{social.label}</div>
                            </a>
                        );
                    })}
                </div>
            </div>

            {/* Testimonials */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">ناس تعافت وارتاحت بفضل الله</h3>
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
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            "{testimonials[activeIndex].text}"
                        </p>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white">{testimonials[activeIndex].name}</p>
                                <p className="text-xs text-slate-400">{testimonials[activeIndex].condition}</p>
                            </div>
                            <div className="flex gap-1">
                                {testimonials.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 rounded-full transition-all ${index === activeIndex ? 'bg-[#2D9B83] w-4' : 'bg-slate-200 dark:bg-slate-600'
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
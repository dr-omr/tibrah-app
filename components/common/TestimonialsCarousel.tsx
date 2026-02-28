/**
 * TestimonialsCarousel — Auto-scrolling client testimonials
 * For use on the homepage or services page
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
    id: string;
    name: string;
    location: string;
    text: string;
    rating: number;
    service: string;
    avatar?: string;
}

const testimonials: Testimonial[] = [
    {
        id: '1',
        name: 'سارة أحمد',
        location: 'الرياض',
        text: 'تجربتي مع د. عمر غيّرت حياتي. بعد 3 أشهر من المتابعة، تحسنت صحة أمعائي بشكل ملحوظ وزاد نشاطي اليومي.',
        rating: 5,
        service: 'استشارة طب وظيفي',
    },
    {
        id: '2',
        name: 'محمد خالد',
        location: 'جدة',
        text: 'المتابع الصحي ساعدني أتابع شرب الماء والنوم يومياً. أحسّيت بفرق كبير في طاقتي وتركيزي خلال أسبوعين فقط.',
        rating: 5,
        service: 'المتابع الصحي',
    },
    {
        id: '3',
        name: 'نورة العلي',
        location: 'الدمام',
        text: 'الدورات التعليمية ممتازة ومعلومات عميقة. فهمت أخيراً العلاقة بين الغذاء والمشاعر والصحة.',
        rating: 5,
        service: 'الدورات التعليمية',
    },
    {
        id: '4',
        name: 'عبدالله سعيد',
        location: 'عدن',
        text: 'جلسة العلاج بالترددات كانت تجربة مدهشة. شعرت باسترخاء عميق وتحسّن ملموس في آلام الرقبة.',
        rating: 5,
        service: 'علاج بالترددات',
    },
    {
        id: '5',
        name: 'فاطمة حسن',
        location: 'المنامة',
        text: 'المكملات اللي نصحني فيها د. عمر حقيقة غيّرت جودة نومي. أنام الآن 7 ساعات متواصلة لأول مرة من سنوات.',
        rating: 5,
        service: 'استشارة + مكملات',
    },
];

export default function TestimonialsCarousel() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);

    // Auto-advance every 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setCurrent(prev => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const goTo = (idx: number) => {
        setDirection(idx > current ? 1 : -1);
        setCurrent(idx);
    };

    const prev = () => {
        setDirection(-1);
        setCurrent(c => (c - 1 + testimonials.length) % testimonials.length);
    };

    const next = () => {
        setDirection(1);
        setCurrent(c => (c + 1) % testimonials.length);
    };

    const t = testimonials[current];

    return (
        <div className="relative" dir="rtl">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    ماذا يقول عملاؤنا ✨
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    تجارب حقيقية من مجتمع طِبرَا
                </p>
            </div>

            {/* Card */}
            <div className="relative overflow-hidden min-h-[220px]">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.div
                        key={t.id}
                        custom={direction}
                        initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-slate-700"
                    >
                        {/* Quote icon */}
                        <Quote className="w-8 h-8 text-[#2D9B83]/20 mb-3" />

                        {/* Text */}
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed mb-4 text-sm">
                            &ldquo;{t.text}&rdquo;
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Author */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{t.name}</p>
                                <p className="text-xs text-slate-400">{t.location}</p>
                            </div>
                            <span className="text-[10px] px-3 py-1 rounded-full bg-[#2D9B83]/10 text-[#2D9B83] font-medium">
                                {t.service}
                            </span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
                <button onClick={prev} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-[#2D9B83] transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                    {testimonials.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goTo(idx)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === current ? 'w-6 bg-[#2D9B83]' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                        />
                    ))}
                </div>

                <button onClick={next} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-[#2D9B83] transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

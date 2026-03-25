// components/home/ServicesPreview.tsx
// Premium horizontal-scroll service cards with animations and haptic feedback
// Redesigned as a world-class mobile experience

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
    Stethoscope, Clock, ArrowLeft, ArrowRight, Sparkles, Calendar,
    Star, TrendingUp, Users, Zap, Heart, Shield, CheckCircle2
} from 'lucide-react';
import { createPageUrl } from '../../utils';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';

// Service data with rich metadata
const services = [
    {
        id: 'diagnostic',
        title: 'الجلسة الأولى',
        subtitle: 'ابدأ من هنا',
        description: 'تحليل شامل لحالتك الصحية مع خطة علاجية مخصصة بنهج الطب الوظيفي',
        duration: '45-60 دقيقة',
        badge: 'ابدأ من هنا',
        badgeColor: 'from-emerald-400 to-teal-500',
        gradient: 'from-[#0F766E] via-[#0D9488] to-[#14B8A6]',
        glowColor: 'shadow-teal-500/30',
        icon: Stethoscope,
        features: ['تحليل التاريخ الصحي', 'تشخيص السبب الجذري', 'خطة علاج مخصصة'],
        stat: { value: '٣٠٠+', label: 'شخص تعافى', icon: Users },
        price: { amount: '300', currency: 'ر.ي', label: 'سعر الإطلاق' },
    },
    {
        id: '21days',
        title: 'برنامج 21 يوم',
        subtitle: 'إعادة ضبط جسمك',
        description: 'البرنامج المثالي لبناء عادات صحية وترجع التوازن لجسمك',
        duration: '21 يوم متابعة',
        badge: 'الأكثر طلباً',
        badgeColor: 'from-amber-400 to-orange-500',
        gradient: 'from-[#B45309] via-[#D97706] to-[#F59E0B]',
        glowColor: 'shadow-amber-500/30',
        icon: TrendingUp,
        features: ['خطة غذائية متكاملة', 'متابعة يومية واتساب', '3 جلسات أسبوعية'],
        stat: { value: '٨٧%', label: 'نسبة التحسّن', icon: TrendingUp },
        popular: true,
    },
    {
        id: '90days',
        title: 'برنامج 90 يوم',
        subtitle: 'التحول الشامل',
        description: 'رحلة علاجية كاملة للحالات المزمنة — نمشيها معاك خطوة بخطوة',
        duration: '3 شهور متابعة',
        badge: 'VIP',
        badgeColor: 'from-violet-400 to-purple-600',
        gradient: 'from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6]',
        glowColor: 'shadow-violet-500/30',
        icon: Shield,
        features: ['10 جلسات متابعة', 'دعم مستمر طول الفترة', 'خطة صيانة بعد البرنامج'],
        stat: { value: 'VIP', label: 'أولوية كاملة', icon: Star },
    },
];

const mockUserData = {
    recommendedServiceId: '21days',
    reason: 'بناءً على تقييمك لمستوى الطاقة والمزاج'
};

// Animated counter hook
function useAnimatedValue(target: string, duration = 1200) {
    const [display, setDisplay] = useState('0');
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if (!started) return;
        const numericPart = target.replace(/[^0-9]/g, '');
        const numTarget = parseInt(numericPart) || 0;
        const prefix = target.match(/^[^0-9]*/)?.[0] || '';
        const suffix = target.match(/[^0-9]*$/)?.[0] || '';

        const startTime = performance.now();
        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const current = Math.round(numTarget * eased);
            setDisplay(`${prefix}${current.toLocaleString('ar-SA')}${suffix}`);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [started, target, duration]);

    return { display, start: () => setStarted(true) };
}

export default function ServicesPreview() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for entrance animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    // Track active card during scroll
    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const el = scrollRef.current;
        const cardWidth = el.scrollWidth / services.length;
        const newIndex = Math.round(el.scrollLeft / cardWidth);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
            haptic.tap();
        }
    }, [activeIndex]);

    // Scroll to specific card
    const scrollToCard = (index: number) => {
        if (!scrollRef.current) return;
        const cardWidth = scrollRef.current.scrollWidth / services.length;
        scrollRef.current.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
        setActiveIndex(index);
        uiSounds.select();
        haptic.tap();
    };

    return (
        <div ref={sectionRef} className="py-8 overflow-hidden">
            {/* Section Header with animated entrance */}
            <div className={`px-5 mb-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }}>
                            <Sparkles className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                                خدماتنا الطبية
                            </h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                                اختر اللي يناسب حالتك
                            </p>
                        </div>
                    </div>
                    <Link
                        href={createPageUrl('Services')}
                        className="flex items-center gap-1 text-xs text-primary font-bold bg-primary/8 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
                        onClick={() => uiSounds.navigate()}
                    >
                        قارن الباقات
                        <ArrowLeft className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* Horizontal Swipeable Cards */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-5 pb-4 scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {services.map((service, i) => (
                    <ServiceCard
                        key={service.id}
                        service={service}
                        index={i}
                        isVisible={isVisible}
                        isActive={activeIndex === i}
                    />
                ))}
            </div>

            {/* Pagination Dots */}
            <div className={`flex items-center justify-center gap-2 mt-3 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}>
                {services.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => scrollToCard(i)}
                        className={`transition-all duration-300 rounded-full ${activeIndex === i
                            ? 'w-7 h-2.5 bg-gradient-to-r from-primary to-primary-light shadow-sm shadow-primary/30'
                            : 'w-2.5 h-2.5 bg-slate-200 dark:bg-slate-700 active:scale-90'
                            }`}
                        aria-label={`Service ${i + 1}`}
                    />
                ))}
            </div>

            {/* Quick WhatsApp CTA */}
            <div className={`px-5 mt-5 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                <a
                    href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20الاستفسار%20عن%20الخدمات"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => uiSounds.tap()}
                    className="flex items-center justify-center gap-2.5 p-3.5 rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/60 dark:border-green-800/40 text-green-700 dark:text-green-400 text-sm font-semibold active:scale-[0.98] transition-transform shadow-sm"
                >
                    <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center shadow-sm">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        </svg>
                    </div>
                    مش متأكد؟ اسأل د. عمر مباشرة
                </a>
            </div>
        </div>
    );
}

// Individual Service Card Component
interface ServiceCardProps {
    service: typeof services[0];
    index: number;
    isVisible: boolean;
    isActive: boolean;
}

function ServiceCard({ service, index, isVisible, isActive }: ServiceCardProps) {
    const Icon = service.icon;
    const StatIcon = service.stat.icon;
    const counterAnim = useAnimatedValue(service.stat.value);

    // 3D Tilt State
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        let clientX, clientY;
        
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => counterAnim.start(), 300 + index * 200);
            return () => clearTimeout(timer);
        }
    }, [isVisible, index]);

    return (
        <motion.div
            className={`flex-shrink-0 w-[82vw] max-w-[340px] snap-center transition-all duration-700 ${isVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-8 scale-95'
                }`}
            style={{ 
                transitionDelay: `${150 + index * 120}ms`,
                rotateX, 
                rotateY, 
                transformStyle: "preserve-3d", 
                perspective: 1200 
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseLeave}
        >
            <Link
                href={createPageUrl('BookAppointment')}
                onClick={() => {
                    uiSounds.select();
                    haptic.impact();
                }}
                className="block"
                style={{ transform: "translateZ(20px)" }}
            >
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${service.gradient} p-[1px] ${isActive ? `shadow-xl ${service.glowColor}` : 'shadow-lg shadow-black/10'
                    } transition-shadow duration-500`}>
                    {/* Inner card */}
                    <div className="relative overflow-hidden rounded-[23px] bg-gradient-to-br from-white/[0.12] to-white/[0.04] backdrop-blur-sm">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-[0.07]" style={{
                            backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }} />

                        {/* Popular indicator glow */}
                        {service.popular && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        )}

                        <div className="relative p-5">
                            {/* Top row: Badge + Promo */}
                            <div className="flex items-start justify-between mb-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${service.badgeColor} text-white text-[11px] font-bold shadow-md`}>
                                    {service.id === mockUserData.recommendedServiceId ? (
                                        <>
                                            <Sparkles className="w-3 h-3" fill="currentColor" />
                                            الأنسب لحالتك
                                        </>
                                    ) : service.popular ? (
                                        <>
                                            <Star className="w-3 h-3" fill="currentColor" />
                                            {service.badge}
                                        </>
                                    ) : (
                                        service.badge
                                    )}
                                </span>
                                {(service as any).price && (
                                    <div className="flex flex-col items-end">
                                        <span className="text-white font-black text-[15px] leading-none">{(service as any).price.amount} {(service as any).price.currency}</span>
                                        <span className="text-white/60 text-[10px] font-medium mt-0.5">{(service as any).price.label}</span>
                                    </div>
                                )}
                            </div>
                            
                            {service.id === mockUserData.recommendedServiceId && (
                                <div className="mb-4 bg-white/20 backdrop-blur-md rounded-xl p-2.5 border border-white/20 flex items-start gap-2 shadow-inner">
                                    <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-white/95 font-medium leading-tight">{mockUserData.reason}</p>
                                </div>
                            )}

                            {/* Icon + Title */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-inner">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-black text-base leading-tight mb-0.5">{service.title}</h3>
                                    <p className="text-white/60 text-xs font-medium">{service.subtitle}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-white/75 text-sm leading-relaxed mb-4">{service.description}</p>

                            {/* Features checklist */}
                            <div className="space-y-2 mb-4">
                                {service.features.map((feat, fi) => (
                                    <div
                                        key={fi}
                                        className={`flex items-center gap-2 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'
                                            }`}
                                        style={{ transitionDelay: `${500 + index * 120 + fi * 80}ms` }}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white/80 flex-shrink-0" />
                                        <span className="text-white/80 text-xs">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom row: Stat + Duration + CTA */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                <div className="flex items-center gap-3">
                                    {/* Animated stat */}
                                    <div className="flex items-center gap-1.5">
                                        <StatIcon className="w-3.5 h-3.5 text-white/60" />
                                        <span className="text-white font-bold text-sm tabular-nums">{counterAnim.display}</span>
                                        <span className="text-white/50 text-xs">{service.stat.label}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                                    <Clock className="w-3 h-3" />
                                    <span>{service.duration}</span>
                                </div>
                            </div>

                            {/* CTA strip */}
                            <div className="mt-4 flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl py-2.5 px-4 border border-white/10 active:bg-white/25 transition-colors">
                                <Calendar className="w-4 h-4 text-white" />
                                <span className="text-white font-black text-sm">
                                    {(service as any).price ? `احجز بـ ${(service as any).price.amount} ${(service as any).price.currency}` : 'احجز الآن'}
                                </span>
                                <ArrowLeft className="w-3.5 h-3.5 text-white/70" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

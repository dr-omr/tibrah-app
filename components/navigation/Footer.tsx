import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Heart, Phone, Mail, MapPin,
    Instagram, Twitter, Youtube, Send,
    ArrowUp, Sparkles, ExternalLink, Download, Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Footer() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(isIOSDevice);

        // Listen for install prompt
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            toast.info(
                <div className="text-right">
                    <p className="font-bold mb-2">لتثبيت التطبيق على iOS:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>اضغط على أيقونة المشاركة <span className="inline-block">⬆️</span></li>
                        <li>اختر "إضافة إلى الشاشة الرئيسية"</li>
                        <li>اضغط "إضافة"</li>
                    </ol>
                </div>,
                { duration: 8000 }
            );
            return;
        }

        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                toast.success('تم تثبيت التطبيق بنجاح! 🎉');
                setIsInstalled(true);
            }
            setDeferredPrompt(null);
        } else if (!isInstalled) {
            toast.info('يمكنك تثبيت التطبيق من قائمة المتصفح');
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { label: 'الرئيسية', href: '/' },
        { label: 'خريطة الجسم', href: '/body-map' },
        { label: 'الدورات', href: '/courses' },
        { label: 'المكتبة', href: '/library' },
        { label: 'حجز موعد', href: '/book-appointment' },
        { label: 'المتجر', href: '/shop' },
    ];

    const services = [
        { label: 'الاستشارات الطبية', href: '/services' },
        { label: 'برنامج 21 يوم', href: '/program-details' },
        { label: 'تردادات الشفاء', href: '/frequencies' },
        { label: 'الملف الطبي', href: '/medical-file' },
        { label: 'متتبع الصحة', href: '/health-tracker' },
    ];

    // Social media - all using @dr.omr369
    const socialLinks = [
        { icon: Youtube, href: 'https://youtube.com/@dr.omr369', label: 'YouTube', color: 'hover:text-red-500' },
        { icon: Instagram, href: 'https://instagram.com/dr.omr369', label: 'Instagram', color: 'hover:text-pink-500' },
        {
            icon: () => (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
            ),
            href: 'https://tiktok.com/@dr.omr369',
            label: 'TikTok',
            color: 'hover:text-white'
        },
        {
            icon: () => (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                </svg>
            ),
            href: 'https://facebook.com/dr.omr369',
            label: 'Facebook',
            color: 'hover:text-blue-500'
        },
        {
            icon: () => (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M12 2.5C6.752 2.5 2.5 6.752 2.5 12C2.5 17.248 6.752 21.5 12 21.5C17.248 21.5 21.5 17.248 21.5 12C21.5 6.752 17.248 2.5 12 2.5ZM16.92 13.01C16.92 13.01 18.17 14.59 18.48 15.15C18.49 15.17 18.5 15.19 18.5 15.2C18.61 15.39 18.66 15.54 18.62 15.66C18.55 15.87 18.25 15.97 18.12 15.98H15.88C15.71 15.98 15.36 15.92 14.94 15.56C14.62 15.28 14.31 14.84 14.01 14.41C13.57 13.8 13.18 13.26 12.77 13.26C12.73 13.26 12.68 13.27 12.64 13.28C12.17 13.44 11.58 14.23 11.58 15.59C11.58 15.84 11.39 15.97 11.24 15.97H10.22C9.81 15.97 7.79 15.8 6.03 13.87C3.87 11.5 1.95 6.77 1.93 6.72C1.82 6.47 2.05 6.34 2.3 6.34H4.57C4.78 6.34 4.94 6.45 5.01 6.64C5.13 6.93 5.73 8.36 6.57 9.69C7.83 11.68 8.49 12.3 9.02 12.3C9.12 12.3 9.22 12.28 9.31 12.23C10.02 11.84 9.88 9.18 9.85 8.62C9.85 8.51 9.84 7.47 9.48 7C9.24 6.68 8.81 6.56 8.55 6.52C8.63 6.41 8.81 6.23 9.04 6.13C9.45 5.95 10.17 5.93 10.91 5.93H11.36C12.17 5.94 12.38 5.99 12.67 6.07C13.24 6.21 13.26 6.59 13.22 7.75C13.2 8.11 13.19 8.52 13.19 8.99C13.19 9.1 13.18 9.22 13.18 9.34C13.16 10.15 13.13 11.06 13.69 11.36C13.77 11.4 13.87 11.41 13.97 11.41C14.27 11.41 14.84 11.26 16.39 9.73C17.21 8.86 17.84 7.81 17.88 7.73C17.91 7.68 17.96 7.59 18.03 7.55C18.08 7.52 18.16 7.51 18.24 7.51H20.82C21.16 7.51 21.38 7.59 21.42 7.75C21.49 8 21.32 8.52 20.09 10.17L19.23 11.28C18.11 12.75 18.11 12.83 19.33 13.95L16.92 13.01Z" />
                </svg>
            ),
            href: 'https://snapchat.com/add/dr.omr369',
            label: 'Snapchat',
            color: 'hover:text-yellow-400'
        },
    ];

    return (
        <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
            </div>

            {/* Main Footer Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-8">
                {/* Top Section - Logo & Newsletter */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12 pb-12 border-b border-white/10">
                    {/* Logo & Tagline */}
                    <div className="max-w-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                <span className="text-white font-bold text-xl">ط</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">طِبرَا</h3>
                                <p className="text-xs text-slate-400">Tibrah Medical</p>
                            </div>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            عيادتك الرقمية للطب الوظيفي والتكاملي. نفهم جسمك ونعالج الجذور بأحدث الأساليب العلمية.
                        </p>
                    </div>

                    {/* Newsletter */}
                    <div className="w-full lg:w-auto">
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-gold" />
                            اشترك في نشرتنا البريدية
                        </h4>
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                placeholder="بريدك الإلكتروني"
                                className="w-64 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/20"
                                dir="ltr"
                            />
                            <Button className="h-12 px-6 gradient-primary rounded-xl font-bold">
                                اشترك
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            احصل على نصائح صحية ومحتوى حصري
                        </p>
                    </div>
                </div>

                {/* Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-white mb-4">روابط سريعة</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                        <span className="w-1 h-1 rounded-full bg-primary group-hover:w-2 transition-all" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-bold text-white mb-4">خدماتنا</h4>
                        <ul className="space-y-3">
                            {services.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                        <span className="w-1 h-1 rounded-full bg-primary group-hover:w-2 transition-all" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-white mb-4">تواصل معنا</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-slate-400 text-sm">
                                <Phone className="w-4 h-4 text-primary" />
                                <a href="tel:+967771447111" dir="ltr" className="hover:text-white transition-colors">+967 771 447 111</a>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm">
                                <Mail className="w-4 h-4 text-primary" />
                                <a href="mailto:dr.omaralemad@gmail.com" className="hover:text-white transition-colors">dr.omaralemad@gmail.com</a>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>اليمن</span>
                            </li>
                        </ul>

                        {/* WhatsApp Button */}
                        <a
                            href="https://wa.me/967771447111"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            تواصل عبر واتساب
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Social & Download */}
                    <div>
                        <h4 className="font-bold text-white mb-4">تابعنا</h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {socialLinks.map((social) => {
                                const IconComponent = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-400 ${social.color} transition-all hover:scale-110`}
                                        aria-label={social.label}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>

                        <h4 className="font-bold text-white mb-3">حمّل التطبيق</h4>
                        <div className="flex flex-col gap-2">
                            {isInstalled ? (
                                <div className="flex items-center gap-3 px-4 py-3 bg-green-500/20 rounded-xl text-green-400">
                                    <Smartphone className="w-5 h-5" />
                                    <span className="text-sm font-medium">التطبيق مثبت ✓</span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleInstallClick}
                                    className="flex items-center gap-3 px-4 py-3 gradient-primary rounded-xl hover:opacity-90 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                        <Download className="w-5 h-5 text-white group-hover:animate-bounce" />
                                    </div>
                                    <div className="text-right flex-1">
                                        <p className="text-[10px] text-white/70">يعمل على جميع الأجهزة</p>
                                        <p className="text-sm font-bold text-white">تثبيت التطبيق</p>
                                    </div>
                                    <Smartphone className="w-5 h-5 text-white/70" />
                                </button>
                            )}
                            <p className="text-xs text-slate-500">
                                {isIOS ? 'اضغط للحصول على تعليمات iOS' : 'تطبيق ويب سريع وخفيف'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                        <span>© {currentYear} طِبرَا. جميع الحقوق محفوظة</span>
                        <Heart className="w-3 h-3 text-red-500 mx-1" />
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <Link href="/privacy" className="hover:text-white transition-colors">
                            سياسة الخصوصية
                        </Link>
                        <Link href="/terms" className="hover:text-white transition-colors">
                            الشروط والأحكام
                        </Link>
                    </div>

                    {/* Scroll to top */}
                    <button
                        onClick={scrollToTop}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary transition-colors group"
                    >
                        <ArrowUp className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                </div>
            </div>
        </footer>
    );
}

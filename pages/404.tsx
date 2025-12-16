import React from 'react';
import { FileQuestion, Home, Search, ArrowRight, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Custom404() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating circles */}
                <div className="absolute top-20 left-[10%] w-72 h-72 bg-gradient-to-br from-primary/20 to-primary-light/10 rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-gradient-to-br from-amber-200/30 to-orange-200/20 rounded-full blur-3xl animate-breathe" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-transparent rounded-full" />

                {/* Floating icons */}
                <div className="absolute top-1/4 left-1/4 animate-float">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center rotate-12">
                        <Search className="w-6 h-6 text-slate-400" />
                    </div>
                </div>
                <div className="absolute bottom-1/4 right-1/4 animate-float" style={{ animationDelay: '1s' }}>
                    <div className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center -rotate-12">
                        <Zap className="w-5 h-5 text-amber-400" />
                    </div>
                </div>
                <div className="absolute top-1/3 right-1/3 animate-float" style={{ animationDelay: '2s' }}>
                    <div className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center rotate-6">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                </div>
            </div>

            <div className="text-center max-w-lg relative z-10">
                {/* Animated 404 Icon */}
                <div className="relative inline-block mb-8">
                    <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-xl shadow-amber-200/50 transform hover:scale-105 transition-transform duration-300">
                        <FileQuestion className="w-16 h-16 text-amber-500 animate-pulse" />
                    </div>
                    {/* Decorative ring */}
                    <div className="absolute inset-0 rounded-3xl border-4 border-amber-200/50 scale-110 animate-ping opacity-20" />
                </div>

                {/* Glitchy 404 Text */}
                <div className="relative mb-6">
                    <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 tracking-tight">
                        404
                    </h1>
                    <div className="absolute inset-0 text-9xl font-black text-primary/10 blur-sm -z-10">
                        404
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-3">
                    عذراً! الصفحة غير موجودة
                </h2>

                <p className="text-slate-500 mb-8 text-lg leading-relaxed max-w-sm mx-auto">
                    يبدو أنك وصلت لمكان لم نكتشفه بعد. دعنا نعيدك للمسار الصحيح!
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button className="w-full sm:w-auto h-14 px-8 gradient-primary rounded-2xl text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group">
                            <Home className="w-5 h-5 ml-2" />
                            العودة للرئيسية
                            <ArrowRight className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link href="/services">
                        <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl text-lg font-medium border-2 hover:bg-slate-50">
                            تصفح خدماتنا
                        </Button>
                    </Link>
                </div>

                {/* Quick Links */}
                <div className="mt-12 pt-8 border-t border-slate-200">
                    <p className="text-sm text-slate-400 mb-4">أو جرب هذه الصفحات:</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            { label: 'خريطة الجسم', href: '/body-map' },
                            { label: 'الدورات', href: '/courses' },
                            { label: 'حجز موعد', href: '/book-appointment' },
                            { label: 'المتجر', href: '/shop' },
                        ].map((link) => (
                            <Link key={link.href} href={link.href}>
                                <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm hover:bg-primary hover:text-white transition-colors cursor-pointer">
                                    {link.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


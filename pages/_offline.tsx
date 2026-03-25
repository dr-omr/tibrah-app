import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { WifiOff, BookOpen, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';

export default function OfflineFallback() {
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        // Simple polling to check if we're back online
        const interval = setInterval(() => {
            if (navigator.onLine) {
                setIsOnline(true);
                window.location.reload();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-12">
            <Head>
                <title>غير متصل بالإنترنت | طِبرَا</title>
                <meta name="theme-color" content="#f8fafc" />
            </Head>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 w-full max-w-sm text-center relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -ml-10 -mb-10" />

                    <div className="relative z-10 text-center flex flex-col items-center">
                        <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 shadow-sm border border-slate-100 relative">
                            <WifiOff className="w-10 h-10 text-slate-400" />
                            {/* Animated dot */}
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-400 animate-ping opacity-75" />
                        </div>

                        <h1 className="text-xl font-bold text-slate-800 mb-2">أنت غير متصل بالإنترنت</h1>
                        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                            يبدو أن هناك مشكلة في الاتصال. لكن لا تقلق، لا يزال بإمكانك تصفح المحتوى المحفوظ.
                        </p>

                        <div className="w-full space-y-3">
                            <Button 
                                className="w-full h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold justify-start overflow-hidden relative group"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw className="w-5 h-5 ml-3 text-slate-400 group-hover:-rotate-180 transition-transform duration-500" />
                                <span className="flex-1 text-right">إعادة المحاولة</span>
                            </Button>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-slate-100"></div>
                                <span className="flex-shrink-0 mx-4 text-xs text-slate-300 font-medium uppercase tracking-wider">
                                    الميزات المتاحة بدون إنترنت
                                </span>
                                <div className="flex-grow border-t border-slate-100"></div>
                            </div>

                            <Link href="/library" className="block">
                                <Button 
                                    variant="outline" 
                                    className="w-full h-14 rounded-xl border-slate-200 justify-start hover:border-primary/30 hover:bg-primary/5 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center ml-3">
                                        <BookOpen className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-700 text-sm">مكتبة المقالات</div>
                                    </div>
                                </Button>
                            </Link>

                            <Link href="/health-tracker" className="block">
                                <Button 
                                    variant="outline" 
                                    className="w-full h-14 rounded-xl border-slate-200 justify-start hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center ml-3">
                                        <Activity className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-700 text-sm">سجل حالتك (تتبعي)</div>
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="py-6 text-center">
                <p className="text-xs text-slate-400 font-medium">سيتم إعادة تنشيط التطبيق تلقائياً عند عودة الاتصال</p>
            </div>
        </div>
    );
}

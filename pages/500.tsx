import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RefreshCcw, ServerCrash, PhoneCall, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Custom500() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
            <Head>
                <title>خطأ في الخادم | طِبرَا</title>
                <meta name="robots" content="noindex, follow" />
            </Head>

            {/* Background Decorations */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 p-8 sm:p-12 relative z-10"
            >
                <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full mx-auto flex items-center justify-center mb-6">
                    <ServerCrash className="w-12 h-12 text-red-500" strokeWidth={1.5} />
                </div>

                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">500</h1>
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    حدث خطأ غير متوقع
                </h2>
                
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    نعتذر بشدة، خوادمنا تواجه مشكلة مؤقتة في معالجة طلبك المعقد. تم إبلاغ فريق طِبرَا التقني وسيتم حل المشكلة قريباً جداً.
                </p>

                <div className="space-y-3">
                    <Button 
                        onClick={() => window.location.reload()} 
                        className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        تحديث الصفحة ألان
                    </Button>

                    <Link href="/" passHref className="w-full">
                        <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2">
                            العودة للرئيسية
                        </Button>
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                    <Button variant="ghost" className="text-slate-500 dark:text-slate-400 text-sm font-bold flex items-center gap-2 mx-auto">
                        <PhoneCall className="w-4 h-4 text-emerald-500" />
                        التواصل مع العيادة للاستفسار
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Compass, Stethoscope, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Custom404() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
            <Head>
                <title>الصفحة غير موجودة | طِبرَا</title>
                <meta name="robots" content="noindex, follow" />
            </Head>

            {/* Background Decorations */}
            <div className="absolute top-1/4 -right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 p-8 sm:p-12 relative z-10"
            >
                <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mx-auto flex items-center justify-center mb-6">
                    <Compass className="w-12 h-12 text-emerald-500" strokeWidth={1.5} />
                </div>

                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">404</h1>
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">
                    يبدو أننا فقدنا الاتجاه!
                </h2>
                
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. لكن لا تقلق، العيادة الرقمية للطبيب عمر متاحة دائماً من الصفحة الرئيسية.
                </p>

                <div className="space-y-3">
                    <Link href="/" passHref className="w-full">
                        <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                            <Home className="w-5 h-5" />
                            العودة للرئيسية
                        </Button>
                    </Link>

                    <Link href="/my-care" passHref className="w-full">
                        <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2">
                            <Stethoscope className="w-5 h-5" />
                            الملف الطبي
                        </Button>
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex justify-center items-center">
                    <Button variant="ghost" className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1">
                        <Search className="w-4 h-4" />
                        ابحث عن ما تريده بدلاً من ذلك
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

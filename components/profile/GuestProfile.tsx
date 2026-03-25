import React from 'react';
import { motion } from 'framer-motion';
import { User, Activity, Sparkles, Calendar, Heart, ChevronLeft, HelpCircle, MessageCircle, Info } from 'lucide-react';
import Link from 'next/link';

export const GuestProfile = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            <motion.div
                className="relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-primary">
                    <motion.div
                        className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 8 }}
                    />
                </div>
                <div className="relative pt-12 pb-28 px-6 text-center">
                    <motion.div
                        className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-sm border-2 border-white/40 mx-auto mb-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                    >
                        <User className="w-12 h-12 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white mb-2">مرحباً بك في طِبرَا</h1>
                    <p className="text-white/70 text-sm">سجل حسابك عشان تستفيد من كل الميزات</p>
                </div>
            </motion.div>

            <div className="px-4 -mt-16 relative z-10 space-y-4">
                {/* Benefits Card */}
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-center">ليش تسجل حسابك؟</h3>
                    <div className="space-y-3">
                        {[
                            { icon: Activity, text: 'تتبع صحتك يومياً', color: '#2D9B83' },
                            { icon: Sparkles, text: 'نصائح ذكية مخصصة لك', color: '#D4AF37' },
                            { icon: Calendar, text: 'احفظ مواعيدك وبياناتك', color: '#3B82F6' },
                            { icon: Heart, text: 'تقارير صحية أسبوعية', color: '#EC4899' },
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={i}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + '15' }}>
                                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.text}</span>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Link href="/register" className="flex-1">
                            <motion.button
                                className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-xl"
                                whileTap={{ scale: 0.95 }}
                            >
                                إنشاء حساب
                            </motion.button>
                        </Link>
                        <Link href="/login" className="flex-1">
                            <motion.button
                                className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                                whileTap={{ scale: 0.95 }}
                            >
                                تسجيل دخول
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Quick Access still available for guests */}
                <motion.div
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">استكشف</h4>
                    {[
                        { icon: HelpCircle, label: 'مركز المساعدة', href: '/help', color: '#3B82F6' },
                        { icon: MessageCircle, label: 'تواصل معنا', href: '/contact', color: '#22C55E' },
                        { icon: Info, label: 'عن طِبرَا', href: '/about', color: '#6366F1' },
                    ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Link key={index} href={item.href}>
                                <div className="flex items-center gap-4 p-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                                    </div>
                                    <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                                </div>
                            </Link>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
};

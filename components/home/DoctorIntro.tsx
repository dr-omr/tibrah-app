// components/home/DoctorIntro.tsx
// Premium Design with Touch Interactions

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Verified, Sparkles, Calendar, ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createPageUrl } from '../../utils';

export default function DoctorIntro() {
    return (

        <section className="relative overflow-hidden">
            {/* Premium Hero Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D9B83]/5 via-white to-[#D4AF37]/5 dark:from-[#2D9B83]/10 dark:via-slate-900 dark:to-[#D4AF37]/10" />
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#2D9B83]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl translate-x-1/2" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

            <div className="relative px-6 py-8">
                {/* Header with Logo */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="inline-flex items-center gap-3 glass rounded-2xl px-6 py-3 mb-6 shadow-lg"
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-gradient block">طِبرَا</span>
                            <span className="text-xs text-slate-500">Tibrah Medical</span>
                        </div>
                    </motion.div>
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">عيادتك الرقمية</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">نفهم جسمك ونعالج الجذور 🌿</p>
                </motion.div>

                {/* Doctor Hero Card - Premium Design */}
                <motion.div
                    className="relative mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="absolute inset-0 gradient-primary rounded-[2rem] blur-xl opacity-20 transform scale-95" />
                    <motion.div
                        className="relative glass rounded-[2rem] p-1 shadow-2xl"
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                        <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 rounded-[1.75rem] p-6">
                            <div className="flex flex-col items-center text-center">
                                {/* Doctor Image - Premium Frame */}
                                <motion.div
                                    className="relative mb-6"
                                    whileTap={{ scale: 0.95, rotate: 2 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                >
                                    <div className="absolute inset-0 gradient-primary rounded-full blur-lg opacity-30 scale-110" />
                                    <div className="relative w-36 h-36 rounded-full p-1 bg-gradient-to-br from-[#2D9B83] via-[#3FB39A] to-[#D4AF37]">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                                            <Image
                                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69287e726ff0e068617e81b7/9185440e5_omar.jpg"
                                                alt="د. عمر العماد - استشاري الطب الوظيفي والتكاملي"
                                                width={144}
                                                height={144}
                                                className="w-full h-full object-cover object-top"
                                                priority
                                            />
                                        </div>
                                    </div>
                                    <motion.div
                                        className="absolute -bottom-2 -right-2 w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-slate-800"
                                        whileTap={{ scale: 0.8, rotate: -10 }}
                                    >
                                        <Verified className="w-5 h-5 text-white" />
                                    </motion.div>
                                    <motion.div
                                        className="absolute -top-2 -left-2 w-8 h-8 gradient-gold rounded-full flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-slate-800"
                                        whileTap={{ scale: 0.8, rotate: 10 }}
                                    >
                                        <Star className="w-4 h-4 text-white fill-white" />
                                    </motion.div>
                                </motion.div>

                                {/* Doctor Info */}
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">د. عمر العماد</h2>
                                    <Badge className="gradient-gold text-white text-[10px] border-0 shadow-md">معتمد</Badge>
                                </div>
                                <p className="text-[#2D9B83] font-semibold mb-4 text-lg">
                                    استشاري الطب الوظيفي والتكاملي
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mb-5">
                                    يا حياك الله.. أنا هنا عشان أساعدك تفهم جسمك صح، ونعالج المشكلة من جذورها مش بس نسكن الوجع.
                                    خبرتي في الطب الوظيفي والترددات الشفائية كلها تحت أمرك عشان ترجع لك عافيتك بإذن الله.
                                </p>

                                {/* CTA Button */}
                                <Link href={createPageUrl('BookAppointment')} className="w-full max-w-xs">
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                    >
                                        <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#2D9B83] to-[#3FB39A] text-white font-bold text-lg shadow-lg shadow-[#2D9B83]/30">
                                            <Calendar className="w-5 h-5 ml-2" />
                                            احجز استشارتك الآن
                                            <ArrowLeft className="w-5 h-5 mr-2" />
                                        </Button>
                                    </motion.div>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}


// components/home/QuickAccessGrid.tsx
// Premium Design with Touch Interactions for Mobile

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createPageUrl } from '../../utils';
import {
    Stethoscope, Radio, GraduationCap, ShoppingBag, BookOpen,
    MessageCircle, Brain, Sparkles, ArrowLeft
} from 'lucide-react';

export default function QuickAccessGrid() {
    // الأقسام الرئيسية فقط
    const mainSections = [
        { icon: Stethoscope, label: 'خدماتنا', page: 'Services', color: '#2D9B83', bg: 'bg-emerald-50' },
        { icon: Brain, label: 'الطب الشعوري', page: 'BodyMap', color: '#E91E63', bg: 'bg-pink-50', badge: 'جديد' },
        { icon: Radio, label: 'سول راديو', page: 'Frequencies', color: '#9C27B0', bg: 'bg-purple-50', badge: 'مميز' },
        { icon: GraduationCap, label: 'الدورات', page: 'Courses', color: '#FF9800', bg: 'bg-orange-50' },
        { icon: ShoppingBag, label: 'المتجر', page: 'Shop', color: '#4CAF50', bg: 'bg-green-50' },
        { icon: BookOpen, label: 'المكتبة', page: 'Library', color: '#2196F3', bg: 'bg-blue-50' },
    ];

    return (
        <div className="px-4 py-6 space-y-6">
            {/* الأقسام الرئيسية - بدون الإجراءات السريعة */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">أبسر ايش عندنا لك</h2>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                    {mainSections.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Link key={index} href={createPageUrl(item.page)}>
                                <motion.div
                                    className="relative flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-100 cursor-pointer"
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                                        borderColor: 'transparent'
                                    }}
                                    whileTap={{
                                        scale: 0.92,
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 17
                                    }}
                                >
                                    {/* Badge */}
                                    {item.badge && (
                                        <motion.span
                                            className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold z-10"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
                                        >
                                            {item.badge}
                                        </motion.span>
                                    )}

                                    {/* Icon with touch ripple effect */}
                                    <motion.div
                                        className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-2 relative overflow-hidden`}
                                        whileTap={{
                                            backgroundColor: item.color + '30'
                                        }}
                                    >
                                        <Icon
                                            className="w-8 h-8 relative z-10"
                                            style={{ color: item.color }}
                                            strokeWidth={1.5}
                                        />
                                    </motion.div>

                                    {/* Label */}
                                    <span className="text-xs font-semibold text-slate-700 text-center">
                                        {item.label}
                                    </span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* WhatsApp - مع تفاعل اللمس */}
            <motion.a
                href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg"
                whileHover={{ scale: 1.02, boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">تواصل معي مباشرة</h4>
                    <p className="text-white/80 text-xs">أي سؤال في بالك؟ أنا موجود على الواتساب</p>
                </div>
                <ArrowLeft className="w-5 h-5 text-white" />
            </motion.a>
        </div>
    );
}
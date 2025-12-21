// components/home/CredentialsSection.tsx
// Doctor Credentials & Stats - Moved to end of page for better customer focus

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Clock, Star, Heart, Brain, Activity, Sparkles, LucideIcon } from 'lucide-react';

interface StatItem {
    icon: LucideIcon;
    value: string;
    label: string;
    color: string;
}

interface Certification {
    name: string;
    icon: LucideIcon;
}

export default function CredentialsSection() {
    const stats: StatItem[] = [
        { icon: Users, value: '+٣٠٠', label: 'شخص تعافى بفضل الله', color: 'from-blue-500 to-cyan-500' },
        { icon: Clock, value: '+٢٠٠٠', label: 'ساعة علم حقيقي', color: 'from-purple-500 to-pink-500' },
        { icon: Star, value: '٨٧%', label: 'نسبة التعافي والرضا', color: 'from-amber-500 to-orange-500' },
    ];

    const certifications: Certification[] = [
        { name: 'الطب الوظيفي', icon: Brain },
        { name: 'العلاج بالترددات', icon: Activity },
        { name: 'التغذية العلاجية', icon: Heart },
        { name: 'الديتوكس الخلوي', icon: Sparkles },
    ];

    return (
        <section className="px-4 py-8 bg-gradient-to-b from-slate-50 to-white">
            {/* Section Title */}
            <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <h2 className="text-xl font-bold text-slate-800 mb-2">خبراتنا وإنجازاتنا</h2>
                <p className="text-sm text-slate-500">نفتخر بخدمة مجتمعنا الصحي</p>
            </motion.div>

            {/* Stats - Premium Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={index}
                            className="relative group"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.92 }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-all duration-500`} />
                            <div className="relative glass rounded-2xl p-4 text-center">
                                <motion.div
                                    className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                                    whileTap={{ rotate: 10, scale: 0.9 }}
                                >
                                    <Icon className="w-6 h-6 text-white" />
                                </motion.div>
                                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                                <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Certifications */}
            <motion.div
                className="glass rounded-3xl p-5 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <motion.div
                        className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center"
                        whileTap={{ rotate: -10, scale: 0.9 }}
                    >
                        <Award className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                        <span className="font-bold text-slate-800 block">التخصصات والشهادات</span>
                        <span className="text-xs text-slate-500">Certifications</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {certifications.map((cert, index) => {
                        const Icon = cert.icon;
                        return (
                            <motion.div
                                key={index}
                                className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-[#2D9B83]/5 to-[#2D9B83]/10"
                                whileHover={{ backgroundColor: 'rgba(45, 155, 131, 0.15)' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Icon className="w-4 h-4 text-[#2D9B83]" />
                                <span className="text-sm font-medium text-slate-700">{cert.name}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </section>
    );
}

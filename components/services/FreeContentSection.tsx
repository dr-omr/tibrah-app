import React from 'react';
import { motion } from 'framer-motion';
import { Play, Instagram, Youtube } from 'lucide-react';
import { doctorInfo } from './data';

export const FreeContentSection = () => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-2 mb-4">
                <Play className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-black text-slate-800">تعلم معي - علم حقيقي ينفعك 📚</h2>
            </div>

            <div className="glass rounded-3xl p-5 shadow-lg">
                <p className="text-slate-600 mb-6">
                    "أشارك محتوى طبي تعليمي مجاني على السوشيال ميديا. هدفي نشر الوعي الصحي الصحيح بعيداً عن الخرافات والتسويق الكاذب."
                </p>

                <div className="grid grid-cols-3 gap-3">
                    <a
                        href={`https://instagram.com/${doctorInfo.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 transition-all duration-300"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                            <Instagram className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-700">Instagram</span>
                    </a>

                    <a
                        href={`https://tiktok.com/@${doctorInfo.tiktok}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-slate-500/10 to-slate-800/10 hover:from-slate-500/20 hover:to-slate-800/20 transition-all duration-300"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                            </svg>
                        </div>
                        <span className="text-xs font-medium text-slate-700">TikTok</span>
                    </a>

                    <a
                        href={`https://youtube.com/@${doctorInfo.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 transition-all duration-300"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                            <Youtube className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-700">YouTube</span>
                    </a>
                </div>
            </div>
        </motion.section>
    );
};

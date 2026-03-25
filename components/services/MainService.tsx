import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Clock, Check, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { haptic } from '@/lib/HapticFeedback';
import { mainService, whatsappLink } from './data';

export const MainService = () => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-bold text-slate-800">الخدمة الرئيسية</h2>
            </div>

            <div className="relative overflow-hidden rounded-3xl shadow-xl">
                <div className="absolute inset-0 gradient-primary" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

                <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Brain className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{mainService.title}</h3>
                            <div className="flex items-center gap-2 text-white/80">
                                <Clock className="w-4 h-4" />
                                <span>{mainService.duration}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 mb-6">
                        {mainService.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-white/90" />
                                <span className="text-white/90">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <span className="bg-primary-dark text-white text-xs font-bold px-3 py-1 rounded-full">
                                سعر الإطلاق
                            </span>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white/80">السعر</span>
                            <div className="text-left">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">{mainService.price_yer}</span>
                                    <span className="text-white/80">ر.ي</span>
                                </div>
                                <p className="text-white/60 text-sm">
                                    أو <span className="font-bold text-white">{mainService.price_sar}</span> ر.س
                                </p>
                            </div>
                        </div>
                    </div>

                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" onClick={() => haptic.impact()}>
                        <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-xl h-14 text-lg font-bold shadow-lg group">
                            <MessageCircle className="w-5 h-5 ml-2" />
                            احجز جلستك الآن عبر WhatsApp
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                    </a>
                </div>
            </div>
        </motion.section>
    );
};

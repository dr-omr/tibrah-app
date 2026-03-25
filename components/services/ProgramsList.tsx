import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star, Check, ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { haptic } from '@/lib/HapticFeedback';
import { programs, whatsappLink } from './data';

export const ProgramsList = () => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-black text-slate-800">برامج المتابعة الشخصية</h2>
            </div>

            <div className="space-y-4">
                {programs.map((program) => (
                    <div
                        key={program.id}
                        className={`relative overflow-hidden rounded-3xl transition-all duration-500 ${program.popular ? 'ring-2 ring-primary shadow-glow' : ''
                            }`}
                    >
                        {program.popular && (
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-primary-light text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl z-10">
                                <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3" fill="currentColor" />
                                    الأكثر شعبية
                                </span>
                            </div>
                        )}

                        <div className={`absolute inset-0 bg-gradient-to-br ${program.bgColor}`} />

                        <div className="relative glass backdrop-blur-sm p-5">
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${program.color} flex items-center justify-center shadow-lg text-3xl`}>
                                    {program.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">{program.title}</h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline" className="text-xs border-slate-300">
                                            {program.duration}
                                        </Badge>
                                        <span className="text-xs text-slate-500">{program.slogan}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-600 text-sm mb-4">{program.description}</p>

                            <div className="grid grid-cols-1 gap-2 mb-4">
                                {program.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${program.color} flex items-center justify-center flex-shrink-0`}>
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm text-slate-600">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                <p className="text-sm text-slate-500">
                                    السعر يُحدد بعد التجربة المجانية
                                </p>
                                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" onClick={() => haptic.impact()}>
                                    <Button
                                        className={`rounded-xl px-5 ${program.popular
                                            ? `bg-gradient-to-r ${program.color} text-white hover:opacity-90 shadow-lg`
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                    >
                                        {program.cta || 'ابدأ الآن'}
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.section>
    );
};

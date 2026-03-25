import React from 'react';
import Link from 'next/link';
import { Trophy, Award, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '@/utils';

export const CertificateBanner = () => {
    return (
        <div className="px-4 pt-5">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 overflow-hidden">
                {/* Accent bar */}
                <div className="h-1 bg-gradient-to-r from-primary via-amber-400 to-primary" />
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-amber-100/80 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-0.5">احصل على شهادة معتمدة</h3>
                            <p className="text-xs text-slate-400 mb-3 leading-relaxed">أكمل أي دورة واحصل على شهادة إتمام موثقة</p>
                            <div className="flex flex-wrap gap-2">
                                <Link href={createPageUrl('BookAppointment')}>
                                    <Button className="rounded-full bg-primary text-white text-xs h-8 px-4 shadow-sm">
                                        <Award className="w-3.5 h-3.5 ml-1.5" />
                                        ابدأ رحلتك
                                    </Button>
                                </Link>
                                <a
                                    href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20الاستفسار%20عن%20الدورات"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" className="rounded-full text-xs h-8 px-4 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                        <MessageCircle className="w-3.5 h-3.5 ml-1.5" />
                                        استفسر الآن
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Users, Clock, Star, Verified, Sparkles, Heart, Brain, Activity, Calendar, ArrowLeft, LucideIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createPageUrl } from '../../utils';

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

export default function DoctorIntro() {
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
        <section className="relative overflow-hidden">
            {/* Premium Hero Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D9B83]/5 via-white to-[#D4AF37]/5" />
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#2D9B83]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl translate-x-1/2" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

            <div className="relative px-6 py-8">
                {/* Header with Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 glass rounded-2xl px-6 py-3 mb-6 shadow-lg">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-gradient block">طِبرَا</span>
                            <span className="text-xs text-slate-500">Tibrah Medical</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800 mb-3">عيادتك الرقمية</h1>
                    <p className="text-slate-500 text-lg">نفهم جسمك ونعالج الجذور 🌿</p>
                </div>

                {/* Doctor Hero Card - Premium Design */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 gradient-primary rounded-[2rem] blur-xl opacity-20 transform scale-95" />
                    <div className="relative glass rounded-[2rem] p-1 shadow-2xl">
                        <div className="bg-gradient-to-br from-white/80 to-white/40 rounded-[1.75rem] p-6">
                            <div className="flex flex-col items-center text-center">
                                {/* Doctor Image - Premium Frame */}
                                <div className="relative mb-6">
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
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                                        <Verified className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -left-2 w-8 h-8 gradient-gold rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                                        <Star className="w-4 h-4 text-white fill-white" />
                                    </div>
                                </div>

                                {/* Doctor Info */}
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className="text-2xl font-bold text-slate-800">د. عمر العماد</h2>
                                    <Badge className="gradient-gold text-white text-[10px] border-0 shadow-md">معتمد</Badge>
                                </div>
                                <p className="text-[#2D9B83] font-semibold mb-4 text-lg">
                                    استشاري الطب الوظيفي والتكاملي
                                </p>
                                <p className="text-slate-500 leading-relaxed max-w-sm mb-5">
                                    يا حياك الله.. أنا هنا عشان أساعدك تفهم جسمك صح، ونعالج المشكلة من جذورها مش بس نسكن الوجع.
                                    خبرتي في الطب الوظيفي والترددات الشفائية كلها تحت أمرك عشان ترجع لك عافيتك بإذن الله.
                                </p>

                                {/* CTA Button */}
                                <Link href={createPageUrl('BookAppointment')} className="w-full max-w-xs">
                                    <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#2D9B83] to-[#3FB39A] text-white font-bold text-lg shadow-lg shadow-[#2D9B83]/30 hover:shadow-[#2D9B83]/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                                        <Calendar className="w-5 h-5 ml-2" />
                                        احجز استشارتك الآن
                                        <ArrowLeft className="w-5 h-5 mr-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats - Premium Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="relative group"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-all duration-500`} />
                                <div className="relative glass rounded-2xl p-4 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                                    <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Certifications - Premium Grid */}
                <div className="glass rounded-3xl p-5 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                            <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-slate-800 block">التخصصات والشهادات</span>
                            <span className="text-xs text-slate-500">Certifications</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {certifications.map((cert, index) => {
                            const Icon = cert.icon;
                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-[#2D9B83]/5 to-[#2D9B83]/10 hover:from-[#2D9B83]/10 hover:to-[#2D9B83]/20 transition-all duration-300"
                                >
                                    <Icon className="w-4 h-4 text-[#2D9B83]" />
                                    <span className="text-sm font-medium text-slate-700">{cert.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
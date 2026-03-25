import React, { useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ArrowRight, Heart, Shield, Target, Sparkles, Activity,
    BookOpen, Stethoscope, Leaf, MapPin, Instagram, MessageCircle,
    PlayCircle, CheckCircle2, Award, Zap, Brain
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { useRouter } from 'next/router';

const features = [
    {
        icon: Stethoscope,
        title: 'الطب الوظيفي الجذري',
        description: 'نرفض تسكين الأعراض. نبحث عن الخلل الخلوي ونصلحه من الجذور.'
    },
    {
        icon: Brain,
        title: 'الربط النفس-جسدي',
        description: 'نؤمن أن كل مرض جسدي يسبقه صدمة أو وعكة شعورية لم تُفرغ.'
    },
    {
        icon: Zap,
        title: 'الترددات الحيوية',
        description: 'نستخدم ترددات رايف لفتح مسارات الخلايا وإعادتها لذبذبة التعافي الطبيعية.'
    },
    {
        icon: Shield,
        title: 'رعاية لا متناهية',
        description: 'شراكة طبية مستمرة، لسنا مجرد عيادة تزورها لدقائق معدودة.'
    }
];

const credentials = [
    "البورد الأمريكي في الطب الوظيفي والتكاملي",
    "عضو الأكاديمية الأمريكية لمكافحة الشيخوخة",
    "خبير معتمد في التغذية العلاجية المتقدمة",
    "ممارس معتمد في الطب الشعوري والترددي",
    "خبرة سريرية تتجاوز 15 عاماً في الحالات المستعصية"
];

export default function About() {
    const router = useRouter();
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, 250]);
    const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
    const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);

    const scaleImg = useTransform(scrollY, [0, 1000], [1, 1.15]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-teal-500/20 font-sans pb-24 overflow-x-hidden">
            <Head>
                <title>طِبرَا | القصة والرؤية</title>
                <meta name="theme-color" content="#f8fafc" />
            </Head>

            {/* ═══ Header ═══ */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5">
                <button
                    onClick={() => { haptic.selection(); router.back(); }}
                    className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <ArrowRight className="w-6 h-6 text-slate-600" />
                </button>
                <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-90 text-slate-500">The Story</div>
            </header>

            {/* ═══ Hero Section (Clean Bright) ═══ */}
            <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-white z-0" />
                <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-teal-50 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-emerald-50 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

                <motion.div style={{ opacity: opacityHero, y: y2 }} className="relative z-10 text-center max-w-4xl px-6 mt-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}
                        className="w-24 h-24 mx-auto mb-8 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center shadow-2xl shadow-slate-200/50"
                    >
                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-600 to-emerald-500">طِ</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                        className="text-4xl md:text-6xl font-black mb-6 leading-[1.2] tracking-tight text-slate-900"
                    >
                        نحن لا نكتفي ببرمجة مسكنات الآلام.<br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-600 via-teal-500 to-emerald-500">نحن نبني العافية.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="text-[15px] md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed"
                    >
                        عيادة رقمية فائقة التطور تدمج الطب الوظيفي، التحليل الشعوري، والذكاء الاصطناعي لتغيير مسار حياتك الصحي للأبد.
                    </motion.p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.5 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
                >
                    <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">الرحلة تبدأ هنا</span>
                    <div className="w-px h-16 bg-gradient-to-b from-teal-300 to-transparent" />
                </motion.div>
            </section>

            {/* ═══ The Philosophy (Bento Grind Layout) ═══ */}
            <section className="py-24 px-6 max-w-6xl mx-auto relative z-20">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-200 bg-teal-50 mb-6">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        <span className="text-[10px] font-bold tracking-widest text-teal-700 uppercase">عقيدة طِبرَا</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900">طب لا يساوم على صحتك.</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {features.map((feature, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            className="bg-white border border-slate-200 shadow-sm rounded-[32px] p-8 md:p-10 hover:shadow-xl hover:shadow-slate-200/50 hover:border-teal-200 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 group-hover:bg-teal-50 group-hover:border-teal-100 transition-all duration-500">
                                <feature.icon className="w-7 h-7 text-slate-400 group-hover:text-teal-600 transition-colors" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-slate-800">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium text-[15px]">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ Founder / Doctor Section ═══ */}
            <section className="py-32 relative overflow-hidden bg-white mt-12">
                <div className="absolute top-0 w-full h-px bg-slate-100" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[600px] bg-teal-50/50 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="aspect-[3/4] rounded-[40px] overflow-hidden border border-slate-200 bg-slate-100 relative group shadow-xl shadow-slate-200/50">
                            {/* NOTE: We removed the dark gradient overlay so the image looks bright and clear */}
                            <img 
                                src="/dr-omar.jpg" 
                                alt="د. عمر العماد" 
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&q=80' }}
                            />
                            
                            {/* Floating Badge */}
                            <div className="absolute bottom-8 right-8 z-20 bg-white/95 backdrop-blur-xl border border-slate-200 p-4 rounded-3xl shadow-xl">
                                <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map(i => <Award key={i} className="w-4 h-4 text-emerald-500" />)}
                                </div>
                                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">+15 سنة خبرة إكلينيكية</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">د. عمر العماد</h2>
                        <h3 className="text-xl text-teal-600 font-bold mb-8">المؤسس والمدير الطبي للطِبْرَا</h3>
                        
                        <p className="text-[15px] md:text-lg text-slate-600 leading-relaxed mb-8 font-medium">
                            "بعد سنوات من ممارسة الطب التقليدي، أدركت أننا كنا نقوم بإدارة الأمراض بدلاً من علاجها. رأيت مرضى يعودون مراراً بنفس الأعراض لأن أحداً لم يسأل: <strong className="text-teal-700">لماذا يحدث هذا حقاً؟</strong> طِبرَا وُلدت لتكون الإجابة."
                        </p>

                        <div className="space-y-4 mb-10 border-t border-b border-slate-100 py-6">
                            {credentials.map((cred, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center shrink-0 mt-0.5 border border-teal-100">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">{cred}</p>
                                </div>
                            ))}
                        </div>

                        <Link href="/book-appointment" onClick={() => haptic.success()}>
                            <button className="px-8 py-4 rounded-full bg-teal-600 text-white font-black hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shadow-xl shadow-teal-600/20">
                                احجز جلسة تشخيصية مع الدكتور
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ═══ Contact & Presence ═══ */}
            <section className="py-24 px-6 max-w-4xl mx-auto">
                <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/30 rounded-[40px] p-8 md:p-12 relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 blur-3xl rounded-full" />
                    
                    <h2 className="text-3xl font-black mb-4 relative z-10 text-slate-900">نحن دائماً بالقرب منك</h2>
                    <p className="text-slate-500 font-medium mb-12 relative z-10 max-w-xl mx-auto text-[15px]">
                        رغم أن عيادتنا رقمية عالمية، فريقنا وحضورنا يحيط بك في كل لحظة لضمان استمرارية رعايتك.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                        <a href="https://wa.me/967771447111" target="_blank" rel="noreferrer" className="bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/50 transition-colors p-6 rounded-3xl flex flex-col items-center gap-3 group">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                            <span className="font-bold text-emerald-800">واتساب العيادة</span>
                        </a>

                        <a href="https://instagram.com/dr.omr369" target="_blank" rel="noreferrer" className="bg-pink-50 border border-pink-100 hover:bg-pink-100/50 transition-colors p-6 rounded-3xl flex flex-col items-center gap-3 group">
                            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Instagram className="w-6 h-6 text-pink-600" />
                            </div>
                            <span className="font-bold text-pink-800">إنستغرام التوعوي</span>
                        </a>

                        <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl flex flex-col items-center gap-3 group cursor-default shadow-sm text-center">
                            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-slate-500" />
                            </div>
                            <span className="font-bold text-slate-700">اليمن - صنعاء (المركز)</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Minimal */}
            <div className="text-center pt-8 border-t border-slate-200 mx-6">
                <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4">
                    <span className="text-lg font-bold text-slate-800">طِ</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">
                    © {new Date().getFullYear()} TIBRAH MEDICAL. ALL RIGHTS RESERVED.
                </p>
            </div>
        </div>
    );
}

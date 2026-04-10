import React, { useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
    Settings, ShoppingBag, Gift, HelpCircle,
    Info, ChevronLeft, LogIn, User, BookOpen, GraduationCap,
    Heart, Radio, Crown, Shield, Activity,
    Sparkles, Utensils, Wind, Fingerprint, Zap, Brain, Hexagon,
    Target, Stethoscope, Droplets, Camera, Lock, FileText, Cloud
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';
import DomainHealthSummary from '@/components/sections/DomainHealthSummary';

/* ─── Premium Animation Variants ─── */
const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
};

const popIn = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 20 } }
};

/* ─── Bento Grid Tile ─── */
interface BentoTileProps {
    href: string;
    icon: React.ElementType;
    title: string;
    subtitle?: string;
    gradient: string;
    iconColor: string;
    size?: 'small' | 'medium' | 'large';
    badge?: string;
    pattern?: 'dots' | 'waves' | 'grid' | 'none';
}

function BentoTile({ href, icon: Icon, title, subtitle, gradient, iconColor, size = 'small', badge, pattern = 'none' }: BentoTileProps) {
    const colSpan = size === 'large' ? 'col-span-2' : 'col-span-1';
    const rowSpan = size === 'large' ? 'row-span-2' : size === 'medium' ? 'row-span-2' : 'row-span-1';

    return (
        <Link href={href} onClick={() => haptic.selection()} className={`${colSpan} ${rowSpan} block group`}>
            <motion.div
                variants={popIn}
                whileTap={{ scale: 0.96 }}
                className={`relative h-full w-full rounded-[32px] overflow-hidden p-5 ${gradient} border border-slate-200/60 shadow-lg shadow-slate-200/50 flex flex-col justify-between group-hover:border-teal-200 transition-all duration-500`}
            >
                {/* Visual Textures */}
                <div className="absolute inset-0 bg-white/40 mix-blend-overlay z-0" />

                {pattern === 'dots' && (
                    <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10 z-0 radial-grid-light" />
                )}
                {pattern === 'waves' && (
                    <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-white/30 to-transparent z-0 blur-xl" />
                )}

                {/* Glowing Aura on Hover */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/0 group-hover:bg-white/60 rounded-full blur-2xl transition-all duration-700 z-0" />

                {/* Top Section */}
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-[18px] backdrop-blur-md bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-500`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    {badge && (
                        <div className="px-3 py-1 rounded-full backdrop-blur-md bg-white border border-slate-100 shadow-sm">
                            <span className="text-[9px] font-black tracking-widest text-slate-700 uppercase">{badge}</span>
                        </div>
                    )}
                </div>

                {/* Bottom Section */}
                <div className="relative z-10 mt-auto">
                    <h3 className={`font-black text-slate-800 ${size === 'small' ? 'text-sm' : 'text-lg'} leading-tight mb-1 group-hover:text-teal-700 transition-colors`}>
                        {title}
                    </h3>
                    {subtitle && size !== 'small' && (
                        <p className="text-xs font-medium text-slate-500 leading-relaxed mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}

/* ─── Elegant List Item ─── */
interface ElegantRowProps {
    href: string;
    icon: React.ElementType;
    title: string;
    subtitle: string;
}

function ElegantRow({ href, icon: Icon, title, subtitle }: ElegantRowProps) {
    return (
        <Link href={href} onClick={() => haptic.selection()} className="group block mb-3 last:mb-0">
            <motion.div
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-[28px] bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300"
            >
                <div className="w-14 h-14 rounded-[20px] bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-teal-200 group-hover:bg-teal-50 transition-colors">
                    <Icon className="w-6 h-6 text-slate-400 group-hover:text-teal-500 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-black text-slate-800 mb-0.5 group-hover:text-teal-700 transition-colors">{title}</h4>
                    <p className="text-[11px] font-medium text-slate-500 truncate">{subtitle}</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
            </motion.div>
        </Link>
    );
}

export default function More() {
    const { user } = useAuth();
    const { scrollY } = useScroll();
    const bgY = useTransform(scrollY, [0, 1000], [0, 200]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden selection:bg-teal-500/20 pb-32">
            <Head><title>طِبرَا | المركز السيادي</title></Head>

            {/* ─── Cinematic Background Animations ─── */}
            <motion.div style={{ y: bgY }} className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-teal-100/50 rounded-full blur-[100px] mix-blend-multiply" />
                <div className="absolute top-[40%] right-[-20%] w-[60vw] h-[60vw] bg-emerald-100/40 rounded-full blur-[120px] mix-blend-multiply" />
            </motion.div>

            {/* ─── Sovereign Header ─── */}
            <header className="relative z-20 pt-16 pb-6 px-6">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 mb-4 shadow-sm">
                        <Hexagon className="w-3.5 h-3.5 text-teal-600" />
                        <span className="text-[9px] font-black tracking-[0.2em] text-teal-700 uppercase">Ecosystem Command</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-800 via-slate-700 to-slate-500 tracking-tight leading-tight">
                        المركز السيادي
                    </h1>
                </motion.div>
            </header>

            <main className="relative z-20 px-5 space-y-10">
                <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-10">

                    {/* ─── 00: الأقسام الخمسة — Domain Gateway ─── */}
                    <motion.section variants={popIn}>
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <div className="w-1 h-4 rounded-full flex-shrink-0"
                                style={{ background: 'linear-gradient(to bottom, #0D9488, #4F46E5)' }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-500">
                                أقسامك الخمسة
                            </span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {[
                                { emoji: '🫀', label: 'جسدي', color: '#0D9488', href: '/sections/jasadi' },
                                { emoji: '🧠', label: 'نفسي', color: '#7C3AED', href: '/sections/nafsi' },
                                { emoji: '📚', label: 'فكري', color: '#D97706', href: '/sections/fikri' },
                                { emoji: '✨', label: 'روحي', color: '#2563EB', href: '/sections/ruhi' },
                                { emoji: '⚙️', label: 'أخرى', color: '#475569', href: '/sections/other' },
                            ].map((d, i) => (
                                <Link key={d.href} href={d.href} onClick={() => haptic.tap()}>
                                    <motion.div
                                        whileTap={{ scale: 0.92 }}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="flex flex-col items-center gap-1.5 py-3 rounded-[18px]"
                                        style={{
                                            background: `${d.color}10`,
                                            border: `1.5px solid ${d.color}18`,
                                        }}>
                                        <span className="text-xl leading-none">{d.emoji}</span>
                                        <span className="text-[10px] font-black" style={{ color: d.color }}>{d.label}</span>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.section>

                    {/* ─── 00b: صحتك الشاملة — Health Rings ─── */}
                    <motion.section variants={popIn} className="-mx-1">
                        <DomainHealthSummary />
                    </motion.section>

                    {/* ─── 01: Profile Identity Vault ─── */}
                    <motion.section variants={popIn}>
                        {user ? (
                            <Link href={createPageUrl('Profile')} onClick={() => haptic.selection()}>
                                <div className="relative overflow-hidden rounded-[40px] bg-white border border-slate-200 p-1 shadow-xl shadow-slate-200/50 group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-teal-50 via-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    <div className="relative bg-white rounded-[36px] p-6 flex items-center gap-5">
                                        <div className="relative shrink-0">
                                            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-teal-400 to-emerald-500 p-[2px] shadow-lg shadow-teal-500/30">
                                                <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center">
                                                    <Fingerprint className="w-8 h-8 text-teal-500" />
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-xl font-black text-slate-800 truncate">{user.name || 'هوية مشفرة'}</h2>
                                                <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                                            </div>
                                            <p className="text-xs text-slate-500 truncate mb-3 font-medium">{user.email}</p>
                                            <div className="flex gap-2">
                                                <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-[10px] font-bold text-teal-700">ملف طبي نشط</span>
                                                <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-700">النسخة الاحترافية</span>
                                            </div>
                                        </div>
                                        <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-teal-500 transition-colors shrink-0" />
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <Link href={createPageUrl('Login')} onClick={() => haptic.selection()}>
                                <div className="relative overflow-hidden rounded-[40px] p-1 bg-white border border-slate-200 shadow-xl shadow-slate-200/50 group">
                                    <div className="relative bg-white rounded-[36px] p-6 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors shadow-sm">
                                            <Lock className="w-8 h-8 text-slate-400 group-hover:text-teal-500 transition-colors" />
                                        </div>
                                        <h2 className="text-xl font-black text-slate-800 mb-2">النظام مقفل</h2>
                                        <p className="text-xs text-slate-500 font-medium mb-6 max-w-xs mx-auto">قم بتسجيل الدخول لفك تشفير بياناتك البيولوجية والوصول للمركز السيادي.</p>
                                        <div className="px-8 py-3 rounded-full bg-slate-800 text-white font-black text-sm hover:scale-105 transition-transform w-full shadow-lg shadow-slate-800/20">
                                            فك التشفير الآن
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </motion.section>

                    {/* ─── 02: Core Diagnostics (Bento Grid) ─── */}
                    <section>
                        <div className="flex items-center gap-3 mb-5 px-2">
                            <Activity className="w-5 h-5 text-teal-600" />
                            <h3 className="text-[11px] font-black tracking-[0.15em] text-slate-500 uppercase">المسح والتحليل المتقدم</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3 auto-rows-[120px]">
                            {/* Medical Dossier - Large Tile */}
                            <BentoTile
                                href={createPageUrl('MedicalFile')}
                                icon={Stethoscope}
                                title="الخزنة الطبية"
                                subtitle="دفتِرك البيولوجي المُشفّر والتاريخ الصحي الدقيق."
                                gradient="bg-gradient-to-br from-indigo-50 to-blue-50"
                                iconColor="text-indigo-600"
                                size="large"
                                badge="أداة رئيسية"
                                pattern="grid"
                            />

                            {/* Body Map - Medium Tile */}
                            <BentoTile
                                href={createPageUrl('BodyMap')}
                                icon={User}
                                title="الخريطة الحيوية"
                                gradient="bg-gradient-to-br from-teal-50 to-emerald-50"
                                iconColor="text-teal-600"
                                size="medium"
                                pattern="dots"
                            />

                            {/* Symptom Checker - NEW */}
                            <BentoTile
                                href="/symptom-checker"
                                icon={Brain}
                                title="مدقق الأعراض"
                                subtitle="استبيان ذكي بمعايير إكلينيكية"
                                gradient="bg-gradient-to-br from-violet-50 to-purple-50"
                                iconColor="text-violet-600"
                                size="medium"
                                badge="جديد"
                            />

                            {/* Health Tracker - Small Tile */}
                            <BentoTile
                                href={createPageUrl('HealthTracker')}
                                icon={Target}
                                title="الرادار الحيوي"
                                gradient="bg-gradient-to-br from-rose-50 to-pink-50"
                                iconColor="text-rose-600"
                            />
                        </div>
                    </section>

                    {/* ─── 03: The Healing Matrix (Bento Grid) ─── */}
                    <section>
                        <div className="flex items-center gap-3 mb-5 px-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            <h3 className="text-[11px] font-black tracking-[0.15em] text-slate-500 uppercase">مصفوفة التشافي الطاقي</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3 h-[240px]">
                            <BentoTile
                                href={createPageUrl('Frequencies')}
                                icon={Radio}
                                title="الترددات الذكية"
                                subtitle="ميكانيكا الكم وموجات رايف"
                                gradient="bg-gradient-to-br from-sky-50 to-blue-50"
                                iconColor="text-sky-600"
                                size="large"
                                pattern="waves"
                            />

                            <BentoTile
                                href={createPageUrl('Breathe')}
                                icon={Wind}
                                title="التنفس الجذري"
                                gradient="bg-gradient-to-br from-cyan-50 to-teal-50"
                                iconColor="text-cyan-600"
                                size="small"
                            />

                            <BentoTile
                                href={createPageUrl('MealPlanner')}
                                icon={Utensils}
                                title="المحرك الأيضي"
                                gradient="bg-gradient-to-br from-orange-50 to-amber-50"
                                iconColor="text-orange-600"
                                size="small"
                            />
                        </div>
                    </section>

                    {/* ─── 04: Arsenal & Knowledge (Elegant Rows) ─── */}
                    <section>
                        <div className="flex items-center gap-3 mb-5 px-2">
                            <Brain className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-[11px] font-black tracking-[0.15em] text-slate-500 uppercase">ترسانة الوعي والإمداد</h3>
                        </div>

                        <div className="space-y-0">
                            {/* Health Report — NEW */}
                            <ElegantRow
                                href="/health-report"
                                icon={FileText}
                                title="التقرير الصحي الشامل 📊"
                                subtitle="تحليل أسبوعي/شهري مع توصيات ذكية مخصصة لك."
                            />
                            <ElegantRow
                                href={createPageUrl('Shop')}
                                icon={ShoppingBag}
                                title="مدير الإمداد الميكروبي (الصيدلية الذكية)"
                                subtitle="بروتوكولات علاجية ومكملات مسعرة ذكياً لحالتك."
                            />
                            <ElegantRow
                                href={createPageUrl('Courses')}
                                icon={GraduationCap}
                                title="أكاديمية طِبرَا المتقدمة"
                                subtitle="دورات تشافي ذاتي بمستوى الأطباء."
                            />
                            <ElegantRow
                                href={createPageUrl('Library')}
                                icon={BookOpen}
                                title="مكتبة الوعي الجذري"
                                subtitle="أبحاث، مقالات حصرية، وتثقيف طبي لا يُنشر."
                            />
                            <ElegantRow
                                href={createPageUrl('Rewards')}
                                icon={Gift}
                                title="خزنة المكتسبات البيولوجية"
                                subtitle="نقاطك، مستوياتك المنجزة، والمكافآت الطبية."
                            />
                        </div>
                    </section>

                    {/* ─── 05: Core System Controls ─── */}
                    <section>
                        <div className="flex items-center gap-3 mb-5 px-2">
                            <Settings className="w-5 h-5 text-slate-400" />
                            <h3 className="text-[11px] font-black tracking-[0.15em] text-slate-500 uppercase">إدارة النظام</h3>
                        </div>

                        <div className="bg-white border border-slate-200 shadow-sm rounded-[32px] overflow-hidden">
                            <Link href={createPageUrl('Settings')} onClick={() => haptic.selection()} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors border-b border-slate-100">
                                <Settings className="w-5 h-5 text-slate-400" />
                                <span className="flex-1 text-sm font-bold text-slate-700">إعدادات التشفير والواجهة</span>
                                <ChevronLeft className="w-4 h-4 text-slate-400" />
                            </Link>
                            <Link href={createPageUrl('Help')} onClick={() => haptic.selection()} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors border-b border-slate-100">
                                <HelpCircle className="w-5 h-5 text-slate-400" />
                                <span className="flex-1 text-sm font-bold text-slate-700">بروتوكول الدعم العاجل</span>
                                <ChevronLeft className="w-4 h-4 text-slate-400" />
                            </Link>
                            <Link href={createPageUrl('About')} onClick={() => haptic.selection()} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
                                <Shield className="w-5 h-5 text-teal-600" />
                                <span className="flex-1 text-sm font-bold text-teal-700">العقيدة الطبية لطِبرَا</span>
                                <ChevronLeft className="w-4 h-4 text-slate-400" />
                            </Link>
                        </div>
                    </section>
                </motion.div>

                {/* ─── Premium Footer Signature ─── */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="pt-8 pb-12 text-center">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4">
                        <span className="text-xl font-black text-slate-800">طِ</span>
                    </div>
                    <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase mb-1">T I B R A H</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase">Secured Neural Health Hub • v2.0</p>
                </motion.div>
            </main>
        </div>
    );
}

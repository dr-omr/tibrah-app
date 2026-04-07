'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import {
    X, Settings, ShoppingBag, Gift, HelpCircle,
    Info, ChevronLeft, LogIn, User,
    Heart, Radio, Crown, Shield,
    Utensils, Wind, Sparkles, LogOut, Activity, GraduationCap,
    HeartPulse, Calendar, Brain, TrendingUp, Star, FileText
} from 'lucide-react';
import { useHealthDashboard } from '@/hooks/useHealthDashboard';

/* ─── Reusable Menu Row ─── */
interface MenuItemProps {
    href: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    label: string;
    description?: string;
    external?: boolean;
    badge?: string;
    onClose: () => void;
}

function MenuItem({ href, icon: Icon, iconColor, iconBg, label, description, external, badge, onClose }: MenuItemProps) {
    const Wrapper = external ? 'a' : Link;
    const extraProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

    return (
        <Wrapper
            href={href}
            className="flex items-center gap-3.5 px-4 py-3 active:bg-slate-50/80 dark:active:bg-slate-700/50 transition-all duration-200"
            onClick={() => {
                haptic.tap();
                uiSounds.tap();
                onClose();
            }}
            {...(extraProps as any)}
        >
            <div className={`w-8 h-8 rounded-[10px] ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`${iconColor}`} style={{ width: 15, height: 15 }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-slate-800 dark:text-white">{label}</p>
                    {badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white leading-none">
                            {badge}
                        </span>
                    )}
                </div>
                {description && <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>}
            </div>
            <ChevronLeft className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
        </Wrapper>
    );
}

/* ─── Section Label ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="px-4 text-[9.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wide mb-1 mt-5 uppercase">
            {children}
        </p>
    );
}

/* ─── Featured Tool Card ─── */
function FeaturedCard({ href, icon: Icon, gradient, title, subtitle, badge, onClose }: {
    href: string; icon: React.ElementType; gradient: string; title: string; subtitle: string; badge?: string; onClose: () => void;
}) {
    return (
        <Link href={href} onClick={() => { haptic.tap(); onClose(); }}>
            <motion.div
                className={`relative overflow-hidden rounded-2xl p-4 ${gradient}`}
                whileTap={{ scale: 0.97 }}
            >
                {/* Decorative accent */}
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl bg-white/10 pointer-events-none" />
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <Icon className="w-4.5 h-4.5 text-white" />
                        </div>
                        {badge && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                                {badge}
                            </span>
                        )}
                    </div>
                    <h3 className="text-[13px] font-bold text-white leading-tight">{title}</h3>
                    <p className="text-[10px] text-white/60 mt-0.5">{subtitle}</p>
                </div>
            </motion.div>
        </Link>
    );
}


/* ═══════════════════════════════════════
   HEADER MENU — Slide-over panel
   ═══════════════════════════════════════ */
interface HeaderMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HeaderMenu({ isOpen, onClose }: HeaderMenuProps) {
    const { user, signOut } = useAuth();
    const dashboard = useHealthDashboard();

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />

                    {/* Slide-over Panel — Liquid Glass */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                        className="fixed top-0 right-0 bottom-0 w-[82vw] max-w-[340px] z-[70] overflow-y-auto"
                        style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(245,247,250,0.78) 100%)',
                            backdropFilter: 'blur(40px) saturate(200%)',
                            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                            boxShadow: '-20px 0 60px rgba(0,0,0,0.08), inset 1px 0 0 rgba(255,255,255,0.7)',
                        }}
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', boxShadow: 'inset 0 -0.5px 0 rgba(0,0,0,0.06)' }}>
                            <h2 className="text-[14px] font-bold text-slate-800 dark:text-white">القائمة</h2>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => { haptic.tap(); onClose(); }}
                                className="w-8 h-8 rounded-[10px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </motion.button>
                        </div>

                        <div className="px-3 pb-10">
                            {/* ─── Profile / Sign-in Card ─── */}
                            <div className="mt-3">
                                {user ? (
                                    <Link href={createPageUrl('Profile')} onClick={() => { haptic.tap(); onClose(); }}>
                                        <motion.div
                                            className="relative overflow-hidden rounded-2xl liquid-card"
                                            whileTap={{ scale: 0.985 }}
                                        >
                                            {/* Gradient accent */}
                                            <div className="absolute inset-0 bg-gradient-to-bl from-teal-50/40 via-transparent to-emerald-50/20 dark:from-teal-900/10 dark:via-transparent dark:to-emerald-900/5" />
                                            
                                            {/* User info */}
                                            <div className="relative p-4 pb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border-2 border-white dark:border-slate-700 ring-1 ring-slate-100 dark:ring-slate-700">
                                                            {user.photoURL ? (
                                                                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-500">
                                                                    <span className="text-white font-bold text-lg">
                                                                        {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[2px] border-white dark:border-slate-800" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[14px] font-bold text-slate-800 dark:text-white truncate">
                                                            {user.name || 'المستخدم'}
                                                        </p>
                                                        <p className="text-[10.5px] text-slate-400 truncate mt-0.5">{user.email}</p>
                                                    </div>
                                                    <ChevronLeft className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                                                </div>
                                            </div>

                                            {/* Health status mini-bar */}
                                            <div className="relative px-4 pb-3.5 pt-1.5 border-t border-slate-50 dark:border-slate-700/40">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 flex-1">
                                                        <div className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-500/15 flex items-center justify-center">
                                                            <HeartPulse className="w-3 h-3 text-teal-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                                                <motion.div
                                                                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${dashboard.healthScore}%` }}
                                                                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">{dashboard.healthScoreAr}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-100/60 dark:border-amber-500/20">
                                                        <span className="text-[10px]">🔥</span>
                                                        <span className="text-[9px] font-bold text-amber-700 dark:text-amber-200">{dashboard.streakAr}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ) : (
                                    <motion.div
                                        className="relative overflow-hidden rounded-2xl liquid-card"
                                        whileTap={{ scale: 0.985 }}
                                    >
                                        {/* Premium gradient accent */}
                                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 bg-teal-400 pointer-events-none" />
                                        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-15 bg-indigo-400 pointer-events-none" />

                                        <div className="relative p-4 pb-3">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-500/20">
                                                    <LogIn className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[14px] font-bold text-slate-800 dark:text-white">تسجيل الدخول</p>
                                                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">سجّل للوصول لكل المميزات</p>
                                                </div>
                                            </div>

                                            {/* Quick benefits */}
                                            <div className="flex gap-2 mb-3">
                                                {[
                                                    { icon: Brain, label: 'تقييم ذكي', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-500/10' },
                                                    { icon: Calendar, label: 'حجز موعد', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                                                    { icon: TrendingUp, label: 'متابعة', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                                                ].map((item) => (
                                                    <div key={item.label} className={`flex items-center gap-1 px-2 py-1 rounded-lg ${item.bg}`}>
                                                        <item.icon className={`w-2.5 h-2.5 ${item.color}`} />
                                                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Link href={createPageUrl('Login')} onClick={() => { haptic.tap(); onClose(); }}>
                                            <div className="relative mx-4 mb-4 px-4 py-3 rounded-xl bg-gradient-to-l from-teal-600 to-emerald-600 text-white font-bold text-[13px] text-center shadow-md shadow-teal-500/20 hover:shadow-lg transition-shadow">
                                                تسجيل الدخول
                                            </div>
                                        </Link>
                                    </motion.div>
                                )}
                            </div>

                            {/* ─── Core Health Tools ─── */}
                            <SectionLabel>الخطة والعناية</SectionLabel>
                            <div className="grid grid-cols-2 gap-2 px-1">
                                <FeaturedCard
                                    href={createPageUrl('MealPlanner')}
                                    icon={Utensils}
                                    gradient="bg-gradient-to-br from-orange-500 to-amber-500"
                                    title="مخطط الوجبات"
                                    subtitle="نظامك الغذائي"
                                    badge="مهم"
                                    onClose={onClose}
                                />
                                <FeaturedCard
                                    href={createPageUrl('HealthTracker')}
                                    icon={Activity}
                                    gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                                    title="المتابعة اليومية"
                                    subtitle="سجل مؤشراتك"
                                    onClose={onClose}
                                />
                            </div>

                            {/* ─── Quick Health Score Card (Logged-in only) ─── */}
                            {user && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="mt-3 mx-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl bg-teal-500/10 pointer-events-none" />
                                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center">
                                                    <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
                                                </div>
                                                <span className="text-[12px] font-bold text-white">ملخص صحتك</span>
                                            </div>
                                            <span className="text-[18px] font-black text-teal-400">{dashboard.healthScoreAr}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${dashboard.healthScore}%` }}
                                                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[9px] text-slate-500">الماء: {dashboard.waterAr} أكواب</span>
                                            <span className="text-[9px] text-slate-500">النوم: {dashboard.sleepHoursLabel} ساعات</span>
                                            <span className="text-[9px] text-amber-400">🔥 {dashboard.streakAr} يوم</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ─── Wellness & Alternative Care ─── */}
                            <SectionLabel>العلاجات الداعمة والتأمل</SectionLabel>
                            <div className="mt-1 liquid-card rounded-2xl divide-y divide-slate-50/50 dark:divide-slate-700/30 overflow-hidden">
                                <MenuItem
                                    href={createPageUrl('Breathe')}
                                    icon={Wind}
                                    iconColor="text-cyan-500"
                                    iconBg="bg-cyan-50 dark:bg-cyan-900/30"
                                    label="تمارين التنفس"
                                    description="جلسات تأمل واسترخاء"
                                    onClose={onClose}
                                />
                                <MenuItem
                                    href={createPageUrl('Frequencies')}
                                    icon={Radio}
                                    iconColor="text-indigo-500"
                                    iconBg="bg-indigo-50 dark:bg-indigo-900/30"
                                    label="الترددات العلاجية"
                                    description="علاج تكميلي بالترددات"
                                    onClose={onClose}
                                />
                            </div>

                            {/* ─── Clinical Tools (NEW) ─── */}
                            <SectionLabel>أدوات التشخيص والتحليل</SectionLabel>
                            <div className="liquid-card rounded-2xl divide-y divide-slate-50/50 dark:divide-slate-700/30 overflow-hidden">
                                <MenuItem
                                    href="/symptom-checker"
                                    icon={Brain}
                                    iconColor="text-violet-600"
                                    iconBg="bg-violet-50 dark:bg-violet-900/30"
                                    label="مدقق الأعراض الذكي"
                                    description="استبيان إكلينيكي بمعيار SOCRATES"
                                    badge="جديد"
                                    onClose={onClose}
                                />
                                <MenuItem
                                    href="/health-report"
                                    icon={FileText}
                                    iconColor="text-teal-600"
                                    iconBg="bg-teal-50 dark:bg-teal-900/30"
                                    label="التقرير الصحي الشامل"
                                    description="تحليل دوري + توصيات مخصصة PDF"
                                    onClose={onClose}
                                />
                            </div>

                            {/* ─── Commerce & Services ─── */}
                            <SectionLabel>الخدمات والاشتراكات</SectionLabel>
                            <div className="liquid-card rounded-2xl divide-y divide-slate-50/50 dark:divide-slate-700/30 overflow-hidden">
                                <MenuItem
                                    href={createPageUrl('Shop')}
                                    icon={ShoppingBag}
                                    iconColor="text-emerald-500"
                                    iconBg="bg-emerald-50 dark:bg-emerald-900/30"
                                    label="الصيدلية والمكملات"
                                    description="علاجات ومنتجات صحية"
                                    onClose={onClose}
                                />
                                <MenuItem
                                    href={createPageUrl('Premium')}
                                    icon={Sparkles}
                                    iconColor="text-purple-500"
                                    iconBg="bg-purple-50 dark:bg-purple-900/30"
                                    label="طِبرَا+"
                                    description="اشتراك بريميوم وبرامج VIP"
                                    onClose={onClose}
                                />
                                <MenuItem
                                    href={createPageUrl('Courses')}
                                    icon={GraduationCap}
                                    iconColor="text-orange-500"
                                    iconBg="bg-orange-50 dark:bg-orange-900/30"
                                    label="الدورات التعليمية"
                                    description="برامج صحية وتثقيفية"
                                    onClose={onClose}
                                />
                                <MenuItem
                                    href={createPageUrl('Rewards')}
                                    icon={Gift}
                                    iconColor="text-amber-500"
                                    iconBg="bg-amber-50 dark:bg-amber-900/30"
                                    label="المكافآت"
                                    description="نقاطك وتحدياتك اليومية"
                                    onClose={onClose}
                                />
                            </div>

                            {/* ─── Settings & Support ─── */}
                            <SectionLabel>الإعدادات والدعم</SectionLabel>
                            <div className="liquid-card rounded-2xl divide-y divide-slate-50/50 dark:divide-slate-700/30 overflow-hidden">
                                <MenuItem
                                    href={createPageUrl('Settings')}
                                    icon={Settings}
                                    iconColor="text-slate-400"
                                    iconBg="bg-slate-100 dark:bg-slate-700"
                                    label="الإعدادات"
                                    description="الإشعارات، المظهر، الخصوصية"
                                    onClose={onClose}
                                />
                                <MenuItem
                                    href={createPageUrl('Help')}
                                    icon={HelpCircle}
                                    iconColor="text-blue-500"
                                    iconBg="bg-blue-50 dark:bg-blue-900/30"
                                    label="المساعدة"
                                    description="أسئلة شائعة ودعم فني"
                                    onClose={onClose}
                                />
                                <MenuItem
                                    href={createPageUrl('About')}
                                    icon={Info}
                                    iconColor="text-slate-400"
                                    iconBg="bg-slate-50 dark:bg-slate-700"
                                    label="عن طِبرَا"
                                    description="من نحن ورسالتنا"
                                    onClose={onClose}
                                />
                            </div>

                            {/* ─── Sign Out ─── */}
                            {user && (
                                <div className="mt-5">
                                    <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => {
                                            signOut();
                                            haptic.impact();
                                            onClose();
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200/80 dark:border-red-900/30 text-red-500 font-bold text-[13px] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        تسجيل الخروج
                                    </motion.button>
                                </div>
                            )}

                            {/* ─── Footer ─── */}
                            <div className="text-center mt-7 pb-4">
                                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                    <Shield className="w-3 h-3 text-teal-400/60" />
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                        طِبرَا — العيادة الرقمية للطب الوظيفي
                                    </span>
                                </div>
                                <p className="text-[9px] text-slate-300 dark:text-slate-600 mb-1">
                                    الإصدار ٠.١.٠
                                </p>
                                <p className="text-[8px] text-slate-200 dark:text-slate-700">
                                    صحتك أولويتنا اليوم وكل يوم ❤️
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

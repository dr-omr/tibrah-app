// components/home/ShopStrip.tsx  ✦ V2 — Curated Shelf Edition
// Each card is a premium product tile, not a flat button.
// New: category tag, thumbnail-like gradient icon bg, "new" badge shimmer, hover lift

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Pill, ShoppingBag, BookOpen, Star, FileText, Stethoscope, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { STAGGER_ITEM, SPRING_BOUNCY } from '@/lib/tibrah-motion';

interface ShopCard {
    title:     string;
    sub:       string;
    category:  string;
    icon:      React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color:     string;
    gradient:  string;
    href:      string;
    badge?:    string;
    badgeColor?: string;
}

const ITEMS: ShopCard[] = [
    {
        title: 'المكملات',
        sub: 'فيتامونات · أوميجا ٣ · مغنيسيوم',
        category: 'صيدلية',
        icon: Pill, color: '#7c3aed',
        gradient: 'linear-gradient(145deg,#7c3aed,#8b5cf6)',
        href: createPageUrl('Shop'), badge: 'جديد', badgeColor: '#7c3aed',
    },
    {
        title: 'الصيدلية الذكية',
        sub: 'أدوية · وصفات · توصيل سريع',
        category: 'دواء',
        icon: ShoppingBag, color: '#1d4ed8',
        gradient: 'linear-gradient(145deg,#1d4ed8,#2563eb)',
        href: createPageUrl('SmartPharmacy'),
    },
    {
        title: 'المكتبة الطبية',
        sub: 'مقالات موثوقة · أبحاث حديثة',
        category: 'علم',
        icon: BookOpen, color: '#0d9488',
        gradient: 'linear-gradient(145deg,#0d9488,#14b8a6)',
        href: createPageUrl('Library'),
    },
    {
        title: 'كورسات الصحة',
        sub: 'برامج طبية · تغذية · لياقة',
        category: 'تعلّم',
        icon: Star, color: '#c2410c',
        gradient: 'linear-gradient(145deg,#c2410c,#ea580c)',
        href: createPageUrl('Courses'), badge: 'حصري', badgeColor: '#c2410c',
    },
    {
        title: 'عياداتنا',
        sub: 'أطباء معتمدون · حجز فوري',
        category: 'طب',
        icon: Stethoscope, color: '#0891b2',
        gradient: 'linear-gradient(145deg,#0891b2,#0ea5e9)',
        href: createPageUrl('MyAppointments'),
    },
    {
        title: 'الأرشيف الطبي',
        sub: 'تقاريرك · تحاليلك · وثائقك',
        category: 'ملفات',
        icon: FileText, color: '#64748b',
        gradient: 'linear-gradient(145deg,#64748b,#94a3b8)',
        href: '/medical-history',
    },
];

/* ── Badge with shimmer ── */
function Badge({ text, color }: { text: string; color: string }) {
    return (
        <div className="relative overflow-hidden inline-flex items-center px-2 py-0.5 rounded-full"
            style={{ background: color }}>
            <motion.div className="absolute inset-y-0 w-6 bg-white/30 skew-x-[-20deg]"
                animate={{ left: ['-24px', '80px'] }}
                transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 3 }} />
            <span className="relative z-10 text-[8px] font-black text-white">{text}</span>
        </div>
    );
}

export function ShopStrip() {
    return (
        <motion.div variants={STAGGER_ITEM}>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2"
                style={{ scrollbarWidth: 'none' }}>

                {ITEMS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <Link key={i} href={item.href}
                            onClick={() => { haptic.selection(); uiSounds.navigate(); }}
                            className="flex-shrink-0">
                            <motion.div
                                whileTap={{ scale: 0.92, y: 2 }}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ ...SPRING_BOUNCY, delay: i * 0.07 }}
                                className="relative overflow-hidden flex flex-col rounded-[24px]"
                                style={{
                                    width: 118,
                                    background: 'rgba(255,255,255,0.94)',
                                    backdropFilter: 'blur(32px)',
                                    border: '1.5px solid rgba(0,0,0,0.07)',
                                    boxShadow: `0 4px 20px ${item.color}14, 0 1px 4px rgba(0,0,0,0.04)`,
                                }}>

                                {/* Gradient thumbnail area */}
                                <div className="relative flex items-center justify-center"
                                    style={{
                                        height: 72,
                                        background: item.gradient,
                                    }}>
                                    <Icon className="w-8 h-8 text-white" style={{ width: 32, height: 32 }} />

                                    {/* Category tag */}
                                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                                        <span className="text-[7.5px] font-black text-white">{item.category}</span>
                                    </div>

                                    {/* Badge */}
                                    {item.badge && (
                                        <div className="absolute -bottom-2 left-3">
                                            <Badge text={item.badge} color={item.badgeColor || item.color} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-3 pt-3.5 flex flex-col flex-1">
                                    <p className="text-[12.5px] font-black text-slate-800 dark:text-slate-100 leading-tight">{item.title}</p>
                                    <p className="text-[9.5px] text-slate-400 mt-1 leading-snug flex-1">{item.sub}</p>
                                    <div className="flex items-center justify-end mt-2">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                                            style={{ background: item.gradient }}>
                                            <ArrowLeft className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </motion.div>
    );
}

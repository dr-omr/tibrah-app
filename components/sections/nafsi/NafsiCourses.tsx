'use client';
/** NafsiCourses.tsx — الكورسات النفسية المدفوعة */
import React from 'react';
import Link from 'next/link';
import { Lock, GraduationCap } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { SubsectionPanel } from '@/components/sections/shared';
import type { SectionItem } from '@/components/sections/section-tokens';

const C  = '#7C3AED';
const CA = '#6D28D9';

const ITEMS: SectionItem[] = [
    { href: '/courses/emotional-regulation',  label: 'كورس تنظيم المشاعر',    sub: 'إتقان المشاعر — منهج متكامل',   badge: '👑 VIP', type: 'paid' },
    { href: '/courses/detachment',            label: 'كورس فك التعلّق',         sub: 'التحرر من الارتباطات المؤلمة',  badge: 'مميز',   type: 'paid' },
    { href: '/courses/self-reset',            label: 'كورس إعادة ضبط الذات',   sub: 'هوية جديدة من الداخل',          type: 'paid' },
    { href: '/courses/mind-body-course',      label: 'كورس النفس–جسد',         sub: 'الجسر بين مشاعرك وجسدك',        badge: 'جديد', isNew: true, type: 'paid' },
    { href: '/courses/mature-relationships',  label: 'كورس العلاقات الناضجة',  sub: 'بناء علاقات مبنية على الوعي',   type: 'paid' },
];

const footer = (
    <Link href="/premium" onClick={() => haptic.impact()}>
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-[18px]"
            style={{
                background: 'linear-gradient(145deg, rgba(124,58,237,0.07) 0%, rgba(255,255,255,0.82) 50%, rgba(124,58,237,0.04) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(124,58,237,0.16)',
                borderTop: '1px solid rgba(255,255,255,0.88)',
                boxShadow: '0 1.5px 0 rgba(255,255,255,0.92) inset, 0 4px 16px rgba(124,58,237,0.07)',
            }}>
            <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.18)' }}>
                <GraduationCap className="w-5 h-5" style={{ color: C }} />
            </div>
            <div className="flex-1">
                <p className="text-[12px] font-black text-slate-800">اشترك للوصول لجميع الكورسات</p>
                <p className="text-[9px] text-slate-400 mt-0.5">عضوية طِبرَا تتضمن كل الكورسات النفسية</p>
            </div>
            <Lock className="w-4 h-4 flex-shrink-0" style={{ color: '#C084FC' }} />
        </div>
    </Link>
);

export default function NafsiCourses() {
    return (
        <SubsectionPanel
            title="كورسات نفسية مدفوعة"
            icon="🎓"
            items={ITEMS}
            color={C} colorAlt={CA}
            index={4}
            footer={footer}
        />
    );
}

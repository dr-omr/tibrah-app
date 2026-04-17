'use client';
/** RuhiCourses.tsx — الكورسات الروحية المدفوعة */
import React from 'react';
import Link from 'next/link';
import { Lock, GraduationCap } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { SubsectionPanel } from '@/components/sections/shared';
import type { SectionItem } from '@/components/sections/section-tokens';

const C  = '#2563EB';
const CA = '#4F46E5';

const ITEMS: SectionItem[] = [
    { href: '/courses/back-to-nature',     label: 'كورس العودة للفطرة',       sub: 'اتصال عميق بجوهرك الحقيقي',      badge: '👑 VIP', type: 'paid' },
    { href: '/courses/inner-peace',        label: 'كورس السكينة الداخلية',    sub: 'سكون لا يتزعزع — منهج ٣٠ يوماً', badge: 'مميز',   type: 'paid' },
    { href: '/courses/frequencies-course', label: 'كورس الترددات والحضور',   sub: 'أعمق أثر الصوت في الشفاء',        type: 'paid' },
    { href: '/courses/meaning-balance',    label: 'كورس المعنى والاتزان',    sub: 'وضوح الرسالة وهدوء النفس',         badge: 'جديد', isNew: true, type: 'paid' },
];

const footer = (
    <Link href="/premium" onClick={() => haptic.impact()}>
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-[18px]"
            style={{
                background: 'linear-gradient(145deg, rgba(37,99,235,0.07) 0%, rgba(255,255,255,0.82) 50%, rgba(79,70,229,0.04) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(37,99,235,0.15)',
                borderTop: '1px solid rgba(255,255,255,0.88)',
                boxShadow: '0 1.5px 0 rgba(255,255,255,0.92) inset',
            }}>
            <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.18)' }}>
                <GraduationCap className="w-5 h-5" style={{ color: C }} />
            </div>
            <div className="flex-1">
                <p className="text-[12px] font-black text-slate-800">اشترك للوصول لجميع الكورسات</p>
                <p className="text-[9px] text-slate-400 mt-0.5">عضوية طِبرَا تتضمن كل الكورسات الروحية</p>
            </div>
            <Lock className="w-4 h-4 flex-shrink-0" style={{ color: '#60A5FA' }} />
        </div>
    </Link>
);

export default function RuhiCourses() {
    return (
        <SubsectionPanel
            title="كورسات روحية مدفوعة"
            icon="🎓"
            items={ITEMS}
            color={C} colorAlt={CA}
            index={4}
            footer={footer}
        />
    );
}

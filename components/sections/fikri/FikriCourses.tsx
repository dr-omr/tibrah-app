'use client';
/** FikriCourses.tsx — الكورسات الفكرية المدفوعة */
import React from 'react';
import Link from 'next/link';
import { Lock, GraduationCap } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { SubsectionPanel } from '@/components/sections/shared';
import type { SectionItem } from '@/components/sections/section-tokens';

const C  = '#D97706';
const CA = '#EA580C';

const ITEMS: SectionItem[] = [
    { href: '/courses/mind-rebuild',         label: 'كورس إعادة بناء العقل',     sub: 'ثورة في طريقة تفكيرك',          badge: '👑 VIP', type: 'paid' },
    { href: '/courses/kill-procrastination', label: 'كورس قتل التسويف',          sub: 'من المعرفة للتنفيذ الفوري',      badge: 'مميز',   type: 'paid' },
    { href: '/courses/limiting-beliefs',     label: 'كورس المعتقدات المحدِّدة',   sub: 'اكسر القيود الخفية',             type: 'paid' },
    { href: '/courses/word-power-course',    label: 'كورس قوة الكلمة',            sub: 'الكلمة التي تشفي وتدمر',         badge: 'جديد', isNew: true, type: 'paid' },
    { href: '/courses/discipline-success',   label: 'كورس الانضباط والنجاح',     sub: 'منظومة نجاح كاملة',              type: 'paid' },
];

const footer = (
    <Link href="/premium" onClick={() => haptic.impact()}>
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-[18px]"
            style={{
                background: 'linear-gradient(145deg, rgba(217,119,6,0.07) 0%, rgba(255,255,255,0.82) 50%, rgba(217,119,6,0.04) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(217,119,6,0.16)',
                borderTop: '1px solid rgba(255,255,255,0.88)',
                boxShadow: '0 1.5px 0 rgba(255,255,255,0.92) inset',
            }}>
            <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.18)' }}>
                <GraduationCap className="w-5 h-5" style={{ color: C }} />
            </div>
            <div className="flex-1">
                <p className="text-[12px] font-black text-slate-800">اشترك للوصول لجميع الكورسات</p>
                <p className="text-[9px] text-slate-400 mt-0.5">عضوية طِبرَا تتضمن كل الكورسات الفكرية</p>
            </div>
            <Lock className="w-4 h-4 flex-shrink-0" style={{ color: '#FBBF24' }} />
        </div>
    </Link>
);

export default function FikriCourses() {
    return (
        <SubsectionPanel
            title="كورسات فكرية مدفوعة"
            icon="🎓"
            items={ITEMS}
            color={C} colorAlt={CA}
            index={4}
            footer={footer}
        />
    );
}

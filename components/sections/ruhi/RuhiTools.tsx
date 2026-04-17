'use client';
/** RuhiTools.tsx — أدوات الروح اليومية */
import React from 'react';
import { SubsectionPanel } from '@/components/sections/shared';
import type { SectionItem } from '@/components/sections/section-tokens';

const C  = '#2563EB';
const CA = '#4F46E5';

const ITEMS: SectionItem[] = [
    { href: '/frequencies',       label: 'الترددات العلاجية',        sub: 'جلسات صوتية مباشرة',             type: 'practical' },
    { href: '/rife-frequencies',  label: 'ترددات رايف',              sub: 'بروتوكولات RIFE المتخصصة',      type: 'practical' },
    { href: '/radio',             label: 'راديو الاسترخاء',          sub: 'موسيقى علاجية وأصوات طبيعية',   type: 'practical' },
    { href: '/breathe',           label: 'تمارين التنفس الواعي',     sub: 'جلسات تأمل واسترخاء عميق',      type: 'practical' },
    { href: '/tools/gratitude',   label: 'ممارسة الامتنان اليومية',  sub: 'إعادة تشغيل طاقة الشكر',        type: 'practical' },
];

export default function RuhiTools() {
    return (
        <SubsectionPanel
            title="أدوات الروح اليومية"
            icon="🌿"
            items={ITEMS}
            color={C} colorAlt={CA}
            index={2}
        />
    );
}

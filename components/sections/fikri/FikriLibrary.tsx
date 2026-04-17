'use client';
/** FikriLibrary.tsx — مكتبة البصيرة */
import React from 'react';
import { SubsectionPanel } from '@/components/sections/shared';
import type { SectionItem } from '@/components/sections/section-tokens';

const C  = '#D97706';
const CA = '#EA580C';

const ITEMS: SectionItem[] = [
    { href: '/library',             label: 'المكتبة الصحية',    sub: 'مقالات وأبحاث موثوقة',         type: 'educational' },
    { href: '/glass-library',       label: 'Glass Library',     sub: 'تجربة قراءة غامرة ومميزة',      type: 'educational' },
    { href: '/library?domain=fikri', label: 'ملخصات الكتب',    sub: 'أهم ما في أفضل الكتب',          type: 'educational' },
    { href: '/library/mindmaps',    label: 'خرائط المفاهيم',    sub: 'أفكار معقدة بصياغة بصرية',      type: 'educational' },
];

export default function FikriLibrary() {
    return (
        <SubsectionPanel
            title="مكتبة البصيرة"
            icon="🏛️"
            items={ITEMS}
            color={C} colorAlt={CA}
            index={3}
        />
    );
}

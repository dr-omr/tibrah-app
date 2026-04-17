'use client';
/** RuhiLibrary.tsx — مكتبة الروح والوعي */
import React from 'react';
import { SubsectionPanel } from '@/components/sections/shared';
import type { SectionItem } from '@/components/sections/section-tokens';

const C  = '#2563EB';
const CA = '#4F46E5';

const ITEMS: SectionItem[] = [
    { href: '/library?domain=ruhi', label: 'مقالات روحية وفلسفية', sub: 'فكر · وعي · معنى · تناسق',   type: 'educational' },
    { href: '/library/meaning',     label: 'مكتبة المعنى',          sub: 'كتب وإلهام حول هدف الوجود',  type: 'educational' },
    { href: '/library/frequencies', label: 'علم الترددات',          sub: 'أبحاث وأثر الصوت العلاجي',   type: 'educational' },
];

export default function RuhiLibrary() {
    return (
        <SubsectionPanel
            title="مكتبة الروح والوعي"
            icon="🌟"
            items={ITEMS}
            color={C} colorAlt={CA}
            index={3}
        />
    );
}

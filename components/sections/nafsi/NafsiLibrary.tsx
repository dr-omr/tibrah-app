'use client';
/** NafsiLibrary.tsx — مكتبة الصحة النفسية */
import React from 'react';
import { SubsectionPanel } from '@/components/sections/shared';
import type { SectionItem } from '@/components/sections/section-tokens';

const C  = '#7C3AED';
const CA = '#6D28D9';

const ITEMS: SectionItem[] = [
    { href: '/library?domain=nafsi', label: 'مقالات نفسية',        sub: 'مكتبة علم النفس والعلاج',     type: 'educational' },
    { href: '/library/emotions',     label: 'دليل المشاعر',         sub: 'فهم كل شعور من جذره',          type: 'educational' },
    { href: '/library/relationships', label: 'مكتبة العلاقات',     sub: 'علاقات صحية وحدود واضحة',      type: 'educational' },
];

export default function NafsiLibrary() {
    return (
        <SubsectionPanel
            title="مكتبة الصحة النفسية"
            icon="📖"
            items={ITEMS}
            color={C} colorAlt={CA}
            index={3}
        />
    );
}

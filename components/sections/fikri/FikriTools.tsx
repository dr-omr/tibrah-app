'use client';
/** FikriTools.tsx — أدوات التطوير الذاتي */
import React from 'react';
import { SubsectionPanel } from '@/components/sections/shared';
import type { SectionItem } from '@/components/sections/section-tokens';

const C  = '#D97706';
const CA = '#EA580C';

const ITEMS: SectionItem[] = [
    { href: '/tools/weekly-plan', label: 'التخطيط الأسبوعي', sub: 'خطة أسبوعك المتكاملة',   type: 'practical' },
    { href: '/tools/annual-plan', label: 'التخطيط السنوي',   sub: 'رؤيتك للعام القادم',       type: 'practical' },
    { href: '/rewards',           label: 'التحديات والأهداف', sub: 'نقاط إنجاز ومتابعة يومية', type: 'practical' },
    { href: '/tools/vision',      label: 'رؤية الحياة',       sub: 'وضوح عميق لما تريد',       type: 'practical' },
];

export default function FikriTools() {
    return (
        <SubsectionPanel
            title="أدوات التطوير الذاتي اليومية"
            icon="⚙️"
            items={ITEMS}
            color={C} colorAlt={CA}
            index={2}
        />
    );
}

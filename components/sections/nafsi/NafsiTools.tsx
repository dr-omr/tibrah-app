'use client';
/** NafsiTools.tsx — أدوات الصحة النفسية اليومية */
import React from 'react';
import { SubsectionPanel } from '@/components/sections/shared';
import type { SectionItem } from '@/components/sections/section-tokens';

const C  = '#7C3AED';
const CA = '#6D28D9';

const ITEMS: SectionItem[] = [
    { href: '/tools/journal',    label: 'الكتابة العلاجية',      sub: 'Journal Prompts يومية',        type: 'practical' },
    { href: '/tools/grounding',  label: 'تمارين التأريض',         sub: '5-4-3-2-1 وأدوات حضور',       type: 'practical' },
    { href: '/tools/reframe',    label: 'إعادة الصياغة المعرفية', sub: 'Cognitive Reframing Tools',   type: 'practical' },
    { href: '/family',           label: 'صحة العائلة',            sub: 'إدارة صحة وعلاقات أفراد عائلتك', type: 'practical' },
    { href: '/meditation',       label: 'التأمل والذهن',          sub: 'اليقظة والحضور الكامل',        type: 'practical' },
];

export default function NafsiTools() {
    return (
        <SubsectionPanel
            title="أدوات الصحة النفسية اليومية"
            icon="🛠️"
            items={ITEMS}
            color={C} colorAlt={CA}
            index={2}
        />
    );
}

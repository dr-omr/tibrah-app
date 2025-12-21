// components/common/SkipLinks.tsx
// روابط تخطي للوصولية - تظهر عند التركيز للمستخدمين الذين يستخدمون لوحة المفاتيح

import React from 'react';

interface SkipLink {
    id: string;
    label: string;
}

const defaultLinks: SkipLink[] = [
    { id: 'main-content', label: 'تخطي إلى المحتوى الرئيسي' },
    { id: 'main-nav', label: 'تخطي إلى التنقل' },
];

interface SkipLinksProps {
    links?: SkipLink[];
}

export default function SkipLinks({ links = defaultLinks }: SkipLinksProps) {
    return (
        <div className="skip-links">
            {links.map((link) => (
                <a
                    key={link.id}
                    href={`#${link.id}`}
                    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-[1000] focus:bg-white focus:text-[#2D9B83] focus:px-6 focus:py-3 focus:rounded-xl focus:shadow-xl focus:font-bold focus:outline-none focus:ring-4 focus:ring-[#2D9B83]/30"
                >
                    {link.label}
                </a>
            ))}
        </div>
    );
}

// مكون لإضافة معرف للمحتوى الرئيسي
export function MainContent({ children, id = 'main-content' }: { children: React.ReactNode; id?: string }) {
    return (
        <main id={id} tabIndex={-1} className="outline-none">
            {children}
        </main>
    );
}

// مكون للتنقل الرئيسي
export function MainNav({ children, id = 'main-nav' }: { children: React.ReactNode; id?: string }) {
    return (
        <nav id={id} role="navigation" aria-label="التنقل الرئيسي">
            {children}
        </nav>
    );
}

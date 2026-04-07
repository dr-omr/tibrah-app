import React from 'react';

interface DesktopTitleProps {
    title: string;
    subtitle: string;
    className?: string;
}

export default function DesktopTitle({ title, subtitle, className = '' }: DesktopTitleProps) {
    return (
        <div className={`hidden lg:block text-center mb-8 ${className}`}>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-500">{subtitle}</p>
        </div>
    );
}

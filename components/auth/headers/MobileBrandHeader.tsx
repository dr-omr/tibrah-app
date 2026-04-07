import React from 'react';

interface MobileBrandHeaderProps {
    title: string;
    className?: string;
}

export default function MobileBrandHeader({ title, className = '' }: MobileBrandHeaderProps) {
    return (
        <div className={`text-center mb-8 lg:hidden ${className}`}>
            <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-primary/30 mb-4">
                <span className="text-white font-bold text-2xl">ط</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        </div>
    );
}

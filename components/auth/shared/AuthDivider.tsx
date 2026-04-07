import React from 'react';

interface AuthDividerProps {
    text?: string;
    className?: string;
}

export default function AuthDivider({ text = 'أو بالبريد الإلكتروني', className = '' }: AuthDividerProps) {
    return (
        <div className={`flex items-center gap-4 mb-6 ${className}`}>
            <div className="flex-1 auth-divider-line" />
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{text}</span>
            <div className="flex-1 auth-divider-line" />
        </div>
    );
}

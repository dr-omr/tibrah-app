import React from 'react';

interface FormPanelProps {
    children: React.ReactNode;
    className?: string;
}

export default function FormPanel({ children, className = '' }: FormPanelProps) {
    return (
        <div className={`flex-1 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-[#0c1222] auth-form-panel overflow-y-auto h-screen relative transition-colors duration-500 ${className}`}>
            <div className="w-full max-w-md relative z-10 transition-all duration-300">
                {children}
            </div>
        </div>
    );
}

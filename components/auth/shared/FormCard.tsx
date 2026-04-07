import React from 'react';

interface FormCardProps {
    children: React.ReactNode;
    className?: string;
}

export default function FormCard({ children, className = '' }: FormCardProps) {
    return (
        <div className={`auth-form-card p-6 sm:p-8 space-y-5 ${className}`}>
            {children}
        </div>
    );
}

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MedicalTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    label: string;
    error?: string;
}

export default function MedicalTextInput({
    icon: Icon,
    label,
    error,
    className = '',
    ...props
}: MedicalTextInputProps) {
    return (
        <div className="group w-full block">
            <label className="block text-[13px] font-bold text-medical-heading mb-2.5 tracking-wide transition-colors opacity-90">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-[22px] h-[22px] text-medical-muted opacity-60 pointer-events-none transition-colors group-focus-within:text-medical-teal group-focus-within:opacity-100" strokeWidth={1.5} />
                )}
                <input
                    className={`${Icon ? 'pr-12' : ''} px-5 w-full h-[56px] medical-input text-[16px] font-medium placeholder:text-medical-muted/60 outline-none ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-[13px] text-rose-500 mt-2 font-medium animate-fade-slide-up pr-1 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-rose-500 inline-block"></span>
                    {error}
                </p>
            )}
        </div>
    );
}

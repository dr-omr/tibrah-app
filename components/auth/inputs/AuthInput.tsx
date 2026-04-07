import React from 'react';
import { Input } from '@/components/ui/input';
import { LucideIcon } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    label: string;
    error?: string;
}

export default function AuthInput({
    icon: Icon,
    label,
    error,
    className = '',
    ...props
}: AuthInputProps) {
    return (
        <div className="group">
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide transition-colors group-focus-within:text-primary">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 auth-input-icon pointer-events-none" />
                )}
                <Input
                    className={`${Icon ? 'pr-12' : ''} h-[52px] auth-input-well text-[15px] font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400/70 dark:placeholder:text-slate-500/70 ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-[13px] text-red-500 dark:text-red-400 mt-1.5 pr-1 font-medium animate-ios-fade-in">{error}</p>
            )}
        </div>
    );
}

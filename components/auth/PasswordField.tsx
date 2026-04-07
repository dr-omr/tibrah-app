import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    showStrength?: boolean;
}

export default function PasswordField({ label, showStrength = false, className = '', ...props }: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false);

    // Simple strength calculation
    const password = typeof props.value === 'string' ? props.value : '';
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password) || /[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return (
        <div className="space-y-2 relative w-full text-right" dir="rtl">
            {label && (
                <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mr-1">
                    {label}
                </label>
            )}
            <div className="relative w-full">
                <Input
                    type={showPassword ? "text" : "password"}
                    className={`transition-all w-full ${className}`}
                    dir="ltr"
                    {...props}
                />
                
                {/* Toggle Button */}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-teal-600 dark:hover:text-teal-300 focus:outline-none p-1 transition-colors duration-500"
                    tabIndex={-1}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>

            {/* Strength Meter in Monolith Style */}
            {showStrength && password.length > 0 && (
                <div className="flex gap-1.5 h-1 px-1 absolute -bottom-5 w-full">
                    {[1, 2, 3, 4].map((level) => {
                        const isActive = level <= strength;
                        let color = 'bg-slate-200/50 dark:bg-white/10';
                        if (isActive) {
                            if (strength <= 1) color = 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.4)]';
                            else if (strength === 2) color = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]';
                            else if (strength >= 3) color = 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)] dark:bg-teal-400';
                        }
                        return (
                            <div key={level} className={`flex-1 rounded-full transition-all duration-500 ${color}`} />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

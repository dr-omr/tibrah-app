import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    showStrengthMeter?: boolean;
    error?: string;
}

export default function PasswordInput({
    label = 'كلمة المرور',
    showStrengthMeter = false,
    error,
    className = '',
    value,
    ...props
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    // Calculate password strength
    const password = typeof value === 'string' ? value : '';
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengthLabels = ['', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية'];
    const strengthColors = ['', 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]', 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]', 'bg-[#2D9B83] shadow-[0_0_8px_rgba(45,155,131,0.5)]', 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'];

    return (
        <div className="group">
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide transition-colors group-focus-within:text-primary">
                {label}
            </label>
            <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 auth-input-icon pointer-events-none" />
                <Input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    className={`pr-12 pl-12 h-[52px] auth-input-well text-[15px] font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400/70 dark:placeholder:text-slate-500/70 tracking-widest ${className}`}
                    dir="ltr"
                    {...props}
                />
                
                {/* Toggle visibility */}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary focus:outline-none p-1 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>

            {/* Strength Meter */}
            {showStrengthMeter && password.length > 0 && (
                <div className="mt-3 animate-ios-slide-down">
                    <div className="flex gap-1.5 h-1.5 px-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-full overflow-hidden p-0.5">
                        {[1, 2, 3, 4].map((level) => (
                            <div
                                key={level}
                                className={`flex-1 rounded-full transition-all duration-500 ${
                                    level <= strength ? strengthColors[strength] : 'bg-transparent'
                                }`}
                            />
                        ))}
                    </div>
                    <p className={`text-[11px] mt-1.5 text-left font-bold ${
                        strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-[#2D9B83]'
                    }`}>
                        {strengthLabels[strength]}
                    </p>
                </div>
            )}

            {error && (
                <p className="text-[13px] text-red-500 dark:text-red-400 mt-1.5 pr-1 font-medium animate-ios-fade-in">{error}</p>
            )}
        </div>
    );
}

import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface MedicalPasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    showStrengthMeter?: boolean;
    error?: string;
}

export default function MedicalPasswordInput({
    label = 'كلمة المرور',
    showStrengthMeter = false,
    error,
    className = '',
    value,
    ...props
}: MedicalPasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const password = typeof value === 'string' ? value : '';
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengthLabels = ['', 'بحاجة لتعزيز', 'مقبولة', 'صلبة', 'محمية وآمنة'];
    const strengthColors = ['', 'bg-rose-400', 'bg-amber-400', 'bg-[#72B0A6]', 'bg-[#358B7E]'];

    return (
        <div className="group w-full block">
            <label className="block text-[13px] font-bold text-medical-heading mb-2.5 tracking-wide transition-colors opacity-90">
                {label}
            </label>
            <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-[22px] h-[22px] text-medical-muted opacity-60 pointer-events-none transition-colors group-focus-within:text-medical-teal group-focus-within:opacity-100" strokeWidth={1.5} />
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    className={`pr-12 pl-12 w-full h-[56px] medical-input text-[16px] font-medium placeholder:text-medical-muted/60 outline-none tracking-widest ${className}`}
                    dir="ltr"
                    {...props}
                />

                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-medical-muted opacity-60 hover:text-medical-teal hover:opacity-100 focus:outline-none p-1 transition-all"
                    tabIndex={-1}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                    {showPassword ? <EyeOff className="w-[22px] h-[22px]" strokeWidth={1.5} /> : <Eye className="w-[22px] h-[22px]" strokeWidth={1.5} />}
                </button>
            </div>

            {showStrengthMeter && password.length > 0 && (
                <div className="mt-3.5 animate-fade-slide-up">
                    <div className="flex gap-2 h-1 px-1">
                        {[1, 2, 3, 4].map((level) => (
                            <div
                                key={level}
                                className={`flex-1 rounded-full transition-all duration-700 ease-out ${level <= strength ? strengthColors[strength] : 'bg-[#E8E8E4] dark:bg-[#2A302E]'
                                    }`}
                            />
                        ))}
                    </div>
                    <p className={`text-[12px] mt-2.5 text-left font-bold transition-colors duration-500 ${strength <= 1 ? 'text-rose-500' : strength === 2 ? 'text-amber-500' : 'text-[#358B7E]'
                        }`}>
                        {strengthLabels[strength]}
                    </p>
                </div>
            )}

            {error && (
                <p className="text-[13px] text-rose-500 mt-2 font-medium animate-fade-slide-up pr-1 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-rose-500 inline-block"></span>
                    {error}
                </p>
            )}
        </div>
    );
}

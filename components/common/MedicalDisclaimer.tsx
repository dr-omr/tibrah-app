// components/common/MedicalDisclaimer.tsx
// Reusable medical disclaimer for AI-powered features

import React from 'react';
import { AlertTriangle, Shield } from 'lucide-react';

interface MedicalDisclaimerProps {
    variant?: 'banner' | 'inline' | 'minimal';
    className?: string;
}

export default function MedicalDisclaimer({ variant = 'inline', className = '' }: MedicalDisclaimerProps) {
    if (variant === 'minimal') {
        return (
            <p className={`text-xs text-slate-400 dark:text-slate-500 text-center ${className}`}>
                ⚕️ هذه أداة مساعدة ولا تغني عن التشخيص الطبي المباشر
            </p>
        );
    }

    if (variant === 'banner') {
        return (
            <div className={`bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-4 ${className}`}>
                <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
                            إخلاء مسؤولية طبية
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                            هذه الأداة تقدم معلومات تثقيفية عامة باستخدام الذكاء الاصطناعي، ولا تعتبر بديلاً عن الاستشارة الطبية المباشرة.
                            {' '}في حالات الطوارئ، تواصل مع الطوارئ فوراً.
                        </p>
                        <p className="text-xs text-amber-600/70 dark:text-amber-400/60 mt-1.5">
                            للتشخيص والعلاج، احجز جلسة مباشرة مع د. عمر العماد
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Default: inline
    return (
        <div className={`flex items-start gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 ${className}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                هذه الأداة لا تغني عن الاستشارة الطبية. النتائج تقديرية وليست تشخيصية. استشر د. عمر للتشخيص الدقيق.
            </p>
        </div>
    );
}

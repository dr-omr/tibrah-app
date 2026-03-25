import React from 'react';
import { Gift } from 'lucide-react';

export const FreeTrialBanner = () => {
    return (
        <section className="bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 rounded-3xl p-5 border border-[#D4AF37]/30">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center flex-shrink-0">
                    <Gift className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">🎁 3 أيام تجربة مجانية</h3>
                    <p className="text-slate-600 text-sm mb-3">
                        جميع البرامج تبدأ بفترة تجريبية مجانية. جرب أولاً، وبعدها قرر!
                    </p>
                    <div className="space-y-1 text-sm text-slate-500">
                        <p>✓ احجز الجلسة التشخيصية الأولى</p>
                        <p>✓ نختار البرنامج المناسب معاً</p>
                        <p>✓ تبدأ 3 أيام مجانية</p>
                        <p>✓ إذا عجبك النظام، نكمل - وإلا توقف بدون أي رسوم</p>
                    </div>
                    <p className="mt-3 text-[#D4AF37] font-medium text-sm">
                        💡 "بناء ثقة حقيقية - مش أخذ فلوسك بدون نتائج"
                    </p>
                </div>
            </div>
        </section>
    );
};

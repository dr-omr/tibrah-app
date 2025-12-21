import React from 'react';
import { useRouter } from 'next/router';
import { ArrowRight, Activity, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function SymptomAnalysis() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <Activity className="w-10 h-10 text-blue-500" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">تحليل الأعراض</h1>
            <p className="text-slate-500 max-w-xs mx-auto mb-8">
                هذه الميزة قيد التطوير حالياً. قريباً ستتمكن من تشخيص حالتك بدقة باستخدام الذكاء الاصطناعي.
            </p>

            <div className="space-y-3 w-full max-w-xs">
                <Button
                    onClick={() => router.push('/body-map')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl font-bold"
                >
                    العودة لخريطة الجسم
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="w-full text-slate-500"
                >
                    رجوع
                </Button>
            </div>
        </div>
    );
}

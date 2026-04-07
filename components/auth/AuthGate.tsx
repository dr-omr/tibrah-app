import React from 'react';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';

interface AuthGateProps {
    destinationName?: string;
    targetUrl: string;
}

export default function AuthGate({ destinationName = 'هذا القسم', targetUrl }: AuthGateProps) {
    const router = useRouter();

    const handleProceed = () => {
        // Enforce the redirect path to be passed safely to login
        router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6" dir="rtl">
            <div className="w-full max-w-[440px] bg-white rounded-[32px] border border-slate-200/60 shadow-xl p-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 rounded-3xl bg-teal-400/20 blur-xl"></div>
                    <Lock className="w-8 h-8 text-teal-600 relative z-10" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm">
                        <ShieldAlert className="w-4 h-4 text-emerald-500" />
                    </div>
                </div>

                <h1 className="text-[26px] font-black text-slate-900 tracking-tight mb-3">
                    مطلوب توثيق الهوية
                </h1>
                
                <p className="text-[15px] font-medium text-slate-500 leading-relaxed max-w-[300px] mx-auto mb-8">
                    لحماية خصوصيتك وضمان سرية بياناتك الطبية، يتطلب الدخول إلى <strong className="text-slate-800">{destinationName}</strong> تسجيل الدخول بحسابك الموثق أولاً.
                </p>

                <div className="space-y-3">
                    <Button 
                        onClick={handleProceed}
                        className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 transition-smooth"
                    >
                        المتابعة إلى تسجيل الدخول
                        <ArrowRight className="w-5 h-5 rtl:translate-x-0 rtl:rotate-0" />
                    </Button>
                    
                    <Button 
                        onClick={() => router.push('/')}
                        variant="ghost"
                        className="w-full h-12 text-slate-500 hover:text-slate-800 font-semibold"
                    >
                        العودة للرئيسية
                    </Button>
                </div>

                <div className="mt-10 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-[12px] font-semibold tracking-wider text-slate-400 uppercase">
                        منصة طبية مشفرة بالكامل
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </div>
            </div>
        </div>
    );
}

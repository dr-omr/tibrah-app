import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

interface AuthHandoffProps {
    status: 'checking' | 'redirecting' | 'verifying' | 'securing';
    destinationLabel?: string;
}

export default function AuthHandoff({ status, destinationLabel }: AuthHandoffProps) {
    const renderContent = () => {
        switch (status) {
            case 'checking':
                return {
                    title: 'التحقق من الهوية',
                    subtitle: 'نظام الأمان يقوم بمراجعة حالة جلستك الطبية.',
                    icon: <Activity className="w-8 h-8 text-teal-600 animate-pulse" />
                };
            case 'redirecting':
                return {
                    title: 'توجيه آمن',
                    subtitle: destinationLabel 
                        ? `جاري تحويلك إلى ${destinationLabel} عبر نطاق مشفر.`
                        : 'جاري نقلك للوجهة المطلوبة عبر نطاق مشفر.',
                    icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />
                };
            case 'verifying':
                return {
                    title: 'توثيق البيانات',
                    subtitle: 'لحظات، نتعرف على بياناتك من مزود الخدمة لتأمين دخولك.',
                    icon: <Activity className="w-8 h-8 text-slate-800 animate-pulse" />
                };
            case 'securing':
                return {
                    title: 'إغلاق الجلسة',
                    subtitle: 'يتم الآن تأمين ومسح بيانات الجلسة الحالية.',
                    icon: <ShieldCheck className="w-8 h-8 text-slate-800" />
                };
            default:
                return {
                    title: 'لحظات من فضلك',
                    subtitle: 'نظام المصادقة قيد العمل.',
                    icon: <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                };
        }
    };

    const content = renderContent();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-md" dir="rtl">
            <div className="w-full max-w-[400px] p-8 mx-4 bg-white rounded-[32px] border border-slate-200/60 shadow-2xl shadow-slate-200/50 text-center relative overflow-hidden transition-all duration-500 ease-out animate-in fade-in zoom-in-95">
                
                {/* Subtle top styling bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500" />

                <div className="w-20 h-20 mx-auto rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
                    {/* Background spin effect */}
                    <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(13,148,136,0.1)_360deg)] animate-[spin_2s_linear_infinite]" />
                    <div className="absolute inset-1 bg-white rounded-[20px] flex items-center justify-center shadow-sm">
                        {content.icon}
                    </div>
                </div>

                <h3 className="text-[20px] font-black text-slate-900 tracking-tight mb-2">
                    {content.title}
                </h3>
                
                <p className="text-[14px] font-medium text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                    {content.subtitle}
                </p>

                <div className="mt-8 flex justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-[bounce_1s_infinite_0ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-[bounce_1s_infinite_200ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-[bounce_1s_infinite_400ms]" />
                </div>
            </div>
        </div>
    );
}

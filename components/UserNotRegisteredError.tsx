import React from 'react';
import { UserX, LogIn, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface UserNotRegisteredErrorProps {
    onLogin?: () => void;
    onRegister?: () => void;
    message?: string;
}

export default function UserNotRegisteredError({
    onLogin,
    onRegister,
    message = "يجب تسجيل الدخول للوصول إلى هذه الصفحة"
}: UserNotRegisteredErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                <UserX className="w-12 h-12 text-slate-400" />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">
                لم يتم تسجيل الدخول
            </h3>

            <p className="text-slate-500 mb-8 max-w-xs">
                {message}
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button
                    onClick={onLogin}
                    className="w-full gradient-primary text-white rounded-xl h-12 shadow-lg hover:shadow-xl transition-all"
                >
                    <LogIn className="w-5 h-5 ml-2" />
                    تسجيل الدخول
                </Button>

                <Button
                    onClick={onRegister}
                    variant="outline"
                    className="w-full rounded-xl h-12"
                >
                    إنشاء حساب جديد
                    <ArrowRight className="w-4 h-4 mr-2" />
                </Button>
            </div>
        </div>
    );
}

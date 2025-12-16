import React from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Offline() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6">
            <div className="text-center">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                    <WifiOff className="w-12 h-12 text-slate-400" />
                </div>

                {/* Text */}
                <h1 className="text-2xl font-bold text-slate-800 mb-3">
                    لا يوجد اتصال بالإنترنت
                </h1>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                    يبدو أنك غير متصل بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => window.location.reload()}
                        className="bg-[#2D9B83] hover:bg-[#2D9B83]/90 text-white rounded-xl"
                    >
                        <RefreshCw className="w-4 h-4 ml-2" />
                        إعادة المحاولة
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = '/'}
                        className="rounded-xl"
                    >
                        <Home className="w-4 h-4 ml-2" />
                        الصفحة الرئيسية
                    </Button>
                </div>

                {/* Tip */}
                <div className="mt-12 p-4 bg-amber-50 rounded-2xl border border-amber-100 max-w-sm mx-auto">
                    <p className="text-sm text-amber-700">
                        💡 <span className="font-medium">نصيحة:</span> بعض الميزات متاحة بدون اتصال بالإنترنت إذا زرت التطبيق مسبقاً.
                    </p>
                </div>
            </div>
        </div>
    );
}

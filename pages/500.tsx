import React from 'react';
import { ServerCrash, RefreshCw } from 'lucide-react';

export default function Custom500() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-6">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <ServerCrash className="w-12 h-12 text-red-500" />
                </div>

                <h1 className="text-8xl font-bold text-slate-800 mb-4">500</h1>

                <p className="text-slate-500 mb-8 text-lg">
                    حدث خطأ في الخادم، يرجى المحاولة لاحقاً
                </p>

                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2D9B83] text-white rounded-xl hover:bg-[#248a73] transition-colors text-lg font-medium shadow-lg hover:shadow-xl"
                >
                    <RefreshCw className="w-5 h-5" />
                    إعادة المحاولة
                </button>
            </div>
        </div>
    );
}

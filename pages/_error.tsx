import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
    statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-6">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>

                <h1 className="text-6xl font-bold text-slate-800 mb-4">
                    {statusCode || 'خطأ'}
                </h1>

                <p className="text-slate-500 mb-8 text-lg">
                    {statusCode === 404
                        ? 'عذراً، الصفحة التي تبحث عنها غير موجودة'
                        : 'حدث خطأ غير متوقع'}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2D9B83] text-white rounded-xl hover:bg-[#248a73] transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        الصفحة الرئيسية
                    </Link>

                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        </div>
    );
}

Error.getInitialProps = ({ res, err }: { res: any; err: any }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;

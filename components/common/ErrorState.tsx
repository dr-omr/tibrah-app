import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry: () => void;
}

export default function ErrorState({ title, message, onRetry }: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                <WifiOff className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
                {title || "الاتصال ضعيف أو منقطع"}
            </h3>
            <p className="text-slate-500 mb-8 max-w-xs">
                {message || "يبدو أن هناك مشكلة في الاتصال بالخادم. يرجى التحقق من الانترنت والمحاولة مرة أخرى."}
            </p>
            <Button
                onClick={onRetry}
                className="gradient-primary text-white rounded-xl px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
                <RefreshCw className="w-5 h-5 ml-2" />
                حاول مرة أخرى
            </Button>
        </div>
    );
}
import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/common/SEO';

interface BiometricGateProps {
    onAuthenticate: () => void;
}

export default function BiometricGate({ onAuthenticate }: BiometricGateProps) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6">
            <SEO title="سجل طبي محمي — طِبرَا" description="سجلك الصحي الشامل محمي وآمن" />
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 text-center">سجل طبي محمي</h1>
            <p className="text-slate-500 text-center mb-8 max-w-xs">يحتوي هذا القسم على بياناتك الصحية الحساسة. يرجى المتابعة لفتح السجل.</p>
            <Button 
                onClick={onAuthenticate} 
                className="w-full max-w-xs rounded-xl h-14 text-lg font-bold shadow-lg bg-primary hover:bg-primary-dark text-white"
            >
                فتح القفل
            </Button>
        </div>
    );
}

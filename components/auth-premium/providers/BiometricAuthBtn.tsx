import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/notification-engine';
import { Fingerprint, ScanFace } from 'lucide-react';

export default function BiometricAuthBtn() {
    const { signInWithBiometrics } = useAuth();
    const [loading, setLoading] = React.useState(false);

    const handleBiometric = async () => {
        setLoading(true);
        try {
            await signInWithBiometrics();
        } catch (error: any) {
            toast.error(error.message || 'فشل تسجيل الدخول بالبصمة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleBiometric}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl medical-surface text-medical-heading font-bold text-[15px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 group"
        >
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Fingerprint className="w-5 h-5 text-medical-teal" />
            </div>
            الدخول السريع بالبصمة
            <ScanFace className="w-4 h-4 text-slate-400 absolute left-4 opacity-50" />
        </button>
    );
}

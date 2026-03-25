// components/common/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireDoctor?: boolean; // For future doctor dashboard protecting
}

export default function ProtectedRoute({ children, requireAuth = true, requireDoctor = false }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (requireAuth && !user) {
                // Not authenticated, redirect to login
                router.replace(createPageUrl('Login'));
            } else if (requireDoctor && (user?.role as string) !== 'doctor') {
                // Not a doctor, redirect to patient home
                router.replace(createPageUrl('Home'));
            } else {
                // Authorized
                setIsChecking(false);
            }
        }
    }, [user, loading, router, requireAuth, requireDoctor]);

    if (loading || isChecking) {
        // Ultra-Premium Fullscreen Loading State to prevent UI flashing
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 flex items-center justify-center mb-6 relative">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-[3px] border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-3xl opacity-50"
                        />
                        <Shield className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase">جارِ التوثيق المأمون...</h3>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}

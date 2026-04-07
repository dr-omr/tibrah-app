// components/common/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { createPageUrl } from '@/utils';

import AuthHandoff from '@/components/auth/AuthHandoff';
import AuthGate from '@/components/auth/AuthGate';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireDoctor?: boolean; // For future doctor dashboard protecting
    sectionName?: string; // e.g. "الملف الطبي"
}

export default function ProtectedRoute({ 
    children, 
    requireAuth = true, 
    requireDoctor = false,
    sectionName = 'القسم المحمي'
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [showGate, setShowGate] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (requireAuth && !user) {
                // Not authenticated, gracefully trap them in the AuthGate instead of hard bouncing
                setShowGate(true);
                setIsChecking(false);
            } else if (requireDoctor && (user?.role as string) !== 'doctor') {
                // Valid auth, but wrong role: Hard bounce to home for security
                router.replace(createPageUrl('Home'));
            } else {
                // Authorized successfully
                setIsAuthorized(true);
                // Artificial delay to show the "Verifying Session" premium state if coming from another state
                setTimeout(() => setIsChecking(false), 800);
            }
        }
    }, [user, loading, router, requireAuth, requireDoctor]);

    if (loading || (isChecking && !showGate && !isAuthorized)) {
        return <AuthHandoff status="checking" />;
    }

    if (showGate) {
        return <AuthGate destinationName={sectionName} targetUrl={router.asPath} />;
    }

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}

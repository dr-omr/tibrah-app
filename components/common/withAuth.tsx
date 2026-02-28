/**
 * withAuth — Higher-Order Component for Page Protection
 * Wraps pages that require authentication
 * Provides consistent loading/redirect behavior
 * 
 * Usage:
 *   export default withAuth(MyPage);
 *   export default withAuth(AdminPage, { requireAdmin: true });
 */

import React, { useEffect, ComponentType } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

interface WithAuthOptions {
    /** If true, only admin users can access this page */
    requireAdmin?: boolean;
    /** Custom redirect path (default: /login) */
    redirectTo?: string;
    /** Custom loading message */
    loadingMessage?: string;
}

export default function withAuth<P extends object>(
    WrappedComponent: ComponentType<P>,
    options: WithAuthOptions = {}
) {
    const {
        requireAdmin = false,
        redirectTo = '/login',
        loadingMessage = 'جاري التحقق من تسجيل الدخول...',
    } = options;

    function AuthGuard(props: P) {
        const { user, loading, isAdmin } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading) {
                if (!user) {
                    // Not authenticated — redirect to login with return URL
                    router.replace({
                        pathname: redirectTo,
                        query: { returnUrl: router.asPath },
                    });
                } else if (requireAdmin && !isAdmin) {
                    // Not admin — redirect to home
                    router.replace('/');
                }
            }
        }, [loading, user, isAdmin, router]);

        // Show loading while checking auth
        if (loading) {
            return <LoadingScreen message={loadingMessage} />;
        }

        // Not authenticated — show redirect message
        if (!user) {
            return <LoadingScreen message="جاري التوجيه لتسجيل الدخول..." />;
        }

        // Not admin on admin page
        if (requireAdmin && !isAdmin) {
            return <LoadingScreen message="ليس لديك صلاحية لهذه الصفحة..." />;
        }

        // Authorized — render the page
        return <WrappedComponent {...props} />;
    }

    // Preserve display name for React DevTools
    AuthGuard.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return AuthGuard;
}

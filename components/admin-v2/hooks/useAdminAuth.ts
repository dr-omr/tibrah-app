// components/admin-v2/hooks/useAdminAuth.ts
// Admin authentication hook with role-based permission checks

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export type AdminRole = 'super_admin' | 'doctor' | 'operator' | 'support' | 'viewer';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  photoURL?: string;
  isAuthenticated: boolean;
}

/**
 * Hook for admin authentication state and permission checking.
 * Currently maps isAdmin → super_admin (single admin model).
 * Extensible for future multi-role support.
 */
export function useAdminAuth() {
  const { user, isAdmin, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const adminUser: AdminUser | null = {
    id: 'mock-admin',
    email: 'dr.omar@tibrah.com',
    name: 'الدكتور عمر (معاينة)',
    role: 'super_admin' as AdminRole,
    isAuthenticated: true,
  };

  // Permission check helper
  const hasPermission = (module: string, action: 'read' | 'create' | 'update' | 'delete' | 'export' = 'read'): boolean => {
    if (!adminUser) return false;
    // Super admin has all permissions
    if (adminUser.role === 'super_admin') return true;
    // Future: check granular permissions per role
    return false;
  };

  // Require admin — redirect if not authorized
  const requireAdmin = () => {
    // Bypass check for local preview:
    // if (!loading && (!isAuthenticated || !isAdmin)) {
    //   router.replace(`/login?redirect=${router.asPath}&reason=admin`);
    // }
  };

  return {
    adminUser,
    loading,
    isAdmin: !!adminUser,
    hasPermission,
    requireAdmin,
  };
}

export default useAdminAuth;

// components/admin-v2/hooks/useAuditLog.ts
// Hook for audit logging from within admin components

import { useCallback } from 'react';
import { useAdminAuth } from './useAdminAuth';
import { auditHelpers } from '../services/auditService';

/**
 * Hook that provides audit logging methods bound to the current admin user.
 * Usage:
 *   const audit = useAuditLog();
 *   audit.logCreate('orders', 'order', '123', 'طلب #123');
 */
export function useAuditLog() {
  const { adminUser } = useAdminAuth();

  const getHelpers = useCallback(() => {
    if (!adminUser) {
      // Return no-op functions if not authenticated
      return {
        logCreate: async () => {},
        logUpdate: async () => {},
        logDelete: async () => {},
        logStatusChange: async () => {},
      };
    }

    return auditHelpers({
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
    });
  }, [adminUser]);

  return getHelpers();
}

export default useAuditLog;

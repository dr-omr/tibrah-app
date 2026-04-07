// components/admin-v2/services/adminPermissions.ts
// Permission definitions and guard utilities

export type AdminRole = 'super_admin' | 'doctor' | 'operator' | 'support' | 'viewer';
export type AdminAction = 'read' | 'create' | 'update' | 'delete' | 'export';

export interface PermissionRule {
  module: string;
  actions: AdminAction[];
}

/**
 * Permission matrix — defines what each role can do.
 * Currently all admins are super_admin (single-admin model).
 * Ready for future multi-role expansion.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, PermissionRule[]> = {
  super_admin: [
    { module: '*', actions: ['read', 'create', 'update', 'delete', 'export'] },
  ],
  doctor: [
    { module: 'dashboard', actions: ['read'] },
    { module: 'clinical', actions: ['read', 'update'] },
    { module: 'appointments', actions: ['read', 'update'] },
    { module: 'users', actions: ['read'] },
    { module: 'content', actions: ['read', 'create', 'update'] },
    { module: 'analytics', actions: ['read'] },
  ],
  operator: [
    { module: 'dashboard', actions: ['read'] },
    { module: 'orders', actions: ['read', 'update'] },
    { module: 'appointments', actions: ['read', 'update'] },
    { module: 'products', actions: ['read', 'create', 'update'] },
    { module: 'content', actions: ['read', 'create', 'update'] },
    { module: 'users', actions: ['read'] },
  ],
  support: [
    { module: 'dashboard', actions: ['read'] },
    { module: 'users', actions: ['read'] },
    { module: 'orders', actions: ['read'] },
    { module: 'appointments', actions: ['read'] },
  ],
  viewer: [
    { module: 'dashboard', actions: ['read'] },
    { module: 'analytics', actions: ['read'] },
  ],
};

/**
 * Check if a role has permission for a given module and action.
 */
export function checkPermission(role: AdminRole, module: string, action: AdminAction): boolean {
  const rules = ROLE_PERMISSIONS[role];
  if (!rules) return false;

  return rules.some(rule => {
    const moduleMatch = rule.module === '*' || rule.module === module;
    const actionMatch = rule.actions.includes(action);
    return moduleMatch && actionMatch;
  });
}

/**
 * Get all modules accessible by a role.
 */
export function getAccessibleModules(role: AdminRole): string[] {
  const rules = ROLE_PERMISSIONS[role];
  if (!rules) return [];
  if (rules.some(r => r.module === '*')) {
    return ['dashboard', 'users', 'clinical', 'orders', 'appointments', 
            'content', 'courses', 'foods', 'recipes', 'frequencies',
            'products', 'analytics', 'audit-log', 'settings', 'cloud-sync'];
  }
  return rules.map(r => r.module);
}

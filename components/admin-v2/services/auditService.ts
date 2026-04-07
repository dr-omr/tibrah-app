// components/admin-v2/services/auditService.ts
// Audit logging — records who did what, when

import { db } from '@/lib/db';
import { createDocument } from '@/lib/firestore';

export interface AuditEntry {
  id?: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'export' | 'config_change' | 'status_change';
  module: string;
  entity_type: string;
  entity_id?: string;
  entity_label?: string;
  actor_id: string;
  actor_name: string;
  actor_email: string;
  timestamp: string;
  details?: Record<string, unknown>;
  before_state?: Record<string, unknown>;
  after_state?: Record<string, unknown>;
  ip_address?: string;
}

/**
 * Write an audit log entry to Firestore.
 */
export async function createAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    const fullEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Write directly to audit_logs collection via Firestore
    await createDocument('audit_logs', fullEntry as any);
    
  } catch (error) {
    // Never let audit logging break the main flow
    console.error('[AuditService] Failed to write audit entry:', error);
  }
}

/**
 * Helper to create audit entries with common patterns.
 */
export function auditHelpers(actor: { id: string; name: string; email: string }) {
  return {
    logCreate: (module: string, entityType: string, entityId: string, entityLabel: string, details?: Record<string, unknown>) =>
      createAuditEntry({
        action: 'create',
        module,
        entity_type: entityType,
        entity_id: entityId,
        entity_label: entityLabel,
        actor_id: actor.id,
        actor_name: actor.name,
        actor_email: actor.email,
        details,
      }),

    logUpdate: (module: string, entityType: string, entityId: string, entityLabel: string, before?: Record<string, unknown>, after?: Record<string, unknown>) =>
      createAuditEntry({
        action: 'update',
        module,
        entity_type: entityType,
        entity_id: entityId,
        entity_label: entityLabel,
        actor_id: actor.id,
        actor_name: actor.name,
        actor_email: actor.email,
        before_state: before,
        after_state: after,
      }),

    logDelete: (module: string, entityType: string, entityId: string, entityLabel: string) =>
      createAuditEntry({
        action: 'delete',
        module,
        entity_type: entityType,
        entity_id: entityId,
        entity_label: entityLabel,
        actor_id: actor.id,
        actor_name: actor.name,
        actor_email: actor.email,
      }),

    logStatusChange: (module: string, entityType: string, entityId: string, entityLabel: string, from: string, to: string) =>
      createAuditEntry({
        action: 'status_change',
        module,
        entity_type: entityType,
        entity_id: entityId,
        entity_label: entityLabel,
        actor_id: actor.id,
        actor_name: actor.name,
        actor_email: actor.email,
        details: { from_status: from, to_status: to },
      }),
  };
}

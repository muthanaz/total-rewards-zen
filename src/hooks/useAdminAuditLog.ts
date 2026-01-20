import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';
import type { Json } from '@/integrations/supabase/types';

export type AuditAction = 
  | 'ORG_SUSPEND'
  | 'ORG_REACTIVATE'
  | 'ORG_CREATE'
  | 'ORG_UPDATE'
  | 'ORG_DELETE'
  | 'FLAG_TOGGLE'
  | 'VENDOR_APPROVE'
  | 'VENDOR_SUSPEND'
  | 'VENDOR_REJECT'
  | 'OFFER_APPROVE'
  | 'OFFER_SUSPEND'
  | 'OFFER_REJECT'
  | 'USER_ROLE_CHANGE'
  | 'USER_DEACTIVATE'
  | 'SESSION_REVOKE'
  | 'POLICY_PUBLISH'
  | 'SETTINGS_UPDATE';

export type EntityType = 
  | 'organization'
  | 'vendor'
  | 'offer'
  | 'user'
  | 'feature_flag'
  | 'policy'
  | 'session'
  | 'settings';

interface AuditLogEntry {
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  metadata?: Record<string, Json | undefined>;
  outcome?: 'success' | 'failure';
}

/**
 * Hook to create audit log entries for admin actions
 */
export function useAdminAuditLog() {
  const { user, role } = useAuth();

  const createAuditLog = useCallback(async ({
    action,
    entityType,
    entityId,
    metadata = {},
    outcome = 'success',
  }: AuditLogEntry): Promise<boolean> => {
    if (!user) {
      console.error('Cannot create audit log: No authenticated user');
      return false;
    }

    try {
      const { error } = await supabase.from('audit_logs').insert([{
        user_id: user.id,
        action,
        resource_type: entityType,
        resource_id: entityId,
        details: metadata as Json,
        actor_role: role || 'unknown',
        outcome,
      }]);

      if (error) {
        console.error('Failed to create audit log:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Audit log error:', err);
      return false;
    }
  }, [user, role]);

  return { createAuditLog };
}

/**
 * Standalone function for creating audit logs (for use outside React components)
 */
export async function createAuditLogEntry(
  userId: string,
  role: string,
  entry: AuditLogEntry
): Promise<boolean> {
  try {
    const { error } = await supabase.from('audit_logs').insert([{
      user_id: userId,
      action: entry.action,
      resource_type: entry.entityType,
      resource_id: entry.entityId,
      details: (entry.metadata || {}) as Json,
      actor_role: role,
      outcome: entry.outcome || 'success',
    }]);

    return !error;
  } catch {
    return false;
  }
}

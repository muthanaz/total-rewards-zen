import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type AuditAction = 
  | 'login'
  | 'logout'
  | 'view_sensitive_data'
  | 'export_data'
  | 'update_profile'
  | 'update_password'
  | 'enable_mfa'
  | 'disable_mfa'
  | 'access_denied'
  | 'session_timeout'
  | 'data_request_created'
  | 'data_request_processed'
  | 'role_changed'
  | 'sensitive_operation';

type ResourceType = 
  | 'session'
  | 'profile'
  | 'document'
  | 'benefit'
  | 'request'
  | 'data_request'
  | 'user_role'
  | 'organization'
  | 'sensitive_data';

interface LogAuditEventParams {
  action: AuditAction | string;
  resourceType: ResourceType | string;
  resourceId?: string;
  details?: Record<string, unknown>;
}

export function useAuditLog() {
  const { user } = useAuth();

  const logEvent = useCallback(async ({
    action,
    resourceType,
    resourceId,
    details,
  }: LogAuditEventParams): Promise<string | null> => {
    if (!user) {
      console.warn('Cannot log audit event: No user authenticated');
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId || null,
        p_details: details ? JSON.stringify(details) : null,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
      });

      if (error) {
        console.error('Failed to log audit event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Audit log error:', error);
      return null;
    }
  }, [user]);

  // Convenience methods for common operations
  const logLogin = useCallback(() => 
    logEvent({ action: 'login', resourceType: 'session' }), [logEvent]);

  const logLogout = useCallback(() => 
    logEvent({ action: 'logout', resourceType: 'session' }), [logEvent]);

  const logProfileUpdate = useCallback((profileId: string, changes: Record<string, unknown>) => 
    logEvent({ 
      action: 'update_profile', 
      resourceType: 'profile', 
      resourceId: profileId,
      details: { changes }
    }), [logEvent]);

  const logSensitiveDataAccess = useCallback((dataType: string, resourceId?: string) => 
    logEvent({ 
      action: 'view_sensitive_data', 
      resourceType: 'sensitive_data',
      resourceId,
      details: { dataType }
    }), [logEvent]);

  const logAccessDenied = useCallback((attemptedAction: string, resourceType: string, resourceId?: string) => 
    logEvent({ 
      action: 'access_denied', 
      resourceType,
      resourceId,
      details: { attemptedAction }
    }), [logEvent]);

  const logDataExport = useCallback((exportType: string) => 
    logEvent({ 
      action: 'export_data', 
      resourceType: 'document',
      details: { exportType }
    }), [logEvent]);

  const logMFAChange = useCallback((enabled: boolean) => 
    logEvent({ 
      action: enabled ? 'enable_mfa' : 'disable_mfa', 
      resourceType: 'profile'
    }), [logEvent]);

  return {
    logEvent,
    logLogin,
    logLogout,
    logProfileUpdate,
    logSensitiveDataAccess,
    logAccessDenied,
    logDataExport,
    logMFAChange,
  };
}

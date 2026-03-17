import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Session timeout in milliseconds (15 minutes of inactivity)
const SESSION_TIMEOUT = 15 * 60 * 1000;
// Warning before timeout (2 minutes before)
const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000;

interface UseSessionSecurityOptions {
  enabled?: boolean;
  onTimeout?: () => void;
  onWarning?: () => void;
}

export function useSessionSecurity(options: UseSessionSecurityOptions = {}) {
  const { enabled = true, onTimeout, onWarning } = options;
  const { user, signOut } = useAuth();
  const lastActivityRef = useRef<number>(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningShownRef = useRef<boolean>(false);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    
    // Reset timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    if (enabled && user) {
      // Set warning timer
      warningRef.current = setTimeout(() => {
        if (!warningShownRef.current) {
          warningShownRef.current = true;
          onWarning?.();
          toast.warning('Your session will expire in 2 minutes due to inactivity', {
            duration: 10000,
            action: {
              label: 'Stay logged in',
              onClick: () => handleActivity(),
            },
          });
        }
      }, SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT);

      // Set timeout timer
      timeoutRef.current = setTimeout(async () => {
        onTimeout?.();
        toast.error('Session expired due to inactivity');
        await signOut();
      }, SESSION_TIMEOUT);
    }
  }, [enabled, user, onTimeout, onWarning, signOut]);

  // Track user activity
  useEffect(() => {
    if (!enabled || !user) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Debounce activity tracking
    let activityTimeout: NodeJS.Timeout | null = null;
    const throttledActivity = () => {
      if (activityTimeout) return;
      activityTimeout = setTimeout(() => {
        handleActivity();
        activityTimeout = null;
      }, 1000);
    };

    events.forEach(event => {
      document.addEventListener(event, throttledActivity, { passive: true });
    });

    // Initial activity
    handleActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (activityTimeout) clearTimeout(activityTimeout);
    };
  }, [enabled, user, handleActivity]);

  // Log session activity to audit log
  const logSessionEvent = useCallback(async (action: string, details?: Record<string, unknown>) => {
    if (!user) return;

    try {
      await supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_action: action,
        p_resource_type: 'session',
        p_resource_id: null,
        p_details: details ? JSON.stringify(details) : null,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to log session event:', error);
    }
  }, [user]);

  return {
    logSessionEvent,
    resetActivity: handleActivity,
    lastActivity: lastActivityRef.current,
  };
}

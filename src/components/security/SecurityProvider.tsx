import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSessionSecurity } from '@/hooks/useSessionSecurity';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityContextType {
  logSessionEvent: (action: string, details?: Record<string, unknown>) => Promise<void>;
  resetActivity: () => void;
  auditLog: ReturnType<typeof useAuditLog>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
  enableSessionTimeout?: boolean;
}

export function SecurityProvider({ children, enableSessionTimeout = true }: SecurityProviderProps) {
  const { user } = useAuth();
  const auditLog = useAuditLog();
  
  const { logSessionEvent, resetActivity } = useSessionSecurity({
    enabled: enableSessionTimeout && !!user,
    onTimeout: () => {
      auditLog.logEvent({
        action: 'session_timeout',
        resourceType: 'session',
      });
    },
  });

  // Log login events
  useEffect(() => {
    if (user) {
      auditLog.logLogin();
    }
  }, [user?.id]); // Only trigger on user ID change

  // Add security headers check
  useEffect(() => {
    // Warn if not using HTTPS in production
    if (typeof window !== 'undefined' && 
        window.location.protocol === 'http:' && 
        !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      console.warn('Security Warning: Application is not using HTTPS');
    }
  }, []);

  return (
    <SecurityContext.Provider value={{ logSessionEvent, resetActivity, auditLog }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}

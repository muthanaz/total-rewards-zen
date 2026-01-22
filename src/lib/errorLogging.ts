/**
 * Lightweight Error Logging Helper
 * 
 * Provides consistent error logging across the platform.
 * Logs to console and optionally to audit_logs table.
 */

import { supabase } from '@/integrations/supabase/client';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  action?: string;
  resourceType?: string;
  resourceId?: string;
  userId?: string;
  component?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an error with context
 * Console logging is always performed; audit_logs is optional and non-blocking
 */
export async function logError(
  error: Error | string,
  context: LogContext = {},
  options: { writeToAudit?: boolean } = {}
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Always log to console
  console.error(`[${context.component || 'App'}] ${context.action || 'Error'}:`, {
    message: errorMessage,
    stack: errorStack,
    ...context.metadata,
  });

  // Optionally write to audit_logs (non-blocking)
  if (options.writeToAudit) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('audit_logs').insert({
          user_id: context.userId || user.id,
          action: context.action || 'APPLICATION_ERROR',
          resource_type: context.resourceType || 'application',
          resource_id: context.resourceId || window.location.pathname,
          details: {
            error_message: errorMessage,
            error_stack: errorStack?.slice(0, 2000),
            component: context.component,
            url: window.location.href,
            ...context.metadata,
          },
          outcome: 'failure',
        });
      }
    } catch (logError) {
      console.warn('Failed to write error to audit_logs:', logError);
    }
  }
}

/**
 * Log a warning with context
 */
export function logWarn(message: string, context: LogContext = {}): void {
  console.warn(`[${context.component || 'App'}] ${context.action || 'Warning'}:`, message, context.metadata);
}

/**
 * Log info with context
 */
export function logInfo(message: string, context: LogContext = {}): void {
  console.info(`[${context.component || 'App'}] ${context.action || 'Info'}:`, message, context.metadata);
}

/**
 * Create a scoped logger for a specific component
 */
export function createLogger(component: string) {
  return {
    error: (error: Error | string, context: Omit<LogContext, 'component'> = {}, options?: { writeToAudit?: boolean }) =>
      logError(error, { ...context, component }, options),
    warn: (message: string, context: Omit<LogContext, 'component'> = {}) =>
      logWarn(message, { ...context, component }),
    info: (message: string, context: Omit<LogContext, 'component'> = {}) =>
      logInfo(message, { ...context, component }),
  };
}

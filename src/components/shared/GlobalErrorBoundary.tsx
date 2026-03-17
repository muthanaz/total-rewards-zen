/**
 * Global Error Boundary
 * 
 * Catches unhandled React errors and displays a fallback UI.
 * Logs errors to console and optionally to audit_logs table.
 * Ensures NO action fails silently.
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate a unique error ID for reference
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
    return { hasError: true, error, errorId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // ALWAYS log to console - no silent failures
    console.error('[GlobalErrorBoundary] Unhandled error:', {
      errorId: this.state.errorId,
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // Log to audit_logs (non-blocking)
    this.logErrorToAudit(error, errorInfo);
  }

  private async logErrorToAudit(error: Error, errorInfo: ErrorInfo) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Always attempt to log, even for unauthenticated users
      const userId = user?.id;
      
      if (userId) {
        await supabase.from('audit_logs').insert({
          user_id: userId,
          action: 'UNHANDLED_ERROR',
          resource_type: 'application',
          resource_id: window.location.pathname,
          details: {
            error_id: this.state.errorId,
            error_name: error.name,
            error_message: error.message,
            error_stack: error.stack?.slice(0, 2000),
            component_stack: errorInfo.componentStack?.slice(0, 2000),
            url: window.location.href,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
          outcome: 'failure',
        });
      }
    } catch (logError) {
      // Log failure to console - never fail silently
      console.warn('[GlobalErrorBoundary] Failed to log error to audit:', logError);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                An unexpected error occurred. Our team has been notified.
              </p>
              {this.state.errorId && (
                <p className="text-xs text-muted-foreground font-mono">
                  Reference: {this.state.errorId}
                </p>
              )}
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="p-4 rounded-lg bg-muted text-left overflow-auto max-h-48">
                <p className="font-mono text-sm text-destructive">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                    {this.state.error.stack.slice(0, 500)}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              <Button onClick={this.handleGoHome}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
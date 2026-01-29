/**
 * Actionable Error Component
 * 
 * Standardized error messages that always include:
 * 1. Problem: What went wrong
 * 2. Cause: Why it happened
 * 3. Fix: What the user can do
 * 
 * Enterprise tone: direct, specific, actionable.
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ChevronRight,
  type LucideIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type ErrorSeverity = 'error' | 'warning' | 'info';

interface ActionableErrorProps {
  /** What went wrong (problem statement) */
  problem: string;
  /** Why it happened (cause) */
  cause?: string;
  /** What to do (fix/resolution) */
  fix?: string;
  /** Error code for reference */
  code?: string;
  severity?: ErrorSeverity;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  onRetry?: () => void;
  className?: string;
  /** Compact inline variant */
  inline?: boolean;
}

const severityConfig: Record<ErrorSeverity, { icon: LucideIcon; alertVariant: 'default' | 'destructive'; borderColor: string }> = {
  error: { 
    icon: XCircle, 
    alertVariant: 'destructive',
    borderColor: 'border-l-destructive'
  },
  warning: { 
    icon: AlertTriangle, 
    alertVariant: 'default',
    borderColor: 'border-l-warning'
  },
  info: { 
    icon: AlertCircle, 
    alertVariant: 'default',
    borderColor: 'border-l-primary'
  },
};

export function ActionableError({
  problem,
  cause,
  fix,
  code,
  severity = 'error',
  action,
  secondaryAction,
  onRetry,
  className,
  inline = false,
}: ActionableErrorProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  if (inline) {
    return (
      <div className={cn(
        "flex items-start gap-2 text-sm p-3 rounded-lg border",
        severity === 'error' && "bg-destructive/5 border-destructive/20 text-destructive",
        severity === 'warning' && "bg-warning/5 border-warning/20 text-warning",
        severity === 'info' && "bg-primary/5 border-primary/20 text-primary",
        className
      )}>
        <Icon className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-medium">{problem}</span>
          {cause && <span className="text-muted-foreground"> — {cause}</span>}
          {fix && (
            <>
              <span className="text-muted-foreground">.</span>
              <span className="font-medium"> {fix}</span>
            </>
          )}
          {code && (
            <span className="text-xs font-mono opacity-70 ml-2">({code})</span>
          )}
        </div>
        {(action || onRetry) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="shrink-0 h-6 px-2 text-xs"
            onClick={action?.onClick || onRetry}
          >
            {action?.label || 'Retry'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Alert 
        variant={config.alertVariant}
        className={cn(
          "border-l-4",
          config.borderColor,
          className
        )}
      >
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <AlertTitle className="font-semibold flex items-center gap-2">
              {problem}
              {code && (
                <span className="text-xs font-mono opacity-70">({code})</span>
              )}
            </AlertTitle>
            
            <AlertDescription className="space-y-2">
              {cause && (
                <div className="text-sm">
                  <span className="font-medium">Cause: </span>
                  <span className="text-muted-foreground">{cause}</span>
                </div>
              )}
              
              {fix && (
                <div className="text-sm">
                  <span className="font-medium">Fix: </span>
                  <span className="text-muted-foreground">{fix}</span>
                </div>
              )}

              {(action || secondaryAction || onRetry) && (
                <div className="flex gap-2 pt-2">
                  {action && (
                    <Button variant="outline" size="sm" onClick={action.onClick}>
                      {action.label}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                  {onRetry && !action && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Try again
                    </Button>
                  )}
                  {secondaryAction && (
                    <Button variant="ghost" size="sm" onClick={secondaryAction.onClick}>
                      {secondaryAction.label}
                    </Button>
                  )}
                </div>
              )}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </motion.div>
  );
}

// ============================================
// Pre-configured Error Messages
// ============================================

/** Network/API error */
export function NetworkError({ 
  onRetry,
  entityName = 'data',
}: { 
  onRetry?: () => void;
  entityName?: string;
}) {
  return (
    <ActionableError
      problem={`Failed to load ${entityName}`}
      cause="Network connection issue or server unavailable"
      fix="Check your connection and try again"
      onRetry={onRetry}
    />
  );
}

/** Permission denied */
export function PermissionError({ 
  action = 'access this resource',
}: { 
  action?: string;
}) {
  return (
    <ActionableError
      problem={`Cannot ${action}`}
      cause="Your role doesn't have the required permissions"
      fix="Contact your administrator to request access"
      severity="warning"
      code="PERMISSION_DENIED"
    />
  );
}

/** Validation error for forms */
export function ValidationError({ 
  problem,
  fields,
  onFix,
}: { 
  problem: string;
  fields?: string[];
  onFix?: () => void;
}) {
  return (
    <ActionableError
      problem={problem}
      cause={fields?.length ? `Missing or invalid: ${fields.join(', ')}` : undefined}
      fix="Review the highlighted fields and correct the errors"
      severity="warning"
      action={onFix ? { label: 'Fix now', onClick: onFix } : undefined}
      inline
    />
  );
}

/** Claim submission error */
export function ClaimSubmissionError({ 
  missingDocs,
  onUploadDocs,
  onSaveDraft,
}: { 
  missingDocs?: number;
  onUploadDocs?: () => void;
  onSaveDraft?: () => void;
}) {
  return (
    <ActionableError
      problem="Claim can't be submitted"
      cause={missingDocs ? `${missingDocs} required document${missingDocs > 1 ? 's are' : ' is'} missing` : 'Required fields are incomplete'}
      fix={missingDocs ? "Upload the missing documents or save as draft to complete later" : "Complete all required fields to submit"}
      severity="warning"
      action={onUploadDocs ? { label: 'Upload documents', onClick: onUploadDocs } : undefined}
      secondaryAction={onSaveDraft ? { label: 'Save as draft', onClick: onSaveDraft } : undefined}
    />
  );
}

/** Data sync error */
export function SyncError({ 
  source,
  onRetry,
  onViewDetails,
}: { 
  source?: string;
  onRetry?: () => void;
  onViewDetails?: () => void;
}) {
  return (
    <ActionableError
      problem={`Sync failed${source ? ` with ${source}` : ''}`}
      cause="The external system is temporarily unavailable or credentials have expired"
      fix="Wait a few minutes and retry, or check integration settings"
      onRetry={onRetry}
      secondaryAction={onViewDetails ? { label: 'View details', onClick: onViewDetails } : undefined}
    />
  );
}

/** Session expired */
export function SessionExpiredError({ 
  onLogin,
}: { 
  onLogin?: () => void;
}) {
  return (
    <ActionableError
      problem="Session expired"
      cause="You've been signed out due to inactivity"
      fix="Sign in again to continue where you left off"
      severity="warning"
      action={onLogin ? { label: 'Sign in', onClick: onLogin } : undefined}
    />
  );
}

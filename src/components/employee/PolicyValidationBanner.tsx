/**
 * Policy Validation Banner
 * 
 * Displays real-time validation feedback for employee claim/request submissions.
 * Shows blockers, warnings, and info from policy checks.
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  FileText,
  Shield,
  Wallet,
  Ban,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubmissionValidation, ValidationIssue, PolicyMatch } from '@/hooks/usePolicyDrivenSubmission';

interface PolicyValidationBannerProps {
  validation: SubmissionValidation;
  policy: PolicyMatch | null | undefined;
  isLoading?: boolean;
  transactionType?: 'claim' | 'request' | 'question';
  className?: string;
}

const ISSUE_ICONS: Record<ValidationIssue['type'], typeof AlertCircle> = {
  eligibility: Shield,
  limit: Wallet,
  document: FileText,
  policy: Info,
};

function IssueItem({ issue, variant }: { issue: ValidationIssue; variant: 'blocker' | 'warning' | 'info' }) {
  const Icon = ISSUE_ICONS[issue.type];
  
  return (
    <div className={cn(
      "flex items-start gap-2 py-1",
      variant === 'blocker' && "text-destructive",
      variant === 'warning' && "text-amber-600 dark:text-amber-500",
      variant === 'info' && "text-muted-foreground",
    )}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className={cn(
          "text-sm font-medium",
          variant === 'blocker' && "text-destructive",
          variant === 'warning' && "text-amber-700 dark:text-amber-400",
        )}>
          {issue.message}
        </p>
        {issue.details && (
          <p className="text-xs text-muted-foreground mt-0.5">{issue.details}</p>
        )}
      </div>
    </div>
  );
}

export function PolicyValidationBanner({
  validation,
  policy,
  isLoading,
  transactionType,
  className,
}: PolicyValidationBannerProps) {
  // Don't show for questions
  if (transactionType === 'question') {
    return null;
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className={cn("p-3 rounded-lg bg-muted/50 animate-pulse", className)}>
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-3 w-48 bg-muted rounded mt-2" />
      </div>
    );
  }
  
  const { blockers, warnings, info, canSubmit } = validation;
  const hasIssues = blockers.length > 0 || warnings.length > 0;
  
  // All clear - compact success message
  if (!hasIssues && policy) {
    return (
      <div className={cn(
        "p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
        className
      )}>
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Eligible for submission</span>
          {policy && (
            <Badge variant="outline" className="ml-auto text-xs">
              {policy.policyRef}
            </Badge>
          )}
        </div>
        {info.length > 0 && (
          <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800 space-y-1">
            {info.map((item, i) => (
              <IssueItem key={i} issue={item} variant="info" />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // Has blockers - show error state
  if (blockers.length > 0) {
    return (
      <Alert variant="destructive" className={cn("border-destructive/50", className)}>
        <Ban className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          Cannot Submit
          <Badge variant="destructive" className="font-normal">
            {blockers.length} issue{blockers.length > 1 ? 's' : ''}
          </Badge>
        </AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-1">
            {blockers.map((issue, i) => (
              <IssueItem key={i} issue={issue} variant="blocker" />
            ))}
          </div>
          {warnings.length > 0 && (
            <div className="mt-3 pt-2 border-t border-destructive/20 space-y-1">
              {warnings.map((issue, i) => (
                <IssueItem key={i} issue={issue} variant="warning" />
              ))}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Warnings only - show caution state
  if (warnings.length > 0) {
    return (
      <Alert className={cn("border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20", className)}>
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2">
          Review Needed
          <Badge variant="outline" className="font-normal border-amber-300 text-amber-700 dark:text-amber-400">
            {warnings.length} warning{warnings.length > 1 ? 's' : ''}
          </Badge>
        </AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-1">
            {warnings.map((issue, i) => (
              <IssueItem key={i} issue={issue} variant="warning" />
            ))}
          </div>
          {info.length > 0 && (
            <div className="mt-3 pt-2 border-t border-amber-200 dark:border-amber-800 space-y-1">
              {info.map((issue, i) => (
                <IssueItem key={i} issue={issue} variant="info" />
              ))}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  // No policy configured - neutral warning
  if (!policy) {
    return (
      <div className={cn(
        "p-3 rounded-lg border bg-muted/50",
        className
      )}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-4 w-4" />
          <span className="text-sm">No policy configured - request will be processed manually</span>
        </div>
      </div>
    );
  }
  
  return null;
}

/**
 * Compact inline version for tight spaces
 */
export function PolicyValidationInline({
  validation,
}: {
  validation: SubmissionValidation;
}) {
  const { blockers, warnings, canSubmit } = validation;
  
  if (blockers.length > 0) {
    return (
      <Badge variant="destructive" className="gap-1">
        <Ban className="h-3 w-3" />
        {blockers.length} blocker{blockers.length > 1 ? 's' : ''}
      </Badge>
    );
  }
  
  if (warnings.length > 0) {
    return (
      <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-3 w-3" />
        {warnings.length} warning{warnings.length > 1 ? 's' : ''}
      </Badge>
    );
  }
  
  if (canSubmit) {
    return (
      <Badge variant="outline" className="gap-1 border-emerald-300 text-emerald-700 dark:text-emerald-400">
        <CheckCircle className="h-3 w-3" />
        OK
      </Badge>
    );
  }
  
  return null;
}

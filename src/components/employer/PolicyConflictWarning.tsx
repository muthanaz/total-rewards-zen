/**
 * Policy Conflict Warning Component
 * 
 * Displays warnings when multiple policies match a category
 * and shows which policy was selected and why.
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { AlertTriangle, ChevronDown, FileText, Check, X, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { ConflictResolutionResult } from '@/lib/policyConflictResolver';

interface PolicyConflictWarningProps {
  resolution: ConflictResolutionResult;
  className?: string;
  variant?: 'alert' | 'inline' | 'minimal';
}

export function PolicyConflictWarning({
  resolution,
  className,
  variant = 'alert',
}: PolicyConflictWarningProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!resolution.had_conflict) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <Badge variant="outline" className={cn('gap-1 text-amber-600 border-amber-300', className)}>
        <AlertTriangle className="h-3 w-3" />
        {resolution.conflict_count} policies matched
      </Badge>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-amber-600', className)}>
        <AlertTriangle className="h-4 w-4" />
        <span>
          {resolution.conflict_count} policies matched this category.{' '}
          <span className="text-muted-foreground">{resolution.selection_reason}</span>
        </span>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <Alert className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="flex items-center justify-between">
          <span className="text-amber-800 dark:text-amber-300">
            Multiple Policies Matched
          </span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <ChevronDown className={cn(
                'h-4 w-4 transition-transform',
                isOpen && 'rotate-180'
              )} />
            </Button>
          </CollapsibleTrigger>
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-400">
          {resolution.conflict_count} policies could apply. The system selected based on: {resolution.selection_reason}
        </AlertDescription>

        <CollapsibleContent className="mt-3 space-y-3">
          {/* Selected policy */}
          {resolution.selected_policy && (
            <div className="flex items-start gap-2 p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-emerald-800 dark:text-emerald-300">
                    {resolution.selected_policy.title}
                  </span>
                  <Badge variant="outline" className="text-xs border-emerald-300">
                    {resolution.selected_policy.policy_ref}
                  </Badge>
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  Selected · {resolution.selection_reason}
                </p>
              </div>
            </div>
          )}

          {/* Rejected policies */}
          {resolution.rejected_policies.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Not Selected
              </p>
              {resolution.rejected_policies.map(({ policy, rejection_reason }) => (
                <div
                  key={policy.id}
                  className="flex items-start gap-2 p-2 rounded bg-muted/50 border border-muted"
                >
                  <X className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">
                        {policy.title}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {policy.policy_ref}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rejection_reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {resolution.warnings.length > 0 && (
            <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
              {resolution.warnings.map((warning, i) => (
                <p key={i} className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ {warning}
                </p>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Alert>
    </Collapsible>
  );
}

/**
 * Inline display for showing which policy was selected (for claims/requests)
 */
interface SelectedPolicyDisplayProps {
  policyRef: string;
  policyTitle: string;
  selectionReason?: string | null;
  hadConflict?: boolean;
  className?: string;
}

export function SelectedPolicyDisplay({
  policyRef,
  policyTitle,
  selectionReason,
  hadConflict,
  className,
}: SelectedPolicyDisplayProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <FileText className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-1.5">
        <Badge variant="outline">{policyRef}</Badge>
        <span className="text-sm text-muted-foreground">{policyTitle}</span>
        {hadConflict && (
          <Badge variant="secondary" className="text-xs gap-1">
            <Shield className="h-3 w-3" />
            Auto-selected
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * Compact conflict indicator for queue views
 */
interface ConflictIndicatorProps {
  hadConflict: boolean;
  conflictCount?: number;
  className?: string;
}

export function ConflictIndicator({
  hadConflict,
  conflictCount,
  className,
}: ConflictIndicatorProps) {
  if (!hadConflict) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 text-xs border-amber-300 text-amber-700 dark:text-amber-400',
        className
      )}
    >
      <AlertTriangle className="h-3 w-3" />
      {conflictCount ? `${conflictCount} matched` : 'Conflict resolved'}
    </Badge>
  );
}

/**
 * PolicyCheckBanner - Policy validation status display
 * 
 * Shows eligibility, caps, and docs status with clear pass/fail indicators.
 * Disables approve button if blockers exist.
 */

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Shield,
  FileText,
  Coins,
  User,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ValidationCheck, PolicyValidationResult } from '@/lib/policyIntegration';

interface PolicyCheckBannerProps {
  validation: PolicyValidationResult | null;
  isLoading?: boolean;
  policyTitle?: string;
  policyRef?: string;
  compact?: boolean;
  className?: string;
}

const CHECK_ICONS: Record<string, React.ElementType> = {
  eligibility: User,
  per_transaction_cap: Coins,
  annual_cap: Coins,
  pre_approval: AlertCircle,
  documents: FileText,
  settlement_flow: Info,
};

function CheckItem({ check, compact }: { check: ValidationCheck; compact?: boolean }) {
  const Icon = CHECK_ICONS[check.key] || Shield;
  const StatusIcon = check.passed ? CheckCircle2 : check.severity === 'blocker' ? XCircle : AlertTriangle;
  
  const statusColors = check.passed 
    ? 'text-emerald-600 bg-emerald-500/10' 
    : check.severity === 'blocker'
      ? 'text-red-600 bg-red-500/10'
      : 'text-amber-600 bg-amber-500/10';
  
  if (compact) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'gap-1 text-xs',
          check.passed && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          !check.passed && check.severity === 'blocker' && 'bg-red-500/10 text-red-600 border-red-500/20',
          !check.passed && check.severity === 'warning' && 'bg-amber-500/10 text-amber-600 border-amber-500/20'
        )}
      >
        <StatusIcon className="w-3 h-3" />
        {check.label}
      </Badge>
    );
  }
  
  return (
    <div className="flex items-start gap-3 py-2">
      <div className={cn('p-1.5 rounded', statusColors)}>
        <StatusIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-medium text-sm">{check.label}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {check.message}
        </p>
      </div>
    </div>
  );
}

export function PolicyCheckBanner({
  validation,
  isLoading,
  policyTitle,
  policyRef,
  compact = false,
  className,
}: PolicyCheckBannerProps) {
  const summary = useMemo(() => {
    if (!validation) return null;
    
    const { blockerCount, warningCount, checks } = validation;
    const passedCount = checks.filter(c => c.passed).length;
    
    if (blockerCount > 0) {
      return {
        status: 'blocked',
        icon: XCircle,
        title: 'Cannot Approve',
        description: `${blockerCount} blocking issue${blockerCount > 1 ? 's' : ''} must be resolved`,
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        textColor: 'text-red-600',
      };
    }
    
    if (warningCount > 0) {
      return {
        status: 'review',
        icon: AlertTriangle,
        title: 'Review Required',
        description: `${warningCount} warning${warningCount > 1 ? 's' : ''} need attention`,
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        textColor: 'text-amber-600',
      };
    }
    
    return {
      status: 'ok',
      icon: CheckCircle2,
      title: 'Ready to Approve',
      description: `All ${passedCount} policy checks passed`,
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-600',
    };
  }, [validation]);

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="h-4 bg-muted rounded w-1/3 mb-2" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (!validation || !summary) {
    return (
      <Alert className={className}>
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>No Policy Configured</AlertTitle>
        <AlertDescription>
          No published policy found for this benefit. Approval may not be possible.
        </AlertDescription>
      </Alert>
    );
  }

  const SummaryIcon = summary.icon;

  if (compact) {
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        <Badge 
          variant="outline" 
          className={cn('gap-1', summary.bgColor, summary.textColor, summary.borderColor)}
        >
          <SummaryIcon className="w-3 h-3" />
          {summary.title}
        </Badge>
        {validation.checks.filter(c => !c.passed).map(check => (
          <CheckItem key={check.key} check={check} compact />
        ))}
        {policyRef && (
          <Badge variant="outline" className="text-xs font-mono">
            {policyRef}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('border', summary.borderColor, className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={cn('p-2 rounded-lg', summary.bgColor)}>
            <SummaryIcon className={cn('w-5 h-5', summary.textColor)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className={cn('font-semibold', summary.textColor)}>
                {summary.title}
              </h4>
              {policyRef && (
                <Badge variant="outline" className="text-xs font-mono">
                  {policyRef}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {summary.description}
            </p>
            {policyTitle && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Policy: {policyTitle}
              </p>
            )}
          </div>
        </div>

        {/* Check items */}
        <div className="border-t pt-3 space-y-1">
          {validation.checks.map(check => (
            <CheckItem key={check.key} check={check} />
          ))}
        </div>

        {/* Transaction type indicator */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Transaction Type</span>
          <Badge variant="secondary">{validation.transactionLabel}</Badge>
        </div>

        {validation.settlementRequired && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" />
            Settlement required after trip/expense completion
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Simple inline status for table rows
 */
export function PolicyCheckInline({ 
  canApprove, 
  blockerCount, 
  warningCount 
}: { 
  canApprove: boolean; 
  blockerCount: number; 
  warningCount: number;
}) {
  if (!canApprove) {
    return (
      <Badge variant="destructive" className="gap-1 text-xs">
        <XCircle className="w-3 h-3" />
        {blockerCount} blocker{blockerCount > 1 ? 's' : ''}
      </Badge>
    );
  }
  
  if (warningCount > 0) {
    return (
      <Badge className="gap-1 text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
        <AlertTriangle className="w-3 h-3" />
        {warningCount} warning{warningCount > 1 ? 's' : ''}
      </Badge>
    );
  }
  
  return (
    <Badge className="gap-1 text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
      <CheckCircle2 className="w-3 h-3" />
      OK
    </Badge>
  );
}

/**
 * Compliance Status Banner
 * 
 * Displays the frozen compliance status from the request record.
 * This is NOT re-derived - it shows exactly what was captured at submission time.
 * 
 * Used in ClaimReviewSheet to show employers why a request was flagged.
 */

import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Shield,
  Info,
  Clock,
  FileWarning,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending_check' | 'exempt';

export interface ComplianceReason {
  type: 'eligibility' | 'limit' | 'document' | 'policy';
  code: string;
  message: string;
  details?: string;
}

interface ComplianceStatusBannerProps {
  status: ComplianceStatus | null | undefined;
  reasons: ComplianceReason[] | null | undefined;
  policyRef?: string | null;
  className?: string;
  compact?: boolean;
}

const STATUS_CONFIG: Record<ComplianceStatus, {
  icon: React.ElementType;
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeVariant: 'default' | 'destructive' | 'outline' | 'secondary';
}> = {
  compliant: {
    icon: CheckCircle2,
    title: 'Policy Compliant',
    description: 'This submission meets all policy requirements',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-600',
    badgeVariant: 'outline',
  },
  non_compliant: {
    icon: AlertTriangle,
    title: 'Non-Compliant Submission',
    description: 'This submission has policy violations but was allowed through soft gating',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-600',
    badgeVariant: 'secondary',
  },
  pending_check: {
    icon: Clock,
    title: 'Pending Verification',
    description: 'Policy compliance has not been checked yet',
    bgColor: 'bg-muted/50',
    borderColor: 'border-muted',
    textColor: 'text-muted-foreground',
    badgeVariant: 'outline',
  },
  exempt: {
    icon: Info,
    title: 'Exempt from Policy Checks',
    description: 'Questions do not require policy validation',
    bgColor: 'bg-muted/50',
    borderColor: 'border-muted',
    textColor: 'text-muted-foreground',
    badgeVariant: 'outline',
  },
};

const REASON_ICONS: Record<string, React.ElementType> = {
  eligibility: Shield,
  limit: AlertTriangle,
  document: FileWarning,
  policy: Info,
};

export function ComplianceStatusBanner({
  status,
  reasons,
  policyRef,
  className,
  compact = false,
}: ComplianceStatusBannerProps) {
  // Default to pending_check if no status
  const effectiveStatus = status || 'pending_check';
  const config = STATUS_CONFIG[effectiveStatus];
  const Icon = config.icon;
  
  const parsedReasons = useMemo(() => {
    if (!reasons) return [];
    // Handle both array and potentially stringified JSON
    if (Array.isArray(reasons)) return reasons as ComplianceReason[];
    if (typeof reasons === 'string') {
      try {
        return JSON.parse(reasons) as ComplianceReason[];
      } catch {
        return [];
      }
    }
    return [];
  }, [reasons]);
  
  // Don't show banner for exempt or pending_check if no issues
  if (effectiveStatus === 'exempt') {
    return null;
  }
  
  if (compact) {
    return (
      <Badge
        variant={config.badgeVariant}
        className={cn(
          'gap-1 text-xs',
          effectiveStatus === 'compliant' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          effectiveStatus === 'non_compliant' && 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          className
        )}
      >
        <Icon className="w-3 h-3" />
        {effectiveStatus === 'compliant' ? 'Compliant' : 
         effectiveStatus === 'non_compliant' ? 'Non-Compliant' : 
         'Pending'}
      </Badge>
    );
  }
  
  // Compliant - simple success banner
  if (effectiveStatus === 'compliant') {
    return (
      <div className={cn(
        "p-3 rounded-lg border",
        config.bgColor,
        config.borderColor,
        className
      )}>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", config.textColor)} />
          <span className={cn("text-sm font-medium", config.textColor)}>
            {config.title}
          </span>
          {policyRef && (
            <Badge variant="outline" className="ml-auto text-xs">
              {policyRef}
            </Badge>
          )}
        </div>
      </div>
    );
  }
  
  // Non-compliant - show reasons
  if (effectiveStatus === 'non_compliant') {
    return (
      <Card className={cn("border", config.borderColor, className)}>
        <CardHeader className={cn("pb-2", config.bgColor)}>
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon className={cn("h-4 w-4", config.textColor)} />
            <span className={config.textColor}>{config.title}</span>
            {policyRef && (
              <Badge variant="outline" className="ml-auto text-xs">
                {policyRef}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <p className="text-xs text-muted-foreground mb-3">
            {config.description}. You may still process this submission.
          </p>
          
          {parsedReasons.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Issues at submission time:
              </p>
              {parsedReasons.map((reason, idx) => {
                const ReasonIcon = REASON_ICONS[reason.type] || Info;
                return (
                  <div 
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded bg-muted/50"
                  >
                    <ReasonIcon className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{reason.message}</p>
                      {reason.details && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {reason.details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Pending check - minimal banner
  return (
    <div className={cn(
      "p-3 rounded-lg border",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", config.textColor)} />
        <span className={cn("text-sm", config.textColor)}>
          {config.title}
        </span>
      </div>
    </div>
  );
}

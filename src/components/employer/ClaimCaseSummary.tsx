/**
 * Claim Case Summary Component
 * 
 * Displays a condensed overview block with:
 * - Eligibility status
 * - SLA status
 * - Assignee
 * - Missing docs count
 * - Policy reference
 * - Last action + timestamp
 */

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User2, 
  FileText,
  BookOpen,
  Activity,
  AlertCircle,
  UserCheck,
  Hourglass,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { calculateSLA, SLAResult, getStatusDisplayLabel } from '@/lib/crossPortalContract';
import { ClaimDocumentStatus } from '@/hooks/useClaimDocumentStatus';

interface ClaimValidation {
  isEligible?: boolean;
  isValid?: boolean;
  blockers: { message: string }[];
  warnings: { message: string }[];
}

interface TimelineEvent {
  id: string;
  action?: string | null;
  to_status?: string;
  created_at: string;
  actor_name?: string | null;
  actor_role?: string | null;
}

interface ClaimCaseSummaryProps {
  // Claim data
  claimId: string;
  status: string | null;
  slaDueAt: string | null;
  assignedTo: string | null;
  assignedToName?: string | null;
  policyRef: string | null;
  
  // Computed data
  validation: ClaimValidation;
  documentStatus: ClaimDocumentStatus;
  timeline?: TimelineEvent[];
  
  className?: string;
}

export function ClaimCaseSummary({
  claimId,
  status,
  slaDueAt,
  assignedTo,
  assignedToName,
  policyRef,
  validation,
  documentStatus,
  timeline,
  className,
}: ClaimCaseSummaryProps) {
  // Compute SLA status
  const slaInfo = useMemo(() => {
    if (!slaDueAt || !status) return null;
    return calculateSLA(slaDueAt, status);
  }, [slaDueAt, status]);

  // Get last action from timeline
  const lastAction = useMemo(() => {
    if (!timeline || timeline.length === 0) return null;
    const event = timeline[0];
    return {
      action: event.action || `Status → ${getStatusDisplayLabel(event.to_status || null)}`,
      timestamp: event.created_at,
      actor: event.actor_name || 'System',
    };
  }, [timeline]);

  // Eligibility summary
  const eligibilityStatus = useMemo(() => {
    if (validation.blockers.length > 0) {
      return {
        status: 'blocked',
        label: 'Not Eligible',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-500/10',
        message: validation.blockers[0].message,
      };
    }
    if (validation.warnings.length > 0) {
      return {
        status: 'warning',
        label: 'Review Required',
        icon: AlertTriangle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-500/10',
        message: validation.warnings[0].message,
      };
    }
    if (validation.isEligible || validation.isValid) {
      return {
        status: 'eligible',
        label: 'Eligible',
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-500/10',
        message: 'All eligibility checks passed',
      };
    }
    return {
      status: 'unknown',
      label: 'Unknown',
      icon: AlertCircle,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      message: 'Eligibility not determined',
    };
  }, [validation]);

  // SLA display
  const slaDisplay = useMemo(() => {
    if (!slaInfo) {
      return {
        label: 'No SLA',
        icon: Clock,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
      };
    }
    if (slaInfo.isOverdue) {
      return {
        label: `Overdue by ${Math.abs(slaInfo.hoursRemaining)}h`,
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-500/10',
      };
    }
    if (slaInfo.isUrgent) {
      return {
        label: `${slaInfo.hoursRemaining}h remaining`,
        icon: Hourglass,
        color: 'text-amber-600',
        bgColor: 'bg-amber-500/10',
      };
    }
    return {
      label: `${slaInfo.daysRemaining}d remaining`,
      icon: Clock,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    };
  }, [slaInfo]);

  const EligIcon = eligibilityStatus.icon;
  const SlaIcon = slaDisplay.icon;

  return (
    <Card className={cn("border-l-4", 
      eligibilityStatus.status === 'blocked' ? 'border-l-red-500' :
      eligibilityStatus.status === 'warning' ? 'border-l-amber-500' :
      'border-l-emerald-500',
      className
    )}>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Eligibility */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Eligibility</p>
            <div className={cn("flex items-center gap-1.5 text-sm font-medium", eligibilityStatus.color)}>
              <EligIcon className="w-4 h-4" />
              <span>{eligibilityStatus.label}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1" title={eligibilityStatus.message}>
              {eligibilityStatus.message}
            </p>
          </div>

          {/* SLA Status */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">SLA Status</p>
            <div className={cn("flex items-center gap-1.5 text-sm font-medium", slaDisplay.color)}>
              <SlaIcon className="w-4 h-4" />
              <span>{slaDisplay.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {slaInfo ? (slaInfo.isOverdue ? 'Action required' : 'On track') : 'N/A'}
            </p>
          </div>

          {/* Assignee */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Assignee</p>
            <div className={cn("flex items-center gap-1.5 text-sm font-medium", 
              assignedTo ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {assignedTo ? (
                <>
                  <UserCheck className="w-4 h-4 text-primary" />
                  <span>{assignedToName || 'Assigned'}</span>
                </>
              ) : (
                <>
                  <User2 className="w-4 h-4" />
                  <span className="italic">Unassigned</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {assignedTo ? 'Owner assigned' : 'Needs assignment'}
            </p>
          </div>

          {/* Missing Docs */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Documents</p>
            <div className={cn("flex items-center gap-1.5 text-sm font-medium",
              documentStatus.noDocsRequired ? 'text-muted-foreground' :
              documentStatus.hasMissingDocs ? 'text-amber-600' : 'text-emerald-600'
            )}>
              <FileText className="w-4 h-4" />
              {documentStatus.noDocsRequired ? (
                <span>None required</span>
              ) : documentStatus.hasMissingDocs ? (
                <span>{documentStatus.counts.missing} missing</span>
              ) : (
                <span>Complete ({documentStatus.counts.provided})</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {documentStatus.noDocsRequired ? 'No docs needed' :
               `${documentStatus.counts.provided}/${documentStatus.counts.required} provided`}
            </p>
          </div>

          {/* Policy Ref */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Policy Ref</p>
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs">{policyRef || '—'}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {policyRef ? 'Policy linked' : 'No policy reference'}
            </p>
          </div>

          {/* Last Action */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Last Action</p>
            {lastAction ? (
              <>
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="line-clamp-1 capitalize">{lastAction.action.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {lastAction.actor} • {formatRelativeTime(lastAction.timestamp)}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  <span className="italic">No activity</span>
                </div>
                <p className="text-xs text-muted-foreground">No events recorded</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

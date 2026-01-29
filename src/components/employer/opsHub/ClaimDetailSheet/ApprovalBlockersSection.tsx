/**
 * Approval Blockers Section
 * 
 * Shows explicit blockers at top of Decision tab with:
 * - What is blocking approval
 * - How to resolve each blocker
 * - Override option with reason code + audit note
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileX,
  ShieldAlert,
  TrendingUp,
  Database,
  FileQuestion,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ApprovalBlocker {
  id: string;
  type: 'missing_docs' | 'unverified_docs' | 'no_payable' | 'cap_exceeded' | 'no_policy' | 'no_settlement_method';
  label: string;
  description: string;
  severity: 'error' | 'warning';
  resolutionAction: string;
  resolutionLabel: string;
  canOverride: boolean;
}

interface ApprovalBlockersSectionProps {
  blockers: ApprovalBlocker[];
  onResolveAction?: (blockerId: string, action: string) => void;
  className?: string;
}

const blockerIcons: Record<ApprovalBlocker['type'], React.ReactNode> = {
  missing_docs: <FileX className="w-4 h-4" />,
  unverified_docs: <FileQuestion className="w-4 h-4" />,
  no_payable: <Database className="w-4 h-4" />,
  cap_exceeded: <TrendingUp className="w-4 h-4" />,
  no_policy: <ShieldAlert className="w-4 h-4" />,
  no_settlement_method: <AlertTriangle className="w-4 h-4" />,
};

export function ApprovalBlockersSection({
  blockers,
  onResolveAction,
  className,
}: ApprovalBlockersSectionProps) {
  if (blockers.length === 0) {
    return (
      <Card className={cn("border-success/30 bg-success/5", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-success">
            <CheckCircle className="w-4 h-4" />
            Ready for Approval
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            All approval criteria are satisfied. You can proceed with standard approval.
          </p>
        </CardContent>
      </Card>
    );
  }

  const errorBlockers = blockers.filter(b => b.severity === 'error');
  const warningBlockers = blockers.filter(b => b.severity === 'warning');
  const hasErrors = errorBlockers.length > 0;

  return (
    <Card className={cn(
      "border-l-4",
      hasErrors ? "border-destructive/50 bg-destructive/5" : "border-warning/50 bg-warning/5",
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className={cn("w-4 h-4", hasErrors ? "text-destructive" : "text-warning")} />
          Approval Blockers
          <Badge variant={hasErrors ? "destructive" : "secondary"} className="ml-auto text-xs">
            {blockers.length} issue{blockers.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Error blockers first */}
        {errorBlockers.map((blocker) => (
          <div 
            key={blocker.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
          >
            <div className="shrink-0 w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
              {blockerIcons[blocker.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{blocker.label}</span>
                <XCircle className="w-3.5 h-3.5 text-destructive" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{blocker.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <ArrowRight className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">{blocker.resolutionAction}</span>
              </div>
            </div>
            {onResolveAction && (
              <Button 
                variant="outline" 
                size="sm" 
                className="shrink-0 text-xs"
                onClick={() => onResolveAction(blocker.id, blocker.resolutionLabel)}
              >
                {blocker.resolutionLabel}
              </Button>
            )}
          </div>
        ))}

        {/* Warning blockers */}
        {warningBlockers.map((blocker) => (
          <div 
            key={blocker.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20"
          >
            <div className="shrink-0 w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center text-warning">
              {blockerIcons[blocker.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{blocker.label}</span>
                {blocker.canOverride && (
                  <Badge variant="outline" className="text-[10px] h-4">Can override</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{blocker.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <ArrowRight className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">{blocker.resolutionAction}</span>
              </div>
            </div>
            {onResolveAction && (
              <Button 
                variant="outline" 
                size="sm" 
                className="shrink-0 text-xs"
                onClick={() => onResolveAction(blocker.id, blocker.resolutionLabel)}
              >
                {blocker.resolutionLabel}
              </Button>
            )}
          </div>
        ))}

        {/* Override note */}
        {warningBlockers.some(b => b.canOverride) && (
          <Alert className="mt-3">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle className="text-xs">Override Available</AlertTitle>
            <AlertDescription className="text-xs">
              Some blockers can be overridden with "Approve with Exception". This requires selecting
              the override reason code and providing a detailed audit note (minimum 20 characters).
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Helper to compute blockers from claim data
export function computeApprovalBlockers(
  claim: {
    payableAmount: number | null;
    amountClaimed: number | null;
    policyRef: string | null;
  },
  documents: Array<{
    isRequired: boolean;
    status: string;
    docName: string;
  }>,
  settlementMethod: string | null
): ApprovalBlocker[] {
  const blockers: ApprovalBlocker[] = [];

  // Missing required documents
  const missingDocs = documents.filter(d => d.isRequired && d.status === 'missing');
  if (missingDocs.length > 0) {
    blockers.push({
      id: 'missing_docs',
      type: 'missing_docs',
      label: 'Missing Required Documents',
      description: `${missingDocs.length} document(s) not uploaded: ${missingDocs.map(d => d.docName).join(', ')}`,
      severity: 'error',
      resolutionAction: 'Request employee to upload missing documents',
      resolutionLabel: 'Request Docs',
      canOverride: false,
    });
  }

  // Unverified documents
  const unverifiedDocs = documents.filter(d => d.isRequired && d.status === 'pending');
  if (unverifiedDocs.length > 0) {
    blockers.push({
      id: 'unverified_docs',
      type: 'unverified_docs',
      label: 'Unverified Documents',
      description: `${unverifiedDocs.length} document(s) pending verification`,
      severity: 'warning',
      resolutionAction: 'Go to Documents tab and verify each document',
      resolutionLabel: 'Verify Docs',
      canOverride: true,
    });
  }

  // No payable amount
  if (claim.payableAmount === null || claim.payableAmount === undefined) {
    blockers.push({
      id: 'no_payable',
      type: 'no_payable',
      label: 'Payable Amount Not Computed',
      description: 'The payable amount has not been calculated yet',
      severity: 'error',
      resolutionAction: 'Compute payable amount before approval',
      resolutionLabel: 'Compute',
      canOverride: false,
    });
  } else if (claim.payableAmount <= 0) {
    blockers.push({
      id: 'zero_payable',
      type: 'no_payable',
      label: 'Zero Payable Amount',
      description: 'Computed payable amount is zero or negative',
      severity: 'warning',
      resolutionAction: 'Review claim details and entitlement balance',
      resolutionLabel: 'Review',
      canOverride: true,
    });
  }

  // No policy linked
  if (!claim.policyRef) {
    blockers.push({
      id: 'no_policy',
      type: 'no_policy',
      label: 'No Policy Linked',
      description: 'This claim is not linked to an active benefit policy',
      severity: 'warning',
      resolutionAction: 'Verify policy applicability manually before approval',
      resolutionLabel: 'Verify',
      canOverride: true,
    });
  }

  return blockers;
}

export default ApprovalBlockersSection;

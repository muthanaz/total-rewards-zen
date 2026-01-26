/**
 * Action Governance Card
 * 
 * Shows approval requirements and handles approval workflow
 * for action items that require governance.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { format } from 'date-fns';
import type { 
  ActionApprovalRequirement, 
  ActionType, 
  ActionGovernanceConfig 
} from '@/lib/actions/actionTypes';

interface ActionGovernanceCardProps {
  actionType: ActionType;
  expectedImpact?: number;
  approval: ActionApprovalRequirement | null;
  governanceConfig: ActionGovernanceConfig;
  onRequestApproval: (note?: string) => void;
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  isOwner: boolean;
  isApprover: boolean;
  className?: string;
}

export function ActionGovernanceCard({
  actionType,
  expectedImpact,
  approval,
  governanceConfig,
  onRequestApproval,
  onApprove,
  onReject,
  isOwner,
  isApprover,
  className,
}: ActionGovernanceCardProps) {
  const [requestNote, setRequestNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Check if approval is required
  const requiresApprovalByType = governanceConfig.requireApprovalForTypes.includes(actionType);
  const requiresApprovalByImpact = governanceConfig.requireApprovalAboveImpact && 
    expectedImpact && 
    expectedImpact >= governanceConfig.requireApprovalAboveImpact;
  const requiresApproval = requiresApprovalByType || requiresApprovalByImpact;

  const getApproverRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      executive: 'Executive',
      hr_lead: 'HR Lead',
      finance: 'Finance',
      comp_ben: 'Comp & Ben',
    };
    return labels[role] || role;
  };

  // No approval required
  if (!requiresApproval) {
    return (
      <Card className={cn('border-success/30 bg-success/5', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-sm">No Approval Required</p>
              <p className="text-xs text-muted-foreground">
                This action can proceed without additional approvals
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Approval already granted
  if (approval?.status === 'approved') {
    return (
      <Card className={cn('border-success/30 bg-success/5', className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm text-success">Approved</p>
              <p className="text-xs text-muted-foreground">
                By {approval.approverName || 'Approver'} on{' '}
                {approval.decidedAt ? format(approval.decidedAt, 'MMM d, yyyy') : 'recently'}
              </p>
              {approval.reason && (
                <p className="text-sm mt-2 p-2 bg-background rounded border">
                  "{approval.reason}"
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Approval rejected
  if (approval?.status === 'rejected') {
    return (
      <Card className={cn('border-destructive/30 bg-destructive/5', className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm text-destructive">Approval Rejected</p>
              <p className="text-xs text-muted-foreground">
                By {approval.approverName || 'Approver'} on{' '}
                {approval.decidedAt ? format(approval.decidedAt, 'MMM d, yyyy') : 'recently'}
              </p>
              {approval.reason && (
                <p className="text-sm mt-2 p-2 bg-background rounded border">
                  Reason: {approval.reason}
                </p>
              )}
              {isOwner && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => onRequestApproval()}
                >
                  Request Again
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Approval pending
  if (approval?.status === 'pending') {
    return (
      <Card className={cn('border-warning/30 bg-warning/5', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            Pending Approval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-background border">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {approval.approverName?.split(' ').map(n => n[0]).join('') || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{approval.approverName || 'Approver'}</p>
              <p className="text-xs text-muted-foreground">
                {getApproverRoleLabel(approval.approverRole || governanceConfig.defaultApproverRole)}
              </p>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Requested {approval.requestedAt ? format(approval.requestedAt, 'MMM d, yyyy') : 'recently'}
          </p>

          {/* Approver actions */}
          {isApprover && (
            <div className="pt-3 border-t space-y-3">
              <p className="text-xs font-medium">Your Decision</p>
              {showRejectInput ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onReject?.(rejectReason)}
                      disabled={!rejectReason.trim()}
                    >
                      Confirm Rejection
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowRejectInput(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="gap-1"
                    onClick={onApprove}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => setShowRejectInput(true)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // No approval requested yet
  return (
    <Card className={cn('border-primary/20', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Approval Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Reason for requirement */}
        <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
          {requiresApprovalByType && (
            <p className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                <strong className="capitalize">{actionType}</strong> actions require approval
              </span>
            </p>
          )}
          {requiresApprovalByImpact && expectedImpact && (
            <p className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                Impact above {formatCurrencyAED(governanceConfig.requireApprovalAboveImpact!)} requires approval
              </span>
            </p>
          )}
        </div>

        {/* Approver info */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {getApproverRoleLabel(governanceConfig.defaultApproverRole)}
          </Badge>
          <span className="text-xs text-muted-foreground">will review this action</span>
        </div>

        {/* Request approval form */}
        {isOwner && (
          <div className="space-y-2 pt-2 border-t">
            <Textarea
              placeholder="Add a note for the approver (optional)..."
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              rows={2}
            />
            <Button 
              className="w-full gap-2"
              onClick={() => onRequestApproval(requestNote)}
            >
              <Send className="h-3.5 w-3.5" />
              Request Approval
            </Button>
          </div>
        )}

        {!isOwner && (
          <div className="flex items-center gap-2 p-2 rounded bg-muted/30 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            Only the action owner can request approval
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * ClaimDetailSheet - Right-side DrillDownSheet for claim processing
 * 
 * Unified claim review experience with:
 * - Timeline/History
 * - Policy Check (eligibility, limits)
 * - Document Checklist
 * - Approve/Reject/Request Info actions
 * - SLA information with pause awareness
 */

import { useState, useMemo } from 'react';
import { DrillDownSheet, DrillDownSummaryGrid } from '@/components/shared/DrillDownSheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Shield,
  Timer,
  AlertTriangle,
  History,
  Paperclip,
  Pause,
  Lightbulb,
  Info,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { ClaimsTypeChip } from './ClaimsTypeChip';
import { WaitingOnBadge } from '@/components/shared/WaitingOnBadge';
import { RequestDocumentsChecklist } from './RequestDocumentsChecklist';
import { RequestTimeline, type TimelineEvent } from '@/components/shared/RequestTimeline';
import { useSharedRequest, useRequestTimeline } from '@/hooks/useSharedRequests';
import { useBenefitByCategory, useClaimEntitlementCheck, useClaimValidation } from '@/hooks/useClaimEntitlements';
import { useClaimActions } from '@/hooks/useClaimActions';
import { useToast } from '@/hooks/use-toast';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { 
  calculateSLA, 
  getStatusDisplayLabel,
  isProcessableStatus,
} from '@/lib/crossPortalContract';
import { format } from 'date-fns';

interface ClaimDetailSheetProps {
  requestId: string | null;
  organizationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

const REJECTION_REASONS = [
  { value: 'incomplete_docs', label: 'Insufficient Documentation' },
  { value: 'exceeds_limit', label: 'Exceeds Entitlement Limit' },
  { value: 'not_eligible', label: 'Eligibility Criteria Not Met' },
  { value: 'duplicate', label: 'Duplicate Submission' },
  { value: 'policy_violation', label: 'Policy Non-Compliance' },
  { value: 'other', label: 'Other (specify in notes)' },
];

export function ClaimDetailSheet({
  requestId,
  organizationId,
  open,
  onOpenChange,
  onStatusChange,
}: ClaimDetailSheetProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'docs' | 'history'>('overview');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showRequestInfoForm, setShowRequestInfoForm] = useState(false);

  // Fetch request data
  const { data: request, isLoading, refetch } = useSharedRequest(requestId);
  const { data: timeline = [] } = useRequestTimeline(requestId, true);
  
  // Get matching benefit for entitlement check
  const { data: matchingBenefit } = useBenefitByCategory(request?.category || null);
  
  // Entitlement check
  const { data: entitlementCheck } = useClaimEntitlementCheck(
    request?.user_id || null,
    matchingBenefit?.id || null,
    organizationId
  );
  
  // Validation
  const validation = useClaimValidation(entitlementCheck, request?.amount || null);
  
  // Actions
  const { approve, reject, requestInfo, isLoading: isProcessing } = useClaimActions();

  // SLA calculation with pause awareness
  const slaInfo = useMemo(() => {
    if (!request?.sla_due_at || !request?.status) return null;
    return calculateSLA(request.sla_due_at, request.status);
  }, [request]);

  const canProcess = request && isProcessableStatus(request.status);

  // Recommended action based on validation
  const recommendedAction = useMemo(() => {
    if (!request || !canProcess) return null;
    
    if (validation.blockers.length > 0) {
      return { action: 'reject', label: 'Recommend Reject', color: 'text-destructive' };
    }
    if (validation.warnings.some(w => w.message.toLowerCase().includes('document'))) {
      return { action: 'request_docs', label: 'Recommend Request Docs', color: 'text-warning' };
    }
    if (validation.warnings.length > 0) {
      return { action: 'review', label: 'Manual Review Required', color: 'text-warning' };
    }
    if (entitlementCheck?.hasEntitlement) {
      return { action: 'approve', label: 'Recommend Approve', color: 'text-success' };
    }
    return null;
  }, [request, canProcess, validation, entitlementCheck]);

  const handleApprove = async () => {
    if (!request) return;
    try {
      await approve.mutateAsync({
        requestId: request.id,
        reviewerNotes: reviewNotes || 'Approved',
      });
      toast({ title: 'Claim Approved', description: 'Employee will be notified.' });
      refetch();
      onStatusChange?.();
      setReviewNotes('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve claim.', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!request || !rejectionReason) return;
    try {
      const reasonLabel = REJECTION_REASONS.find(r => r.value === rejectionReason)?.label || rejectionReason;
      await reject.mutateAsync({
        requestId: request.id,
        reason: reasonLabel,
        reviewerNotes: reviewNotes,
      });
      toast({ title: 'Claim Rejected', description: 'Employee will be notified.' });
      refetch();
      onStatusChange?.();
      setReviewNotes('');
      setRejectionReason('');
      setShowRejectForm(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject claim.', variant: 'destructive' });
    }
  };

  const handleRequestInfo = async () => {
    if (!request || !reviewNotes) return;
    try {
      await requestInfo.mutateAsync({
        requestId: request.id,
        requestedInfo: reviewNotes,
      });
      toast({ title: 'Information Requested', description: 'Employee will be notified.' });
      refetch();
      onStatusChange?.();
      setReviewNotes('');
      setShowRequestInfoForm(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to request info.', variant: 'destructive' });
    }
  };

  if (!request && !isLoading) return null;

  // Summary items for top grid
  const summaryItems = [
    {
      label: 'Amount',
      value: request?.amount ? formatCurrencyAED(request.amount) : 'N/A',
    },
    {
      label: 'Days in Queue',
      value: request?.daysInQueue || 0,
    },
    {
      label: 'SLA Status',
      value: slaInfo?.isPaused 
        ? 'Paused' 
        : slaInfo?.isOverdue 
          ? 'Overdue' 
          : slaInfo 
            ? `${slaInfo.hoursRemaining}h left`
            : 'N/A',
    },
  ];

  // Transform timeline data for the RequestTimeline component
  const timelineEvents: TimelineEvent[] = timeline.map(e => ({
    id: e.id,
    request_id: e.request_id,
    actor_user_id: e.actor_user_id,
    from_status: e.from_status,
    to_status: e.to_status,
    notes_employee_visible: e.notes_employee_visible,
    notes_internal: e.notes_internal,
    created_at: e.created_at,
    actorName: e.actor_name,
    actorRole: e.actor_role as 'employee' | 'employer' | 'system' | undefined,
  }));

  return (
    <DrillDownSheet
      open={open}
      onOpenChange={onOpenChange}
      title={request?.subject || 'Loading...'}
      subtitle={request?.employeeName || undefined}
      icon={FileText}
      badge={request ? { label: getStatusDisplayLabel(request.status), variant: 'secondary' } : undefined}
      size="lg"
      summary={
        <div className="space-y-4">
          {/* Quick Info Row */}
          <div className="flex flex-wrap gap-2">
            <ClaimsTypeChip requestType={request?.request_type || 'claim'} />
            <Badge variant="outline">{request?.category || 'General'}</Badge>
            <WaitingOnBadge status={request?.status || null} perspective="hr" />
            {slaInfo?.isPaused && (
              <Badge variant="outline" className="gap-1 bg-purple-500/10 text-purple-600 border-purple-500/20">
                <Pause className="w-3 h-3" />
                SLA Paused
              </Badge>
            )}
          </div>
          
          {/* Summary Grid */}
          <DrillDownSummaryGrid items={summaryItems} columns={3} />
          
          {/* Recommended Action */}
          {recommendedAction && (
            <Alert className={cn(
              'border',
              recommendedAction.action === 'approve' && 'border-success/30 bg-success/5',
              recommendedAction.action === 'reject' && 'border-destructive/30 bg-destructive/5',
              recommendedAction.action === 'request_docs' && 'border-warning/30 bg-warning/5',
              recommendedAction.action === 'review' && 'border-warning/30 bg-warning/5'
            )}>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription className={cn('font-medium', recommendedAction.color)}>
                {recommendedAction.label}
              </AlertDescription>
            </Alert>
          )}
        </div>
      }
      actions={canProcess ? {
        primary: !showRejectForm && !showRequestInfoForm ? {
          label: 'Approve',
          onClick: handleApprove,
          icon: CheckCircle,
        } : undefined,
        secondary: !showRejectForm && !showRequestInfoForm ? {
          label: 'Reject',
          onClick: () => setShowRejectForm(true),
          icon: XCircle,
        } : undefined,
      } : undefined}
    >
      {/* Action Forms (contextual) */}
      {showRejectForm && (
        <Card className="mb-4 border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <XCircle className="w-4 h-4" />
              Reject Claim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_REASONS.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea 
                value={reviewNotes} 
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Additional notes for the employee..."
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleReject}
                disabled={!rejectionReason || isProcessing}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Confirm Reject
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowRejectForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showRequestInfoForm && (
        <Card className="mb-4 border-warning/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-warning">
              <MessageSquare className="w-4 h-4" />
              Request Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>What information is needed?</Label>
              <Textarea 
                value={reviewNotes} 
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Describe what documents or information the employee should provide..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleRequestInfo}
                disabled={!reviewNotes.trim() || isProcessing}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Send Request
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowRequestInfoForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions (when forms not shown) */}
      {canProcess && !showRejectForm && !showRequestInfoForm && (
        <PermissionGate permission="can_process_claims">
          <div className="flex gap-2 mb-4">
            <Button size="sm" variant="outline" onClick={() => setShowRequestInfoForm(true)}>
              <MessageSquare className="w-4 h-4 mr-1" />
              Request Info
            </Button>
          </div>
        </PermissionGate>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview" className="gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-1.5">
            <Paperclip className="w-3.5 h-3.5" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="w-3.5 h-3.5" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* SLA Info */}
          {slaInfo && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Timer className="w-4 h-4 text-primary" />
                  SLA Timeline
                  {slaInfo.isPaused && (
                    <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600">
                      Paused - waiting on employee
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className={cn(
                      'font-medium',
                      slaInfo.isPaused && 'text-purple-600',
                      !slaInfo.isPaused && slaInfo.isOverdue && 'text-destructive',
                      !slaInfo.isPaused && slaInfo.isUrgent && 'text-warning',
                      !slaInfo.isPaused && !slaInfo.isOverdue && !slaInfo.isUrgent && 'text-success'
                    )}>
                      {slaInfo.isPaused 
                        ? 'Clock Paused'
                        : slaInfo.isOverdue 
                          ? `${Math.abs(slaInfo.hoursRemaining)}h overdue`
                          : `${slaInfo.hoursRemaining}h remaining`
                      }
                    </span>
                  </div>
                  {!slaInfo.isPaused && (
                    <Progress 
                      value={slaInfo.isOverdue ? 100 : Math.max(0, 100 - (slaInfo.hoursRemaining / 72 * 100))}
                      className={cn(
                        'h-2',
                        slaInfo.isOverdue && '[&>div]:bg-destructive',
                        slaInfo.isUrgent && !slaInfo.isOverdue && '[&>div]:bg-warning'
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Entitlement Check */}
          <Card className={cn(
            validation.blockers.length > 0 && 'border-destructive/30',
            validation.warnings.length > 0 && !validation.blockers.length && 'border-warning/30'
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Policy Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entitlementCheck?.hasEntitlement ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Annual Allowance</span>
                      <span className="font-mono">{formatCurrencyAED(entitlementCheck.annualAllowance)}</span>
                    </div>
                    <Progress 
                      value={Math.min(entitlementCheck.utilizationRate, 100)} 
                      className={cn('h-2', entitlementCheck.utilizationRate >= 100 && '[&>div]:bg-destructive')}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Used: {formatCurrencyAED(entitlementCheck.utilizedAmount)}</span>
                      <span>Remaining: {formatCurrencyAED(entitlementCheck.remainingAmount)}</span>
                    </div>
                  </div>
                  
                  {request?.amount && (
                    <div className="p-2 bg-muted/50 rounded text-sm">
                      <div className="flex justify-between">
                        <span>This claim</span>
                        <span className="font-mono">{formatCurrencyAED(request.amount)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>After approval</span>
                        <span className={cn(
                          'font-mono',
                          entitlementCheck.remainingAmount - request.amount < 0 && 'text-destructive'
                        )}>
                          {formatCurrencyAED(entitlementCheck.remainingAmount - request.amount)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-warning flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  No entitlement found for this benefit
                </div>
              )}
              
              {/* Warnings & Blockers */}
              {validation.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-warning/10 rounded text-sm">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <span>{w.message}</span>
                </div>
              ))}
              {validation.blockers.map((b, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-destructive/10 rounded text-sm">
                  <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <span>{b.message}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">Submitted</span>
                  <p>{request?.created_at ? format(new Date(request.created_at), 'MMM d, yyyy') : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Department</span>
                  <p>{request?.employeeDepartment || '-'}</p>
                </div>
                {request?.policy_ref && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Policy Reference</span>
                    <p className="font-mono text-xs">{request.policy_ref}</p>
                  </div>
                )}
              </div>
              {request?.description && (
                <div>
                  <span className="text-muted-foreground">Description</span>
                  <p className="mt-1 p-2 bg-muted/30 rounded">{request.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="docs" className="mt-4">
          <RequestDocumentsChecklist 
            requestId={requestId || ''} 
            readOnly={!canProcess}
          />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="history" className="mt-4">
          <RequestTimeline 
            events={timelineEvents}
            showInternalNotes={true}
          />
        </TabsContent>
      </Tabs>
    </DrillDownSheet>
  );
}

export default ClaimDetailSheet;

/**
 * Claim Review Sheet - HR Ops View
 * 
 * Comprehensive right-side sheet for reviewing claims/requests.
 * Uses the Cross-Portal Consistency Contract to ensure data matches
 * what the employee sees.
 */

import { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Timer,
  Shield,
  MessageSquare,
  ChevronRight,
  Paperclip,
  AlertCircle,
  Info,
  Send,
  UserPlus,
  Flag,
  ExternalLink,
  Check,
  X,
  Circle,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  RequestWithDetails, 
  useSharedRequest, 
  useRequestTimeline,
  useUpdateRequestStatus 
} from '@/hooks/useSharedRequests';
import { useCurrentPolicyVersion, useRequiredDocuments } from '@/hooks/useSharedPolicies';
import { useClaimEntitlementCheck, useClaimValidation, useBenefitByCategory } from '@/hooks/useClaimEntitlements';
import { 
  getStatusBadgeStyle, 
  getStatusDisplayLabel,
  calculateSLA,
  formatRelativeTime,
  REQUEST_STATUSES,
  isProcessableStatus,
} from '@/lib/crossPortalContract';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ClaimReviewSheetProps {
  requestId: string | null;
  organizationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

const REJECTION_REASONS = [
  { value: 'incomplete_docs', label: 'Incomplete Documentation' },
  { value: 'exceeds_limit', label: 'Exceeds Allowance Limit' },
  { value: 'not_eligible', label: 'Not Eligible for Benefit' },
  { value: 'duplicate', label: 'Duplicate Claim' },
  { value: 'policy_violation', label: 'Policy Violation' },
  { value: 'other', label: 'Other (specify in notes)' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-slate-600' },
  { value: 'normal', label: 'Normal', color: 'text-blue-600' },
  { value: 'high', label: 'High', color: 'text-amber-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
];

export function ClaimReviewSheet({
  requestId,
  organizationId,
  open,
  onOpenChange,
  onStatusChange,
}: ClaimReviewSheetProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewNotes, setReviewNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch request with full details
  const { data: request, isLoading: requestLoading, refetch: refetchRequest } = useSharedRequest(requestId);
  
  // Fetch timeline/audit trail
  const { data: timeline, refetch: refetchTimeline } = useRequestTimeline(requestId, true);
  
  // Find matching benefit for this claim's category
  const { data: matchingBenefit } = useBenefitByCategory(request?.category || null);
  
  // Fetch entitlement check (TRUST CRITICAL)
  const { data: entitlementCheck, isLoading: entitlementLoading } = useClaimEntitlementCheck(
    request?.user_id || null,
    matchingBenefit?.id || null,
    organizationId
  );
  
  // Validate claim
  const validation = useClaimValidation(entitlementCheck, request?.amount || null);
  
  // Fetch required documents for this benefit
  const { data: requiredDocs } = useRequiredDocuments(matchingBenefit?.id || null);
  
  // Fetch current policy version
  const { data: currentPolicy } = useCurrentPolicyVersion(matchingBenefit?.id || null, organizationId);
  
  // Status update mutation
  const updateStatus = useUpdateRequestStatus();

  // Calculate SLA
  const slaInfo = useMemo(() => {
    if (!request?.sla_due_at || !request?.status) return null;
    return calculateSLA(request.sla_due_at, request.status);
  }, [request]);

  // Calculate aging
  const aging = useMemo(() => {
    if (!request?.created_at) return null;
    const created = new Date(request.created_at);
    const now = new Date();
    const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  }, [request]);

  const handleApprove = async () => {
    if (!request) return;
    setIsProcessing(true);
    try {
      await updateStatus.mutateAsync({
        requestId: request.id,
        newStatus: REQUEST_STATUSES.APPROVED,
        reviewerNotes: reviewNotes || 'Approved',
        internalNotes,
      });
      toast({
        title: 'Claim Approved',
        description: 'The claim has been approved and the employee will be notified.',
      });
      refetchRequest();
      refetchTimeline();
      onStatusChange?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve claim. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!request || !rejectionReason) return;
    setIsProcessing(true);
    try {
      const reasonLabel = REJECTION_REASONS.find(r => r.value === rejectionReason)?.label || rejectionReason;
      await updateStatus.mutateAsync({
        requestId: request.id,
        newStatus: REQUEST_STATUSES.REJECTED,
        reviewerNotes: `Rejected: ${reasonLabel}${reviewNotes ? `. ${reviewNotes}` : ''}`,
        internalNotes,
      });
      toast({
        title: 'Claim Rejected',
        description: 'The claim has been rejected and the employee will be notified.',
      });
      refetchRequest();
      refetchTimeline();
      onStatusChange?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject claim. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!request || !reviewNotes) return;
    setIsProcessing(true);
    try {
      // Update status to in_review
      await updateStatus.mutateAsync({
        requestId: request.id,
        newStatus: REQUEST_STATUSES.IN_REVIEW,
        reviewerNotes: `Information requested: ${reviewNotes}`,
        internalNotes,
      });
      
      // Also create an employee-visible event
      await supabase.from('request_events').insert({
        request_id: request.id,
        actor_user_id: user?.id || '',
        from_status: request.status || 'pending',
        to_status: 'in_review',
        notes_employee_visible: reviewNotes,
        notes_internal: internalNotes || null,
      });
      
      toast({
        title: 'Information Requested',
        description: 'The employee will be notified to provide additional information.',
      });
      refetchRequest();
      refetchTimeline();
      onStatusChange?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to request information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const canProcess = request && isProcessableStatus(request.status);
  const statusStyle = getStatusBadgeStyle(request?.status);

  if (!request && !requestLoading) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Header Section */}
            <SheetHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <SheetTitle className="text-xl font-display">
                    {request?.subject || 'Loading...'}
                  </SheetTitle>
                  <SheetDescription className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                      {request?.id?.slice(0, 8)}...
                    </span>
                    <span>•</span>
                    <User className="w-3 h-3" />
                    <span>{request?.employeeName || 'Unknown Employee'}</span>
                  </SheetDescription>
                </div>
                {request && (
                  <Badge className={cn('text-xs', statusStyle.className)}>
                    {getStatusDisplayLabel(request.status)}
                  </Badge>
                )}
              </div>

              {/* Quick Info Row */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1">
                  <FileText className="w-3 h-3" />
                  {request?.request_type || 'claim'}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {request?.category || 'General'}
                </Badge>
                {request?.amount && (
                  <Badge variant="secondary" className="font-mono">
                    AED {request.amount.toLocaleString()}
                  </Badge>
                )}
                {slaInfo && (
                  <Badge 
                    className={cn(
                      'gap-1',
                      slaInfo.isOverdue && 'bg-red-500/10 text-red-600 border-red-500/20',
                      slaInfo.isUrgent && !slaInfo.isOverdue && 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    )}
                  >
                    <Timer className="w-3 h-3" />
                    {slaInfo.isOverdue 
                      ? `${Math.abs(slaInfo.hoursRemaining)}h overdue` 
                      : slaInfo.hoursRemaining < 24 
                        ? `${slaInfo.hoursRemaining}h left`
                        : `${Math.round(slaInfo.daysRemaining)}d left`
                    }
                  </Badge>
                )}
                {aging !== null && (
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {aging}d old
                  </Badge>
                )}
              </div>

              {/* Quick Actions */}
              {canProcess && (
                <PermissionGate 
                  permission="can_process_claims"
                  fallback={
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm">You don't have permission to process claims</span>
                    </div>
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => setActiveTab('decision')}
                      disabled={isProcessing}
                      className="gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveTab('decision')}
                      disabled={isProcessing}
                      className="gap-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Request Info
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      disabled={isProcessing}
                      className="gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Assign
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      disabled={isProcessing}
                      className="gap-1"
                    >
                      <Flag className="w-4 h-4" />
                      Priority
                    </Button>
                  </div>
                </PermissionGate>
              )}
            </SheetHeader>

            <Separator />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="decision">Decision</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Entitlement & Eligibility Check - TRUST CRITICAL */}
                <Card className={cn(
                  validation.warnings.length > 0 && 'border-amber-500/30',
                  validation.blockers.length > 0 && 'border-red-500/30'
                )}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Entitlement & Eligibility Check
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {entitlementLoading ? (
                      <div className="text-sm text-muted-foreground">Loading entitlement data...</div>
                    ) : entitlementCheck?.hasEntitlement ? (
                      <>
                        {/* Utilization Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Annual Allowance</span>
                            <span className="font-mono font-medium">
                              AED {entitlementCheck.annualAllowance.toLocaleString()}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(entitlementCheck.utilizationRate, 100)} 
                            className={cn(
                              'h-2',
                              entitlementCheck.utilizationRate >= 100 && '[&>div]:bg-red-500',
                              entitlementCheck.utilizationRate >= 80 && entitlementCheck.utilizationRate < 100 && '[&>div]:bg-amber-500'
                            )}
                          />
                          <div className="flex justify-between text-xs">
                            <span>
                              Utilized: AED {entitlementCheck.utilizedAmount.toLocaleString()} ({entitlementCheck.utilizationRate}%)
                            </span>
                            <span className={cn(
                              entitlementCheck.remainingAmount <= 0 && 'text-red-600'
                            )}>
                              Remaining: AED {entitlementCheck.remainingAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Additional Rules */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {entitlementCheck.maxPerTransaction && (
                            <div className="bg-muted/50 p-2 rounded">
                              <span className="text-muted-foreground">Max per transaction:</span>
                              <span className="ml-1 font-mono">AED {entitlementCheck.maxPerTransaction.toLocaleString()}</span>
                            </div>
                          )}
                          {entitlementCheck.coveragePercent && (
                            <div className="bg-muted/50 p-2 rounded">
                              <span className="text-muted-foreground">Coverage:</span>
                              <span className="ml-1">{entitlementCheck.coveragePercent}%</span>
                            </div>
                          )}
                          {entitlementCheck.employeeGrade && (
                            <div className="bg-muted/50 p-2 rounded">
                              <span className="text-muted-foreground">Grade:</span>
                              <span className="ml-1">{entitlementCheck.employeeGrade}</span>
                            </div>
                          )}
                          {entitlementCheck.requiresDocumentation && (
                            <div className="bg-muted/50 p-2 rounded flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                              <span>Documentation required</span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-amber-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        No entitlement record found for this benefit category
                      </div>
                    )}

                    {/* Warnings */}
                    {validation.warnings.map((warning, idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{warning.message}</p>
                          {warning.details && (
                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">{warning.details}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Blockers */}
                    {validation.blockers.map((blocker, idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                      >
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-700 dark:text-red-400">{blocker.message}</p>
                          {blocker.details && (
                            <p className="text-xs text-red-600 dark:text-red-500 mt-1">{blocker.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Request Details */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Request Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Description</span>
                      <p className="mt-1 bg-muted/30 p-3 rounded-lg">
                        {request?.description || 'No description provided'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">Submitted</span>
                        <p className="font-medium">
                          {request?.created_at ? new Date(request.created_at).toLocaleString() : '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Department</span>
                        <p className="font-medium">{request?.employeeDepartment || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Policy Citation */}
                {currentPolicy && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          Policy Reference
                        </div>
                        <Badge variant="outline" className="text-xs">
                          v{currentPolicy.version} • {new Date(currentPolicy.effective_from).toLocaleDateString()}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentPolicy.benefit?.policy_bullets && currentPolicy.benefit.policy_bullets.length > 0 && (
                        <ul className="space-y-2 text-sm">
                          {currentPolicy.benefit.policy_bullets.slice(0, 6).map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <ChevronRight className="w-3 h-3 text-primary mt-1 shrink-0" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {currentPolicy.policy_text && (
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {currentPolicy.policy_text}
                        </p>
                      )}
                      <Button variant="link" size="sm" className="p-0 h-auto gap-1">
                        View full policy <ExternalLink className="w-3 h-3" />
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      Required Documents Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {requiredDocs && requiredDocs.length > 0 ? (
                      <div className="space-y-2">
                        {requiredDocs.map((doc) => (
                          <div 
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {/* Placeholder - in real app, would check request_attachments */}
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <Circle className="w-3 h-3 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{doc.document_name}</p>
                                {doc.description && (
                                  <p className="text-xs text-muted-foreground">{doc.description}</p>
                                )}
                              </div>
                            </div>
                            <Badge variant={doc.is_required ? 'default' : 'outline'} className="text-xs">
                              {doc.is_required ? 'Required' : 'Optional'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No specific documents required for this benefit category.
                      </p>
                    )}

                    <Separator />

                    {/* Request Missing Documents */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Request Missing Documents</p>
                      <Textarea
                        placeholder="Specify which documents are needed..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={2}
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-2"
                        onClick={handleRequestInfo}
                        disabled={!reviewNotes || isProcessing}
                      >
                        <Send className="w-3 h-3" />
                        Send Document Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Audit Trail
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {timeline && timeline.length > 0 ? (
                      <div className="relative">
                        <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                        <div className="space-y-4">
                          {timeline.map((event, idx) => (
                            <div key={event.id} className="relative pl-8">
                              <div className={cn(
                                "absolute left-0 w-6 h-6 rounded-full flex items-center justify-center",
                                event.to_status === 'approved' && 'bg-emerald-500/20',
                                event.to_status === 'rejected' && 'bg-red-500/20',
                                event.to_status === 'in_review' && 'bg-blue-500/20',
                                !['approved', 'rejected', 'in_review'].includes(event.to_status) && 'bg-muted'
                              )}>
                                {event.to_status === 'approved' && <Check className="w-3 h-3 text-emerald-600" />}
                                {event.to_status === 'rejected' && <X className="w-3 h-3 text-red-600" />}
                                {event.to_status === 'in_review' && <Info className="w-3 h-3 text-blue-600" />}
                                {!['approved', 'rejected', 'in_review'].includes(event.to_status) && (
                                  <Circle className="w-3 h-3 text-muted-foreground" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {event.from_status 
                                      ? `${getStatusDisplayLabel(event.from_status)} → ${getStatusDisplayLabel(event.to_status)}`
                                      : getStatusDisplayLabel(event.to_status)
                                    }
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatRelativeTime(event.created_at)}
                                  </span>
                                </div>
                                {event.notes_employee_visible && (
                                  <p className="text-sm bg-muted/30 p-2 rounded">
                                    <span className="text-xs text-muted-foreground block mb-1">Employee visible:</span>
                                    {event.notes_employee_visible}
                                  </p>
                                )}
                                {event.notes_internal && (
                                  <p className="text-sm bg-amber-500/10 p-2 rounded">
                                    <span className="text-xs text-amber-600 block mb-1">Internal only:</span>
                                    {event.notes_internal}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No history events yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Decision Tab */}
              <TabsContent value="decision" className="space-y-4 mt-4">
                <PermissionGate 
                  permission="can_process_claims"
                  fallback={
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="w-4 h-4" />
                          <span>You don't have permission to process claims</span>
                        </div>
                      </CardContent>
                    </Card>
                  }
                >
                  {!canProcess ? (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                          <p>This request has already been processed.</p>
                          <p className="text-sm">Status: {getStatusDisplayLabel(request?.status)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Approve Section */}
                      <Card className="border-emerald-500/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="w-4 h-4" />
                            Approve Claim
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Textarea
                            placeholder="Add approval notes (optional)..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={2}
                          />
                          <Button 
                            className="w-full gap-2" 
                            onClick={handleApprove}
                            disabled={isProcessing}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve & Notify Employee
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Reject Section */}
                      <Card className="border-red-500/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                            <XCircle className="w-4 h-4" />
                            Reject Claim
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Select value={rejectionReason} onValueChange={setRejectionReason}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rejection reason" />
                            </SelectTrigger>
                            <SelectContent>
                              {REJECTION_REASONS.map((reason) => (
                                <SelectItem key={reason.value} value={reason.value}>
                                  {reason.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Textarea
                            placeholder="Add rejection notes for the employee..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={2}
                          />
                          <Button 
                            variant="destructive" 
                            className="w-full gap-2" 
                            onClick={handleReject}
                            disabled={!rejectionReason || isProcessing}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject & Notify Employee
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Request Info Section */}
                      <Card className="border-blue-500/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
                            <MessageSquare className="w-4 h-4" />
                            Request More Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Textarea
                            placeholder="What information or documents do you need?"
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={2}
                          />
                          <Textarea
                            placeholder="Internal notes (not visible to employee)..."
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            rows={2}
                            className="bg-amber-500/5 border-amber-500/20"
                          />
                          <Button 
                            variant="outline" 
                            className="w-full gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-500/10" 
                            onClick={handleRequestInfo}
                            disabled={!reviewNotes || isProcessing}
                          >
                            <Send className="w-4 h-4" />
                            Send to Employee
                          </Button>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </PermissionGate>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

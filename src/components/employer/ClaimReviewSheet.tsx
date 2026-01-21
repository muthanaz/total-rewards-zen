/**
 * Claim Review Sheet - HR Ops View
 * 
 * Comprehensive right-side sheet for reviewing claims/requests.
 * Uses the Cross-Portal Consistency Contract to ensure data matches
 * what the employee sees.
 * 
 * Features:
 * - Full claim details with attachments
 * - Internal notes section
 * - Audit trail / history
 * - SLA timeline visualization
 * - Recommended next action
 * - Employee view preview
 */

import { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Lightbulb,
  Eye,
  Calendar,
  TrendingUp,
  ArrowRight,
  Zap,
  History,
  StickyNote,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  RequestWithDetails, 
  useSharedRequest, 
  useRequestTimeline,
} from '@/hooks/useSharedRequests';
import { useCurrentPolicyVersion } from '@/hooks/useSharedPolicies';
import { useClaimEntitlementCheck, useClaimValidation, useBenefitByCategory } from '@/hooks/useClaimEntitlements';
import { useClaimDocs, useMarkDocReceived } from '@/hooks/useClaimDocs';
import { useClaimNotes, useAddClaimNote } from '@/hooks/useClaimNotes';
import { useClaimDocumentStatus } from '@/hooks/useClaimDocumentStatus';
import { useClaimActions } from '@/hooks/useClaimActions';
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
import { format, differenceInDays, differenceInHours } from 'date-fns';

// HR team members for assignment
const HR_TEAM_MEMBERS = [
  { id: 'hr-manager-1', name: 'Sarah Al-Rashid', role: 'HR Manager' },
  { id: 'hr-specialist-1', name: 'Ahmed Hassan', role: 'HR Specialist' },
  { id: 'hr-specialist-2', name: 'Fatima Al-Maktoum', role: 'HR Specialist' },
  { id: 'finance-lead-1', name: 'Omar Khan', role: 'Finance Lead' },
];

interface ClaimReviewSheetProps {
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
  { value: 'other', label: 'Other (specify in reviewer notes)' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low Priority', color: 'text-slate-600' },
  { value: 'normal', label: 'Standard', color: 'text-blue-600' },
  { value: 'high', label: 'High Priority', color: 'text-amber-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
];

// Mock attachments for demo
const MOCK_ATTACHMENTS = [
  { id: '1', name: 'receipt.pdf', size: '245 KB', type: 'pdf', uploadedAt: '2024-01-08' },
  { id: '2', name: 'invoice.jpg', size: '1.2 MB', type: 'image', uploadedAt: '2024-01-08' },
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
  const [newNote, setNewNote] = useState('');
  
  // Modal states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [escalationReason, setEscalationReason] = useState('');

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
  
  // Unified document status from shared hook
  const documentStatus = useClaimDocumentStatus(requestId, request?.category || null);
  
  // Fetch current policy version
  const { data: currentPolicy } = useCurrentPolicyVersion(matchingBenefit?.id || null, organizationId);
  
  // Fetch claim documents
  const { data: claimDocs = [], refetch: refetchDocs } = useClaimDocs(requestId);
  const markDocReceived = useMarkDocReceived();
  
  // Fetch claim notes
  const { data: claimNotes = [], refetch: refetchNotes } = useClaimNotes(requestId);
  const addNote = useAddClaimNote();
  
  // Claim actions
  const { approve, reject, requestInfo, assign, escalate, isLoading: isProcessing } = useClaimActions();

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

  // Recommended next action logic
  const recommendedAction = useMemo(() => {
    if (!request) return null;
    
    // Check for blockers first
    if (validation.blockers.length > 0) {
      return {
        action: 'reject',
        reason: validation.blockers[0].message,
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        label: 'Recommend: Reject',
        description: 'This claim has blocking issues that prevent approval.',
      };
    }
    
    // Check for missing docs
    if (validation.warnings.some(w => w.message.toLowerCase().includes('document'))) {
      return {
        action: 'request_docs',
        reason: 'Documentation appears incomplete',
        icon: FileText,
        color: 'text-amber-600',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        label: 'Recommend: Request Documents',
        description: 'Request additional documentation before proceeding.',
      };
    }
    
    // Check for warnings
    if (validation.warnings.length > 0) {
      return {
        action: 'review',
        reason: validation.warnings[0].message,
        icon: AlertTriangle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        label: 'Recommend: Manual Review',
        description: 'Review the warnings before making a decision.',
      };
    }
    
    // If all checks pass
    if (entitlementCheck?.hasEntitlement && validation.blockers.length === 0 && validation.warnings.length === 0) {
      return {
        action: 'approve',
        reason: 'All eligibility checks passed',
        icon: CheckCircle,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        label: 'Recommend: Approve',
        description: 'Claim meets all policy requirements and entitlement limits.',
      };
    }
    
    return null;
  }, [request, validation, entitlementCheck]);

  const handleApprove = async () => {
    if (!request) return;
    try {
      await approve.mutateAsync({
        requestId: request.id,
        reviewerNotes: reviewNotes || 'Approved',
        internalNotes,
      });
      toast({
        title: 'Claim Approved',
        description: 'The claim has been approved and the employee will be notified.',
      });
      refetchRequest();
      refetchTimeline();
      refetchNotes();
      onStatusChange?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve claim. Please try again.',
        variant: 'destructive',
      });
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
        internalNotes,
      });
      toast({
        title: 'Claim Rejected',
        description: 'The claim has been rejected and the employee will be notified.',
      });
      refetchRequest();
      refetchTimeline();
      refetchNotes();
      onStatusChange?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject claim. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRequestInfo = async () => {
    if (!request || !reviewNotes) return;
    try {
      await requestInfo.mutateAsync({
        requestId: request.id,
        requestedInfo: reviewNotes,
        internalNotes,
      });
      toast({
        title: 'Information Requested',
        description: 'The employee will be notified to provide additional information.',
      });
      refetchRequest();
      refetchTimeline();
      refetchDocs();
      onStatusChange?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to request information. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAssign = async () => {
    if (!request || !selectedAssignee) return;
    try {
      const member = HR_TEAM_MEMBERS.find(m => m.id === selectedAssignee);
      await assign.mutateAsync({
        requestId: request.id,
        assigneeId: selectedAssignee,
        assigneeName: member?.name,
      });
      toast({
        title: 'Claim Assigned',
        description: `Assigned to ${member?.name || 'team member'}.`,
      });
      setAssignDialogOpen(false);
      refetchRequest();
      refetchTimeline();
      onStatusChange?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign claim.',
        variant: 'destructive',
      });
    }
  };

  const handleEscalate = async () => {
    if (!request || !escalationReason) return;
    try {
      await escalate.mutateAsync({
        requestId: request.id,
        escalationReason,
        priority: 'urgent',
      });
      toast({
        title: 'Claim Escalated',
        description: 'This claim has been marked as urgent.',
      });
      setEscalateDialogOpen(false);
      refetchRequest();
      refetchTimeline();
      onStatusChange?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to escalate claim.',
        variant: 'destructive',
      });
    }
  };

  const handleAddNote = async () => {
    if (!request || !newNote.trim()) return;
    try {
      await addNote.mutateAsync({
        requestId: request.id,
        note: newNote,
        isInternal: true,
      });
      setNewNote('');
      refetchNotes();
      refetchTimeline();
      toast({ title: 'Note added' });
    } catch (error) {
      toast({ title: 'Failed to add note', variant: 'destructive' });
    }
  };

  const handleMarkDocReceived = async (docId: string) => {
    try {
      await markDocReceived.mutateAsync({ docId });
      refetchDocs();
      toast({ title: 'Document marked as received' });
    } catch (error) {
      toast({ title: 'Failed to update document', variant: 'destructive' });
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
                    {aging}d in queue
                  </Badge>
                )}
              </div>

              {/* Recommended Action Card */}
              {recommendedAction && canProcess && (
                <Card className={cn('border', recommendedAction.borderColor, recommendedAction.bgColor)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn('p-2 rounded-lg', recommendedAction.bgColor)}>
                        <recommendedAction.icon className={cn('w-5 h-5', recommendedAction.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-muted-foreground" />
                          <span className={cn('font-medium text-sm', recommendedAction.color)}>
                            {recommendedAction.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {recommendedAction.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions - Focus Decision Tab for detailed forms */}
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
                      onClick={() => setActiveTab('decision')}
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
                      onClick={() => setAssignDialogOpen(true)}
                      disabled={isProcessing}
                      className="gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Assign
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setEscalateDialogOpen(true)}
                      disabled={isProcessing}
                      className="gap-1"
                    >
                      <Flag className="w-4 h-4" />
                      Escalate
                    </Button>
                  </div>
                </PermissionGate>
              )}
            </SheetHeader>

            <Separator />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview" className="gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" />
                  Docs
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-1.5">
                  <StickyNote className="w-3.5 h-3.5" />
                  Notes
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  History
                </TabsTrigger>
                <TabsTrigger value="decision" className="gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Decision
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* SLA Timeline */}
                {slaInfo && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Timer className="w-4 h-4 text-primary" />
                        SLA Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Time Remaining</span>
                          <span className={cn(
                            'font-medium',
                            slaInfo.isOverdue && 'text-red-600',
                            slaInfo.isUrgent && !slaInfo.isOverdue && 'text-amber-600',
                            !slaInfo.isOverdue && !slaInfo.isUrgent && 'text-emerald-600'
                          )}>
                            {slaInfo.isOverdue 
                              ? `${Math.abs(slaInfo.hoursRemaining)}h overdue`
                              : slaInfo.hoursRemaining < 24
                                ? `${slaInfo.hoursRemaining}h`
                                : `${Math.round(slaInfo.daysRemaining)} days`
                            }
                          </span>
                        </div>
                        <Progress 
                          value={slaInfo.isOverdue ? 100 : Math.max(0, 100 - (slaInfo.hoursRemaining / 72 * 100))}
                          className={cn(
                            'h-2',
                            slaInfo.isOverdue && '[&>div]:bg-red-500',
                            slaInfo.isUrgent && !slaInfo.isOverdue && '[&>div]:bg-amber-500',
                            !slaInfo.isOverdue && !slaInfo.isUrgent && '[&>div]:bg-emerald-500'
                          )}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Submitted: {request?.created_at ? format(new Date(request.created_at), 'MMM d, HH:mm') : '-'}</span>
                          <span>Due: {request?.sla_due_at ? format(new Date(request.sla_due_at), 'MMM d, HH:mm') : '-'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

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

                        {/* This claim impact */}
                        {request?.amount && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">This claim amount</span>
                              <span className="font-mono font-medium">AED {request.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-sm text-muted-foreground">After approval</span>
                              <span className={cn(
                                'font-mono font-medium',
                                entitlementCheck.remainingAmount - request.amount < 0 && 'text-red-600'
                              )}>
                                AED {(entitlementCheck.remainingAmount - request.amount).toLocaleString()} remaining
                              </span>
                            </div>
                          </div>
                        )}

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
                          {request?.created_at ? format(new Date(request.created_at), 'MMM d, yyyy HH:mm') : '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Department</span>
                        <p className="font-medium">{request?.employeeDepartment || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Employee View Preview */}
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      Employee View Preview
                    </CardTitle>
                    <CardDescription>What the employee sees for this request</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{request?.subject}</span>
                        <Badge variant="outline">{getStatusDisplayLabel(request?.status)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted {request?.created_at ? formatRelativeTime(request.created_at) : '-'}
                      </p>
                      {request?.amount && (
                        <p className="text-sm">
                          Amount: <span className="font-mono">AED {request.amount.toLocaleString()}</span>
                        </p>
                      )}
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
                          v{currentPolicy.version} • {format(new Date(currentPolicy.effective_from), 'MMM d, yyyy')}
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
                {/* Uploaded Attachments */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      Attachments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {MOCK_ATTACHMENTS.length > 0 ? (
                      <div className="space-y-2">
                        {MOCK_ATTACHMENTS.map((file) => (
                          <div 
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{file.size} • {file.uploadedAt}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No attachments uploaded.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Required Documents Checklist - Uses unified hook */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Required Documents Checklist
                      {documentStatus.counts.missing > 0 && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-0 text-xs ml-2">
                          {documentStatus.counts.missing} missing
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {documentStatus.isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading document requirements...</p>
                    ) : documentStatus.noDocsRequired ? (
                      <p className="text-sm text-muted-foreground">
                        No specific documents required for this benefit category.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {documentStatus.requiredDocs.map((doc) => {
                          const isProvided = documentStatus.providedDocs.some(
                            p => p.docType.toLowerCase() === doc.docType.toLowerCase() && 
                                 (p.status === 'provided' || p.status === 'pending')
                          );
                          const isMissing = documentStatus.missingDocs.some(
                            m => m.id === doc.id
                          );
                          
                          return (
                            <div 
                              key={doc.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg",
                                isProvided ? "bg-success/5 border border-success/20" :
                                isMissing && doc.isRequired ? "bg-amber-500/5 border border-amber-500/20" :
                                "bg-muted/30"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center",
                                  isProvided ? "bg-success/20" :
                                  isMissing && doc.isRequired ? "bg-amber-500/20" :
                                  "bg-muted"
                                )}>
                                  {isProvided ? (
                                    <Check className="w-3 h-3 text-success" />
                                  ) : isMissing && doc.isRequired ? (
                                    <AlertCircle className="w-3 h-3 text-amber-600" />
                                  ) : (
                                    <Circle className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{doc.docName}</p>
                                  {doc.description && (
                                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isProvided && (
                                  <Badge variant="outline" className="text-xs text-success border-success/30">
                                    Provided
                                  </Badge>
                                )}
                                {isMissing && doc.isRequired && (
                                  <Badge className="bg-amber-500/10 text-amber-600 border-0 text-xs">
                                    Missing
                                  </Badge>
                                )}
                                <Badge variant={doc.isRequired ? 'default' : 'outline'} className="text-xs">
                                  {doc.isRequired ? 'Required' : 'Optional'}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Internal Notes Tab */}
              <TabsContent value="notes" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <StickyNote className="w-4 h-4" />
                      Internal Notes
                    </CardTitle>
                    <CardDescription>
                      Notes visible only to HR team members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Existing internal notes from timeline */}
                    {timeline && timeline.filter(e => e.notes_internal).length > 0 ? (
                      <div className="space-y-3">
                        {timeline.filter(e => e.notes_internal).map((event) => (
                          <div 
                            key={event.id}
                            className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span className="text-xs font-medium text-amber-600">Internal Only</span>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(event.created_at)}
                              </span>
                            </div>
                            <p className="text-sm">{event.notes_internal}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No internal notes yet.</p>
                    )}

                    <Separator />

                    {/* Add new internal note */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Add Internal Note</p>
                      <Textarea
                        placeholder="Add notes for HR team (not visible to employee)..."
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        This note will only be visible to HR team members
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <History className="w-4 h-4" />
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
                                    <span className="text-xs text-amber-600 block mb-1 flex items-center gap-1">
                                      <Lock className="w-3 h-3" /> Internal only:
                                    </span>
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
                            placeholder="Add approval notes (optional, visible to employee)..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={2}
                          />
                          <Textarea
                            placeholder="Internal notes (optional, HR only)..."
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            rows={2}
                            className="border-amber-500/30 bg-amber-500/5"
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

                      {/* Request Documents */}
                      <Card className="border-blue-500/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
                            <Send className="w-4 h-4" />
                            Request Documents / Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Textarea
                            placeholder="Specify what documents or information is needed..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={2}
                          />
                          <Button 
                            variant="outline"
                            className="w-full gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-500/10" 
                            onClick={handleRequestInfo}
                            disabled={!reviewNotes || isProcessing}
                          >
                            <Send className="w-4 h-4" />
                            Send Request to Employee
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
                          <div>
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
                          </div>
                          <Textarea
                            placeholder="Add rejection notes for the employee..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={2}
                          />
                          <Textarea
                            placeholder="Internal notes (optional, HR only)..."
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            rows={2}
                            className="border-amber-500/30 bg-amber-500/5"
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
                    </>
                  )}
                </PermissionGate>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* Assign Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Claim</DialogTitle>
              <DialogDescription>
                Assign this claim to a team member for processing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium">Assign to</Label>
                <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {HR_TEAM_MEMBERS.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={!selectedAssignee || isProcessing}>
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Escalate Dialog */}
        <Dialog open={escalateDialogOpen} onOpenChange={setEscalateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Escalate Claim</DialogTitle>
              <DialogDescription>
                Mark this claim as urgent and escalate for priority handling.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium">Escalation Reason</Label>
                <Textarea
                  className="mt-1.5"
                  placeholder="Describe why this claim needs escalation..."
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEscalateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleEscalate} 
                disabled={!escalationReason || isProcessing}
              >
                <Flag className="w-4 h-4 mr-2" />
                Escalate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}

/**
 * ClaimDetailSheet
 * 
 * Single source of truth for reviewing claims with 4 tabs:
 * - Summary: Employee info, policy ref, amounts, payable breakdown
 * - Documents: Checklist with verify/reject actions
 * - Decision: Approve / Reject / Request Info with mandatory reasons
 * - Audit Trail: Read-only timeline
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  CheckCircle,
  History,
  Gavel,
  Timer,
  Pause,
  User,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSharedRequest, useRequestTimeline } from '@/hooks/useSharedRequests';
import { useClaimDocs } from '@/hooks/useClaimDocs';
import { useClaimTransition, useCheckSettlementReadiness } from '@/hooks/useClaimStateMachine';
import { supabase } from '@/integrations/supabase/client';
import type { RequestStatus } from '@/lib/workflow/claimStateMachine';
import { getStatusBadgeStyle, getStatusDisplayLabel, calculateSLA } from '@/lib/crossPortalContract';

import { SummaryTab } from './SummaryTab';
import { DocumentsTab } from './DocumentsTab';
import { DecisionTab } from './DecisionTab';
import { AuditTrailTab } from './AuditTrailTab';
import type { ClaimDetailTab, ClaimSummary, ClaimDocument, AuditEvent, DecisionPayload, SettlementReadiness } from './types';

interface ClaimDetailSheetProps {
  requestId: string | null;
  organizationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

export function ClaimDetailSheet({
  requestId,
  organizationId,
  open,
  onOpenChange,
  onStatusChange,
}: ClaimDetailSheetProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ClaimDetailTab>('summary');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch request data
  const { data: request, isLoading: requestLoading, refetch: refetchRequest } = useSharedRequest(requestId);
  
  // Fetch timeline
  const { data: timelineData, refetch: refetchTimeline } = useRequestTimeline(requestId, true);
  
  // Fetch documents
  const { data: rawDocs = [], refetch: refetchDocs } = useClaimDocs(requestId);

  // State machine hooks
  const transition = useClaimTransition({
    onSuccess: () => {
      refetchRequest();
      refetchTimeline();
      onStatusChange?.();
    },
  });
  const checkReadiness = useCheckSettlementReadiness();

  // Transform request to ClaimSummary
  const claimSummary: ClaimSummary | null = useMemo(() => {
    if (!request) return null;
    return {
      requestId: request.id,
      claimRef: `CLM-${request.id.slice(0, 6).toUpperCase()}`,
      employeeId: request.user_id || '',
      employeeName: request.employeeName || 'Unknown',
      employeeGrade: request.employeeGrade || 'G3',
      employeeCode: request.employeeCode,
      category: request.category || 'General',
      claimType: request.request_type || 'claim',
      subject: request.subject || '',
      description: request.description,
      policyId: (request as any).policy_id || null,
      policyRef: request.policy_ref || null,
      policyVersionId: (request as any).policy_version_id || null,
      amountClaimed: request.amount,
      currency: request.currency || 'AED',
      eligibleAmount: (request as any).eligible_amount_aed || request.amount,
      remainingEntitlement: (request as any).remaining_entitlement_aed || null,
      employeeCopay: (request as any).employee_copay_aed || 0,
      payableAmount: (request as any).payable_amount_aed || null,
      status: request.status || 'pending',
      isPaused: request.status === 'info_requested' || request.status === 'pending_employee',
      slaDueAt: request.sla_due_at || null,
      submittedAt: request.submitted_at || request.created_at || '',
      createdAt: request.created_at || '',
      assignedTo: request.assigned_to || null,
      assignedToName: (request as any).assigned_owner_name || null,
    };
  }, [request]);

  // Transform documents
  const documents: ClaimDocument[] = useMemo(() => {
    return rawDocs.map((doc: any) => ({
      id: doc.id,
      docType: doc.doc_type,
      docName: doc.doc_name,
      isRequired: doc.is_required,
      status: doc.status || 'missing',
      fileUrl: doc.file_url,
      uploadedAt: doc.uploaded_at,
      uploadedBy: doc.uploaded_by,
      reviewedAt: doc.reviewed_at,
      reviewedBy: doc.reviewed_by,
      reviewerNotes: doc.reviewer_notes,
    }));
  }, [rawDocs]);

  // Transform timeline to AuditEvents
  const auditEvents: AuditEvent[] = useMemo(() => {
    if (!timelineData) return [];
    return timelineData.map((event: any) => ({
      id: event.id,
      action: event.action || 'status_changed',
      actorName: event.actor_name || 'System',
      actorRole: event.actor_role || 'system',
      fromStatus: event.from_status,
      toStatus: event.to_status,
      timestamp: event.created_at,
      notes: event.action_reason_text || event.meta?.notes || null,
      isEmployeeVisible: event.visibility === 'employee_visible',
    }));
  }, [timelineData]);

  // Calculate SLA
  const slaInfo = useMemo(() => {
    if (!request?.sla_due_at || !request?.status) return null;
    return calculateSLA(request.sla_due_at, request.status);
  }, [request]);

  // Handle document verification
  const handleVerifyDoc = async (docId: string, notes?: string) => {
    try {
      await supabase
        .from('request_documents')
        .update({ 
          status: 'verified', 
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          reviewer_notes: notes || 'Verified'
        })
        .eq('id', docId);
      
      toast({ title: 'Document verified' });
      refetchDocs();
    } catch (error) {
      toast({ title: 'Failed to verify document', variant: 'destructive' });
    }
  };

  // Handle document rejection
  const handleRejectDoc = async (docId: string, reason: string) => {
    try {
      await supabase
        .from('request_documents')
        .update({ 
          status: 'rejected', 
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          reviewer_notes: reason
        })
        .eq('id', docId);
      
      toast({ title: 'Document rejected' });
      refetchDocs();
    } catch (error) {
      toast({ title: 'Failed to reject document', variant: 'destructive' });
    }
  };

  // Handle decision
  const handleDecision = async (payload: DecisionPayload) => {
    if (!requestId || !claimSummary) return;
    
    setIsProcessing(true);
    try {
      let targetStatus: RequestStatus;
      
      switch (payload.action) {
        case 'approve':
          targetStatus = 'approved';
          break;
        case 'reject':
          targetStatus = 'rejected';
          break;
        case 'request_info':
          targetStatus = 'info_requested';
          break;
        default:
          throw new Error('Invalid action');
      }

      // Execute transition via mutation
      const result = await transition.mutateAsync({
        requestId,
        toStatus: targetStatus,
        actionReasonCode: payload.reasonCode,
        actionReasonText: payload.reasonText,
      });

      if (!result.success) {
        throw new Error(result.error || 'Transition failed');
      }

      // If approved, check settlement readiness
      if (payload.action === 'approve') {
        const readiness = await checkReadiness.mutateAsync(requestId);
        if (readiness.ready) {
          // Auto-transition to ready_for_payment
          await transition.mutateAsync({
            requestId,
            toStatus: 'ready_for_payment',
            actionReasonCode: 'AUTO_SETTLEMENT_READY',
            actionReasonText: 'All settlement readiness checks passed',
          });
        }
      }

      toast({
        title: payload.action === 'approve' ? 'Claim Approved' : 
               payload.action === 'reject' ? 'Claim Rejected' : 
               'Information Requested',
        description: payload.action === 'request_info' 
          ? 'Employee has been notified. SLA is paused.'
          : 'The claim status has been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Decision Failed',
        description: error.message || 'Failed to process decision',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const statusStyle = getStatusBadgeStyle(claimSummary?.status);
  const canProcess = claimSummary && ['pending', 'submitted', 'in_review'].includes(claimSummary.status);

  if (!requestId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Header */}
            <SheetHeader className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  {requestLoading ? (
                    <Skeleton className="h-6 w-48" />
                  ) : (
                    <>
                      <SheetTitle className="text-lg font-display">
                        {claimSummary?.claimRef}
                      </SheetTitle>
                      <SheetDescription className="flex items-center gap-2 text-sm">
                        <User className="w-3 h-3" />
                        {claimSummary?.employeeName}
                        <span className="text-muted-foreground">({claimSummary?.employeeGrade})</span>
                      </SheetDescription>
                    </>
                  )}
                </div>

                {claimSummary && (
                  <div className="flex items-center gap-2">
                    <Badge className={cn('text-xs', statusStyle.className)}>
                      {getStatusDisplayLabel(claimSummary.status)}
                    </Badge>
                    {claimSummary.isPaused && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Pause className="w-3 h-3" />
                        SLA Paused
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Quick info row */}
              {claimSummary && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {claimSummary.category}
                  </Badge>
                  {claimSummary.amountClaimed && (
                    <Badge variant="outline" className="text-xs tabular-nums">
                      Claimed: {formatCurrencyAED(claimSummary.amountClaimed)}
                    </Badge>
                  )}
                  {slaInfo && !claimSummary.isPaused && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs gap-1',
                        slaInfo.isOverdue && 'border-destructive text-destructive',
                        slaInfo.isUrgent && 'border-warning text-warning'
                      )}
                    >
                      <Timer className="w-3 h-3" />
                      {slaInfo.isOverdue ? 'SLA Breached' : `${Math.abs(slaInfo.hoursRemaining)}h left`}
                    </Badge>
                  )}
                </div>
              )}
            </SheetHeader>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ClaimDetailTab)}>
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="summary" className="gap-1.5 text-xs">
                  <FileText className="w-3 h-3" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-1.5 text-xs">
                  <FileText className="w-3 h-3" />
                  Documents
                  {documents.filter(d => d.isRequired && d.status !== 'verified').length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-warning/20 text-warning rounded-full">
                      {documents.filter(d => d.isRequired && d.status !== 'verified').length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="decision" className="gap-1.5 text-xs" disabled={!canProcess}>
                  <Gavel className="w-3 h-3" />
                  Decision
                </TabsTrigger>
                <TabsTrigger value="audit" className="gap-1.5 text-xs">
                  <History className="w-3 h-3" />
                  Audit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                {claimSummary ? (
                  <SummaryTab claim={claimSummary} />
                ) : (
                  <div className="space-y-3">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <DocumentsTab
                  documents={documents}
                  onVerify={handleVerifyDoc}
                  onReject={handleRejectDoc}
                  isProcessing={isProcessing}
                />
              </TabsContent>

              <TabsContent value="decision" className="mt-4">
                {claimSummary && (
                  <DecisionTab
                    claim={claimSummary}
                    documents={documents}
                    settlementReadiness={null}
                    onDecision={handleDecision}
                    isProcessing={isProcessing}
                  />
                )}
              </TabsContent>

              <TabsContent value="audit" className="mt-4">
                <AuditTrailTab events={auditEvents} isLoading={requestLoading} />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default ClaimDetailSheet;

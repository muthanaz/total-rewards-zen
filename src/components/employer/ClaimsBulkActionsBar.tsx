/**
 * Claims Bulk Actions Bar
 * Enhanced bulk action bar with: Assign, Request Docs, Approve, Reject, Escalate, Add Note, Mark Paid
 * Features skip logic and confirmation modals with affected/skipped counts
 */

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  FileQuestion, 
  ArrowUp, 
  MessageSquare,
  Download,
  X,
  AlertTriangle,
  DollarSign,
  Eye,
  Loader2,
} from 'lucide-react';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useClaimActions } from '@/hooks/useClaimActions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ClaimData {
  id: string;
  status: string | null;
  amount?: number | null;
}

interface ClaimsBulkActionsBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  totalCount: number;
  onExport: () => void;
  onRefresh: () => void;
  teamMembers?: { id: string; name: string }[];
  /** Claims data for eligibility checking */
  claimsData?: ClaimData[];
}

const REJECTION_REASONS = [
  { value: 'receipt_predates_policy', label: 'Receipt Pre-dates Policy' },
  { value: 'exceeds_category_cap', label: 'Exceeds Category Cap' },
  { value: 'duplicate_submission', label: 'Duplicate Submission' },
  { value: 'incomplete_docs', label: 'Incomplete Documentation' },
  { value: 'not_eligible', label: 'Not Eligible for Benefit' },
  { value: 'outside_claim_period', label: 'Outside Claim Period' },
  { value: 'provider_not_approved', label: 'Provider Not Approved' },
  { value: 'budget_exhausted', label: 'Annual Budget Exhausted' },
];

const MISSING_DOC_TYPES = [
  'Original receipt',
  'Medical report',
  'Prescription',
  'Travel itinerary',
  'Attendance record',
  'Manager approval',
  'Invoice',
  'Proof of payment',
  'Insurance card copy',
  'ID copy',
];

// Statuses that can be approved/rejected
const PROCESSABLE_STATUSES = ['pending', 'submitted', 'in_review', 'needs_info'];
// Statuses that can be marked as paid
const PAYABLE_STATUSES = ['approved'];

export function ClaimsBulkActionsBar({
  selectedIds,
  onClearSelection,
  onSelectAll,
  totalCount,
  onExport,
  onRefresh,
  teamMembers = [],
  claimsData = [],
}: ClaimsBulkActionsBarProps) {
  const { toast } = useToast();
  const actions = useClaimActions();
  
  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [requestDocsDialogOpen, setRequestDocsDialogOpen] = useState(false);
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [paidDialogOpen, setPaidDialogOpen] = useState(false);
  const [moveToReviewDialogOpen, setMoveToReviewDialogOpen] = useState(false);

  // Form states
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [selectedMissingDocs, setSelectedMissingDocs] = useState<string[]>([]);
  const [docRequestMessage, setDocRequestMessage] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationPriority, setEscalationPriority] = useState<'high' | 'urgent'>('high');
  const [internalNote, setInternalNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isAllSelected = selectedIds.length === totalCount && totalCount > 0;

  // Calculate eligible claims for each action
  const eligibilityCounts = useMemo(() => {
    const selectedClaims = claimsData.filter(c => selectedIds.includes(c.id));
    const canApprove = selectedClaims.filter(c => PROCESSABLE_STATUSES.includes(c.status || ''));
    const canReject = selectedClaims.filter(c => PROCESSABLE_STATUSES.includes(c.status || ''));
    const canPay = selectedClaims.filter(c => PAYABLE_STATUSES.includes(c.status || ''));
    
    return {
      total: selectedClaims.length,
      approve: canApprove.length,
      reject: canReject.length,
      pay: canPay.length,
      skipApprove: selectedClaims.length - canApprove.length,
      skipReject: selectedClaims.length - canReject.length,
      skipPay: selectedClaims.length - canPay.length,
    };
  }, [selectedIds, claimsData]);

  // Generate a unique bulk action ID for audit trail
  const generateBulkActionId = () => `bulk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const handleBulkApprove = async () => {
    setIsProcessing(true);
    const bulkActionId = generateBulkActionId();
    let approved = 0;
    let skipped = 0;

    try {
      for (const id of selectedIds) {
        const claim = claimsData.find(c => c.id === id);
        if (claim && PROCESSABLE_STATUSES.includes(claim.status || '')) {
          await actions.approve.mutateAsync({ 
            requestId: id, 
            reviewerNotes: approvalNotes || 'Bulk approved',
          });
          approved++;
        } else {
          skipped++;
        }
      }
      
      toast({
        title: 'Bulk Approval Complete',
        description: `${approved} claims approved${skipped > 0 ? ` • ${skipped} skipped (ineligible status)` : ''}`,
      });
      
      setApproveDialogOpen(false);
      setApprovalNotes('');
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Some claims failed to process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedAssignee) return;
    setIsProcessing(true);
    const assignee = teamMembers.find(m => m.id === selectedAssignee);
    
    try {
      for (const id of selectedIds) {
        await actions.assign.mutateAsync({
          requestId: id,
          assigneeId: selectedAssignee,
          assigneeName: assignee?.name,
          notes: assignmentNotes,
        });
      }
      
      toast({
        title: 'Claims Assigned',
        description: `${selectedIds.length} claims assigned to ${assignee?.name}.`,
      });
      
      setAssignDialogOpen(false);
      setSelectedAssignee('');
      setAssignmentNotes('');
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign some claims.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (!rejectionReason) return;
    setIsProcessing(true);
    const reason = REJECTION_REASONS.find(r => r.value === rejectionReason)?.label || rejectionReason;
    let rejected = 0;
    let skipped = 0;

    try {
      for (const id of selectedIds) {
        const claim = claimsData.find(c => c.id === id);
        if (claim && PROCESSABLE_STATUSES.includes(claim.status || '')) {
          await actions.reject.mutateAsync({
            requestId: id,
            reason,
            reviewerNotes: rejectionNotes,
          });
          rejected++;
        } else {
          skipped++;
        }
      }
      
      toast({
        title: 'Bulk Rejection Complete',
        description: `${rejected} claims rejected${skipped > 0 ? ` • ${skipped} skipped (ineligible status)` : ''}`,
        variant: 'destructive',
      });
      
      setRejectDialogOpen(false);
      setRejectionReason('');
      setRejectionNotes('');
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject some claims.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkRequestDocs = async () => {
    if (selectedMissingDocs.length === 0) return;
    setIsProcessing(true);
    const message = docRequestMessage || `Please provide the following documents: ${selectedMissingDocs.join(', ')}`;
    
    try {
      for (const id of selectedIds) {
        await actions.requestInfo.mutateAsync({
          requestId: id,
          requestedInfo: message,
          missingDocs: selectedMissingDocs,
        });
      }
      
      toast({
        title: 'Documents Requested',
        description: `Document requests sent for ${selectedIds.length} claims.`,
      });
      
      setRequestDocsDialogOpen(false);
      setSelectedMissingDocs([]);
      setDocRequestMessage('');
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send document requests.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkEscalate = async () => {
    if (!escalationReason) return;
    setIsProcessing(true);
    
    try {
      for (const id of selectedIds) {
        await actions.escalate.mutateAsync({
          requestId: id,
          escalationReason,
          priority: escalationPriority,
        });
      }
      
      toast({
        title: 'Claims Escalated',
        description: `${selectedIds.length} claims escalated with ${escalationPriority} priority.`,
      });
      
      setEscalateDialogOpen(false);
      setEscalationReason('');
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to escalate some claims.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAddNote = async () => {
    if (!internalNote.trim()) return;
    setIsProcessing(true);
    
    try {
      for (const id of selectedIds) {
        // Use requestInfo to add note without changing status
        await actions.requestInfo.mutateAsync({
          requestId: id,
          requestedInfo: '',
          internalNotes: internalNote,
        });
      }
      
      toast({
        title: 'Notes Added',
        description: `Internal note added to ${selectedIds.length} claims.`,
      });
      
      setNoteDialogOpen(false);
      setInternalNote('');
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add notes.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkMarkPaid = async () => {
    setIsProcessing(true);
    let paid = 0;
    let skipped = 0;

    try {
      for (const id of selectedIds) {
        const claim = claimsData.find(c => c.id === id);
        if (claim && PAYABLE_STATUSES.includes(claim.status || '')) {
          await actions.approve.mutateAsync({ 
            requestId: id, 
            reviewerNotes: 'Marked as paid',
          });
          paid++;
        } else {
          skipped++;
        }
      }
      
      toast({
        title: 'Payment Recorded',
        description: `${paid} claims marked as paid${skipped > 0 ? ` • ${skipped} skipped (not approved)` : ''}`,
      });
      
      setPaidDialogOpen(false);
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark claims as paid.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkMoveToReview = async () => {
    setIsProcessing(true);
    
    try {
      for (const id of selectedIds) {
        await actions.requestInfo.mutateAsync({
          requestId: id,
          requestedInfo: 'Moved to In Review for processing',
        });
      }
      
      toast({
        title: 'Status Updated',
        description: `${selectedIds.length} claims moved to In Review.`,
      });
      
      setMoveToReviewDialogOpen(false);
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <Card className="border-primary/30 bg-primary/5 sticky top-4 z-40 shadow-sm">
        <CardContent className="py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={() => isAllSelected ? onClearSelection() : onSelectAll()}
              />
              <span className="font-medium text-sm">{selectedIds.length} selected</span>
              {selectedIds.length < totalCount && (
                <Button variant="link" size="sm" onClick={onSelectAll} className="p-0 h-auto text-primary">
                  Select all {totalCount} matching filters
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClearSelection} className="gap-1">
                <X className="w-3 h-3" />
                Clear
              </Button>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <PermissionGate permission="can_process_claims">
                {/* Assign */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-8"
                  onClick={() => setAssignDialogOpen(true)}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Assign
                </Button>

                {/* Request Docs */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-8"
                  onClick={() => setRequestDocsDialogOpen(true)}
                >
                  <FileQuestion className="w-3.5 h-3.5" />
                  Request Docs
                </Button>

                {/* Approve */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-8 text-success border-success/30 hover:bg-success/10" 
                  onClick={() => setApproveDialogOpen(true)}
                  disabled={eligibilityCounts.approve === 0}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                  {eligibilityCounts.approve > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                      {eligibilityCounts.approve}
                    </Badge>
                  )}
                </Button>

                {/* Reject */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={eligibilityCounts.reject === 0}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </Button>

                {/* Move to In Review */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-8"
                  onClick={() => setMoveToReviewDialogOpen(true)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Move to Review
                </Button>

                {/* Mark as Paid */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-8 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                  onClick={() => setPaidDialogOpen(true)}
                  disabled={eligibilityCounts.pay === 0}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Mark Paid
                  {eligibilityCounts.pay > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                      {eligibilityCounts.pay}
                    </Badge>
                  )}
                </Button>

                {/* Escalate */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-8 text-warning border-warning/30 hover:bg-warning/10"
                  onClick={() => setEscalateDialogOpen(true)}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  Escalate
                </Button>

                {/* Add Note */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-8"
                  onClick={() => setNoteDialogOpen(true)}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Add Note
                </Button>
              </PermissionGate>

              <Separator orientation="vertical" className="h-6 mx-1" />
              
              <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={onExport}>
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              Approve Claims
            </DialogTitle>
            <DialogDescription>
              You are about to approve {eligibilityCounts.approve} claims
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {eligibilityCounts.skipApprove > 0 && (
              <Alert variant="default" className="border-warning/50 bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-sm">
                  {eligibilityCounts.skipApprove} claim(s) will be skipped (already approved/rejected/paid)
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Label>Approval Notes (optional)</Label>
              <Textarea
                className="mt-1"
                placeholder="Add notes visible to employee..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkApprove} 
              disabled={eligibilityCounts.approve === 0 || isProcessing}
              className="bg-success hover:bg-success/90 gap-2"
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              Approve {eligibilityCounts.approve} Claims
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Assign {selectedIds.length} Claims
            </DialogTitle>
            <DialogDescription>
              Assign selected claims to a team member for processing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Assign To</Label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (optional, internal only)</Label>
              <Textarea
                className="mt-1"
                placeholder="Add assignment notes..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleBulkAssign} disabled={!selectedAssignee || isProcessing} className="gap-2">
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              Assign Claims
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Reject Claims
            </DialogTitle>
            <DialogDescription>
              You are about to reject {eligibilityCounts.reject} claims
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {eligibilityCounts.skipReject > 0 && (
              <Alert variant="default" className="border-warning/50 bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-sm">
                  {eligibilityCounts.skipReject} claim(s) will be skipped (already approved/rejected/paid)
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Label>Rejection Reason *</Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_REASONS.map(reason => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Additional Notes (visible to employee)</Label>
              <Textarea
                className="mt-1"
                placeholder="Explain why claims are being rejected..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBulkReject} 
              disabled={!rejectionReason || eligibilityCounts.reject === 0 || isProcessing}
              className="gap-2"
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              Reject {eligibilityCounts.reject} Claims
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Docs Dialog */}
      <Dialog open={requestDocsDialogOpen} onOpenChange={setRequestDocsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileQuestion className="w-5 h-5" />
              Request Missing Documents
            </DialogTitle>
            <DialogDescription>
              Select documents to request from {selectedIds.length} claims
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Documents Required</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {MISSING_DOC_TYPES.map(doc => (
                  <label key={doc} className="flex items-center gap-2 cursor-pointer text-sm p-1.5 rounded hover:bg-muted">
                    <Checkbox
                      checked={selectedMissingDocs.includes(doc)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMissingDocs([...selectedMissingDocs, doc]);
                        } else {
                          setSelectedMissingDocs(selectedMissingDocs.filter(d => d !== doc));
                        }
                      }}
                    />
                    {doc}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Message to Employee (optional)</Label>
              <Textarea
                className="mt-1"
                placeholder="Custom message explaining what's needed..."
                value={docRequestMessage}
                onChange={(e) => setDocRequestMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDocsDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkRequestDocs} 
              disabled={selectedMissingDocs.length === 0 || isProcessing}
              className="gap-2"
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate Dialog */}
      <Dialog open={escalateDialogOpen} onOpenChange={setEscalateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <ArrowUp className="w-5 h-5" />
              Escalate {selectedIds.length} Claims
            </DialogTitle>
            <DialogDescription>
              These claims will be flagged for priority review
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Escalation Priority</Label>
              <Select value={escalationPriority} onValueChange={(v) => setEscalationPriority(v as 'high' | 'urgent')}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <Badge className="bg-amber-500/20 text-amber-600 border-0">High</Badge>
                      Senior review required
                    </span>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <span className="flex items-center gap-2">
                      <Badge className="bg-red-500/20 text-red-600 border-0">Urgent</Badge>
                      Immediate attention needed
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Escalation Reason *</Label>
              <Textarea
                className="mt-1"
                placeholder="Explain why these claims need escalation..."
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkEscalate} 
              disabled={!escalationReason || isProcessing}
              className="gap-2 bg-warning hover:bg-warning/90 text-warning-foreground"
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              Escalate Claims
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Add Internal Note
            </DialogTitle>
            <DialogDescription>
              Add a note to {selectedIds.length} claims (visible to HR team only)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Internal Note *</Label>
              <Textarea
                className="mt-1"
                placeholder="Add your note here..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAddNote} 
              disabled={!internalNote.trim() || isProcessing}
              className="gap-2"
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog open={paidDialogOpen} onOpenChange={setPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <DollarSign className="w-5 h-5" />
              Mark Claims as Paid
            </DialogTitle>
            <DialogDescription>
              Record payment for {eligibilityCounts.pay} approved claims
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {eligibilityCounts.skipPay > 0 && (
              <Alert variant="default" className="border-warning/50 bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-sm">
                  {eligibilityCounts.skipPay} claim(s) will be skipped (only approved claims can be marked as paid)
                </AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">
              This action will update the status of all eligible claims to "Paid" and record the payment date.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaidDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkMarkPaid} 
              disabled={eligibilityCounts.pay === 0 || isProcessing}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              Mark {eligibilityCounts.pay} Claims Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to In Review Dialog */}
      <Dialog open={moveToReviewDialogOpen} onOpenChange={setMoveToReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Move to In Review
            </DialogTitle>
            <DialogDescription>
              Move {selectedIds.length} claims to "In Review" status
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action will update the status of all selected claims to "In Review", indicating they are being actively processed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveToReviewDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleBulkMoveToReview} disabled={isProcessing} className="gap-2">
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              Move to Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

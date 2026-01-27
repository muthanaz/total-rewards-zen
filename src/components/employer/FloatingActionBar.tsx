/**
 * FloatingActionBar - Fixed bottom bar for bulk claim processing
 * 
 * Appears when claims are selected, providing quick bulk actions:
 * - Approve Selected
 * - Request Info
 * - Reject
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  Mail,
  X,
  AlertTriangle,
  Loader2,
  FileQuestion,
  UserPlus,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useToast } from '@/hooks/use-toast';
import { useUpdateRequestStatus } from '@/hooks/useSharedRequests';
import { useAuditLog } from '@/hooks/useAuditLog';
import { REQUEST_STATUSES } from '@/lib/crossPortalContract';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ClaimData {
  id: string;
  status: string | null;
  amount?: number | null;
  employeeName?: string;
}

interface HRTeamMember {
  id: string;
  name: string;
  role: string;
}

interface FloatingActionBarProps {
  selectedIds: string[];
  claimsData: ClaimData[];
  onClearSelection: () => void;
  onRefresh: () => void;
  organizationId?: string | null;
  onAssignTo?: (assigneeId: string, assigneeName: string) => void;
  hrTeamMembers?: HRTeamMember[];
}

const REJECTION_REASONS = [
  { value: 'incomplete_docs', label: 'Incomplete Documentation' },
  { value: 'exceeds_limit', label: 'Exceeds Entitlement' },
  { value: 'not_eligible', label: 'Not Eligible' },
  { value: 'duplicate', label: 'Duplicate Claim' },
  { value: 'policy_violation', label: 'Policy Violation' },
  { value: 'expired', label: 'Claim Period Expired' },
];

const PROCESSABLE_STATUSES = ['pending', 'submitted', 'in_review', 'needs_info'];

// Default HR Team Members for assignment
const DEFAULT_HR_TEAM_MEMBERS: HRTeamMember[] = [
  { id: 'hr-manager-1', name: 'Fatima Hassan', role: 'HR Manager' },
  { id: 'hr-specialist-1', name: 'Sarah Al-Rashid', role: 'HR Specialist' },
  { id: 'hr-specialist-2', name: 'Ahmed Khan', role: 'HR Specialist' },
  { id: 'finance-lead-1', name: 'John Mitchell', role: 'Finance Lead' },
];

export function FloatingActionBar({
  selectedIds,
  claimsData,
  onClearSelection,
  onRefresh,
  organizationId,
  onAssignTo,
  hrTeamMembers = DEFAULT_HR_TEAM_MEMBERS,
}: FloatingActionBarProps) {
  const { toast } = useToast();
  const updateStatus = useUpdateRequestStatus();
  const { logEvent } = useAuditLog();
  
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [requestInfoDialogOpen, setRequestInfoDialogOpen] = useState(false);
  
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [infoRequestMessage, setInfoRequestMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate eligible claims
  const selectedClaims = claimsData.filter(c => selectedIds.includes(c.id));
  const eligibleForApproval = selectedClaims.filter(c => PROCESSABLE_STATUSES.includes(c.status || ''));
  const ineligibleCount = selectedClaims.length - eligibleForApproval.length;
  
  const totalAmount = eligibleForApproval.reduce((sum, c) => sum + (c.amount || 0), 0);

  const handleBulkAssign = async (assigneeId: string, assigneeName: string) => {
    setIsProcessing(true);
    
    try {
      // Call parent handler if provided
      if (onAssignTo) {
        onAssignTo(assigneeId, assigneeName);
      }
      
      // Log each assignment
      for (const id of selectedIds) {
        await logEvent({
          action: 'BULK_ASSIGN',
          resourceType: 'request',
          resourceId: id,
          details: { 
            org_id: organizationId, 
            assignee_id: assigneeId, 
            assignee_name: assigneeName,
            bulk_action: true 
          }
        });
      }
      
      toast({
        title: 'Claims Assigned',
        description: `${selectedIds.length} claim${selectedIds.length !== 1 ? 's' : ''} assigned to ${assigneeName}.`,
      });
      
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign claims.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleBulkApprove = async () => {
    setIsProcessing(true);
    let approved = 0;
    let skipped = 0;

    try {
      for (const id of selectedIds) {
        const claim = claimsData.find(c => c.id === id);
        if (claim && PROCESSABLE_STATUSES.includes(claim.status || '')) {
          await updateStatus.mutateAsync({ 
            requestId: id, 
            newStatus: REQUEST_STATUSES.APPROVED, 
            reviewerNotes: approvalNotes || 'Bulk approved' 
          });
          await logEvent({
            action: 'BULK_APPROVE',
            resourceType: 'request',
            resourceId: id,
            details: { org_id: organizationId, status_to: 'approved', bulk_action: true }
          });
          approved++;
        } else {
          skipped++;
        }
      }
      
      toast({
        title: 'Bulk Approval Complete',
        description: `${approved} claim${approved !== 1 ? 's' : ''} approved${skipped > 0 ? ` • ${skipped} skipped` : ''}`,
      });
      
      setApproveDialogOpen(false);
      setApprovalNotes('');
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve some claims.',
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
          await updateStatus.mutateAsync({ 
            requestId: id, 
            newStatus: REQUEST_STATUSES.REJECTED, 
            reviewerNotes: `Rejected: ${reason}${rejectionNotes ? ` - ${rejectionNotes}` : ''}` 
          });
          await logEvent({
            action: 'BULK_REJECT',
            resourceType: 'request',
            resourceId: id,
            details: { org_id: organizationId, reason, status_to: 'rejected', bulk_action: true }
          });
          rejected++;
        } else {
          skipped++;
        }
      }
      
      toast({
        title: 'Bulk Rejection Complete',
        description: `${rejected} claim${rejected !== 1 ? 's' : ''} rejected${skipped > 0 ? ` • ${skipped} skipped` : ''}`,
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

  const handleBulkRequestInfo = async () => {
    setIsProcessing(true);
    
    try {
      for (const id of selectedIds) {
        await updateStatus.mutateAsync({ 
          requestId: id, 
          newStatus: REQUEST_STATUSES.IN_REVIEW, 
          reviewerNotes: infoRequestMessage || 'Additional information requested' 
        });
        await logEvent({
          action: 'BULK_REQUEST_INFO',
          resourceType: 'request',
          resourceId: id,
          details: { org_id: organizationId, message: infoRequestMessage, bulk_action: true }
        });
      }
      
      toast({
        title: 'Information Requested',
        description: `Requests sent to ${selectedIds.length} employee${selectedIds.length !== 1 ? 's' : ''}.`,
      });
      
      setRequestInfoDialogOpen(false);
      setInfoRequestMessage('');
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send information requests.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <div className="bg-slate-900 dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-4 flex items-center justify-between gap-4">
              {/* Left: Selection info */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                  className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="text-white">
                  <span className="font-semibold text-lg">{selectedIds.length}</span>
                  <span className="text-slate-300 ml-1.5">
                    Claim{selectedIds.length !== 1 ? 's' : ''} Selected
                  </span>
                  {totalAmount > 0 && (
                    <Badge variant="secondary" className="ml-3 bg-slate-700 text-slate-200 border-0">
                      AED {totalAmount.toLocaleString()}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Right: Action buttons */}
              <PermissionGate permission="can_process_claims">
                <div className="flex items-center gap-2">
                  {/* Assign To Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                        className="bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Assign to...
                        <ChevronDown className="w-3 h-3 ml-0.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover z-[60]">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        HR Team Members
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {hrTeamMembers.map((member) => (
                        <DropdownMenuItem
                          key={member.id}
                          onClick={() => handleBulkAssign(member.id, member.name)}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{member.name}</span>
                            <span className="text-xs text-muted-foreground">{member.role}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRequestInfoDialogOpen(true)}
                    className="bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30 hover:text-amber-300 gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Request Info
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRejectDialogOpen(true)}
                    className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 hover:text-red-300 gap-2"
                    disabled={eligibleForApproval.length === 0}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => setApproveDialogOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg"
                    disabled={eligibleForApproval.length === 0}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Selected
                  </Button>
                </div>
              </PermissionGate>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Approve {eligibleForApproval.length} Claim{eligibleForApproval.length !== 1 ? 's' : ''}
            </DialogTitle>
            <DialogDescription>
              This will approve the selected claims and notify the employees.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {ineligibleCount > 0 && (
              <Alert className="bg-warning/10 border-warning/30">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-sm">
                  {ineligibleCount} claim{ineligibleCount !== 1 ? 's' : ''} will be skipped (already processed).
                </AlertDescription>
              </Alert>
            )}
            
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <p className="text-sm font-medium">Total Amount:</p>
              <p className="text-2xl font-bold text-success">
                AED {totalAmount.toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Approval Notes (Optional)</Label>
              <Textarea
                placeholder="Add notes for this bulk approval..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkApprove} 
              disabled={isProcessing || eligibleForApproval.length === 0}
              className="bg-success hover:bg-success/90 gap-2"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Approve All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Reject {eligibleForApproval.length} Claim{eligibleForApproval.length !== 1 ? 's' : ''}
            </DialogTitle>
            <DialogDescription>
              Select a reason and optionally add notes for the rejection.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {ineligibleCount > 0 && (
              <Alert className="bg-warning/10 border-warning/30">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-sm">
                  {ineligibleCount} claim{ineligibleCount !== 1 ? 's' : ''} will be skipped (already processed).
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label>Rejection Reason *</Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {REJECTION_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                placeholder="Add notes for this rejection..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                rows={2}
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
              disabled={isProcessing || !rejectionReason || eligibleForApproval.length === 0}
              className="gap-2"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Dialog */}
      <Dialog open={requestInfoDialogOpen} onOpenChange={setRequestInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-amber-500" />
              Request Information
            </DialogTitle>
            <DialogDescription>
              Send an email template to {selectedIds.length} employee{selectedIds.length !== 1 ? 's' : ''} requesting additional information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Message Template</Label>
              <Textarea
                placeholder="Please provide additional documentation for your claim, including..."
                value={infoRequestMessage}
                onChange={(e) => setInfoRequestMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This message will be sent to all selected employees via email notification.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestInfoDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkRequestInfo} 
              disabled={isProcessing}
              className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FloatingActionBar;

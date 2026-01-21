/**
 * Claims Bulk Actions Bar
 * Enhanced bulk action bar with: Assign, Request Docs, Approve, Reject, Escalate, Add Note
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useClaimActions } from '@/hooks/useClaimActions';
import { useToast } from '@/hooks/use-toast';

interface ClaimsBulkActionsBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  totalCount: number;
  onExport: () => void;
  onRefresh: () => void;
  teamMembers?: { id: string; name: string }[];
}

const REJECTION_REASONS = [
  { value: 'incomplete_docs', label: 'Incomplete Documentation' },
  { value: 'exceeds_limit', label: 'Exceeds Entitlement' },
  { value: 'not_eligible', label: 'Not Eligible' },
  { value: 'duplicate', label: 'Duplicate Claim' },
  { value: 'policy_violation', label: 'Policy Violation' },
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
];

export function ClaimsBulkActionsBar({
  selectedIds,
  onClearSelection,
  onSelectAll,
  totalCount,
  onExport,
  onRefresh,
  teamMembers = [],
}: ClaimsBulkActionsBarProps) {
  const { toast } = useToast();
  const actions = useClaimActions();
  
  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [requestDocsDialogOpen, setRequestDocsDialogOpen] = useState(false);
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  // Form states
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [selectedMissingDocs, setSelectedMissingDocs] = useState<string[]>([]);
  const [docRequestMessage, setDocRequestMessage] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationPriority, setEscalationPriority] = useState<'high' | 'urgent'>('high');
  const [internalNote, setInternalNote] = useState('');

  const isAllSelected = selectedIds.length === totalCount && totalCount > 0;

  const handleBulkApprove = async () => {
    for (const id of selectedIds) {
      await actions.approve.mutateAsync({ requestId: id, reviewerNotes: 'Bulk approved' });
    }
    toast({
      title: 'Claims Approved',
      description: `${selectedIds.length} claims have been approved.`,
    });
    onClearSelection();
    onRefresh();
  };

  const handleBulkAssign = async () => {
    if (!selectedAssignee) return;
    const assignee = teamMembers.find(m => m.id === selectedAssignee);
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
  };

  const handleBulkReject = async () => {
    if (!rejectionReason) return;
    const reason = REJECTION_REASONS.find(r => r.value === rejectionReason)?.label || rejectionReason;
    for (const id of selectedIds) {
      await actions.reject.mutateAsync({
        requestId: id,
        reason,
        reviewerNotes: rejectionNotes,
      });
    }
    toast({
      title: 'Claims Rejected',
      description: `${selectedIds.length} claims have been rejected.`,
      variant: 'destructive',
    });
    setRejectDialogOpen(false);
    setRejectionReason('');
    setRejectionNotes('');
    onClearSelection();
    onRefresh();
  };

  const handleBulkRequestDocs = async () => {
    if (selectedMissingDocs.length === 0) return;
    const message = docRequestMessage || `Please provide: ${selectedMissingDocs.join(', ')}`;
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
  };

  const handleBulkEscalate = async () => {
    if (!escalationReason) return;
    for (const id of selectedIds) {
      await actions.escalate.mutateAsync({
        requestId: id,
        escalationReason,
        priority: escalationPriority,
      });
    }
    toast({
      title: 'Claims Escalated',
      description: `${selectedIds.length} claims have been escalated.`,
    });
    setEscalateDialogOpen(false);
    setEscalationReason('');
    onClearSelection();
    onRefresh();
  };

  const handleBulkAddNote = async () => {
    if (!internalNote.trim()) return;
    // Add internal note to each claim
    for (const id of selectedIds) {
      await actions.approve.mutateAsync({
        requestId: id,
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
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <Card className="border-primary/30 bg-primary/5 sticky top-4 z-40">
        <CardContent className="py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={() => isAllSelected ? onClearSelection() : onSelectAll()}
              />
              <span className="font-medium">{selectedIds.length} selected</span>
              {selectedIds.length < totalCount && (
                <Button variant="link" size="sm" onClick={onSelectAll} className="p-0 h-auto">
                  Select all {totalCount}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClearSelection}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <PermissionGate permission="can_process_claims">
                {/* Assign */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setAssignDialogOpen(true)}
                >
                  <UserPlus className="w-4 h-4" />
                  Assign
                </Button>

                {/* Request Docs */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setRequestDocsDialogOpen(true)}
                >
                  <FileQuestion className="w-4 h-4" />
                  Request Docs
                </Button>

                {/* Approve */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10" 
                  onClick={handleBulkApprove}
                  disabled={actions.isLoading}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </Button>

                {/* Reject */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-red-600 border-red-500/30 hover:bg-red-500/10"
                  onClick={() => setRejectDialogOpen(true)}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>

                {/* Escalate */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                  onClick={() => setEscalateDialogOpen(true)}
                >
                  <ArrowUp className="w-4 h-4" />
                  Escalate
                </Button>

                {/* Add Note */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setNoteDialogOpen(true)}
                >
                  <MessageSquare className="w-4 h-4" />
                  Add Note
                </Button>
              </PermissionGate>

              <Separator orientation="vertical" className="h-6 mx-1" />
              
              <Button variant="outline" size="sm" className="gap-2" onClick={onExport}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <Label>Notes (optional)</Label>
              <Textarea
                className="mt-1"
                placeholder="Add assignment notes..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkAssign} disabled={!selectedAssignee || actions.isLoading}>
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
              Reject {selectedIds.length} Claims
            </DialogTitle>
            <DialogDescription>
              All selected claims will be rejected with the chosen reason
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Rejection Reason</Label>
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
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleBulkReject} 
              disabled={!rejectionReason || actions.isLoading}
            >
              Reject Claims
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
              <div className="grid grid-cols-2 gap-2">
                {MISSING_DOC_TYPES.map(doc => (
                  <label key={doc} className="flex items-center gap-2 cursor-pointer text-sm">
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
            <Button variant="outline" onClick={() => setRequestDocsDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleBulkRequestDocs} 
              disabled={selectedMissingDocs.length === 0 || actions.isLoading}
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate Dialog */}
      <Dialog open={escalateDialogOpen} onOpenChange={setEscalateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
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
                    <div className="flex items-center gap-2">
                      <Badge className="bg-warning/10 text-warning">High</Badge>
                      <span>Requires attention today</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-destructive/10 text-destructive">Urgent</Badge>
                      <span>Immediate action required</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason for Escalation</Label>
              <Textarea
                className="mt-1"
                placeholder="Why are these claims being escalated?"
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleBulkEscalate} 
              disabled={!escalationReason || actions.isLoading}
            >
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
              This note will be added to all {selectedIds.length} selected claims (internal only)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Note</Label>
            <Textarea
              className="mt-1"
              placeholder="Enter internal note..."
              rows={4}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              This note is for internal use only and will not be visible to employees
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleBulkAddNote} 
              disabled={!internalNote.trim() || actions.isLoading}
            >
              Add Note to All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ClaimsBulkActionsBar;

/**
 * UniversalReviewDetail - Category-Agnostic Request/Claim Review Panel
 * 
 * ONE shared review detail component that works for ALL benefit categories.
 * Provides unified checklist, actions, notes, and timeline patterns.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  AlertTriangle,
  Send,
  Upload,
  Shield,
  Timer,
  MessageSquare,
  History,
  Loader2,
  Check,
  X,
  Ban,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { 
  getStatusBadgeStyle, 
  getStatusDisplayLabel,
  calculateSLA,
} from '@/lib/crossPortalContract';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow, format } from 'date-fns';

// =============================================================================
// TYPES
// =============================================================================

export interface DocumentChecklist {
  id: string;
  doc_name: string;
  doc_type: string;
  is_required: boolean;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected' | 'waived';
  file_url?: string;
  uploaded_at?: string;
  reviewer_notes?: string;
}

export interface TimelineEvent {
  id: string;
  event_type: string;
  description: string;
  actor_name?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ReviewDetailData {
  id: string;
  subject: string;
  description?: string;
  category: string;
  request_type: 'claim' | 'request' | 'question';
  status: string;
  amount?: number;
  priority?: string;
  created_at: string;
  updated_at?: string;
  sla_due_at?: string;
  
  // Employee info
  employee_id: string;
  employee_name?: string;
  employee_grade?: string;
  employee_department?: string;
  
  // Policy info
  policy_id?: string;
  policy_ref?: string;
  policy_title?: string;
  
  // Entitlement info
  annual_allowance?: number;
  utilized_amount?: number;
  remaining_amount?: number;
  
  // Documents
  documents: DocumentChecklist[];
  
  // Timeline
  timeline: TimelineEvent[];
  
  // Notes
  reviewer_notes?: string;
  internal_notes?: string;
}

export interface ReviewActions {
  approve: (notes?: string) => Promise<void>;
  reject: (reason: string, notes?: string) => Promise<void>;
  requestInfo: (info: string) => Promise<void>;
  waiveDocument: (docId: string, reason: string) => Promise<void>;
  approveDocument: (docId: string) => Promise<void>;
  rejectDocument: (docId: string, reason: string) => Promise<void>;
  addNote: (note: string, isInternal?: boolean) => Promise<void>;
}

export interface UniversalReviewDetailProps {
  /** Data for the request/claim being reviewed */
  data: ReviewDetailData | null;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Action handlers */
  actions: ReviewActions;
  
  /** Whether actions are being processed */
  isProcessing?: boolean;
  
  /** Callback when review is complete */
  onComplete?: () => void;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface DocumentChecklistSectionProps {
  documents: DocumentChecklist[];
  actions: ReviewActions;
  isProcessing?: boolean;
}

function DocumentChecklistSection({ documents, actions, isProcessing }: DocumentChecklistSectionProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [waiveReason, setWaiveReason] = useState('');
  
  const getStatusIcon = (status: DocumentChecklist['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'waived': return <Ban className="w-4 h-4 text-amber-500" />;
      case 'uploaded': return <Upload className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };
  
  const getStatusBadge = (status: DocumentChecklist['status']) => {
    const styles = {
      pending: 'bg-muted text-muted-foreground',
      uploaded: 'bg-blue-100 text-blue-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
      waived: 'bg-amber-100 text-amber-700',
    };
    return <Badge className={cn('text-xs capitalize', styles[status])}>{status}</Badge>;
  };
  
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No documents required for this request</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <FileText className="w-5 h-5 text-muted-foreground" />
          Document Checklist
        </CardTitle>
        <CardDescription>
          {documents.filter(d => d.status === 'approved' || d.status === 'waived').length} of {documents.length} complete
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.map(doc => (
          <div key={doc.id} className="p-3 rounded-lg border space-y-2">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                {getStatusIcon(doc.status)}
                <span className="font-medium text-sm">{doc.doc_name}</span>
                {doc.is_required && <Badge variant="outline" className="text-xs">Required</Badge>}
              </div>
              {getStatusBadge(doc.status)}
            </div>
            
            {doc.status === 'uploaded' && (
              <div className={cn("flex items-center gap-2 pt-2", isRTL && "flex-row-reverse")}>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1"
                  onClick={() => actions.approveDocument(doc.id)}
                  disabled={isProcessing}
                >
                  <Check className="w-3 h-3" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1 text-red-600 hover:text-red-700"
                  onClick={() => actions.rejectDocument(doc.id, 'Document not acceptable')}
                  disabled={isProcessing}
                >
                  <X className="w-3 h-3" />
                  Reject
                </Button>
                {doc.file_url && (
                  <Button size="sm" variant="ghost" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                )}
              </div>
            )}
            
            {doc.status === 'pending' && (
              <div className="pt-2">
                {activeDocId === doc.id ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Reason for waiving this document..."
                      value={waiveReason}
                      onChange={(e) => setWaiveReason(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          actions.waiveDocument(doc.id, waiveReason);
                          setActiveDocId(null);
                          setWaiveReason('');
                        }}
                        disabled={!waiveReason || isProcessing}
                      >
                        Confirm Waive
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveDocId(null);
                          setWaiveReason('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-amber-600"
                    onClick={() => setActiveDocId(doc.id)}
                  >
                    Waive Requirement
                  </Button>
                )}
              </div>
            )}
            
            {doc.reviewer_notes && (
              <p className={cn("text-xs text-muted-foreground italic", isRTL && "text-right")}>
                Note: {doc.reviewer_notes}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface TimelineSectionProps {
  timeline: TimelineEvent[];
}

function TimelineSection({ timeline }: TimelineSectionProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  if (timeline.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <History className="w-5 h-5 text-muted-foreground" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className={cn("absolute top-0 bottom-0 w-0.5 bg-border", isRTL ? "right-2" : "left-2")} />
          <div className="space-y-4">
            {timeline.map((event, i) => (
              <div key={event.id} className={cn("relative", isRTL ? "pr-8" : "pl-8")}>
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-muted border-2 border-background",
                  isRTL ? "right-0.5" : "left-0.5"
                )} />
                <div className={cn(isRTL && "text-right")}>
                  <p className="text-sm">{event.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.actor_name && `${event.actor_name} • `}
                    {format(new Date(event.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UniversalReviewDetail({
  data,
  isLoading,
  actions,
  isProcessing,
  onComplete,
}: UniversalReviewDetailProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [reviewNotes, setReviewNotes] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showRequestInfoForm, setShowRequestInfoForm] = useState(false);
  const [requestedInfo, setRequestedInfo] = useState('');
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Select an item to review</p>
      </div>
    );
  }
  
  const statusStyle = getStatusBadgeStyle(data.status);
  const slaInfo = data.sla_due_at ? calculateSLA(data.sla_due_at, data.status) : null;
  const allDocsComplete = data.documents.every(d => d.status === 'approved' || d.status === 'waived' || !d.is_required);
  const canApprove = allDocsComplete && !['approved', 'rejected', 'closed'].includes(data.status);
  const canReject = !['approved', 'rejected', 'closed'].includes(data.status);
  
  const handleApprove = async () => {
    await actions.approve(reviewNotes);
    onComplete?.();
  };
  
  const handleReject = async () => {
    await actions.reject(rejectionReason, reviewNotes);
    setShowRejectForm(false);
    onComplete?.();
  };
  
  const handleRequestInfo = async () => {
    await actions.requestInfo(requestedInfo);
    setShowRequestInfoForm(false);
    setRequestedInfo('');
  };
  
  const handleAddNote = async () => {
    if (!internalNote.trim()) return;
    await actions.addNote(internalNote, true);
    setInternalNote('');
  };
  
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className={cn("space-y-4", isRTL && "text-right")}>
          <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
            <div>
              <h2 className="text-xl font-display font-bold">{data.subject}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {data.policy_ref && `${data.policy_ref} • `}
                {data.category}
              </p>
            </div>
            <Badge className={cn('text-sm', statusStyle.className)}>
              {getStatusDisplayLabel(data.status)}
            </Badge>
          </div>
          
          {/* Quick Info */}
          <div className={cn("flex flex-wrap gap-3", isRTL && "flex-row-reverse")}>
            <Badge variant="outline" className={cn("gap-1", isRTL && "flex-row-reverse")}>
              <User className="w-3 h-3" />
              {data.employee_name || 'Unknown'}
            </Badge>
            {data.amount && (
              <Badge variant="secondary" className="font-mono">
                {formatCurrencyAED(data.amount)}
              </Badge>
            )}
            {slaInfo && (
              <Badge className={cn(
                'gap-1',
                slaInfo.isOverdue ? 'bg-red-100 text-red-700' : 
                slaInfo.isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-muted'
              )}>
                <Timer className="w-3 h-3" />
                {slaInfo.label}
              </Badge>
            )}
          </div>
          
          {data.description && (
            <p className="text-sm text-muted-foreground">{data.description}</p>
          )}
        </div>
        
        <Separator />
        
        {/* Entitlement Summary */}
        {(data.annual_allowance || data.utilized_amount !== undefined) && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Annual Allowance</p>
                  <p className="font-bold">{formatCurrencyAED(data.annual_allowance || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Utilized</p>
                  <p className="font-bold">{formatCurrencyAED(data.utilized_amount || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="font-bold text-emerald-600">{formatCurrencyAED(data.remaining_amount || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Document Checklist */}
        <DocumentChecklistSection 
          documents={data.documents} 
          actions={actions}
          isProcessing={isProcessing}
        />
        
        {/* Actions */}
        {(canApprove || canReject) && (
          <Card>
            <CardHeader>
              <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Shield className="w-5 h-5 text-muted-foreground" />
                Review Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Review Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Review Notes (visible to employee)</label>
                <Textarea
                  placeholder="Add notes about your decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              {/* Action Buttons */}
              <div className={cn("flex flex-wrap gap-2", isRTL && "flex-row-reverse")}>
                {canApprove && (
                  <Button
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve
                  </Button>
                )}
                
                {canReject && !showRejectForm && (
                  <Button
                    variant="outline"
                    className="gap-2 text-red-600 hover:text-red-700"
                    onClick={() => setShowRejectForm(true)}
                    disabled={isProcessing}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                )}
                
                {!showRequestInfoForm && (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShowRequestInfoForm(true)}
                    disabled={isProcessing}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Request Info
                  </Button>
                )}
              </div>
              
              {/* Reject Form */}
              {showRejectForm && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 space-y-3">
                  <p className="text-sm font-medium text-red-800">Rejection Reason</p>
                  <Textarea
                    placeholder="Explain why this request is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={!rejectionReason || isProcessing}
                    >
                      Confirm Rejection
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Request Info Form */}
              {showRequestInfoForm && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-3">
                  <p className="text-sm font-medium text-blue-800">Request Additional Information</p>
                  <Textarea
                    placeholder="What information do you need from the employee?"
                    value={requestedInfo}
                    onChange={(e) => setRequestedInfo(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRequestInfo}
                      disabled={!requestedInfo || isProcessing}
                    >
                      Send Request
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRequestInfoForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Internal Notes */}
        <Card>
          <CardHeader>
            <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              Internal Notes
            </CardTitle>
            <CardDescription>Only visible to HR team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add an internal note..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button onClick={handleAddNote} disabled={!internalNote.trim() || isProcessing}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Timeline */}
        <TimelineSection timeline={data.timeline} />
      </div>
    </ScrollArea>
  );
}

export default UniversalReviewDetail;

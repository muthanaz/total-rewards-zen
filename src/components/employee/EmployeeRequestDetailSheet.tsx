/**
 * Employee Request Detail Sheet
 * 
 * Side drawer showing full details of a request with tabs:
 * - Overview: Status, SLA, next action
 * - Docs: Required documents, upload UI
 * - Notes: Message thread with HR
 * - History: Timeline of all events
 */

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  MessageSquare, 
  History as HistoryIcon,
  Upload,
  Send,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useEmployeeRequest, useAddEmployeeNote, getEmployeeStatusLabel } from '@/hooks/useEmployeeRequests';
import { useClaimDocs, useClaimDocCounts } from '@/hooks/useClaimDocs';
import { useClaimNotes, useAddClaimNote } from '@/hooks/useClaimNotes';
import { useRequestTimeline } from '@/hooks/useSharedRequests';
import { getStatusBadgeStyle, formatRelativeTime } from '@/lib/crossPortalContract';
import { useToast } from '@/hooks/use-toast';
import { cn, formatCurrencyAED } from '@/lib/utils';

interface EmployeeRequestDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string | null;
}

export function EmployeeRequestDetailSheet({ 
  open, 
  onOpenChange, 
  requestId 
}: EmployeeRequestDetailSheetProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  
  const { data: request, isLoading } = useEmployeeRequest(requestId);
  const { data: docs = [] } = useClaimDocs(requestId);
  const docCounts = useClaimDocCounts(requestId);
  const { data: notes = [] } = useClaimNotes(requestId, false); // Employee sees only non-internal
  const { data: timeline = [] } = useRequestTimeline(requestId, false);
  const addNote = useAddClaimNote();
  const { toast } = useToast();
  
  const handleAddNote = async () => {
    if (!newNote.trim() || !requestId) return;
    
    try {
      await addNote.mutateAsync({
        requestId,
        note: newNote.trim(),
        isInternal: false,
      });
      setNewNote('');
      toast({ title: 'Message sent', description: 'HR will be notified of your update.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    }
  };
  
  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatMoney = (amount: number | null) => {
    if (!amount) return '—';
    return formatCurrencyAED(amount, { abbreviate: false });
  };
  
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };
  
  const getSLADisplay = () => {
    if (!request?.slaStatus) return null;
    const { hoursRemaining, isOverdue, isUrgent } = request.slaStatus;
    
    if (isOverdue) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Overdue by {Math.abs(hoursRemaining)}h</span>
        </div>
      );
    }
    
    if (isUrgent) {
      return (
        <div className="flex items-center gap-2 text-amber-600">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">{hoursRemaining}h remaining</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="text-sm">{Math.ceil(hoursRemaining / 24)} days remaining</span>
      </div>
    );
  };
  
  if (!requestId) return null;
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold line-clamp-2">
                {request?.subject || 'Loading...'}
              </SheetTitle>
              <SheetDescription className="mt-1">
                {request?.category} • {request?.request_type?.toUpperCase()}
              </SheetDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              {request && (
                <Badge className={cn("shrink-0", getStatusBadgeStyle(request.status).className)}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1">{getEmployeeStatusLabel(request.status)}</span>
                </Badge>
              )}
              {request?.amount && (
                <span className="text-lg font-semibold">{formatMoney(request.amount)}</span>
              )}
            </div>
          </div>
        </SheetHeader>
        
        {/* Next Action Banner */}
        {request?.hasMissingDocs && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">Action Required</p>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  Please upload {request.missingDocsCount} missing document(s) to continue processing.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {request?.reviewer_notes && request.status === 'rejected' && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Rejection Reason</p>
                <p className="text-sm text-red-600 dark:text-red-300">{request.reviewer_notes}</p>
              </div>
            </div>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-4 grid grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="text-xs py-2">
              <Info className="h-3.5 w-3.5 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="docs" className="text-xs py-2 relative">
              <FileText className="h-3.5 w-3.5 mr-1" />
              Docs
              {docCounts.missing > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {docCounts.missing}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs py-2">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs py-2">
              <HistoryIcon className="h-3.5 w-3.5 mr-1" />
              History
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 px-6 pb-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4 space-y-6">
              {/* Status & SLA */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Status</h4>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Current Status</span>
                    <Badge className={getStatusBadgeStyle(request?.status).className}>
                      {getEmployeeStatusLabel(request?.status || null)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">SLA</span>
                    {getSLADisplay()}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Next Step</span>
                    <span className="text-sm font-medium">{request?.nextAction}</span>
                  </div>
                </div>
              </div>
              
              {/* SLA Timeline Visual */}
              {request?.submitted_at && request?.sla_due_at && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Processing Timeline</h4>
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Submitted</span>
                      <span>SLA Due</span>
                    </div>
                    <Progress 
                      value={request.slaStatus?.isOverdue ? 100 : Math.min(100, Math.max(0, 100 - (request.slaStatus?.hoursRemaining || 0) / (request.sla_hours || 72) * 100))} 
                      className={cn(
                        request.slaStatus?.isOverdue && '[&>div]:bg-red-500',
                        request.slaStatus?.isUrgent && '[&>div]:bg-amber-500'
                      )}
                    />
                    <div className="flex justify-between text-xs mt-2">
                      <span>{formatDate(request.submitted_at)}</span>
                      <span>{formatDate(request.sla_due_at)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Request Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Request Details</h4>
                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type</span>
                      <p className="font-medium capitalize">{request?.request_type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category</span>
                      <p className="font-medium">{request?.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority</span>
                      <p className="font-medium capitalize">{request?.priority || 'Standard'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Policy Ref</span>
                      <p className="font-medium">{request?.policy_ref || '—'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm text-muted-foreground">Description</span>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{request?.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="docs" className="mt-4 space-y-4">
              {docs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No documents required for this request</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Required Documents</span>
                    <span className="font-medium">{docCounts.provided}/{docCounts.total} uploaded</span>
                  </div>
                  
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <div 
                        key={doc.id} 
                        className={cn(
                          "p-3 rounded-lg border flex items-center justify-between gap-3",
                          doc.status === 'missing' && "bg-amber-500/5 border-amber-500/20",
                          doc.status === 'provided' && "bg-emerald-500/5 border-emerald-500/20",
                          doc.status === 'rejected' && "bg-red-500/5 border-red-500/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className={cn(
                            "h-5 w-5",
                            doc.status === 'missing' && "text-amber-500",
                            doc.status === 'provided' && "text-emerald-500",
                            doc.status === 'rejected' && "text-red-500"
                          )} />
                          <div>
                            <p className="text-sm font-medium">{doc.doc_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{doc.status}</p>
                          </div>
                        </div>
                        
                        {doc.status === 'missing' && (
                          <Button size="sm" variant="outline" className="gap-1">
                            <Upload className="h-3.5 w-3.5" />
                            Upload
                          </Button>
                        )}
                        
                        {doc.status === 'provided' && (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        )}
                        
                        {doc.status === 'rejected' && doc.reviewer_notes && (
                          <span className="text-xs text-red-600">{doc.reviewer_notes}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
            
            {/* Notes/Messages Tab */}
            <TabsContent value="notes" className="mt-4 space-y-4">
              {/* Add message input */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a message for HR..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleAddNote} 
                  disabled={!newNote.trim() || addNote.isPending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
              
              <Separator />
              
              {/* Messages list */}
              {notes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{note.author_name || 'HR Team'}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(note.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history" className="mt-4">
              {timeline.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HistoryIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No history yet</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {timeline.map((event, idx) => (
                      <div key={event.id} className="relative pl-10">
                        <div className={cn(
                          "absolute left-2.5 w-3 h-3 rounded-full border-2 bg-background",
                          idx === timeline.length - 1 ? "border-primary" : "border-muted-foreground"
                        )} />
                        <div className="p-3 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium capitalize">
                              {(event.action || event.to_status || 'Updated').replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(event.created_at)}
                            </span>
                          </div>
                          {event.notes_employee_visible && (
                            <p className="text-sm text-muted-foreground">{event.notes_employee_visible}</p>
                          )}
                          {event.from_status && event.to_status && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {getEmployeeStatusLabel(event.from_status as any)} → {getEmployeeStatusLabel(event.to_status as any)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

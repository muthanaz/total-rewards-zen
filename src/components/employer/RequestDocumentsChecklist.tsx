/**
 * Request Documents Checklist
 * 
 * Displays the frozen document checklist from request_documents table.
 * This is the employer view for reviewing and verifying submitted documents.
 * 
 * Key principle: Documents are NOT re-derived from policy. We show exactly
 * what was captured at submission time to ensure historical accuracy.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  XCircle,
  FileText,
  MoreVertical,
  Check,
  X,
  Eye,
  Upload,
  Clock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  useRequestDocuments,
  useRequestDocumentCounts,
  useVerifyRequestDocument,
  useRejectRequestDocument,
  useRequestDocumentUpload,
  type RequestDocument,
  type RequestDocumentStatus,
} from '@/hooks/useRequestDocuments';

interface RequestDocumentsChecklistProps {
  requestId: string | null;
  className?: string;
  readOnly?: boolean;
}

const STATUS_CONFIG: Record<RequestDocumentStatus, {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-slate-600',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
  },
  provided: {
    icon: CheckCircle,
    label: 'Provided',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  verified: {
    icon: CheckCircle,
    label: 'Verified',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  pending_review: {
    icon: Clock,
    label: 'Pending Review',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  missing: {
    icon: AlertCircle,
    label: 'Missing',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  waived: {
    icon: CheckCircle,
    label: 'Waived',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
};

function DocumentItem({
  doc,
  readOnly,
  onVerify,
  onReject,
  onRequestUpload,
  isProcessing,
}: {
  doc: RequestDocument;
  readOnly?: boolean;
  onVerify: (docId: string) => void;
  onReject: (docId: string, reason: string) => void;
  onRequestUpload: (docId: string) => void;
  isProcessing: boolean;
}) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  const statusConfig = STATUS_CONFIG[doc.status];
  const StatusIcon = statusConfig.icon;
  
  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject(doc.id, rejectReason);
    setRejectDialogOpen(false);
    setRejectReason('');
  };
  
  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border transition-colors",
          statusConfig.bgColor,
          statusConfig.borderColor
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
            statusConfig.bgColor
          )}>
            <StatusIcon className={cn("w-4 h-4", statusConfig.color)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{doc.doc_name}</p>
              {doc.is_required && (
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  Required
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {doc.doc_type}
              {doc.derivation_reason && ` • ${doc.derivation_reason}`}
            </p>
            {doc.rejection_reason && (
              <p className="text-xs text-red-600 mt-1">
                Rejected: {doc.rejection_reason}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className={cn("text-xs gap-1", statusConfig.color, statusConfig.borderColor)}
          >
            {statusConfig.label}
          </Badge>
          
          {!readOnly && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isProcessing}>
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MoreVertical className="w-4 h-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {doc.file_url && (
                  <>
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Document
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                {doc.status !== 'provided' && (
                  <DropdownMenuItem onClick={() => onVerify(doc.id)}>
                    <Check className="w-4 h-4 mr-2 text-emerald-600" />
                    Mark as Verified
                  </DropdownMenuItem>
                )}
                
                {doc.status !== 'rejected' && (
                  <DropdownMenuItem onClick={() => setRejectDialogOpen(true)}>
                    <X className="w-4 h-4 mr-2 text-red-600" />
                    Reject Document
                  </DropdownMenuItem>
                )}
                
                {doc.status !== 'missing' && (
                  <DropdownMenuItem onClick={() => onRequestUpload(doc.id)}>
                    <Upload className="w-4 h-4 mr-2 text-amber-600" />
                    Request Re-upload
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Rejecting "{doc.doc_name}" will notify the employee to re-upload.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function RequestDocumentsChecklist({
  requestId,
  className,
  readOnly = false,
}: RequestDocumentsChecklistProps) {
  const { toast } = useToast();
  const { data: docs = [], isLoading } = useRequestDocuments(requestId);
  const counts = useRequestDocumentCounts(requestId);
  
  const verifyDoc = useVerifyRequestDocument();
  const rejectDoc = useRejectRequestDocument();
  const requestUpload = useRequestDocumentUpload();
  
  const isProcessing = verifyDoc.isPending || rejectDoc.isPending || requestUpload.isPending;
  
  const handleVerify = async (docId: string) => {
    try {
      await verifyDoc.mutateAsync({ docId });
      toast({ title: 'Document verified' });
    } catch {
      toast({ title: 'Failed to verify document', variant: 'destructive' });
    }
  };
  
  const handleReject = async (docId: string, reason: string) => {
    try {
      await rejectDoc.mutateAsync({ docId, reason });
      toast({ title: 'Document rejected', description: 'Employee will be notified' });
    } catch {
      toast({ title: 'Failed to reject document', variant: 'destructive' });
    }
  };
  
  const handleRequestUpload = async (docId: string) => {
    try {
      await requestUpload.mutateAsync({ docId });
      toast({ title: 'Upload requested', description: 'Employee will be notified' });
    } catch {
      toast({ title: 'Failed to request upload', variant: 'destructive' });
    }
  };
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Document Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (docs.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Document Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No documents required for this submission.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Document Checklist
          {counts.missing > 0 && (
            <Badge className="bg-amber-500/10 text-amber-600 border-0 text-xs ml-2">
              {counts.missing} missing
            </Badge>
          )}
          {counts.pending_review > 0 && (
            <Badge className="bg-blue-500/10 text-blue-600 border-0 text-xs ml-2">
              {counts.pending_review} pending
            </Badge>
          )}
          {counts.missing === 0 && counts.pending_review === 0 && counts.total > 0 && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-xs ml-2">
              All verified
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground mb-3">
          Documents captured at submission time from policy requirements.
        </p>
        
        {docs.map((doc) => (
          <DocumentItem
            key={doc.id}
            doc={doc}
            readOnly={readOnly}
            onVerify={handleVerify}
            onReject={handleReject}
            onRequestUpload={handleRequestUpload}
            isProcessing={isProcessing}
          />
        ))}
      </CardContent>
    </Card>
  );
}

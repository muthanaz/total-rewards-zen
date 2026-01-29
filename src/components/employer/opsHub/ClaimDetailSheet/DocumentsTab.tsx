/**
 * ClaimDetailSheet - Documents Tab
 * 
 * Checklist rows with verify/reject actions and reason capture
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
  CheckCircle,
  XCircle,
  Clock,
  FileQuestion,
  Upload,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ClaimDocument } from './types';

interface DocumentsTabProps {
  documents: ClaimDocument[];
  onVerify: (docId: string, notes?: string) => void;
  onReject: (docId: string, reason: string) => void;
  isProcessing?: boolean;
}

const statusConfig = {
  missing: {
    icon: FileQuestion,
    label: 'Missing',
    className: 'bg-muted text-muted-foreground',
  },
  pending: {
    icon: Clock,
    label: 'Pending Review',
    className: 'bg-warning/10 text-warning border-warning/30',
  },
  verified: {
    icon: CheckCircle,
    label: 'Verified',
    className: 'bg-success/10 text-success border-success/30',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

export function DocumentsTab({ documents, onVerify, onReject, isProcessing }: DocumentsTabProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const requiredDocs = documents.filter(d => d.isRequired);
  const optionalDocs = documents.filter(d => !d.isRequired);
  const allRequiredVerified = requiredDocs.every(d => d.status === 'verified');

  const handleRejectClick = (docId: string) => {
    setSelectedDocId(docId);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedDocId && rejectReason.trim().length >= 10) {
      onReject(selectedDocId, rejectReason);
      setRejectDialogOpen(false);
      setSelectedDocId(null);
      setRejectReason('');
    }
  };

  const renderDocumentRow = (doc: ClaimDocument) => {
    const config = statusConfig[doc.status];
    const StatusIcon = config.icon;
    const canReview = doc.status === 'pending' && doc.fileUrl;

    return (
      <div 
        key={doc.id}
        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <StatusIcon className={cn('w-4 h-4 shrink-0', 
            doc.status === 'verified' && 'text-success',
            doc.status === 'rejected' && 'text-destructive',
            doc.status === 'pending' && 'text-warning',
            doc.status === 'missing' && 'text-muted-foreground'
          )} />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{doc.docName}</p>
            <p className="text-xs text-muted-foreground">{doc.docType}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {doc.isRequired && (
            <Badge variant="outline" className="text-[10px]">Required</Badge>
          )}
          <Badge className={cn('text-[10px]', config.className)}>
            {config.label}
          </Badge>

          {/* View document link */}
          {doc.fileUrl && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          )}

          {/* Review actions */}
          {canReview && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-success hover:text-success hover:bg-success/10"
                onClick={() => onVerify(doc.id)}
                disabled={isProcessing}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleRejectClick(doc.id)}
                disabled={isProcessing}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <Card className={cn(
        allRequiredVerified 
          ? 'border-success/30 bg-success/5' 
          : 'border-warning/30 bg-warning/5'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {allRequiredVerified ? (
              <>
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">
                  All required documents verified
                </span>
              </>
            ) : (
              <>
                <FileQuestion className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-warning">
                  {requiredDocs.filter(d => d.status !== 'verified').length} required documents pending
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Required documents */}
      {requiredDocs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Required Documents ({requiredDocs.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {requiredDocs.map(renderDocumentRow)}
          </CardContent>
        </Card>
      )}

      {/* Optional documents */}
      {optionalDocs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Optional Documents ({optionalDocs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {optionalDocs.map(renderDocumentRow)}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {documents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileQuestion className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No documents in checklist</p>
          </CardContent>
        </Card>
      )}

      {/* Reject reason dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this document (min 10 characters).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="e.g., Document is illegible, wrong document type, expired..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            {rejectReason.length > 0 && rejectReason.length < 10 && (
              <p className="text-xs text-destructive mt-1">
                Minimum 10 characters required
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmReject}
              disabled={rejectReason.trim().length < 10}
            >
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

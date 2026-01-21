/**
 * Missing Docs Checklist
 * 
 * Inline checklist of required documents with upload status.
 * Pulled from policy required docs mapping.
 */

import { useState } from 'react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileQuestion, 
  CheckCircle2, 
  Upload, 
  Clock,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequiredDoc {
  id: string;
  name: string;
  status: 'received' | 'pending' | 'missing' | 'rejected';
  uploadedAt?: string;
  notes?: string;
}

interface MissingDocsChecklistProps {
  requestId: string;
  documents: RequiredDoc[];
  onMarkReceived?: (docId: string) => void;
  onRequestDoc?: (docId: string) => void;
}

export function MissingDocsChecklist({
  requestId,
  documents,
  onMarkReceived,
  onRequestDoc,
}: MissingDocsChecklistProps) {
  const [open, setOpen] = useState(false);

  const missingCount = documents.filter(d => d.status === 'missing' || d.status === 'pending').length;
  const receivedCount = documents.filter(d => d.status === 'received').length;

  const getStatusIcon = (status: RequiredDoc['status']) => {
    switch (status) {
      case 'received':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'missing':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusLabel = (status: RequiredDoc['status']) => {
    switch (status) {
      case 'received':
        return 'Received';
      case 'pending':
        return 'Pending';
      case 'missing':
        return 'Missing';
      case 'rejected':
        return 'Rejected';
    }
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "cursor-pointer gap-1 transition-colors",
            missingCount > 0 
              ? "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20" 
              : "bg-success/10 text-success border-success/30"
          )}
        >
          <FileQuestion className="w-3 h-3" />
          {missingCount > 0 ? `${missingCount} missing` : 'Docs OK'}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Required Documents</span>
            <Badge variant="outline" className="text-xs">
              {receivedCount}/{documents.length} received
            </Badge>
          </div>
        </div>
        <div className="p-2 max-h-64 overflow-y-auto">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={cn(
                "flex items-start gap-3 p-2 rounded-lg",
                doc.status === 'missing' && "bg-destructive/5",
                doc.status === 'pending' && "bg-warning/5"
              )}
            >
              <div className="mt-0.5">
                {getStatusIcon(doc.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{doc.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] px-1.5 py-0",
                      doc.status === 'received' && "bg-success/10 text-success border-success/30",
                      doc.status === 'pending' && "bg-warning/10 text-warning border-warning/30",
                      doc.status === 'missing' && "bg-destructive/10 text-destructive border-destructive/30",
                      doc.status === 'rejected' && "bg-destructive/10 text-destructive border-destructive/30"
                    )}
                  >
                    {getStatusLabel(doc.status)}
                  </Badge>
                  {doc.uploadedAt && (
                    <span className="text-[10px] text-muted-foreground">
                      {doc.uploadedAt}
                    </span>
                  )}
                </div>
                {doc.notes && (
                  <p className="text-xs text-muted-foreground mt-1">{doc.notes}</p>
                )}
              </div>
              <div className="shrink-0">
                {(doc.status === 'missing' || doc.status === 'pending') && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onMarkReceived?.(doc.id)}
                      title="Mark as received"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onRequestDoc?.(doc.id)}
                      title="Request again"
                    >
                      <Upload className="w-3.5 h-3.5 text-primary" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t bg-muted/30">
          <Button variant="outline" size="sm" className="w-full text-xs">
            Request All Missing Documents
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

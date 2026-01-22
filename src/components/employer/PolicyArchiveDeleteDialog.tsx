import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Archive, Trash2, Loader2, Info } from 'lucide-react';

export type PolicyArchiveDeleteAction = 'archive' | 'delete';

export interface PolicyArchiveDeleteDialogPolicy {
  id: string;
  title: string;
  hasPublishedVersion: boolean;
}

interface PolicyArchiveDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: PolicyArchiveDeleteDialogPolicy | null;
  action: PolicyArchiveDeleteAction;
  isSubmitting?: boolean;
  serverHint?: string | null;
  serverFlags?: {
    hasPublishedVersion?: boolean;
    hasLinkedRequests?: boolean;
  } | null;
  onConfirm: (args: { action: PolicyArchiveDeleteAction; reason: string }) => void;
}

export function PolicyArchiveDeleteDialog({
  open,
  onOpenChange,
  policy,
  action,
  isSubmitting = false,
  serverHint,
  serverFlags,
  onConfirm,
}: PolicyArchiveDeleteDialogProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  const hasPublishedVersion = Boolean(policy?.hasPublishedVersion || serverFlags?.hasPublishedVersion);
  const hasLinkedRequests = Boolean(serverFlags?.hasLinkedRequests);

  // Delete is blocked if there are published versions or linked requests
  const isDeleteBlocked = action === 'delete' && (hasPublishedVersion || hasLinkedRequests);

  const title = useMemo(() => {
    if (action === 'archive') return 'Archive Policy';
    return 'Delete Policy';
  }, [action]);

  const Icon = action === 'archive' ? Archive : Trash2;

  // Build blocking reasons list for UI
  const blockingReasons: string[] = [];
  if (isDeleteBlocked) {
    if (hasPublishedVersion) {
      blockingReasons.push('This policy has a published version. Published policies cannot be deleted to preserve audit history.');
    }
    if (hasLinkedRequests) {
      blockingReasons.push('This policy is linked to existing claims or requests. Deleting would break the audit trail.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (isSubmitting ? null : onOpenChange(v))}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {policy ? (
              <>Confirm action for <span className="font-medium">{policy.title}</span>.</>
            ) : (
              'Confirm action.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Server hint (error message from RPC) */}
        {serverHint && (
          <Alert className="border-destructive/30 bg-destructive/5">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <AlertDescription className="text-sm text-destructive">
              {serverHint}
            </AlertDescription>
          </Alert>
        )}

        {/* Delete blocked - show detailed explanation */}
        {isDeleteBlocked && !serverHint && (
          <Alert className="border-amber-500/30 bg-amber-500/5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-700">
              <div className="space-y-2">
                <p className="font-medium">Delete is not available for this policy.</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {blockingReasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
                <p className="text-xs mt-2 pt-2 border-t border-amber-500/20">
                  <strong>Recommended:</strong> Use Archive instead. Archived policies remain in the system for compliance but are no longer active.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Archive info */}
        {action === 'archive' && (
          <Alert className="border-blue-500/30 bg-blue-500/5">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-700">
              Archiving will deactivate this policy. It will no longer be visible to employees but remains accessible for audit purposes.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="reason">Reason (required)</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={action === 'archive' ? 'Why are you archiving this policy?' : 'Why are you deleting this policy?'}
            disabled={isSubmitting || isDeleteBlocked}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={action === 'delete' ? 'destructive' : 'default'}
            onClick={() => onConfirm({ action, reason: reason.trim() })}
            disabled={isSubmitting || !reason.trim() || !policy || isDeleteBlocked}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {action === 'archive' ? 'Archiving...' : 'Deleting...'}
              </>
            ) : (
              action === 'archive' ? 'Archive' : 'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
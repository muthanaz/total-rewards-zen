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
import { AlertTriangle, Archive, Trash2 } from 'lucide-react';

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
  onConfirm: (args: { action: PolicyArchiveDeleteAction; reason: string }) => void;
}

export function PolicyArchiveDeleteDialog({
  open,
  onOpenChange,
  policy,
  action,
  isSubmitting = false,
  serverHint,
  onConfirm,
}: PolicyArchiveDeleteDialogProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  const isDeleteBlockedByPublished = Boolean(policy?.hasPublishedVersion) && action === 'delete';

  const title = useMemo(() => {
    if (action === 'archive') return 'Archive Policy';
    return 'Delete Policy';
  }, [action]);

  const Icon = action === 'archive' ? Archive : Trash2;

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

        {(isDeleteBlockedByPublished || serverHint) && (
          <Alert className="border-amber-500/30 bg-amber-500/5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-700">
              {serverHint || 'This policy has a published version and cannot be deleted. Archive it instead.'}
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
            disabled={isSubmitting}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={action === 'delete' ? 'destructive' : 'default'}
            onClick={() => onConfirm({ action, reason: reason.trim() })}
            disabled={isSubmitting || !reason.trim() || !policy || isDeleteBlockedByPublished}
          >
            {action === 'archive' ? 'Archive' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

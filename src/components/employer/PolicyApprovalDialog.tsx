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
import { AlertTriangle, CheckCircle2, Send } from 'lucide-react';

export type PolicyApprovalDialogMode = 'submit' | 'reject';

export interface PolicyApprovalDialogPolicy {
  id: string;
  title: string;
}

interface PolicyApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: PolicyApprovalDialogMode;
  policy: PolicyApprovalDialogPolicy | null;
  isSubmitting?: boolean;
  serverHint?: string | null;
  onConfirm: (args: { noteOrReason: string }) => void;
}

export function PolicyApprovalDialog({
  open,
  onOpenChange,
  mode,
  policy,
  isSubmitting = false,
  serverHint,
  onConfirm,
}: PolicyApprovalDialogProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!open) setText('');
  }, [open]);

  const ui = useMemo(() => {
    if (mode === 'submit') {
      return {
        title: 'Submit for Approval',
        description:
          'This will move the draft to Pending Approval so an approver can review it.',
        label: 'Note (optional)',
        placeholder: 'Add a short note for the approver (optional)...',
        buttonText: 'Submit',
        Icon: Send,
        hint: 'Once submitted, editing should be limited until the policy is approved or rejected.',
      };
    }

    return {
      title: 'Reject Policy',
      description: 'Rejection sends the policy back to Draft. A reason is required.',
      label: 'Rejection reason (required)',
      placeholder: 'Explain what must be changed before approval...',
      buttonText: 'Reject',
      Icon: AlertTriangle,
      hint: null,
    };
  }, [mode]);

  const Icon = ui.Icon;
  const requiresText = mode === 'reject';

  return (
    <Dialog open={open} onOpenChange={(v) => (isSubmitting ? null : onOpenChange(v))}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {ui.title}
          </DialogTitle>
          <DialogDescription>
            {policy ? (
              <>
                {ui.description} <span className="font-medium">{policy.title}</span>.
              </>
            ) : (
              ui.description
            )}
          </DialogDescription>
        </DialogHeader>

        {serverHint && (
          <Alert className="border-amber-500/30 bg-amber-500/5">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-700">{serverHint}</AlertDescription>
          </Alert>
        )}

        {ui.hint && (
          <Alert className="border-amber-500/30 bg-amber-500/5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-700">{ui.hint}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="noteOrReason">{ui.label}</Label>
          <Textarea
            id="noteOrReason"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={ui.placeholder}
            disabled={isSubmitting}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={mode === 'reject' ? 'destructive' : 'default'}
            onClick={() => onConfirm({ noteOrReason: text.trim() })}
            disabled={isSubmitting || !policy || (requiresText && !text.trim())}
          >
            {ui.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

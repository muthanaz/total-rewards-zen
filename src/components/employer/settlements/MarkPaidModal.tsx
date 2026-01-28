import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Calendar,
  FileText,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { SettlementBatch } from './types';
import { format } from 'date-fns';

interface MarkPaidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: SettlementBatch | null;
  onConfirm: (bankReference: string, paymentDate: string, notes?: string) => void;
}

export function MarkPaidModal({
  open,
  onOpenChange,
  batch,
  onConfirm,
}: MarkPaidModalProps) {
  const [bankReference, setBankReference] = useState(batch?.bankReference || '');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  if (!batch) return null;

  const hasExceptions = batch.exceptions.length > 0;
  const reconciled = batch.reconciliation.status === 'matched';

  const handleConfirm = () => {
    onConfirm(bankReference, paymentDate, notes || undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Mark Batch as Paid
          </DialogTitle>
          <DialogDescription>
            Confirm that payment has been processed for this batch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Batch Summary */}
          <div className="p-3 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-medium">{batch.batchRef}</span>
              <Badge variant="outline">{batch.period}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Claims:</span>
                <span className="ml-2 font-medium tabular-nums">{batch.claimsCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>
                <span className="ml-2 font-medium tabular-nums">
                  {formatCurrencyAED(batch.totalAED)}
                </span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {!reconciled && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <span className="text-sm text-warning">
                Batch has not been fully reconciled
              </span>
            </div>
          )}

          {hasExceptions && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <span className="text-sm text-destructive">
                {batch.exceptions.length} unresolved exception{batch.exceptions.length > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="bankRef" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Bank Reference
              </Label>
              <Input
                id="bankRef"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                placeholder="e.g., ENBD-2026-0128-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Payment Date
              </Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this payment..."
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="gap-2 bg-success hover:bg-success/90"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirm Paid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

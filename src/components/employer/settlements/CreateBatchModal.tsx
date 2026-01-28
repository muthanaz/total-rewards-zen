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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Banknote, 
  User,
  CheckCircle2,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { SettlementClaim } from './types';
import { format } from 'date-fns';

interface CreateBatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claims: SettlementClaim[];
  onCreateBatch: (claimIds: string[]) => void;
}

export function CreateBatchModal({
  open,
  onOpenChange,
  claims,
  onCreateBatch,
}: CreateBatchModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    claims.filter(c => c.bankIban).map(c => c.id)
  );

  const selectedClaims = claims.filter(c => selectedIds.includes(c.id));
  const totalAmount = selectedClaims.reduce((sum, c) => sum + c.amount, 0);
  const missingBankCount = claims.filter(c => !c.bankIban).length;

  const toggleAll = () => {
    if (selectedIds.length === claims.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(claims.map(c => c.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCreate = () => {
    onCreateBatch(selectedIds);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" />
            Create Settlement Batch
          </DialogTitle>
          <DialogDescription>
            Select approved claims to include in this batch. Claims with missing bank details will be flagged.
          </DialogDescription>
        </DialogHeader>

        {missingBankCount > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm text-warning">
              {missingBankCount} claim{missingBankCount > 1 ? 's' : ''} missing bank details
            </span>
          </div>
        )}

        <div className="border rounded-lg">
          <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.length === claims.length}
                onCheckedChange={toggleAll}
              />
              <span className="text-sm font-medium">
                Select All ({claims.length} claims)
              </span>
            </div>
            <div className="text-sm">
              Selected: <span className="font-semibold tabular-nums">{selectedIds.length}</span>
            </div>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {claims.map((claim) => {
                const hasBankDetails = !!claim.bankIban;
                const isSelected = selectedIds.includes(claim.id);

                return (
                  <div
                    key={claim.id}
                    className={cn(
                      'flex items-center justify-between p-3 hover:bg-muted/30',
                      !hasBankDetails && 'bg-warning/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(claim.id)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{claim.employeeName}</span>
                          <Badge variant="secondary" className="text-[10px] px-1">
                            {claim.employeeGrade}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground font-mono">
                            {claim.claimRef}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {claim.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {hasBankDetails ? (
                        <div className="flex items-center gap-1 text-xs text-success">
                          <CheckCircle2 className="w-3 h-3" />
                          {claim.bankName}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-warning">
                          <AlertTriangle className="w-3 h-3" />
                          No Bank Details
                        </div>
                      )}
                      <span className="text-sm font-semibold tabular-nums w-24 text-right">
                        {formatCurrencyAED(claim.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Batch Total</p>
            <p className="text-xl font-bold tabular-nums">
              {formatCurrencyAED(totalAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Claims Selected</p>
            <p className="text-xl font-bold tabular-nums">{selectedIds.length}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={selectedIds.length === 0}
            className="gap-2"
          >
            <Banknote className="w-4 h-4" />
            Create Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

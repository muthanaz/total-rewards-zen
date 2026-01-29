import { useState, useMemo } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Banknote, 
  Building,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { SettlementClaim, PaymentMethod } from './types';

interface CreateBatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claims: SettlementClaim[];
  onCreateBatch: (claimIds: string[], paymentMethod?: PaymentMethod) => void;
}

const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: typeof Banknote; description: string }> = {
  payroll: { label: 'Payroll', icon: Building, description: 'Via monthly payroll run' },
  vendor: { label: 'Vendor', icon: CreditCard, description: 'Direct to service provider' },
  reimbursement: { label: 'Reimbursement', icon: Banknote, description: 'Bank transfer to employee' },
};

export function CreateBatchModal({
  open,
  onOpenChange,
  claims,
  onCreateBatch,
}: CreateBatchModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    claims.filter(c => c.bankIban || c.paymentMethod === 'payroll').map(c => c.id)
  );
  const [activeMethod, setActiveMethod] = useState<PaymentMethod | 'all'>('all');

  // Group claims by payment method
  const groupedClaims = useMemo(() => {
    const groups: Record<PaymentMethod, SettlementClaim[]> = {
      payroll: [],
      vendor: [],
      reimbursement: [],
    };
    claims.forEach(c => {
      groups[c.paymentMethod].push(c);
    });
    return groups;
  }, [claims]);

  const displayedClaims = activeMethod === 'all' ? claims : groupedClaims[activeMethod];

  const selectedClaims = claims.filter(c => selectedIds.includes(c.id));
  const totalAmount = selectedClaims.reduce((sum, c) => sum + c.amount, 0);
  const missingBankCount = claims.filter(c => c.paymentMethod === 'reimbursement' && !c.bankIban).length;

  const toggleAll = () => {
    const idsToToggle = displayedClaims.map(c => c.id);
    const allSelected = idsToToggle.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(selectedIds.filter(id => !idsToToggle.includes(id)));
    } else {
      setSelectedIds([...new Set([...selectedIds, ...idsToToggle])]);
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
    onCreateBatch(selectedIds, activeMethod === 'all' ? undefined : activeMethod);
    onOpenChange(false);
  };

  const allDisplayedSelected = displayedClaims.length > 0 && displayedClaims.every(c => selectedIds.includes(c.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" />
            Create Settlement Batch
          </DialogTitle>
          <DialogDescription>
            Group by payment method and select claims to batch.
          </DialogDescription>
        </DialogHeader>

        {/* Payment Method Tabs */}
        <Tabs value={activeMethod} onValueChange={(v) => setActiveMethod(v as PaymentMethod | 'all')}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              All ({claims.length})
            </TabsTrigger>
            {Object.entries(PAYMENT_METHOD_CONFIG).map(([method, config]) => {
              const count = groupedClaims[method as PaymentMethod].length;
              return (
                <TabsTrigger key={method} value={method} className="text-xs gap-1">
                  <config.icon className="w-3 h-3" />
                  {config.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {missingBankCount > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm text-warning">
              {missingBankCount} reimbursement claim{missingBankCount > 1 ? 's' : ''} missing bank details
            </span>
          </div>
        )}

        <div className="border rounded-lg">
          <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allDisplayedSelected}
                onCheckedChange={toggleAll}
              />
              <span className="text-sm font-medium">
                Select All ({displayedClaims.length} claims)
              </span>
            </div>
            <div className="text-sm">
              Selected: <span className="font-semibold tabular-nums">{selectedIds.length}</span>
            </div>
          </div>
          <ScrollArea className="h-[280px]">
            <div className="divide-y">
              {displayedClaims.map((claim) => {
                const hasBankDetails = !!claim.bankIban;
                const isSelected = selectedIds.includes(claim.id);
                const methodConfig = PAYMENT_METHOD_CONFIG[claim.paymentMethod];
                const MethodIcon = methodConfig.icon;

                return (
                  <div
                    key={claim.id}
                    className={cn(
                      'flex items-center justify-between p-3 hover:bg-muted/30',
                      !hasBankDetails && claim.paymentMethod === 'reimbursement' && 'bg-warning/5'
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
                          {claim.costCenter && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {claim.costCenter}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <MethodIcon className="w-3 h-3" />
                        {methodConfig.label}
                      </Badge>
                      {claim.paymentMethod === 'reimbursement' && (
                        hasBankDetails ? (
                          <div className="flex items-center gap-1 text-xs text-success">
                            <CheckCircle2 className="w-3 h-3" />
                            {claim.bankName}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-warning">
                            <AlertTriangle className="w-3 h-3" />
                            No Bank
                          </div>
                        )
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

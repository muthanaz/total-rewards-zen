import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Plus, Pencil, Trash2, PiggyBank, CreditCard } from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useEmployeeBudgetItems, DEMO_BUDGET_ITEMS, BudgetItem } from '@/hooks/useEmployeeBudgetItems';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MoneySnapshotSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthlySalary: number;
  isDemo?: boolean;
  isRTL?: boolean;
}

const COMMITMENT_CATEGORIES = [
  'Rent',
  'Loan EMI',
  'Car Payment',
  'School Fees',
  'Utilities',
  'Insurance',
  'Subscriptions',
  'Other',
];

export function MoneySnapshotSheet({ 
  open, 
  onOpenChange, 
  monthlySalary,
  isDemo = false,
  isRTL = false 
}: MoneySnapshotSheetProps) {
  const { 
    commitments, 
    savingsGoal, 
    totalCommitments, 
    savingsAmount,
    addItem, 
    updateItem, 
    deleteItem,
    currentMonth,
    isLoading 
  } = useEmployeeBudgetItems();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<BudgetItem | null>(null);
  const [editSavings, setEditSavings] = useState(false);
  
  // Form state
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [savingsInput, setSavingsInput] = useState('');

  // Use demo data if needed - type as partial budget items for display
  type DisplayItem = { id?: string; category: string; amount: number };
  const displayCommitments: DisplayItem[] = isDemo 
    ? DEMO_BUDGET_ITEMS.filter(i => i.item_type === 'commitment').map((i, idx) => ({ id: `demo-${idx}`, category: i.category, amount: i.amount }))
    : commitments.map(c => ({ id: c.id, category: c.category, amount: c.amount }));
  
  const displaySavings = isDemo
    ? DEMO_BUDGET_ITEMS.find(i => i.item_type === 'savings_goal')?.amount || 0
    : savingsAmount;

  const displayTotalCommitments = isDemo
    ? DEMO_BUDGET_ITEMS.filter(i => i.item_type === 'commitment').reduce((s, i) => s + i.amount, 0)
    : totalCommitments;

  const safeToSpend = monthlySalary - displayTotalCommitments - displaySavings;

  const handleAddCommitment = async () => {
    if (!category || !amount) return;
    
    if (isDemo) {
      toast.info('Demo mode - sign in to save your commitments');
      setAddDialogOpen(false);
      return;
    }

    try {
      await addItem.mutateAsync({
        month: currentMonth,
        item_type: 'commitment',
        category,
        amount: parseFloat(amount),
        source: 'employee_input',
        confidence: 'employee_reported',
        notes: null,
      });
      toast.success('Commitment added');
      setCategory('');
      setAmount('');
      setAddDialogOpen(false);
    } catch (err) {
      toast.error('Failed to add commitment');
    }
  };

  const handleUpdateItem = async () => {
    if (!editItem || !amount) return;

    if (isDemo) {
      toast.info('Demo mode - sign in to update');
      setEditItem(null);
      return;
    }

    try {
      await updateItem.mutateAsync({
        id: editItem.id,
        amount: parseFloat(amount),
        category: category || editItem.category,
      });
      toast.success('Updated');
      setEditItem(null);
      setCategory('');
      setAmount('');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (isDemo) {
      toast.info('Demo mode - sign in to delete');
      return;
    }

    try {
      await deleteItem.mutateAsync(id);
      toast.success('Removed');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const handleSaveSavingsGoal = async () => {
    if (!savingsInput) return;

    if (isDemo) {
      toast.info('Demo mode - sign in to save');
      setEditSavings(false);
      return;
    }

    try {
      if (savingsGoal) {
        await updateItem.mutateAsync({
          id: savingsGoal.id,
          amount: parseFloat(savingsInput),
        });
      } else {
        await addItem.mutateAsync({
          month: currentMonth,
          item_type: 'savings_goal',
          category: 'Savings',
          amount: parseFloat(savingsInput),
          source: 'employee_input',
          confidence: 'employee_reported',
          notes: null,
        });
      }
      toast.success('Savings goal updated');
      setEditSavings(false);
      setSavingsInput('');
    } catch (err) {
      toast.error('Failed to update savings goal');
    }
  };

  const openEditDialog = (item: BudgetItem | { category: string; amount: number }) => {
    if ('id' in item) {
      setEditItem(item);
      setCategory(item.category);
      setAmount(String(item.amount));
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side={isRTL ? 'left' : 'right'} className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <Wallet className="w-5 h-5 text-emerald-600" />
              <SheetTitle>Money Snapshot</SheetTitle>
              {isDemo && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-muted/50">Demo</Badge>
              )}
            </div>
            <SheetDescription className={isRTL ? 'text-right' : ''}>
              {format(new Date(), 'MMMM yyyy')} overview
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Income</p>
                <p className="text-sm font-semibold">{formatCurrencyAED(monthlySalary)}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Commitments</p>
                <p className="text-sm font-semibold text-destructive">−{formatCurrencyAED(displayTotalCommitments)}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Safe to Spend</p>
                <p className={cn('text-sm font-semibold', safeToSpend >= 0 ? 'text-emerald-600' : 'text-destructive')}>
                  {formatCurrencyAED(safeToSpend)}
                </p>
              </div>
            </div>

            {/* Commitments */}
            <div>
              <div className={cn('flex items-center justify-between mb-3', isRTL && 'flex-row-reverse')}>
                <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm">Monthly Commitments</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {displayCommitments.slice(0, 6).map((item) => {
                  const isRealItem = item.id && !item.id.startsWith('demo-');
                  const realItem = isRealItem ? commitments.find(c => c.id === item.id) : null;
                  return (
                    <div 
                      key={item.id}
                      className={cn(
                        'flex items-center justify-between p-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors group',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <span className="text-sm">{item.category}</span>
                      <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                        <span className="text-sm font-medium">{formatCurrencyAED(item.amount)}</span>
                        {!isDemo && realItem && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openEditDialog(realItem)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => handleDeleteItem(realItem.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {displayCommitments.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No commitments added yet
                  </p>
                )}
                {displayCommitments.length > 6 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{displayCommitments.length - 6} more
                  </p>
                )}
              </div>
            </div>

            {/* Savings Goal */}
            <div>
              <div className={cn('flex items-center justify-between mb-3', isRTL && 'flex-row-reverse')}>
                <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <PiggyBank className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm">Savings Goal</h3>
                </div>
                {!editSavings && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => {
                      setSavingsInput(String(displaySavings));
                      setEditSavings(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                )}
              </div>

              {editSavings ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={savingsInput}
                    onChange={(e) => setSavingsInput(e.target.value)}
                    className="h-9"
                  />
                  <Button size="sm" onClick={handleSaveSavingsGoal}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditSavings(false)}>Cancel</Button>
                </div>
              ) : (
                <div className={cn(
                  'flex items-center justify-between p-3 rounded-lg bg-amber-500/10',
                  isRTL && 'flex-row-reverse'
                )}>
                  <span className="text-sm">Monthly Savings</span>
                  <span className="text-sm font-semibold text-amber-600">
                    {formatCurrencyAED(displaySavings)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Commitment Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Add Commitment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {COMMITMENT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (AED)</Label>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCommitment} disabled={!category || !amount}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Commitment Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Edit Commitment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {COMMITMENT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (AED)</Label>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleUpdateItem} disabled={!amount}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Recovery Batch Review Modal
 * 
 * Displays a list of affected employees for a cost recovery opportunity
 * with checkboxes for selection and actions to draft emails or export.
 */

import { useState, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Mail, 
  Download, 
  Users, 
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatCurrencyAED, cn } from '@/lib/utils';
import { CostEfficiencyItem, AffectedEmployee } from './types';
import { toast } from 'sonner';

interface RecoveryBatchReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: CostEfficiencyItem | null;
}

export function RecoveryBatchReviewModal({ 
  open, 
  onOpenChange, 
  item 
}: RecoveryBatchReviewModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const employees = item?.affectedEmployees ?? [];
  const allSelected = employees.length > 0 && selectedIds.size === employees.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < employees.length;
  
  // Calculate selected total
  const selectedTotal = useMemo(() => {
    return employees
      .filter(e => selectedIds.has(e.id))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [employees, selectedIds]);
  
  // Reset selection when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Select all by default when opening
      setSelectedIds(new Set(employees.map(e => e.id)));
    } else {
      setSelectedIds(new Set());
    }
    onOpenChange(newOpen);
  };
  
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(employees.map(e => e.id)));
    }
  };
  
  const toggleEmployee = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };
  
  const handleDraftEmails = () => {
    toast.success(`Drafting recovery emails for ${selectedIds.size} employees`, {
      description: `Total recovery amount: ${formatCurrencyAED(selectedTotal)}`,
    });
    onOpenChange(false);
  };
  
  const handleExportExcel = () => {
    toast.success('Exporting to Excel...', {
      description: `${selectedIds.size} employees selected for export`,
    });
  };
  
  if (!item) return null;
  
  // Get issue title for header
  const getHeaderTitle = () => {
    switch (item.issueType) {
      case 'duplicate_coverage':
        return `Review Duplicate Coverage (${employees.length} Employees)`;
      case 'vendor_overcharge':
        return `Review ${item.vendorName ?? 'Vendor'} Overcharge (${employees.length} Employees)`;
      case 'unclaimed_cashout':
        return `Review Unclaimed Cash-out (${employees.length} Employees)`;
      default:
        return `Review Recovery Batch (${employees.length} Employees)`;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {getHeaderTitle()}
          </DialogTitle>
          <DialogDescription>
            Select employees to include in the recovery batch. 
            {item.vendorName && (
              <span className="font-medium text-foreground"> Vendor: {item.vendorName}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {/* Summary Stats */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-sm">
              <span className="font-semibold">{selectedIds.size}</span> of {employees.length} selected
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="text-sm">
            Recovery Amount: <span className="font-bold text-success">{formatCurrencyAED(selectedTotal)}</span>
          </div>
        </div>
        
        {/* Employee List */}
        <ScrollArea className="flex-1 min-h-0 max-h-[400px] rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow className="bg-muted/30">
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={allSelected}
                    ref={(el) => {
                      if (el) {
                        (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected;
                      }
                    }}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow 
                  key={employee.id}
                  className={cn(
                    "cursor-pointer hover:bg-muted/30",
                    selectedIds.has(employee.id) && "bg-primary/5"
                  )}
                  onClick={() => toggleEmployee(employee.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedIds.has(employee.id)}
                      onCheckedChange={() => toggleEmployee(employee.id)}
                      aria-label={`Select ${employee.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">
                    {employee.employeeId}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {employee.department}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrencyAED(employee.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        
        {/* Warning if none selected */}
        {selectedIds.size === 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm">
            <AlertCircle className="h-4 w-4" />
            Select at least one employee to proceed
          </div>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={handleExportExcel}
            disabled={selectedIds.size === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
          <Button 
            onClick={handleDraftEmails}
            disabled={selectedIds.size === 0}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Draft Recovery Emails
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

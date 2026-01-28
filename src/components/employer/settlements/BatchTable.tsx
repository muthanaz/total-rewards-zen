import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  FileOutput,
  CheckCircle2,
  MoreHorizontal,
  Download,
  FileSpreadsheet,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { SettlementBatch, BatchStatus, ReconciliationStatus } from './types';
import { format } from 'date-fns';

interface BatchTableProps {
  batches: SettlementBatch[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onExport: (batch: SettlementBatch) => void;
  onMarkPaid: (batch: SettlementBatch) => void;
  onRunReconciliation: (batch: SettlementBatch) => void;
  onViewDetails: (batch: SettlementBatch) => void;
}

const statusConfig: Record<BatchStatus, { label: string; icon: typeof Clock; color: string }> = {
  draft: { label: 'Draft', icon: Clock, color: 'bg-muted text-muted-foreground' },
  ready: { label: 'Ready', icon: CheckCircle2, color: 'bg-success/10 text-success border-success/30' },
  exported: { label: 'Exported', icon: FileOutput, color: 'bg-primary/10 text-primary border-primary/30' },
  paid: { label: 'Paid', icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
};

const reconciliationConfig: Record<ReconciliationStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
  pending: { label: 'Pending', icon: HelpCircle, color: 'text-muted-foreground' },
  matched: { label: 'Matched', icon: CheckCircle, color: 'text-success' },
  partial: { label: 'Partial', icon: AlertCircle, color: 'text-warning' },
  unmatched: { label: 'Unmatched', icon: AlertTriangle, color: 'text-destructive' },
};

export function BatchTable({
  batches,
  selectedIds,
  onSelectionChange,
  onExport,
  onMarkPaid,
  onRunReconciliation,
  onViewDetails,
}: BatchTableProps) {
  const allSelected = batches.length > 0 && selectedIds.length === batches.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < batches.length;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(batches.map(b => b.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                aria-label="Select all"
                className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
              />
            </TableHead>
            <TableHead>Batch ID</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Claims</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reconciliation</TableHead>
            <TableHead>Bank Ref</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.map((batch) => {
            const status = statusConfig[batch.status];
            const StatusIcon = status.icon;
            const recon = reconciliationConfig[batch.reconciliation.status];
            const ReconIcon = recon.icon;
            const hasExceptions = batch.exceptions.length > 0;

            return (
              <TableRow 
                key={batch.id}
                className={cn(
                  'hover:bg-muted/30',
                  selectedIds.includes(batch.id) && 'bg-primary/5'
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(batch.id)}
                    onCheckedChange={() => toggleOne(batch.id)}
                    aria-label={`Select ${batch.batchRef}`}
                  />
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => onViewDetails(batch)}
                    className="font-mono text-sm font-medium hover:text-primary hover:underline"
                  >
                    {batch.batchRef}
                  </button>
                </TableCell>
                <TableCell className="text-sm">{batch.period}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(batch.createdAt), 'dd MMM yyyy')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {batch.createdBy.name}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {batch.claimsCount}
                </TableCell>
                <TableCell className="text-right">
                  <span className="tabular-nums font-semibold">
                    {formatCurrencyAED(batch.totalAED)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('text-xs gap-1', status.color)}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn('flex items-center gap-1 text-xs font-medium', recon.color)}>
                      <ReconIcon className="w-3.5 h-3.5" />
                      {recon.label}
                    </div>
                    {hasExceptions && (
                      <Badge variant="destructive" className="text-[10px] px-1 py-0">
                        {batch.exceptions.length}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {batch.bankReference ? (
                    <span className="font-mono text-xs text-muted-foreground">
                      {batch.bankReference}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(batch)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {batch.status === 'ready' && (
                        <DropdownMenuItem onClick={() => onExport(batch)}>
                          <Download className="w-4 h-4 mr-2" />
                          Export Batch
                        </DropdownMenuItem>
                      )}
                      {batch.exportArtifactUrl && (
                        <DropdownMenuItem>
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Download Export File
                        </DropdownMenuItem>
                      )}
                      {batch.status === 'exported' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onMarkPaid(batch)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRunReconciliation(batch)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Run Reconciliation
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

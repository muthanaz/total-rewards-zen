/**
 * Generate Executive Brief Button
 * 
 * Opens a report preview dialog that will allow PDF export
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { format } from 'date-fns';

export interface ExecBriefData {
  ytdSpend: number;
  projectedYearEnd: number;
  budgetVariance: number;
  utilizationRate: number;
  budgetLeakage: number;
  recoveryPotential: number;
  slaCompliance: number;
  pendingActions: number;
}

interface GenerateExecBriefButtonProps {
  data: ExecBriefData;
  className?: string;
}

export function GenerateExecBriefButton({ 
  data, 
  className 
}: GenerateExecBriefButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportPDF = async () => {
    setIsGenerating(true);
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGenerating(false);
    // In production, this would trigger actual PDF download
    alert('PDF export will be available in a future update');
  };

  const today = new Date();
  const isOverBudget = data.budgetVariance > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <FileText className="w-4 h-4" />
          Generate Executive Brief
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Executive Brief Preview
          </DialogTitle>
          <DialogDescription>
            Summary report for {format(today, 'MMMM yyyy')}
          </DialogDescription>
        </DialogHeader>

        {/* Report Preview */}
        <div className="mt-4 space-y-6">
          {/* Header */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Benefits Investment Report</h3>
              <Badge variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                {format(today, 'dd MMM yyyy')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Monthly executive summary of benefits portfolio performance
            </p>
          </div>

          <Separator />

          {/* Key Metrics Section */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Financial Summary
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/20 border">
                <p className="text-xs text-muted-foreground mb-1">YTD Spend</p>
                <p className="text-lg font-bold tabular-nums">
                  {formatCurrencyAED(data.ytdSpend)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border">
                <p className="text-xs text-muted-foreground mb-1">Projected Year-End</p>
                <p className="text-lg font-bold tabular-nums">
                  {formatCurrencyAED(data.projectedYearEnd)}
                </p>
              </div>
              <div className={cn(
                'p-3 rounded-lg border',
                isOverBudget ? 'bg-destructive/5 border-destructive/20' : 'bg-success/5 border-success/20'
              )}>
                <p className="text-xs text-muted-foreground mb-1">Budget Variance</p>
                <p className={cn(
                  'text-lg font-bold tabular-nums',
                  isOverBudget ? 'text-destructive' : 'text-success'
                )}>
                  {isOverBudget ? '+' : ''}{formatCurrencyAED(data.budgetVariance)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border">
                <p className="text-xs text-muted-foreground mb-1">Utilization Rate</p>
                <p className="text-lg font-bold tabular-nums">
                  {data.utilizationRate}%
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Optimization Section */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Optimization Opportunities
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-xs text-muted-foreground mb-1">Budget Leakage</p>
                <p className="text-lg font-bold tabular-nums text-warning">
                  {formatCurrencyAED(data.budgetLeakage)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                <p className="text-xs text-muted-foreground mb-1">Recovery Potential</p>
                <p className="text-lg font-bold tabular-nums text-success">
                  {formatCurrencyAED(data.recoveryPotential)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Operations Section */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              Operations Status
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/20 border">
                <p className="text-xs text-muted-foreground mb-1">SLA Compliance</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold tabular-nums">
                    {data.slaCompliance}%
                  </p>
                  <CheckCircle2 className={cn(
                    'w-4 h-4',
                    data.slaCompliance >= 90 ? 'text-success' : 'text-warning'
                  )} />
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border">
                <p className="text-xs text-muted-foreground mb-1">Pending Actions</p>
                <p className="text-lg font-bold tabular-nums">
                  {data.pendingActions}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Export Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button onClick={handleExportPDF} disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

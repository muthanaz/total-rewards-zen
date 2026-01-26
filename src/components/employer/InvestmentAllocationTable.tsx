/**
 * Investment Allocation Table
 * 
 * Shows top 6 categories + "Other" with:
 * - Category name
 * - AED amount
 * - % of total
 * - Utilization %
 */

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';

interface AllocationRow {
  category: string;
  amount: number;
  percentOfTotal: number;
  utilization: number;
}

interface InvestmentAllocationTableProps {
  data: AllocationRow[];
  className?: string;
}

export function InvestmentAllocationTable({ data, className }: InvestmentAllocationTableProps) {
  // Take top 6, aggregate rest as "Other"
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);
  const top6 = sortedData.slice(0, 6);
  const rest = sortedData.slice(6);
  
  const displayData = rest.length > 0
    ? [
        ...top6,
        {
          category: 'Other',
          amount: rest.reduce((sum, r) => sum + r.amount, 0),
          percentOfTotal: rest.reduce((sum, r) => sum + r.percentOfTotal, 0),
          utilization: Math.round(rest.reduce((sum, r) => sum + r.utilization, 0) / rest.length),
        },
      ]
    : top6;

  return (
    <div className={cn('rounded-lg border', className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-medium">Category</TableHead>
            <TableHead className="text-right font-medium">
              <div className="flex items-center justify-end gap-1">
                AED
                <InfoTooltip 
                  formula="SUM(benefit value per category)"
                  dataSource="benefit_entitlements"
                />
              </div>
            </TableHead>
            <TableHead className="text-right font-medium">
              <div className="flex items-center justify-end gap-1">
                % of total
                <InfoTooltip 
                  formula="(Category Amount / Total Investment) × 100"
                  dataSource="Calculated"
                />
              </div>
            </TableHead>
            <TableHead className="font-medium">
              <div className="flex items-center gap-1">
                Utilization
                <InfoTooltip 
                  formula="(Claimed / Entitled) × 100"
                  dataSource="requests + benefit_entitlements"
                />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((row, index) => (
            <TableRow key={row.category} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
              <TableCell className="font-medium">{row.category}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrencyAED(row.amount)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPercent(row.percentOfTotal)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={row.utilization} 
                    className="h-2 w-16"
                  />
                  <span className={cn(
                    'text-xs tabular-nums font-medium',
                    row.utilization >= 70 ? 'text-success' : 
                    row.utilization >= 50 ? 'text-warning' : 'text-destructive'
                  )}>
                    {row.utilization}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

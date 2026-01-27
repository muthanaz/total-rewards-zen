/**
 * Cost Efficiency Tab - The CFO View
 * 
 * Focus: Hard financial waste
 * Content: Duplicate coverage, Vendor overcharges, Unclaimed "Cash-out" options
 * Action: "Initiate Recovery"
 * Value Proposition: "Immediate Cash Impact"
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Wallet, 
  AlertTriangle, 
  ArrowRight,
  CircleDollarSign,
  Layers,
  Receipt,
  Coins,
} from 'lucide-react';
import { formatCurrencyAED, cn } from '@/lib/utils';
import { CostEfficiencyItem } from './types';

interface CostEfficiencyTabProps {
  items: CostEfficiencyItem[];
  totalRecoverable: number;
  onInitiateRecovery: (item: CostEfficiencyItem) => void;
}

const issueTypeConfig = {
  duplicate_coverage: { 
    label: 'Duplicate Coverage', 
    icon: Layers, 
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  vendor_overcharge: { 
    label: 'Vendor Overcharge', 
    icon: Receipt, 
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  unclaimed_cashout: { 
    label: 'Unclaimed Cash-out', 
    icon: Coins, 
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
};

const confidenceBadgeStyles = {
  high: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function CostEfficiencyTab({ 
  items, 
  totalRecoverable, 
  onInitiateRecovery 
}: CostEfficiencyTabProps) {
  // Group items by issue type
  const duplicateCoverage = items.filter(i => i.issueType === 'duplicate_coverage');
  const vendorOvercharges = items.filter(i => i.issueType === 'vendor_overcharge');
  const unclaimedCashout = items.filter(i => i.issueType === 'unclaimed_cashout');

  return (
    <div className="space-y-6">
      {/* Value Proposition Banner */}
      <div className="p-4 rounded-lg bg-success/5 border border-success/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-success/10">
              <CircleDollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="font-semibold text-success">Immediate Cash Impact</p>
              <p className="text-sm text-muted-foreground">
                Direct recovery of misallocated or wasted funds back to budget
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-success">
              {formatCurrencyAED(totalRecoverable, { abbreviate: true })}
            </p>
            <p className="text-xs text-muted-foreground">Total Recoverable</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-warning" />
              <span className="font-medium text-sm">Duplicate Coverage</span>
            </div>
            <p className="text-xl font-bold">
              {formatCurrencyAED(duplicateCoverage.reduce((s, i) => s + i.recoveryAmount, 0), { abbreviate: true })}
            </p>
            <p className="text-xs text-muted-foreground">{duplicateCoverage.length} instances found</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-4 w-4 text-destructive" />
              <span className="font-medium text-sm">Vendor Overcharges</span>
            </div>
            <p className="text-xl font-bold">
              {formatCurrencyAED(vendorOvercharges.reduce((s, i) => s + i.recoveryAmount, 0), { abbreviate: true })}
            </p>
            <p className="text-xs text-muted-foreground">
              {vendorOvercharges.length} vendor{vendorOvercharges.length !== 1 ? 's' : ''}: {vendorOvercharges.map(v => v.vendorName || 'Unknown').join(', ')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-info" />
              <span className="font-medium text-sm">Unclaimed Cash-out</span>
            </div>
            <p className="text-xl font-bold">
              {formatCurrencyAED(unclaimedCashout.reduce((s, i) => s + i.recoveryAmount, 0), { abbreviate: true })}
            </p>
            <p className="text-xs text-muted-foreground">{unclaimedCashout.length} instances found</p>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                ROI & Savings Opportunities
                <InfoTooltip 
                  formula="Identified waste × Confidence Factor" 
                  dataSource="Policy rules + Claims analysis" 
                />
              </CardTitle>
              <CardDescription>
                Financial inefficiencies identified for immediate recovery action
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Wallet className="h-3 w-3" />
              {items.length} opportunities
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>No ROI & Savings opportunities identified</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Category</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Recoverable</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const typeConfig = issueTypeConfig[item.issueType];
                    const TypeIcon = typeConfig.icon;

                    return (
                      <TableRow key={item.id} className="hover:bg-muted/30 group">
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{item.issue}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("gap-1", typeConfig.bgColor, typeConfig.color)}>
                            <TypeIcon className="h-3 w-3" />
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-success">
                          {formatCurrencyAED(item.recoveryAmount, { abbreviate: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", confidenceBadgeStyles[item.confidence])}>
                            {item.confidence}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onInitiateRecovery(item)}
                            className="gap-1 opacity-70 group-hover:opacity-100"
                          >
                            Initiate Recovery
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Value Activation Tab - The CHRO View
 * 
 * Focus: Benefits that are paid for/available but ignored (Low Adoption)
 * Content: List benefits with <20% Adoption Rate
 * Action: "Launch Awareness Campaign"
 * Value Proposition: "Improve Benefit Awareness" - Ensuring employees know what they are entitled to
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Users, 
  AlertTriangle, 
  ArrowRight,
  Megaphone,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { ValueActivationItem } from './types';

interface ValueActivationTabProps {
  items: ValueActivationItem[];
  totalUnutilized: number;
  onLaunchCampaign: (item: ValueActivationItem) => void;
}

const awarenessConfig = {
  low: { label: 'Low Awareness', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  medium: { label: 'Medium Awareness', color: 'text-warning', bgColor: 'bg-warning/10' },
  high: { label: 'High Awareness', color: 'text-success', bgColor: 'bg-success/10' },
};

export function ValueActivationTab({ 
  items, 
  totalUnutilized, 
  onLaunchCampaign 
}: ValueActivationTabProps) {
  // Calculate aggregate stats
  const avgAdoption = items.length > 0 
    ? items.reduce((sum, i) => sum + i.adoptionRate, 0) / items.length 
    : 0;
  const totalEligible = items.reduce((sum, i) => sum + i.eligibleCount, 0);
  const totalClaimants = items.reduce((sum, i) => sum + i.claimantCount, 0);

  return (
    <div className="space-y-6">
      {/* Value Proposition Banner */}
      <div className="p-4 rounded-lg bg-info/5 border border-info/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-info/10">
              <Eye className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="font-semibold text-info">Improve Benefit Awareness</p>
              <p className="text-sm text-muted-foreground">
                Ensuring employees know what they are entitled to and how to access it
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-info">
              {formatCurrencyAED(totalUnutilized, { abbreviate: true })}
            </p>
            <p className="text-xs text-muted-foreground">Value Available but Unclaimed</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Benefits Under 20% Adoption</p>
            <p className="text-2xl font-bold">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Average Adoption Rate</p>
            <p className="text-2xl font-bold text-warning">{formatPercent(avgAdoption)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Eligible Employees</p>
            <p className="text-2xl font-bold">{totalEligible}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Currently Claiming</p>
            <p className="text-2xl font-bold">{totalClaimants}</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Adoption Benefits Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Low-Adoption Benefits
                <InfoTooltip 
                  formula="(Employees with ≥1 claim / Eligible Employees) × 100" 
                  dataSource="benefit_entitlements + requests" 
                />
              </CardTitle>
              <CardDescription>
                Benefits with less than 20% employee participation - awareness campaigns recommended
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {items.length} benefits need attention
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>All benefits have healthy adoption rates (&gt;20%)</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Benefit</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Adoption Rate</TableHead>
                    <TableHead className="text-right">Participation</TableHead>
                    <TableHead className="text-right">Unutilized Value</TableHead>
                    <TableHead>Awareness</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const awareness = awarenessConfig[item.awareness];

                    return (
                      <TableRow key={item.id} className="hover:bg-muted/30 group">
                        <TableCell className="font-medium">{item.benefitName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={cn(
                              item.adoptionRate >= 20 ? 'text-success' :
                              item.adoptionRate >= 10 ? 'text-warning' :
                              'text-destructive'
                            )}>
                              {formatPercent(item.adoptionRate)}
                            </span>
                            <Progress 
                              value={item.adoptionRate} 
                              className="h-1.5 w-16" 
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm">
                            {item.claimantCount} / {item.eligibleCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium text-info">
                          {formatCurrencyAED(item.unutilizedValue, { abbreviate: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("gap-1", awareness.bgColor, awareness.color)}>
                            {awareness.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onLaunchCampaign(item)}
                            className="gap-1 opacity-70 group-hover:opacity-100"
                          >
                            <Megaphone className="h-3 w-3" />
                            Launch Campaign
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

      {/* Insight Note */}
      <Card className="border-info/20 bg-info/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Megaphone className="h-5 w-5 text-info mt-0.5" />
            <div>
              <p className="font-medium text-sm">Campaign Recommendation</p>
              <p className="text-sm text-muted-foreground mt-1">
                Benefits with low awareness typically see a <strong>35-50% adoption increase</strong> within 
                6 weeks of targeted communication campaigns. Focus on the top 3 highest-value benefits first.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

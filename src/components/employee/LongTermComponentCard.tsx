/**
 * LongTermComponentCard
 * 
 * Card for displaying individual long-term financial components:
 * EOSB, Annual Bonus, Pension/Savings, Equity/Options
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon, ExternalLink } from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export interface ComponentDataRow {
  label: string;
  value: string | number | null;
  tooltip?: string;
}

export interface LongTermComponentCardProps {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  rows: ComponentDataRow[];
  detailsLink?: string;
  status?: 'active' | 'pending' | 'not_eligible';
}

export function LongTermComponentCard({
  title,
  icon: Icon,
  iconClassName,
  rows,
  detailsLink,
  status = 'active',
}: LongTermComponentCardProps) {
  const formatValue = (value: string | number | null): React.ReactNode => {
    if (value === null || value === undefined || value === '') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground cursor-help">—</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Definition pending</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    if (typeof value === 'number') {
      return formatCurrencyAED(value, { abbreviate: false });
    }
    return value;
  };

  const statusBadge = {
    active: { label: 'Active', className: 'bg-success/10 text-success border-0' },
    pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-0' },
    not_eligible: { label: 'Not Eligible', className: 'bg-muted text-muted-foreground border-0' },
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <div className={`p-1.5 rounded-md bg-primary/10 ${iconClassName}`}>
              <Icon className="w-4 h-4 text-primary" />
            </div>
            {title}
          </CardTitle>
          <Badge className={statusBadge[status].className}>
            {statusBadge[status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Key-value rows */}
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium tabular-nums">{formatValue(row.value)}</span>
            </div>
          ))}
        </div>

        {/* View details link */}
        {detailsLink && (
          <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
            <Link to={detailsLink} className="gap-1.5">
              View details
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

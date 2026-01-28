/**
 * Executive Risks & Exceptions Panel
 * 
 * Shows:
 * - SLA breach risk indicator + link to Ops Hub filtered view
 * - Settlement backlog risk + link to Settlements
 * - Policy compliance trend + link to Data Quality & Controls
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldAlert, 
  Clock, 
  Banknote, 
  FileWarning,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';

export interface RiskIndicator {
  id: string;
  type: 'sla_breach' | 'settlement_backlog' | 'policy_compliance';
  label: string;
  value: number | string;
  status: 'critical' | 'warning' | 'healthy';
  trend?: number;
  trendLabel?: string;
  linkTo: string;
  linkLabel: string;
}

interface ExecRisksPanelProps {
  risks: RiskIndicator[];
  className?: string;
}

const RISK_CONFIG = {
  sla_breach: {
    icon: Clock,
    title: 'SLA Breach Risk',
    healthyLabel: 'All on track',
  },
  settlement_backlog: {
    icon: Banknote,
    title: 'Settlement Backlog',
    healthyLabel: 'No backlog',
  },
  policy_compliance: {
    icon: FileWarning,
    title: 'Policy Compliance',
    healthyLabel: 'Compliant',
  },
};

const STATUS_STYLES = {
  critical: {
    badge: 'bg-destructive/10 text-destructive border-destructive/30',
    icon: 'text-destructive',
    bg: 'bg-destructive/5 border-destructive/20',
  },
  warning: {
    badge: 'bg-warning/10 text-warning border-warning/30',
    icon: 'text-warning',
    bg: 'bg-warning/5 border-warning/20',
  },
  healthy: {
    badge: 'bg-success/10 text-success border-success/30',
    icon: 'text-success',
    bg: 'bg-success/5 border-success/20',
  },
};

export function ExecRisksPanel({ risks, className }: ExecRisksPanelProps) {
  // Default risk indicators if none provided
  const defaultRisks: RiskIndicator[] = [
    {
      id: 'sla',
      type: 'sla_breach',
      label: 'Claims at SLA Risk',
      value: 8,
      status: 'warning',
      trend: -15,
      trendLabel: 'vs last week',
      linkTo: '/employer/ops?tab=sla_risk',
      linkLabel: 'View SLA Breaches',
    },
    {
      id: 'settlements',
      type: 'settlement_backlog',
      label: 'Pending Export',
      value: formatCurrencyAED(125000, { abbreviate: true }),
      status: 'warning',
      trend: 12,
      trendLabel: 'vs last week',
      linkTo: '/employer/settlements',
      linkLabel: 'View Settlements',
    },
    {
      id: 'compliance',
      type: 'policy_compliance',
      label: 'Compliance Rate',
      value: '94%',
      status: 'healthy',
      trend: 2,
      trendLabel: 'vs last month',
      linkTo: '/employer/data-quality',
      linkLabel: 'View Data Quality',
    },
  ];

  const displayRisks = risks.length > 0 ? risks : defaultRisks;

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-destructive" />
            Risks & Exceptions
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {displayRisks.filter(r => r.status !== 'healthy').length} items need attention
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayRisks.map((risk) => {
            const config = RISK_CONFIG[risk.type];
            const statusStyle = STATUS_STYLES[risk.status];
            const Icon = config.icon;
            const TrendIcon = risk.trend && risk.trend > 0 ? TrendingUp : TrendingDown;
            const trendIsGood = risk.type === 'policy_compliance' 
              ? (risk.trend && risk.trend > 0)
              : (risk.trend && risk.trend < 0);

            return (
              <div 
                key={risk.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border',
                  statusStyle.bg
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                  risk.status === 'healthy' ? 'bg-success/10' : 
                  risk.status === 'critical' ? 'bg-destructive/10' : 'bg-warning/10'
                )}>
                  <Icon className={cn('w-5 h-5', statusStyle.icon)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{risk.label}</p>
                    <Badge 
                      variant="outline" 
                      className={cn('text-[10px]', statusStyle.badge)}
                    >
                      {risk.status === 'healthy' ? 'Healthy' : 
                       risk.status === 'critical' ? 'Critical' : 'Attention'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground tabular-nums">
                      {risk.value}
                    </span>
                    {risk.trend !== undefined && (
                      <div className={cn(
                        'flex items-center gap-1',
                        trendIsGood ? 'text-success' : 'text-destructive'
                      )}>
                        <TrendIcon className="w-3 h-3" />
                        <span className="tabular-nums">
                          {risk.trend > 0 ? '+' : ''}{risk.trend}%
                        </span>
                        {risk.trendLabel && (
                          <span className="text-muted-foreground">{risk.trendLabel}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <Link to={risk.linkTo}>
                  <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                    {risk.linkLabel}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

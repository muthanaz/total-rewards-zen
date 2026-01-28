/**
 * Data Readiness Score Card
 * 
 * Executive-level view of data quality with score breakdown.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DataReadinessScore } from './types';

interface DataReadinessScoreCardProps {
  score: DataReadinessScore;
  className?: string;
}

const getDimensionConfig = (value: number) => {
  if (value >= 90) return { color: 'bg-success', textColor: 'text-success', label: 'Excellent' };
  if (value >= 75) return { color: 'bg-primary', textColor: 'text-primary', label: 'Good' };
  if (value >= 60) return { color: 'bg-warning', textColor: 'text-warning', label: 'Fair' };
  return { color: 'bg-destructive', textColor: 'text-destructive', label: 'Poor' };
};

const getOverallConfig = (value: number) => {
  if (value >= 90) return { 
    color: 'text-success', 
    bgColor: 'bg-success/10', 
    borderColor: 'border-success/30',
    label: 'Excellent',
    description: 'Data quality meets executive reporting standards'
  };
  if (value >= 75) return { 
    color: 'text-primary', 
    bgColor: 'bg-primary/10', 
    borderColor: 'border-primary/30',
    label: 'Good',
    description: 'Minor gaps exist but dashboards are reliable'
  };
  if (value >= 60) return { 
    color: 'text-warning', 
    bgColor: 'bg-warning/10', 
    borderColor: 'border-warning/30',
    label: 'Fair',
    description: 'Some KPIs may show estimated values'
  };
  return { 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10', 
    borderColor: 'border-destructive/30',
    label: 'Needs Attention',
    description: 'Data gaps affecting dashboard accuracy'
  };
};

export function DataReadinessScoreCard({ score, className }: DataReadinessScoreCardProps) {
  const overallConfig = getOverallConfig(score.overall);
  
  const dimensions = [
    { key: 'completeness', label: 'Completeness', value: score.completeness, tooltip: 'All required fields populated' },
    { key: 'accuracy', label: 'Accuracy', value: score.accuracy, tooltip: 'Data values pass validation rules' },
    { key: 'timeliness', label: 'Timeliness', value: score.timeliness, tooltip: 'Data synced within SLA windows' },
    { key: 'consistency', label: 'Consistency', value: score.consistency, tooltip: 'Cross-source data alignment' },
  ];

  const TrendIcon = score.trend === 'improving' 
    ? TrendingUp 
    : score.trend === 'declining' 
      ? TrendingDown 
      : Minus;

  const trendColor = score.trend === 'improving' 
    ? 'text-success' 
    : score.trend === 'declining' 
      ? 'text-destructive' 
      : 'text-muted-foreground';

  return (
    <Card className={cn('card-elevated', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-primary" />
          Data Readiness Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Score */}
        <div className={cn(
          'flex items-center justify-between p-4 rounded-xl mb-6',
          overallConfig.bgColor,
          'border',
          overallConfig.borderColor
        )}>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={cn('text-4xl font-bold tabular-nums', overallConfig.color)}>
                {score.overall}
              </span>
              <span className="text-muted-foreground">/100</span>
            </div>
            <Badge variant="outline" className={cn('mt-1', overallConfig.bgColor, overallConfig.color, 'border-0')}>
              {overallConfig.label}
            </Badge>
          </div>
          <div className="text-right">
            <div className={cn('flex items-center gap-1', trendColor)}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium capitalize">{score.trend}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-[150px]">
              {overallConfig.description}
            </p>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div className="space-y-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Quality Dimensions
          </p>
          {dimensions.map((dim) => {
            const dimConfig = getDimensionConfig(dim.value);
            return (
              <div key={dim.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dim.label}</span>
                  <span className={cn('text-sm font-bold tabular-nums', dimConfig.textColor)}>
                    {dim.value}%
                  </span>
                </div>
                <Progress 
                  value={dim.value} 
                  className="h-2"
                />
              </div>
            );
          })}
        </div>

        {/* Lowest Dimension Callout */}
        {(() => {
          const lowest = dimensions.reduce((min, d) => d.value < min.value ? d : min);
          if (lowest.value < 80) {
            return (
              <div className="mt-4 p-3 rounded-lg border border-warning/20 bg-warning/5 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">Improve {lowest.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {lowest.label} at {lowest.value}% is impacting overall readiness.
                  </p>
                </div>
              </div>
            );
          }
          return null;
        })()}
      </CardContent>
    </Card>
  );
}

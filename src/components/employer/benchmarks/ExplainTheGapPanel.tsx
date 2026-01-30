/**
 * Explain the Gap Panel
 * 
 * Shows top 3 drivers of benchmark gap with actionable CTAs.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  DollarSign,
  Megaphone,
  Settings,
  ArrowRight,
  Lightbulb,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BenchmarkMetric, GapDriver } from './types';
import { getGapDriversForMetric } from './mockData';

interface ExplainTheGapPanelProps {
  metric: BenchmarkMetric;
  onClose?: () => void;
}

const actionTypeConfig = {
  policy: { icon: FileText, label: 'Policy', color: 'text-accent' },
  spend: { icon: DollarSign, label: 'Spend', color: 'text-success' },
  operational: { icon: Settings, label: 'Operations', color: 'text-warning' },
  communication: { icon: Megaphone, label: 'Communication', color: 'text-info' },
};

const impactConfig = {
  high: { label: 'High Impact', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  medium: { label: 'Medium Impact', className: 'bg-warning/10 text-warning border-warning/30' },
  low: { label: 'Low Impact', className: 'bg-muted text-muted-foreground border-border' },
};

export function ExplainTheGapPanel({ metric, onClose }: ExplainTheGapPanelProps) {
  const navigate = useNavigate();
  const drivers = getGapDriversForMetric(metric.key);
  
  const isAboveBenchmark = metric.yourPercentile > 50;
  const gapDirection = isAboveBenchmark ? 'above' : 'below';
  const gapPercentile = Math.abs(metric.yourPercentile - 50);

  const handleOpenSpendForecast = () => {
    navigate('/employer/spend');
  };

  const handleOpenPolicy = () => {
    navigate('/employer/policies');
  };

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-accent" />
              Explain the Gap: {metric.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Your position:</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px]",
                  isAboveBenchmark ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'
                )}
              >
                {isAboveBenchmark ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                P{metric.yourPercentile} ({gapPercentile} percentiles {gapDirection} median)
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top Drivers */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Top 3 Contributing Drivers
          </h4>
          
          {drivers.slice(0, 3).map((driver, index) => {
            const ActionIcon = actionTypeConfig[driver.actionType].icon;
            
            return (
              <div 
                key={driver.id}
                className="p-3 rounded-lg bg-background border border-border/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                    <ActionIcon className={cn("h-4 w-4", actionTypeConfig[driver.actionType].color)} />
                    <span className="text-sm font-medium">{driver.name}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn("text-[10px]", impactConfig[driver.impact].className)}
                  >
                    {impactConfig[driver.impact].label}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {driver.explanation}
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Contribution:</span>
                  <Progress value={driver.contribution} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium tabular-nums">{driver.contribution}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          {/* Primary CTA for below-median metrics */}
          {!isAboveBenchmark && (
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={() => navigate(`/employer/actions?create=true&source=benchmarks&metric_key=${metric.key}`)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Action
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
          <Button 
            variant={isAboveBenchmark ? "default" : "outline"}
            size="sm" 
            className="flex-1"
            onClick={handleOpenSpendForecast}
          >
            <DollarSign className="h-4 w-4 mr-1" />
            View Spend
          </Button>
          <span 
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer underline underline-offset-2"
            onClick={handleOpenPolicy}
          >
            View Policy
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

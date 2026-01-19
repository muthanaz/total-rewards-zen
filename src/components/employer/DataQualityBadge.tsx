import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataQualityBadgeProps {
  confidence: 'high' | 'medium' | 'low';
  lastUpdated?: string;
  dataSources?: string[];
  sampleSize?: number;
  showDetails?: boolean;
  className?: string;
}

export function DataQualityBadge({
  confidence,
  lastUpdated,
  dataSources = [],
  sampleSize,
  showDetails = true,
  className,
}: DataQualityBadgeProps) {
  const configs = {
    high: {
      icon: CheckCircle2,
      label: 'High Confidence',
      className: 'bg-success/10 text-success border-success/20',
      iconClassName: 'text-success',
    },
    medium: {
      icon: AlertTriangle,
      label: 'Medium Confidence',
      className: 'bg-warning/10 text-warning border-warning/20',
      iconClassName: 'text-warning',
    },
    low: {
      icon: AlertCircle,
      label: 'Low Confidence',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      iconClassName: 'text-destructive',
    },
  };

  const config = configs[confidence];
  const Icon = config.icon;

  const formatLastUpdated = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const tooltipContent = (
    <div className="space-y-2 text-xs">
      <div className="font-medium">{config.label}</div>
      {sampleSize && (
        <div className="flex items-center gap-2">
          <Database className="w-3 h-3" />
          <span>Sample size: {sampleSize.toLocaleString()}</span>
        </div>
      )}
      {dataSources.length > 0 && (
        <div>
          <span className="text-muted-foreground">Sources: </span>
          {dataSources.join(', ')}
        </div>
      )}
      {confidence === 'low' && (
        <div className="text-muted-foreground italic">
          More data needed for higher confidence
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant="outline" className={cn("text-[10px] gap-1", config.className)}>
        <Icon className="w-3 h-3" />
        {showDetails ? config.label : null}
      </Badge>
      
      {lastUpdated && (
        <Badge variant="outline" className="text-[10px] gap-1 bg-muted/50 text-muted-foreground border-0">
          <Clock className="w-3 h-3" />
          {formatLastUpdated(lastUpdated)}
        </Badge>
      )}
    </div>
  );
}

// Compact version for KPI cards
export function DataConfidenceIndicator({
  confidence,
  className,
}: {
  confidence: 'high' | 'medium' | 'low';
  className?: string;
}) {
  const colors = {
    high: 'bg-success',
    medium: 'bg-warning',
    low: 'bg-destructive',
  };

  return (
    <div className={cn("flex items-center gap-1", className)} title={`${confidence} confidence`}>
      <div className={cn("w-1.5 h-1.5 rounded-full", colors[confidence])} />
    </div>
  );
}

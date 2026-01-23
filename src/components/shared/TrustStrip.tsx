/**
 * TrustStrip Component
 * 
 * Always-visible horizontal strip showing:
 * - Data confidence level
 * - Last sync timestamp
 * - Data sources
 * 
 * Follows the Metric Evidence System - transparency for all metrics.
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Shield, 
  Clock, 
  Database, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { ConfidenceLevel } from '@/lib/dataProvenance';

export interface TrustStripProps {
  /** Data confidence level */
  confidence: ConfidenceLevel;
  /** Last sync/update timestamp */
  lastSync?: string | Date;
  /** List of data sources */
  dataSources?: string[];
  /** Custom confidence label */
  confidenceLabel?: string;
  /** Show refresh button */
  onRefresh?: () => void;
  /** Is currently refreshing */
  isRefreshing?: boolean;
  /** Compact mode for smaller spaces */
  compact?: boolean;
  className?: string;
}

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, {
  icon: typeof CheckCircle;
  label: string;
  labelAr: string;
  bg: string;
  text: string;
  border: string;
}> = {
  high: {
    icon: CheckCircle,
    label: 'High Confidence',
    labelAr: 'ثقة عالية',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    border: 'border-emerald-500/20',
  },
  medium: {
    icon: Info,
    label: 'Medium Confidence',
    labelAr: 'ثقة متوسطة',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    border: 'border-amber-500/20',
  },
  low: {
    icon: AlertTriangle,
    label: 'Low Confidence',
    labelAr: 'ثقة منخفضة',
    bg: 'bg-red-500/10',
    text: 'text-red-600',
    border: 'border-red-500/20',
  },
};

export function TrustStrip({
  confidence,
  lastSync,
  dataSources = [],
  confidenceLabel,
  onRefresh,
  isRefreshing,
  compact = false,
  className,
}: TrustStripProps) {
  const config = CONFIDENCE_CONFIG[confidence];
  const ConfidenceIcon = config.icon;
  const syncTime = lastSync ? formatRelativeTime(lastSync) : null;
  
  return (
    <div className={cn(
      'flex items-center gap-3 flex-wrap',
      compact ? 'text-xs' : 'text-sm',
      className
    )}>
      {/* Confidence Badge */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                'gap-1.5 cursor-help',
                config.bg, config.text, config.border,
                compact && 'px-2 py-0.5 text-[10px]'
              )}
            >
              <ConfidenceIcon className={cn(compact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
              {confidenceLabel || config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="font-medium mb-1">{config.label}</p>
            <p className="text-xs text-muted-foreground">
              {confidence === 'high' && 'Data is verified and up-to-date from primary sources.'}
              {confidence === 'medium' && 'Data may have some gaps or use estimates for missing fields.'}
              {confidence === 'low' && 'Limited data available. Values may be estimates or outdated.'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Separator */}
      <span className="text-muted-foreground/30">•</span>

      {/* Last Sync */}
      {syncTime && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-muted-foreground cursor-help">
                  <Clock className={cn(compact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
                  <span>{syncTime}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Last data refresh: {syncTime}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-muted-foreground/30">•</span>
        </>
      )}

      {/* Data Sources */}
      {dataSources.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-muted-foreground cursor-help">
                <Database className={cn(compact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
                <span>
                  {dataSources.length === 1 
                    ? dataSources[0] 
                    : `${dataSources.length} sources`
                  }
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium mb-1">Data Sources</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {dataSources.map((source, i) => (
                  <li key={i}>• {source}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <>
          <span className="text-muted-foreground/30">•</span>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              'flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors',
              isRefreshing && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RefreshCw className={cn(
              compact ? 'w-3 h-3' : 'w-3.5 h-3.5',
              isRefreshing && 'animate-spin'
            )} />
            <span className="text-xs">Refresh</span>
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Compact inline version for use in cards
 */
export function TrustStripCompact({
  confidence,
  lastSync,
  className,
}: Pick<TrustStripProps, 'confidence' | 'lastSync' | 'className'>) {
  const config = CONFIDENCE_CONFIG[confidence];
  const ConfidenceIcon = config.icon;
  const syncTime = lastSync ? formatRelativeTime(lastSync) : null;
  
  return (
    <div className={cn('flex items-center gap-2 text-[10px] text-muted-foreground', className)}>
      <ConfidenceIcon className={cn('w-3 h-3', config.text)} />
      <span>{syncTime || 'No sync data'}</span>
    </div>
  );
}

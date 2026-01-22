import { Info, Clock, Database, Calculator } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DataProvenance, DataSourceType, ConfidenceLevel } from '@/lib/dataProvenance';

export interface InfoTooltipProps {
  formula?: string;
  dataSource?: string;
  lastUpdated?: string;
  notes?: string;
  /** New: Full provenance object for Trust Layer */
  provenance?: DataProvenance;
  /** Show confidence indicator */
  showConfidence?: boolean;
  children?: React.ReactNode;
}

const SOURCE_LABELS: Record<DataSourceType, string> = {
  policy: 'Policy Document',
  payroll: 'Payroll System',
  manual: 'Manual Entry',
  estimate: 'Estimated',
  integration: 'External Integration',
  system: 'System Calculated',
};

const CONFIDENCE_STYLES: Record<ConfidenceLevel, { color: string; label: string }> = {
  high: { color: 'bg-emerald-500', label: 'High Confidence' },
  medium: { color: 'bg-amber-500', label: 'Medium Confidence' },
  low: { color: 'bg-red-500', label: 'Low Confidence' },
};

export function InfoTooltip({ 
  formula, 
  dataSource, 
  lastUpdated, 
  notes, 
  provenance,
  showConfidence = true,
  children 
}: InfoTooltipProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="inline-flex items-center justify-center w-4 h-4 ml-1 text-muted-foreground hover:text-foreground transition-colors">
          <Info className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-3 space-y-2" side="top">
        {children ? (
          children
        ) : provenance ? (
          /* New provenance-aware content */
          <>
            {/* Source */}
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm">
                {provenance.source_label || SOURCE_LABELS[provenance.source_type]}
              </span>
            </div>

            {/* Last Updated */}
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm">
                Updated: {formatDate(provenance.last_updated_at)}
              </span>
            </div>

            {/* Confidence */}
            {showConfidence && (
              <div className="flex items-center gap-2">
                <div className={cn(
                  'h-2 w-2 rounded-full shrink-0',
                  CONFIDENCE_STYLES[provenance.confidence_level].color
                )} />
                <span className="text-sm">
                  {CONFIDENCE_STYLES[provenance.confidence_level].label}
                </span>
              </div>
            )}

            {/* Assumptions */}
            {provenance.assumptions && provenance.assumptions.length > 0 && (
              <div className="pt-1 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-1">Assumptions</p>
                <ul className="text-xs space-y-0.5 text-muted-foreground">
                  {provenance.assumptions.map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Estimate warning */}
            {provenance.is_estimate && (
              <div className="pt-1 border-t">
                <p className="text-xs text-muted-foreground italic">
                  Indicative only — subject to verification.
                </p>
              </div>
            )}
          </>
        ) : (
          /* Legacy content */
          <>
            {formula && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Formula</p>
                <p className="text-sm">{formula}</p>
              </div>
            )}
            {dataSource && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Data Source</p>
                <p className="text-sm">{dataSource}</p>
              </div>
            )}
            {lastUpdated && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm">{lastUpdated}</p>
              </div>
            )}
            {notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Notes</p>
                <p className="text-sm">{notes}</p>
              </div>
            )}
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
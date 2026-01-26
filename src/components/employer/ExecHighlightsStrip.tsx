/**
 * Executive Highlights Strip (Simplified)
 * 
 * Single-line data verification status:
 * - High confidence: "✓ Data verified from HR, Finance, Benefits · Updated 2h ago"
 * - Low confidence: "⚠ Data is 3 days old · Some figures may be outdated"
 */

import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

interface ExecHighlightsStripProps {
  confidence: ConfidenceLevel;
  lastSync?: string | Date;
  sourcesCount: number;
  className?: string;
}

const SOURCE_NAMES = ['HR', 'Finance', 'Benefits'];

export function ExecHighlightsStrip({
  confidence,
  lastSync,
  className,
}: ExecHighlightsStripProps) {
  const syncTime = lastSync ? formatRelativeTime(lastSync) : 'Unknown';
  const isStale = confidence === 'low';
  const isPartial = confidence === 'medium';

  // Calculate if data is old (more than 24h)
  const isOld = lastSync 
    ? (new Date().getTime() - new Date(lastSync).getTime()) > 86400000 
    : false;

  if (confidence === 'high' && !isOld) {
    // Verified state - minimal, reassuring
    return (
      <div className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground py-2',
        className
      )}>
        <CheckCircle2 className="w-4 h-4 text-success" />
        <span>
          Data verified from {SOURCE_NAMES.join(', ')} · Updated {syncTime}
        </span>
      </div>
    );
  }

  // Warning state - needs attention
  return (
    <div className={cn(
      'flex items-center justify-between gap-3 py-2 px-3 rounded-lg',
      isStale ? 'bg-destructive/5 border border-destructive/20' : 'bg-warning/5 border border-warning/20',
      className
    )}>
      <div className="flex items-center gap-2 text-sm">
        <AlertTriangle className={cn(
          "w-4 h-4",
          isStale ? 'text-destructive' : 'text-warning'
        )} />
        <span className={isStale ? 'text-destructive' : 'text-warning'}>
          {isStale 
            ? `Limited data · Updated ${syncTime}` 
            : `Partial data from some sources · Updated ${syncTime}`
          }
        </span>
      </div>
      <Link 
        to="/employer/integrations"
        className="text-sm text-primary hover:underline flex items-center gap-1 shrink-0"
      >
        View issues
        <ExternalLink className="w-3 h-3" />
      </Link>
    </div>
  );
}

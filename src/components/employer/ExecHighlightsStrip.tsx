/**
 * Executive Highlights Strip
 * 
 * Single row below header showing:
 * - Confidence badge (Low/Medium/High)
 * - Data freshness (X hrs ago)
 * - Sources count
 * - Link to data issues if confidence < High
 */

import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Clock, 
  Database,
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

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, {
  icon: typeof CheckCircle2;
  label: string;
  bg: string;
  text: string;
  border: string;
}> = {
  high: {
    icon: CheckCircle2,
    label: 'High Confidence',
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
  },
  medium: {
    icon: Info,
    label: 'Medium Confidence',
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
  },
  low: {
    icon: AlertTriangle,
    label: 'Low Confidence',
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
  },
};

export function ExecHighlightsStrip({
  confidence,
  lastSync,
  sourcesCount,
  className,
}: ExecHighlightsStripProps) {
  const config = CONFIDENCE_CONFIG[confidence];
  const ConfidenceIcon = config.icon;
  const syncTime = lastSync ? formatRelativeTime(lastSync) : 'Unknown';

  return (
    <Card className={cn('border-dashed bg-muted/30', className)}>
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Left: Confidence + Freshness + Sources */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Confidence Badge */}
            <Badge 
              variant="outline" 
              className={cn(
                'gap-1.5 px-3 py-1',
                config.bg, config.text, config.border
              )}
            >
              <ConfidenceIcon className="w-3.5 h-3.5" />
              {config.label}
            </Badge>

            {/* Separator */}
            <span className="text-muted-foreground/30 hidden sm:inline">•</span>

            {/* Data Freshness */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Data freshness: {syncTime}</span>
            </div>

            {/* Separator */}
            <span className="text-muted-foreground/30 hidden sm:inline">•</span>

            {/* Sources */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Database className="w-3.5 h-3.5" />
              <span>Sources: {sourcesCount}</span>
            </div>
          </div>

          {/* Right: Data issues link (only if not high confidence) */}
          {confidence !== 'high' && (
            <Link 
              to="/employer/integrations"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View data issues
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

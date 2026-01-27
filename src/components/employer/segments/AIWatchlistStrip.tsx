/**
 * AI Watchlist Strip
 * 
 * Horizontal scrollable strip of pre-defined smart segments.
 * Uses behavioral gap styling instead of risk scores.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Star, 
  UserPlus, 
  Flag, 
  Bookmark,
  Brain,
  TrendingUp,
  CheckCircle,
  Target,
} from 'lucide-react';
import { SavedSegment, BehavioralGapType } from './types';
import { AI_WATCHLIST_SEGMENTS } from './mockData';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AIWatchlistStripProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  savedSegments: SavedSegment[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  AlertTriangle,
  Star,
  UserPlus,
  Flag,
  Bookmark,
  TrendingUp,
  CheckCircle,
  Target,
};

const gapConfig: Record<BehavioralGapType, { className: string }> = {
  'high-engagement-low-cost': { className: 'border-success/30 bg-success/5' },
  'concentrated-spend': { className: 'border-warning/30 bg-warning/5' },
  'balanced': { className: 'border-primary/30 bg-primary/5' },
  'low-engagement': { className: 'border-destructive/30 bg-destructive/5' },
};

export function AIWatchlistStrip({ selectedId, onSelect, savedSegments }: AIWatchlistStripProps) {
  const allSegments = [
    ...AI_WATCHLIST_SEGMENTS.map(s => ({ ...s, matchCount: 0 })),
    ...savedSegments,
  ];

  return (
    <Card className="bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
      <CardContent className="p-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-1.5 rounded-lg bg-accent/10">
            <Brain className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI Watchlist</h3>
            <p className="text-xs text-muted-foreground">Smart segments auto-updated</p>
          </div>
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2">
            {allSegments.map((segment, index) => {
              const Icon = ICON_MAP[segment.icon] || Bookmark;
              const isSelected = selectedId === segment.id;
              const gapStyle = gapConfig[segment.behavioralGap] || gapConfig['balanced'];

              return (
                <motion.button
                  key={segment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelect(segment.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all whitespace-nowrap",
                    isSelected
                      ? "ring-2 ring-accent border-accent bg-accent/10"
                      : cn("hover:border-accent/50", gapStyle.className)
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 shrink-0",
                    segment.isAI ? 'text-accent' : 'text-primary'
                  )} />
                  <span className="text-sm font-medium">{segment.name}</span>
                  {segment.isAI && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-accent/10 border-accent/30">
                      AI
                    </Badge>
                  )}
                </motion.button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

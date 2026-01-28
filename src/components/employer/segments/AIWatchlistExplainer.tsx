/**
 * AI Watchlist Explainer
 * 
 * "Why this segment?" panel showing:
 * - Top 3 drivers with thresholds
 * - Data readiness/confidence indicator
 * - Expected impact range
 * 
 * Provides transparency into AI segment selection.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedSegment, BehavioralGapType } from './types';
import { EstimatedBadge } from '@/components/shared/SSOTTooltip';

interface SegmentDriver {
  id: string;
  label: string;
  description: string;
  threshold: string;
  currentValue: string;
  isMet: boolean;
  isEstimated: boolean;
}

interface AIWatchlistExplainerProps {
  segment: {
    id: string;
    name: string;
    description: string;
    behavioralGap: BehavioralGapType;
    trend?: 'up' | 'down' | 'stable';
    isAI: boolean;
  } | null;
  className?: string;
}

// Driver configurations per segment type
const SEGMENT_DRIVERS: Record<string, SegmentDriver[]> = {
  'low-adoption': [
    {
      id: 'utilization',
      label: 'Low Budget Utilization',
      description: 'Employees spending significantly below their entitlement',
      threshold: '< 30% of budget used',
      currentValue: '22% avg usage',
      isMet: true,
      isEstimated: false,
    },
    {
      id: 'participation',
      label: 'No Claims Filed',
      description: 'Eligible employees who haven\'t submitted any claims',
      threshold: '0 claims YTD',
      currentValue: '34 employees',
      isMet: true,
      isEstimated: true,
    },
    {
      id: 'tenure',
      label: 'Missed Onboarding Window',
      description: 'New joiners who didn\'t claim in first 90 days',
      threshold: '> 90 days since joining',
      currentValue: '18 employees',
      isMet: true,
      isEstimated: false,
    },
  ],
  'high-potentials': [
    {
      id: 'grade',
      label: 'Mid-Level Grade',
      description: 'Employees in growth positions (G2-G3)',
      threshold: 'Grade G2 or G3',
      currentValue: '45 employees',
      isMet: true,
      isEstimated: false,
    },
    {
      id: 'tenure',
      label: 'Moderate Tenure',
      description: 'Proven performers (1-3 years)',
      threshold: '1-3 years tenure',
      currentValue: '38 employees',
      isMet: true,
      isEstimated: false,
    },
    {
      id: 'performance',
      label: 'High Engagement',
      description: 'Strong benefit utilization pattern',
      threshold: '> 60% participation',
      currentValue: '68% participating',
      isMet: true,
      isEstimated: true,
    },
  ],
  'new-joiners': [
    {
      id: 'tenure',
      label: 'Recent Start Date',
      description: 'Employees in their first year',
      threshold: '< 12 months tenure',
      currentValue: '52 employees',
      isMet: true,
      isEstimated: false,
    },
    {
      id: 'onboarding',
      label: 'Onboarding Period',
      description: 'Still learning benefit options',
      threshold: '< 6 months = priority',
      currentValue: '28 in priority window',
      isMet: true,
      isEstimated: false,
    },
    {
      id: 'claims',
      label: 'First-Time Claimers',
      description: 'Haven\'t yet experienced claim process',
      threshold: '≤ 1 claim filed',
      currentValue: '41 employees',
      isMet: true,
      isEstimated: true,
    },
  ],
  'heavy-users': [
    {
      id: 'spend',
      label: 'High Spend Volume',
      description: 'Top spenders consuming disproportionate budget',
      threshold: '> 80% budget utilized',
      currentValue: '92% avg usage',
      isMet: true,
      isEstimated: false,
    },
    {
      id: 'grade',
      label: 'Senior Grade',
      description: 'Executive and senior management',
      threshold: 'Grade G4+ or C-Suite',
      currentValue: '23 employees',
      isMet: true,
      isEstimated: false,
    },
    {
      id: 'claims',
      label: 'Frequent Claims',
      description: 'Above-average claim frequency',
      threshold: '> 6 claims YTD',
      currentValue: '8.2 avg claims',
      isMet: true,
      isEstimated: false,
    },
  ],
  'flight-risks': [
    {
      id: 'engagement',
      label: 'Low Engagement Score',
      description: 'Minimal benefit interaction despite eligibility',
      threshold: '< 25% participation',
      currentValue: '18% participating',
      isMet: true,
      isEstimated: true,
    },
    {
      id: 'value',
      label: 'High Employee Value',
      description: 'Senior grades with significant investment',
      threshold: 'Grade G3+ AND tenure > 2yr',
      currentValue: '15 employees',
      isMet: true,
      isEstimated: false,
    },
    {
      id: 'pattern',
      label: 'Declining Usage Pattern',
      description: 'Reduced engagement vs prior period',
      threshold: '> 20% decline vs last quarter',
      currentValue: '-28% decline',
      isMet: true,
      isEstimated: true,
    },
  ],
};

// Confidence levels per segment
const SEGMENT_CONFIDENCE: Record<string, { level: 'high' | 'medium' | 'low'; percentage: number; notes: string }> = {
  'low-adoption': { 
    level: 'high', 
    percentage: 85,
    notes: 'Based on complete claims and entitlement data',
  },
  'high-potentials': { 
    level: 'medium', 
    percentage: 68,
    notes: 'Grade data complete; performance data estimated',
  },
  'new-joiners': { 
    level: 'high', 
    percentage: 92,
    notes: 'Based on verified hire dates from HR system',
  },
  'heavy-users': { 
    level: 'high', 
    percentage: 88,
    notes: 'Based on complete spend and claims data',
  },
  'flight-risks': { 
    level: 'low', 
    percentage: 45,
    notes: 'Engagement pattern data partially available',
  },
};

// Impact estimates per segment
const SEGMENT_IMPACT: Record<string, { min: number; max: number; confidence: 'high' | 'medium' | 'low' }> = {
  'low-adoption': { min: 45000, max: 120000, confidence: 'medium' },
  'high-potentials': { min: 0, max: 0, confidence: 'high' }, // Retention, not savings
  'new-joiners': { min: 15000, max: 35000, confidence: 'medium' },
  'heavy-users': { min: 25000, max: 80000, confidence: 'medium' },
  'flight-risks': { min: 100000, max: 350000, confidence: 'low' },
};

const confidenceStyles = {
  high: { className: 'text-success', bgClass: 'bg-success/10' },
  medium: { className: 'text-warning', bgClass: 'bg-warning/10' },
  low: { className: 'text-destructive', bgClass: 'bg-destructive/10' },
};

export function AIWatchlistExplainer({ segment, className }: AIWatchlistExplainerProps) {
  if (!segment) {
    return null;
  }

  const drivers = SEGMENT_DRIVERS[segment.id] || [];
  const confidence = SEGMENT_CONFIDENCE[segment.id] || { level: 'low', percentage: 30, notes: 'Limited data available' };
  const impact = SEGMENT_IMPACT[segment.id] || { min: 0, max: 0, confidence: 'low' };
  const confStyle = confidenceStyles[confidence.level];

  // If no drivers defined, show placeholder
  const hasDrivers = drivers.length > 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={segment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-accent/10">
                <HelpCircle className="h-4 w-4 text-accent" />
              </div>
              Why "{segment.name}"?
              {segment.isAI && (
                <Badge variant="outline" className="text-[10px] px-1.5 bg-accent/10 border-accent/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Selected
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {segment.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Top Drivers */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Top Drivers
              </h4>
              {hasDrivers ? (
                <div className="space-y-2">
                  {drivers.slice(0, 3).map((driver, index) => (
                    <div
                      key={driver.id}
                      className="flex items-start gap-3 p-2 rounded-lg bg-muted/30"
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                        driver.isMet ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{driver.label}</span>
                          {driver.isEstimated && <EstimatedBadge />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {driver.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs">
                          <span className="text-muted-foreground">
                            Threshold: <span className="font-medium text-foreground">{driver.threshold}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Current: <span className={cn("font-medium", driver.isMet ? "text-success" : "text-warning")}>
                              {driver.currentValue}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">
                    Driver analysis not yet configured for this segment
                  </p>
                  <Badge variant="outline" className="mt-2 text-[10px]">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Estimated
                  </Badge>
                </div>
              )}
            </div>

            {/* Data Readiness / Confidence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Database className="h-3 w-3" />
                  Data Confidence
                </h4>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs capitalize", confStyle.className, confStyle.bgClass)}
                >
                  {confidence.level}
                </Badge>
              </div>
              <div className="space-y-1.5">
                <Progress 
                  value={confidence.percentage} 
                  className={cn("h-2", confStyle.bgClass)}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{confidence.notes}</span>
                  <span className={cn("font-semibold tabular-nums", confStyle.className)}>
                    {confidence.percentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Expected Impact */}
            {(impact.min > 0 || impact.max > 0) && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Expected Impact Range
                </h4>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-sm">
                      <span className="font-semibold tabular-nums">
                        AED {(impact.min / 1000).toFixed(0)}K – {(impact.max / 1000).toFixed(0)}K
                      </span>
                      <span className="text-muted-foreground ml-1">recoverable</span>
                    </span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] capitalize",
                      confidenceStyles[impact.confidence].className,
                      confidenceStyles[impact.confidence].bgClass
                    )}
                  >
                    {impact.confidence} conf.
                  </Badge>
                </div>
              </div>
            )}

            {/* Call-to-action hint */}
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                Select segment above to see member list and take action
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

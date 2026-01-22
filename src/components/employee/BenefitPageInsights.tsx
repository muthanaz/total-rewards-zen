/**
 * BenefitPageInsights - Standardized insights section for employee benefit pages
 * 
 * Provides meaningful, actionable insights:
 * - How to use this benefit effectively
 * - Common pitfalls to avoid
 * - What to submit (documents/evidence)
 * - Typical timeline expectations
 */

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, AlertTriangle, FileText, Clock, CheckCircle, 
  TrendingUp, Target, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export interface BenefitInsight {
  type: 'tip' | 'warning' | 'document' | 'timeline' | 'action';
  title: string;
  description: string;
  highlight?: string;
}

export interface BenefitPageInsightsProps {
  /** Category name for contextual messaging */
  category: string;
  /** Current utilization percentage (0-100) */
  utilizationPercent: number;
  /** Days remaining in the year */
  daysRemaining?: number;
  /** Custom insights to display */
  insights?: BenefitInsight[];
  /** Additional CSS classes */
  className?: string;
}

const insightIcons = {
  tip: Lightbulb,
  warning: AlertTriangle,
  document: FileText,
  timeline: Clock,
  action: TrendingUp,
};

const insightColors = {
  tip: 'text-accent bg-accent/10 border-accent/20',
  warning: 'text-warning bg-warning/10 border-warning/20',
  document: 'text-chart-3 bg-chart-3/10 border-chart-3/20',
  timeline: 'text-chart-2 bg-chart-2/10 border-chart-2/20',
  action: 'text-success bg-success/10 border-success/20',
};

/**
 * Generate default insights based on utilization and category
 */
function generateDefaultInsights(
  category: string,
  utilizationPercent: number,
  daysRemaining: number
): BenefitInsight[] {
  const insights: BenefitInsight[] = [];
  
  // Utilization-based insights
  if (utilizationPercent < 30) {
    insights.push({
      type: 'action',
      title: 'Low Utilization',
      description: `You've only used ${utilizationPercent}% of your ${category} benefit. Review eligible expenses you may have missed.`,
      highlight: `${100 - utilizationPercent}% available`,
    });
  } else if (utilizationPercent >= 80 && utilizationPercent < 100) {
    insights.push({
      type: 'tip',
      title: 'Almost Fully Utilized',
      description: `Great job maximizing your ${category} benefit! Check remaining balance before making additional claims.`,
    });
  }
  
  // Year-end reminder
  if (daysRemaining <= 60 && utilizationPercent < 70) {
    insights.push({
      type: 'warning',
      title: 'Year-End Deadline',
      description: `Only ${daysRemaining} days left in the benefit year. Unused ${category} allowance typically doesn't roll over.`,
      highlight: `${daysRemaining} days left`,
    });
  }
  
  // Timeline insight
  insights.push({
    type: 'timeline',
    title: 'Typical Processing Time',
    description: 'Most claims are processed within 5-7 business days. Complex claims may take up to 14 days.',
  });
  
  return insights;
}

export function BenefitPageInsights({
  category,
  utilizationPercent,
  daysRemaining = 365 - Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)),
  insights: customInsights,
  className,
}: BenefitPageInsightsProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const insights = customInsights || generateDefaultInsights(category, utilizationPercent, daysRemaining);
  
  if (insights.length === 0) return null;
  
  return (
    <Card className={cn('border-muted', className)}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          'text-base font-display flex items-center gap-2',
          isRTL && 'flex-row-reverse'
        )}>
          <Info className="w-4 h-4 text-muted-foreground" />
          Quick Tips & Reminders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {insights.map((insight, index) => {
            const Icon = insightIcons[insight.type];
            const colorClass = insightColors[insight.type];
            
            return (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  colorClass,
                  isRTL && 'flex-row-reverse text-right'
                )}
              >
                <div className="p-1.5 rounded-md bg-background/50 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    'flex items-center gap-2 flex-wrap',
                    isRTL && 'flex-row-reverse'
                  )}>
                    <p className="font-medium text-sm">{insight.title}</p>
                    {insight.highlight && (
                      <Badge variant="secondary" className="text-xs">
                        {insight.highlight}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact inline insight for use within other cards
 */
export function InlineInsight({
  type,
  children,
  className,
}: {
  type: 'tip' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}) {
  const icons = {
    tip: Lightbulb,
    warning: AlertTriangle,
    info: Info,
  };
  const colors = {
    tip: 'text-accent',
    warning: 'text-warning',
    info: 'text-muted-foreground',
  };
  
  const Icon = icons[type];
  
  return (
    <div className={cn(
      'flex items-start gap-2 text-xs',
      className
    )}>
      <Icon className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', colors[type])} />
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}

/**
 * Standard document requirements section for benefit pages
 */
export function DocumentRequirements({
  documents,
  className,
}: {
  documents: Array<{ name: string; required: boolean; description?: string }>;
  className?: string;
}) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  if (documents.length === 0) return null;
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          'text-base font-display flex items-center gap-2',
          isRTL && 'flex-row-reverse'
        )}>
          <FileText className="w-4 h-4 text-muted-foreground" />
          What to Submit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-2">
          {documents.map((doc, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-2 p-2 rounded-lg bg-muted/50',
                isRTL && 'flex-row-reverse text-right'
              )}
            >
              <CheckCircle className={cn(
                'w-4 h-4 mt-0.5 shrink-0',
                doc.required ? 'text-success' : 'text-muted-foreground'
              )} />
              <div>
                <p className="text-sm font-medium">
                  {doc.name}
                  {!doc.required && (
                    <span className="text-xs text-muted-foreground ml-1">(optional)</span>
                  )}
                </p>
                {doc.description && (
                  <p className="text-xs text-muted-foreground">{doc.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Template A: Analytics Page Template
 * 
 * Structure:
 * 1. Header (PageLayout with confidence badge + actions)
 * 2. Global Filters
 * 3. Narrative Insights
 * 4. KPI Grid
 * 5. Trend/Breakdown Charts
 * 6. Drilldown Table
 * 7. Recommended Actions
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageLayout } from '@/components/shared/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface InsightItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  impact?: string;
  action?: {
    label: string;
    href: string;
  };
}

interface AnalyticsTemplateProps {
  // Header
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  actions?: ReactNode;
  confidenceBadge?: ReactNode;
  
  // Filters
  filters?: ReactNode;
  
  // Insights section
  insights?: InsightItem[];
  insightsTitle?: string;
  
  // KPI section
  kpis?: ReactNode;
  
  // Charts section
  charts?: ReactNode;
  
  // Table section
  table?: ReactNode;
  tableTitle?: string;
  tableDescription?: string;
  
  // Recommended actions
  recommendedActions?: ReactNode;
  
  // Additional content
  children?: ReactNode;
  className?: string;
}

export function AnalyticsTemplate({
  title,
  description,
  icon,
  iconClassName,
  actions,
  confidenceBadge,
  filters,
  insights,
  insightsTitle = 'Key Insights',
  kpis,
  charts,
  table,
  tableTitle,
  tableDescription,
  recommendedActions,
  children,
  className,
}: AnalyticsTemplateProps) {
  return (
    <PageLayout
      title={title}
      description={description}
      icon={icon}
      iconClassName={iconClassName}
      actions={actions}
      confidenceBadge={confidenceBadge}
      filters={filters}
      className={cn('space-y-6', className)}
    >
      {/* Narrative Insights */}
      {insights && insights.length > 0 && (
        <InsightsList insights={insights} title={insightsTitle} />
      )}

      {/* KPI Grid */}
      {kpis && (
        <section aria-label="Key metrics">
          {kpis}
        </section>
      )}

      {/* Charts Section */}
      {charts && (
        <section aria-label="Charts and trends" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {charts}
        </section>
      )}

      {/* Table Section */}
      {table && (
        <Card>
          {(tableTitle || tableDescription) && (
            <CardHeader>
              {tableTitle && <CardTitle className="text-lg">{tableTitle}</CardTitle>}
              {tableDescription && <CardDescription>{tableDescription}</CardDescription>}
            </CardHeader>
          )}
          <CardContent className={tableTitle ? '' : 'pt-6'}>
            {table}
          </CardContent>
        </Card>
      )}

      {/* Recommended Actions */}
      {recommendedActions && (
        <section aria-label="Recommended actions">
          {recommendedActions}
        </section>
      )}

      {/* Additional Content */}
      {children}
    </PageLayout>
  );
}

// ============= INSIGHTS LIST COMPONENT =============

interface InsightsListProps {
  insights: InsightItem[];
  title: string;
  maxItems?: number;
}

export function InsightsList({ insights, title, maxItems = 4 }: InsightsListProps) {
  const displayInsights = insights.slice(0, maxItems);

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-card via-card to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayInsights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div
                key={insight.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-accent/10 shrink-0">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                  {insight.impact && (
                    <p className="text-xs text-success font-medium mt-1">{insight.impact}</p>
                  )}
                </div>
                {insight.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    asChild
                  >
                    <a href={insight.action.href}>
                      {insight.action.label}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default AnalyticsTemplate;

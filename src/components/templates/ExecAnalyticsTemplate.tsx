/**
 * Executive Analytics Page Template
 * 
 * Standardized structure for all Employer hero analytics pages:
 * 1. PageHeader: title + description + date range + Data Confidence badge
 * 2. Key Insights (3-5 bullets)
 * 3. KPI Strip (4-6 KPIs)
 * 4. Primary Chart
 * 5. Drilldown Table
 * 6. Recommended Actions
 */

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon, ArrowRight, Lightbulb, ExternalLink, Clock } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { DataConfidenceBadge, useDataCoverageMetrics, PageConfidenceGate } from '@/components/employer';
import { EmployerGlobalFiltersBar } from '@/components/employer/EmployerGlobalFiltersBar';
import { DemoTip } from '@/components/demo';

// ============================================
// TYPES
// ============================================

export interface KeyInsight {
  id: string;
  text: string;
  trend?: 'up' | 'down' | 'neutral';
  isPositive?: boolean;
  linkTo?: string;
  linkLabel?: string;
}

export interface KPIMetric {
  id: string;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon?: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  owner: string;
  impact: string;
  effort: 'S' | 'M' | 'L';
  linkTo?: string;
  isDisabled?: boolean;
  disabledReason?: string;
}

export interface ExecAnalyticsTemplateProps {
  // Header
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
  
  // Optional demo tip
  demoTip?: {
    title: string;
    description: string;
  };
  
  // Data state
  isLoading?: boolean;
  
  // Key Insights (max 5)
  insights?: KeyInsight[];
  
  // KPI Strip (4-6 KPIs)
  kpis: KPIMetric[];
  
  // Main content
  children: ReactNode;
  
  // Recommended Actions
  actions?: RecommendedAction[];
  
  // Footer actions
  footerActions?: ReactNode;
  
  // Show filters bar
  showFilters?: boolean;
  
  // Confidence threshold
  confidenceThreshold?: number;
}

// ============================================
// SUBCOMPONENTS
// ============================================

function InsightsList({ insights }: { insights: KeyInsight[] }) {
  if (!insights?.length) return null;
  
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Key Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {insights.slice(0, 5).map((insight) => (
            <li key={insight.id} className="flex items-start gap-3">
              <span className={cn(
                "mt-1.5 w-2 h-2 rounded-full shrink-0",
                insight.trend === 'up' 
                  ? (insight.isPositive ? 'bg-success' : 'bg-destructive')
                  : insight.trend === 'down'
                    ? (insight.isPositive ? 'bg-success' : 'bg-warning')
                    : 'bg-muted-foreground'
              )} />
              <div className="flex-1">
                <span className="text-sm">{insight.text}</span>
                {insight.linkTo && (
                  <Link 
                    to={insight.linkTo}
                    className="text-sm text-primary hover:underline ml-2 inline-flex items-center gap-1"
                  >
                    {insight.linkLabel || 'View details'}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function KPIStrip({ kpis }: { kpis: KPIMetric[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.slice(0, 6).map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card 
            key={kpi.id} 
            className={cn(
              "relative overflow-hidden",
              kpi.onClick && "cursor-pointer hover:border-primary/50 transition-colors"
            )}
            onClick={kpi.onClick}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between">
                {Icon && (
                  <div className={cn(
                    "p-2 rounded-lg",
                    kpi.iconColor || "bg-primary/10"
                  )}>
                    <Icon className={cn("h-4 w-4", kpi.iconColor ? "" : "text-primary")} />
                  </div>
                )}
                {kpi.trend && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      kpi.trend.isPositive ? "text-success border-success/30" : "text-destructive border-destructive/30"
                    )}
                  >
                    {kpi.trend.value > 0 ? '+' : ''}{kpi.trend.value}%
                  </Badge>
                )}
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                {kpi.subtitle && (
                  <p className="text-xs text-muted-foreground/70 mt-1">{kpi.subtitle}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ActionsSection({ actions }: { actions: RecommendedAction[] }) {
  if (!actions?.length) return null;
  
  const effortLabels = { S: 'Small', M: 'Medium', L: 'Large' };
  const effortColors = { 
    S: 'bg-success/10 text-success', 
    M: 'bg-warning/10 text-warning', 
    L: 'bg-destructive/10 text-destructive' 
  };
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Recommended Actions
            </CardTitle>
            <CardDescription>
              Prioritized by impact and effort
            </CardDescription>
          </div>
          <Link to="/employer/recommendations">
            <Button variant="outline" size="sm" className="gap-2">
              View Action Plan
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {actions.slice(0, 4).map((action) => (
            <div 
              key={action.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border bg-muted/30",
                action.isDisabled && "opacity-60"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{action.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {action.owner}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {action.description}
                </p>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-medium text-success">{action.impact}</p>
                  <p className="text-xs text-muted-foreground">impact</p>
                </div>
                <Badge className={cn("text-xs", effortColors[action.effort])}>
                  {effortLabels[action.effort]}
                </Badge>
                {action.linkTo ? (
                  <Link to={action.linkTo}>
                    <Button variant="ghost" size="sm" disabled={action.isDisabled}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : action.isDisabled ? (
                  <Button variant="ghost" size="sm" disabled>
                    <Clock className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 bg-muted rounded-xl" />
      <div className="grid grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
      </div>
      <div className="h-64 bg-muted rounded-xl" />
      <div className="h-48 bg-muted rounded-xl" />
    </div>
  );
}

// ============================================
// MAIN TEMPLATE
// ============================================

export function ExecAnalyticsTemplate({
  title,
  description,
  icon: Icon,
  iconClassName = "from-primary to-primary/80",
  demoTip,
  isLoading,
  insights,
  kpis,
  children,
  actions,
  footerActions,
  showFilters = true,
  confidenceThreshold = 70,
}: ExecAnalyticsTemplateProps) {
  const coverageMetrics = useDataCoverageMetrics();
  
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={confidenceThreshold}>
      <div className="space-y-6">
        {/* Demo Tip */}
        {demoTip && (
          <DemoTip 
            id={`demo-${title.toLowerCase().replace(/\s+/g, '-')}`}
            title={demoTip.title} 
            description={demoTip.description} 
            variant="subtle" 
          />
        )}
        
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl bg-gradient-to-br shrink-0",
              iconClassName
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
                {title}
              </h1>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              As of {formatDate(new Date())}
            </span>
            <DataConfidenceBadge metrics={coverageMetrics} />
          </div>
        </div>
        
        {/* Global Filters */}
        {showFilters && <EmployerGlobalFiltersBar />}
        
        {/* Key Insights */}
        {insights && insights.length > 0 && (
          <InsightsList insights={insights} />
        )}
        
        {/* KPI Strip */}
        <KPIStrip kpis={kpis} />
        
        {/* Main Content (charts, tables, etc.) */}
        <div className="space-y-6">
          {children}
        </div>
        
        {/* Recommended Actions */}
        {actions && actions.length > 0 && (
          <ActionsSection actions={actions} />
        )}
        
        {/* Footer Actions */}
        {footerActions && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            {footerActions}
          </div>
        )}
      </div>
    </PageConfidenceGate>
  );
}

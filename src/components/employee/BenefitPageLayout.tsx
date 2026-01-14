// Shared 4-tab layout for all benefit pages: Overview / Use it / Insights / History
import React, { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { PageHeader } from '@/components/ui/page-header';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Lightbulb, 
  TrendingUp, 
  History, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { format } from 'date-fns';

export interface BenefitStat {
  label: string;
  labelAr?: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'info';
  suffix?: string;
}

export interface BenefitInsight {
  type: 'action' | 'info' | 'warning';
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  actionLabel?: string;
  actionLabelAr?: string;
  onAction?: () => void;
}

export interface HistoryEvent {
  id: string;
  date: string;
  type: 'claim' | 'payment' | 'update' | 'approval';
  title: string;
  titleAr?: string;
  amount?: number;
  status?: 'completed' | 'pending' | 'rejected';
}

export interface BenefitPageLayoutProps {
  // Header
  title: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  icon: LucideIcon;
  
  // Summary Stats
  stats: BenefitStat[];
  
  // Utilization
  annualValue: number;
  utilizedAmount: number;
  
  // Tab Content
  overviewContent: ReactNode;
  useItContent: ReactNode;
  
  // Optional Insights
  insights?: BenefitInsight[];
  
  // Optional History
  historyEvents?: HistoryEvent[];
  
  // Actions
  primaryAction?: {
    label: string;
    labelAr?: string;
    onClick: () => void;
  };
  
  // Custom tab labels
  tabLabels?: {
    overview?: string;
    overviewAr?: string;
    useIt?: string;
    useItAr?: string;
    insights?: string;
    insightsAr?: string;
    history?: string;
    historyAr?: string;
  };
}

export function BenefitPageLayout({
  title,
  titleAr,
  subtitle,
  subtitleAr,
  icon: Icon,
  stats,
  annualValue,
  utilizedAmount,
  overviewContent,
  useItContent,
  insights = [],
  historyEvents = [],
  primaryAction,
  tabLabels = {},
}: BenefitPageLayoutProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  
  const utilizationPercent = annualValue > 0 ? Math.round((utilizedAmount / annualValue) * 100) : 0;
  const remainingAmount = annualValue - utilizedAmount;
  
  const formatCurrency = (value: number) => 
    `${isRTL ? '' : 'AED '}${value.toLocaleString(isRTL ? 'ar-AE' : 'en-AE')}${isRTL ? ' درهم' : ''}`;
  
  // Default tab labels
  const labels = {
    overview: isArabic ? (tabLabels.overviewAr || 'نظرة عامة') : (tabLabels.overview || 'Overview'),
    useIt: isArabic ? (tabLabels.useItAr || 'استخدمها') : (tabLabels.useIt || 'Use It'),
    insights: isArabic ? (tabLabels.insightsAr || 'رؤى') : (tabLabels.insights || 'Insights'),
    history: isArabic ? (tabLabels.historyAr || 'السجل') : (tabLabels.history || 'History'),
  };
  
  // Generate default insights if none provided
  const defaultInsights: BenefitInsight[] = [];
  
  if (remainingAmount > 0 && utilizationPercent < 80) {
    defaultInsights.push({
      type: 'action',
      title: 'Remaining Budget Available',
      titleAr: 'رصيد متاح',
      description: `You have ${formatCurrency(remainingAmount)} remaining. Consider utilizing this before year-end.`,
      descriptionAr: `لديك ${formatCurrency(remainingAmount)} متبقي. فكر في استخدامه قبل نهاية العام.`,
      actionLabel: 'Submit Claim',
      actionLabelAr: 'تقديم مطالبة',
    });
  }
  
  if (utilizationPercent >= 100) {
    defaultInsights.push({
      type: 'info',
      title: 'Fully Utilized',
      titleAr: 'مستخدم بالكامل',
      description: 'You have utilized your full annual allowance for this benefit.',
      descriptionAr: 'لقد استخدمت كامل المخصص السنوي لهذه الميزة.',
    });
  }
  
  const allInsights = insights.length > 0 ? insights : defaultInsights;
  
  const getInsightIcon = (type: BenefitInsight['type']) => {
    switch (type) {
      case 'action': return TrendingUp;
      case 'warning': return AlertCircle;
      default: return Lightbulb;
    }
  };
  
  const getInsightStyles = (type: BenefitInsight['type']) => {
    switch (type) {
      case 'action': return 'bg-primary/5 border-primary/20 text-primary';
      case 'warning': return 'bg-amber-500/5 border-amber-500/20 text-amber-600';
      default: return 'bg-blue-500/5 border-blue-500/20 text-blue-600';
    }
  };
  
  const getHistoryStatusBadge = (status?: HistoryEvent['status']) => {
    if (!status) return null;
    const styles = {
      completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    const labels = {
      completed: isArabic ? 'مكتمل' : 'Completed',
      pending: isArabic ? 'قيد الانتظار' : 'Pending',
      rejected: isArabic ? 'مرفوض' : 'Rejected',
    };
    return <Badge className={cn("text-xs", styles[status])}>{labels[status]}</Badge>;
  };

  return (
    <div className={cn("space-y-6 animate-fade-in", isRTL && "text-right")}>
      {/* Page Header */}
      <PageHeader
        title={isArabic && titleAr ? titleAr : title}
        subtitle={isArabic && subtitleAr ? subtitleAr : subtitle}
        icon={Icon}
        action={primaryAction ? (
          <Button onClick={primaryAction.onClick}>
            {isArabic && primaryAction.labelAr ? primaryAction.labelAr : primaryAction.label}
          </Button>
        ) : undefined}
      />
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <SummaryStatsCard
            key={index}
            label={isArabic && stat.labelAr ? stat.labelAr : stat.label}
            value={typeof stat.value === 'number' ? stat.value.toLocaleString(isArabic ? 'ar-AE' : 'en-AE') : stat.value}
            icon={stat.icon}
            variant={stat.variant || 'default'}
            suffix={stat.suffix}
          />
        ))}
      </div>
      
      {/* Utilization Progress */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
            <span className="text-sm font-medium">
              {isArabic ? 'نسبة الاستخدام' : 'Utilization'}
            </span>
            <span className={cn(
              "text-sm font-bold",
              utilizationPercent >= 80 ? "text-emerald-600" : 
              utilizationPercent >= 50 ? "text-blue-600" : "text-amber-600"
            )}>
              {utilizationPercent}%
            </span>
          </div>
          <Progress 
            value={utilizationPercent} 
            className={cn(
              "h-2",
              utilizationPercent >= 80 ? "[&>div]:bg-emerald-500" : 
              utilizationPercent >= 50 ? "[&>div]:bg-blue-500" : "[&>div]:bg-amber-500"
            )} 
          />
          <div className={cn("flex justify-between mt-2 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
            <span>{isArabic ? 'المستخدم:' : 'Used:'} {formatCurrency(utilizedAmount)}</span>
            <span>{isArabic ? 'المتبقي:' : 'Remaining:'} {formatCurrency(remainingAmount)}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <FileText className="w-4 h-4 mr-1 hidden sm:inline" />
            {labels.overview}
          </TabsTrigger>
          <TabsTrigger value="use-it" className="text-xs sm:text-sm">
            <ExternalLink className="w-4 h-4 mr-1 hidden sm:inline" />
            {labels.useIt}
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs sm:text-sm">
            <Lightbulb className="w-4 h-4 mr-1 hidden sm:inline" />
            {labels.insights}
            {allInsights.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {allInsights.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">
            <History className="w-4 h-4 mr-1 hidden sm:inline" />
            {labels.history}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {overviewContent}
        </TabsContent>
        
        <TabsContent value="use-it" className="space-y-4">
          {useItContent}
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          {allInsights.length > 0 ? (
            <div className="grid gap-3">
              {allInsights.map((insight, index) => {
                const InsightIcon = getInsightIcon(insight.type);
                return (
                  <Card 
                    key={index} 
                    className={cn(
                      "border transition-all hover:shadow-sm",
                      getInsightStyles(insight.type)
                    )}
                  >
                    <CardContent className="pt-4">
                      <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                        <div className={cn(
                          "p-2 rounded-lg",
                          insight.type === 'action' ? 'bg-primary/10' :
                          insight.type === 'warning' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                        )}>
                          <InsightIcon className="w-4 h-4" />
                        </div>
                        <div className={cn("flex-1", isRTL && "text-right")}>
                          <h4 className="font-semibold text-sm text-foreground">
                            {isArabic && insight.titleAr ? insight.titleAr : insight.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isArabic && insight.descriptionAr ? insight.descriptionAr : insight.description}
                          </p>
                          {insight.actionLabel && insight.onAction && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mt-2"
                              onClick={insight.onAction}
                            >
                              {isArabic && insight.actionLabelAr ? insight.actionLabelAr : insight.actionLabel}
                              <ChevronRight className={cn("w-3 h-3 ml-1", isRTL && "rotate-180")} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <Lightbulb className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'لا توجد رؤى حالياً' : 'No insights available at this time'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {historyEvents.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {isArabic ? 'سجل النشاط' : 'Activity History'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historyEvents.map((event) => (
                    <div 
                      key={event.id}
                      className={cn(
                        "flex items-center justify-between py-3 border-b border-border/50 last:border-0",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                        <div className="p-2 rounded-lg bg-muted">
                          {event.type === 'claim' && <FileText className="w-4 h-4" />}
                          {event.type === 'payment' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {event.type === 'approval' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                          {event.type === 'update' && <History className="w-4 h-4" />}
                        </div>
                        <div className={isRTL ? "text-right" : ""}>
                          <p className="text-sm font-medium">
                            {isArabic && event.titleAr ? event.titleAr : event.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.date), isArabic ? 'dd/MM/yyyy' : 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        {event.amount && (
                          <span className="text-sm font-medium">
                            {formatCurrency(event.amount)}
                          </span>
                        )}
                        {getHistoryStatusBadge(event.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <History className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'لا يوجد سجل نشاط بعد' : 'No activity history yet'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from 'react';
import { 
  Database, Users, FileSpreadsheet, Wallet, BarChart3, 
  ShoppingBag, CheckCircle2, AlertTriangle, XCircle, 
  RefreshCw, Clock, ChevronRight, ChevronLeft, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, formatDistanceToNow } from 'date-fns';

export interface DataSource {
  id: string;
  name: string;
  nameAr: string;
  type: 'hris' | 'payroll' | 'benefits' | 'claims' | 'survey' | 'marketplace';
  status: 'connected' | 'partial' | 'disconnected' | 'error';
  lastSync?: string;
  coverage?: number; // 0-100
  missingFields?: string[];
  recordCount?: number;
  errorMessage?: string;
}

interface DataSourcesStatusProps {
  sources: DataSource[];
  onRefresh?: (sourceId: string) => void;
  onConnect?: (sourceId: string) => void;
  className?: string;
  compact?: boolean;
}

export function DataSourcesStatus({
  sources,
  onRefresh,
  onConnect,
  className,
  compact = false,
}: DataSourcesStatusProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const getSourceIcon = (type: string) => {
    const icons = {
      hris: Users,
      payroll: Wallet,
      benefits: FileSpreadsheet,
      claims: FileSpreadsheet,
      survey: BarChart3,
      marketplace: ShoppingBag,
    };
    return icons[type as keyof typeof icons] || Database;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      connected: {
        icon: CheckCircle2,
        label: isArabic ? 'متصل' : 'Connected',
        color: 'text-emerald-600',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
      },
      partial: {
        icon: AlertTriangle,
        label: isArabic ? 'جزئي' : 'Partial',
        color: 'text-amber-600',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
      },
      disconnected: {
        icon: XCircle,
        label: isArabic ? 'غير متصل' : 'Disconnected',
        color: 'text-muted-foreground',
        bg: 'bg-muted/50',
        border: 'border-border',
      },
      error: {
        icon: XCircle,
        label: isArabic ? 'خطأ' : 'Error',
        color: 'text-red-600',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
      },
    };
    return configs[status as keyof typeof configs] || configs.disconnected;
  };

  const overallHealth = {
    connected: sources.filter(s => s.status === 'connected').length,
    partial: sources.filter(s => s.status === 'partial').length,
    disconnected: sources.filter(s => s.status === 'disconnected').length,
    error: sources.filter(s => s.status === 'error').length,
  };

  const healthScore = Math.round(
    ((overallHealth.connected * 100) + (overallHealth.partial * 50)) / sources.length
  );

  if (compact) {
    return (
      <TooltipProvider>
        <div className={cn("flex items-center gap-2", className, isRTL && "flex-row-reverse")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn("flex items-center gap-1.5 cursor-help", isRTL && "flex-row-reverse")}>
                <Database className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {isArabic ? 'مصادر البيانات:' : 'Data Sources:'}
                </span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    healthScore >= 80 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                    healthScore >= 50 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                    "bg-red-500/10 text-red-600 border-red-500/20"
                  )}
                >
                  {healthScore}%
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent side={isRTL ? "left" : "right"} className="max-w-xs">
              <div className="space-y-1.5">
                <p className="text-xs font-medium">
                  {isArabic ? 'حالة مصادر البيانات' : 'Data Sources Status'}
                </p>
                <div className="text-[10px] space-y-0.5">
                  <p className="text-emerald-600">{overallHealth.connected} {isArabic ? 'متصل' : 'connected'}</p>
                  {overallHealth.partial > 0 && (
                    <p className="text-amber-600">{overallHealth.partial} {isArabic ? 'جزئي' : 'partial'}</p>
                  )}
                  {overallHealth.disconnected > 0 && (
                    <p className="text-muted-foreground">{overallHealth.disconnected} {isArabic ? 'غير متصل' : 'disconnected'}</p>
                  )}
                  {overallHealth.error > 0 && (
                    <p className="text-red-600">{overallHealth.error} {isArabic ? 'خطأ' : 'errors'}</p>
                  )}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div className={cn(isRTL && "text-right")}>
            <CardTitle className="text-base font-medium">
              {isArabic ? 'مصادر البيانات والتكاملات' : 'Data Sources & Integrations'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isArabic ? 'حالة اتصال الأنظمة المختلفة' : 'Connection status of various systems'}
            </CardDescription>
          </div>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs px-2 py-0.5",
                healthScore >= 80 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                healthScore >= 50 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                "bg-red-500/10 text-red-600 border-red-500/20"
              )}
            >
              {healthScore}% {isArabic ? 'صحة البيانات' : 'Data Health'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sources.map((source) => {
          const SourceIcon = getSourceIcon(source.type);
          const statusConfig = getStatusConfig(source.status);
          const StatusIcon = statusConfig.icon;
          const isExpanded = expandedId === source.id;

          return (
            <div
              key={source.id}
              className={cn(
                "rounded-lg border transition-all",
                statusConfig.border,
                statusConfig.bg
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between p-3 cursor-pointer",
                  isRTL && "flex-row-reverse"
                )}
                onClick={() => setExpandedId(isExpanded ? null : source.id)}
              >
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-lg bg-background/50">
                    <SourceIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className={cn(isRTL && "text-right")}>
                    <p className="text-sm font-medium">
                      {isArabic ? source.nameAr : source.name}
                    </p>
                    {source.lastSync && source.status !== 'disconnected' && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDistanceToNow(new Date(source.lastSync), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>

                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 gap-1", statusConfig.color)}>
                    <StatusIcon className="w-2.5 h-2.5" />
                    {statusConfig.label}
                  </Badge>
                  {source.coverage !== undefined && source.status !== 'disconnected' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {source.coverage}%
                    </Badge>
                  )}
                  <ChevronIcon className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isExpanded && (isRTL ? "-rotate-90" : "rotate-90")
                  )} />
                </div>
              </div>

              {isExpanded && (
                <div className={cn(
                  "px-3 pb-3 pt-0 space-y-3 border-t border-border/30",
                  isRTL && "text-right"
                )}>
                  {source.coverage !== undefined && (
                    <div className="space-y-1">
                      <div className={cn("flex items-center justify-between text-xs", isRTL && "flex-row-reverse")}>
                        <span className="text-muted-foreground">
                          {isArabic ? 'التغطية' : 'Coverage'}
                        </span>
                        <span className="font-medium">{source.coverage}%</span>
                      </div>
                      <Progress value={source.coverage} className="h-1.5" />
                    </div>
                  )}

                  {source.recordCount !== undefined && (
                    <div className={cn("flex items-center justify-between text-xs", isRTL && "flex-row-reverse")}>
                      <span className="text-muted-foreground">
                        {isArabic ? 'السجلات' : 'Records'}
                      </span>
                      <span className="font-medium">{source.recordCount.toLocaleString()}</span>
                    </div>
                  )}

                  {source.missingFields && source.missingFields.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-amber-600">
                        {isArabic ? 'حقول مفقودة:' : 'Missing fields:'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {source.missingFields.slice(0, 5).map((field) => (
                          <Badge key={field} variant="outline" className="text-[9px] px-1 py-0">
                            {field}
                          </Badge>
                        ))}
                        {source.missingFields.length > 5 && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            +{source.missingFields.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {source.errorMessage && (
                    <p className="text-xs text-red-600">
                      {source.errorMessage}
                    </p>
                  )}

                  <div className={cn("flex items-center gap-2 pt-2", isRTL && "flex-row-reverse")}>
                    {source.status === 'disconnected' ? (
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onConnect?.(source.id)}
                      >
                        {isArabic ? 'ربط' : 'Connect'}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => onRefresh?.(source.id)}
                      >
                        <RefreshCw className="w-3 h-3" />
                        {isArabic ? 'تحديث' : 'Refresh'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

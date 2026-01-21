/**
 * InsightsActionsStrip
 * 
 * Two compact cards: Key Insights (Last 30 Days) + Recommended Actions with CTAs.
 */

import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface Insight {
  id: string;
  text: string;
  type: 'positive' | 'warning' | 'neutral';
  metric?: string;
}

interface Action {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  route: string;
  description: string;
}

interface InsightsActionsStripProps {
  insights: Insight[];
  actions: Action[];
}

const priorityConfig = {
  high: { label: 'High', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: Zap },
  medium: { label: 'Medium', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  low: { label: 'Low', color: 'bg-muted text-muted-foreground border-border', icon: CheckCircle2 },
};

const insightTypeConfig = {
  positive: { icon: TrendingUp, color: 'text-success' },
  warning: { icon: AlertTriangle, color: 'text-warning' },
  neutral: { icon: Lightbulb, color: 'text-primary' },
};

export function InsightsActionsStrip({ insights, actions }: InsightsActionsStripProps) {
  const { language, direction } = useLanguage();
  const navigate = useNavigate();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Key Insights Card */}
      <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5">
        <CardHeader className="pb-2">
          <CardTitle className={cn("flex items-center gap-2 text-base", isRTL && "flex-row-reverse")}>
            <div className="p-1.5 rounded-lg bg-accent/10">
              <Lightbulb className="w-4 h-4 text-accent" />
            </div>
            {t('Key Insights', 'الرؤى الرئيسية')}
            <Badge variant="outline" className="ms-auto text-xs">
              {t('Last 30 Days', 'آخر 30 يوم')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2.5">
            {insights.slice(0, 3).map((insight) => {
              const config = insightTypeConfig[insight.type];
              const Icon = config.icon;
              return (
                <li 
                  key={insight.id}
                  className={cn(
                    "flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30",
                    isRTL && "flex-row-reverse text-right"
                  )}
                >
                  <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", config.color)} />
                  <span className="text-sm leading-relaxed">{insight.text}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Recommended Actions Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className={cn("flex items-center gap-2 text-base", isRTL && "flex-row-reverse")}>
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            {t('Recommended Actions', 'الإجراءات الموصى بها')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2.5">
            {actions.slice(0, 3).map((action) => {
              const config = priorityConfig[action.priority];
              return (
                <div 
                  key={action.id}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <Badge variant="outline" className={cn("shrink-0 text-xs", config.color)}>
                    {config.label}
                  </Badge>
                  <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                    <p className="text-sm font-medium truncate">{action.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => navigate(action.route)}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

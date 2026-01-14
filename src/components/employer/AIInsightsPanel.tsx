import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  ArrowRight, 
  FileText,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Insight {
  id: string;
  text: string;
  impact?: string;
  action?: string;
  type: 'opportunity' | 'warning' | 'info';
  category: string;
}

interface AIInsightsPanelProps {
  insights: Insight[];
  lastUpdated?: string;
}

export function AIInsightsPanel({ insights, lastUpdated = "2 hours ago" }: AIInsightsPanelProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'opportunity':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-600',
          border: 'border-emerald-500/20',
          icon: TrendingUp
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-600',
          border: 'border-amber-500/20',
          icon: Lightbulb
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-600',
          border: 'border-blue-500/20',
          icon: Lightbulb
        };
    }
  };

  return (
    <Card className="border-violet-500/20 bg-gradient-to-br from-card via-card to-violet-500/5">
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "text-lg font-display font-semibold flex items-center gap-2",
          isRTL && "flex-row-reverse"
        )}>
          <div className="p-1.5 rounded-lg bg-violet-500/10">
            <Sparkles className="w-5 h-5 text-violet-500" />
          </div>
          AI Strategic Insights
          <Badge variant="outline" className="ml-auto text-[10px] bg-violet-500/10 text-violet-600 border-violet-500/20">
            Updated {lastUpdated}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {isRTL 
            ? "بناءً على بياناتك، إليك أهم الرؤى:"
            : "Based on your data, here are the top insights:"
          }
        </p>

        <div className="space-y-3">
          {insights.map((insight, index) => {
            const styles = getTypeStyles(insight.type);
            const TypeIcon = styles.icon;
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.4 }}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-200 hover:shadow-md",
                  styles.border,
                  "bg-gradient-to-r from-card to-transparent"
                )}
              >
                <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
                  <div className={cn("p-2 rounded-lg shrink-0 h-fit", styles.bg)}>
                    <TypeIcon className={cn("w-4 h-4", styles.text)} />
                  </div>
                  <div className={cn("flex-1 space-y-2", isRTL && "text-right")}>
                    <div className={cn("flex items-start justify-between gap-2", isRTL && "flex-row-reverse")}>
                      <p className="text-sm leading-relaxed">{insight.text}</p>
                      <Badge 
                        variant="outline" 
                        className={cn("text-[10px] shrink-0", styles.bg, styles.text, styles.border)}
                      >
                        {insight.category}
                      </Badge>
                    </div>
                    
                    {(insight.impact || insight.action) && (
                      <div className={cn(
                        "flex items-center gap-4 pt-2 border-t border-border/30 text-xs",
                        isRTL && "flex-row-reverse"
                      )}>
                        {insight.impact && (
                          <div className={cn("flex items-center gap-1", styles.text, isRTL && "flex-row-reverse")}>
                            <TrendingUp className="w-3 h-3" />
                            <span className="font-medium">{insight.impact}</span>
                          </div>
                        )}
                        {insight.action && (
                          <span className="text-muted-foreground">
                            {isRTL ? "الإجراء المقترح: " : "Suggested: "}
                            {insight.action}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className={cn(
          "flex flex-col sm:flex-row gap-2 pt-2",
          isRTL && "sm:flex-row-reverse"
        )}>
          <Link to="/employer/recommendations" className="flex-1">
            <Button variant="outline" className="w-full border-violet-500/30 text-violet-600 hover:bg-violet-500/10">
              <Lightbulb className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              {isRTL ? "عرض جميع الرؤى" : "View All Insights"}
              <ArrowRight className={cn("w-4 h-4", isRTL ? "mr-2 rotate-180" : "ml-2")} />
            </Button>
          </Link>
          <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
            <FileText className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? "إنشاء تقرير تنفيذي" : "Generate Executive Report"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

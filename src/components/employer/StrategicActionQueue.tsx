import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  FileCheck,
  Recycle,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface UrgentAction {
  id: string;
  title: string;
  subtitle: string;
  type: 'claims' | 'waste' | 'policy' | 'sla';
  count?: number;
  link: string;
  slaStatus?: 'safe' | 'warning' | 'critical';
  timeRemaining?: string;
}

interface Opportunity {
  id: string;
  title: string;
  impact: string;
  roi: string;
  effort: 'low' | 'medium' | 'high';
  category: string;
}

interface StrategicActionQueueProps {
  urgentActions: UrgentAction[];
  opportunities: Opportunity[];
}

export function StrategicActionQueue({ urgentActions, opportunities }: StrategicActionQueueProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'claims': return FileCheck;
      case 'waste': return Recycle;
      case 'policy': return BookOpen;
      case 'sla': return Clock;
      default: return AlertTriangle;
    }
  };

  const getSlaColor = (status?: string) => {
    switch (status) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'warning': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-emerald-500 bg-emerald-500/10';
    }
  };

  const getEffortBadge = (effort: string) => {
    const styles = {
      low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      high: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    return styles[effort as keyof typeof styles];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Urgent Actions */}
      <Card className="border-red-500/20 bg-gradient-to-br from-card via-card to-red-500/5">
        <CardHeader className="pb-3">
          <CardTitle className={cn(
            "text-base font-display font-semibold flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <div className="p-1.5 rounded-lg bg-red-500/10">
              <Zap className="w-4 h-4 text-red-500" />
            </div>
            Urgent Actions
            <Badge variant="outline" className="ml-auto text-[10px] bg-red-500/10 text-red-600 border-red-500/20">
              {urgentActions.length} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {urgentActions.map((action, index) => {
            const ActionIcon = getActionIcon(action.type);
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Link to={action.link}>
                  <div className={cn(
                    "p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-all duration-200 cursor-pointer group",
                    "flex items-center gap-3",
                    isRTL && "flex-row-reverse"
                  )}>
                    <div className={cn("p-2 rounded-lg shrink-0", getSlaColor(action.slaStatus))}>
                      <ActionIcon className="w-4 h-4" />
                    </div>
                    <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
                        <p className="text-sm font-medium truncate">{action.title}</p>
                        {action.count && (
                          <Badge variant="outline" className="text-[10px] bg-background">
                            {action.count}
                          </Badge>
                        )}
                      </div>
                      <div className={cn("flex items-center gap-2 mt-0.5", isRTL && "flex-row-reverse justify-end")}>
                        <p className="text-xs text-muted-foreground truncate">{action.subtitle}</p>
                        {action.timeRemaining && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px]",
                              action.slaStatus === 'critical' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                              action.slaStatus === 'warning' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                              "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            )}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {action.timeRemaining}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ExternalLink className={cn(
                      "w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
                      isRTL && "rotate-180"
                    )} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
          
          <Link to="/employer/claims">
            <Button variant="ghost" size="sm" className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-500/10">
              Resolve All Actions
              <ArrowRight className={cn("w-4 h-4 ml-1", isRTL && "rotate-180 mr-1 ml-0")} />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Opportunities */}
      <Card className="border-emerald-500/20 bg-gradient-to-br from-card via-card to-emerald-500/5">
        <CardHeader className="pb-3">
          <CardTitle className={cn(
            "text-base font-display font-semibold flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            Opportunities
            <Badge variant="outline" className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              AI Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {opportunities.map((opp, index) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={cn(
                "p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-all duration-200 cursor-pointer",
                isRTL && "text-right"
              )}
            >
              <div className={cn("flex items-start justify-between gap-2", isRTL && "flex-row-reverse")}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{opp.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{opp.impact}</p>
                </div>
                <div className={cn("flex items-center gap-1.5 shrink-0", isRTL && "flex-row-reverse")}>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {opp.roi}
                  </Badge>
                  <Badge variant="outline" className={cn("text-[10px]", getEffortBadge(opp.effort))}>
                    {opp.effort}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
          
          <Link to="/employer/recommendations">
            <Button variant="ghost" size="sm" className="w-full mt-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10">
              View All {opportunities.length} Opportunities
              <ArrowRight className={cn("w-4 h-4 ml-1", isRTL && "rotate-180 mr-1 ml-0")} />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

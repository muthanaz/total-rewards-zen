import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  User,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RecoveryInitiative {
  id: string;
  name: string;
  nameAr: string;
  target: number;
  recovered: number;
  owner: string;
  ownerInitials: string;
  dueDate: string;
  status: 'planning' | 'in_progress' | 'completed';
}

interface RecoveryTrackerProps {
  target: number;
  recovered: number;
  initiatives: RecoveryInitiative[];
  className?: string;
}

export function RecoveryTracker({
  target,
  recovered,
  initiatives,
  className
}: RecoveryTrackerProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `AED ${(value / 1000000).toFixed(1)}M`;
    }
    return `AED ${(value / 1000).toFixed(0)}K`;
  };

  const progressPercent = (recovered / target) * 100;
  const remaining = target - recovered;

  const getStatusConfig = (status: RecoveryInitiative['status']) => {
    switch (status) {
      case 'completed':
        return {
          label: isRTL ? 'مكتمل' : 'Completed',
          color: 'text-emerald-600',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          icon: CheckCircle2
        };
      case 'in_progress':
        return {
          label: isRTL ? 'قيد التنفيذ' : 'In Progress',
          color: 'text-blue-600',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          icon: TrendingUp
        };
      default:
        return {
          label: isRTL ? 'التخطيط' : 'Planning',
          color: 'text-amber-600',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          icon: Clock
        };
    }
  };

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "text-lg font-display font-semibold flex items-center gap-2",
          isRTL && "flex-row-reverse"
        )}>
          <div className="p-1.5 rounded-lg bg-emerald-500/10">
            <Target className="w-5 h-5 text-emerald-600" />
          </div>
          {isRTL ? "تتبع الاسترداد" : "Recovery Tracker"}
          <Badge variant="outline" className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            Q1 2024
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className={cn(
            "flex items-center justify-between",
            isRTL && "flex-row-reverse"
          )}>
            <div className={isRTL ? "text-right" : ""}>
              <p className="text-2xl font-bold tracking-tight text-emerald-600">
                {formatCurrency(recovered)}
              </p>
              <p className="text-xs text-muted-foreground">
                {isRTL ? `من ${formatCurrency(target)} المستهدف` : `of ${formatCurrency(target)} target`}
              </p>
            </div>
            <div className={cn(
              "text-right",
              isRTL && "text-left"
            )}>
              <p className="text-lg font-semibold text-muted-foreground">
                {formatCurrency(remaining)}
              </p>
              <p className="text-xs text-muted-foreground">
                {isRTL ? "متبقي" : "remaining"}
              </p>
            </div>
          </div>

          <div className="relative">
            <Progress 
              value={progressPercent} 
              className="h-3 bg-muted/50 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-emerald-400"
            />
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className={cn(
            "flex items-center justify-between text-xs",
            isRTL && "flex-row-reverse"
          )}>
            <span className="text-emerald-600 font-medium">
              {progressPercent.toFixed(0)}% {isRTL ? "مكتمل" : "recovered"}
            </span>
            <span className="text-muted-foreground">
              {isRTL ? "الهدف: نهاية الربع" : "Target: End of Quarter"}
            </span>
          </div>
        </div>

        {/* Initiatives List */}
        <div className="space-y-3">
          <h4 className={cn(
            "text-sm font-medium flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <Sparkles className="w-4 h-4 text-primary" />
            {isRTL ? "المبادرات النشطة" : "Active Initiatives"}
          </h4>

          <div className="space-y-2">
            {initiatives.slice(0, 3).map((initiative, index) => {
              const status = getStatusConfig(initiative.status);
              const initiativeProgress = (initiative.recovered / initiative.target) * 100;

              return (
                <motion.div
                  key={initiative.id}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-3 rounded-lg border bg-gradient-to-r from-card to-transparent hover:shadow-sm transition-all cursor-pointer",
                    status.border
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-between gap-3",
                    isRTL && "flex-row-reverse"
                  )}>
                    <div className={cn("flex items-center gap-3 flex-1", isRTL && "flex-row-reverse")}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {initiative.ownerInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                        <p className="text-sm font-medium truncate">
                          {isRTL ? initiative.nameAr : initiative.name}
                        </p>
                        <div className={cn(
                          "flex items-center gap-2 text-xs text-muted-foreground",
                          isRTL && "flex-row-reverse"
                        )}>
                          <span>{initiative.owner}</span>
                          <span>•</span>
                          <span>{initiative.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <div className={cn("text-right", isRTL && "text-left")}>
                        <p className="text-sm font-semibold">
                          {formatCurrency(initiative.recovered)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          / {formatCurrency(initiative.target)}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn("text-[10px]", status.bg, status.color, status.border)}
                      >
                        <status.icon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Progress 
                      value={initiativeProgress} 
                      className="h-1.5 bg-muted/30"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* View All Button */}
        <Button 
          variant="outline" 
          className="w-full border-primary/30 text-primary hover:bg-primary/10"
        >
          {isRTL ? "عرض جميع المبادرات" : "View All Initiatives"}
          <ChevronRight className={cn("w-4 h-4", isRTL ? "mr-2 rotate-180" : "ml-2")} />
        </Button>
      </CardContent>
    </Card>
  );
}

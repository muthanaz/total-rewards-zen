// Action Queue - Reusable action items list for pages
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  ChevronLeft, 
  Zap,
  AlertTriangle,
  Clock,
  CheckCircle2,
  LucideIcon,
  Calendar,
  TrendingUp,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow, isPast } from 'date-fns';
import { ar } from 'date-fns/locale';

export interface ActionItem {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  icon?: LucideIcon;
  route?: string;
  onClick?: () => void;
  priority?: 'high' | 'medium' | 'low' | 'critical';
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
  badge?: string;
  badgeAr?: string;
  value?: string | number;
  deadline?: string;
  dueDate?: Date | string;
  owner?: string;
  impact?: {
    value: number;
    unit?: 'AED' | 'days' | 'percent';
    label?: string;
  };
  metricKeys?: string[];
  confidence?: 'low' | 'medium' | 'high';
}

export interface ActionQueueProps {
  title?: string;
  titleAr?: string;
  actions: ActionItem[];
  maxItems?: number;
  showAll?: boolean;
  allLink?: string;
  emptyMessage?: string;
  emptyMessageAr?: string;
  className?: string;
}

export function ActionQueue({
  title,
  titleAr,
  actions,
  maxItems = 5,
  showAll = false,
  allLink,
  emptyMessage = 'No actions required',
  emptyMessageAr = 'لا توجد إجراءات مطلوبة',
  className,
}: ActionQueueProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const locale = isArabic ? ar : undefined;

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const displayedActions = showAll ? actions : actions.slice(0, maxItems);

  const getPriorityStyles = (priority?: ActionItem['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500/40 bg-red-500/10 hover:border-red-500/60';
      case 'high':
        return 'border-red-500/30 bg-red-500/5 hover:border-red-500/50';
      case 'medium':
        return 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50';
      default:
        return 'border-border/50 bg-card hover:border-accent/40';
    }
  };

  const getPriorityIcon = (priority?: ActionItem['priority']) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status?: ActionItem['status']) => {
    if (!status) return null;
    const configs = {
      pending: { label: isArabic ? 'قيد الانتظار' : 'Pending', color: 'bg-amber-500/10 text-amber-600' },
      in_progress: { label: isArabic ? 'قيد التنفيذ' : 'In Progress', color: 'bg-blue-500/10 text-blue-600' },
      completed: { label: isArabic ? 'مكتمل' : 'Completed', color: 'bg-emerald-500/10 text-emerald-600' },
      blocked: { label: isArabic ? 'محظور' : 'Blocked', color: 'bg-red-500/10 text-red-600' },
    };
    const config = configs[status];
    return config ? <Badge className={cn("text-xs", config.color)}>{config.label}</Badge> : null;
  };

  const getDueDateBadge = (dueDate?: Date | string) => {
    if (!dueDate) return null;
    const date = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const isOverdue = isPast(date);
    const timeLabel = formatDistanceToNow(date, { addSuffix: true, locale });
    
    if (isOverdue) {
      return (
        <Badge className="text-[10px] bg-red-500/10 text-red-600 gap-1">
          <Clock className="w-3 h-3" />
          {isArabic ? 'متأخر' : 'Overdue'}
        </Badge>
      );
    }
    return (
      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {timeLabel}
      </span>
    );
  };

  const formatImpact = (impact?: ActionItem['impact']) => {
    if (!impact) return null;
    const formattedValue = impact.unit === 'AED' 
      ? `AED ${impact.value.toLocaleString()}`
      : impact.unit === 'percent'
      ? `${impact.value}%`
      : `${impact.value} ${isArabic ? 'يوم' : 'days'}`;
    return (
      <span className="text-[10px] text-emerald-600 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        {formattedValue}
      </span>
    );
  };

  if (actions.length === 0) {
    return (
      <Card className={cn("border-border/50", className)}>
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
          <p className="text-sm text-muted-foreground">
            {isArabic ? emptyMessageAr : emptyMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50", className)}>
      {title && (
        <CardHeader className="pb-3">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <CardTitle className={cn("text-base flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Zap className="w-5 h-5 text-accent" />
              {isArabic && titleAr ? titleAr : title}
              <Badge variant="secondary" className="text-xs ml-2">
                {actions.length}
              </Badge>
            </CardTitle>
            {allLink && actions.length > maxItems && (
              <Link to={allLink}>
                <Button variant="ghost" size="sm" className={cn("gap-1", isRTL && "flex-row-reverse")}>
                  {isArabic ? 'عرض الكل' : 'View All'}
                  <ChevronIcon className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : ""}>
        <div className="space-y-2">
          {displayedActions.map((action, index) => {
            const ActionIcon = action.icon;
            const content = (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  getPriorityStyles(action.priority)
                )}
                onClick={action.onClick}
              >
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  {/* Icon */}
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    action.priority === 'high' ? 'bg-red-500/10' :
                    action.priority === 'medium' ? 'bg-amber-500/10' : 'bg-accent/10'
                  )}>
                    {ActionIcon ? (
                      <ActionIcon className={cn(
                        "w-4 h-4",
                        action.priority === 'high' ? 'text-red-500' :
                        action.priority === 'medium' ? 'text-amber-500' : 'text-accent'
                      )} />
                    ) : getPriorityIcon(action.priority) || (
                      <Zap className="w-4 h-4 text-accent" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                    <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
                      <p className="text-sm font-medium truncate">
                        {isArabic && action.titleAr ? action.titleAr : action.title}
                      </p>
                      {action.badge && (
                        <Badge variant="outline" className="text-xs">
                          {isArabic && action.badgeAr ? action.badgeAr : action.badge}
                        </Badge>
                      )}
                      {getStatusBadge(action.status)}
                    </div>
                    {action.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {isArabic && action.descriptionAr ? action.descriptionAr : action.description}
                      </p>
                    )}
                    {/* Due date, owner, impact row */}
                    {(action.dueDate || action.owner || action.impact) && (
                      <div className={cn("flex items-center gap-3 mt-1 flex-wrap", isRTL && "flex-row-reverse")}>
                        {action.owner && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {action.owner}
                          </span>
                        )}
                        {getDueDateBadge(action.dueDate)}
                        {formatImpact(action.impact)}
                      </div>
                    )}
                  </div>

                  {/* Value & Chevron */}
                  <div className={cn("flex items-center gap-2 shrink-0", isRTL && "flex-row-reverse")}>
                    {action.value && (
                      <span className="text-sm font-semibold text-foreground">
                        {action.value}
                      </span>
                    )}
                    <ChevronIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </motion.div>
            );

            return action.route ? (
              <Link key={action.id} to={action.route}>
                {content}
              </Link>
            ) : content;
          })}
        </div>
      </CardContent>
    </Card>
  );
}

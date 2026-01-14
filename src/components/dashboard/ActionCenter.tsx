import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  Calendar,
  FileText,
  Heart,
  Gift,
  Star,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: 'urgent' | 'recommended' | 'info';
  category: 'enrollment' | 'claim' | 'recognition' | 'deadline' | 'opportunity';
  icon: React.ElementType;
  deadline?: string;
  action: string;
  actionAr: string;
  route?: string;
}

const demoActions: ActionItem[] = [
  {
    id: '1',
    title: 'Health Insurance Renewal',
    titleAr: 'تجديد التأمين الصحي',
    description: 'Your annual enrollment window closes in 3 days',
    descriptionAr: 'تنتهي فترة التسجيل السنوي خلال 3 أيام',
    type: 'urgent',
    category: 'enrollment',
    icon: Heart,
    deadline: '3 days',
    action: 'Review Options',
    actionAr: 'مراجعة الخيارات',
    route: '/employee/health',
  },
  {
    id: '2',
    title: 'Recognize a Colleague',
    titleAr: 'تقدير زميل',
    description: "You haven't given recognition this month",
    descriptionAr: 'لم تقم بتقديم تقدير هذا الشهر',
    type: 'recommended',
    category: 'recognition',
    icon: Star,
    action: 'Give Recognition',
    actionAr: 'قدم تقدير',
  },
  {
    id: '3',
    title: 'Submit Education Claim',
    titleAr: 'تقديم مطالبة التعليم',
    description: 'AED 18,000 remaining in your education allowance',
    descriptionAr: '18,000 درهم متبقية في بدل التعليم',
    type: 'info',
    category: 'claim',
    icon: FileText,
    action: 'Submit Claim',
    actionAr: 'تقديم المطالبة',
    route: '/employee/schooling',
  },
  {
    id: '4',
    title: 'Unused Wellness Budget',
    titleAr: 'ميزانية العافية غير المستخدمة',
    description: 'Use your AED 2,800 wellness budget before Dec 31',
    descriptionAr: 'استخدم ميزانية العافية البالغة 2,800 درهم قبل 31 ديسمبر',
    type: 'recommended',
    category: 'opportunity',
    icon: Gift,
    deadline: 'Dec 31',
    action: 'Explore Options',
    actionAr: 'استكشف الخيارات',
    route: '/employee/wellbeing',
  },
];

interface ActionCenterProps {
  isRTL?: boolean;
  isArabic?: boolean;
  onActionClick?: (action: ActionItem) => void;
}

export function ActionCenter({ 
  isRTL = false, 
  isArabic = false,
  onActionClick,
}: ActionCenterProps) {
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const handleComplete = (id: string) => {
    setCompletedActions(prev => [...prev, id]);
  };

  const activeActions = demoActions.filter(a => !completedActions.includes(a.id));
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const getTypeStyles = (type: ActionItem['type']) => {
    switch (type) {
      case 'urgent':
        return 'border-l-4 border-l-action bg-action/5';
      case 'recommended':
        return 'border-l-4 border-l-accent bg-accent/5';
      case 'info':
        return 'border-l-4 border-l-info bg-info/5';
    }
  };

  const getTypeBadge = (type: ActionItem['type']) => {
    switch (type) {
      case 'urgent':
        return (
          <Badge className="bg-action/15 text-action border-0 text-[10px]">
            <AlertCircle className="w-3 h-3 mr-1" />
            {isArabic ? 'عاجل' : 'Urgent'}
          </Badge>
        );
      case 'recommended':
        return (
          <Badge className="bg-accent/15 text-accent border-0 text-[10px]">
            <Zap className="w-3 h-3 mr-1" />
            {isArabic ? 'موصى به' : 'Recommended'}
          </Badge>
        );
      case 'info':
        return (
          <Badge className="bg-info/15 text-info border-0 text-[10px]">
            <Clock className="w-3 h-3 mr-1" />
            {isArabic ? 'فرصة' : 'Opportunity'}
          </Badge>
        );
    }
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className={cn("text-lg font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="p-1.5 rounded-lg bg-action/10">
              <Zap className="w-4 h-4 text-action" />
            </div>
            {isArabic ? 'مركز الإجراءات' : 'Action Center'}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {activeActions.length} {isArabic ? 'مهام' : 'tasks'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="popLayout">
          {activeActions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {isArabic ? 'أنت على المسار الصحيح!' : "You're all caught up!"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isArabic ? 'لا توجد إجراءات معلقة' : 'No pending actions'}
              </p>
            </motion.div>
          ) : (
            activeActions.map((action, index) => (
              <motion.div
                key={action.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: isRTL ? 100 : -100 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  "todo-item group",
                  getTypeStyles(action.type),
                  isRTL && "flex-row-reverse border-l-0 border-r-4"
                )}
                onClick={() => onActionClick?.(action)}
              >
                <div className={cn(
                  "p-2 rounded-lg bg-background shrink-0",
                  action.type === 'urgent' && "bg-action/10",
                  action.type === 'recommended' && "bg-accent/10",
                  action.type === 'info' && "bg-info/10"
                )}>
                  <action.icon className={cn(
                    "w-4 h-4",
                    action.type === 'urgent' && "text-action",
                    action.type === 'recommended' && "text-accent",
                    action.type === 'info' && "text-info"
                  )} />
                </div>
                
                <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                  <div className={cn("flex items-center gap-2 mb-0.5", isRTL && "flex-row-reverse justify-end")}>
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {isArabic ? action.titleAr : action.title}
                    </h4>
                    {getTypeBadge(action.type)}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {isArabic ? action.descriptionAr : action.description}
                  </p>
                  {action.deadline && (
                    <div className={cn("flex items-center gap-1 mt-1 text-[10px] text-muted-foreground", isRTL && "flex-row-reverse justify-end")}>
                      <Clock className="w-3 h-3" />
                      {isArabic ? 'ينتهي في' : 'Due'}: {action.deadline}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComplete(action.id);
                  }}
                >
                  <span className="text-xs">{isArabic ? action.actionAr : action.action}</span>
                  <ChevronIcon className="w-3 h-3 ml-1" />
                </Button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

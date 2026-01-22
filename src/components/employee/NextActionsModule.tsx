/**
 * Next Actions Module
 * 
 * Always-visible ranked list of 3-5 next actions for the employee.
 * Each action is clickable and routes to the exact workflow step.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Upload, 
  UserPlus, 
  Receipt, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn, formatCurrencyAED } from '@/lib/utils';

export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
export type ActionType = 'upload_doc' | 'complete_profile' | 'submit_claim' | 'review_request' | 'action_required' | 'opportunity';

export interface NextAction {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  priority: ActionPriority;
  route: string;
  amount?: number;
  benefitCategory?: string;
  requestId?: string;
  dueDate?: string;
}

interface NextActionsModuleProps {
  actions: NextAction[];
  isRTL?: boolean;
  className?: string;
}

const actionIcons: Record<ActionType, React.ElementType> = {
  upload_doc: Upload,
  complete_profile: UserPlus,
  submit_claim: Receipt,
  review_request: FileText,
  action_required: AlertCircle,
  opportunity: Sparkles,
};

const priorityStyles: Record<ActionPriority, { badge: string; border: string; bg: string }> = {
  critical: { 
    badge: 'bg-destructive/10 text-destructive border-destructive/20',
    border: 'border-destructive/20',
    bg: 'bg-destructive/5',
  },
  high: { 
    badge: 'bg-warning/10 text-warning border-warning/20',
    border: 'border-warning/20',
    bg: 'bg-warning/5',
  },
  medium: { 
    badge: 'bg-info/10 text-info border-info/20',
    border: 'border-info/20',
    bg: 'bg-info/5',
  },
  low: { 
    badge: 'bg-muted text-muted-foreground border-border',
    border: 'border-border/40',
    bg: 'bg-muted/30',
  },
};

const priorityLabels: Record<ActionPriority, { en: string; ar: string }> = {
  critical: { en: 'Urgent', ar: 'عاجل' },
  high: { en: 'Important', ar: 'مهم' },
  medium: { en: 'Suggested', ar: 'مقترح' },
  low: { en: 'Optional', ar: 'اختياري' },
};

export function NextActionsModule({ 
  actions, 
  isRTL = false,
  className,
}: NextActionsModuleProps) {
  const navigate = useNavigate();
  
  // Sort by priority and take top 5
  const sortedActions = [...actions]
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5);

  if (sortedActions.length === 0) {
    return (
      <Card className={cn("border-success/20 bg-success/5", className)}>
        <CardContent className="p-5">
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div className={cn("flex-1", isRTL && "text-right")}>
              <h3 className="font-semibold text-base">
                {isRTL ? 'أنت على المسار الصحيح!' : "You're all caught up!"}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isRTL 
                  ? 'لا توجد إجراءات معلقة في الوقت الحالي'
                  : 'No pending actions at the moment'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/40", className)}>
      <CardHeader className="pb-3">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            {isRTL ? 'الخطوات التالية' : 'What to Do Next'}
          </CardTitle>
          {sortedActions.some(a => a.priority === 'critical' || a.priority === 'high') && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-[11px]">
              {sortedActions.filter(a => a.priority === 'critical' || a.priority === 'high').length}{' '}
              {isRTL ? 'مهم' : 'needs attention'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {sortedActions.map((action, index) => {
          const Icon = actionIcons[action.type];
          const style = priorityStyles[action.priority];
          
          return (
            <div
              key={action.id}
              className={cn(
                "group flex items-center gap-4 p-3.5 rounded-lg border cursor-pointer transition-all",
                style.border,
                style.bg,
                "hover:shadow-md hover:border-accent/30",
                isRTL && "flex-row-reverse"
              )}
              onClick={() => navigate(action.route)}
            >
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                action.priority === 'critical' ? 'bg-destructive/10' :
                action.priority === 'high' ? 'bg-warning/10' :
                'bg-accent/10'
              )}>
                <Icon className={cn(
                  "w-5 h-5",
                  action.priority === 'critical' ? 'text-destructive' :
                  action.priority === 'high' ? 'text-warning' :
                  'text-accent'
                )} />
              </div>

              {/* Content */}
              <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                <div className={cn("flex items-center gap-2 flex-wrap mb-0.5", isRTL && "flex-row-reverse justify-end")}>
                  <span className="font-medium text-sm text-foreground">
                    {action.title}
                  </span>
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", style.badge)}>
                    {isRTL ? priorityLabels[action.priority].ar : priorityLabels[action.priority].en}
                  </Badge>
                </div>
                <p className="text-[13px] text-muted-foreground line-clamp-1">
                  {action.description}
                </p>
                {action.amount && (
                  <p className="text-[12px] text-accent font-medium mt-0.5">
                    {formatCurrencyAED(action.amount)} {isRTL ? 'متاح' : 'available'}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight className={cn(
                "w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0",
                isRTL && "rotate-180 group-hover:-translate-x-0.5"
              )} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/**
 * Helper function to generate next actions from employee data
 */
export function generateNextActions(params: {
  pendingRequests: Array<{
    id: string;
    subject: string;
    category: string;
    hasMissingDocs: boolean;
    missingDocsCount?: number;
    status: string;
    amount?: number | null;
  }>;
  benefits: Array<{
    name: string;
    value: number;
    utilized: number;
    route: string;
    category: string;
  }>;
  profileCompleteness: number;
  missingFields: string[];
}): NextAction[] {
  const actions: NextAction[] = [];

  // 1. Missing documents (critical priority)
  params.pendingRequests
    .filter(r => r.hasMissingDocs)
    .forEach(r => {
      actions.push({
        id: `doc-${r.id}`,
        type: 'upload_doc',
        title: `Upload missing document${(r.missingDocsCount || 1) > 1 ? 's' : ''}`,
        description: `Request: ${r.subject}`,
        priority: 'critical',
        route: `/employee/requests?id=${r.id}`,
        requestId: r.id,
        benefitCategory: r.category,
      });
    });

  // 2. Incomplete profile (high priority if <80%)
  if (params.profileCompleteness < 80 && params.missingFields.length > 0) {
    actions.push({
      id: 'profile-incomplete',
      type: 'complete_profile',
      title: 'Complete your profile',
      description: `Missing: ${params.missingFields.slice(0, 2).join(', ')}${params.missingFields.length > 2 ? ` +${params.missingFields.length - 2} more` : ''}`,
      priority: params.profileCompleteness < 50 ? 'high' : 'medium',
      route: '/employee/profile',
    });
  }

  // 3. Underutilized benefits (medium priority - opportunities)
  params.benefits
    .filter(b => {
      const utilizationPercent = b.value > 0 ? (b.utilized / b.value) * 100 : 0;
      const remaining = b.value - b.utilized;
      return utilizationPercent < 30 && remaining > 1000;
    })
    .slice(0, 2)
    .forEach(b => {
      const remaining = b.value - b.utilized;
      actions.push({
        id: `opportunity-${b.name}`,
        type: 'opportunity',
        title: `Use your ${b.name}`,
        description: `You've only used ${Math.round((b.utilized / b.value) * 100)}% of this benefit`,
        priority: 'medium',
        route: b.route,
        amount: remaining,
        benefitCategory: b.category,
      });
    });

  // 4. Pending requests to review (low priority)
  params.pendingRequests
    .filter(r => !r.hasMissingDocs && r.status === 'in_review')
    .slice(0, 1)
    .forEach(r => {
      actions.push({
        id: `review-${r.id}`,
        type: 'review_request',
        title: 'Request in review',
        description: r.subject,
        priority: 'low',
        route: `/employee/requests?id=${r.id}`,
        requestId: r.id,
        amount: r.amount || undefined,
      });
    });

  return actions;
}

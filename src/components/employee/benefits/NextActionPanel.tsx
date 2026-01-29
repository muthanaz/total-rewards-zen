/**
 * NextActionPanel
 * 
 * Shows ONLY the single highest-priority action for the employee.
 * Priorities: Missing docs > Pending approval > Under-utilized benefit
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  ChevronRight,
  Sparkles,
  FileWarning,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export type ActionType = 'missing_docs' | 'pending_approval' | 'under_utilized' | 'none';

export interface NextActionItem {
  type: ActionType;
  title: string;
  description: string;
  route: string;
  amount?: number;
  benefitName?: string;
  requestId?: string;
  priority: 'critical' | 'high' | 'medium';
}

interface NextActionPanelProps {
  action: NextActionItem | null;
  isRTL?: boolean;
  className?: string;
}

const actionConfig: Record<ActionType, { 
  icon: React.ElementType; 
  bgColor: string; 
  iconColor: string;
  borderColor: string;
}> = {
  missing_docs: { 
    icon: FileWarning, 
    bgColor: 'bg-destructive/5', 
    iconColor: 'text-destructive',
    borderColor: 'border-destructive/20',
  },
  pending_approval: { 
    icon: Clock, 
    bgColor: 'bg-warning/5', 
    iconColor: 'text-warning',
    borderColor: 'border-warning/20',
  },
  under_utilized: { 
    icon: Sparkles, 
    bgColor: 'bg-accent/5', 
    iconColor: 'text-accent',
    borderColor: 'border-accent/20',
  },
  none: { 
    icon: CheckCircle, 
    bgColor: 'bg-success/5', 
    iconColor: 'text-success',
    borderColor: 'border-success/20',
  },
};

const priorityLabels: Record<NextActionItem['priority'], { en: string; ar: string }> = {
  critical: { en: 'Action Required', ar: 'إجراء مطلوب' },
  high: { en: 'Important', ar: 'مهم' },
  medium: { en: 'Recommended', ar: 'موصى به' },
};

export function NextActionPanel({ 
  action, 
  isRTL = false,
  className,
}: NextActionPanelProps) {
  const navigate = useNavigate();
  
  // No action needed - all caught up
  if (!action) {
    const config = actionConfig.none;
    return (
      <Card className={cn(config.borderColor, config.bgColor, className)}>
        <CardContent className="p-5">
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div className={cn("flex-1", isRTL && "text-right")}>
              <h3 className="font-semibold text-base text-foreground">
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
  
  const config = actionConfig[action.type];
  const Icon = config.icon;
  
  return (
    <Card className={cn(config.borderColor, config.bgColor, className)}>
      <CardContent className="p-5">
        <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
          {/* Icon */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            action.priority === 'critical' ? 'bg-destructive/10' :
            action.priority === 'high' ? 'bg-warning/10' : 'bg-accent/10'
          )}>
            <Icon className={cn(
              "w-6 h-6",
              action.priority === 'critical' ? 'text-destructive' :
              action.priority === 'high' ? 'text-warning' : 'text-accent'
            )} />
          </div>
          
          {/* Content */}
          <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
            <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse justify-end")}>
              <h3 className="font-semibold text-base text-foreground">
                {action.title}
              </h3>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] px-2 py-0",
                  action.priority === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                  action.priority === 'high' ? 'bg-warning/10 text-warning border-warning/20' :
                  'bg-accent/10 text-accent border-accent/20'
                )}
              >
                {isRTL ? priorityLabels[action.priority].ar : priorityLabels[action.priority].en}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {action.description}
            </p>
            {action.amount && action.amount > 0 && (
              <p className="text-sm font-medium text-accent mt-1">
                {formatCurrencyAED(action.amount)} {isRTL ? 'متاح' : 'available'}
              </p>
            )}
          </div>
          
          {/* CTA */}
          <Button 
            size="sm" 
            className={cn("shrink-0 gap-1", isRTL && "flex-row-reverse")}
            onClick={() => navigate(action.route)}
          >
            {isRTL ? 'انتقال' : 'Go'}
            <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Helper to determine the single highest-priority action
 */
export function getHighestPriorityAction(params: {
  pendingRequests: Array<{
    id: string;
    subject: string;
    category: string;
    hasMissingDocs: boolean;
    status: string;
  }>;
  benefits: Array<{
    name: string;
    value: number;
    utilized: number;
    route: string;
  }>;
}): NextActionItem | null {
  // Priority 1: Missing documents (critical)
  const missingDocsRequest = params.pendingRequests.find(r => r.hasMissingDocs);
  if (missingDocsRequest) {
    return {
      type: 'missing_docs',
      title: 'Upload missing documents',
      description: `Your ${missingDocsRequest.category} request needs documents`,
      route: `/employee/requests?id=${missingDocsRequest.id}`,
      priority: 'critical',
      requestId: missingDocsRequest.id,
      benefitName: missingDocsRequest.category,
    };
  }
  
  // Priority 2: Pending approval (high)
  const pendingRequest = params.pendingRequests.find(
    r => r.status === 'in_review' || r.status === 'submitted'
  );
  if (pendingRequest) {
    return {
      type: 'pending_approval',
      title: 'Request pending review',
      description: `Your ${pendingRequest.category} request is being processed`,
      route: `/employee/requests?id=${pendingRequest.id}`,
      priority: 'high',
      requestId: pendingRequest.id,
      benefitName: pendingRequest.category,
    };
  }
  
  // Priority 3: Under-utilized benefit (medium)
  const underUtilized = params.benefits.find(b => {
    const utilizationPercent = b.value > 0 ? (b.utilized / b.value) * 100 : 100;
    const remaining = b.value - b.utilized;
    return utilizationPercent < 30 && remaining > 1000;
  });
  
  if (underUtilized) {
    const remaining = underUtilized.value - underUtilized.utilized;
    return {
      type: 'under_utilized',
      title: `Use your ${underUtilized.name}`,
      description: `You still have ${Math.round((underUtilized.utilized / underUtilized.value) * 100)}% unused`,
      route: underUtilized.route,
      priority: 'medium',
      amount: remaining,
      benefitName: underUtilized.name,
    };
  }
  
  return null;
}

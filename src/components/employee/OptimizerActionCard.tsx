/**
 * OptimizerActionCard
 * 
 * Displays a single optimizer action with:
 * - Title and "Why it matters" explanation
 * - Estimated impact (AED or %) with confidence label
 * - Document checklist summary (if applicable)
 * - Primary CTA linking to real workflow
 * - Status pill matching workflow statuses
 */

import { useNavigate } from 'react-router-dom';
import { ChevronRight, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  OptimizerAction, 
  getPriorityStyle, 
  getConfidenceStyle,
  getStatusStyle 
} from '@/lib/optimizer/computeOutOfPocketOpportunities';

interface OptimizerActionCardProps {
  action: OptimizerAction;
}

export function OptimizerActionCard({ action }: OptimizerActionCardProps) {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const title = isRTL ? action.titleAr : action.title;
  const whyItMatters = isRTL ? action.whyItMattersAr : action.whyItMatters;
  const impactLabel = isRTL ? action.impactLabelAr : action.impactLabel;
  const category = isRTL ? action.categoryAr : action.category;
  const ctaLabel = isRTL ? action.ctaLabelAr : action.ctaLabel;

  const priorityLabel = {
    critical: isRTL ? 'حرج' : 'Critical',
    high: isRTL ? 'عالي' : 'High',
    medium: isRTL ? 'متوسط' : 'Medium',
    low: isRTL ? 'منخفض' : 'Low',
  }[action.priority];

  const confidenceLabel = {
    high: isRTL ? 'مؤكد' : 'Confirmed',
    medium: isRTL ? 'متوسط' : 'Medium',
    low: isRTL ? 'منخفض' : 'Low',
    estimated: isRTL ? 'تقدير' : 'Estimated',
  }[action.confidence];

  const handleClick = () => {
    navigate(action.route);
  };

  return (
    <Card
      className={cn(
        "border-border/50 hover:border-accent/30 hover:shadow-sm transition-all cursor-pointer group",
        action.priority === 'critical' && "border-l-2 border-l-destructive",
        action.priority === 'high' && "border-l-2 border-l-warning"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <action.icon className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Content */}
          <div className={cn("flex-1 min-w-0 space-y-2", isRTL && "text-right")}>
            {/* Header Row */}
            <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse justify-end")}>
              <h3 className="font-medium text-sm">{title}</h3>
              <Badge variant="outline" className={cn("text-[10px] px-1.5", getPriorityStyle(action.priority))}>
                {priorityLabel}
              </Badge>
            </div>

            {/* Why it matters */}
            <p className="text-xs text-muted-foreground">{whyItMatters}</p>

            {/* Impact and Confidence Row */}
            <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse justify-end")}>
              {/* Impact */}
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-success/10 text-success border-success/20">
                {impactLabel}
              </Badge>
              
              {/* Confidence */}
              <Badge variant="outline" className={cn("text-[10px] px-1.5", getConfidenceStyle(action.confidence))}>
                {confidenceLabel}
              </Badge>

              {/* Category */}
              <span className="text-[10px] text-muted-foreground">• {category}</span>
            </div>

            {/* Document Checklist (if applicable) */}
            {action.documentChecklist && action.documentChecklist.length > 0 && (
              <div className={cn("mt-2 p-2 rounded-md bg-muted/50", isRTL && "text-right")}>
                <p className="text-[10px] font-medium text-muted-foreground mb-1">
                  {isRTL ? 'المستندات المطلوبة:' : 'Documents needed:'}
                </p>
                <ul className="space-y-0.5">
                  {action.documentChecklist.slice(0, 3).map((doc, i) => (
                    <li key={i} className={cn("flex items-center gap-1.5 text-xs", isRTL && "flex-row-reverse")}>
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <span>{doc}</span>
                    </li>
                  ))}
                  {action.documentChecklist.length > 3 && (
                    <li className="text-[10px] text-muted-foreground">
                      +{action.documentChecklist.length - 3} {isRTL ? 'المزيد' : 'more'}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={cn("flex items-center gap-2 shrink-0", isRTL && "flex-row-reverse")}>
            {/* Confidence info popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 text-sm" align={isRTL ? "start" : "end"}>
                <div className={cn("space-y-2", isRTL && "text-right")}>
                  <p className="font-medium">{isRTL ? 'كيف نحسب هذا' : 'How we calculated this'}</p>
                  <p className="text-muted-foreground text-xs">{action.confidenceNote}</p>
                </div>
              </PopoverContent>
            </Popover>

            {/* Primary CTA */}
            <Button
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              {ctaLabel}
              <ChevronRight className={cn("w-3 h-3", isRTL && "rotate-180")} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact summary card for Dashboard entry point
 */
interface OptimizerSummaryCardProps {
  potentialSavings: number;
  actionCount: number;
  onClick: () => void;
}

export function OptimizerSummaryCard({ potentialSavings, actionCount, onClick }: OptimizerSummaryCardProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  return (
    <Card
      className="border-accent/20 bg-accent/5 hover:bg-accent/10 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-accent" />
          </div>
          <div className={cn("flex-1", isRTL && "text-right")}>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'وفورات محتملة' : 'Potential savings'}
            </p>
            <p className="font-semibold">
              AED {potentialSavings.toLocaleString('en-US')}
            </p>
            <p className="text-xs text-muted-foreground">
              {actionCount} {isRTL ? 'إجراءات متاحة' : 'actions available'}
            </p>
          </div>
          <ChevronRight className={cn("w-5 h-5 text-accent", isRTL && "rotate-180")} />
        </div>
      </CardContent>
    </Card>
  );
}

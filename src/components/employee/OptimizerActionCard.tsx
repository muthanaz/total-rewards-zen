/**
 * OptimizerActionCard
 * 
 * Displays a single optimizer action with:
 * - Title, category tag, severity tag
 * - Savings amount + timeframe + confidence
 * - "Why this helps" one-liner
 * - Prerequisites (collapsible)
 * - Primary CTA
 * 
 * CRITICAL:
 * - Every savings number shows timeframe and confidence
 * - Coverage benefits show "Covered benefit" not AED
 * - Uses formatCurrencyAED for all currency
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, ChevronUp, HelpCircle, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  OptimizerAction, 
  getPriorityStyle, 
  getConfidenceStyle,
  getStatusStyle,
  getTimeframeLabel,
  getConfidenceLabel,
} from '@/lib/optimizer/computeOutOfPocketOpportunities';

interface OptimizerActionCardProps {
  action: OptimizerAction;
}

export function OptimizerActionCard({ action }: OptimizerActionCardProps) {
  const navigate = useNavigate();
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [prereqsOpen, setPrereqsOpen] = useState(false);

  const lang = isRTL ? 'ar' : 'en';
  const title = isRTL ? action.titleAr : action.title;
  const whyItMatters = isRTL ? action.whyItMattersAr : action.whyItMatters;
  const impactLabel = isRTL ? action.impactLabelAr : action.impactLabel;
  const category = isRTL ? action.categoryAr : action.category;
  const ctaLabel = isRTL ? action.ctaLabelAr : action.ctaLabel;
  const howCalculated = isRTL ? action.howCalculatedAr : action.howCalculated;
  const prerequisites = isRTL ? action.prerequisitesAr : action.prerequisites;
  const severityTag = isRTL ? action.severityTagAr : action.severityTag;

  const priorityLabel = {
    critical: isRTL ? 'حرج' : 'Critical',
    high: isRTL ? 'عالي' : 'High',
    medium: isRTL ? 'متوسط' : 'Medium',
    low: isRTL ? 'منخفض' : 'Low',
  }[action.priority];

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
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            action.status === 'blocked' ? 'bg-destructive/10' : 'bg-muted'
          )}>
            <action.icon className={cn(
              "w-5 h-5",
              action.status === 'blocked' ? 'text-destructive' : 'text-muted-foreground'
            )} />
          </div>

          {/* Content */}
          <div className={cn("flex-1 min-w-0 space-y-2", isRTL && "text-right")}>
            {/* Header: Title + Tags */}
            <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse justify-end")}>
              <h3 className="font-medium text-sm">{title}</h3>
              {severityTag && (
                <Badge variant="outline" className={cn("text-[10px] px-1.5", getStatusStyle(action.status))}>
                  {severityTag}
                </Badge>
              )}
              <Badge variant="outline" className={cn("text-[10px] px-1.5", getPriorityStyle(action.priority))}>
                {priorityLabel}
              </Badge>
            </div>

            {/* Why it matters */}
            <p className="text-xs text-muted-foreground line-clamp-2">{whyItMatters}</p>

            {/* Impact Row: Amount + Timeframe + Confidence */}
            <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse justify-end")}>
              {/* Impact badge */}
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs px-2 py-0.5",
                  action.estimatedImpact !== null 
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {impactLabel}
              </Badge>
              
              {/* Timeframe */}
              <span className="text-[10px] text-muted-foreground">
                {getTimeframeLabel(action.timeframe, lang)}
              </span>
              
              {/* Confidence with calculation popover */}
              <Popover>
                <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Badge 
                    variant="outline" 
                    className={cn("text-[10px] px-1.5 cursor-help gap-1", getConfidenceStyle(action.confidence))}
                  >
                    {getConfidenceLabel(action.confidence, lang)}
                    <HelpCircle className="w-2.5 h-2.5" />
                  </Badge>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-72 text-sm" 
                  align={isRTL ? "start" : "end"}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={cn("space-y-2", isRTL && "text-right")}>
                    <p className="font-medium text-xs">
                      {isRTL ? 'كيف نحسب هذا' : 'How we calculated this'}
                    </p>
                    <p className="text-xs text-muted-foreground">{howCalculated}</p>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Category */}
              <span className="text-[10px] text-muted-foreground">• {category}</span>
            </div>

            {/* Prerequisites (collapsible) */}
            {prerequisites && prerequisites.length > 0 && (
              <Collapsible open={prereqsOpen} onOpenChange={setPrereqsOpen}>
                <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn("h-6 px-2 text-[10px] gap-1", isRTL && "flex-row-reverse")}
                  >
                    <AlertCircle className="w-3 h-3 text-destructive" />
                    {isRTL 
                      ? `${prerequisites.length} مستندات مطلوبة`
                      : `${prerequisites.length} documents needed`}
                    {prereqsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent onClick={(e) => e.stopPropagation()}>
                  <div className={cn("mt-2 p-2 rounded-md bg-muted/50", isRTL && "text-right")}>
                    <ul className="space-y-1">
                      {prerequisites.map((doc, i) => (
                        <li key={i} className={cn("flex items-center gap-1.5 text-xs", isRTL && "flex-row-reverse")}>
                          <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          {/* CTA */}
          <div className={cn("flex items-center shrink-0", isRTL && "flex-row-reverse")}>
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

export default OptimizerActionCard;

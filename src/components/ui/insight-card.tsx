import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lightbulb, TrendingUp, AlertTriangle, Info, ArrowRight, ArrowLeft,
  User, Building2, Shield, Store, DollarSign, Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { ConfidenceGate, type ConfidenceLevel } from '@/components/employer/ConfidenceGate';

export interface InsightAction {
  label: string;
  labelAr: string;
  route?: string;
  onClick?: () => void;
}

export interface InsightCardProps {
  id: string;
  type: 'opportunity' | 'warning' | 'info' | 'success';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  whyItMatters?: string;
  whyItMattersAr?: string;
  owner?: 'employee' | 'employer' | 'admin' | 'vendor';
  impact?: {
    value: string;
    valueAr: string;
    type: 'savings' | 'time' | 'satisfaction' | 'risk';
  };
  confidence?: ConfidenceLevel;
  action?: InsightAction;
  className?: string;
  compact?: boolean;
}

export function InsightCard({
  id,
  type,
  title,
  titleAr,
  description,
  descriptionAr,
  whyItMatters,
  whyItMattersAr,
  owner,
  impact,
  confidence = 'high',
  action,
  className,
  compact = false,
}: InsightCardProps) {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const getTypeConfig = () => {
    const configs = {
      opportunity: {
        icon: Lightbulb,
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-600',
        badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        label: isArabic ? 'فرصة' : 'Opportunity',
      },
      warning: {
        icon: AlertTriangle,
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-600',
        badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        label: isArabic ? 'تحذير' : 'Warning',
      },
      info: {
        icon: Info,
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-600',
        badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        label: isArabic ? 'معلومات' : 'Info',
      },
      success: {
        icon: TrendingUp,
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-600',
        badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        label: isArabic ? 'نجاح' : 'Success',
      },
    };
    return configs[type];
  };

  const getOwnerIcon = () => {
    if (!owner) return null;
    const icons = {
      employee: User,
      employer: Building2,
      admin: Shield,
      vendor: Store,
    };
    return icons[owner];
  };

  const getImpactIcon = () => {
    if (!impact) return null;
    const icons = {
      savings: DollarSign,
      time: Clock,
      satisfaction: TrendingUp,
      risk: AlertTriangle,
    };
    return icons[impact.type];
  };

  const config = getTypeConfig();
  const TypeIcon = config.icon;
  const OwnerIcon = getOwnerIcon();
  const ImpactIcon = getImpactIcon();

  const handleAction = () => {
    if (action?.onClick) {
      action.onClick();
    } else if (action?.route) {
      navigate(action.route);
    }
  };

  return (
    <ConfidenceGate confidence={confidence} showEstimatedLabel={confidence === 'medium'}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={cn(
          "border transition-all hover:shadow-md",
          config.border,
          config.bg,
          className
        )}>
          <CardContent className={cn("p-4", compact && "p-3")}>
            <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
              {/* Icon */}
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                config.bg
              )}>
                <TypeIcon className={cn("w-4 h-4", config.text)} />
              </div>

              {/* Content */}
              <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                {/* Header with badges */}
                <div className={cn(
                  "flex items-center gap-2 flex-wrap mb-1",
                  isRTL && "flex-row-reverse"
                )}>
                  <h4 className="text-sm font-medium truncate">
                    {isArabic ? titleAr : title}
                  </h4>
                  <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", config.badge)}>
                    {config.label}
                  </Badge>
                  {owner && OwnerIcon && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 gap-1">
                      <OwnerIcon className="w-2.5 h-2.5" />
                      {owner}
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {isArabic ? descriptionAr : description}
                </p>

                {/* Why it matters */}
                {whyItMatters && !compact && (
                  <p className={cn(
                    "text-xs mt-2 pt-2 border-t border-border/30",
                    config.text
                  )}>
                    <span className="font-medium">
                      {isArabic ? 'لماذا هذا مهم: ' : 'Why it matters: '}
                    </span>
                    {isArabic ? whyItMattersAr : whyItMatters}
                  </p>
                )}

                {/* Impact & Action */}
                {(impact || action) && (
                  <div className={cn(
                    "flex items-center justify-between mt-3 pt-2 border-t border-border/30",
                    isRTL && "flex-row-reverse"
                  )}>
                    {impact && ImpactIcon && (
                      <div className={cn(
                        "flex items-center gap-1.5 text-xs",
                        config.text,
                        isRTL && "flex-row-reverse"
                      )}>
                        <ImpactIcon className="w-3.5 h-3.5" />
                        <span className="font-medium">
                          {isArabic ? impact.valueAr : impact.value}
                        </span>
                      </div>
                    )}

                    {action && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAction}
                        className={cn(
                          "h-7 text-xs gap-1",
                          config.text,
                          isRTL && "flex-row-reverse"
                        )}
                      >
                        {isArabic ? action.labelAr : action.label}
                        <ArrowIcon className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </ConfidenceGate>
  );
}

// Wrapper for a list of insights
interface InsightListProps {
  insights: InsightCardProps[];
  maxItems?: number;
  showAllLink?: string;
  title?: string;
  titleAr?: string;
  className?: string;
}

export function InsightList({
  insights,
  maxItems = 3,
  showAllLink,
  title,
  titleAr,
  className,
}: InsightListProps) {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  const displayedInsights = insights.slice(0, maxItems);

  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <div className={cn(
          "flex items-center justify-between",
          isRTL && "flex-row-reverse"
        )}>
          <h3 className="text-sm font-medium">
            {isArabic ? titleAr : title}
          </h3>
          {showAllLink && insights.length > maxItems && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(showAllLink)}
              className={cn("text-xs gap-1", isRTL && "flex-row-reverse")}
            >
              {isArabic ? 'عرض الكل' : 'View all'}
              {isRTL ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            </Button>
          )}
        </div>
      )}
      
      <div className="space-y-2">
        {displayedInsights.map((insight) => (
          <InsightCard key={insight.id} {...insight} compact />
        ))}
      </div>
    </div>
  );
}

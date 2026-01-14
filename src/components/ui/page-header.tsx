import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  period?: {
    label: string;
    labelAr?: string;
  };
  primaryAction?: {
    label: string;
    labelAr?: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    labelAr?: string;
    onClick: () => void;
  };
  breadcrumb?: {
    label: string;
    labelAr?: string;
    href?: string;
  };
  className?: string;
  children?: ReactNode;
}

export function PageHeader({
  title,
  titleAr,
  subtitle,
  subtitleAr,
  period,
  primaryAction,
  secondaryAction,
  breadcrumb,
  className,
  children,
}: PageHeaderProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumb */}
      {breadcrumb && (
        <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", isRTL && "flex-row-reverse")}>
          <span>{isArabic && breadcrumb.labelAr ? breadcrumb.labelAr : breadcrumb.label}</span>
          <ChevronIcon className="w-4 h-4" />
          <span className="text-foreground font-medium">{isArabic && titleAr ? titleAr : title}</span>
        </div>
      )}

      {/* Header Row */}
      <div className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4",
        isRTL && "md:flex-row-reverse"
      )}>
        <div className={cn("space-y-1", isRTL && "text-right")}>
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              {isArabic && titleAr ? titleAr : title}
            </h1>
            {period && (
              <Badge variant="outline" className="gap-1.5 font-normal">
                <Calendar className="w-3.5 h-3.5" />
                {isArabic && period.labelAr ? period.labelAr : period.label}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-muted-foreground">
              {isArabic && subtitleAr ? subtitleAr : subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        {(primaryAction || secondaryAction || children) && (
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            {children}
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {isArabic && secondaryAction.labelAr ? secondaryAction.labelAr : secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button 
                variant={primaryAction.variant || 'default'} 
                onClick={primaryAction.onClick}
                className={cn("gap-2", isRTL && "flex-row-reverse")}
              >
                {primaryAction.icon}
                {isArabic && primaryAction.labelAr ? primaryAction.labelAr : primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

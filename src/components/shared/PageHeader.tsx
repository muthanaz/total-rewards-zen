import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon, ShoppingBag, ArrowRight } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  badge?: {
    label: string;
    icon?: LucideIcon;
    variant?: 'default' | 'accent' | 'success' | 'warning';
  };
  // Support for inline data confidence badge
  confidenceBadge?: ReactNode;
  actions?: ReactNode;
  className?: string;
  // Compact mode for nested sections
  compact?: boolean;
  // Partner offers button for benefit pages
  partnerOffersCategory?: string;
}

// Maps benefit categories to marketplace filter categories
const BENEFIT_TO_MARKETPLACE_MAP: Record<string, string> = {
  'Housing': 'Home & Living',
  'Schooling': 'Learning',
  'Health Insurance': 'Wellness',
  'Health': 'Wellness',
  'Transport': 'Transport',
  'Wellbeing': 'Fitness',
  'Learning & Development': 'Learning',
  'Learning': 'Learning',
  'Financial Planning': 'Financial',
  'Long-Term Financials': 'Financial',
};

const badgeVariants = {
  default: 'bg-muted text-muted-foreground border-border',
  accent: 'bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
};

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconClassName,
  badge,
  confidenceBadge,
  actions,
  className,
  compact = false,
  partnerOffersCategory,
}: PageHeaderProps) {
  const marketplaceCategory = partnerOffersCategory 
    ? BENEFIT_TO_MARKETPLACE_MAP[partnerOffersCategory] || 'All' 
    : null;

  return (
    <div className={cn(
      'flex flex-col md:flex-row md:items-center justify-between gap-4',
      compact && 'gap-2',
      className
    )}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn(
            "p-2 rounded-xl bg-gradient-to-br shadow-lg shrink-0",
            compact && "p-1.5 rounded-lg",
            iconClassName || "from-accent to-accent/80 shadow-accent/25"
          )}>
            <Icon className={cn("text-white", compact ? "w-4 h-4" : "w-6 h-6")} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className={cn(
              "font-display font-bold",
              compact ? "text-lg" : "text-2xl"
            )}>
              {title}
            </h1>
            {badge && (
              <Badge 
                variant="outline" 
                className={cn("w-fit", badgeVariants[badge.variant || 'default'])}
              >
                {badge.icon && <badge.icon className="w-3.5 h-3.5 mr-1.5" />}
                {badge.label}
              </Badge>
            )}
            {confidenceBadge}
          </div>
          {description && (
            <p className={cn(
              "text-muted-foreground mt-1",
              compact && "text-sm"
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {partnerOffersCategory && marketplaceCategory && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-success/5 border-success/30 text-success hover:bg-success/10 hover:text-success"
            asChild
          >
            <Link to={`/employee/marketplace?category=${encodeURIComponent(marketplaceCategory)}`}>
              <ShoppingBag className="w-4 h-4" />
              Partner Offers
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}

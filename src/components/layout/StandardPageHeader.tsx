/**
 * StandardPageHeader
 * 
 * Unified page header component for all portals with consistent layout and spacing.
 * 
 * Layout (identical across all variants):
 * - Top Row: Title (left) | Primary CTA (right)
 * - Second Row: Helper text (left) | Meta badges (right)
 * - Third Row (optional): Tabs OR Filters bar (never both)
 * 
 * Variants:
 * - employee: Helper text always present, meta badges hidden, CTA only when actionable
 * - hr_ops: Status chips + quick filters in second row, supports batch/export CTAs
 * - executive: "Last updated" + "Data readiness/confidence" in second row
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================================
// TYPES
// ============================================================================

export type HeaderVariant = 'employee' | 'hr_ops' | 'executive';

interface MetaBadge {
  label: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
}

interface PrimaryCTA {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

interface StandardPageHeaderProps {
  /** Portal variant - determines layout behavior */
  variant: HeaderVariant;
  
  /** Page title - should be job-to-be-done, not module name */
  title: string;
  titleAr?: string;
  
  /** Helper text - what user should do/expect (1 sentence max) */
  helperText?: string;
  helperTextAr?: string;
  
  /** Optional icon for the title */
  icon?: LucideIcon;
  iconClassName?: string;
  
  /** Primary CTA - only one allowed (never multiple primary buttons) */
  primaryCTA?: PrimaryCTA;
  
  /** Secondary actions (outline buttons) */
  secondaryActions?: ReactNode;
  
  /** Meta badges shown in second row (executive: data confidence, hr_ops: status chips) */
  metaBadges?: MetaBadge[];
  
  /** Custom meta content for second row right side */
  metaContent?: ReactNode;
  
  /** Last updated timestamp (executive variant) */
  lastUpdated?: string | Date;
  
  /** Data confidence component (executive variant) */
  confidenceBadge?: ReactNode;
  
  /** Tabs component (third row - exclusive with filters) */
  tabs?: ReactNode;
  
  /** Filters bar (third row - exclusive with tabs) */
  filters?: ReactNode;
  
  /** Make header sticky (only for HR Ops table-heavy pages) */
  sticky?: boolean;
  
  /** Additional className */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StandardPageHeader({
  variant,
  title,
  titleAr,
  helperText,
  helperTextAr,
  icon: Icon,
  iconClassName,
  primaryCTA,
  secondaryActions,
  metaBadges = [],
  metaContent,
  lastUpdated,
  confidenceBadge,
  tabs,
  filters,
  sticky = false,
  className,
}: StandardPageHeaderProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const displayTitle = language === 'ar' && titleAr ? titleAr : title;
  const displayHelperText = language === 'ar' && helperTextAr ? helperTextAr : helperText;
  
  // Format last updated for executive variant
  const formattedLastUpdated = lastUpdated 
    ? typeof lastUpdated === 'string' 
      ? lastUpdated 
      : formatRelativeTime(lastUpdated)
    : null;

  // Determine what to show in second row based on variant
  const showSecondRow = Boolean(
    displayHelperText || 
    metaBadges.length > 0 || 
    metaContent || 
    (variant === 'executive' && (formattedLastUpdated || confidenceBadge))
  );

  // Determine third row content
  const thirdRowContent = tabs || filters;

  return (
    <header
      className={cn(
        'space-y-3',
        sticky && 'sticky top-0 z-20 bg-background/95 backdrop-blur-sm -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 border-b',
        className
      )}
    >
      {/* Row 1: Title + Primary CTA */}
      <div className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3',
        isRTL && 'sm:flex-row-reverse'
      )}>
        {/* Left: Icon + Title */}
        <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
          {Icon && (
            <div className={cn(
              'p-2 rounded-xl bg-gradient-to-br shadow-lg shrink-0',
              iconClassName || 'from-primary to-primary/80 shadow-primary/25'
            )}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            {displayTitle}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className={cn(
          'flex items-center gap-2 shrink-0',
          isRTL && 'flex-row-reverse'
        )}>
          {secondaryActions}
          {primaryCTA && (
            <Button
              onClick={primaryCTA.onClick}
              disabled={primaryCTA.disabled}
              className="gap-2"
            >
              {primaryCTA.icon && <primaryCTA.icon className="w-4 h-4" />}
              {primaryCTA.label}
            </Button>
          )}
        </div>
      </div>

      {/* Row 2: Helper text / Meta badges */}
      {showSecondRow && (
        <div className={cn(
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2',
          isRTL && 'sm:flex-row-reverse'
        )}>
          {/* Left: Helper text */}
          <div className={cn('flex-1 min-w-0', isRTL && 'text-right')}>
            {displayHelperText && (
              <p className="text-sm text-muted-foreground truncate">
                {displayHelperText}
              </p>
            )}
          </div>

          {/* Right: Meta content based on variant */}
          <div className={cn(
            'flex items-center gap-2 shrink-0 flex-wrap',
            isRTL && 'flex-row-reverse'
          )}>
            {/* Executive variant: Last updated + Confidence */}
            {variant === 'executive' && (
              <>
                {formattedLastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {formattedLastUpdated}
                  </span>
                )}
                {confidenceBadge}
              </>
            )}

            {/* HR Ops variant: Status chips */}
            {variant === 'hr_ops' && metaBadges.length > 0 && (
              <div className={cn('flex items-center gap-1.5 flex-wrap', isRTL && 'flex-row-reverse')}>
                {metaBadges.map((badge, i) => (
                  <Badge
                    key={i}
                    variant={badge.variant === 'default' ? 'default' : 'outline'}
                    className={cn(
                      'text-xs',
                      badge.variant === 'success' && 'border-success/50 bg-success/10 text-success',
                      badge.variant === 'warning' && 'border-warning/50 bg-warning/10 text-warning',
                      badge.variant === 'destructive' && 'border-destructive/50 bg-destructive/10 text-destructive'
                    )}
                  >
                    {badge.icon && <badge.icon className="w-3 h-3 mr-1" />}
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}

            {/* Employee variant: Hide meta badges by default, only show if explicitly set */}
            {variant === 'employee' && metaContent}

            {/* Custom meta content */}
            {metaContent && variant !== 'employee'}
          </div>
        </div>
      )}

      {/* Row 3: Tabs OR Filters (never both) */}
      {thirdRowContent && (
        <div className="pt-1">
          {thirdRowContent}
        </div>
      )}
    </header>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default StandardPageHeader;

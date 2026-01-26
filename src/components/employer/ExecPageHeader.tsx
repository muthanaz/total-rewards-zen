/**
 * ExecPageHeader
 * 
 * Standard header for all Executive pages with Board-ready toggle.
 * Reduces UI density when in Board mode.
 */

import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExecModeToggle } from './ExecModeToggle';
import { useExecMode } from './ExecModeContext';
import { DemoModeBadge } from '@/components/shared/DemoDataGate';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface ExecPageHeaderProps {
  /** Page title */
  title: string;
  titleAr?: string;
  /** Optional subtitle/description (hidden in Board mode) */
  description?: string;
  descriptionAr?: string;
  /** Optional badge next to title */
  badge?: ReactNode;
  /** Right-side actions */
  actions?: ReactNode;
  /** Additional content below header (filters, etc.) */
  children?: ReactNode;
  className?: string;
}

export function ExecPageHeader({
  title,
  titleAr,
  description,
  descriptionAr,
  badge,
  actions,
  children,
  className,
}: ExecPageHeaderProps) {
  const { language, direction } = useLanguage();
  const { isBoard } = useExecMode();
  const { isDemoMode } = useDemoMode();
  const isRTL = direction === 'rtl';
  
  const displayTitle = language === 'ar' && titleAr ? titleAr : title;
  const displayDescription = language === 'ar' && descriptionAr ? descriptionAr : description;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main header row */}
      <div className={cn(
        'flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4',
        isRTL && 'lg:flex-row-reverse'
      )}>
        {/* Left: Title + description */}
        <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
          <div className={isRTL ? 'text-right' : ''}>
            <div className={cn(
              'flex items-center gap-2 flex-wrap',
              isRTL && 'flex-row-reverse'
            )}>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {displayTitle}
              </h1>
              {badge}
              {isDemoMode && <DemoModeBadge />}
            </div>
            {/* Description hidden in Board mode for density reduction */}
            {displayDescription && !isBoard && (
              <p className="text-muted-foreground mt-1">
                {displayDescription}
              </p>
            )}
          </div>
        </div>

        {/* Right: Board-ready toggle + actions */}
        <div className={cn(
          'flex items-center gap-3 flex-wrap',
          isRTL && 'flex-row-reverse'
        )}>
          <ExecModeToggle />
          {actions}
        </div>
      </div>

      {/* Children (filters, etc.) - hidden in Board mode if too complex */}
      {children}
    </div>
  );
}

export default ExecPageHeader;

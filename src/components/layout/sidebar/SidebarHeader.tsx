import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface SidebarHeaderProps {
  /** Optional role badge (e.g., "Admin", "Vendor") */
  roleBadge?: string;
  /** Optional role badge color class */
  roleBadgeClass?: string;
  /** Custom logo icon - defaults to gradient "b" */
  logoIcon?: ReactNode;
  /** Additional content after utilities (e.g., demo toggle, view mode toggle) */
  extraContent?: ReactNode;
}

/**
 * SidebarHeader - Consistent header with logo, role badge, and utility controls.
 * Matches Employee sidebar exactly.
 */
export function SidebarHeader({
  roleBadge,
  roleBadgeClass = 'bg-accent/20 text-accent-foreground',
  logoIcon,
  extraContent,
}: SidebarHeaderProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  return (
    <div className="px-4 py-5 border-b border-sidebar-border">
      <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
        <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
          {logoIcon || (
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shrink-0">
              <span className="text-sidebar-background font-bold text-lg">b</span>
            </div>
          )}
          <span className="font-display text-xl font-bold text-sidebar-foreground">bnft.</span>
          {roleBadge && (
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full shrink-0',
                roleBadgeClass,
                isRTL ? 'mr-1' : 'ml-1'
              )}
            >
              {roleBadge}
            </span>
          )}
        </div>
      </div>

      {/* Theme & Language Controls */}
      <div
        className={cn(
          'flex items-center gap-1 mt-3 pt-3 border-t border-sidebar-border/50',
          isRTL && 'flex-row-reverse'
        )}
      >
        <NotificationCenter />
        <LanguageSwitcher />
        <DarkModeToggle />
      </div>

      {/* Extra content slot */}
      {extraContent}
    </div>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { useSidebarShell } from './SidebarShell';
import { FlaskConical } from 'lucide-react';

export interface SidebarItemProps {
  /** Navigation path */
  path: string;
  /** Display label */
  label: string;
  /** Arabic label */
  labelAr?: string;
  /** Icon component */
  icon: React.ElementType;
  /** Optional badge text */
  badge?: string;
  /** Optional badge count */
  badgeCount?: number;
  /** Whether item is in beta */
  isBeta?: boolean;
  /** Indent level (0, 1, 2) */
  indent?: number;
  /** Optional custom active check */
  isActiveOverride?: boolean;
  /** Whether this is the primary nav item in a group */
  isPrimary?: boolean;
}

/**
 * SidebarItem - Individual navigation item.
 * Matches Employee sidebar nav item style exactly (height, icon size, gap, hover, active states).
 */
export function SidebarItem({
  path,
  label,
  labelAr,
  icon: Icon,
  badge,
  badgeCount,
  isBeta = false,
  indent = 0,
  isActiveOverride,
  isPrimary = false,
}: SidebarItemProps) {
  const location = useLocation();
  const { language, direction } = useLanguage();
  const { setMobileOpen } = useSidebarShell();
  const isRTL = direction === 'rtl';

  // Active check: exact for base paths, prefix for nested
  const isActive =
    isActiveOverride !== undefined
      ? isActiveOverride
      : path === location.pathname ||
        (path !== '/' &&
          path !== '/employee' &&
          path !== '/employer' &&
          path !== '/admin' &&
          path !== '/vendor' &&
          location.pathname.startsWith(path + '/'));

  // Handle exact dashboard routes
  const isDashboard = ['/employee', '/employer', '/admin', '/vendor'].includes(path);
  const isActiveForDashboard = isDashboard && location.pathname === path;
  const finalActive = isDashboard ? isActiveForDashboard : isActive;

  const displayLabel = language === 'ar' && labelAr ? labelAr : label;

  const indentClass =
    indent === 1 ? (isRTL ? 'pr-4' : 'pl-4') : indent === 2 ? (isRTL ? 'pr-8' : 'pl-8') : '';

  return (
    <Link
      to={path}
      onClick={() => setMobileOpen(false)}
      className={cn(
        'nav-item',
        finalActive && 'nav-item-active',
        isPrimary && !finalActive && 'font-medium',
        isRTL && 'flex-row-reverse text-right',
        indentClass
      )}
    >
      <Icon className={cn(
        'w-4 h-4 shrink-0',
        finalActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/70'
      )} />
      <span className={cn(
        'text-sm flex-1',
        finalActive ? 'text-sidebar-primary' : 'text-sidebar-foreground',
        isRTL && 'text-right'
      )}>{displayLabel}</span>
      {badge && (
        <Badge
          variant="secondary"
          className="text-[9px] px-1.5 py-0 h-4 bg-accent/10 text-accent border-accent/20"
        >
          {badge}
        </Badge>
      )}
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-destructive text-destructive-foreground">
          {badgeCount}
        </span>
      )}
      {isBeta && <FlaskConical className="w-3 h-3 text-amber-500 shrink-0" />}
    </Link>
  );
}

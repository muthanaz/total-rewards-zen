import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { useSidebarShell } from './SidebarShell';
import { FlaskConical } from 'lucide-react';

interface SidebarItemProps {
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

  // Indent classes for sub-items
  const indentClass =
    indent === 1 ? (isRTL ? 'pr-3' : 'pl-3') : indent === 2 ? (isRTL ? 'pr-6' : 'pl-6') : '';

  // Smaller styling for indented items
  const iconSize = indent > 0 ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize = indent > 0 ? 'text-[13px]' : 'text-sm';

  return (
    <Link
      to={path}
      onClick={() => setMobileOpen(false)}
      className={cn(
        'nav-item',
        finalActive && 'nav-item-active',
        isRTL && 'flex-row-reverse text-right',
        indentClass
      )}
    >
      <Icon className={cn(iconSize, 'shrink-0')} />
      <span className={cn(textSize, 'flex-1', isRTL && 'text-right')}>{displayLabel}</span>
      {badge && (
        <Badge
          variant="secondary"
          className="text-[9px] px-1.5 py-0 h-4 bg-sidebar-primary/15 text-sidebar-primary border-sidebar-primary/20"
        >
          {badge}
        </Badge>
      )}
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-destructive text-destructive-foreground">
          {badgeCount}
        </span>
      )}
      {isBeta && <FlaskConical className="w-3 h-3 text-amber-500" />}
    </Link>
  );
}

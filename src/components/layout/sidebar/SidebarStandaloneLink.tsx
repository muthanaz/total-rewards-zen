import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSidebarShell } from './SidebarShell';

interface SidebarStandaloneLinkProps {
  /** Navigation path */
  path: string;
  /** Display label */
  label: string;
  /** Arabic label */
  labelAr?: string;
  /** Icon component */
  icon: React.ElementType;
}

/**
 * SidebarStandaloneLink - A section-level standalone link (no children).
 * Matches Employee sidebar standalone style exactly.
 */
export function SidebarStandaloneLink({
  path,
  label,
  labelAr,
  icon: Icon,
}: SidebarStandaloneLinkProps) {
  const location = useLocation();
  const { language, direction } = useLanguage();
  const { setMobileOpen } = useSidebarShell();
  const isRTL = direction === 'rtl';

  const isActive =
    path === location.pathname ||
    location.pathname.startsWith(path + '/');

  const displayLabel = language === 'ar' && labelAr ? labelAr : label;

  return (
    <div className="mb-1 mt-3 first:mt-0">
      <Link
        to={path}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'nav-item',
          isActive && 'nav-item-active',
          isRTL && 'flex-row-reverse text-right'
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-sm">{displayLabel}</span>
      </Link>
    </div>
  );
}

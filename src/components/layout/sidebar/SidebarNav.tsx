import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarNavProps {
  children: ReactNode;
}

/**
 * SidebarNav - Scrollable navigation container.
 * Matches Employee sidebar padding and spacing exactly.
 */
export function SidebarNav({ children }: SidebarNavProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  return (
    <nav
      className={cn(
        'flex-1 overflow-y-auto py-4 px-3 space-y-1',
        'scroll-shadow',
        isRTL && 'text-right'
      )}
    >
      {children}
    </nav>
  );
}

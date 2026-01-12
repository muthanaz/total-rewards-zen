import { Outlet, useLocation } from 'react-router-dom';
import { EmployerSidebar } from './EmployerSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { PageTransition } from '@/components/ui/page-transition';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function EmployerLayout() {
  const location = useLocation();
  const showBreadcrumbs = location.pathname !== '/employer';
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  return (
    <div className="min-h-screen bg-background">
      <EmployerSidebar />
      <main className={cn(
        "transition-all duration-300",
        isRTL ? "lg:pr-64" : "lg:pl-64"
      )}>
        <div className="p-4 lg:p-8">
          {showBreadcrumbs && <Breadcrumbs />}
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>
    </div>
  );
}

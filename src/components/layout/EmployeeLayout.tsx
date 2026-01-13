import { Outlet, useLocation } from 'react-router-dom';
import { EmployeeSidebar } from './EmployeeSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { FloatingActionButton } from './FloatingActionButton';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { PageTransition } from '@/components/ui/page-transition';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function EmployeeLayout() {
  const location = useLocation();
  const showBreadcrumbs = location.pathname !== '/employee';
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  return (
    <div className="min-h-screen bg-background">
      <EmployeeSidebar />
      <main className={cn(
        "transition-all duration-300 pb-20 lg:pb-0",
        isRTL ? "lg:pr-64" : "lg:pl-64"
      )}>
        <div className="p-4 lg:p-6 pt-16 lg:pt-6 max-w-7xl mx-auto">
          {showBreadcrumbs && <Breadcrumbs />}
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>
      <MobileBottomNav />
      <FloatingActionButton />
    </div>
  );
}

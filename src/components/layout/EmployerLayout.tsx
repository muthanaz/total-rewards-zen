import { Outlet, useLocation } from 'react-router-dom';
import { EmployerSidebar } from './EmployerSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { PageTransition } from '@/components/ui/page-transition';

export function EmployerLayout() {
  const location = useLocation();
  const showBreadcrumbs = location.pathname !== '/employer';

  return (
    <div className="min-h-screen bg-background">
      <EmployerSidebar />
      <main className="lg:pl-64">
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

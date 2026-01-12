import { Outlet, useLocation } from 'react-router-dom';
import { EmployeeSidebar } from './EmployeeSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { PageTransition } from '@/components/ui/page-transition';

export function EmployeeLayout() {
  const location = useLocation();
  const showBreadcrumbs = location.pathname !== '/employee';

  return (
    <div className="min-h-screen bg-background">
      <EmployeeSidebar />
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

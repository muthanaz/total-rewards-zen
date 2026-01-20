// Employer Layout Component
import { Outlet, useLocation } from 'react-router-dom';
import { EmployerSidebar } from './EmployerSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { useLanguage } from '@/contexts/LanguageContext';
import { EmployerViewModeProvider } from '@/contexts/EmployerViewModeContext';
import { cn } from '@/lib/utils';

export function EmployerLayout() {
  const location = useLocation();
  const showBreadcrumbs = location.pathname !== '/employer';
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  return (
    <EmployerViewModeProvider>
      <div className="min-h-screen bg-background">
        <EmployerSidebar />
        <main
          className={cn(
            'transition-all duration-300',
            isRTL ? 'lg:pr-64' : 'lg:pl-64'
          )}
        >
          <div className="p-4 lg:p-8">
            {showBreadcrumbs && <Breadcrumbs />}
            {/* NOTE: Removed PageTransition wrapper to prevent any overlapping route renders */}
            <Outlet />
          </div>
        </main>
      </div>
    </EmployerViewModeProvider>
  );
}

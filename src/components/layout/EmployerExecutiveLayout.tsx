/**
 * EmployerExecutiveLayout
 * 
 * Layout for Employer Executive mode routes.
 * Uses shared sidebar components with Employee Portal styling.
 */

import { Outlet, useLocation } from 'react-router-dom';
import { EmployerExecutiveSidebar } from './EmployerExecutiveSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { useLanguage } from '@/contexts/LanguageContext';
import { EmployerViewModeProvider } from '@/contexts/EmployerViewModeContext';
import { SkipLink, MainContent } from '@/components/ui/skip-link';
import { cn } from '@/lib/utils';

export function EmployerExecutiveLayout() {
  const location = useLocation();
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  // Show breadcrumbs on all pages except the main executive summary
  const showBreadcrumbs = location.pathname !== '/employer/executive-summary';

  return (
    <EmployerViewModeProvider>
      <div className="min-h-screen bg-background">
        <SkipLink targetId="executive-main-content" />
        <EmployerExecutiveSidebar />
        <MainContent
          id="executive-main-content"
          className={cn(
            'transition-all duration-300',
            isRTL ? 'lg:pr-64' : 'lg:pl-64'
          )}
        >
          <div className="p-4 lg:p-8">
            {showBreadcrumbs && <Breadcrumbs />}
            <Outlet />
          </div>
        </MainContent>
      </div>
    </EmployerViewModeProvider>
  );
}

export default EmployerExecutiveLayout;

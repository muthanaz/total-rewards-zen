// Employer Layout Component - Switches between HR Ops and Executive sidebars
import { Outlet, useLocation } from 'react-router-dom';
import { EmployerSidebar } from './EmployerSidebar';
import { EmployerExecutiveSidebar } from './EmployerExecutiveSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { useLanguage } from '@/contexts/LanguageContext';
import { EmployerViewModeProvider, useEmployerViewMode } from '@/contexts/EmployerViewModeContext';
import { SkipLink, MainContent } from '@/components/ui/skip-link';
import { cn } from '@/lib/utils';

function EmployerLayoutContent() {
  const location = useLocation();
  const { direction } = useLanguage();
  const { isExecutive } = useEmployerViewMode();
  const isRTL = direction === 'rtl';

  // Show breadcrumbs on all pages except landing pages
  const isLandingPage = location.pathname === '/employer' || 
                        location.pathname === '/employer/executive-summary' ||
                        location.pathname === '/employer/claims';
  const showBreadcrumbs = !isLandingPage;

  return (
    <div className="min-h-screen bg-background">
      <SkipLink targetId="employer-main-content" />
      {isExecutive ? <EmployerExecutiveSidebar /> : <EmployerSidebar />}
      <MainContent
        id="employer-main-content"
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
  );
}

export function EmployerLayout() {
  return (
    <EmployerViewModeProvider>
      <EmployerLayoutContent />
    </EmployerViewModeProvider>
  );
}

import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { SkipLink, MainContent } from '@/components/ui/skip-link';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export function AdminLayout() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  return (
    <div className={cn("min-h-screen bg-background", isRTL && "rtl")}>
      <SkipLink targetId="admin-main-content" />
      <AdminSidebar />
      <MainContent 
        id="admin-main-content"
        className={cn(
          "transition-all duration-300",
          isRTL ? "lg:mr-64" : "lg:ml-64"
        )}
      >
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </MainContent>
    </div>
  );
}
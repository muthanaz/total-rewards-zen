import { Outlet } from 'react-router-dom';
import { VendorSidebar } from './VendorSidebar';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export function VendorLayout() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  return (
    <div className={cn("min-h-screen bg-background", isRTL && "rtl")}>
      <VendorSidebar />
      <main className={cn(
        "transition-all duration-300",
        isRTL ? "lg:mr-64" : "lg:ml-64"
      )}>
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  Heart,
  Calendar,
  User,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavItem {
  label: string;
  labelAr: string;
  path: string;
  icon: React.ElementType;
}

// 5 core items for bottom nav
const bottomNavItems: NavItem[] = [
  { label: 'Home', labelAr: 'الرئيسية', path: '/employee', icon: LayoutDashboard },
  { label: 'Benefits', labelAr: 'المزايا', path: '/employee/benefits', icon: Wallet },
  { label: 'Health', labelAr: 'الصحة', path: '/employee/health', icon: Heart },
  { label: 'Leave', labelAr: 'إجازة', path: '/employee/leave', icon: Calendar },
  { label: 'Profile', labelAr: 'الملف', path: '/employee/profile', icon: User },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const isActive = (path: string) => {
    if (path === '/employee') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={cn(
      "bottom-nav safe-area-bottom",
      isRTL && "flex-row-reverse"
    )}>
      <div className={cn(
        "flex items-center justify-around w-full",
        isRTL && "flex-row-reverse"
      )}>
        {bottomNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'bottom-nav-item flex-1',
              isActive(item.path) && 'bottom-nav-item-active'
            )}
          >
            <div className={cn(
              "p-2 rounded-xl transition-all",
              isActive(item.path) 
                ? "bg-primary/15 text-primary" 
                : "text-muted-foreground"
            )}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className={cn(
              "text-[10px] font-medium",
              isActive(item.path) ? "text-primary" : "text-muted-foreground"
            )}>
              {language === 'ar' ? item.labelAr : item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  Heart,
  GraduationCap,
  Calendar,
  FileText,
  User,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface NavItem {
  labelKey: string;
  label: string;
  labelAr: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

// Consolidated Navigation - 8 core items
const navigation: NavItem[] = [
  { labelKey: 'nav.overview', label: 'Overview', labelAr: 'نظرة عامة', path: '/employee', icon: LayoutDashboard },
  { labelKey: 'nav.allowances', label: 'Allowances', labelAr: 'البدلات', path: '/employee/benefits', icon: Wallet },
  { labelKey: 'nav.health', label: 'Health & Wellbeing', labelAr: 'الصحة والرفاهية', path: '/employee/health', icon: Heart },
  { labelKey: 'nav.learning', label: 'Learning', labelAr: 'التعلم', path: '/employee/learning', icon: GraduationCap },
  { labelKey: 'nav.leave', label: 'Time Off', labelAr: 'الإجازات', path: '/employee/leave', icon: Calendar },
  { labelKey: 'nav.documents', label: 'Documents', labelAr: 'المستندات', path: '/employee/documents', icon: FileText },
  { labelKey: 'nav.profile', label: 'Profile', labelAr: 'الملف الشخصي', path: '/employee/profile', icon: User },
];

export function EmployeeSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t, language, direction } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRTL = direction === 'rtl';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    if (path === '/employee') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-sidebar-border/50">
        <div className={cn(
          "flex items-center justify-between",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">b</span>
            </div>
            <div>
              <span className="font-display text-xl font-bold text-sidebar-foreground">bnft.</span>
              <span className="block text-[10px] text-sidebar-foreground/50 font-medium tracking-wider uppercase">Benefits Platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-b border-sidebar-border/30">
        <div className={cn(
          "flex items-center gap-1.5",
          isRTL && "flex-row-reverse"
        )}>
          <NotificationCenter />
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4 px-3 space-y-1",
        isRTL && "text-right"
      )}>
        {navigation.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'nav-item group',
              isActive(item.path) && 'nav-item-active',
              isRTL && 'flex-row-reverse text-right'
            )}
          >
            <div className={cn(
              "p-2 rounded-xl transition-colors",
              isActive(item.path) 
                ? "bg-sidebar-primary/20" 
                : "bg-sidebar-accent/50 group-hover:bg-sidebar-primary/10"
            )}>
              <item.icon className="w-4 h-4 shrink-0" />
            </div>
            <span className={cn("text-sm font-medium flex-1", isRTL && "text-right")}>
              {language === 'ar' ? item.labelAr : item.label}
            </span>
            {item.badge && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Marketplace - Premium CTA */}
      <div className={cn("px-3 pb-4", isRTL && "text-right")}>
        <Link
          to="/employee/marketplace"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-4 rounded-2xl transition-all duration-300",
            "bg-gradient-to-r from-violet-600/20 via-fuchsia-500/20 to-pink-500/20",
            "hover:from-violet-600/30 hover:via-fuchsia-500/30 hover:to-pink-500/30",
            "border border-violet-500/30 hover:border-violet-500/50",
            "group shadow-lg shadow-violet-500/10",
            isActive('/employee/marketplace') && "from-violet-600/30 via-fuchsia-500/30 to-pink-500/30 border-violet-500/50",
            isRTL && "flex-row-reverse"
          )}
        >
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className={cn("flex-1", isRTL && "text-right")}>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-semibold",
                isActive('/employee/marketplace') 
                  ? "text-violet-400" 
                  : "text-sidebar-foreground group-hover:text-violet-400"
              )}>
                {isRTL ? 'العروض والخصومات' : 'Perks & Discounts'}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            </div>
            <span className="text-[11px] text-sidebar-foreground/50">
              {isRTL ? 'عروض حصرية للموظفين' : 'Exclusive employee deals'}
            </span>
          </div>
          <ChevronIcon className={cn(
            "w-4 h-4 text-violet-400/50 group-hover:text-violet-400 transition-all",
            "group-hover:translate-x-0.5",
            isRTL && "rotate-180 group-hover:-translate-x-0.5"
          )} />
        </Link>
      </div>

      {/* Sign Out */}
      <div className={cn("p-4 border-t border-sidebar-border/30", isRTL && "text-right")}>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-destructive/10 rounded-xl transition-all",
            isRTL ? "justify-start flex-row-reverse" : "justify-start"
          )}
        >
          <LogOut className={cn("w-4 h-4 shrink-0", isRTL ? "ml-3" : "mr-3")} />
          <span className={isRTL ? "text-right" : "text-left"}>{t('common.signOut')}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={cn(
          "fixed top-4 z-50 p-3 rounded-2xl bg-white dark:bg-slate-900 text-foreground shadow-lg lg:hidden",
          isRTL ? "right-4" : "left-4"
        )}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 z-40 h-screen w-72 flex flex-col bg-sidebar transition-transform duration-300 shadow-2xl',
          isRTL ? 'right-0 lg:translate-x-0' : 'left-0 lg:translate-x-0',
          isRTL 
            ? (mobileOpen ? 'translate-x-0' : 'translate-x-full')
            : (mobileOpen ? 'translate-x-0' : '-translate-x-full')
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

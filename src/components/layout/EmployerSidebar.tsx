import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  DollarSign,
  Ghost,
  Users,
  FileCheck,
  ShoppingBag,
  FileText,
  Lightbulb,
  Menu,
  X,
  LogOut,
  Database,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

interface NavItem {
  labelKey: string;
  path: string;
  icon: React.ElementType;
}

const navigation: NavItem[] = [
  { labelKey: 'nav.overview', path: '/employer', icon: LayoutDashboard },
  { labelKey: 'nav.spendUtilization', path: '/employer/spend', icon: DollarSign },
  { labelKey: 'nav.zombieSpend', path: '/employer/zombie', icon: Ghost },
  { labelKey: 'nav.employeeSegments', path: '/employer/segments', icon: Users },
  { labelKey: 'nav.claimsApprovals', path: '/employer/claims', icon: FileCheck },
  { labelKey: 'nav.marketplaceAnalytics', path: '/employer/marketplace', icon: ShoppingBag },
  { labelKey: 'nav.policyInsights', path: '/employer/policies', icon: FileText },
  { labelKey: 'nav.integrations', path: '/employer/integrations', icon: Database },
  { labelKey: 'nav.recommendations', path: '/employer/recommendations', icon: Lightbulb },
];

export function EmployerSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { t, direction } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRTL = direction === 'rtl';

  const isActive = (path: string) => location.pathname === path;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center justify-between px-4 py-5 border-b border-sidebar-border",
        isRTL && "flex-row-reverse"
      )}>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
            <span className="text-sidebar-background font-bold text-lg">b</span>
          </div>
          <span className="font-display text-xl font-bold text-sidebar-foreground">bnft.</span>
          <span className={cn(
            "px-2 py-0.5 text-xs font-medium rounded-full bg-sidebar-accent text-sidebar-primary",
            isRTL ? "mr-1" : "ml-1"
          )}>
            {t('common.employer')}
          </span>
        </div>
        <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4 px-3 space-y-0.5",
        isRTL && "text-right"
      )}>
        {navigation.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'nav-item',
              isActive(item.path) && 'nav-item-active',
              isRTL && 'flex-row-reverse text-right'
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className={cn("text-sm flex-1", isRTL && "text-right")}>{t(item.labelKey)}</span>
          </Link>
        ))}
      </nav>

      {/* Sign Out */}
      <div className={cn("p-4 border-t border-sidebar-border", isRTL && "text-right")}>
        <Button
          variant="ghost"
          onClick={() => signOut()}
          className={cn(
            "w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            isRTL ? "justify-start flex-row-reverse" : "justify-start"
          )}
        >
          <LogOut className={cn("w-4 h-4 shrink-0", isRTL ? "ml-3" : "mr-3")} />
          <span className={isRTL ? "text-right" : "text-left"}>{t('common.signOut')}</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={cn(
          "fixed top-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground lg:hidden",
          isRTL ? "right-4" : "left-4"
        )}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 z-40 h-screen w-64 flex flex-col bg-sidebar transition-transform duration-300',
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

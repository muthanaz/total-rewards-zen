import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Globe,
  TrendingUp,
  Users,
  Building2,
  FileBarChart,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  ChevronDown,
  Wallet,
  Sliders,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface NavGroup {
  title: string;
  titleAr: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  labelAr: string;
  path: string;
  icon: React.ElementType;
}

const navigationGroups: NavGroup[] = [
  {
    title: 'Platform Overview',
    titleAr: 'نظرة عامة على المنصة',
    items: [
      { label: 'Super Admin Dashboard', labelAr: 'لوحة المشرف العام', path: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Benchmarking',
    titleAr: 'المقارنة المعيارية',
    items: [
      { label: 'Regional & Industry', labelAr: 'إقليمي وصناعي', path: '/admin/benchmarks', icon: Globe },
    ],
  },
  {
    title: 'Market Intelligence',
    titleAr: 'ذكاء السوق',
    items: [
      { label: 'User Intent & Segments', labelAr: 'نوايا وشرائح المستخدمين', path: '/admin/market', icon: Users },
      { label: 'Spending Patterns', labelAr: 'أنماط الإنفاق', path: '/admin/spending', icon: Wallet },
    ],
  },
  {
    title: 'Platform Management',
    titleAr: 'إدارة المنصة',
    items: [
      { label: 'Organizations', labelAr: 'المنظمات', path: '/admin/organizations', icon: Building2 },
      { label: 'Saved Reports', labelAr: 'التقارير المحفوظة', path: '/admin/reports', icon: FileBarChart },
    ],
  },
  {
    title: 'Configuration',
    titleAr: 'التكوين',
    items: [
      { label: 'UI Configuration', labelAr: 'تكوين الواجهة', path: '/admin/ui-config', icon: Sliders },
      { label: 'Data Migration', labelAr: 'ترحيل البيانات', path: '/admin/data-migration', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Settings',
    titleAr: 'الإعدادات',
    items: [
      { label: 'Platform Settings', labelAr: 'إعدادات المنصة', path: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, direction } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(navigationGroups.map(g => g.title));
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;
  
  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupTitle) 
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className={cn(
          "flex items-center justify-between",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-base font-bold text-sidebar-foreground leading-tight">
                {isArabic ? 'المكافآت الشاملة' : 'Total Rewards'}
              </span>
              <span className="text-[10px] text-sidebar-foreground/60 font-medium flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {isArabic ? 'المشرف العام' : 'Super Admin'}
              </span>
            </div>
          </div>
        </div>
        {/* Theme & Language Controls */}
        <div className={cn(
          "flex items-center gap-1 mt-3 pt-3 border-t border-sidebar-border/50",
          isRTL && "flex-row-reverse"
        )}>
          <NotificationCenter />
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4 px-3",
        isRTL && "text-right"
      )}>
        {navigationGroups.map((group) => (
          <div key={group.title} className="mb-4">
            <button
              onClick={() => toggleGroup(group.title)}
              className={cn(
                "flex items-center justify-between w-full px-2 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground/70 transition-colors",
                isRTL && "flex-row-reverse"
              )}
            >
              <span>{language === 'ar' ? group.titleAr : group.title}</span>
              <ChevronDown className={cn(
                "w-3 h-3 transition-transform",
                expandedGroups.includes(group.title) ? "rotate-180" : ""
              )} />
            </button>
            
            {expandedGroups.includes(group.title) && (
              <div className="space-y-0.5 mt-1">
                {group.items.map((item) => (
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
                    <span className={cn("text-sm flex-1", isRTL && "text-right")}>
                      {language === 'ar' ? item.labelAr : item.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Sign Out */}
      <div className={cn("p-4 border-t border-sidebar-border", isRTL && "text-right")}>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            isRTL ? "justify-start flex-row-reverse" : "justify-start"
          )}
        >
          <LogOut className={cn("w-4 h-4 shrink-0", isRTL ? "ml-3" : "mr-3")} />
          <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
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

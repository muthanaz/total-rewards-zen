import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Home,
  GraduationCap,
  Heart,
  Car,
  Dumbbell,
  PiggyBank,
  BookOpen,
  Calendar,
  FileText,
  User,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Menu,
  X,
  LogOut,
  ShoppingBag,
  Sparkles,
  Award,
  Shield,
  BarChart3,
  Building2,
  Landmark,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface NavItem {
  label: string;
  labelAr: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  title: string;
  titleAr: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

// Properly organized navigation structure
const navigationGroups: NavGroup[] = [
  {
    title: 'Overview',
    titleAr: 'نظرة عامة',
    defaultOpen: true,
    items: [
      { label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/employee', icon: LayoutDashboard },
      { label: 'Benefits Analysis', labelAr: 'تحليل المزايا', path: '/employee/benefits-analysis', icon: BarChart3 },
    ],
  },
  {
    title: 'Cash & Allowances',
    titleAr: 'النقد والبدلات',
    defaultOpen: true,
    items: [
      { label: 'All Benefits', labelAr: 'جميع المزايا', path: '/employee/benefits', icon: Award },
      { label: 'Housing', labelAr: 'السكن', path: '/employee/housing', icon: Home },
      { label: 'Education', labelAr: 'التعليم', path: '/employee/schooling', icon: GraduationCap },
      { label: 'Transport', labelAr: 'النقل', path: '/employee/transport', icon: Car },
      { label: 'Annual Bonus', labelAr: 'المكافأة السنوية', path: '/employee/bonus', icon: Award },
    ],
  },
  {
    title: 'Health & Wellbeing',
    titleAr: 'الصحة والرفاهية',
    items: [
      { label: 'Health Insurance', labelAr: 'التأمين الصحي', path: '/employee/health', icon: Heart },
      { label: 'Wellbeing', labelAr: 'الرفاهية', path: '/employee/wellbeing', icon: Dumbbell },
    ],
  },
  {
    title: 'Financial & Growth',
    titleAr: 'المالية والنمو',
    items: [
      { label: 'Savings Plan', labelAr: 'خطة الادخار', path: '/employee/financial', icon: PiggyBank },
      { label: 'Equity', labelAr: 'الأسهم', path: '/employee/equity', icon: Building2 },
      { label: 'Learning', labelAr: 'التعلم', path: '/employee/learning', icon: BookOpen },
    ],
  },
  {
    title: 'Time & Documents',
    titleAr: 'الإجازات والمستندات',
    items: [
      { label: 'Leave', labelAr: 'الإجازات', path: '/employee/leave', icon: Calendar },
      { label: 'Documents', labelAr: 'المستندات', path: '/employee/documents', icon: FileText },
      { label: 'Gov Connect', labelAr: 'الخدمات الحكومية', path: '/employee/gov-connect', icon: Landmark },
    ],
  },
  {
    title: 'Account',
    titleAr: 'الحساب',
    items: [
      { label: 'Profile', labelAr: 'الملف الشخصي', path: '/employee/profile', icon: User },
      { label: 'Security', labelAr: 'الأمان', path: '/employee/security', icon: Shield },
    ],
  },
];

export function EmployeeSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, direction } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navigationGroups.filter(g => g.defaultOpen).map(g => g.title)
  );
  const isRTL = direction === 'rtl';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    if (path === '/employee') {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some(item => isActive(item.path));
  };

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-lg">b</span>
          </div>
          <div>
            <span className="font-display text-lg font-bold text-sidebar-foreground">bnft.</span>
            <span className="block text-[10px] text-sidebar-foreground/50 font-medium uppercase tracking-wider">Benefits Platform</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-3 border-b border-sidebar-border/50">
        <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
          <NotificationCenter />
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
        {navigationGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.title);
          const groupActive = isGroupActive(group);

          return (
            <div key={group.title} className="space-y-0.5">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors",
                  groupActive
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/50 hover:text-sidebar-foreground/70",
                  isRTL && "flex-row-reverse"
                )}
              >
                <span>{isRTL ? group.titleAr : group.title}</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    !isExpanded && "-rotate-90",
                    isRTL && !isExpanded && "rotate-90"
                  )}
                />
              </button>

              {/* Group Items */}
              {isExpanded && (
                <div className="space-y-0.5 ml-1">
                  {group.items.map((item) => (
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
                      <item.icon className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive(item.path) ? "text-sidebar-primary" : "text-sidebar-foreground/60"
                      )} />
                      <span className="flex-1 text-sm">
                        {isRTL ? item.labelAr : item.label}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Marketplace CTA */}
      <div className={cn("px-3 py-3 border-t border-sidebar-border/50", isRTL && "text-right")}>
        <Link
          to="/employee/marketplace"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200",
            "bg-gradient-to-r from-violet-600/10 via-fuchsia-500/10 to-pink-500/10",
            "hover:from-violet-600/20 hover:via-fuchsia-500/20 hover:to-pink-500/20",
            "border border-violet-500/20 hover:border-violet-500/40",
            "group",
            isActive('/employee/marketplace') && "from-violet-600/20 via-fuchsia-500/20 to-pink-500/20 border-violet-500/40",
            isRTL && "flex-row-reverse"
          )}
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div className={cn("flex-1", isRTL && "text-right")}>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-sm font-semibold transition-colors",
                isActive('/employee/marketplace')
                  ? "text-violet-400"
                  : "text-sidebar-foreground group-hover:text-violet-400"
              )}>
                {isRTL ? 'العروض والخصومات' : 'Perks & Discounts'}
              </span>
              <Sparkles className="w-3 h-3 text-violet-400" />
            </div>
            <span className="text-[10px] text-sidebar-foreground/50">
              {isRTL ? 'عروض حصرية' : 'Exclusive deals'}
            </span>
          </div>
        </Link>
      </div>

      {/* Sign Out */}
      <div className={cn("p-3 border-t border-sidebar-border/50", isRTL && "text-right")}>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-destructive/10 rounded-lg transition-all text-sm",
            isRTL ? "justify-start flex-row-reverse" : "justify-start"
          )}
        >
          <LogOut className={cn("w-4 h-4 shrink-0", isRTL ? "ml-2" : "mr-2")} />
          <span>{isRTL ? 'تسجيل الخروج' : 'Sign out'}</span>
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
          "fixed top-4 z-50 p-2.5 rounded-xl bg-card text-foreground shadow-lg border border-border lg:hidden",
          isRTL ? "right-4" : "left-4"
        )}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 z-40 h-screen w-64 flex flex-col bg-sidebar transition-transform duration-300 shadow-xl',
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

import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Home,
  GraduationCap,
  Heart,
  Car,
  Dumbbell,
  BookOpen,
  Calendar,
  Gift,
  Wallet,
  FileText,
  Building2,
  User,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  ShoppingBag,
  Receipt,
  Compass,
  Clock,
  Landmark,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface NavGroup {
  id: string;
  label: string;
  labelAr?: string;
  items: NavItem[];
  defaultOpen?: boolean;
  featureFlag?: keyof ReturnType<typeof useFeatureFlags>['flags'];
  /** If true, show only when onboarding is incomplete */
  showOnlyIfOnboardingIncomplete?: boolean;
}

interface NavItem {
  label: string;
  labelAr?: string;
  path: string;
  icon: React.ElementType;
  featureFlag?: keyof ReturnType<typeof useFeatureFlags>['flags'];
}

/**
 * Employee Navigation Structure
 * Clean, consistent groups matching Employer portal patterns
 */
const navigation: NavGroup[] = [
  // OVERVIEW
  {
    id: 'overview',
    label: 'Overview',
    labelAr: 'نظرة عامة',
    defaultOpen: true,
    items: [
      { label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/employee', icon: LayoutDashboard },
    ],
  },
  // ONBOARDING (conditional - only show if incomplete)
  {
    id: 'onboarding',
    label: 'Getting Started',
    labelAr: 'البدء',
    showOnlyIfOnboardingIncomplete: true,
    items: [
      { label: 'Onboarding', labelAr: 'التهيئة', path: '/employee/onboarding', icon: Compass },
    ],
  },
  // MY BENEFITS
  {
    id: 'my-benefits',
    label: 'My Benefits',
    labelAr: 'مزاياي',
    defaultOpen: true,
    items: [
      { label: 'Benefits Overview', labelAr: 'نظرة عامة على المزايا', path: '/employee/benefits', icon: Gift },
      { label: 'Insights & Optimization', labelAr: 'التحليلات والتحسين', path: '/employee/benefits-analysis', icon: Compass },
    ],
  },
  // BENEFIT CATEGORIES (collapsible)
  {
    id: 'benefit-categories',
    label: 'Benefit Categories',
    labelAr: 'فئات المزايا',
    items: [
      { label: 'Housing', labelAr: 'السكن', path: '/employee/housing', icon: Home },
      { label: 'Schooling', labelAr: 'التعليم', path: '/employee/schooling', icon: GraduationCap },
      { label: 'Health Insurance', labelAr: 'التأمين الصحي', path: '/employee/health', icon: Heart },
      { label: 'Transport & Mobility', labelAr: 'النقل والتنقل', path: '/employee/transport', icon: Car },
      { label: 'Wellbeing', labelAr: 'الرفاهية', path: '/employee/wellbeing', icon: Dumbbell },
      { label: 'Long-Term Financials', labelAr: 'الماليات طويلة الأجل', path: '/employee/long-term-financials', icon: Wallet },
      { label: 'Learning & Development', labelAr: 'التعلم والتطوير', path: '/employee/learning', icon: BookOpen },
      { label: 'End of Service', labelAr: 'نهاية الخدمة', path: '/employee/long-term-financials?tab=gratuity', icon: Landmark },
    ],
  },
  // TIME OFF
  {
    id: 'time-off',
    label: 'Time Off',
    labelAr: 'الإجازات',
    items: [
      { label: 'Leave', labelAr: 'الإجازات', path: '/employee/leave', icon: Calendar },
    ],
  },
  // HR & SERVICES
  {
    id: 'hr-services',
    label: 'HR & Services',
    labelAr: 'الموارد البشرية والخدمات',
    defaultOpen: true,
    items: [
      { label: 'Claims & Requests', labelAr: 'المطالبات والطلبات', path: '/employee/requests', icon: Receipt },
      { label: 'HR Documents', labelAr: 'مستندات الموارد البشرية', path: '/employee/documents', icon: FileText },
      { label: 'Knowledge Hub', labelAr: 'مركز المعرفة', path: '/employee/knowledge', icon: BookOpen },
      { label: 'Gov Connect', labelAr: 'الخدمات الحكومية', path: '/employee/gov-connect', icon: Building2 },
    ],
  },
  // MARKETPLACE - Always visible and expanded by default
  {
    id: 'marketplace',
    label: 'Marketplace',
    labelAr: 'السوق',
    defaultOpen: true,
    // NOTE: Removed featureFlag to make marketplace always visible
    items: [
      { label: 'Offers & Vouchers', labelAr: 'العروض والقسائم', path: '/employee/marketplace', icon: ShoppingBag },
    ],
  },
];

export function EmployeeSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, direction } = useLanguage();
  const { flags } = useFeatureFlags();
  const { profile } = useProfile();
  
  // Check if onboarding is complete (simplified check)
  const isOnboardingComplete = Boolean(
    profile?.firstName && 
    profile?.lastName && 
    profile?.dateOfBirth
  );
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    'overview',
    'my-benefits',
    'hr-services',
    'marketplace', // Always expanded by default
  ]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRTL = direction === 'rtl';

  // Filter navigation groups based on feature flags and conditions
  const visibleNavigation = useMemo(() => {
    return navigation.filter((group) => {
      // Feature flag check
      if (group.featureFlag && !flags[group.featureFlag]) {
        return false;
      }
      // Onboarding visibility check
      if (group.showOnlyIfOnboardingIncomplete && isOnboardingComplete) {
        return false;
      }
      return true;
    }).map(group => ({
      ...group,
      // Filter items by feature flags too
      items: group.items.filter(item => 
        !item.featureFlag || flags[item.featureFlag]
      ),
    }));
  }, [flags, isOnboardingComplete]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  // Active rule: exact match or nested route
  const isActive = (path: string) => {
    if (path === '/employee') return location.pathname === '/employee';
    // Handle query params in path
    const basePath = path.split('?')[0];
    return location.pathname === basePath || location.pathname.startsWith(basePath + '/');
  };

  const ChevronCollapsed = isRTL ? ChevronLeft : ChevronRight;

  const getLabel = (item: { label: string; labelAr?: string }) => {
    return language === 'ar' && item.labelAr ? item.labelAr : item.label;
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shrink-0">
              <span className="text-sidebar-background font-bold text-lg">b</span>
            </div>
            <span className="font-display text-xl font-bold text-sidebar-foreground">bnft.</span>
          </div>
        </div>

        {/* Theme & Language Controls */}
        <div
          className={cn(
            'flex items-center gap-1 mt-3 pt-3 border-t border-sidebar-border/50',
            isRTL && 'flex-row-reverse'
          )}
        >
          <NotificationCenter />
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>
      </div>

      {/* Navigation with scroll shadow indicator */}
      <nav className={cn(
        'flex-1 overflow-y-auto py-4 px-3 space-y-1',
        'scroll-shadow',
        isRTL && 'text-right'
      )}>
        {visibleNavigation.map((group, index) => (
          <div key={group.id} className={cn('mb-1', index > 0 && 'mt-5')}>
            <button
              onClick={() => toggleGroup(group.id)}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors rounded-md group',
                'text-sidebar-primary hover:bg-sidebar-primary/10',
                isRTL && 'flex-row-reverse text-right'
              )}
            >
              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <div className="w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                <span>{getLabel(group)}</span>
              </div>
              {expandedGroups.includes(group.id) ? (
                <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              ) : (
                <ChevronCollapsed className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            {expandedGroups.includes(group.id) && (
              <div className="mt-1 space-y-0.5 animate-fade-in">
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
                    <span className={cn('text-sm flex-1', isRTL && 'text-right')}>
                      {getLabel(item)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Smart Profile - Distinguished Section */}
      <div className={cn('px-3 pb-2', isRTL && 'text-right')}>
        <Link
          to="/employee/profile"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200',
            'bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-cyan-500/10',
            'hover:from-teal-500/20 hover:via-emerald-500/20 hover:to-cyan-500/20',
            'border border-teal-500/20 hover:border-teal-500/40',
            'group',
            isActive('/employee/profile') &&
              'from-teal-500/20 via-emerald-500/20 to-cyan-500/20 border-teal-500/40',
            isRTL && 'flex-row-reverse'
          )}
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/25">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className={cn('flex-1', isRTL && 'text-right')}>
            <span
              className={cn(
                'text-sm font-medium block',
                isActive('/employee/profile')
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-sidebar-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400'
              )}
            >
              {language === 'ar' ? 'الملف الذكي' : 'Smart Profile'}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {isRTL ? 'البيانات والإعدادات والخصوصية' : 'Details, settings & privacy'}
            </span>
          </div>
          <ChevronCollapsed
            className={cn(
              'w-4 h-4 text-teal-500/50 group-hover:text-teal-500 transition-all',
              'group-hover:translate-x-0.5',
              isRTL && 'rotate-180 group-hover:-translate-x-0.5'
            )}
          />
        </Link>
      </div>

      {/* Sign Out */}
      <div className={cn('p-4 border-t border-sidebar-border', isRTL && 'text-right')}>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            'w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
            isRTL ? 'justify-start flex-row-reverse' : 'justify-start'
          )}
        >
          <LogOut className={cn('w-4 h-4 shrink-0', isRTL ? 'ml-3' : 'mr-3')} />
          <span className={isRTL ? 'text-right' : 'text-left'}>
            {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
          </span>
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
          'fixed top-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground lg:hidden',
          isRTL ? 'right-4' : 'left-4'
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
            ? mobileOpen
              ? 'translate-x-0'
              : 'translate-x-full'
            : mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

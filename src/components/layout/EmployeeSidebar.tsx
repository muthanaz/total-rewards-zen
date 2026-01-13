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
  TrendingUp,
  BookOpen,
  Calendar,
  Gift,
  Award,
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
  Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

interface NavItem {
  labelKey: string;
  path: string;
  icon: React.ElementType;
}

// Main Navigation Structure (without marketplace)
const navigation: NavGroup[] = [
  {
    labelKey: 'nav.dashboard',
    items: [
      { labelKey: 'nav.overview', path: '/employee', icon: LayoutDashboard },
      { labelKey: 'nav.allBenefits', path: '/employee/benefits', icon: Gift },
      { labelKey: 'nav.benefitsAnalysis', path: '/employee/benefits-analysis', icon: TrendingUp },
    ],
  },
  {
    labelKey: 'nav.allowances',
    items: [
      { labelKey: 'nav.housing', path: '/employee/housing', icon: Home },
      { labelKey: 'nav.transport', path: '/employee/transport', icon: Car },
      { labelKey: 'nav.schooling', path: '/employee/schooling', icon: GraduationCap },
    ],
  },
  {
    labelKey: 'nav.healthWellbeing',
    items: [
      { labelKey: 'nav.healthInsurance', path: '/employee/health', icon: Heart },
      { labelKey: 'nav.wellbeing', path: '/employee/wellbeing', icon: Dumbbell },
    ],
  },
  {
    labelKey: 'nav.financialRewards',
    items: [
      { labelKey: 'nav.annualBonus', path: '/employee/bonus', icon: Award },
      { labelKey: 'nav.financial', path: '/employee/financial', icon: PiggyBank },
      { labelKey: 'nav.equity', path: '/employee/equity', icon: TrendingUp },
    ],
  },
  {
    labelKey: 'nav.learningDevelopment',
    items: [
      { labelKey: 'nav.learning', path: '/employee/learning', icon: BookOpen },
    ],
  },
  {
    labelKey: 'nav.leave',
    items: [
      { labelKey: 'nav.leaveManagement', path: '/employee/leave', icon: Calendar },
    ],
  },
  {
    labelKey: 'nav.documentsClaims',
    items: [
      { labelKey: 'nav.documents', path: '/employee/documents', icon: FileText },
      { labelKey: 'nav.govConnect', path: '/employee/gov-connect', icon: Building2 },
    ],
  },
  {
    labelKey: 'nav.account',
    items: [
      { labelKey: 'nav.profile', path: '/employee/profile', icon: User },
      { labelKey: 'nav.security', path: '/employee/security', icon: Shield },
    ],
  },
];

export function EmployeeSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t, direction } = useLanguage();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['nav.dashboard', 'nav.allowances', 'nav.financialRewards']);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRTL = direction === 'rtl';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const toggleGroup = (labelKey: string) => {
    setExpandedGroups(prev =>
      prev.includes(labelKey)
        ? prev.filter(g => g !== labelKey)
        : [...prev, labelKey]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const ChevronCollapsed = isRTL ? ChevronLeft : ChevronRight;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className={cn(
          "flex items-center justify-between",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shrink-0">
              <span className="text-sidebar-background font-bold text-lg">b</span>
            </div>
            <span className="font-display text-xl font-bold text-sidebar-foreground">bnft.</span>
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

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4 px-3 space-y-1",
        isRTL && "text-right"
      )}>
        {navigation.map((group, index) => (
          <div key={group.labelKey} className={cn("mb-1", index > 0 && "mt-6")}>
            <button
              onClick={() => toggleGroup(group.labelKey)}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors rounded-md group",
                "text-sidebar-primary hover:bg-sidebar-primary/10",
                isRTL && "flex-row-reverse text-right"
              )}
            >
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <div className="w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                <span>{t(group.labelKey)}</span>
              </div>
              {expandedGroups.includes(group.labelKey) ? (
                <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              ) : (
                <ChevronCollapsed className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
            
            {expandedGroups.includes(group.labelKey) && (
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
                    <span className={cn("text-sm flex-1", isRTL && "text-right")}>{t(item.labelKey)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Marketplace - Distinguished Section */}
      <div className={cn("px-3 pb-3", isRTL && "text-right")}>
        <Link
          to="/employee/marketplace"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200",
            "bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10",
            "hover:from-violet-500/20 hover:via-fuchsia-500/20 hover:to-pink-500/20",
            "border border-violet-500/20 hover:border-violet-500/40",
            "group",
            isActive('/employee/marketplace') && "from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 border-violet-500/40",
            isRTL && "flex-row-reverse"
          )}
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div className={cn("flex-1", isRTL && "text-right")}>
            <span className={cn(
              "text-sm font-medium block",
              isActive('/employee/marketplace') 
                ? "text-violet-600 dark:text-violet-400" 
                : "text-sidebar-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400"
            )}>
              {t('nav.perksPartners')}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {isRTL ? 'خصومات وعروض حصرية' : 'Exclusive deals & discounts'}
            </span>
          </div>
          <ChevronCollapsed className={cn(
            "w-4 h-4 text-violet-500/50 group-hover:text-violet-500 transition-all",
            "group-hover:translate-x-0.5",
            isRTL && "rotate-180 group-hover:-translate-x-0.5"
          )} />
        </Link>
      </div>

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

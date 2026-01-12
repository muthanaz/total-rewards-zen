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
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

interface NavItem {
  labelKey: string;
  path: string;
  icon: React.ElementType;
}

const navigation: NavGroup[] = [
  {
    labelKey: 'nav.dashboard',
    items: [
      { labelKey: 'nav.overview', path: '/employee', icon: LayoutDashboard },
    ],
  },
  {
    labelKey: 'nav.myBenefits',
    items: [
      { labelKey: 'nav.housing', path: '/employee/housing', icon: Home },
      { labelKey: 'nav.schooling', path: '/employee/schooling', icon: GraduationCap },
      { labelKey: 'nav.healthInsurance', path: '/employee/health', icon: Heart },
      { labelKey: 'nav.transport', path: '/employee/transport', icon: Car },
      { labelKey: 'nav.wellbeing', path: '/employee/wellbeing', icon: Dumbbell },
      { labelKey: 'nav.learning', path: '/employee/learning', icon: BookOpen },
      { labelKey: 'nav.leave', path: '/employee/leave', icon: Calendar },
    ],
  },
  {
    labelKey: 'nav.financialRewards',
    items: [
      { labelKey: 'nav.financial', path: '/employee/financial', icon: PiggyBank },
      { labelKey: 'nav.annualBonus', path: '/employee/bonus', icon: Award },
      { labelKey: 'nav.equity', path: '/employee/equity', icon: TrendingUp },
    ],
  },
  {
    labelKey: 'nav.marketplace',
    items: [
      { labelKey: 'nav.perks', path: '/employee/marketplace', icon: ShoppingBag },
    ],
  },
  {
    labelKey: 'nav.services',
    items: [
      { labelKey: 'nav.documents', path: '/employee/documents', icon: FileText },
      { labelKey: 'nav.govConnect', path: '/employee/gov-connect', icon: Building2 },
      { labelKey: 'nav.knowledgeHub', path: '/employee/knowledge', icon: Lightbulb },
    ],
  },
  {
    labelKey: 'nav.account',
    items: [
      { labelKey: 'nav.profile', path: '/employee/profile', icon: User },
    ],
  },
];

export function EmployeeSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t, direction } = useLanguage();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['nav.dashboard', 'nav.myBenefits', 'nav.financialRewards']);
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
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4 px-3 space-y-1",
        isRTL && "text-right"
      )}>
        {navigation.map((group) => (
          <div key={group.labelKey} className="mb-2">
            <button
              onClick={() => toggleGroup(group.labelKey)}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors",
                isRTL && "flex-row-reverse text-right"
              )}
            >
              <span className={isRTL ? "text-right" : "text-left"}>{t(group.labelKey)}</span>
              {expandedGroups.includes(group.labelKey) ? (
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <ChevronCollapsed className="w-3.5 h-3.5 shrink-0" />
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

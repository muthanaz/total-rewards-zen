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
  FileCheck,
  Target,
  Sparkles,
  Receipt,
  Star,
  Landmark,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface NavGroup {
  labelKey: string;
  label: { en: string; ar: string };
  icon: React.ElementType;
  items: NavItem[];
  highlighted?: boolean;
}

interface NavItem {
  labelKey: string;
  label: { en: string; ar: string };
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

// Total Rewards Hub Navigation Structure for People
const navigation: NavGroup[] = [
  {
    labelKey: 'nav.myRewards',
    label: { en: 'My Rewards Dashboard', ar: 'لوحة مكافآتي' },
    icon: LayoutDashboard,
    items: [
      { labelKey: 'nav.overview', label: { en: 'Overview', ar: 'نظرة عامة' }, path: '/employee', icon: LayoutDashboard },
      { labelKey: 'nav.totalStatement', label: { en: 'My Total Statement', ar: 'كشف حسابي الشامل' }, path: '/employee/benefits-analysis', icon: FileCheck },
    ],
  },
  {
    labelKey: 'nav.compensation',
    label: { en: 'Compensation', ar: 'التعويضات' },
    icon: Gift,
    items: [
      { labelKey: 'nav.allBenefits', label: { en: 'All Benefits', ar: 'جميع المزايا' }, path: '/employee/benefits', icon: Gift },
      { labelKey: 'nav.housing', label: { en: 'Housing', ar: 'السكن' }, path: '/employee/housing', icon: Home },
      { labelKey: 'nav.education', label: { en: 'Education', ar: 'التعليم' }, path: '/employee/schooling', icon: GraduationCap },
      { labelKey: 'nav.transport', label: { en: 'Transport', ar: 'النقل' }, path: '/employee/transport', icon: Car },
      { labelKey: 'nav.gratuity', label: { en: 'End of Service', ar: 'نهاية الخدمة' }, path: '/employee/gratuity', icon: Landmark },
      { labelKey: 'nav.bonus', label: { en: 'Bonus & Equity', ar: 'المكافآت والأسهم' }, path: '/employee/bonus', icon: TrendingUp },
    ],
  },
  {
    labelKey: 'nav.wellbeingPerks',
    label: { en: 'Wellbeing & Perks', ar: 'الرفاهية والامتيازات' },
    icon: Sparkles,
    items: [
      { labelKey: 'nav.health', label: { en: 'Health Coverage', ar: 'التغطية الصحية' }, path: '/employee/health', icon: Heart },
      { labelKey: 'nav.wellbeing', label: { en: 'Wellness Programs', ar: 'برامج العافية' }, path: '/employee/wellbeing', icon: Dumbbell },
      { labelKey: 'nav.financial', label: { en: 'Financial Wellness', ar: 'الرفاهية المالية' }, path: '/employee/financial', icon: PiggyBank },
    ],
  },
  {
    labelKey: 'nav.careerGrowth',
    label: { en: 'Career & Growth', ar: 'المسار الوظيفي' },
    icon: Target,
    items: [
      { labelKey: 'nav.learning', label: { en: 'Learning Hub', ar: 'مركز التعلم' }, path: '/employee/learning', icon: BookOpen },
      { labelKey: 'nav.equity', label: { en: 'Equity & Options', ar: 'الأسهم والخيارات' }, path: '/employee/equity', icon: TrendingUp },
    ],
  },
  {
    labelKey: 'nav.timeOff',
    label: { en: 'Time Off', ar: 'الإجازات' },
    icon: Calendar,
    items: [
      { labelKey: 'nav.leave', label: { en: 'Leave Balance', ar: 'رصيد الإجازات' }, path: '/employee/leave', icon: Calendar },
    ],
  },
  {
    labelKey: 'nav.hrServices',
    label: { en: 'HR Services', ar: 'خدمات الموارد البشرية' },
    icon: FileText,
    items: [
      { labelKey: 'nav.documents', label: { en: 'Documents & Letters', ar: 'الوثائق والخطابات' }, path: '/employee/documents', icon: FileText },
      { labelKey: 'nav.govConnect', label: { en: 'Government Services', ar: 'الخدمات الحكومية' }, path: '/employee/gov-connect', icon: Building2 },
    ],
  },
];

export function EmployeeSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, direction } = useLanguage();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['nav.myRewards', 'nav.compensation']);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

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
      {/* Logo - Total Rewards Hub */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className={cn(
          "flex items-center justify-between",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center shrink-0 shadow-glow">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div className={cn("flex flex-col", isRTL && "items-end")}>
              <span className="font-display text-lg font-bold text-sidebar-foreground leading-tight">Total Rewards</span>
              <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">People Portal</span>
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

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4 px-3 space-y-1",
        isRTL && "text-right"
      )}>
        {navigation.map((group, index) => (
          <div key={group.labelKey} className={cn("mb-1", index > 0 && "mt-4")}>
            <button
              onClick={() => toggleGroup(group.labelKey)}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors rounded-lg group",
                "text-sidebar-primary hover:bg-sidebar-accent/50",
                isRTL && "flex-row-reverse text-right"
              )}
            >
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <group.icon className="w-3.5 h-3.5" />
                <span>{isArabic ? group.label.ar : group.label.en}</span>
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
                    <span className={cn("text-sm flex-1", isRTL && "text-right")}>
                      {isArabic ? item.label.ar : item.label.en}
                    </span>
                    {item.badge && (
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full",
                        item.badgeColor === 'action' ? "bg-action/20 text-action" : "bg-accent/20 text-accent"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Marketplace - Distinguished Section */}
      <div className={cn("px-3 pb-2", isRTL && "text-right")}>
        <Link
          to="/employee/marketplace"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200",
            "bg-gradient-to-r from-accent/10 via-teal-500/10 to-accent/5",
            "hover:from-accent/20 hover:via-teal-500/20 hover:to-accent/10",
            "border border-accent/20 hover:border-accent/40",
            "group",
            isActive('/employee/marketplace') && "from-accent/20 via-teal-500/20 to-accent/10 border-accent/40",
            isRTL && "flex-row-reverse"
          )}
        >
          <div className="p-2 rounded-lg bg-gradient-accent shadow-lg shadow-accent/25">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div className={cn("flex-1", isRTL && "text-right")}>
            <span className={cn(
              "text-sm font-medium block",
              isActive('/employee/marketplace') 
                ? "text-accent" 
                : "text-sidebar-foreground group-hover:text-accent"
            )}>
              {isArabic ? 'السوق والامتيازات' : 'Perks Marketplace'}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {isArabic ? 'خصومات وعروض حصرية' : 'Exclusive deals & discounts'}
            </span>
          </div>
          <ChevronCollapsed className={cn(
            "w-4 h-4 text-accent/50 group-hover:text-accent transition-all",
            "group-hover:translate-x-0.5",
            isRTL && "rotate-180 group-hover:-translate-x-0.5"
          )} />
        </Link>
      </div>

      {/* Smart Profile - Distinguished Section */}
      <div className={cn("px-3 pb-2", isRTL && "text-right")}>
        <Link
          to="/employee/profile"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200",
            "bg-gradient-to-r from-primary/10 via-indigo-500/10 to-primary/5",
            "hover:from-primary/20 hover:via-indigo-500/20 hover:to-primary/10",
            "border border-primary/20 hover:border-primary/40",
            "group",
            isActive('/employee/profile') && "from-primary/20 via-indigo-500/20 to-primary/10 border-primary/40",
            isRTL && "flex-row-reverse"
          )}
        >
          <div className="p-2 rounded-lg bg-gradient-primary shadow-lg shadow-primary/25">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className={cn("flex-1", isRTL && "text-right")}>
            <span className={cn(
              "text-sm font-medium block",
              isActive('/employee/profile') 
                ? "text-primary" 
                : "text-sidebar-foreground group-hover:text-primary"
            )}>
              {isArabic ? 'ملفي الشخصي' : 'My Profile'}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {isArabic ? 'إدارة الحساب والأمان' : 'Account & security settings'}
            </span>
          </div>
          <ChevronCollapsed className={cn(
            "w-4 h-4 text-primary/50 group-hover:text-primary transition-all",
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
          <span className={isRTL ? "text-right" : "text-left"}>{isArabic ? 'تسجيل الخروج' : 'Sign Out'}</span>
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

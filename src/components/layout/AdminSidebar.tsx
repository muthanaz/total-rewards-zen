import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  Store,
  Tag,
  ShieldCheck,
  FileText,
  Menu,
  X,
  LogOut,
  Shield,
  ChevronDown,
  Database,
  AlertTriangle,
  Sliders,
  ToggleLeft,
  CreditCard,
  ClipboardList,
  Server,
  FlaskConical,
  BarChart3,
  TrendingUp,
  Wallet,
  BookOpen,
  Activity,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { DemoModeToggle } from '@/components/demo';

interface NavGroup {
  title: string;
  titleAr: string;
  items: NavItem[];
  defaultExpanded?: boolean;
  isBeta?: boolean;
}

interface NavItem {
  label: string;
  labelAr: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  isBeta?: boolean;
}

const navigationGroups: NavGroup[] = [
  {
    title: 'Command Center',
    titleAr: 'مركز القيادة',
    defaultExpanded: true,
    items: [
      { label: 'Action Center', labelAr: 'مركز الإجراءات', path: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Clients',
    titleAr: 'العملاء',
    defaultExpanded: true,
    items: [
      { label: 'Organizations', labelAr: 'المنظمات', path: '/admin/organizations', icon: Building2 },
      { label: 'Onboarding', labelAr: 'الإعداد', path: '/admin/onboarding', icon: UserPlus },
      { label: 'Users & Roles', labelAr: 'المستخدمون والأدوار', path: '/admin/users', icon: Users },
    ],
  },
  {
    title: 'Marketplace',
    titleAr: 'السوق',
    defaultExpanded: true,
    items: [
      { label: 'Vendors', labelAr: 'البائعون', path: '/admin/vendors', icon: Store },
      { label: 'Offers', labelAr: 'العروض', path: '/admin/offers', icon: Tag },
      { label: 'Moderation', labelAr: 'المراجعة', path: '/admin/moderation', icon: ClipboardList, badge: 3 },
    ],
  },
  {
    title: 'Data',
    titleAr: 'البيانات',
    defaultExpanded: true,
    items: [
      { label: 'Data Sources', labelAr: 'مصادر البيانات', path: '/admin/data-sources', icon: Database },
      { label: 'Sync Monitor', labelAr: 'مراقبة المزامنة', path: '/admin/sync-monitor', icon: Server },
      { label: 'Data Quality Rules', labelAr: 'قواعد جودة البيانات', path: '/admin/data-quality-rules', icon: Activity },
    ],
  },
  {
    title: 'Governance',
    titleAr: 'الحوكمة',
    defaultExpanded: false,
    items: [
      { label: 'Audit Log', labelAr: 'سجل التدقيق', path: '/admin/audit-log', icon: FileText },
      { label: 'Security', labelAr: 'الأمان', path: '/admin/security', icon: ShieldCheck },
      { label: 'Sessions', labelAr: 'الجلسات', path: '/admin/sessions', icon: Users },
      { label: 'Feature Flags', labelAr: 'علامات الميزات', path: '/admin/feature-flags', icon: ToggleLeft },
      { label: 'UI Config', labelAr: 'تكوين الواجهة', path: '/admin/ui-config', icon: Sliders },
    ],
  },
  {
    title: 'Commercial',
    titleAr: 'التجارية',
    defaultExpanded: false,
    items: [
      { label: 'Billing', labelAr: 'الفوترة', path: '/admin/billing', icon: CreditCard },
    ],
  },
  {
    title: 'Alerts',
    titleAr: 'التنبيهات',
    defaultExpanded: true,
    items: [
      { label: 'Alerts Center', labelAr: 'مركز التنبيهات', path: '/admin/alerts', icon: AlertTriangle, badge: 3 },
    ],
  },
  {
    title: 'Insights Lab',
    titleAr: 'مختبر الرؤى',
    defaultExpanded: false,
    isBeta: true,
    items: [
      { label: 'Benchmarks', labelAr: 'المعايير', path: '/admin/benchmarks', icon: BarChart3, isBeta: true },
      { label: 'Market Intelligence', labelAr: 'ذكاء السوق', path: '/admin/market', icon: TrendingUp, isBeta: true },
      { label: 'Spending Patterns', labelAr: 'أنماط الإنفاق', path: '/admin/spending', icon: Wallet, isBeta: true },
      { label: 'Saved Reports', labelAr: 'التقارير المحفوظة', path: '/admin/reports', icon: BookOpen, isBeta: true },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, direction } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Initialize expanded groups based on defaultExpanded
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navigationGroups.filter(g => g.defaultExpanded).map(g => g.title)
  );
  
  const isRTL = direction === 'rtl';

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
            <span className="font-display text-xl font-bold text-sidebar-foreground">bnft.</span>
            <span className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 shrink-0",
              isRTL ? "mr-1" : "ml-1"
            )}>
              Admin
            </span>
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
        {/* Demo Mode Toggle */}
        <div className="mt-3">
          <DemoModeToggle variant="dropdown" className="w-full justify-start" />
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4 px-3",
        isRTL && "text-right"
      )}>
        {navigationGroups.map((group) => (
          <div key={group.title} className="mb-3">
            <button
              onClick={() => toggleGroup(group.title)}
              className={cn(
                "flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground/70 transition-colors",
                isRTL && "flex-row-reverse"
              )}
            >
              <span className="flex items-center gap-1.5">
                {language === 'ar' ? group.titleAr : group.title}
                {group.isBeta && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-amber-500/10 text-amber-500 border-amber-500/30">
                    Beta
                  </Badge>
                )}
              </span>
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
                    {item.badge && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-destructive text-destructive-foreground">
                        {item.badge}
                      </span>
                    )}
                    {item.isBeta && (
                      <FlaskConical className="w-3 h-3 text-amber-500" />
                    )}
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

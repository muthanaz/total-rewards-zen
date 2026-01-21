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
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  ChevronDown,
  Database,
  Activity,
  AlertTriangle,
  Sliders,
  ToggleLeft,
  CreditCard,
  ClipboardList,
  Server,
  Link2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { DemoModeToggle } from '@/components/demo';

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
  badge?: number;
}

const navigationGroups: NavGroup[] = [
  {
    title: 'Overview',
    titleAr: 'نظرة عامة',
    items: [
      { label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Platform Management',
    titleAr: 'إدارة المنصة',
    items: [
      { label: 'Organizations', labelAr: 'المنظمات', path: '/admin/organizations', icon: Building2 },
      { label: 'Users & Roles', labelAr: 'المستخدمون والأدوار', path: '/admin/users', icon: Users },
      { label: 'Plans & Invoices', labelAr: 'الخطط والفواتير', path: '/admin/billing', icon: CreditCard },
    ],
  },
  {
    title: 'Marketplace Governance',
    titleAr: 'حوكمة السوق',
    items: [
      { label: 'Vendors', labelAr: 'البائعون', path: '/admin/vendors', icon: Store },
      { label: 'Offers & Vouchers', labelAr: 'العروض والقسائم', path: '/admin/offers', icon: Tag },
      { label: 'Moderation Queue', labelAr: 'قائمة المراجعة', path: '/admin/moderation', icon: ClipboardList, badge: 3 },
    ],
  },
  {
    title: 'Data & Integrations',
    titleAr: 'البيانات والتكاملات',
    items: [
      { label: 'Data Sources', labelAr: 'مصادر البيانات', path: '/admin/data-sources', icon: Database },
      { label: 'Data Quality Rules', labelAr: 'قواعد جودة البيانات', path: '/admin/data-quality-rules', icon: ShieldCheck },
      { label: 'Sync Monitor', labelAr: 'مراقبة المزامنة', path: '/admin/sync-monitor', icon: Server },
    ],
  },
  {
    title: 'Content & Alerts',
    titleAr: 'المحتوى والتنبيهات',
    items: [
      { label: 'Policy Library', labelAr: 'مكتبة السياسات', path: '/admin/policy-library', icon: FileText },
      { label: 'Alerts Center', labelAr: 'مركز التنبيهات', path: '/admin/alerts', icon: AlertTriangle, badge: 3 },
    ],
  },
];

// System group is collapsed by default
const systemGroup: NavGroup = {
  title: 'System',
  titleAr: 'النظام',
  items: [
    { label: 'Audit Log', labelAr: 'سجل التدقيق', path: '/admin/audit-log', icon: FileText },
    { label: 'Security Settings', labelAr: 'إعدادات الأمان', path: '/admin/security', icon: ShieldCheck },
    { label: 'Sessions', labelAr: 'الجلسات', path: '/admin/sessions', icon: Users },
    { label: 'UI Configuration', labelAr: 'تكوين الواجهة', path: '/admin/ui-config', icon: Sliders },
    { label: 'Feature Flags', labelAr: 'علامات الميزات', path: '/admin/feature-flags', icon: ToggleLeft },
  ],
};

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, direction } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Primary groups are expanded by default, System group is collapsed
  const [expandedGroups, setExpandedGroups] = useState<string[]>(navigationGroups.map(g => g.title));
  
  // Combine all groups for rendering
  const allGroups = [...navigationGroups, systemGroup];
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
        {allGroups.map((group) => (
          <div key={group.title} className="mb-3">
            <button
              onClick={() => toggleGroup(group.title)}
              className={cn(
                "flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground/70 transition-colors",
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
                    {item.badge && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-destructive text-destructive-foreground">
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

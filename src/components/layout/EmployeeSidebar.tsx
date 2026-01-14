import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Wallet,
  DollarSign,
  Gift,
  TrendingUp,
  FileText,
  Calendar,
  ClipboardList,
  ShoppingBag,
  Building2,
  HelpCircle,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Landmark,
  Receipt,
  BookOpen,
  HeadphonesIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface NavGroup {
  id: string;
  label: { en: string; ar: string };
  icon: React.ElementType;
  items?: NavItem[];
  path?: string; // For direct links without children
  defaultOpen?: boolean;
}

interface NavItem {
  label: { en: string; ar: string };
  path: string;
  icon: React.ElementType;
}

// Task-based navigation structure
const navigation: NavGroup[] = [
  {
    id: 'home',
    label: { en: 'Home', ar: 'الرئيسية' },
    icon: Home,
    path: '/employee',
  },
  {
    id: 'my-money',
    label: { en: 'My Money', ar: 'أموالي' },
    icon: Wallet,
    items: [
      { label: { en: 'Compensation', ar: 'التعويضات' }, path: '/employee/benefits-analysis', icon: DollarSign },
      { label: { en: 'Benefits', ar: 'المزايا' }, path: '/employee/benefits', icon: Gift },
      { label: { en: 'Long-term Rewards', ar: 'المكافآت طويلة المدى' }, path: '/employee/bonus', icon: TrendingUp },
    ],
    defaultOpen: true,
  },
  {
    id: 'do-stuff',
    label: { en: 'Do Stuff', ar: 'إجراءات' },
    icon: ClipboardList,
    items: [
      { label: { en: 'Claims & Requests', ar: 'المطالبات والطلبات' }, path: '/employee/documents', icon: Receipt },
      { label: { en: 'Documents', ar: 'المستندات' }, path: '/employee/documents', icon: FileText },
      { label: { en: 'Leave', ar: 'الإجازات' }, path: '/employee/leave', icon: Calendar },
    ],
    defaultOpen: true,
  },
  {
    id: 'marketplace',
    label: { en: 'Marketplace', ar: 'السوق' },
    icon: ShoppingBag,
    path: '/employee/marketplace',
  },
  {
    id: 'services',
    label: { en: 'Services', ar: 'الخدمات' },
    icon: Building2,
    items: [
      { label: { en: 'Gov Connect', ar: 'الخدمات الحكومية' }, path: '/employee/gov-connect', icon: Building2 },
      { label: { en: 'Help & Support', ar: 'المساعدة والدعم' }, path: '/employee/knowledge', icon: HelpCircle },
    ],
  },
  {
    id: 'settings',
    label: { en: 'Settings', ar: 'الإعدادات' },
    icon: Settings,
    items: [
      { label: { en: 'Profile', ar: 'الملف الشخصي' }, path: '/employee/profile', icon: User },
      { label: { en: 'Security', ar: 'الأمان' }, path: '/employee/security', icon: Settings },
    ],
  },
];

export function EmployeeSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, direction } = useLanguage();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['my-money', 'do-stuff']);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(g => g !== groupId)
        : [...prev, groupId]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (group: NavGroup) => {
    if (group.path) return isActive(group.path);
    return group.items?.some(item => isActive(item.path));
  };

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
        {navigation.map((group) => {
          const GroupIcon = group.icon;
          const hasItems = group.items && group.items.length > 0;
          const groupActive = isGroupActive(group);

          // Direct link (no children)
          if (!hasItems && group.path) {
            return (
              <Link
                key={group.id}
                to={group.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm',
                  isActive(group.path)
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent',
                  isRTL && 'flex-row-reverse text-right'
                )}
              >
                <GroupIcon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{isArabic ? group.label.ar : group.label.en}</span>
              </Link>
            );
          }

          // Collapsible group
          return (
            <div key={group.id} className="mb-1">
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium transition-colors rounded-lg group",
                  groupActive
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  isRTL && "flex-row-reverse text-right"
                )}
              >
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <GroupIcon className={cn(
                    "w-4 h-4 shrink-0",
                    groupActive && "text-sidebar-primary"
                  )} />
                  <span>{isArabic ? group.label.ar : group.label.en}</span>
                </div>
                {expandedGroups.includes(group.id) ? (
                  <ChevronDown className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <ChevronCollapsed className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
              
              {expandedGroups.includes(group.id) && group.items && (
                <div className={cn(
                  "mt-1 space-y-0.5 animate-fade-in",
                  isRTL ? "pr-4" : "pl-4"
                )}>
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
                        isActive(item.path)
                          ? 'bg-sidebar-primary/10 text-sidebar-primary font-medium'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                        isRTL && 'flex-row-reverse text-right'
                      )}
                    >
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{isArabic ? item.label.ar : item.label.en}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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
          <span className={isRTL ? "text-right" : "text-left"}>
            {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
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

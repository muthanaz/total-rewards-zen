import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  DollarSign,
  Recycle,
  Users,
  FileCheck,
  ShoppingBag,
  Lightbulb,
  Menu,
  X,
  LogOut,
  Settings,
  BookOpen,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  labelKey: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  titleKey: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

// Direct navigation links (single items without groups)
interface DirectNavItem {
  labelKey: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

const directNavItems: DirectNavItem[] = [
  { labelKey: 'nav.dashboard', path: '/employer', icon: LayoutDashboard },
  { labelKey: 'nav.claimsApprovals', path: '/employer/claims', icon: FileCheck, badge: 12 },
];

// Grouped navigation items
const navigationGroups: NavGroup[] = [
  {
    titleKey: 'nav.group.spendIntelligence',
    items: [
      { labelKey: 'nav.budgetUtilization', path: '/employer/spend', icon: DollarSign },
      { labelKey: 'nav.wasteRecovery', path: '/employer/zombie', icon: Recycle },
    ],
    defaultOpen: true,
  },
  {
    titleKey: 'nav.group.workforceInsights',
    items: [
      { labelKey: 'nav.employeeSegments', path: '/employer/segments', icon: Users },
      { labelKey: 'nav.smartRecommendations', path: '/employer/recommendations', icon: Lightbulb },
    ],
    defaultOpen: true,
  },
  {
    titleKey: 'nav.group.configuration',
    items: [
      { labelKey: 'nav.policyHub', path: '/employer/policies', icon: BookOpen },
      { labelKey: 'nav.integrations', path: '/employer/integrations', icon: Settings },
    ],
    defaultOpen: false,
  },
];

// Marketplace as a special standalone item at the bottom
const marketplaceItem: DirectNavItem = {
  labelKey: 'nav.marketplaceAnalytics',
  path: '/employer/marketplace',
  icon: ShoppingBag,
};

export function EmployerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t, direction } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navigationGroups.filter(g => g.defaultOpen !== false).map(g => g.titleKey)
  );
  const isRTL = direction === 'rtl';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;
  
  const toggleGroup = (groupTitleKey: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupTitleKey) 
        ? prev.filter(g => g !== groupTitleKey)
        : [...prev, groupTitleKey]
    );
  };

  // Calculate total pending actions
  const totalPendingActions = directNavItems.reduce((sum, item) => sum + (item.badge || 0), 0);

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
            <span className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full bg-sidebar-accent text-sidebar-primary shrink-0",
              isRTL ? "mr-1" : "ml-1"
            )}>
              {t('common.employer')}
            </span>
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        {totalPendingActions > 0 && (
          <div className={cn(
            "flex items-center gap-2 mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20",
            isRTL && "flex-row-reverse"
          )}>
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-600">
              {totalPendingActions} {t('nav.pendingActions')}
            </span>
          </div>
        )}
        
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
        "flex-1 overflow-y-auto py-4 px-3",
        isRTL && "text-right"
      )}>
        {/* Direct Navigation Items */}
        <div className="space-y-0.5 mb-4">
          {directNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'nav-item relative',
                isActive(item.path) && 'nav-item-active',
                isRTL && 'flex-row-reverse text-right'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className={cn("text-sm flex-1", isRTL && "text-right")}>{t(item.labelKey)}</span>
              {item.badge && item.badge > 0 && (
                <Badge 
                  variant="outline" 
                  className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-amber-500/10 text-amber-600 border-amber-500/20"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>

        {/* Grouped Navigation */}
        {navigationGroups.map((group) => (
          <div key={group.titleKey} className="mb-2">
            <button
              onClick={() => toggleGroup(group.titleKey)}
              className={cn(
                "flex items-center justify-between w-full px-2 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground/70 transition-colors",
                isRTL && "flex-row-reverse"
              )}
            >
              <span>{t(group.titleKey)}</span>
              <ChevronDown className={cn(
                "w-3 h-3 transition-transform",
                expandedGroups.includes(group.titleKey) ? "rotate-180" : ""
              )} />
            </button>
            
            {expandedGroups.includes(group.titleKey) && (
              <div className="space-y-0.5 mt-1">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'nav-item relative',
                      isActive(item.path) && 'nav-item-active',
                      isRTL && 'flex-row-reverse text-right'
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className={cn("text-sm flex-1", isRTL && "text-right")}>{t(item.labelKey)}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge 
                        variant="outline" 
                        className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-amber-500/10 text-amber-600 border-amber-500/20"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Marketplace - Standalone at bottom */}
        <div className="mt-4 pt-4 border-t border-sidebar-border/50">
          <Link
            to={marketplaceItem.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'nav-item relative',
              isActive(marketplaceItem.path) && 'nav-item-active',
              isRTL && 'flex-row-reverse text-right'
            )}
          >
            <marketplaceItem.icon className="w-4 h-4 shrink-0" />
            <span className={cn("text-sm flex-1", isRTL && "text-right")}>{t(marketplaceItem.labelKey)}</span>
          </Link>
        </div>
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

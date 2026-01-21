import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileCheck,
  Users,
  DollarSign,
  Ghost,
  FileText,
  Lightbulb,
  ShoppingBag,
  Database,
  BookOpen,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Briefcase,
  Eye,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useEmployerViewMode, ViewMode } from '@/contexts/EmployerViewModeContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
  /** If set, only show in these view modes */
  modes?: ViewMode[];
  /** If true, the group is feature-flagged and may be hidden */
  featureFlag?: keyof ReturnType<typeof useFeatureFlags>['flags'];
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  /** If set, only show in these view modes */
  modes?: ViewMode[];
}

/**
 * HR Operations Navigation - Tactical, day-to-day tasks
 * ONLY: Ops Dashboard, Claims & Approvals, Policies, Knowledge Hub, Integrations & Data
 */
const opsNavigationGroups: NavGroup[] = [
  // 1) Overview
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { label: 'Ops Dashboard', path: '/employer', icon: LayoutDashboard },
    ],
  },
  // 2) Operations
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { label: 'Claims & Approvals', path: '/employer/claims', icon: FileCheck },
    ],
  },
  // 3) Policies & Knowledge
  {
    id: 'policies',
    label: 'Policies & Knowledge',
    items: [
      { label: 'Policies', path: '/employer/policies', icon: FileText },
      { label: 'Knowledge Hub', path: '/employer/knowledge', icon: BookOpen },
    ],
  },
  // 4) Data & Settings
  {
    id: 'settings',
    label: 'Data & Settings',
    items: [
      { label: 'Integrations & Data', path: '/employer/integrations', icon: Database },
    ],
  },
];

/**
 * Executive Navigation - Strategic, high-level insights
 * DEMO-OPTIMIZED: 7 items max with action-oriented labels
 * Routes: /employer/dashboard, spend, zombie, segments, recommendations, policy-insights, integrations
 */
const execNavigationGroups: NavGroup[] = [
  // 1) Overview (single item, no group header needed in collapsed view)
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/employer', icon: LayoutDashboard },
    ],
  },
  // 2) Analytics & Insights
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { label: 'Spend & Utilization', path: '/employer/spend', icon: DollarSign },
      { label: 'Optimization Opportunities', path: '/employer/zombie', icon: Ghost },
      { label: 'Employee Insights', path: '/employer/segments', icon: Users },
    ],
  },
  // 3) Strategy & Actions
  {
    id: 'strategy',
    label: 'Strategy',
    items: [
      { label: 'Action Plan', path: '/employer/recommendations', icon: Lightbulb },
      { label: 'Policy Impact', path: '/employer/policy-insights', icon: TrendingUp },
    ],
  },
  // 4) Data Foundation
  {
    id: 'data',
    label: 'Data & Confidence',
    items: [
      { label: 'Data Sources', path: '/employer/integrations', icon: Database },
    ],
  },
  // 5) Marketplace (Phase 2 - feature-flagged, exec read-only)
  {
    id: 'marketplace',
    label: 'Marketplace',
    featureFlag: 'marketplaceEnabled',
    items: [
      { label: 'Marketplace Impact', path: '/employer/marketplace', icon: ShoppingBag },
    ],
  },
];

export function EmployerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { direction } = useLanguage();
  const { viewMode, setViewMode, isExecutive } = useEmployerViewMode();
  const { flags } = useFeatureFlags();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Get the appropriate navigation based on view mode
  const baseGroups = isExecutive ? execNavigationGroups : opsNavigationGroups;
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    baseGroups.map((g) => g.id)
  );
  const isRTL = direction === 'rtl';

  // Filter groups based on feature flags
  const visibleGroups = useMemo(() => {
    return baseGroups.filter((group) => {
      if (group.featureFlag) {
        return flags[group.featureFlag];
      }
      return true;
    });
  }, [baseGroups, flags]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((g) => g !== groupId)
        : [...prev, groupId]
    );
  };

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Reset expanded groups when mode changes
    const newGroups = mode === 'executive' ? execNavigationGroups : opsNavigationGroups;
    setExpandedGroups(newGroups.map((g) => g.id));
  };

  const sidebarContent = (
    <>
      {/* Logo & Branding */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div
          className={cn(
            'flex items-center justify-between',
            isRTL && 'flex-row-reverse'
          )}
        >
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shrink-0">
              <span className="text-sidebar-background font-bold text-lg">b</span>
            </div>
            <span className="font-display text-xl font-bold text-sidebar-foreground">
              bnft.
            </span>
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full shrink-0',
                isExecutive 
                  ? 'bg-violet-500/20 text-violet-300' 
                  : 'bg-sidebar-accent text-sidebar-primary',
                isRTL ? 'mr-1' : 'ml-1'
              )}
            >
              {isExecutive ? 'Executive' : 'HR Ops'}
            </span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mt-4 p-1 bg-sidebar-accent/50 rounded-xl">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => handleModeChange('operational')}
              className={cn(
                'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200',
                !isExecutive
                  ? 'bg-sidebar-background text-sidebar-foreground shadow-sm'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>HR Ops</span>
            </button>
            <button
              onClick={() => handleModeChange('executive')}
              className={cn(
                'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200',
                isExecutive
                  ? 'bg-sidebar-background text-sidebar-foreground shadow-sm'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Executive</span>
            </button>
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

      {/* Navigation Groups */}
      <nav className={cn('flex-1 overflow-y-auto py-4 px-3', isRTL && 'text-right')}>
        {visibleGroups.map((group) => (
          <div key={group.id} className="mb-3">
            <button
              onClick={() => toggleGroup(group.id)}
              className={cn(
                'flex items-center justify-between w-full px-2 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground/70 transition-colors',
                isRTL && 'flex-row-reverse'
              )}
            >
              <span>{group.label}</span>
              <ChevronDown
                className={cn(
                  'w-3 h-3 transition-transform',
                  expandedGroups.includes(group.id) ? 'rotate-180' : ''
                )}
              />
            </button>

            {expandedGroups.includes(group.id) && (
              <div className="space-y-0.5 mt-1">
                {group.items.map((item) => (
                  <Link
                    key={item.path + item.label}
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
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

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
          <span className={isRTL ? 'text-right' : 'text-left'}>Sign Out</span>
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

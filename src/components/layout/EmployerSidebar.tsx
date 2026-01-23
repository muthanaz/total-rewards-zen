import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileCheck,
  Users,
  DollarSign,
  Lightbulb,
  FileText,
  ShoppingBag,
  Database,
  BookOpen,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Eye,
  TrendingUp,
  Shield,
  AlertTriangle,
  Settings,
  HelpCircle,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useEmployerViewMode, ViewMode } from '@/contexts/EmployerViewModeContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  description?: string;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
  featureFlag?: keyof ReturnType<typeof useFeatureFlags>['flags'];
}

// ============================================================================
// HR OPS NAVIGATION - Queue-first operational workbench
// ============================================================================

const opsNavigation: NavSection[] = [
  // 1) QUEUE - Primary operational focus
  {
    id: 'queue',
    label: 'Queue',
    items: [
      { 
        label: 'Claims & Approvals', 
        path: '/employer/claims', 
        icon: FileCheck,
        description: 'Process pending requests',
      },
    ],
  },
  // 2) POLICIES
  {
    id: 'policies',
    label: 'Policies',
    items: [
      { label: 'Policy Management', path: '/employer/policies', icon: FileText },
      { label: 'Policy Insights', path: '/employer/policy-insights', icon: TrendingUp, badge: 'HR Lead' },
    ],
  },
  // 3) DATA
  {
    id: 'data',
    label: 'Data',
    items: [
      { label: 'Integrations', path: '/employer/integrations', icon: Database },
      { label: 'Data Quality Rules', path: '/employer/data-quality/rules', icon: Shield },
      { label: 'Sync Status', path: '/employer/data-quality/sync', icon: AlertTriangle },
    ],
  },
  // 4) SUPPORT
  {
    id: 'support',
    label: 'Support',
    items: [
      { label: 'Knowledge Center', path: '/employer/knowledge', icon: HelpCircle },
    ],
  },
];

// ============================================================================
// EXECUTIVE NAVIGATION - KPI → Drivers → Actions hierarchy
// ============================================================================

const execNavigation: NavSection[] = [
  // 1) OVERVIEW
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { label: 'Executive Dashboard', path: '/employer', icon: LayoutDashboard },
    ],
  },
  // 2) SPEND - "What happened?"
  {
    id: 'spend',
    label: 'Spend',
    items: [
      { 
        label: 'Spend & Utilization', 
        path: '/employer/spend', 
        icon: DollarSign,
        description: 'KPI trends, allocation, utilization',
      },
    ],
  },
  // 3) OPPORTUNITIES - "Where is the opportunity?"
  {
    id: 'opportunities',
    label: 'Opportunities',
    items: [
      { 
        label: 'Optimization', 
        path: '/employer/zombie', 
        icon: Lightbulb,
        description: 'Unrealized value & root causes',
      },
      { 
        label: 'Segments', 
        path: '/employer/segments', 
        icon: Users,
        description: 'Employee cohort analysis',
      },
    ],
  },
  // 4) ACTION PLAN - "What should we do?"
  {
    id: 'action-plan',
    label: 'Action Plan',
    items: [
      { 
        label: 'Recommendations', 
        path: '/employer/recommendations', 
        icon: BarChart3,
        description: 'Track & measure actions',
      },
    ],
  },
  // 5) GOVERNANCE
  {
    id: 'governance',
    label: 'Governance',
    items: [
      { label: 'Policy Impact', path: '/employer/policy-insights', icon: TrendingUp },
    ],
  },
  // 6) ECOSYSTEM
  {
    id: 'ecosystem',
    label: 'Ecosystem',
    featureFlag: 'marketplaceEnabled',
    items: [
      { label: 'Marketplace Impact', path: '/employer/marketplace', icon: ShoppingBag },
    ],
  },
  // 7) TRUST - Read-only data framing
  {
    id: 'trust',
    label: 'Trust',
    items: [
      { 
        label: 'Data Sources', 
        path: '/employer/integrations', 
        icon: Database,
        badge: 'Read-only',
      },
    ],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function EmployerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { direction } = useLanguage();
  const { viewMode, setViewMode, isExecutive } = useEmployerViewMode();
  const { flags } = useFeatureFlags();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Get the navigation based on mode
  const baseNavigation = isExecutive ? execNavigation : opsNavigation;
  
  // Expanded sections - start with all expanded
  const [expandedSections, setExpandedSections] = useState<string[]>(
    baseNavigation.map((s) => s.id)
  );
  const isRTL = direction === 'rtl';

  // Filter by feature flags
  const visibleNavigation = useMemo(() => {
    return baseNavigation.filter((section) => {
      if (section.featureFlag) {
        return flags[section.featureFlag];
      }
      return true;
    });
  }, [baseNavigation, flags]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    if (path === '/employer') return location.pathname === '/employer';
    return location.pathname.startsWith(path);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Reset expanded sections when mode changes
    const newNavigation = mode === 'executive' ? execNavigation : opsNavigation;
    setExpandedSections(newNavigation.map((s) => s.id));
    // Navigate to the appropriate dashboard
    navigate('/employer');
  };

  const ChevronIcon = isRTL ? ChevronRight : ChevronDown;

  const sidebarContent = (
    <>
      {/* Logo & Branding */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shrink-0">
              <span className="text-sidebar-background font-bold text-lg">b</span>
            </div>
            <span className="font-display text-xl font-bold text-sidebar-foreground">bnft.</span>
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

        {/* Mode indicator */}
        <div className={cn(
          'mt-3 px-3 py-2 rounded-lg text-xs',
          isExecutive 
            ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20' 
            : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
        )}>
          {isExecutive 
            ? '📊 KPI → Drivers → Actions → Narrative'
            : '📋 Queue-first operational workbench'
          }
        </div>

        {/* Theme & Language Controls */}
        <div className={cn(
          'flex items-center gap-1 mt-3 pt-3 border-t border-sidebar-border/50',
          isRTL && 'flex-row-reverse'
        )}>
          <NotificationCenter />
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 overflow-y-auto py-4 px-3', isRTL && 'text-right')}>
        {visibleNavigation.map((section) => (
          <div key={section.id} className="mb-3">
            <button
              onClick={() => toggleSection(section.id)}
              className={cn(
                'flex items-center justify-between w-full px-2 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/50 hover:text-sidebar-foreground/70 transition-colors rounded-md',
                isRTL && 'flex-row-reverse'
              )}
            >
              <span>{section.label}</span>
              <ChevronDown className={cn(
                'w-3 h-3 transition-transform',
                expandedSections.includes(section.id) ? 'rotate-0' : '-rotate-90'
              )} />
            </button>

            {expandedSections.includes(section.id) && (
              <div className="space-y-0.5 mt-1 animate-fade-in">
                {section.items.map((item) => (
                  <Link
                    key={item.path + item.label}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'nav-item group',
                      isActive(item.path) && 'nav-item-active',
                      isRTL && 'flex-row-reverse text-right'
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm truncate', isRTL && 'text-right')}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className="text-[9px] px-1.5 py-0 h-4 bg-muted/50 shrink-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
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
            ? mobileOpen ? 'translate-x-0' : 'translate-x-full'
            : mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

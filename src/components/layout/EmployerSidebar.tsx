import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  KanbanSquare,
  Inbox,
  Users,
  ShieldAlert,
  BookOpen,
  Cable,
  Database,
  Briefcase,
  Eye,
  PieChart,
  LineChart,
  Banknote,
  TableProperties,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployerViewMode, ViewMode } from '@/contexts/EmployerViewModeContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useActionApprovals } from '@/hooks/useActionApprovals';

import {
  SidebarShell,
  SidebarHeader,
  SidebarNav,
  SidebarFooter,
} from './sidebar';

// ============================================================================
// NAVIGATION DATA
// ============================================================================

interface NavItem {
  label: string;
  labelAr?: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  showPendingBadge?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  labelAr?: string;
  items: NavItem[];
  featureFlag?: keyof ReturnType<typeof useFeatureFlags>['flags'];
}

// ============================================================================
// UNIFIED NAVIGATION (3 Groups: Strategy, Operations, Configuration)
// ============================================================================

const unifiedNavigation: NavGroup[] = [
  {
    id: 'strategy',
    label: 'Strategy',
    labelAr: 'الاستراتيجية',
    items: [
      { label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/employer', icon: LayoutDashboard },
      { label: 'Investment Analysis', labelAr: 'تحليل الاستثمار', path: '/employer/spend', icon: BarChart3 },
      { label: 'Segments', labelAr: 'الشرائح', path: '/employer/segments', icon: PieChart },
      { label: 'ROI & Savings', labelAr: 'العائد والتوفير', path: '/employer/optimization', icon: TrendingUp },
      { label: 'Benchmarks', labelAr: 'المقارنات المعيارية', path: '/employer/benchmarks', icon: LineChart },
      { label: 'Action Plan', labelAr: 'خطة العمل', path: '/employer/actions', icon: KanbanSquare, showPendingBadge: true },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    labelAr: 'العمليات',
    items: [
      { label: 'Claims & Requests', labelAr: 'المطالبات والطلبات', path: '/employer/claims', icon: Inbox },
      { label: 'Settlements', labelAr: 'التسويات', path: '/employer/settlements', icon: Banknote },
      { label: 'Reports', labelAr: 'التقارير', path: '/employer/reports', icon: TableProperties },
      { label: 'Employee Directory', labelAr: 'دليل الموظفين', path: '/employer/employees', icon: Users },
    ],
  },
  {
    id: 'configuration',
    label: 'Configuration',
    labelAr: 'الإعدادات',
    items: [
      { label: 'Policy Management', labelAr: 'إدارة السياسات', path: '/employer/policies', icon: BookOpen },
      { label: 'Integrations', labelAr: 'التكاملات', path: '/employer/integrations', icon: Cable },
      { label: 'Data Quality', labelAr: 'جودة البيانات', path: '/employer/data-quality', icon: Database },
      { label: 'Audit Logs', labelAr: 'سجلات التدقيق', path: '/employer/audit', icon: ShieldAlert },
    ],
  },
];

// CEO-OPTIMIZED EXECUTIVE NAVIGATION (6 flat items - no collapsible sections)
const execNavItems: NavItem[] = [
  { label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/employer', icon: LayoutDashboard },
  { label: 'Investment Analysis', labelAr: 'تحليل الاستثمار', path: '/employer/spend', icon: BarChart3 },
  { label: 'Segments', labelAr: 'الشرائح', path: '/employer/segments', icon: PieChart },
  { label: 'ROI & Savings', labelAr: 'العائد والتوفير', path: '/employer/optimization', icon: TrendingUp },
  { label: 'Benchmarks', labelAr: 'المقارنات المعيارية', path: '/employer/benchmarks', icon: LineChart },
  { label: 'Action Plan', labelAr: 'خطة العمل', path: '/employer/actions', icon: KanbanSquare, showPendingBadge: true },
];

// ============================================================================
// EXECUTIVE NAV ITEM COMPONENT (flat, no sections)
// ============================================================================

function ExecNavItem({ item, pendingCount }: { item: NavItem; pendingCount: number }) {
  const location = useLocation();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const isActive = item.path === location.pathname || 
    (item.path !== '/employer' && location.pathname.startsWith(item.path + '/'));
  const isDashboard = item.path === '/employer';
  const finalActive = isDashboard ? location.pathname === '/employer' : isActive;
  
  const displayLabel = language === 'ar' && item.labelAr ? item.labelAr : item.label;
  const Icon = item.icon;
  
  return (
    <Link
      to={item.path}
      className={cn(
        'nav-item',
        finalActive && 'nav-item-active',
        isRTL && 'flex-row-reverse text-right'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className={cn('text-sm flex-1', isRTL && 'text-right')}>{displayLabel}</span>
      {item.showPendingBadge && pendingCount > 0 && (
        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-warning text-warning-foreground">
          {pendingCount}
        </span>
      )}
    </Link>
  );
}

// ============================================================================
// VIEW MODE TOGGLE COMPONENT
// ============================================================================

function ViewModeToggle() {
  const navigate = useNavigate();
  const { direction } = useLanguage();
  const { viewMode, setViewMode, isExecutive } = useEmployerViewMode();
  const isRTL = direction === 'rtl';

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'operational') {
      navigate('/employer/claims');
    } else {
      navigate('/employer');
    }
  };

  return (
    <div className="mt-3 p-1 bg-sidebar-accent/50 rounded-xl">
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
  );
}

// ============================================================================
// EXECUTIVE FOOTER (Clean - export is in dashboard header)
// ============================================================================

function ExecSidebarFooter() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
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
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { SidebarSection, SidebarItem } from './sidebar';

export function EmployerSidebar() {
  const { flags } = useFeatureFlags();
  const { isExecutive } = useEmployerViewMode();
  const { pendingApprovals } = useActionApprovals();
  const pendingCount = pendingApprovals?.length || 0;

  const location = useLocation();

  // Determine which sections should be expanded by default
  const getDefaultExpandedSections = () => {
    const path = location.pathname;
    // Always expand operations when on ops-related pages
    const opsPages = ['/employer/claims', '/employer/settlements', '/employer/reports', '/employer/employees', '/employer/ops'];
    if (opsPages.some(p => path.startsWith(p))) {
      return unifiedNavigation.map(s => s.id); // All expanded, but operations is guaranteed
    }
    return unifiedNavigation.map(s => s.id);
  };

  const [expandedSections, setExpandedSections] = useState<string[]>(getDefaultExpandedSections);

  // Update expanded sections when route changes to ensure relevant section is open
  useEffect(() => {
    const path = location.pathname;
    const opsPages = ['/employer/claims', '/employer/settlements', '/employer/reports', '/employer/employees', '/employer/ops'];
    if (opsPages.some(p => path.startsWith(p))) {
      setExpandedSections(prev => prev.includes('operations') ? prev : [...prev, 'operations']);
    }
  }, [location.pathname]);

  const visibleNavigation = useMemo(() => {
    return unifiedNavigation.filter((section) => {
      if (section.featureFlag) {
        return flags[section.featureFlag];
      }
      return true;
    });
  }, [flags]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <SidebarShell>
      <SidebarHeader extraContent={<ViewModeToggle />} />

      <SidebarNav>
        {isExecutive ? (
          // EXECUTIVE MODE: Flat navigation (CEO-optimized)
          <div className="space-y-1">
            {execNavItems.map((item) => (
              <ExecNavItem 
                key={item.path} 
                item={item} 
                pendingCount={pendingCount}
              />
            ))}
          </div>
        ) : (
          // OPERATIONAL MODE: Collapsible sections (Strategy, Operations, Configuration)
          visibleNavigation.map((group) => (
            <SidebarSection
              key={group.id}
              id={group.id}
              label={group.label}
              labelAr={group.labelAr}
              isOpen={expandedSections.includes(group.id)}
              onToggle={() => toggleSection(group.id)}
            >
              {group.items.map((item) => (
                <SidebarItem
                  key={item.path + item.label}
                  path={item.path}
                  label={item.label}
                  labelAr={item.labelAr}
                  icon={item.icon}
                  badge={item.badge}
                  badgeCount={item.showPendingBadge ? pendingCount : undefined}
                />
              ))}
            </SidebarSection>
          ))
        )}
      </SidebarNav>

      {/* Executive mode gets special footer with Board Pack export */}
      {isExecutive ? <ExecSidebarFooter /> : <SidebarFooter />}
    </SidebarShell>
  );
}

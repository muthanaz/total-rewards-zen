import { useState, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileCheck,
  Users,
  DollarSign,
  Lightbulb,
  FileText,
  Database,
  Briefcase,
  Eye,
  TrendingUp,
  Shield,
  HelpCircle,
  BarChart3,
  ClipboardList,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployerViewMode, ViewMode } from '@/contexts/EmployerViewModeContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useActionApprovals } from '@/hooks/useActionApprovals';
import { BoardPackExportButton } from '@/components/employer/BoardPackExportButton';
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
// NAVIGATION GROUPINGS
// ============================================================================

// HR OPS NAVIGATION (operational workbench)
const opsNavigation: NavGroup[] = [
  {
    id: 'run-operations',
    label: 'Run Operations',
    labelAr: 'تشغيل العمليات',
    items: [
      { label: 'Claims Queue', labelAr: 'قائمة المطالبات', path: '/employer/claims', icon: FileCheck },
      { label: 'Knowledge Center', labelAr: 'مركز المعرفة', path: '/employer/knowledge', icon: HelpCircle },
    ],
  },
  {
    id: 'improve-policies',
    label: 'Improve Policies',
    labelAr: 'تحسين السياسات',
    items: [
      { label: 'Policy Management', labelAr: 'إدارة السياسات', path: '/employer/policies', icon: FileText },
      { label: 'Policy Insights', labelAr: 'رؤى السياسات', path: '/employer/policy-insights', icon: TrendingUp },
    ],
  },
  {
    id: 'data-trust',
    label: 'Data & Trust',
    labelAr: 'البيانات والثقة',
    items: [
      { label: 'Integrations', labelAr: 'التكاملات', path: '/employer/integrations', icon: Database },
      { label: 'Data Quality', labelAr: 'جودة البيانات', path: '/employer/data-quality/rules', icon: Shield },
    ],
  },
];

// CEO-OPTIMIZED EXECUTIVE NAVIGATION (5 flat items - no collapsible sections)
const execNavItems: NavItem[] = [
  { label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/employer', icon: LayoutDashboard },
  { label: 'Investment Analysis', labelAr: 'تحليل الاستثمار', path: '/employer/spend', icon: DollarSign },
  { label: 'Recovery Opportunities', labelAr: 'فرص الاسترداد', path: '/employer/zombie', icon: Lightbulb },
  { label: 'Action Plan', labelAr: 'خطة العمل', path: '/employer/recommendations', icon: ClipboardList, showPendingBadge: true },
  { label: 'Risk & Compliance', labelAr: 'المخاطر والامتثال', path: '/employer/policy-insights', icon: Shield },
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
      <Icon className={cn(
        'w-4 h-4 shrink-0 text-primary',
        finalActive && 'text-primary'
      )} />
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
// EXECUTIVE FOOTER WITH BOARD PACK
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

  // Mock metrics for board pack - in production, fetch from context/API
  const boardPackMetrics = {
    totalInvestment: 2450000,
    utilizationRate: 73,
    unrealizedValue: 485000,
    satisfactionScore: 82,
  };

  return (
    <div className={cn('p-4 border-t border-sidebar-border space-y-3', isRTL && 'text-right')}>
      {/* Board Pack Export */}
      <BoardPackExportButton metrics={boardPackMetrics} />
      
      {/* Sign Out */}
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

  // HR Ops mode uses collapsible sections
  const [expandedSections, setExpandedSections] = useState<string[]>(
    opsNavigation.map((s) => s.id)
  );

  const visibleOpsNavigation = useMemo(() => {
    return opsNavigation.filter((section) => {
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
          // EXECUTIVE MODE: Flat 5-item navigation (CEO-optimized)
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
          // HR OPS MODE: Collapsible sections
          visibleOpsNavigation.map((group) => (
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

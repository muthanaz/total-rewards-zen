/**
 * Employer Sidebar - Market-Leader Navigation
 * 
 * Two distinct modes with no overlap:
 * - Executive View: Flat, 6 strategic items only
 * - HR Ops View: Grouped sections (Operations, Governance)
 * 
 * Mode toggle is in EmployerLayout header.
 */

import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LayoutGrid,
  BarChart3,
  KanbanSquare,
  Users,
  BookOpen,
  Cable,
  Database,
  PieChart,
  LineChart,
  Banknote,
  TableProperties,
  Megaphone,
  CalendarDays,
  Workflow,
  UsersRound,
  Shield,
  Target,
} from 'lucide-react';
import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useActionApprovals } from '@/hooks/useActionApprovals';

import {
  SidebarShell,
  SidebarHeader,
  SidebarNav,
  SidebarFooter,
  SidebarSection,
  SidebarItem,
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
// EXECUTIVE VIEW NAVIGATION (Flat, 6 items - CEO-optimized)
// ============================================================================

const execNavItems: NavItem[] = [
  { label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/employer', icon: LayoutDashboard },
  { label: 'Spend & Forecast', labelAr: 'الإنفاق والتوقعات', path: '/employer/spend', icon: BarChart3 },
  { label: 'Drivers & Segments', labelAr: 'المحركات والشرائح', path: '/employer/segments', icon: PieChart },
  { label: 'Optimization', labelAr: 'التحسين', path: '/employer/optimization', icon: Target },
  { label: 'Benchmarks', labelAr: 'المقارنات المعيارية', path: '/employer/benchmarks', icon: LineChart },
  { label: 'Action Plan', labelAr: 'خطة العمل', path: '/employer/actions', icon: KanbanSquare, showPendingBadge: true },
];

// ============================================================================
// HR OPS VIEW NAVIGATION (Grouped sections)
// ============================================================================

const opsNavigation: NavGroup[] = [
  {
    id: 'operations',
    label: 'OPERATIONS',
    labelAr: 'العمليات',
    items: [
      { label: 'Operations Hub', labelAr: 'مركز العمليات', path: '/employer/ops', icon: LayoutGrid },
      { label: 'Settlements', labelAr: 'التسويات', path: '/employer/settlements', icon: Banknote },
      { label: 'Communications', labelAr: 'الاتصالات', path: '/employer/communications', icon: Megaphone },
      { label: 'Calendar', labelAr: 'التقويم', path: '/employer/calendar', icon: CalendarDays },
      { label: 'Employee Directory', labelAr: 'دليل الموظفين', path: '/employer/employees', icon: Users },
      { label: 'Reports', labelAr: 'التقارير', path: '/employer/reports', icon: TableProperties },
    ],
  },
  {
    id: 'governance',
    label: 'GOVERNANCE',
    labelAr: 'الحوكمة',
    items: [
      { label: 'Policy Management', labelAr: 'إدارة السياسات', path: '/employer/policies', icon: BookOpen },
      { label: 'Workflows', labelAr: 'سير العمل', path: '/employer/settings/workflows', icon: Workflow },
      { label: 'Approver Groups', labelAr: 'مجموعات الموافقة', path: '/employer/settings/approver-groups', icon: UsersRound },
      { label: 'Integrations', labelAr: 'التكاملات', path: '/employer/integrations', icon: Cable },
      { label: 'Data Quality & Controls', labelAr: 'جودة البيانات والضوابط', path: '/employer/data-quality', icon: Database },
      { label: 'Security Audit', labelAr: 'التدقيق الأمني', path: '/employer/audit', icon: Shield },
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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
    const opsPages = ['/employer/settlements', '/employer/reports', '/employer/employees', '/employer/ops', '/employer/communications', '/employer/calendar'];
    if (opsPages.some(p => path.startsWith(p))) {
      return ['operations', 'governance'];
    }
    return ['operations', 'governance'];
  };

  const [expandedSections, setExpandedSections] = useState<string[]>(getDefaultExpandedSections);

  // Update expanded sections when route changes to ensure relevant section is open
  useEffect(() => {
    const path = location.pathname;
    const opsPages = ['/employer/settlements', '/employer/reports', '/employer/employees', '/employer/ops', '/employer/communications', '/employer/calendar'];
    if (opsPages.some(p => path.startsWith(p))) {
      setExpandedSections(prev => prev.includes('operations') ? prev : [...prev, 'operations']);
    }
    const govPages = ['/employer/policies', '/employer/integrations', '/employer/data-quality', '/employer/audit', '/employer/settings'];
    if (govPages.some(p => path.startsWith(p))) {
      setExpandedSections(prev => prev.includes('governance') ? prev : [...prev, 'governance']);
    }
  }, [location.pathname]);

  const visibleNavigation = useMemo(() => {
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
      {/* Mode toggle is now in EmployerLayout header - sidebar only shows navigation */}
      <SidebarHeader />

      <SidebarNav>
        {isExecutive ? (
          // EXECUTIVE MODE: Flat navigation using same SidebarItem as Employee
          <div className="space-y-0.5">
            {execNavItems.map((item) => (
              <SidebarItem
                key={item.path}
                path={item.path}
                label={item.label}
                labelAr={item.labelAr}
                icon={item.icon}
                badge={item.badge}
                badgeCount={item.showPendingBadge ? pendingCount : undefined}
              />
            ))}
          </div>
        ) : (
          // HR OPS MODE: Collapsible sections (Operations, Governance)
          visibleNavigation.map((group) => (
            <SidebarSection
              key={group.id}
              id={group.id}
              label={group.label}
              labelAr={group.labelAr}
              isOpen={expandedSections.includes(group.id)}
              onToggle={() => toggleSection(group.id)}
              // Highlight Operations group with subtle background in Ops mode
              className={group.id === 'operations' ? 'bg-sidebar-accent/5 rounded-lg mx-1 px-1' : undefined}
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

      {/* Same footer for both modes - matches Employee sidebar */}
      <SidebarFooter />
    </SidebarShell>
  );
}

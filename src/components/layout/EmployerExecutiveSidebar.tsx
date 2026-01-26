/**
 * EmployerExecutiveSidebar
 * 
 * Executive-mode sidebar for the Employer portal.
 * Uses the same shared sidebar components as Employee Portal for visual consistency.
 * Contains exactly 6 strategic menu items for executive decision-making.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  TrendingUp,
  Lightbulb,
  Users,
  ClipboardList,
  Shield,
  Briefcase,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployerViewMode, ViewMode } from '@/contexts/EmployerViewModeContext';
import {
  SidebarShell,
  SidebarHeader,
  SidebarNav,
  SidebarItem,
  SidebarFooter,
} from './sidebar';

// ============================================================================
// EXECUTIVE NAVIGATION (6 items exactly as specified)
// ============================================================================

interface NavItem {
  label: string;
  labelAr: string;
  path: string;
  icon: React.ElementType;
}

const EXECUTIVE_NAV_ITEMS: NavItem[] = [
  {
    label: 'Executive Summary',
    labelAr: 'الملخص التنفيذي',
    path: '/employer/executive-summary',
    icon: LayoutDashboard,
  },
  {
    label: 'Spend Efficiency',
    labelAr: 'كفاءة الإنفاق',
    path: '/employer/spend-efficiency',
    icon: TrendingUp,
  },
  {
    label: 'Recoverable Value',
    labelAr: 'القيمة القابلة للاسترداد',
    path: '/employer/recoverable-value',
    icon: Lightbulb,
  },
  {
    label: 'Segment Insights',
    labelAr: 'رؤى الشرائح',
    path: '/employer/segment-insights',
    icon: Users,
  },
  {
    label: 'Actions & Decisions',
    labelAr: 'الإجراءات والقرارات',
    path: '/employer/actions-decisions',
    icon: ClipboardList,
  },
  {
    label: 'Trust & Controls',
    labelAr: 'الثقة والضوابط',
    path: '/employer/trust-controls',
    icon: Shield,
  },
];

// ============================================================================
// VIEW MODE TOGGLE (same as current EmployerSidebar)
// ============================================================================

function ViewModeToggle() {
  const navigate = useNavigate();
  const { direction } = useLanguage();
  const { viewMode, setViewMode } = useEmployerViewMode();
  const isRTL = direction === 'rtl';

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'operational') {
      navigate('/employer/claims');
    } else {
      navigate('/employer/executive-summary');
    }
  };

  return (
    <div className="mt-4 p-1 bg-sidebar-accent/50 rounded-xl">
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={() => handleModeChange('operational')}
          className={cn(
            'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200',
            viewMode === 'operational'
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
            viewMode === 'executive'
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
// MAIN COMPONENT
// ============================================================================

export function EmployerExecutiveSidebar() {
  return (
    <SidebarShell>
      <SidebarHeader extraContent={<ViewModeToggle />} />

      <SidebarNav>
        {/* Single flat list of 6 executive items - no collapsible sections needed */}
        <div className="space-y-0.5">
          {EXECUTIVE_NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.path}
              path={item.path}
              label={item.label}
              labelAr={item.labelAr}
              icon={item.icon}
            />
          ))}
        </div>
      </SidebarNav>

      <SidebarFooter />
    </SidebarShell>
  );
}

export default EmployerExecutiveSidebar;

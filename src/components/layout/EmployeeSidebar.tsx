import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Home,
  GraduationCap,
  Heart,
  Car,
  Dumbbell,
  BookOpen,
  Calendar,
  Gift,
  Wallet,
  FileText,
  Building2,
  User,
  ShoppingBag,
  Receipt,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  SidebarShell,
  SidebarHeader,
  SidebarNav,
  SidebarSection,
  SidebarItem,
  SidebarStandaloneLink,
  SidebarFooter,
} from './sidebar';

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
  label: string;
  labelAr?: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

interface LifeAreaGroup {
  id: string;
  label: string;
  labelAr: string;
  items: NavItem[];
}

// ============================================================================
// LIFE AREA GROUPINGS (for visual separators only, no accordion)
// ============================================================================

// All benefit navigation items - names match dashboard exactly
const allBenefitItems: NavItem[] = [
  { label: 'Housing', labelAr: 'السكن', path: '/employee/housing', icon: Home },
  { label: 'Schooling', labelAr: 'التعليم', path: '/employee/schooling', icon: GraduationCap },
  { label: 'Health Insurance', labelAr: 'التأمين الصحي', path: '/employee/health', icon: Heart },
  { label: 'Transport', labelAr: 'النقل', path: '/employee/transport', icon: Car },
  { label: 'Wellbeing', labelAr: 'الرفاهية', path: '/employee/wellbeing', icon: Dumbbell },
  { label: 'Learning & Development', labelAr: 'التعلم والتطوير', path: '/employee/learning', icon: BookOpen },
  { label: 'Long-Term Financials', labelAr: 'الماليات طويلة الأجل', path: '/employee/long-term-financials', icon: Wallet },
];
// ============================================================================
// NAVIGATION DATA
// ============================================================================

const homeItems: NavItem[] = [
  { label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/employee', icon: LayoutDashboard },
  { label: 'My Actions', labelAr: 'إجراءاتي', path: '/employee/my-actions', icon: Zap },
];

const benefitsOverview: NavItem = {
  label: 'Benefits Overview',
  labelAr: 'نظرة عامة على المزايا',
  path: '/employee/benefits',
  icon: Gift,
};

const requestItems: NavItem[] = [
  { label: 'Requests', labelAr: 'الطلبات', path: '/employee/requests', icon: Receipt },
  { label: 'Documents', labelAr: 'المستندات', path: '/employee/documents', icon: FileText },
];

const helpItems: NavItem[] = [
  { label: 'Knowledge Hub', labelAr: 'مركز المعرفة', path: '/employee/knowledge', icon: HelpCircle },
  { label: 'Profile', labelAr: 'الملف الشخصي', path: '/employee/profile', icon: User },
  { label: 'Government Services', labelAr: 'الخدمات الحكومية', path: '/employee/gov-connect', icon: Building2, badge: 'Soon' },
];


// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EmployeeSidebar() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'home',
    'my-benefits',
    'my-requests',
  ]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <SidebarShell>
      <SidebarHeader />

      <SidebarNav>
        {/* Home Section */}
        <SidebarSection
          id="home"
          label="Home"
          labelAr="الرئيسية"
          isOpen={expandedSections.includes('home')}
          onToggle={() => toggleSection('home')}
        >
          {homeItems.map((item) => (
            <SidebarItem
              key={item.path}
              path={item.path}
              label={item.label}
              labelAr={item.labelAr}
              icon={item.icon}
              badge={item.badge}
            />
          ))}
        </SidebarSection>

        {/* My Benefits Section - Always shows all benefit links directly */}
        <SidebarSection
          id="my-benefits"
          label="My Benefits"
          labelAr="مزاياي"
          isOpen={expandedSections.includes('my-benefits')}
          onToggle={() => toggleSection('my-benefits')}
        >
          {/* Benefits Overview link */}
          <SidebarItem
            path={benefitsOverview.path}
            label={benefitsOverview.label}
            labelAr={benefitsOverview.labelAr}
            icon={benefitsOverview.icon}
          />
          
          {/* All benefit links - flat list, slightly indented to show hierarchy */}
          <div className="mt-1.5 space-y-0.5">
            {allBenefitItems.map((item) => (
              <SidebarItem
                key={item.path}
                path={item.path}
                label={item.label}
                labelAr={item.labelAr}
                icon={item.icon}
                badge={item.badge}
                indent={1}
              />
            ))}
          </div>
        </SidebarSection>

        {/* My Requests Section */}
        <SidebarSection
          id="my-requests"
          label="My Requests"
          labelAr="طلباتي"
          isOpen={expandedSections.includes('my-requests')}
          onToggle={() => toggleSection('my-requests')}
        >
          {requestItems.map((item) => (
            <SidebarItem
              key={item.path}
              path={item.path}
              label={item.label}
              labelAr={item.labelAr}
              icon={item.icon}
            />
          ))}
        </SidebarSection>

        {/* Time Off - Standalone */}
        <SidebarStandaloneLink
          path="/employee/leave"
          label="Time Off"
          labelAr="الإجازات"
          icon={Calendar}
        />

        {/* Marketplace - Standalone */}
        <SidebarStandaloneLink
          path="/employee/marketplace"
          label="Marketplace"
          labelAr="السوق"
          icon={ShoppingBag}
        />

        {/* Help & Settings Section */}
        <SidebarSection
          id="help-settings"
          label="Help & Settings"
          labelAr="المساعدة والإعدادات"
          isOpen={expandedSections.includes('help-settings')}
          onToggle={() => toggleSection('help-settings')}
        >
          {helpItems.map((item) => (
            <SidebarItem
              key={item.path}
              path={item.path}
              label={item.label}
              labelAr={item.labelAr}
              icon={item.icon}
              badge={item.badge}
            />
          ))}
        </SidebarSection>
      </SidebarNav>

      <SidebarFooter />
    </SidebarShell>
  );
}

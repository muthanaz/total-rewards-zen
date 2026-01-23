import { useState } from 'react';
import {
  LayoutDashboard,
  Tag,
  PlusCircle,
  Receipt,
  TrendingUp,
  Wallet,
  FileText,
  Store,
  Shield,
  Users,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  SidebarShell,
  SidebarHeader,
  SidebarNav,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
} from './sidebar';

// ============================================================================
// NAVIGATION DATA
// ============================================================================

interface NavItem {
  label: string;
  labelAr: string;
  path: string;
  icon: React.ElementType;
  isBeta?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  labelAr: string;
  items: NavItem[];
  isBeta?: boolean;
}

const navigationGroups: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    labelAr: 'نظرة عامة',
    items: [
      { label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/vendor', icon: LayoutDashboard },
    ],
  },
  {
    id: 'offers',
    label: 'Offers',
    labelAr: 'العروض',
    items: [
      { label: 'My Offers', labelAr: 'عروضي', path: '/vendor/offers', icon: Tag },
      { label: 'Create Offer', labelAr: 'إنشاء عرض', path: '/vendor/offers/new', icon: PlusCircle },
    ],
  },
  {
    id: 'revenue',
    label: 'Revenue',
    labelAr: 'الإيرادات',
    items: [
      { label: 'Redemptions', labelAr: 'الاستردادات', path: '/vendor/redemptions', icon: Receipt },
      { label: 'Earnings', labelAr: 'الأرباح', path: '/vendor/earnings', icon: Wallet },
      { label: 'Transactions', labelAr: 'المعاملات', path: '/vendor/transactions', icon: FileText },
    ],
  },
  {
    id: 'insights',
    label: 'Insights',
    labelAr: 'الرؤى',
    isBeta: true,
    items: [
      { label: 'Analytics', labelAr: 'التحليلات', path: '/vendor/analytics', icon: TrendingUp, isBeta: true },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    labelAr: 'الحساب',
    items: [
      { label: 'Profile', labelAr: 'الملف الشخصي', path: '/vendor/profile', icon: Shield },
      { label: 'Settings', labelAr: 'الإعدادات', path: '/vendor/settings', icon: Users },
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function VendorSidebar() {
  const { language } = useLanguage();

  // All sections expanded by default
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navigationGroups.map((g) => g.id)
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]
    );
  };

  // Custom vendor logo
  const vendorLogo = (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center shrink-0">
      <Store className="w-4 h-4 text-primary-foreground" />
    </div>
  );

  return (
    <SidebarShell>
      <SidebarHeader
        roleBadge={language === 'ar' ? 'بائع' : 'Vendor'}
        roleBadgeClass="bg-accent/20 text-accent-foreground"
        logoIcon={vendorLogo}
      />

      <SidebarNav>
        {navigationGroups.map((group) => (
          <SidebarSection
            key={group.id}
            id={group.id}
            label={group.label}
            labelAr={group.labelAr}
            isBeta={group.isBeta}
            isOpen={expandedGroups.includes(group.id)}
            onToggle={() => toggleGroup(group.id)}
          >
            {group.items.map((item) => (
              <SidebarItem
                key={item.path}
                path={item.path}
                label={item.label}
                labelAr={item.labelAr}
                icon={item.icon}
                isBeta={item.isBeta}
              />
            ))}
          </SidebarSection>
        ))}
      </SidebarNav>

      <SidebarFooter />
    </SidebarShell>
  );
}

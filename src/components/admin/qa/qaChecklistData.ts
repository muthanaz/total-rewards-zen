/**
 * QA Checklist Data - Internal verification gates
 * 
 * Categories and items for preventing regressions and ensuring
 * quality across all platform features.
 */

export interface QAChecklistItem {
  id: string;
  title: string;
  description: string;
  route?: string;
  category: QACategory;
  priority: 'critical' | 'high' | 'medium';
}

export type QACategory = 
  | 'terminology'
  | 'metrics'
  | 'navigation'
  | 'states'
  | 'permissions'
  | 'mobile'
  | 'rtl';

export const QA_CATEGORIES: Record<QACategory, { label: string; description: string; icon: string }> = {
  terminology: {
    label: 'Terminology Consistency',
    description: 'Verify standard terms are used everywhere',
    icon: 'Type',
  },
  metrics: {
    label: 'Metric Reconciliation',
    description: 'Ensure numbers match across portals',
    icon: 'Calculator',
  },
  navigation: {
    label: 'Role-Based Navigation',
    description: 'Verify nav items match user roles',
    icon: 'Navigation',
  },
  states: {
    label: 'Empty/Error States',
    description: 'Check all empty and error states are handled',
    icon: 'AlertCircle',
  },
  permissions: {
    label: 'Permission Checks',
    description: 'Verify RLS and access control',
    icon: 'Shield',
  },
  mobile: {
    label: 'Mobile Responsiveness',
    description: 'Test key pages on mobile viewports',
    icon: 'Smartphone',
  },
  rtl: {
    label: 'RTL Layout Sanity',
    description: 'Verify Arabic layout correctness',
    icon: 'Languages',
  },
};

export const QA_CHECKLIST_ITEMS: QAChecklistItem[] = [
  // === TERMINOLOGY ===
  {
    id: 'term-1',
    title: 'No "Zombie Spend" terminology',
    description: 'All instances should use "Budget Leakage" instead',
    route: '/employer',
    category: 'terminology',
    priority: 'critical',
  },
  {
    id: 'term-2',
    title: 'Currency format is "AED X,XXX"',
    description: 'Prefix AED, comma separators, no decimals unless required',
    route: '/employer',
    category: 'terminology',
    priority: 'high',
  },
  {
    id: 'term-3',
    title: '"Operations Hub" not "Workbench"',
    description: 'Navigation and page titles use correct term',
    route: '/employer/operations-hub',
    category: 'terminology',
    priority: 'high',
  },
  {
    id: 'term-4',
    title: 'Employee names show "Name (Grade)" format',
    description: 'Tables and lists use consistent employee references',
    route: '/employer/operations-hub',
    category: 'terminology',
    priority: 'medium',
  },
  {
    id: 'term-5',
    title: 'System-driven tone (no "AI vibes")',
    description: 'Use "Model estimate" or "System-Identified" not "AI-Powered"',
    route: '/employer',
    category: 'terminology',
    priority: 'high',
  },

  // === METRICS ===
  {
    id: 'metric-1',
    title: 'Employee Remaining = Entitled - Paid',
    description: 'Employee portal balances reconcile with employer view',
    route: '/employee',
    category: 'metrics',
    priority: 'critical',
  },
  {
    id: 'metric-2',
    title: 'Employer Paid + Pending = Employee view',
    description: 'Cross-portal financial reconciliation',
    route: '/employer',
    category: 'metrics',
    priority: 'critical',
  },
  {
    id: 'metric-3',
    title: 'Utilization % = Paid / Entitled',
    description: 'Utilization only reflects paid claims',
    route: '/employer',
    category: 'metrics',
    priority: 'critical',
  },
  {
    id: 'metric-4',
    title: 'Top Drivers sum matches section total',
    description: 'Reconciliation headers show % of total',
    route: '/employer',
    category: 'metrics',
    priority: 'high',
  },
  {
    id: 'metric-5',
    title: 'Claims count matches queue count',
    description: 'Dashboard totals equal Operations Hub queue',
    route: '/employer/operations-hub',
    category: 'metrics',
    priority: 'high',
  },

  // === NAVIGATION ===
  {
    id: 'nav-1',
    title: 'Executive mode hides Ops items',
    description: 'Claims Queue not visible in Executive view',
    route: '/employer',
    category: 'navigation',
    priority: 'high',
  },
  {
    id: 'nav-2',
    title: 'HR Ops mode shows Operations group',
    description: 'Full operational nav visible when toggled',
    route: '/employer',
    category: 'navigation',
    priority: 'high',
  },
  {
    id: 'nav-3',
    title: 'Admin sidebar isolated from employer',
    description: 'Admin portal has separate navigation',
    route: '/admin',
    category: 'navigation',
    priority: 'critical',
  },
  {
    id: 'nav-4',
    title: 'Employee sidebar role-appropriate',
    description: 'No employer/admin items visible',
    route: '/employee',
    category: 'navigation',
    priority: 'critical',
  },
  {
    id: 'nav-5',
    title: 'Breadcrumbs reflect current mode',
    description: 'Executive or HR Ops shown in breadcrumb',
    route: '/employer/spend',
    category: 'navigation',
    priority: 'medium',
  },

  // === EMPTY/ERROR STATES ===
  {
    id: 'state-1',
    title: 'Claims list empty state is actionable',
    description: 'Shows why empty + what to do next',
    route: '/employee/requests',
    category: 'states',
    priority: 'high',
  },
  {
    id: 'state-2',
    title: 'Ops queue empty state guides action',
    description: 'Clear messaging when no claims pending',
    route: '/employer/operations-hub',
    category: 'states',
    priority: 'high',
  },
  {
    id: 'state-3',
    title: 'Settlements empty state explains setup',
    description: 'Onboarding guidance if no batches',
    route: '/employer/settlements',
    category: 'states',
    priority: 'medium',
  },
  {
    id: 'state-4',
    title: 'Reports empty state prompts generation',
    description: 'CTA to generate first report',
    route: '/employer/reports',
    category: 'states',
    priority: 'medium',
  },
  {
    id: 'state-5',
    title: 'Error messages follow Problem+Cause+Fix',
    description: 'No generic "Something went wrong"',
    route: '/employer',
    category: 'states',
    priority: 'critical',
  },

  // === PERMISSIONS ===
  {
    id: 'perm-1',
    title: 'Employee cannot access /employer routes',
    description: 'Route guard redirects unauthorized users',
    route: '/employer',
    category: 'permissions',
    priority: 'critical',
  },
  {
    id: 'perm-2',
    title: 'Employer cannot access /admin routes',
    description: 'Admin portal protected from non-admins',
    route: '/admin',
    category: 'permissions',
    priority: 'critical',
  },
  {
    id: 'perm-3',
    title: 'RLS blocks cross-org data access',
    description: 'Queries only return org-scoped data',
    category: 'permissions',
    priority: 'critical',
  },
  {
    id: 'perm-4',
    title: 'Claim actions respect role permissions',
    description: 'Only HR Ops can approve/reject claims',
    route: '/employer/operations-hub',
    category: 'permissions',
    priority: 'high',
  },
  {
    id: 'perm-5',
    title: 'Policy publish requires approval workflow',
    description: 'Governance settings enforced',
    route: '/employer/policies',
    category: 'permissions',
    priority: 'high',
  },

  // === MOBILE ===
  {
    id: 'mobile-1',
    title: 'Employee dashboard usable on 375px',
    description: 'Cards stack, text readable, actions accessible',
    route: '/employee',
    category: 'mobile',
    priority: 'high',
  },
  {
    id: 'mobile-2',
    title: 'Claim submission works on mobile',
    description: 'Form fields, file upload accessible',
    route: '/employee/requests/new',
    category: 'mobile',
    priority: 'high',
  },
  {
    id: 'mobile-3',
    title: 'Employer sidebar collapses cleanly',
    description: 'Mobile menu toggle works',
    route: '/employer',
    category: 'mobile',
    priority: 'medium',
  },
  {
    id: 'mobile-4',
    title: 'Tables scroll horizontally',
    description: 'Wide tables don\'t break layout',
    route: '/employer/operations-hub',
    category: 'mobile',
    priority: 'medium',
  },
  {
    id: 'mobile-5',
    title: 'Modals/dialogs fit mobile viewport',
    description: 'Claim detail sheet scrollable',
    route: '/employer/operations-hub',
    category: 'mobile',
    priority: 'medium',
  },

  // === RTL ===
  {
    id: 'rtl-1',
    title: 'Sidebar flips to right side',
    description: 'Navigation on right in Arabic mode',
    route: '/employer',
    category: 'rtl',
    priority: 'high',
  },
  {
    id: 'rtl-2',
    title: 'Currency still prefix (AED X)',
    description: 'AED stays before number even in RTL',
    route: '/employer',
    category: 'rtl',
    priority: 'high',
  },
  {
    id: 'rtl-3',
    title: 'Tables maintain alignment logic',
    description: 'Currency columns right-aligned in RTL',
    route: '/employer/operations-hub',
    category: 'rtl',
    priority: 'medium',
  },
  {
    id: 'rtl-4',
    title: 'Icons don\'t flip inappropriately',
    description: 'Arrows, chevrons flip; objects don\'t',
    route: '/employer',
    category: 'rtl',
    priority: 'medium',
  },
  {
    id: 'rtl-5',
    title: 'Form labels and inputs aligned',
    description: 'Text inputs start from right',
    route: '/employee/profile',
    category: 'rtl',
    priority: 'medium',
  },
];

export interface QAChecklistResult {
  itemId: string;
  status: 'pass' | 'fail' | 'skip';
  notes?: string;
  checkedAt: string;
  checkedBy?: string;
}

export interface QAChecklistSnapshot {
  id: string;
  buildVersion: string;
  createdAt: string;
  results: QAChecklistResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

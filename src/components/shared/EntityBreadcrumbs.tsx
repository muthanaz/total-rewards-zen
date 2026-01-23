/**
 * EntityBreadcrumbs - Context-aware breadcrumbs with entity chips
 * 
 * Extends basic breadcrumbs with entity context (employee, request, policy, etc.)
 * for seamless cross-portal navigation.
 */

import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { EmployeeChip, RequestChip, PolicyChip, BenefitChip, SegmentChip } from './EntityChip';

// ============================================================================
// TYPES
// ============================================================================

interface BreadcrumbItem {
  label: string;
  path: string;
  isEntity?: boolean;
  entityType?: 'employee' | 'request' | 'policy' | 'benefit' | 'segment';
  entityData?: Record<string, any>;
}

interface EntityBreadcrumbsProps {
  /** Additional entity context to display */
  entityContext?: {
    type: 'employee' | 'request' | 'policy' | 'benefit' | 'segment';
    id: string;
    label: string;
    data?: Record<string, any>;
  };
  /** Custom prefix items */
  prefix?: BreadcrumbItem[];
  /** Hide home icon */
  hideHome?: boolean;
  className?: string;
}

// ============================================================================
// ROUTE LABELS
// ============================================================================

const routeLabels: Record<string, string> = {
  // Employee portal
  employee: 'Dashboard',
  housing: 'Housing Allowance',
  schooling: 'Schooling Allowance',
  health: 'Health Insurance',
  transport: 'Transport & Mobility',
  wellbeing: 'Wellbeing',
  financial: 'Financial Planning',
  equity: 'Equity & Options',
  learning: 'Learning & Development',
  leave: 'Leave Management',
  marketplace: 'Perks & Partners',
  documents: 'HR Documents',
  'gov-connect': 'Gov Connect',
  profile: 'Smart Profile',
  requests: 'Claims & Requests',
  benefits: 'My Benefits',
  'benefits-analysis': 'Insights & Optimization',
  onboarding: 'Onboarding',
  'knowledge-hub': 'Knowledge Hub',
  
  // Employer portal
  employer: 'Dashboard',
  spend: 'Spend Analytics',
  'zombie-spend': 'Zombie Spend',
  segments: 'Employee Segments',
  claims: 'Claims & Approvals',
  policies: 'Policy Management',
  'policy-insights': 'Policy Insights',
  recommendations: 'Recommendations',
  integrations: 'Integrations & Data',
  'knowledge-center': 'Knowledge Center',
  
  // Admin portal
  admin: 'Platform Admin',
  organizations: 'Organizations',
  benchmarks: 'Market Benchmarks',
  'market-intelligence': 'Market Intelligence',
  'spending-patterns': 'Spending Patterns',
  'saved-reports': 'Saved Reports',
  'data-migration': 'Data Migration',
  settings: 'Settings',
  'ui-configuration': 'UI Configuration',
  
  // Vendor portal
  vendor: 'Vendor Dashboard',
  offers: 'Offers',
  transactions: 'Transactions',
  earnings: 'Earnings',
  analytics: 'Analytics',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function EntityBreadcrumbs({
  entityContext,
  prefix,
  hideHome = false,
  className,
}: EntityBreadcrumbsProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Don't render for root-level pages
  if (pathSegments.length <= 1 && !entityContext && !prefix?.length) {
    return null;
  }

  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = prefix ? [...prefix] : [];
  let currentPath = '';

  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = routeLabels[segment] || formatSegmentLabel(segment);
    
    breadcrumbs.push({
      label,
      path: currentPath,
    });
  });

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn(
        "flex items-center gap-1.5 text-sm text-muted-foreground mb-4 flex-wrap",
        className
      )}
    >
      {/* Home link */}
      {!hideHome && (
        <Link 
          to={`/${pathSegments[0]}`}
          className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0"
        >
          <Home className="w-3.5 h-3.5" />
        </Link>
      )}

      {/* Path breadcrumbs */}
      {breadcrumbs.slice(hideHome ? 0 : 1).map((crumb, index) => {
        const isLast = index === breadcrumbs.length - (hideHome ? 1 : 2) && !entityContext;
        
        return (
          <div key={crumb.path} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
            
            {isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}

      {/* Entity context chip */}
      {entityContext && (
        <div className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
          <EntityContextChip {...entityContext} />
        </div>
      )}
    </nav>
  );
}

// ============================================================================
// ENTITY CONTEXT CHIP
// ============================================================================

interface EntityContextChipProps {
  type: 'employee' | 'request' | 'policy' | 'benefit' | 'segment';
  id: string;
  label: string;
  data?: Record<string, any>;
}

function EntityContextChip({ type, id, label, data }: EntityContextChipProps) {
  switch (type) {
    case 'employee':
      return (
        <EmployeeChip
          id={id}
          name={label}
          department={data?.department}
          avatarUrl={data?.avatarUrl}
          grade={data?.grade}
          size="sm"
          variant="inline"
        />
      );
    
    case 'request':
      return (
        <RequestChip
          id={id}
          subject={label}
          status={data?.status}
          type={data?.type}
          amount={data?.amount}
          size="sm"
          variant="inline"
        />
      );
    
    case 'policy':
      return (
        <PolicyChip
          id={id}
          benefitName={label}
          version={data?.version}
          isActive={data?.isActive}
          size="sm"
          variant="inline"
        />
      );
    
    case 'benefit':
      return (
        <BenefitChip
          id={id}
          name={label}
          category={data?.category}
          size="sm"
          variant="inline"
        />
      );
    
    case 'segment':
      return (
        <SegmentChip
          id={id}
          name={label}
          employeeCount={data?.employeeCount}
          size="sm"
          variant="inline"
        />
      );
    
    default:
      return <span className="font-medium text-foreground">{label}</span>;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function formatSegmentLabel(segment: string): string {
  // Handle UUIDs - show shortened version
  if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return `#${segment.slice(0, 8).toUpperCase()}`;
  }
  
  // Handle kebab-case or snake_case
  return segment
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================================
// PORTAL-SPECIFIC BREADCRUMB HOOKS
// ============================================================================

export function useEntityContext() {
  const [searchParams] = useSearchParams();
  
  // Check for entity context in URL params
  const employeeId = searchParams.get('employee');
  const requestId = searchParams.get('request');
  const policyId = searchParams.get('policy') || searchParams.get('version');
  const benefitId = searchParams.get('benefit');
  const segmentId = searchParams.get('segment') || searchParams.get('id');
  
  if (employeeId) {
    return { type: 'employee' as const, id: employeeId };
  }
  if (requestId) {
    return { type: 'request' as const, id: requestId };
  }
  if (policyId) {
    return { type: 'policy' as const, id: policyId };
  }
  if (benefitId) {
    return { type: 'benefit' as const, id: benefitId };
  }
  if (segmentId) {
    return { type: 'segment' as const, id: segmentId };
  }
  
  return null;
}

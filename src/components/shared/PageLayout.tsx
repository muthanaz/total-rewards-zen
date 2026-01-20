import { ReactNode } from 'react';
import { PageHeader } from './PageHeader';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PageLayoutProps {
  // PageHeader props
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  badge?: {
    label: string;
    icon?: LucideIcon;
    variant?: 'default' | 'accent' | 'success' | 'warning';
  };
  confidenceBadge?: ReactNode;
  actions?: ReactNode;
  // Filters slot (rendered directly under header)
  filters?: ReactNode;
  // Main content
  children: ReactNode;
  className?: string;
  // Control spacing
  spacing?: 'default' | 'compact' | 'none';
}

const spacingClasses = {
  default: 'space-y-6',
  compact: 'space-y-4',
  none: '',
};

/**
 * PageLayout - Unified page structure for all portals
 * 
 * Structure:
 * 1. PageHeader (title, description, badges, actions)
 * 2. Filters (optional - global filters bar)
 * 3. Content (children)
 * 
 * Usage:
 * ```tsx
 * <PageLayout
 *   title="Spend Analytics"
 *   description="Track benefit utilization and costs"
 *   icon={DollarSign}
 *   confidenceBadge={<DataConfidenceBadge metrics={metrics} />}
 *   actions={<Button>Export</Button>}
 *   filters={<EmployerGlobalFiltersBar />}
 * >
 *   <SectionCard title="Overview">...</SectionCard>
 * </PageLayout>
 * ```
 */
export function PageLayout({
  title,
  description,
  icon,
  iconClassName,
  badge,
  confidenceBadge,
  actions,
  filters,
  children,
  className,
  spacing = 'default',
}: PageLayoutProps) {
  return (
    <div className={cn('animate-fade-in', spacingClasses[spacing], className)}>
      {/* Page Header */}
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        iconClassName={iconClassName}
        badge={badge}
        confidenceBadge={confidenceBadge}
        actions={actions}
      />

      {/* Global Filters */}
      {filters}

      {/* Main Content */}
      {children}
    </div>
  );
}

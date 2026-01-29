/**
 * Empty State Component System
 * 
 * Standardized empty states that always answer:
 * 1. Why is this empty?
 * 2. What should the user do next?
 * 3. What happens after?
 * 
 * Enterprise tone: concise, actionable, no fluff.
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  FileX, 
  Search, 
  Package, 
  InboxIcon, 
  FolderOpen,
  AlertCircle,
  FileText,
  Receipt,
  Clock,
  Banknote,
  BarChart3,
  CheckCircle,
  Plus,
  Upload,
  Settings,
  type LucideIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateVariant = 'default' | 'search' | 'data' | 'error' | 'folder' | 'queue' | 'requests' | 'reports' | 'settlements' | 'policies';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** What happens after the user takes action */
  outcome?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Optional learn more link */
  learnMoreUrl?: string;
  learnMoreLabel?: string;
  className?: string;
  children?: ReactNode;
  /** Compact mode for inline usage */
  compact?: boolean;
}

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
  default: InboxIcon,
  search: Search,
  data: Package,
  error: AlertCircle,
  folder: FolderOpen,
  queue: Clock,
  requests: FileText,
  reports: BarChart3,
  settlements: Banknote,
  policies: FileText,
};

const variantColors: Record<EmptyStateVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  search: 'bg-accent/10 text-accent',
  data: 'bg-accent/10 text-accent',
  error: 'bg-destructive/10 text-destructive',
  folder: 'bg-muted text-muted-foreground',
  queue: 'bg-success/10 text-success',
  requests: 'bg-primary/10 text-primary',
  reports: 'bg-accent/10 text-accent',
  settlements: 'bg-success/10 text-success',
  policies: 'bg-primary/10 text-primary',
};

export function EmptyState({
  variant = 'default',
  icon,
  title,
  description,
  outcome,
  action,
  secondaryAction,
  learnMoreUrl,
  learnMoreLabel = 'Learn more',
  className,
  children,
  compact = false,
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-16 px-6',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={cn(
          'rounded-2xl flex items-center justify-center',
          compact ? 'w-12 h-12 mb-4' : 'w-16 h-16 mb-6',
          variantColors[variant]
        )}
      >
        <Icon className={compact ? 'w-6 h-6' : 'w-8 h-8'} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className={cn(
          'font-display font-semibold text-foreground',
          compact ? 'text-base mb-1' : 'text-lg mb-2'
        )}
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'text-muted-foreground max-w-sm',
            compact ? 'text-xs mb-3' : 'text-sm mb-2'
          )}
        >
          {description}
        </motion.p>
      )}

      {outcome && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="text-xs text-muted-foreground/80 max-w-sm mb-4"
        >
          → {outcome}
        </motion.p>
      )}

      {children}

      {(action || secondaryAction || learnMoreUrl) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col items-center gap-2 mt-2"
        >
          <div className="flex items-center gap-3">
            {action && (
              <Button onClick={action.onClick} size={compact ? 'sm' : 'default'} className="gap-2">
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="outline" size={compact ? 'sm' : 'default'} onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-1"
            >
              {learnMoreLabel} →
            </a>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================
// Pre-configured Empty States
// ============================================

/** No search results - clear explanation of why */
export function NoSearchResults({ 
  query, 
  onClear,
  entityName = 'items',
}: { 
  query?: string; 
  onClear?: () => void;
  entityName?: string;
}) {
  return (
    <EmptyState
      variant="search"
      title={`No ${entityName} found`}
      description={query 
        ? `No ${entityName} match "${query}". Check for typos or try broader terms.`
        : `No ${entityName} match your current filters.`
      }
      outcome={onClear ? "Clearing filters will show all available items" : undefined}
      action={onClear ? { label: 'Clear filters', onClick: onClear } : undefined}
    />
  );
}

/** Generic no data state */
export function NoData({ 
  title = 'No data available',
  description = 'There is no data to display at the moment.',
  action,
  outcome,
}: { 
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void; icon?: LucideIcon };
  outcome?: string;
}) {
  return (
    <EmptyState
      variant="data"
      title={title}
      description={description}
      outcome={outcome}
      action={action}
    />
  );
}

/** Error state with retry */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error while loading this content.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      variant="error"
      title={title}
      description={description}
      action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
    />
  );
}

// ============================================
// Domain-Specific Empty States
// ============================================

/** Employee requests - no requests yet */
export function NoRequestsEmpty({ 
  onCreateNew,
  statusFilter,
}: { 
  onCreateNew?: () => void;
  statusFilter?: string;
}) {
  // Context-aware messaging based on filter
  if (statusFilter === 'need_info') {
    return (
      <EmptyState
        variant="queue"
        icon={CheckCircle}
        title="No documents required"
        description="All your active requests have complete documentation."
        outcome="You'll see items here if HR requests additional documents"
        compact
      />
    );
  }

  if (statusFilter === 'approved') {
    return (
      <EmptyState
        variant="requests"
        title="No approved requests yet"
        description="Approved requests will appear here once HR processes your submissions."
        outcome="Approved claims typically move to payment within 3-5 business days"
        compact
      />
    );
  }

  if (statusFilter === 'rejected') {
    return (
      <EmptyState
        variant="requests"
        title="No rejected requests"
        description="None of your requests have been rejected."
        outcome="If a request is rejected, you'll see the reason and can resubmit"
        compact
      />
    );
  }

  return (
    <EmptyState
      variant="requests"
      title="No requests yet"
      description="Submit a claim for reimbursement, a pre-approval request, or a support question."
      outcome="Submitted requests are typically reviewed within 48 hours"
      action={onCreateNew ? { label: 'New Request', onClick: onCreateNew, icon: Plus } : undefined}
    />
  );
}

/** Operations hub - queue is empty */
export function QueueEmptyState({ 
  queueType,
  onRefresh,
}: { 
  queueType: 'my_queue' | 'all_queue';
  onRefresh?: () => void;
}) {
  if (queueType === 'my_queue') {
    return (
      <EmptyState
        variant="queue"
        icon={CheckCircle}
        title="Your queue is clear"
        description="No claims are currently assigned to you. Check the All Queue for unassigned items."
        outcome="New assignments will appear here automatically"
        action={onRefresh ? { label: 'Refresh', onClick: onRefresh } : undefined}
        compact
      />
    );
  }

  return (
    <EmptyState
      variant="queue"
      icon={CheckCircle}
      title="All claims processed"
      description="No claims require action. The queue will update as new submissions arrive."
      outcome="New claims appear within seconds of employee submission"
      action={onRefresh ? { label: 'Refresh', onClick: onRefresh } : undefined}
      compact
    />
  );
}

/** Settlements - no batches */
export function NoBatchesEmpty({ 
  onCreateBatch,
  hasFilter = false,
}: { 
  onCreateBatch?: () => void;
  hasFilter?: boolean;
}) {
  if (hasFilter) {
    return (
      <EmptyState
        variant="settlements"
        title="No batches match filters"
        description="Adjust your status or reconciliation filters to see batches."
        outcome="Removing filters will show all settlement batches"
        compact
      />
    );
  }

  return (
    <EmptyState
      variant="settlements"
      title="No settlement batches"
      description="Approved claims are grouped into batches for payment processing."
      outcome="Creating a batch generates export files for your finance system"
      action={onCreateBatch ? { label: 'Create Batch', onClick: onCreateBatch, icon: Plus } : undefined}
    />
  );
}

/** Policies - no policies configured */
export function NoPoliciesEmpty({ 
  onCreatePolicy,
  onImportDemo,
}: { 
  onCreatePolicy?: () => void;
  onImportDemo?: () => void;
}) {
  return (
    <EmptyState
      variant="policies"
      title="No policies configured"
      description="Policies define eligibility rules, caps, and required documents for each benefit."
      outcome="Published policies enable employees to submit claims against those benefits"
      action={onCreatePolicy ? { label: 'Create Policy', onClick: onCreatePolicy, icon: Plus } : undefined}
      secondaryAction={onImportDemo ? { label: 'Load demo policies', onClick: onImportDemo } : undefined}
    />
  );
}

/** Reports - no recent reports */
export function NoReportsEmpty({ 
  onGenerateReport,
}: { 
  onGenerateReport?: () => void;
}) {
  return (
    <EmptyState
      variant="reports"
      title="No reports generated"
      description="Generate your first report to see executive summaries, spend analysis, or SLA metrics."
      outcome="Reports can be scheduled for automatic delivery"
      action={onGenerateReport ? { label: 'Generate Report', onClick: onGenerateReport, icon: BarChart3 } : undefined}
    />
  );
}

/** Generic filtered empty - when filters return no results */
export function FilteredEmptyState({
  entityName,
  onClearFilters,
}: {
  entityName: string;
  onClearFilters?: () => void;
}) {
  return (
    <EmptyState
      variant="search"
      title={`No ${entityName} match filters`}
      description={`Try adjusting your filter criteria or search terms.`}
      outcome={`Clearing filters will show all ${entityName}`}
      action={onClearFilters ? { label: 'Clear all filters', onClick: onClearFilters } : undefined}
      compact
    />
  );
}

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  FileX, 
  Search, 
  Package, 
  InboxIcon, 
  FolderOpen,
  AlertCircle,
  type LucideIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateVariant = 'default' | 'search' | 'data' | 'error' | 'folder';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
  default: InboxIcon,
  search: Search,
  data: Package,
  error: AlertCircle,
  folder: FolderOpen,
};

const variantColors: Record<EmptyStateVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  search: 'bg-accent/10 text-accent',
  data: 'bg-accent/10 text-accent',
  error: 'bg-destructive/10 text-destructive',
  folder: 'bg-muted text-muted-foreground',
};

export function EmptyState({
  variant = 'default',
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center mb-6',
          variantColors[variant]
        )}
      >
        <Icon className="w-8 h-8" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-lg font-display font-semibold text-foreground mb-2"
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground max-w-sm mb-6"
        >
          {description}
        </motion.p>
      )}

      {children}

      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-3 mt-2"
        >
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Pre-configured empty states for common use cases
export function NoSearchResults({ 
  query, 
  onClear 
}: { 
  query?: string; 
  onClear?: () => void;
}) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description={query 
        ? `We couldn't find anything matching "${query}". Try adjusting your search or filters.`
        : "No items match your current filters."
      }
      action={onClear ? { label: 'Clear filters', onClick: onClear } : undefined}
    />
  );
}

export function NoData({ 
  title = 'No data available',
  description = 'There is no data to display at the moment.',
  action,
}: { 
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <EmptyState
      variant="data"
      title={title}
      description={description}
      action={action}
    />
  );
}

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

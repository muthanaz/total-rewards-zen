/**
 * Policy Lifecycle Badge
 * 
 * Visual indicator for policy status with lifecycle flow.
 */

import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  FileEdit, 
  Eye, 
  CheckCircle, 
  Globe, 
  Archive,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type PolicyLifecycleStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

interface PolicyLifecycleBadgeProps {
  status: PolicyLifecycleStatus;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig: Record<PolicyLifecycleStatus, {
  icon: typeof FileEdit;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = {
  draft: {
    icon: FileEdit,
    label: 'Draft',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-muted',
    description: 'Policy is being drafted and not visible to employees',
  },
  in_review: {
    icon: Eye,
    label: 'In Review',
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
    description: 'Policy is under review by approvers',
  },
  approved: {
    icon: CheckCircle,
    label: 'Approved',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    description: 'Policy is approved and ready to publish',
  },
  published: {
    icon: Globe,
    label: 'Published',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    description: 'Policy is live and visible to employees',
  },
  archived: {
    icon: Archive,
    label: 'Archived',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-muted',
    description: 'Previous version, no longer active',
  },
};

export function PolicyLifecycleBadge({ 
  status, 
  showTooltip = true,
  size = 'sm',
}: PolicyLifecycleBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const badge = (
    <Badge 
      variant="outline"
      className={cn(
        "gap-1",
        config.bgColor,
        config.color,
        config.borderColor,
        size === 'sm' && "text-xs px-2 py-0.5",
        size === 'md' && "text-sm px-3 py-1"
      )}
    >
      <Icon className={cn(
        size === 'sm' && "w-3 h-3",
        size === 'md' && "w-4 h-4"
      )} />
      {config.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Policy Lifecycle Flow
 * 
 * Shows the full lifecycle with current position highlighted.
 */
interface PolicyLifecycleFlowProps {
  currentStatus: PolicyLifecycleStatus;
}

export function PolicyLifecycleFlow({ currentStatus }: PolicyLifecycleFlowProps) {
  const steps: PolicyLifecycleStatus[] = ['draft', 'in_review', 'approved', 'published'];
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => {
        const config = statusConfig[step];
        const Icon = config.icon;
        const isActive = index <= currentIndex;
        const isCurrent = step === currentStatus;

        return (
          <div key={step} className="flex items-center">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
              isCurrent && config.bgColor,
              isCurrent && config.color,
              !isCurrent && isActive && "text-muted-foreground",
              !isActive && "text-muted-foreground/50"
            )}>
              <Icon className="w-3 h-3" />
              <span className={cn(
                "hidden sm:inline",
                isCurrent && "font-medium"
              )}>
                {config.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className={cn(
                "w-3 h-3 mx-1",
                index < currentIndex ? "text-muted-foreground" : "text-muted-foreground/30"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

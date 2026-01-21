/**
 * Shared Admin Badge Components
 * Uses standardized enums and configurations from constants
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  RUN_STATUS_CONFIG, 
  SEVERITY_CONFIG, 
  ALERT_STATUS_CONFIG,
  LIFECYCLE_CONFIG,
  ORG_STATUS_CONFIG,
  INVOICE_STATUS_CONFIG,
  POLICY_STATUS_CONFIG,
  RunStatus, 
  Severity, 
  AlertStatus,
  LifecycleStage,
  OrgStatus,
  InvoiceStatus,
  PolicyStatus,
} from '@/lib/admin/constants';
import { formatTimeWithTooltip } from '@/lib/admin/formatting';

interface BadgeProps {
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  language?: 'en' | 'ar';
}

/**
 * Run Status Badge - for sync runs
 */
export function RunStatusBadge({ 
  status, 
  className, 
  showIcon = true,
  size = 'md',
  language = 'en' 
}: { status: RunStatus } & BadgeProps) {
  const config = RUN_STATUS_CONFIG[status];
  const Icon = config.icon;
  const label = language === 'ar' ? config.labelAr : config.label;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.color, 
        size === 'sm' && 'text-xs px-1.5 py-0',
        className
      )}
    >
      {showIcon && <Icon className={cn("w-3 h-3", size === 'md' && "me-1", status === 'running' && "animate-spin")} />}
      {label}
    </Badge>
  );
}

/**
 * Severity Badge - for alerts and violations
 */
export function SeverityBadge({ 
  severity, 
  className, 
  showIcon = true,
  size = 'md',
  language = 'en' 
}: { severity: Severity } & BadgeProps) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;
  const label = language === 'ar' ? config.labelAr : config.label;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        `bg-${severity === 'critical' ? 'destructive' : severity === 'high' ? 'warning' : severity === 'medium' ? 'primary' : 'muted'}/10`,
        config.textColor,
        size === 'sm' && 'text-xs px-1.5 py-0',
        className
      )}
    >
      {showIcon && <Icon className={cn("w-3 h-3", size === 'md' && "me-1")} />}
      {label}
    </Badge>
  );
}

/**
 * Alert Status Badge
 */
export function AlertStatusBadge({ 
  status, 
  className, 
  size = 'md',
  language = 'en' 
}: { status: AlertStatus } & BadgeProps) {
  const config = ALERT_STATUS_CONFIG[status];
  const label = language === 'ar' ? config.labelAr : config.label;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.color, 
        size === 'sm' && 'text-xs px-1.5 py-0',
        className
      )}
    >
      {label}
    </Badge>
  );
}

/**
 * Lifecycle Stage Badge - for user lifecycle
 */
export function LifecycleBadge({ 
  stage, 
  className, 
  size = 'md',
  language = 'en' 
}: { stage: LifecycleStage } & BadgeProps) {
  const config = LIFECYCLE_CONFIG[stage];
  const label = language === 'ar' ? config.labelAr : config.label;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.color, 
        size === 'sm' && 'text-xs px-1.5 py-0',
        className
      )}
    >
      {label}
    </Badge>
  );
}

/**
 * Organization Status Badge
 */
export function OrgStatusBadge({ 
  status, 
  className, 
  size = 'md',
  language = 'en' 
}: { status: OrgStatus } & BadgeProps) {
  const config = ORG_STATUS_CONFIG[status];
  const label = language === 'ar' ? config.labelAr : config.label;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.color, 
        size === 'sm' && 'text-xs px-1.5 py-0',
        className
      )}
    >
      {label}
    </Badge>
  );
}

/**
 * Invoice Status Badge
 */
export function InvoiceStatusBadge({ 
  status, 
  className, 
  showIcon = true,
  size = 'md',
  language = 'en' 
}: { status: InvoiceStatus } & BadgeProps) {
  const config = INVOICE_STATUS_CONFIG[status];
  const Icon = config.icon;
  const label = language === 'ar' ? config.labelAr : config.label;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.color, 
        size === 'sm' && 'text-xs px-1.5 py-0',
        className
      )}
    >
      {showIcon && <Icon className={cn("w-3 h-3", size === 'md' && "me-1")} />}
      {label}
    </Badge>
  );
}

/**
 * Policy Status Badge
 */
export function PolicyStatusBadge({ 
  status, 
  className, 
  showIcon = true,
  size = 'md',
  language = 'en' 
}: { status: PolicyStatus } & BadgeProps) {
  const config = POLICY_STATUS_CONFIG[status];
  const Icon = config.icon;
  const label = language === 'ar' ? config.labelAr : config.label;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.color, 
        size === 'sm' && 'text-xs px-1.5 py-0',
        className
      )}
    >
      {showIcon && <Icon className={cn("w-3 h-3", size === 'md' && "me-1")} />}
      {label}
    </Badge>
  );
}

/**
 * Time Badge with Tooltip - shows relative time with absolute time in tooltip
 */
export function TimeBadge({ 
  date, 
  className,
  language = 'en'
}: { date: Date | string | null | undefined } & Pick<BadgeProps, 'className' | 'language'>) {
  const { display, absolute } = formatTimeWithTooltip(date, language);
  
  if (!date) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("text-sm cursor-help", className)}>
            {display}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{absolute}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

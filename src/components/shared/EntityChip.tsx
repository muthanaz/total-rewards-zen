/**
 * EntityChip - Unified cross-portal entity links
 * 
 * Provides consistent clickable chips for navigating to entity details
 * across Employee, Employer, Admin, and Vendor portals.
 */

import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, FileText, Receipt, Shield, Tag, Lightbulb, Building2, 
  ExternalLink, ChevronRight, Calendar, Clock, Hash, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getStatusBadgeStyle, 
  getStatusDisplayLabel, 
  formatRelativeTime,
  calculateUtilization,
  getUtilizationStyle
} from '@/lib/crossPortalContract';
import { formatPercent } from '@/lib/utils';
import { Currency } from '@/components/ui/Currency';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type EntityType = 
  | 'employee' 
  | 'benefit' 
  | 'policy' 
  | 'request' 
  | 'segment' 
  | 'recommendation'
  | 'organization';

interface BaseEntityProps {
  id: string;
  className?: string;
  variant?: 'chip' | 'link' | 'inline' | 'card';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

// ============================================================================
// ENTITY ICONS & COLORS
// ============================================================================

const entityConfig: Record<EntityType, { 
  icon: typeof User; 
  color: string; 
  label: string;
  bgColor: string;
}> = {
  employee: { 
    icon: User, 
    color: 'text-blue-600 dark:text-blue-400', 
    bgColor: 'bg-blue-500/10',
    label: 'Employee' 
  },
  benefit: { 
    icon: Tag, 
    color: 'text-emerald-600 dark:text-emerald-400', 
    bgColor: 'bg-emerald-500/10',
    label: 'Benefit' 
  },
  policy: { 
    icon: FileText, 
    color: 'text-violet-600 dark:text-violet-400', 
    bgColor: 'bg-violet-500/10',
    label: 'Policy' 
  },
  request: { 
    icon: Receipt, 
    color: 'text-amber-600 dark:text-amber-400', 
    bgColor: 'bg-amber-500/10',
    label: 'Request' 
  },
  segment: { 
    icon: Shield, 
    color: 'text-cyan-600 dark:text-cyan-400', 
    bgColor: 'bg-cyan-500/10',
    label: 'Segment' 
  },
  recommendation: { 
    icon: Lightbulb, 
    color: 'text-fuchsia-600 dark:text-fuchsia-400', 
    bgColor: 'bg-fuchsia-500/10',
    label: 'Recommendation' 
  },
  organization: { 
    icon: Building2, 
    color: 'text-slate-600 dark:text-slate-400', 
    bgColor: 'bg-slate-500/10',
    label: 'Organization' 
  },
};

// ============================================================================
// EMPLOYEE CHIP
// ============================================================================

export interface EmployeeChipProps extends BaseEntityProps {
  name: string;
  email?: string;
  department?: string;
  avatarUrl?: string;
  grade?: string;
  privacySafe?: boolean; // Shows limited info in employer context
}

export function EmployeeChip({
  id,
  name,
  email,
  department,
  avatarUrl,
  grade,
  privacySafe = true,
  className,
  variant = 'chip',
  size = 'md',
  showIcon = true,
  onClick,
  disabled,
}: EmployeeChipProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const config = entityConfig.employee;
  const Icon = config.icon;
  
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setSheetOpen(true);
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const content = (
    <span className={cn(
      "inline-flex items-center rounded-md font-medium transition-all cursor-pointer",
      "border border-transparent hover:border-border/50",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
      config.bgColor,
      config.color,
      sizeClasses[size],
      disabled && "opacity-50 cursor-not-allowed",
      // RTL support
      "rtl:flex-row-reverse",
      className
    )}>
      {showIcon && (
        <Avatar className={cn(
          size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'
        )}>
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="text-[10px] bg-blue-500/20">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      <span className="truncate max-w-[120px]">{name}</span>
      {variant === 'chip' && (
        <ChevronRight className="w-3 h-3 opacity-50 rtl:rotate-180" aria-hidden="true" />
      )}
    </span>
  );

  if (variant === 'link') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleClick} 
              disabled={disabled} 
              className="focus-visible:outline-none rounded-md"
              aria-label={`View ${name}'s profile`}
            >
              {content}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{name}</p>
            {department && <p className="text-xs text-muted-foreground">{department}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <button 
        onClick={handleClick} 
        disabled={disabled} 
        className="focus-visible:outline-none rounded-md"
        aria-label={`View ${name}'s profile`}
      >
        {content}
      </button>
      
      {/* Employee Summary Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:max-w-[450px]">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-lg bg-blue-500/20 text-blue-600">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle>{name}</SheetTitle>
                <SheetDescription>{department || 'Employee'}</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {!privacySafe && email && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{email}</span>
              </div>
            )}
            {department && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Department</span>
                <span className="text-sm font-medium">{department}</span>
              </div>
            )}
            {grade && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Grade</span>
                <Badge variant="outline">{grade}</Badge>
              </div>
            )}
            
            <div className="pt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                View Requests
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                View Entitlements
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

// ============================================================================
// BENEFIT CHIP
// ============================================================================

export interface BenefitChipProps extends BaseEntityProps {
  name: string;
  category?: string;
  lifeArea?: string;
  icon?: string;
}

export function BenefitChip({
  id,
  name,
  category,
  lifeArea,
  className,
  variant = 'chip',
  size = 'md',
  showIcon = true,
  onClick,
  disabled,
}: BenefitChipProps) {
  const config = entityConfig.benefit;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "inline-flex items-center rounded-md font-medium transition-all cursor-pointer focus:outline-none",
              "border border-transparent hover:border-border/50",
              config.bgColor,
              config.color,
              sizeClasses[size],
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
            <span className="truncate max-w-[140px]">{name}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{name}</p>
          {category && <p className="text-xs text-muted-foreground">{category}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// REQUEST/CLAIM CHIP
// ============================================================================

export interface RequestChipProps extends BaseEntityProps {
  subject?: string;
  status?: string;
  type?: 'claim' | 'request' | 'question';
  amount?: number;
  createdAt?: string;
  onViewDetails?: () => void;
}

export function RequestChip({
  id,
  subject,
  status,
  type = 'request',
  amount,
  createdAt,
  className,
  variant = 'chip',
  size = 'md',
  showIcon = true,
  onClick,
  onViewDetails,
  disabled,
}: RequestChipProps) {
  const config = entityConfig.request;
  const Icon = config.icon;
  const statusStyle = getStatusBadgeStyle(status || null);
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const displayId = id.slice(0, 8).toUpperCase();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick || onViewDetails}
            disabled={disabled}
            className={cn(
              "inline-flex items-center rounded-md font-medium transition-all cursor-pointer focus:outline-none",
              "border border-transparent hover:border-border/50",
              statusStyle.className,
              sizeClasses[size],
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
            <span className="font-mono">#{displayId}</span>
            {variant !== 'inline' && (
              <Badge variant="outline" className={cn("text-[10px] px-1 py-0", statusStyle.className)}>
                {getStatusDisplayLabel(status || null)}
              </Badge>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px]">
          <div className="space-y-1">
            <p className="font-medium">{subject || `Request #${displayId}`}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className={cn("text-[10px]", statusStyle.className)}>
                {getStatusDisplayLabel(status || null)}
              </Badge>
              {amount ? <Currency amount={amount} /> : null}
            </div>
            {createdAt && (
              <p className="text-xs text-muted-foreground">
                Submitted {formatRelativeTime(createdAt)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// POLICY VERSION CHIP
// ============================================================================

export interface PolicyChipProps extends BaseEntityProps {
  benefitName?: string;
  version?: number;
  effectiveFrom?: string;
  isActive?: boolean;
  onViewPolicy?: () => void;
}

export function PolicyChip({
  id,
  benefitName,
  version,
  effectiveFrom,
  isActive = true,
  className,
  variant = 'chip',
  size = 'md',
  showIcon = true,
  onClick,
  onViewPolicy,
  disabled,
}: PolicyChipProps) {
  const config = entityConfig.policy;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick || onViewPolicy}
            disabled={disabled}
            className={cn(
              "inline-flex items-center rounded-md font-medium transition-all cursor-pointer focus:outline-none",
              "border border-transparent hover:border-border/50",
              config.bgColor,
              config.color,
              sizeClasses[size],
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
            <span>v{version || 1}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{benefitName} Policy</p>
            <p className="text-xs text-muted-foreground">
              Version {version} • {isActive ? 'Currently Active' : 'Archived'}
            </p>
            {effectiveFrom && (
              <p className="text-xs text-muted-foreground">
                Effective from {new Date(effectiveFrom).toLocaleDateString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// SEGMENT CHIP
// ============================================================================

export interface SegmentChipProps extends BaseEntityProps {
  name: string;
  employeeCount?: number;
  criteria?: string;
}

export function SegmentChip({
  id,
  name,
  employeeCount,
  criteria,
  className,
  variant = 'chip',
  size = 'md',
  showIcon = true,
  onClick,
  disabled,
}: SegmentChipProps) {
  const config = entityConfig.segment;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "inline-flex items-center rounded-md font-medium transition-all cursor-pointer focus:outline-none",
              "border border-transparent hover:border-border/50",
              config.bgColor,
              config.color,
              sizeClasses[size],
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
            <span className="truncate max-w-[100px]">{name}</span>
            {employeeCount !== undefined && (
              <span className="text-xs opacity-70">({employeeCount})</span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{name}</p>
            {employeeCount !== undefined && (
              <p className="text-xs text-muted-foreground">{employeeCount} employees</p>
            )}
            {criteria && (
              <p className="text-xs text-muted-foreground">{criteria}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// RECOMMENDATION CHIP
// ============================================================================

export interface RecommendationChipProps extends BaseEntityProps {
  title: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  priority?: 'low' | 'medium' | 'high';
  expectedImpact?: string;
}

export function RecommendationChip({
  id,
  title,
  status = 'pending',
  priority = 'medium',
  expectedImpact,
  className,
  variant = 'chip',
  size = 'md',
  showIcon = true,
  onClick,
  disabled,
}: RecommendationChipProps) {
  const config = entityConfig.recommendation;
  const Icon = config.icon;
  
  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    dismissed: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  };
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "inline-flex items-center rounded-md font-medium transition-all cursor-pointer focus:outline-none",
              "border border-transparent hover:border-border/50",
              statusColors[status],
              sizeClasses[size],
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
            <span className="truncate max-w-[140px]">{title}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{title}</p>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className={statusColors[status]}>
                {status.replace('_', ' ')}
              </Badge>
              {priority !== 'medium' && (
                <Badge variant="outline">{priority} priority</Badge>
              )}
            </div>
            {expectedImpact && (
              <p className="text-xs text-muted-foreground">{expectedImpact}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// GENERIC ENTITY LINK
// ============================================================================

export interface EntityLinkProps {
  type: EntityType;
  id: string;
  label: string;
  sublabel?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function EntityLink({
  type,
  id,
  label,
  sublabel,
  href,
  onClick,
  className,
}: EntityLinkProps) {
  const config = entityConfig[type];
  const Icon = config.icon;
  
  const content = (
    <span className={cn(
      "inline-flex items-center gap-2 text-sm font-medium transition-colors",
      "hover:text-foreground text-muted-foreground cursor-pointer",
      className
    )}>
      <span className={cn("p-1 rounded", config.bgColor)}>
        <Icon className={cn("w-3.5 h-3.5", config.color)} />
      </span>
      <span>{label}</span>
      {sublabel && (
        <span className="text-xs text-muted-foreground">({sublabel})</span>
      )}
      <ArrowRight className="w-3 h-3 opacity-50" />
    </span>
  );
  
  if (href) {
    return <Link to={href} onClick={onClick}>{content}</Link>;
  }
  
  return <button onClick={onClick} className="focus:outline-none">{content}</button>;
}

// ============================================================================
// DEEP LINK HELPERS
// ============================================================================

export function getEntityPath(type: EntityType, id: string, portal: 'employee' | 'employer' | 'admin'): string {
  const basePaths: Record<typeof portal, Record<EntityType, string>> = {
    employee: {
      employee: '/employee/profile',
      benefit: `/employee/benefits`,
      policy: `/employee/benefits`,
      request: `/employee/requests`,
      segment: `/employee`,
      recommendation: `/employee/benefits-analysis`,
      organization: `/employee`,
    },
    employer: {
      employee: `/employer/claims?employee=${id}`,
      benefit: `/employer/policies?benefit=${id}`,
      policy: `/employer/policies?version=${id}`,
      request: `/employer/claims?request=${id}`,
      segment: `/employer/segments?id=${id}`,
      recommendation: `/employer/recommendations?id=${id}`,
      organization: `/employer`,
    },
    admin: {
      employee: `/admin/organizations?employee=${id}`,
      benefit: `/admin/benchmarks?benefit=${id}`,
      policy: `/admin/organizations`,
      request: `/admin/organizations`,
      segment: `/admin/organizations`,
      recommendation: `/admin/benchmarks`,
      organization: `/admin/organizations?id=${id}`,
    },
  };
  
  return basePaths[portal][type];
}

/**
 * WaitingOnBadge Component
 * 
 * Displays who a request is currently waiting on (Employee, HR, or System).
 * Uses consistent styling across all portals.
 */

import { Badge } from '@/components/ui/badge';
import { Clock, User, Users, Cog, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  getWaitingOnActor, 
  isSlaPaused,
  type RequestStatus 
} from '@/lib/crossPortalContract';

export interface WaitingOnBadgeProps {
  status: RequestStatus | string | null;
  variant?: 'default' | 'compact';
  showIcon?: boolean;
  /** Perspective: employee sees "You", HR sees "Employee" */
  perspective?: 'employee' | 'hr';
  className?: string;
}

const ACTOR_CONFIG = {
  employee: {
    icon: User,
    labelEmployee: 'Waiting on: You',
    labelEmployeeAr: 'في انتظار: أنت',
    labelHR: 'Waiting on: Employee',
    labelHRAr: 'في انتظار: الموظف',
    colorClass: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
  hr: {
    icon: Users,
    labelEmployee: 'Waiting on: HR',
    labelEmployeeAr: 'في انتظار: الموارد البشرية',
    labelHR: 'Waiting on: HR Team',
    labelHRAr: 'في انتظار: فريق الموارد البشرية',
    colorClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  system: {
    icon: Cog,
    labelEmployee: 'Processing',
    labelEmployeeAr: 'قيد المعالجة',
    labelHR: 'System Processing',
    labelHRAr: 'معالجة النظام',
    colorClass: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  },
  none: {
    icon: Clock,
    labelEmployee: '',
    labelEmployeeAr: '',
    labelHR: '',
    labelHRAr: '',
    colorClass: '',
  },
};

export function WaitingOnBadge({ 
  status, 
  variant = 'default',
  showIcon = true,
  perspective = 'employee',
  className,
}: WaitingOnBadgeProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const actor = getWaitingOnActor(status);
  
  if (actor === 'none') return null;
  
  const config = ACTOR_CONFIG[actor];
  const Icon = config.icon;
  
  let label: string;
  if (perspective === 'employee') {
    label = isRTL ? config.labelEmployeeAr : config.labelEmployee;
  } else {
    label = isRTL ? config.labelHRAr : config.labelHR;
  }
  
  if (!label) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'gap-1 font-medium',
        config.colorClass,
        variant === 'compact' && 'text-[10px] px-1.5 py-0',
        className
      )}
    >
      {showIcon && <Icon className={cn('shrink-0', variant === 'compact' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />}
      {label}
    </Badge>
  );
}

export interface SLAPausedBadgeProps {
  status: RequestStatus | string | null;
  className?: string;
}

/**
 * Compact badge showing SLA is paused
 */
export function SLAPausedBadge({ status, className }: SLAPausedBadgeProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isPaused = isSlaPaused(status);
  
  if (!isPaused) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'gap-1 text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-600 border-purple-500/20',
        className
      )}
    >
      <Pause className="w-3 h-3" />
      {isRTL ? 'SLA متوقف' : 'SLA Paused'}
    </Badge>
  );
}

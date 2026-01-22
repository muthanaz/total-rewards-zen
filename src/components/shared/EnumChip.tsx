import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LIFE_AREA_METADATA,
  BENEFIT_PILLAR_METADATA,
  normalizeToLifeArea,
  getLifeAreaLabel,
  type CanonicalLifeArea,
  type BenefitPillar,
  CANONICAL_LIFE_AREAS,
} from '@/lib/taxonomy';

// Build color map from taxonomy metadata
const LIFE_AREA_COLORS: Record<string, string> = Object.fromEntries(
  CANONICAL_LIFE_AREAS.map(area => [
    area,
    `${LIFE_AREA_METADATA[area].bgLightClass} ${LIFE_AREA_METADATA[area].textClass} ${LIFE_AREA_METADATA[area].borderClass}`
  ])
);

// Benefit Type color mapping
const BENEFIT_TYPE_CHIP_COLORS: Record<string, string> = {
  cash_allowances: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  health_protection: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
  time_off_flex: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  growth_career: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400',
  wealth_ownership: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  wellbeing: 'bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-400',
};

interface LifeAreaChipProps {
  value: string;
  showIcon?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'default';
  className?: string;
}

/**
 * Displays a Life Area enum value with human-readable label and optional tooltip
 */
export function LifeAreaChip({ 
  value, 
  showIcon = false, 
  showTooltip = true,
  size = 'default',
  className 
}: LifeAreaChipProps) {
  const label = LIFE_AREA_LABELS[value] || formatEnumLabel(value);
  const Icon = LIFE_AREA_ICONS[value] || Sparkles;
  const colorClass = LIFE_AREA_COLORS[value] || 'bg-muted text-muted-foreground';

  const chip = (
    <Badge 
      variant="outline" 
      className={cn(
        colorClass,
        size === 'sm' && 'text-[11px] px-1.5 py-0',
        'font-medium',
        className
      )}
    >
      {showIcon && <Icon className={cn('mr-1', size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />}
      {label}
      {showTooltip && <Info className="w-3 h-3 ml-1 opacity-50" />}
    </Badge>
  );

  if (!showTooltip) return chip;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {chip}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-2">
          <p className="font-medium text-sm">Life Area Taxonomy</p>
          <p className="text-xs text-muted-foreground">
            Benefits are categorized by life areas to help employees find relevant support:
          </p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Object.entries(LIFE_AREA_LABELS).map(([key, lbl]) => {
              const AreaIcon = LIFE_AREA_ICONS[key] || Sparkles;
              return (
                <div 
                  key={key} 
                  className={cn(
                    'flex items-center gap-1 px-1.5 py-0.5 rounded',
                    key === value && 'bg-accent/20 font-medium'
                  )}
                >
                  <AreaIcon className="w-3 h-3" />
                  <span>{lbl}</span>
                </div>
              );
            })}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

interface BenefitTypeChipProps {
  value: string;
  showTooltip?: boolean;
  size?: 'sm' | 'default';
  className?: string;
}

/**
 * Displays a Benefit Type enum value with human-readable label
 */
export function BenefitTypeChip({ 
  value, 
  showTooltip = false,
  size = 'default',
  className 
}: BenefitTypeChipProps) {
  const label = BENEFIT_TYPE_LABELS[value] || formatEnumLabel(value);
  const colorClass = BENEFIT_TYPE_CHIP_COLORS[value] || 'bg-muted text-muted-foreground';

  const chip = (
    <Badge 
      variant="outline" 
      className={cn(
        colorClass,
        size === 'sm' && 'text-[11px] px-1.5 py-0',
        'font-medium',
        className
      )}
    >
      {label}
    </Badge>
  );

  if (!showTooltip) return chip;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {chip}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">
          Benefit classification by compensation structure
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Utility function to format any enum key to human-readable label
 * Fallback when no mapping exists
 */
export function formatEnumLabel(value: string): string {
  if (!value) return '—';
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get the human-readable label for a life_area enum
 */
export function getLifeAreaLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return LIFE_AREA_LABELS[value] || formatEnumLabel(value);
}

/**
 * Get the human-readable label for a benefit_type enum
 */
export function getBenefitTypeLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return BENEFIT_TYPE_LABELS[value] || formatEnumLabel(value);
}

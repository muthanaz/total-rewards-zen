import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LIFE_AREA_METADATA,
  BENEFIT_PILLAR_METADATA,
  normalizeToLifeArea,
  getLifeAreaLabel as taxonomyGetLifeAreaLabel,
  getBenefitPillarLabel,
  type CanonicalLifeArea,
  type BenefitPillar,
  CANONICAL_LIFE_AREAS,
  BENEFIT_PILLARS,
} from '@/lib/taxonomy';

// Build color map from taxonomy metadata
const LIFE_AREA_COLORS: Record<string, string> = Object.fromEntries(
  CANONICAL_LIFE_AREAS.map(area => [
    area,
    `${LIFE_AREA_METADATA[area].bgLightClass} ${LIFE_AREA_METADATA[area].textClass} ${LIFE_AREA_METADATA[area].borderClass}`
  ])
);

// Build icon map from taxonomy metadata
const LIFE_AREA_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  CANONICAL_LIFE_AREAS.map(area => [area, LIFE_AREA_METADATA[area].icon])
);

// Benefit Type color mapping from taxonomy
const BENEFIT_TYPE_CHIP_COLORS: Record<string, string> = Object.fromEntries(
  BENEFIT_PILLARS.map(pillar => [pillar, BENEFIT_PILLAR_METADATA[pillar].color])
);

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
  const normalizedArea = normalizeToLifeArea(value);
  const metadata = LIFE_AREA_METADATA[normalizedArea];
  const label = metadata.label;
  const Icon = metadata.icon;
  const colorClass = LIFE_AREA_COLORS[normalizedArea] || 'bg-muted text-muted-foreground';

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
            {CANONICAL_LIFE_AREAS.filter(area => area !== 'other').map((areaKey) => {
              const areaMeta = LIFE_AREA_METADATA[areaKey];
              const AreaIcon = areaMeta.icon;
              return (
                <div 
                  key={areaKey} 
                  className={cn(
                    'flex items-center gap-1 px-1.5 py-0.5 rounded',
                    areaKey === normalizedArea && 'bg-accent/20 font-medium'
                  )}
                >
                  <AreaIcon className="w-3 h-3" />
                  <span>{areaMeta.label}</span>
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
  const pillarMeta = BENEFIT_PILLAR_METADATA[value as BenefitPillar];
  const label = pillarMeta?.label || formatEnumLabel(value);
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
 * @deprecated Use getLifeAreaLabel from taxonomy.ts
 */
export function getLifeAreaLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return taxonomyGetLifeAreaLabel(value);
}

/**
 * Get the human-readable label for a benefit_type enum
 */
export function getBenefitTypeLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return getBenefitPillarLabel(value);
}

/**
 * Benefit Value Type Chip
 * 
 * Displays a benefit's value type as a styled chip with tooltip.
 * Used across benefit cards and detail pages for consistent classification display.
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BenefitValueType } from '@/lib/taxonomy';
import { VALUE_TYPE_METADATA } from '@/lib/benefitValueTypes';

interface BenefitValueTypeChipProps {
  valueType: BenefitValueType;
  showIcon?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'default';
  className?: string;
}

/**
 * Displays a Benefit Value Type as a styled chip with optional tooltip
 * explaining what this classification means for the employee.
 */
export function BenefitValueTypeChip({ 
  valueType, 
  showIcon = true, 
  showTooltip = true,
  size = 'default',
  className 
}: BenefitValueTypeChipProps) {
  const metadata = VALUE_TYPE_METADATA[valueType];
  
  if (!metadata) {
    return null;
  }
  
  const Icon = metadata.icon;

  const chip = (
    <Badge 
      variant="outline" 
      className={cn(
        metadata.colorClass,
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        size === 'default' && 'text-[11px] px-2 py-0.5',
        'font-medium border',
        className
      )}
    >
      {showIcon && <Icon className={cn('mr-1', size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />}
      {metadata.label}
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
          <p className="font-medium text-sm">{metadata.label}</p>
          <p className="text-xs text-muted-foreground">
            {metadata.description}
          </p>
          <div className="text-[10px] border-t pt-2 mt-2 space-y-1 text-muted-foreground">
            <p className="font-medium">What this means for you:</p>
            {metadata.showMonetaryRemaining ? (
              <p>• You can track remaining balance in AED</p>
            ) : (
              <p>• This is not cash value - it's employer investment on your behalf</p>
            )}
            {metadata.showUtilizationPercent ? (
              <p>• Utilization percentage is tracked</p>
            ) : (
              <p>• Focus on using services, not tracking AED amounts</p>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export default BenefitValueTypeChip;

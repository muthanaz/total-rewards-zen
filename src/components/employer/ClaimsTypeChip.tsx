/**
 * Claims Type Chip
 * 
 * Displays whether an item is a Request (pre-approval) or Claim (reimbursement).
 * Uses semantic tokens and consistent styling.
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClaimsTypeChipProps {
  /** The transaction/request type from DB */
  requestType: string;
  /** Optional: policy-defined transaction model */
  transactionModel?: 'request_only' | 'claim_only' | 'request_and_claim' | null;
  /** Size variant */
  size?: 'sm' | 'default';
  /** Show tooltip with explanation */
  showTooltip?: boolean;
}

type DisplayType = 'request' | 'claim' | 'settlement';

const TYPE_CONFIG: Record<DisplayType, {
  label: string;
  description: string;
  icon: React.ReactNode;
  className: string;
}> = {
  request: {
    label: 'Request',
    description: 'Pre-approval required before spending',
    icon: <FileText className="w-3 h-3" />,
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  claim: {
    label: 'Claim',
    description: 'Reimbursement after spending',
    icon: <Receipt className="w-3 h-3" />,
    className: 'bg-accent/10 text-accent-foreground border-accent/20',
  },
  settlement: {
    label: 'Settlement',
    description: 'Post-trip reconciliation',
    icon: <Receipt className="w-3 h-3" />,
    className: 'bg-muted text-muted-foreground border-muted',
  },
};

function determineDisplayType(
  requestType: string,
  transactionModel?: string | null
): DisplayType {
  // Direct mapping from request_type enum
  const type = requestType.toLowerCase();
  
  if (type === 'request' || type === 'pre_approval') {
    return 'request';
  }
  
  if (type === 'settlement') {
    return 'settlement';
  }
  
  // Default to claim for 'claim', 'reimbursement', etc.
  return 'claim';
}

export function ClaimsTypeChip({
  requestType,
  transactionModel,
  size = 'default',
  showTooltip = true,
}: ClaimsTypeChipProps) {
  const displayType = determineDisplayType(requestType, transactionModel);
  const config = TYPE_CONFIG[displayType];
  
  const chip = (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium',
        config.className,
        size === 'sm' && 'text-[10px] px-1.5 py-0'
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
  
  if (!showTooltip) {
    return chip;
  }
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {chip}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <p className="text-xs font-medium">{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

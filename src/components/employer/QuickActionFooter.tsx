/**
 * QuickActionFooter - Fixed action buttons for claim review drawer
 * 
 * Large, prominent Approve/Reject buttons fixed at the bottom
 * for quick decision-making without scrolling.
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, XCircle, Send, AlertCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PermissionGate } from '@/components/shared/PermissionGate';

interface QuickActionFooterProps {
  /** Whether the claim can be processed (status allows it) */
  canProcess: boolean;
  /** Whether there are blockers preventing approval */
  hasBlockers: boolean;
  /** Message for why approval is blocked */
  blockerMessage?: string;
  /** Whether an action is currently being processed */
  isProcessing: boolean;
  /** Callback for approve action */
  onApprove: () => void;
  /** Callback for reject action (opens decision tab) */
  onReject: () => void;
  /** Callback for request info action */
  onRequestInfo: () => void;
  /** Optional claim amount to display */
  claimAmount?: number | null;
  /** Optional currency */
  currency?: string;
  className?: string;
}

export function QuickActionFooter({
  canProcess,
  hasBlockers,
  blockerMessage,
  isProcessing,
  onApprove,
  onReject,
  onRequestInfo,
  claimAmount,
  currency = 'AED',
  className,
}: QuickActionFooterProps) {
  if (!canProcess) {
    return (
      <div className={cn(
        'fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border shadow-lg z-50',
        'md:absolute md:left-auto md:right-0 md:w-[540px]',
        className
      )}>
        <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
          <CheckCircle className="w-5 h-5 text-success" />
          <span className="text-sm">This request has already been processed</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn(
        'fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border shadow-lg z-50',
        'md:absolute md:left-auto md:right-0 md:w-[540px]',
        className
      )}>
        {/* Amount Summary Bar */}
        {claimAmount !== null && claimAmount !== undefined && claimAmount > 0 && (
          <>
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
              <span className="text-sm text-muted-foreground">Claim Amount</span>
              <span className="text-lg font-bold font-mono">
                {currency} {claimAmount.toLocaleString()}
              </span>
            </div>
            <Separator />
          </>
        )}

        {/* Blocker Warning */}
        {hasBlockers && blockerMessage && (
          <>
            <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm">{blockerMessage}</span>
            </div>
            <Separator />
          </>
        )}

        {/* Action Buttons */}
        <PermissionGate 
          permission="can_process_claims"
          fallback={
            <div className="flex items-center justify-center gap-2 p-4 text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span className="text-sm">You don't have permission to process claims</span>
            </div>
          }
        >
          <div className="flex items-center gap-3 p-4">
            {/* Request Info - Secondary */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onRequestInfo}
                  disabled={isProcessing}
                  className="gap-2 flex-1 h-12"
                >
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Request Info</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Request additional documents or information</TooltipContent>
            </Tooltip>

            {/* Reject - Prominent Red */}
            <Button
              variant="destructive"
              size="lg"
              onClick={onReject}
              disabled={isProcessing}
              className="gap-2 flex-1 h-12 text-base font-semibold"
            >
              <XCircle className="w-5 h-5" />
              Reject
            </Button>

            {/* Approve - Prominent Green */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  onClick={onApprove}
                  disabled={isProcessing || hasBlockers}
                  className={cn(
                    'gap-2 flex-[2] h-12 text-base font-semibold',
                    !hasBlockers && 'bg-success hover:bg-success/90 text-success-foreground'
                  )}
                >
                  <CheckCircle className="w-5 h-5" />
                  {hasBlockers ? 'Cannot Approve' : 'Approve'}
                </Button>
              </TooltipTrigger>
              {hasBlockers && (
                <TooltipContent className="max-w-xs">
                  <span className="text-destructive">{blockerMessage || 'Policy checks failed'}</span>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </PermissionGate>
      </div>
    </TooltipProvider>
  );
}

export default QuickActionFooter;

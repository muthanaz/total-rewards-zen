/**
 * React Hook for Claim State Machine
 * 
 * Provides type-safe access to claim status transitions, validation,
 * and settlement readiness checks.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  validateClaimTransition,
  executeClaimTransition,
  computePayableAmount,
  checkSettlementReadiness,
  validateTransitionLocally,
  isValidTransition,
  getAvailableTransitions,
  formatTransitionError,
  ACTION_REASON_CODES,
  type RequestStatus,
  type TransitionValidationResult,
  type ClaimTransitionResult,
  type PayableAmountResult,
  type SettlementReadinessResult,
  type StatusTransition,
} from '@/lib/workflow/claimStateMachine';

// =============================================================================
// TYPES
// =============================================================================

export interface UseClaimTransitionOptions {
  onSuccess?: (result: ClaimTransitionResult) => void;
  onError?: (error: string) => void;
  invalidateQueries?: string[];
}

export interface TransitionRequest {
  requestId: string;
  toStatus: RequestStatus;
  actionReasonCode?: string;
  actionReasonText?: string;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useClaimStateMachine(requestId: string | null, currentStatus: RequestStatus | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get available transitions for current status
  const availableTransitions = currentStatus 
    ? getAvailableTransitions(currentStatus) 
    : [];

  // Check if a specific transition is valid
  const canTransitionTo = (toStatus: RequestStatus): boolean => {
    if (!currentStatus) return false;
    return isValidTransition(currentStatus, toStatus) !== null;
  };

  // Get transition details
  const getTransitionDetails = (toStatus: RequestStatus): StatusTransition | null => {
    if (!currentStatus) return null;
    return isValidTransition(currentStatus, toStatus);
  };

  // Validate locally before server call
  const validateLocally = (
    toStatus: RequestStatus,
    actionReasonCode?: string,
    actionReasonText?: string
  ): TransitionValidationResult => {
    if (!currentStatus) {
      return { valid: false, error: 'No current status' };
    }
    return validateTransitionLocally(currentStatus, toStatus, actionReasonCode, actionReasonText);
  };

  return {
    availableTransitions,
    canTransitionTo,
    getTransitionDetails,
    validateLocally,
    actionReasonCodes: ACTION_REASON_CODES,
  };
}

// =============================================================================
// TRANSITION MUTATION HOOK
// =============================================================================

export function useClaimTransition(options?: UseClaimTransitionOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: TransitionRequest): Promise<ClaimTransitionResult> => {
      // First validate with the database
      const validation = await validateClaimTransition(
        request.requestId,
        '', // fromStatus will be determined by DB
        request.toStatus,
        request.actionReasonCode,
        request.actionReasonText
      );

      if (!validation.valid) {
        return {
          success: false,
          requestId: request.requestId,
          fromStatus: '',
          toStatus: request.toStatus,
          transitionedAt: '',
          error: validation.error,
          blockingReasons: validation.blockingReasons,
          fix: validation.fix,
        };
      }

      // Execute the transition
      return executeClaimTransition(
        request.requestId,
        request.toStatus,
        request.actionReasonCode,
        request.actionReasonText
      );
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Status Updated',
          description: `Claim moved to ${result.toStatus}`,
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['request', result.requestId] });
        queryClient.invalidateQueries({ queryKey: ['requests'] });
        
        if (options?.invalidateQueries) {
          options.invalidateQueries.forEach(key => {
            queryClient.invalidateQueries({ queryKey: [key] });
          });
        }
        
        options?.onSuccess?.(result);
      } else {
        const errorMsg = formatTransitionError(result);
        toast({
          title: 'Transition Failed',
          description: errorMsg,
          variant: 'destructive',
        });
        options?.onError?.(errorMsg);
      }
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      options?.onError?.(errorMsg);
    },
  });
}

// =============================================================================
// PAYABLE AMOUNT HOOK
// =============================================================================

export function useComputePayableAmount() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: computePayableAmount,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['request'] });
      } else if (result.error) {
        toast({
          title: 'Calculation Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    },
  });
}

// =============================================================================
// SETTLEMENT READINESS HOOK
// =============================================================================

export function useSettlementReadiness(requestId: string | null) {
  return useQuery({
    queryKey: ['settlement-readiness', requestId],
    queryFn: () => checkSettlementReadiness(requestId!),
    enabled: !!requestId,
    staleTime: 30000, // 30 seconds
  });
}

export function useCheckSettlementReadiness() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkSettlementReadiness,
    onSuccess: (result) => {
      if (result.ready) {
        toast({
          title: 'Ready for Payment',
          description: 'All settlement checks passed',
        });
      } else {
        const failedChecks = result.checks.filter(c => !c.pass);
        toast({
          title: 'Not Ready for Payment',
          description: `${failedChecks.length} check(s) failed`,
          variant: 'destructive',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['settlement-readiness', result.requestId] });
    },
  });
}

// =============================================================================
// COMBINED WORKFLOW HOOK
// =============================================================================

/**
 * Combined hook for full claim workflow operations
 */
export function useClaimWorkflow(requestId: string | null, currentStatus: RequestStatus | null) {
  const stateMachine = useClaimStateMachine(requestId, currentStatus);
  const transition = useClaimTransition();
  const computePayable = useComputePayableAmount();
  const checkReadiness = useCheckSettlementReadiness();
  const { data: readinessData } = useSettlementReadiness(
    currentStatus === 'approved' ? requestId : null
  );

  // Helper to approve and check settlement readiness
  const approveAndCheckReadiness = async (
    actionReasonCode: string,
    actionReasonText: string
  ) => {
    if (!requestId) return;

    // First transition to approved
    const result = await transition.mutateAsync({
      requestId,
      toStatus: 'approved',
      actionReasonCode,
      actionReasonText,
    });

    if (result.success) {
      // Compute payable amount
      await computePayable.mutateAsync(requestId);
      
      // Check settlement readiness
      const readiness = await checkReadiness.mutateAsync(requestId);
      
      // If ready, auto-transition to ready_for_payment
      if (readiness.ready) {
        await transition.mutateAsync({
          requestId,
          toStatus: 'ready_for_payment',
        });
      }
    }

    return result;
  };

  return {
    ...stateMachine,
    transition,
    computePayable,
    checkReadiness,
    readinessData,
    approveAndCheckReadiness,
    isTransitioning: transition.isPending,
    isComputingPayable: computePayable.isPending,
    isCheckingReadiness: checkReadiness.isPending,
  };
}

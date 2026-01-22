/**
 * Standardized Policy Action Toasts
 * 
 * Centralized toast messages for all policy-related actions.
 * Ensures consistent UX feedback across the platform.
 */

import { toast } from 'sonner';

type PolicyAction = 
  | 'create' 
  | 'duplicate' 
  | 'save' 
  | 'submit' 
  | 'approve' 
  | 'reject' 
  | 'publish' 
  | 'archive' 
  | 'delete';

interface ToastOptions {
  policyTitle?: string;
  versionNumber?: number;
  alreadyExists?: boolean;
  requiresApproval?: boolean;
  canArchive?: boolean;
  hasPublishedVersion?: boolean;
  hasLinkedClaims?: boolean;
  error?: string;
  nextAction?: string;
}

/**
 * Show success toast for policy action
 */
export function showPolicySuccess(action: PolicyAction, options: ToastOptions = {}) {
  const { policyTitle, versionNumber, alreadyExists, nextAction } = options;
  const titleName = policyTitle ? `"${policyTitle}"` : 'Policy';

  const messages: Record<PolicyAction, { title: string; description: string }> = {
    create: {
      title: alreadyExists ? 'Policy already exists' : 'Policy created',
      description: alreadyExists 
        ? `Opening the existing draft for ${titleName}...`
        : `${titleName} created as Draft v1. ${nextAction || 'Opening editor...'}`,
    },
    duplicate: {
      title: alreadyExists ? 'Duplicate already exists' : 'Policy duplicated',
      description: alreadyExists
        ? `Opening the existing copy...`
        : `${titleName} duplicated as a new draft.`,
    },
    save: {
      title: 'Changes saved',
      description: `${titleName} has been updated.`,
    },
    submit: {
      title: 'Submitted for approval',
      description: `${titleName} v${versionNumber || 1} is pending review.`,
    },
    approve: {
      title: 'Policy approved',
      description: `${titleName} v${versionNumber || 1} is ready to publish.`,
    },
    reject: {
      title: 'Policy rejected',
      description: `${titleName} v${versionNumber || 1} has been sent back for revision.`,
    },
    publish: {
      title: 'Policy published',
      description: `${titleName} v${versionNumber || 1} is now active.`,
    },
    archive: {
      title: 'Policy archived',
      description: `${titleName} has been archived and is no longer active.`,
    },
    delete: {
      title: 'Policy deleted',
      description: `${titleName} has been permanently removed.`,
    },
  };

  const msg = messages[action];
  toast.success(msg.title, { description: msg.description });
}

/**
 * Show error toast for policy action
 */
export function showPolicyError(action: PolicyAction, options: ToastOptions = {}) {
  const { 
    policyTitle, 
    error, 
    requiresApproval, 
    canArchive, 
    hasPublishedVersion, 
    hasLinkedClaims,
    nextAction,
  } = options;

  const titleName = policyTitle ? `"${policyTitle}"` : 'Policy';

  // Handle specific blocked scenarios
  if (action === 'publish' && requiresApproval) {
    toast.error('Approval required', {
      description: `${titleName} must be approved before publishing. Submit for approval first.`,
    });
    return;
  }

  if (action === 'delete' && (hasPublishedVersion || hasLinkedClaims)) {
    const reason = hasLinkedClaims 
      ? 'has linked claims'
      : 'has published versions';
    toast.error('Cannot delete policy', {
      description: `${titleName} ${reason}. ${canArchive ? 'Use Archive instead.' : ''}`,
    });
    return;
  }

  // Generic error messages
  const errorMessages: Record<PolicyAction, string> = {
    create: 'Failed to create policy',
    duplicate: 'Failed to duplicate policy',
    save: 'Failed to save changes',
    submit: 'Failed to submit for approval',
    approve: 'Failed to approve policy',
    reject: 'Failed to reject policy',
    publish: 'Failed to publish policy',
    archive: 'Failed to archive policy',
    delete: 'Failed to delete policy',
  };

  toast.error(errorMessages[action], {
    description: error || nextAction || 'An unexpected error occurred. Please try again.',
  });
}

/**
 * Show warning toast for policy action
 */
export function showPolicyWarning(message: string, description?: string) {
  toast.warning(message, { description });
}

/**
 * Show info toast for policy action
 */
export function showPolicyInfo(message: string, description?: string) {
  toast.info(message, { description });
}

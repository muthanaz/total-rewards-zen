/**
 * Admin Components Index
 * Exports all shared admin components
 */

// Badges
export * from './badges';

// Empty States
export { AdminEmptyState } from './AdminEmptyState';

// Error Display
export { AdminErrorDisplay, AdminErrorInline } from './AdminErrorDisplay';

// Existing components
export { ConfirmationModal } from './ConfirmationModal';
export { InteractiveIndustryChart } from './InteractiveIndustryChart';
export { InsightsActionsStrip } from './InsightsActionsStrip';

// Onboarding & Demo
export { OnboardingStatusCard } from './OnboardingStatusCard';

// Action Center (new default /admin landing)
export { AdminActionCenterDashboard } from './AdminActionCenterDashboard';

// Client Readiness Score
export { 
  useClientReadiness, 
  useAllClientReadiness,
  ReadinessStatusBadge,
  ReadinessScoreBadge,
  ReadinessCompactCard,
  ReadinessDetailCard,
} from './ClientReadinessScore';
export type { ReadinessCheckItem, ClientReadinessResult } from './ClientReadinessScore';

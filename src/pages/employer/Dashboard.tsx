/**
 * Employer Dashboard
 * 
 * Mode-aware dashboard that renders different views based on user context:
 * 
 * EXECUTIVE VIEW (CEO/CFO):
 * - Bottom Line: Total investment, utilization, budget variance
 * - Drivers: What's moving the numbers (headcount, claims, policies)
 * - Decisions: Strategic choices requiring sign-off
 * - Risks: At-risk segments, budget overruns, retention signals
 * 
 * HR OPS VIEW:
 * - Backlog: Pending items requiring action
 * - SLA Performance: Processing time, compliance rates
 * - Throughput: Claims processed, approval rates
 * - Exceptions: Escalations, anomalies, policy violations
 * - Payments Pipeline: Settlement lifecycle status
 */

import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';
import { ExecutiveDashboard, HROpsDashboard } from '@/components/employer';

export default function EmployerDashboard() {
  const { isExecutive } = useEmployerViewMode();
  
  return (
    <div className="animate-fade-in">
      {isExecutive ? <ExecutiveDashboard /> : <HROpsDashboard />}
    </div>
  );
}

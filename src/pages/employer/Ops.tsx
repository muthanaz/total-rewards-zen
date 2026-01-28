/**
 * Operations Hub Page
 * 
 * Primary operational hub for HR Ops users combining:
 * - Backlog: Pending claims queue
 * - SLA Performance: Processing metrics
 * - Throughput: Completion rates
 * - Exceptions: Escalations and anomalies
 * - Payments Pipeline: Settlement lifecycle
 * 
 * NOTE: This is the "Operations Hub" (replaces deprecated "Workbench" terminology).
 */

import { UnifiedWorkbench } from '@/components/employer/UnifiedWorkbench';

export default function OpsPage() {
  return (
    <div className="animate-fade-in">
      <UnifiedWorkbench />
    </div>
  );
}

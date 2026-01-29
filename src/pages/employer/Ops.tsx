/**
 * Operations Hub Page
 * 
 * Primary operational hub for HR Ops users with 3 tabs:
 * - Queue (default): Claims/requests workbench with SLA sorting
 * - Overview: High-level metrics (Queue Health, SLA, Throughput, Payments)
 * - Payments: Settlement pipeline summary
 * 
 * Wrapped in OpsOnlyGuard to redirect Executive users.
 */

import { OperationsHub } from '@/components/employer/opsHub';
import { OpsOnlyGuard } from '@/components/employer/OpsOnlyGuard';

export default function OpsPage() {
  return (
    <OpsOnlyGuard>
      <div className="animate-fade-in">
        <OperationsHub />
      </div>
    </OpsOnlyGuard>
  );
}

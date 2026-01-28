/**
 * Operations Hub Page
 * 
 * Primary operational hub for HR Ops users combining:
 * - My Team Queue with SLA risk sorting (default)
 * - Comprehensive filters (Type, Category, Amount, SLA, Docs, Assigned)
 * - Inline actions (Approve, Reject, Request Docs, Assign, View Timeline)
 * - Timeline drawer showing request_events audit trail
 */

import { OperationsHub } from '@/components/employer/opsHub';

export default function OpsPage() {
  return (
    <div className="animate-fade-in">
      <OperationsHub />
    </div>
  );
}

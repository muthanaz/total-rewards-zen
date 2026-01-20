import { PolicyManagementView } from '@/components/employer/PolicyManagementView';
import { OpsOnlyGuard } from '@/components/employer';

// Ops-only policy management page
export default function PoliciesPage() {
  return (
    <OpsOnlyGuard
      title="Policy Management"
      description="This workspace is used by HR Operations to manage policy documents, version control, and publishing workflows."
    >
      <PolicyManagementView />
    </OpsOnlyGuard>
  );
}

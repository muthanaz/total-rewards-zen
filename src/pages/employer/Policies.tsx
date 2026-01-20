import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';
import { PoliciesOpsView } from '@/components/employer';
import { PoliciesExecView } from './PoliciesExecView';

export default function PoliciesPage() {
  const { isExecutive } = useEmployerViewMode();
  
  return (
    <div className="animate-fade-in">
      {isExecutive ? <PoliciesExecView /> : <PoliciesOpsView />}
    </div>
  );
}

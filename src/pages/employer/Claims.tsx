import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';
import { ClaimsExecView } from '@/components/employer';
import { ClaimsOpsView } from './ClaimsOpsView';

export default function ClaimsPage() {
  const { isExecutive } = useEmployerViewMode();
  
  return (
    <div className="animate-fade-in">
      {isExecutive ? <ClaimsExecView /> : <ClaimsOpsView />}
    </div>
  );
}

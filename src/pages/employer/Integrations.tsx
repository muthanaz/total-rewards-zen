import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';
import { IntegrationsExecView } from '@/components/employer';
import { IntegrationsOpsView } from './IntegrationsOpsView';

export default function IntegrationsPage() {
  const { isExecutive } = useEmployerViewMode();
  
  return (
    <div className="animate-fade-in">
      {isExecutive ? <IntegrationsExecView /> : <IntegrationsOpsView />}
    </div>
  );
}

import { useSearchParams } from 'react-router-dom';
import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';
import { IntegrationsExecView } from '@/components/employer';
import { IntegrationsOpsView } from './IntegrationsOpsView';

export default function IntegrationsPage() {
  const { isExecutive } = useEmployerViewMode();
  const [searchParams] = useSearchParams();
  
  // Allow URL param to override view mode (for deep linking from issue resolution)
  const viewParam = searchParams.get('view');
  const showOpsView = viewParam === 'ops' || !isExecutive;
  
  return (
    <div className="animate-fade-in">
      {showOpsView ? <IntegrationsOpsView /> : <IntegrationsExecView />}
    </div>
  );
}

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

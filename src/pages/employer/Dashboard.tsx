/**
 * Employer Dashboard
 * 
 * Mode-aware dashboard that renders different views based on user context:
 * 
 * EXECUTIVE VIEW:
 * - Renders the ExecutiveDashboard with strategic KPIs
 * 
 * HR OPS VIEW:
 * - Redirects to /employer/ops (Operations Hub workbench)
 * - The HR Ops dashboard content is now a tab within the Operations Hub
 */

import { Navigate } from 'react-router-dom';
import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';
import { ExecutiveDashboard } from '@/components/employer';

export default function EmployerDashboard() {
  const { isExecutive, loading } = useEmployerViewMode();
  
  // Show loading state while determining view mode
  if (loading) {
    return (
      <div className="animate-pulse space-y-6 p-4 lg:p-8">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }
  
  // HR Ops users should go to /employer/ops
  if (!isExecutive) {
    return <Navigate to="/employer/ops" replace />;
  }
  
  return (
    <div className="animate-fade-in">
      <ExecutiveDashboard />
    </div>
  );
}

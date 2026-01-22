/**
 * Admin Onboarding Page
 * Entry point for the organization onboarding wizard
 */

import { useNavigate } from 'react-router-dom';
import { OnboardingWizard } from '@/components/admin/onboarding';
import { PageHeader } from '@/components/shared/PageHeader';
import { Rocket } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();

  const handleComplete = (orgId: string) => {
    navigate(`/admin/organizations/${orgId}/settings`);
  };

  const handleCancel = () => {
    navigate('/admin/organizations');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="New Organization"
        description="Set up a new organization with policies, governance, and users"
        icon={Rocket}
        iconClassName="from-accent to-accent/80"
      />
      
      <OnboardingWizard 
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}

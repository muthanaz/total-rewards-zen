/**
 * Hook for tracking employer setup/onboarding progress
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SetupStep, SetupStepStatus, SetupProgress, SETUP_STEPS } from '@/components/employer/setup/types';

interface SetupCheckResults {
  hasOrgStructure: boolean;
  hasEmployees: boolean;
  hasPublishedPolicy: boolean;
  hasActiveWorkflow: boolean;
  dataQualityScore: number;
  hasProcessedClaim: boolean;
  hasSettlementConfig: boolean;
}

export function useSetupProgress() {
  const { user } = useAuth();

  // First fetch the user's organization
  const orgQuery = useQuery({
    queryKey: ['user_organization', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      return data?.organization_id;
    },
    enabled: !!user?.id,
  });

  const organizationId = orgQuery.data;

  const query = useQuery({
    queryKey: ['setup_progress', organizationId],
    queryFn: async (): Promise<{ steps: SetupStep[]; progress: SetupProgress; checks: SetupCheckResults }> => {
      if (!organizationId) {
        throw new Error('No organization ID');
      }

      // Run all checks in parallel
      const [
        orgStructureResult,
        employeesResult,
        policiesResult,
        workflowsResult,
        claimsResult,
      ] = await Promise.all([
        // Check org structure - look for any entities
        supabase
          .from('org_legal_entities')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('is_active', true),
        
        // Check employees uploaded
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId),
        
        // Check published policies
        supabase
          .from('policies')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('status', 'published'),
        
        // Check active workflows
        supabase
          .from('workflow_definitions')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('is_active', true),
        
        // Check processed claims (paid or closed)
        supabase
          .from('requests')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .in('status', ['paid', 'closed']),
      ]);

      const checks: SetupCheckResults = {
        hasOrgStructure: (orgStructureResult.count ?? 0) > 0,
        hasEmployees: (employeesResult.count ?? 0) > 0,
        hasPublishedPolicy: (policiesResult.count ?? 0) > 0,
        hasActiveWorkflow: (workflowsResult.count ?? 0) > 0,
        dataQualityScore: 85, // TODO: Compute from actual data quality metrics
        hasProcessedClaim: (claimsResult.count ?? 0) > 0,
        hasSettlementConfig: true, // TODO: Check actual settlement configuration
      };

      // Determine status for each step
      const steps: SetupStep[] = SETUP_STEPS.map((step) => {
        let status: SetupStepStatus = 'not_started';

        switch (step.id) {
          case 'org_structure':
            status = checks.hasOrgStructure ? 'done' : 'not_started';
            break;
          case 'upload_employees':
            status = checks.hasEmployees ? 'done' : 'not_started';
            break;
          case 'publish_policies':
            status = checks.hasPublishedPolicy ? 'done' : 'not_started';
            break;
          case 'configure_workflows':
            status = checks.hasActiveWorkflow ? 'done' : 'not_started';
            break;
          case 'validate_data':
            status = checks.dataQualityScore >= 80 ? 'done' : checks.dataQualityScore >= 50 ? 'in_progress' : 'not_started';
            break;
          case 'test_claims':
            status = checks.hasProcessedClaim ? 'done' : 'not_started';
            break;
          case 'configure_settlements':
            status = checks.hasSettlementConfig ? 'done' : 'not_started';
            break;
          case 'go_live':
            // Gated: all conditions must be met
            const isReady = 
              checks.dataQualityScore >= 80 &&
              checks.hasPublishedPolicy &&
              checks.hasActiveWorkflow &&
              checks.hasProcessedClaim;
            status = isReady ? 'done' : 'not_started';
            break;
        }

        return { ...step, status };
      });

      // Calculate progress
      const completedSteps = steps.filter(s => s.status === 'done').length;
      const totalSteps = steps.length;

      // Go-live blockers
      const goLiveBlockers: string[] = [];
      if (checks.dataQualityScore < 80) {
        goLiveBlockers.push(`Data quality is ${checks.dataQualityScore}% (minimum 80% required)`);
      }
      if (!checks.hasPublishedPolicy) {
        goLiveBlockers.push('At least 1 policy must be published');
      }
      if (!checks.hasActiveWorkflow) {
        goLiveBlockers.push('At least 1 workflow must be active');
      }
      if (!checks.hasProcessedClaim) {
        goLiveBlockers.push('At least 1 test claim must be processed end-to-end');
      }

      const progress: SetupProgress = {
        completedSteps,
        totalSteps,
        percentComplete: Math.round((completedSteps / totalSteps) * 100),
        isGoLiveReady: goLiveBlockers.length === 0,
        goLiveBlockers,
      };

      return { steps, progress, checks };
    },
    enabled: !!organizationId,
  });

  return {
    steps: query.data?.steps ?? [],
    progress: query.data?.progress ?? {
      completedSteps: 0,
      totalSteps: 8,
      percentComplete: 0,
      isGoLiveReady: false,
      goLiveBlockers: [],
    },
    checks: query.data?.checks,
    isLoading: query.isLoading || orgQuery.isLoading,
    refetch: query.refetch,
  };
}

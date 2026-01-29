/**
 * Hook for seeding demo policies from templates
 * 
 * Creates published policies for all 7 benefit categories using templates.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePolicyTemplates } from './usePolicyTemplates';
import { createPolicyWithVersion, publishPolicyVersion } from './usePolicyRPC';
import type { TransactionModel } from '@/lib/policyEngine';

interface SeedDemoPoliciesOptions {
  organizationId: string;
  userId: string;
}

export function useSeedDemoPolicies() {
  const queryClient = useQueryClient();
  const { data: templates = [] } = usePolicyTemplates();

  return useMutation({
    mutationFn: async ({ organizationId, userId }: SeedDemoPoliciesOptions) => {
      if (!organizationId || !userId) {
        throw new Error('Organization ID and User ID are required');
      }

      const results: Array<{ 
        template: string; 
        success: boolean; 
        policyId?: string; 
        error?: string;
      }> = [];

      // Process each template
      for (const template of templates) {
        try {
          // Check if policy already exists for this category
          const { data: existing } = await supabase
            .from('policies')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('category', template.category)
            .eq('is_active', true)
            .limit(1);

          if (existing && existing.length > 0) {
            results.push({
              template: template.name,
              success: true,
              policyId: existing[0].id,
              error: 'Already exists',
            });
            continue;
          }

          // Create policy from template
          const contentJson = {
            faqs: [],
            details: '',
            summary: [],
            examples: [],
            pitfalls: [],
            ...(template.default_content || {}),
          };

          const logicJson = {
            transaction_model: (template.transaction_model || 'claim_only') as TransactionModel,
            eligibility_rules: {
              grades: [],
              locations: [],
              departments: [],
              contract_types: [],
              probation_passed: false,
              min_tenure_months: 0,
              ...(template.default_eligibility_rules || {}),
            },
            limits_caps: {
              frequency: 'annual' as const,
              annual_cap: null,
              reset_month: 1,
              annual_cap_currency: 'AED',
              per_transaction_cap: null,
              pre_approval_threshold: null,
              ...(template.default_limits || {}),
            },
            workflow: {
              sla_days: template.default_sla_days || 3,
              approver_role: 'hr' as const,
              escalation_role: null,
              enforcement_mode: 'soft' as const,
              ...(template.default_workflow || {}),
            },
          };

          const clientRequestId = crypto.randomUUID();

          const createResult = await createPolicyWithVersion({
            orgId: organizationId,
            createdBy: userId,
            policyName: `${template.name} Policy`,
            lifeArea: template.category,
            benefitType: template.benefit_type || 'allowance',
            transactionModel: template.transaction_model || 'claim_only',
            effectiveFrom: new Date().toISOString().split('T')[0],
            templateId: template.id,
            contentJson,
            logicJson,
            clientRequestId,
          });

          if (!createResult.success) {
            results.push({
              template: template.name,
              success: false,
              error: createResult.error,
            });
            continue;
          }

          // Create required docs if template has them
          if (template.default_required_docs && Array.isArray(template.default_required_docs)) {
            const requiredDocs = template.default_required_docs.map((doc: any) => ({
              policy_version_id: createResult.policy_version_id,
              doc_type: doc.doc_type || 'other',
              doc_name: doc.doc_name || 'Document',
              is_required: doc.is_required ?? true,
              transaction_type: doc.transaction_type || 'claim',
              description: doc.description || null,
            }));

            if (requiredDocs.length > 0) {
              await supabase.from('policy_required_docs').insert(requiredDocs);
            }
          }

          // Publish the policy immediately
          const publishResult = await publishPolicyVersion({
            versionId: createResult.policy_version_id!,
          });

          if (!publishResult.success) {
            // Policy created but not published - still count as partial success
            results.push({
              template: template.name,
              success: true,
              policyId: createResult.policy_id,
              error: `Created but not published: ${publishResult.error}`,
            });
            continue;
          }

          results.push({
            template: template.name,
            success: true,
            policyId: createResult.policy_id,
          });
        } catch (err: any) {
          results.push({
            template: template.name,
            success: false,
            error: err?.message || 'Unknown error',
          });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['policies_management'] });
      queryClient.invalidateQueries({ queryKey: ['policies_v2'] });
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['organization_policies'] });

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (successCount > 0 && failCount === 0) {
        toast.success(`${successCount} demo policies created and published`, {
          description: 'All policies are now visible to employees.',
        });
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`${successCount} policies created, ${failCount} failed`, {
          description: 'Some policies could not be created. Check the console for details.',
        });
      } else {
        toast.error('Failed to create demo policies', {
          description: 'Check the console for details.',
        });
      }
    },
    onError: (error: any) => {
      toast.error('Failed to seed demo policies', {
        description: error?.message || 'An unexpected error occurred.',
      });
    },
  });
}

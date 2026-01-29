/**
 * Demo Policy Seeding Utility
 * 
 * Creates published demo policies for all 7 benefit categories.
 * Used for organization onboarding with realistic UAE/GCC-style policies.
 * 
 * Each policy is tagged as "DEMO TEMPLATE" and published immediately.
 */

import { supabase } from '@/integrations/supabase/client';
import { PolicyTemplate } from '@/hooks/usePolicyTemplates';
import { 
  DEFAULT_POLICY_LOGIC, 
  DEFAULT_POLICY_CONTENT,
  PolicyLogic,
  PolicyContent 
} from '@/lib/policyEngine';

export interface SeedResult {
  success: boolean;
  policyId?: string;
  versionId?: string;
  error?: string;
  alreadyExists?: boolean;
}

export interface SeedAllResult {
  success: boolean;
  created: number;
  skipped: number;
  failed: number;
  details: Array<{
    templateName: string;
    result: SeedResult;
  }>;
}

/**
 * Create a single demo policy from a template
 */
export async function createDemoPolicyFromTemplate(
  organizationId: string,
  createdBy: string,
  template: PolicyTemplate,
  autoPublish: boolean = true
): Promise<SeedResult> {
  try {
    // Generate policy ref
    const policyRef = `POL-${template.category.toUpperCase().slice(0, 3)}-DEMO-${Date.now().toString(36).toUpperCase()}`;

    // Build content_json
    const contentJson: PolicyContent = {
      ...DEFAULT_POLICY_CONTENT,
      ...(template.default_content || {}),
      summary: template.default_content?.summary || [
        `${template.name} policy for eligible employees`,
        'Subject to company policy terms and conditions',
        'Contact HR for questions',
      ],
      faqs: template.default_content?.faqs || [],
      examples: template.default_content?.examples || [],
      pitfalls: template.default_content?.pitfalls || [],
      details: template.default_content?.details || '',
    };

    // Build logic_json with proper typing
    // Note: Some template fields may have extended properties - we use type assertions where needed
    const logicJson: PolicyLogic = {
      transaction_model: (template.transaction_model as PolicyLogic['transaction_model']) || 'claim_only',
      eligibility_rules: {
        ...DEFAULT_POLICY_LOGIC.eligibility_rules,
        grades: template.default_eligibility_rules?.grades || ['L4', 'L5', 'L6', 'L7'],
        departments: template.default_eligibility_rules?.departments || [],
        locations: template.default_eligibility_rules?.locations || [],
        min_tenure_months: template.default_eligibility_rules?.min_tenure_months ?? 0,
        probation_passed: template.default_eligibility_rules?.probation_passed ?? true,
        contract_types: template.default_eligibility_rules?.contract_types || ['permanent'],
      },
      limits_caps: {
        ...DEFAULT_POLICY_LOGIC.limits_caps,
        annual_cap: template.default_limits?.annual_cap ?? null,
        annual_cap_currency: template.default_limits?.annual_cap_currency || 'AED',
        per_transaction_cap: template.default_limits?.per_transaction_cap ?? null,
        frequency: template.default_limits?.frequency || 'annual',
        reset_month: template.default_limits?.reset_month || 1,
        pre_approval_threshold: template.default_limits?.pre_approval_threshold ?? null,
      },
      workflow: {
        ...DEFAULT_POLICY_LOGIC.workflow,
        sla_days: template.default_sla_days || template.default_workflow?.sla_days || 5,
        approver_role: template.default_workflow?.approver_role || 'manager',
        escalation_role: template.default_workflow?.escalation_role || null,
      },
    };

    // Insert policy
    const { data: policy, error: policyError } = await supabase
      .from('policies')
      .insert({
        organization_id: organizationId,
        policy_ref: policyRef,
        title: `${template.name} Policy`,
        category: template.category,
        version: '1.0',
        status: autoPublish ? 'published' : 'draft',
        effective_from: new Date().toISOString().split('T')[0],
        benefit_type: template.benefit_type || 'allowance',
        transaction_model: template.transaction_model || 'claim_only',
        owner_user_id: createdBy,
        is_active: true,
      })
      .select('id')
      .single();

    if (policyError) {
      console.error('Policy insert error:', policyError);
      return { success: false, error: policyError.message };
    }

    // Insert policy version
    const { data: version, error: versionError } = await (supabase
      .from('policy_versions' as any)
      .insert({
        policy_id: policy.id,
        version_number: 1,
        status: autoPublish ? 'published' : 'draft',
        effective_from: new Date().toISOString().split('T')[0],
        created_by: createdBy,
        content_json: contentJson,
        logic_json: logicJson,
      } as any)
      .select('id')
      .single()) as any;

    if (versionError) {
      console.error('Version insert error:', versionError);
      // Cleanup policy
      await supabase.from('policies').delete().eq('id', policy.id);
      return { success: false, error: versionError.message };
    }

    // Insert required docs if present
    if (template.default_required_docs && template.default_required_docs.length > 0) {
      const docsToInsert = template.default_required_docs.map((doc) => ({
        policy_version_id: version.id,
        doc_type: doc.doc_type,
        doc_name: doc.doc_name,
        is_required: doc.is_required ?? true,
        transaction_type: doc.transaction_type || 'claim',
      }));

      const { error: docsError } = await supabase
        .from('policy_required_docs')
        .insert(docsToInsert);

      if (docsError) {
        console.warn('Failed to insert required docs:', docsError);
        // Non-blocking - continue
      }
    }

    return {
      success: true,
      policyId: policy.id,
      versionId: version.id,
    };
  } catch (error: any) {
    console.error('createDemoPolicyFromTemplate error:', error);
    return { success: false, error: error?.message || String(error) };
  }
}

/**
 * Create all 7 demo policies for an organization
 */
export async function seedAllDemoPolicies(
  organizationId: string,
  createdBy: string,
  autoPublish: boolean = true
): Promise<SeedAllResult> {
  const result: SeedAllResult = {
    success: true,
    created: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  try {
    // Fetch all templates
    const { data: templates, error: templatesError } = await supabase
      .from('policy_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (templatesError || !templates || templates.length === 0) {
      return {
        success: false,
        created: 0,
        skipped: 0,
        failed: 0,
        details: [],
      };
    }

    // Check existing policies for this org
    const { data: existingPolicies } = await supabase
      .from('policies')
      .select('category')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    const existingCategories = new Set((existingPolicies || []).map((p) => p.category));

    // Create each policy
    for (const template of templates as PolicyTemplate[]) {
      // Skip if category already exists
      if (existingCategories.has(template.category)) {
        result.skipped++;
        result.details.push({
          templateName: template.name,
          result: { success: true, alreadyExists: true },
        });
        continue;
      }

      const seedResult = await createDemoPolicyFromTemplate(
        organizationId,
        createdBy,
        template,
        autoPublish
      );

      result.details.push({
        templateName: template.name,
        result: seedResult,
      });

      if (seedResult.success) {
        result.created++;
      } else {
        result.failed++;
        result.success = false;
      }
    }

    return result;
  } catch (error: any) {
    console.error('seedAllDemoPolicies error:', error);
    return {
      success: false,
      created: result.created,
      skipped: result.skipped,
      failed: result.failed + 1,
      details: result.details,
    };
  }
}

export default {
  createDemoPolicyFromTemplate,
  seedAllDemoPolicies,
};

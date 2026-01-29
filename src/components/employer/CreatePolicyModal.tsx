/**
 * Create Policy Modal (Refactored with RPC)
 * 
 * Modal dialog for creating new policies using atomic RPC function.
 * Features:
 * - Organization selection (Admin mode)
 * - Template selection (optional)
 * - Policy Name, Life Area, Benefit Type, Transaction Model
 * - Effective Dates
 * - Idempotent creation via server-side RPC (prevents duplicates)
 */

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, FileText, CalendarDays, LayoutTemplate, Sparkles } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  BENEFIT_TYPE_OPTIONS,
  TRANSACTION_MODEL_OPTIONS,
  BenefitPolicyType,
  TransactionModel,
  DEFAULT_POLICY_LOGIC,
  DEFAULT_POLICY_CONTENT,
} from '@/lib/policyEngine';
import { LIFE_AREA_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import { usePolicyTemplates, type PolicyTemplate } from '@/hooks/usePolicyTemplates';
import { createPolicyWithVersion } from '@/hooks/usePolicyRPC';
import { cn } from '@/lib/utils';

interface CreatePolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onCreated?: (policyId: string, versionId: string) => void;
}

export function CreatePolicyModal({
  open,
  onOpenChange,
  organizationId,
}: CreatePolicyModalProps) {
  // Step: 'source' (blank or template) -> 'details'
  const [step, setStep] = useState<'source' | 'details'>('source');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [benefitKey, setBenefitKey] = useState('');
  const [lifeArea, setLifeArea] = useState('');
  const [benefitType, setBenefitType] = useState<BenefitPolicyType>('allowance');
  const [transactionModel, setTransactionModel] = useState<TransactionModel>('claim_only');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Idempotency: ref to track if submission is in progress
  const submissionInProgressRef = useRef(false);
  // Stable idempotency key: generated once per modal-open, reused for retries
  const clientRequestIdRef = useRef<string | null>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logEvent } = useAuditLog();

  // Fetch templates
  const { data: templates = [] } = usePolicyTemplates();

  // Fetch available benefits for the dropdown
  const { data: benefits = [] } = useQuery({
    queryKey: ['benefits_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefits')
        .select('id, name, life_area, benefit_type')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      submissionInProgressRef.current = false;
      clientRequestIdRef.current = crypto.randomUUID();
      setFormError(null);
    } else {
      // Reset form when modal closes
      setStep('source');
      setSelectedTemplateId(null);
      setName('');
      setBenefitKey('');
      setLifeArea('');
      setBenefitType('allowance');
      setTransactionModel('claim_only');
      setEffectiveFrom('');
      setEffectiveTo('');
      setIsSubmitting(false);
      setFormError(null);
      submissionInProgressRef.current = false;
      clientRequestIdRef.current = null;
    }
  }, [open]);

  // Apply template when selected and moving to details
  const applyTemplate = (template: PolicyTemplate) => {
    setName(`${template.name} Policy`);
    setLifeArea(template.category);
    setBenefitType((template.benefit_type as BenefitPolicyType) || 'allowance');
    setTransactionModel((template.transaction_model as TransactionModel) || 'claim_only');
  };

  const handleBenefitChange = (benefitId: string) => {
    setBenefitKey(benefitId);
    const benefit = benefits.find(b => b.id === benefitId);
    if (benefit) {
      setName(benefit.name + ' Policy');
      setLifeArea(benefit.life_area || '');
    }
  };

  const handleSourceSelect = (source: 'blank' | 'template', templateId?: string) => {
    if (source === 'blank') {
      setSelectedTemplateId(null);
      setStep('details');
    } else if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplateId(templateId);
        applyTemplate(template);
        setStep('details');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission using ref (works across re-renders)
    if (submissionInProgressRef.current || isSubmitting) {
      return;
    }

    setFormError(null);

    if (!name.trim() || !lifeArea) {
      setFormError('Please provide a policy name and select a life area.');
      toast.error('Missing required fields', {
        description: 'Please provide a policy name and select a life area.',
      });
      return;
    }

    if (!user?.id) {
      toast.error('Authentication required', {
        description: 'Please log in to create a policy.',
      });
      return;
    }

    // Mark submission in progress
    submissionInProgressRef.current = true;
    setIsSubmitting(true);

    try {
      // Get template defaults if using template
      const template = selectedTemplateId 
        ? templates.find(t => t.id === selectedTemplateId) 
        : null;

      // Prepare content and logic from template or defaults (merging with defaults for complete types)
      const contentJson = {
        ...DEFAULT_POLICY_CONTENT,
        ...(template?.default_content || {}),
      };
      const logicJson = {
        transaction_model: transactionModel,
        eligibility_rules: {
          ...DEFAULT_POLICY_LOGIC.eligibility_rules,
          ...(template?.default_eligibility_rules || {}),
        },
        limits_caps: {
          ...DEFAULT_POLICY_LOGIC.limits_caps,
          ...(template?.default_limits || {}),
        },
        workflow: {
          ...DEFAULT_POLICY_LOGIC.workflow,
          ...(template?.default_workflow || {}),
        },
      };

      const clientRequestId = clientRequestIdRef.current || crypto.randomUUID();
      clientRequestIdRef.current = clientRequestId;

      // Call the atomic RPC function (server-side idempotent)
      const result = await createPolicyWithVersion({
        orgId: organizationId,
        createdBy: user.id,
        policyName: name.trim(),
        lifeArea,
        benefitType,
        transactionModel,
        effectiveFrom: effectiveFrom || undefined,
        effectiveTo: effectiveTo || null,
        templateId: selectedTemplateId,
        contentJson,
        logicJson,
        clientRequestId,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create policy');
      }

      const policyId = result.policy_id!;
      const versionId = result.policy_version_id!;

      // Always show success feedback immediately (avoid "created but showed error" mismatch)
      toast.success(result.already_exists ? 'A similar policy already exists' : 'Policy created (Draft v1)', {
        description: result.already_exists
          ? `Opening the existing draft for "${name.trim()}"...`
          : `"${name.trim()}" has been created. Opening editor...`,
      });

      // Close modal
      onOpenChange(false);

      // Small delay before opening editor to allow query invalidation
      setTimeout(() => {
        // Navigate to the policy editor by dispatching a custom event
        window.dispatchEvent(new CustomEvent('policy-created', {
          detail: { policyId, versionId }
        }));
      }, 100);

      // Non-blocking: required docs + query invalidation + audit log
       void (async () => {
        try {
          // If template has required docs, create them
          if (template?.default_required_docs && Array.isArray(template.default_required_docs)) {
            const requiredDocs = template.default_required_docs.map((doc: any) => ({
              policy_version_id: versionId,
              doc_type: doc.doc_type || 'other',
              doc_name: doc.doc_name || 'Document',
              is_required: doc.is_required ?? true,
              transaction_type: doc.transaction_type || 'claim',
            }));

            if (requiredDocs.length > 0) {
              const { error: docsError } = await supabase.from('policy_required_docs').insert(requiredDocs);
              if (docsError) console.warn('Failed to create required docs:', docsError);
            }
          }

          await queryClient.invalidateQueries({ queryKey: ['policies_management'] });
          queryClient.invalidateQueries({ queryKey: ['policies_v2'] });
          queryClient.invalidateQueries({ queryKey: ['policies'] });
          queryClient.invalidateQueries({ queryKey: ['organization_policies'] });

          await logEvent({
            action: 'POLICY_CREATE',
            resourceType: 'policy',
            resourceId: policyId,
            details: {
              outcome: 'success',
              title: name.trim(),
              category: lifeArea,
              transaction_model: transactionModel,
              organization_id: organizationId,
              version_id: versionId,
              from_template: selectedTemplateId || null,
              client_request_id: clientRequestId,
              already_exists: Boolean(result.already_exists),
            },
          });
        } catch (err) {
          console.warn('Post-create side effects failed (non-blocking):', err);
           toast.warning('Policy created, but updates are still syncing', {
             description: 'If the new policy does not appear immediately, refresh the page.',
           });
        }
      })();

    } catch (error: any) {
      console.error('Failed to create policy:', error);

      void logEvent({
        action: 'POLICY_CREATE_FAILED',
        resourceType: 'policy',
        resourceId: undefined,
        details: {
          outcome: 'failure',
          organization_id: organizationId,
          title: name.trim(),
          category: lifeArea,
          message: error?.message || String(error),
        },
      });
      
      toast.error('Failed to create policy', {
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      // Reset submission state
      setIsSubmitting(false);
      submissionInProgressRef.current = false;
    }
  };

  const lifeAreaOptions = Object.entries(LIFE_AREA_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing while submitting
      if (isSubmitting) return;
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Create New Policy</DialogTitle>
              <DialogDescription>
                {step === 'source' 
                  ? 'Choose how to start your new policy'
                  : 'Define your new benefit policy'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {formError && step === 'details' && (
          <div className="mt-3">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          </div>
        )}

        {step === 'source' ? (
          <div className="py-6 space-y-4">
            {/* Start Blank */}
            <button
              onClick={() => handleSourceSelect('blank')}
              className={cn(
                "w-full p-4 rounded-lg border-2 border-dashed text-left transition-colors",
                "hover:border-primary hover:bg-primary/5"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Start Blank</p>
                  <p className="text-sm text-muted-foreground">
                    Create a policy from scratch with default settings
                  </p>
                </div>
              </div>
            </button>

            {/* Use Template */}
            {templates.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Or use a template ({templates.length} available)</span>
                </div>
                <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSourceSelect('template', template.id)}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-colors",
                        "hover:border-primary hover:bg-primary/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-medium text-sm truncate">{template.name}</p>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/50 text-amber-600 bg-amber-50 flex-shrink-0">
                              DEMO
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {LIFE_AREA_LABELS[template.category as keyof typeof LIFE_AREA_LABELS] || template.category}
                            {template.transaction_model && (
                              <span className="ml-2 opacity-70">
                                • {template.transaction_model === 'claim_only' ? 'Claim' : 
                                   template.transaction_model === 'request_only' ? 'Request' : 'Request + Claim'}
                              </span>
                            )}
                          </p>
                        </div>
                        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {templates.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4 space-y-3">
                <p>No templates available yet.</p>
                <p className="text-xs">
                  To onboard faster, an admin can create reusable templates in the Admin portal (Policy Templates).
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText('/admin/policy-templates');
                        toast.success('Admin link copied', {
                          description: 'Paste into your browser as an admin: /admin/policy-templates',
                        });
                      } catch {
                        toast.error('Could not copy link', {
                          description: 'Copy this path: /admin/policy-templates',
                        });
                      }
                    }}
                  >
                    Copy Admin Path
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Template indicator */}
            {selectedTemplateId && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700">
                  Using template: {templates.find(t => t.id === selectedTemplateId)?.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-6 text-xs"
                  onClick={() => setStep('source')}
                  disabled={isSubmitting}
                >
                  Change
                </Button>
              </div>
            )}

            {/* Benefit Key (optional) */}
            <div className="space-y-2">
              <Label htmlFor="benefitKey">Link to Benefit Category</Label>
              <Select 
                value={benefitKey || '__none__'} 
                onValueChange={(v) => handleBenefitChange(v === '__none__' ? '' : v)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="benefitKey">
                  <SelectValue placeholder="Select a benefit (optional)..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— No linked benefit —</SelectItem>
                  {benefits.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Link to a benefit category for Claims integration
              </p>
            </div>

            {/* Policy Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Policy Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Medical Insurance Policy"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Life Area */}
            <div className="space-y-2">
              <Label htmlFor="lifeArea">
                Life Area <span className="text-destructive">*</span>
              </Label>
              <Select value={lifeArea} onValueChange={setLifeArea} required disabled={isSubmitting}>
                <SelectTrigger id="lifeArea">
                  <SelectValue placeholder="Select life area..." />
                </SelectTrigger>
                <SelectContent>
                  {lifeAreaOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Benefit Type */}
            <div className="space-y-2">
              <Label htmlFor="benefitType">Benefit Type</Label>
              <Select 
                value={benefitType} 
                onValueChange={(v) => setBenefitType(v as BenefitPolicyType)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="benefitType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BENEFIT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Model */}
            <div className="space-y-2">
              <Label htmlFor="transactionModel">Transaction Model</Label>
              <Select 
                value={transactionModel} 
                onValueChange={(v) => setTransactionModel(v as TransactionModel)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="transactionModel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_MODEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div>
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {TRANSACTION_MODEL_OPTIONS.find(o => o.value === transactionModel)?.description}
              </p>
            </div>

            {/* Effective Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effectiveFrom" className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  Effective From
                </Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveTo" className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  Effective To
                </Label>
                <Input
                  id="effectiveTo"
                  type="date"
                  value={effectiveTo}
                  onChange={(e) => setEffectiveTo(e.target.value)}
                  min={effectiveFrom}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('source')}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting || !name.trim() || !lifeArea}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Policy'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

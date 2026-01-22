/**
 * Create Policy Modal (Enhanced)
 * 
 * Modal dialog for creating new policies with:
 * - Organization selection (Admin mode)
 * - Template selection (optional)
 * - Policy Name, Life Area, Benefit Type, Transaction Model
 * - Effective Dates
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  onCreated,
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

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setStep('source');
      setSelectedTemplateId(null);
      setName('');
      setBenefitKey('');
      setLifeArea('');
      setBenefitType('allowance');
      setTransactionModel('claim_only');
      setEffectiveFrom('');
      setEffectiveTo('');
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

    if (!name.trim() || !lifeArea) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get template defaults if using template
      const template = selectedTemplateId 
        ? templates.find(t => t.id === selectedTemplateId) 
        : null;

      // Generate policy_ref
      const policyRef = `POL-${name.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      // Create policy record
      const { data: policy, error: policyError } = await supabase
        .from('policies')
        .insert({
          organization_id: organizationId,
          policy_ref: policyRef,
          title: name.trim(),
          category: lifeArea,
          version: '1.0',
          status: 'draft',
          effective_from: effectiveFrom || new Date().toISOString().split('T')[0],
          effective_to: effectiveTo || null,
          benefit_type: benefitType,
          transaction_model: transactionModel,
          benefit_key: benefitKey || null,
          is_active: true,
        })
        .select()
        .single();

      if (policyError) throw policyError;

      // Prepare content and logic from template or defaults
      const contentJson = template?.default_content || DEFAULT_POLICY_CONTENT;
      const logicJson = {
        transaction_model: transactionModel,
        eligibility_rules: template?.default_eligibility_rules || DEFAULT_POLICY_LOGIC.eligibility_rules,
        limits_caps: template?.default_limits || DEFAULT_POLICY_LOGIC.limits_caps,
        workflow: template?.default_workflow || DEFAULT_POLICY_LOGIC.workflow,
      };

      // Create initial draft version
      const { data: version, error: versionError } = await (supabase
        .from('policy_versions' as any)
        .insert({
          policy_id: policy.id,
          version_number: 1,
          status: 'draft',
          effective_from: effectiveFrom || null,
          effective_to: effectiveTo || null,
          created_by: user?.id,
          content_json: contentJson,
          logic_json: logicJson,
        } as any)
        .select()
        .single()) as any;

      if (versionError) throw versionError;

      // If template has required docs, create them
      if (template?.default_required_docs && Array.isArray(template.default_required_docs)) {
        const requiredDocs = template.default_required_docs.map((doc: any) => ({
          policy_version_id: version.id,
          doc_type: doc.doc_type || 'other',
          doc_name: doc.doc_name || 'Document',
          is_required: doc.is_required ?? true,
          transaction_type: doc.transaction_type || 'claim',
        }));

        if (requiredDocs.length > 0) {
          await supabase.from('policy_required_docs').insert(requiredDocs);
        }
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['policies_v2'] });
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['organization_policies'] });
      queryClient.invalidateQueries({ queryKey: ['policies_management'] });

      // Audit log
      await logEvent({
        action: 'POLICY_CREATE',
        resourceType: 'policy',
        resourceId: policy.id,
        details: { 
          title: policy.title, 
          category: lifeArea,
          transaction_model: transactionModel,
          organization_id: organizationId,
          version_id: version.id,
          from_template: selectedTemplateId || null,
        },
      });

      toast.success('Policy created', {
        description: `${policy.title} has been created as Draft v1.`,
      });

      onOpenChange(false);
      onCreated?.(policy.id, version.id);
    } catch (error) {
      console.error('Failed to create policy:', error);
      toast.error('Failed to create policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const lifeAreaOptions = Object.entries(LIFE_AREA_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  <span className="text-sm font-medium">Or use a template</span>
                </div>
                <div className="grid gap-2">
                  {templates.slice(0, 5).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSourceSelect('template', template.id)}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-colors",
                        "hover:border-primary hover:bg-primary/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {LIFE_AREA_LABELS[template.category as keyof typeof LIFE_AREA_LABELS] || template.category}
                          </p>
                        </div>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {templates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No templates available. Contact your administrator to create templates.
              </p>
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
                >
                  Change
                </Button>
              </div>
            )}

            {/* Benefit Key (optional) */}
            <div className="space-y-2">
              <Label htmlFor="benefitKey">Link to Benefit Category</Label>
              <Select value={benefitKey || '__none__'} onValueChange={(v) => handleBenefitChange(v === '__none__' ? '' : v)}>
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
              />
            </div>

            {/* Life Area */}
            <div className="space-y-2">
              <Label htmlFor="lifeArea">
                Life Area <span className="text-destructive">*</span>
              </Label>
              <Select value={lifeArea} onValueChange={setLifeArea} required>
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

            <div className="grid grid-cols-2 gap-4">
              {/* Benefit Type */}
              <div className="space-y-2">
                <Label htmlFor="benefitType">Benefit Type</Label>
                <Select
                  value={benefitType}
                  onValueChange={(v) => setBenefitType(v as BenefitPolicyType)}
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
                >
                  <SelectTrigger id="transactionModel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_MODEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs text-muted-foreground px-1">
              {TRANSACTION_MODEL_OPTIONS.find((o) => o.value === transactionModel)?.description}
            </p>

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
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => step === 'details' && !selectedTemplateId ? setStep('source') : onOpenChange(false)}
                disabled={isSubmitting}
              >
                {step === 'details' && !selectedTemplateId ? 'Back' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isSubmitting || !name.trim() || !lifeArea}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Policy
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

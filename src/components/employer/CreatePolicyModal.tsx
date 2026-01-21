/**
 * Create Policy Modal
 * 
 * Modal dialog for creating new policies with:
 * - Policy Name
 * - Benefit Key (linked to benefits table)
 * - Life Area
 * - Benefit Type
 * - Transaction Model
 * - Effective Dates
 */

import { useState } from 'react';
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
import { Loader2, FileText, CalendarDays } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
import { useQueryClient } from '@tanstack/react-query';
import { useAuditLog } from '@/hooks/useAuditLog';

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

  const handleBenefitChange = (benefitId: string) => {
    setBenefitKey(benefitId);
    const benefit = benefits.find(b => b.id === benefitId);
    if (benefit) {
      setName(benefit.name + ' Policy');
      setLifeArea(benefit.life_area || '');
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
          content_json: DEFAULT_POLICY_CONTENT,
          logic_json: {
            ...DEFAULT_POLICY_LOGIC,
            transaction_model: transactionModel,
          },
        } as any)
        .select()
        .single()) as any;

      if (versionError) throw versionError;

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
        },
      });

      toast.success('Policy created', {
        description: `${policy.title} has been created as Draft v1.`,
      });

      // Reset form
      setName('');
      setBenefitKey('');
      setLifeArea('');
      setBenefitType('allowance');
      setTransactionModel('claim_only');
      setEffectiveFrom('');
      setEffectiveTo('');

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
                Define a new benefit policy for your organization
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Benefit Key (optional, links to benefits table) */}
          <div className="space-y-2">
            <Label htmlFor="benefitKey">
              Link to Benefit Category
            </Label>
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
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim() || !lifeArea}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Policy
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

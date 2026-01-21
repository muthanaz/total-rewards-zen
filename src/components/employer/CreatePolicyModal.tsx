/**
 * Create Policy Modal
 * 
 * Modal dialog for creating new policies with:
 * - Policy Name
 * - Life Area
 * - Benefit Type
 * - Transaction Model
 * - Effective Start Date (optional)
 * - Owner (optional)
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
import { Loader2, FileText, CalendarDays, User } from 'lucide-react';
import { useCreatePolicy } from '@/hooks/usePolicyEngine';
import {
  BENEFIT_TYPE_OPTIONS,
  TRANSACTION_MODEL_OPTIONS,
  BenefitPolicyType,
  TransactionModel,
} from '@/lib/policyEngine';
import { LIFE_AREA_LABELS } from '@/lib/constants';

interface CreatePolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onCreated?: (policyId: string) => void;
}

export function CreatePolicyModal({
  open,
  onOpenChange,
  organizationId,
  onCreated,
}: CreatePolicyModalProps) {
  const [name, setName] = useState('');
  const [lifeArea, setLifeArea] = useState('');
  const [benefitType, setBenefitType] = useState<BenefitPolicyType>('allowance');
  const [transactionModel, setTransactionModel] = useState<TransactionModel>('claim_only');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [ownerId, setOwnerId] = useState('');

  const createPolicy = useCreatePolicy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !lifeArea) {
      return;
    }

    try {
      const result = await createPolicy.mutateAsync({
        organizationId,
        name: name.trim(),
        lifeArea,
        benefitType,
        transactionModel,
        effectiveFrom: effectiveFrom || undefined,
        ownerId: ownerId || undefined,
      });

      // Reset form
      setName('');
      setLifeArea('');
      setBenefitType('allowance');
      setTransactionModel('claim_only');
      setEffectiveFrom('');
      setOwnerId('');

      onOpenChange(false);
      onCreated?.(result.policy.id);
    } catch (error) {
      console.error('Failed to create policy:', error);
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
                    <div className="flex flex-col">
                      <span>{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {TRANSACTION_MODEL_OPTIONS.find((o) => o.value === transactionModel)?.description}
            </p>
          </div>

          {/* Optional Fields */}
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
              <Label htmlFor="owner" className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Owner (optional)
              </Label>
              <Input
                id="owner"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                placeholder="User ID or email"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createPolicy.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPolicy.isPending || !name.trim() || !lifeArea}>
              {createPolicy.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Policy
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Employee Create Request Sheet
 * 
 * Modal/drawer for creating new claims, requests, or questions.
 * Integrates with policy engine for eligibility, limits, and required docs validation.
 * 
 * Supports enforcement modes:
 * - soft (default): allow submit but flag non-compliant
 * - strict: block submit on policy violations
 */

import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Receipt, 
  FileText, 
  HelpCircle, 
  Send,
  AlertCircle,
  Info,
  Loader2,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react';
import { 
  usePolicyForCategory, 
  useEmployeeContext, 
  useEmployeeUtilization,
  useSubmissionValidation,
  usePolicyDrivenSubmission,
} from '@/hooks/usePolicyDrivenSubmission';
import { useCurrentOrgEnforcementMode } from '@/hooks/useEnforcementMode';
import { PolicyValidationBanner } from '@/components/employee/PolicyValidationBanner';
import { cn } from '@/lib/utils';

interface EmployeeCreateRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: 'claim' | 'request' | 'question';
  initialCategory?: string;
  initialTitle?: string;
  initialDescription?: string;
}

const categories = [
  'Health Insurance',
  'Housing',
  'Education Allowance',
  'Transport',
  'Learning & Development',
  'Wellbeing',
  'Leave',
  'Per Diem',
  'Financial',
  'Other',
];

const typeConfig = {
  claim: {
    icon: Receipt,
    title: 'Submit a Claim',
    description: 'Request reimbursement for eligible expenses. Receipts required.',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
  },
  request: {
    icon: FileText,
    title: 'Make a Request',
    description: 'Request approvals, allowances, or policy exceptions.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  question: {
    icon: HelpCircle,
    title: 'Ask a Question',
    description: 'Get clarification on policies or eligibility. No documents needed.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
};

export function EmployeeCreateRequestSheet({
  open,
  onOpenChange,
  initialType,
  initialCategory,
  initialTitle,
  initialDescription,
}: EmployeeCreateRequestSheetProps) {
  const [type, setType] = useState<'claim' | 'request' | 'question'>(initialType || 'claim');
  const [category, setCategory] = useState(initialCategory || '');
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [amount, setAmount] = useState('');
  const [priority, setPriority] = useState<'low' | 'standard' | 'high' | 'urgent'>('standard');
  
  // Policy-driven hooks
  const { data: policy, isLoading: policyLoading } = usePolicyForCategory(category || null);
  const { data: employeeContext } = useEmployeeContext();
  const { data: utilization = 0 } = useEmployeeUtilization(policy?.policyId || null);
  
  // Enforcement mode - org level (can be overridden by policy)
  const { data: orgEnforcementMode = 'soft', isLoading: enforcementLoading } = useCurrentOrgEnforcementMode();
  
  // Check for policy-level override
  const effectiveEnforcementMode = useMemo(() => {
    if (policy?.workflow && 'enforcement_mode' in policy.workflow) {
      const policyMode = (policy.workflow as any).enforcement_mode;
      if (policyMode === 'soft' || policyMode === 'strict') {
        return policyMode;
      }
    }
    return orgEnforcementMode;
  }, [policy, orgEnforcementMode]);
  
  const isStrictMode = effectiveEnforcementMode === 'strict';
  
  const parsedAmount = amount ? parseFloat(amount) : null;
  
  const validation = useSubmissionValidation(
    policy,
    employeeContext,
    type,
    parsedAmount,
    utilization
  );
  
  const submitRequest = usePolicyDrivenSubmission();
  
  const resetForm = () => {
    setType(initialType || 'claim');
    setCategory(initialCategory || '');
    setTitle(initialTitle || '');
    setDescription(initialDescription || '');
    setAmount('');
    setPriority('standard');
  };
  
  const handleSubmit = async () => {
    if (!category || !title) return;
    
    // In strict mode, blockers prevent submission
    if (isStrictMode && validation.blockers.length > 0 && type !== 'question') {
      return;
    }
    
    await submitRequest.mutateAsync({
      params: {
        type,
        category,
        title,
        description,
        amount: parsedAmount || undefined,
        priority,
      },
      policy: policy || null,
      validation,
      employeeContext,
      enforcementMode: effectiveEnforcementMode,
    });
    
    resetForm();
    onOpenChange(false);
  };
  
  // Apply initial values when sheet opens
  useEffect(() => {
    if (open) {
      if (initialType && initialType !== type) setType(initialType);
      if (initialCategory && initialCategory !== category) setCategory(initialCategory);
      if (initialTitle && initialTitle !== title) setTitle(initialTitle);
      if (initialDescription && initialDescription !== description) setDescription(initialDescription);
    }
  }, [open, initialType, initialCategory, initialTitle, initialDescription]);
  
  // Get applicable required docs from policy
  const policyRequiredDocs = policy?.requiredDocs.filter(d => 
    d.is_required && (d.transaction_type === type || d.transaction_type === 'both')
  ) || [];
  
  // Determine the expected transaction type based on policy
  const getTransactionLabel = () => {
    if (!policy) return type === 'claim' ? 'Claim' : type === 'request' ? 'Request' : 'Question';
    
    switch (policy.transactionModel) {
      case 'request_only': return 'Request';
      case 'claim_only': return 'Claim';
      case 'hybrid': return type === 'claim' ? 'Claim' : 'Request';
      default: return 'Claim';
    }
  };
  
  const TypeIcon = typeConfig[type].icon;
  
  // In soft mode: can submit even with blockers (will be flagged)
  // In strict mode: blockers prevent submission
  const canSubmit = category && title && (
    type === 'question' || 
    (isStrictMode ? validation.canSubmit : true)
  );
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", typeConfig[type].bgColor)}>
              <TypeIcon className={cn("h-5 w-5", typeConfig[type].color)} />
            </div>
            {typeConfig[type].title}
          </SheetTitle>
          <SheetDescription>{typeConfig[type].description}</SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 space-y-6 py-6 overflow-y-auto">
          {/* Request Type Selection */}
          <div className="space-y-3">
            <Label>What would you like to do?</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as 'claim' | 'request' | 'question')}
              className="grid grid-cols-3 gap-3"
            >
              {(['claim', 'request', 'question'] as const).map((t) => {
                const config = typeConfig[t];
                const Icon = config.icon;
                return (
                  <Label
                    key={t}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      type === t 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    <RadioGroupItem value={t} className="sr-only" />
                    <Icon className={cn("h-5 w-5", config.color)} />
                    <span className="text-xs font-medium capitalize">{t}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Policy badge */}
            {category && !policyLoading && policy && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  Policy: {policy.policyRef}
                </Badge>
                {policy.transactionModel !== 'claim_only' && (
                  <Badge variant="secondary" className="text-xs">
                    {policy.transactionModel === 'request_only' ? 'Pre-Approval Required' : 'Request + Settlement'}
                  </Badge>
                )}
              </div>
            )}
            {category && policyLoading && (
              <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking policy...
              </div>
            )}
          </div>
          
          {/* Policy Validation Banner */}
          {category && type !== 'question' && (
            <PolicyValidationBanner
              validation={validation}
              policy={policy}
              isLoading={policyLoading}
              transactionType={type}
            />
          )}
          
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of your request"
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Details</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional context to help HR process your request faster..."
              rows={4}
            />
          </div>
          
          {/* Amount (for claims only) */}
          {type === 'claim' && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (AED)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              {/* Show limit info if policy has caps */}
              {policy?.limits.annual_cap && (
                <p className="text-xs text-muted-foreground">
                  Annual limit: {policy.limits.annual_cap.toLocaleString()} {policy.limits.annual_cap_currency}
                  {utilization > 0 && (
                    <> · Used: {utilization.toLocaleString()} · Remaining: {(policy.limits.annual_cap - utilization).toLocaleString()}</>
                  )}
                </p>
              )}
              {policy?.limits.per_transaction_cap && (
                <p className="text-xs text-muted-foreground">
                  Max per claim: {policy.limits.per_transaction_cap.toLocaleString()} {policy.limits.annual_cap_currency}
                </p>
              )}
            </div>
          )}
          
          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Required Documents Preview - from policy */}
          {type !== 'question' && policyRequiredDocs.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Documents Required by Policy</Label>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    You'll need to upload these documents after submitting:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {policyRequiredDocs.map((doc) => (
                      <Badge key={doc.id} variant="outline" className="text-xs">
                        {doc.doc_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* SLA Info - from policy or defaults */}
          <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Expected Response Time</p>
              {policy?.slaDays ? (
                <p>This {getTransactionLabel().toLowerCase()} will be processed within {policy.slaDays} business day{policy.slaDays > 1 ? 's' : ''}.</p>
              ) : (
                <>
                  {type === 'question' && <p>Questions are typically answered within 2 business days.</p>}
                  {type === 'claim' && <p>Claims are processed within 3 business days after all documents are provided.</p>}
                  {type === 'request' && <p>Requests are reviewed within 4 business days.</p>}
                </>
              )}
            </div>
          </div>
        </div>
        
        <SheetFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit || submitRequest.isPending}
            className="gap-2"
          >
            {submitRequest.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitRequest.isPending ? 'Submitting...' : `Submit ${getTransactionLabel()}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

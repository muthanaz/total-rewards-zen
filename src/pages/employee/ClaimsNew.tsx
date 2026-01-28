/**
 * Employee Health Claim Submission Wizard (3-step)
 * 
 * Step 1: What are you claiming?
 * Step 2: Eligibility & estimate
 * Step 3: Documents
 * 
 * Routes: /employee/requests/new
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MultiStepProgress } from '@/components/ui/multi-step-progress';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  Upload,
  FileText,
  Info,
} from 'lucide-react';
import { Currency } from '@/components/ui/Currency';
import {
  usePolicyForCategory,
  useEmployeeContext,
  useEmployeeUtilization,
  useSubmissionValidation,
  usePolicyDrivenSubmission,
} from '@/hooks/usePolicyDrivenSubmission';
import { useCurrentOrgEnforcementMode } from '@/hooks/useEnforcementMode';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

const WIZARD_STEPS = [
  { id: 'claim-details', label: 'Claim Details', labelAr: 'تفاصيل المطالبة' },
  { id: 'eligibility', label: 'Eligibility', labelAr: 'الأهلية' },
  { id: 'documents', label: 'Documents', labelAr: 'المستندات' },
];

const CLAIM_TYPES = [
  { value: 'outpatient', label: 'Outpatient Consultation' },
  { value: 'pharmacy', label: 'Pharmacy / Medication' },
  { value: 'dental', label: 'Dental Treatment' },
  { value: 'vision', label: 'Vision / Optical' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'other', label: 'Other Medical Expense' },
];

const COUNTRIES = [
  { value: 'AE', label: 'UAE' },
  { value: 'IN', label: 'India' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'OTHER', label: 'Other' },
];

interface ClaimFormData {
  claimType: string;
  serviceDate: string;
  providerName: string;
  country: string;
  amountPaid: string;
  currency: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClaimsNewWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ClaimFormData>({
    claimType: '',
    serviceDate: '',
    providerName: '',
    country: 'AE',
    amountPaid: '',
    currency: 'AED',
  });
  
  // Fixed category for health vertical slice
  const category = 'Health Insurance';
  
  // Policy hooks
  const { data: policy, isLoading: policyLoading } = usePolicyForCategory(category);
  const { data: employeeContext } = useEmployeeContext();
  const { data: utilization = 0 } = useEmployeeUtilization(policy?.policyId || null);
  const { data: orgEnforcementMode = 'soft' } = useCurrentOrgEnforcementMode();
  const submitMutation = usePolicyDrivenSubmission();
  
  const parsedAmount = formData.amountPaid ? parseFloat(formData.amountPaid) : null;
  
  // Validation
  const validation = useSubmissionValidation(
    policy,
    employeeContext,
    'claim',
    parsedAmount,
    utilization
  );
  
  // Enforcement mode
  const effectiveEnforcementMode = useMemo(() => {
    if (policy?.workflow && 'enforcement_mode' in policy.workflow) {
      const policyMode = (policy.workflow as any).enforcement_mode;
      if (policyMode === 'soft' || policyMode === 'strict') return policyMode;
    }
    return orgEnforcementMode;
  }, [policy, orgEnforcementMode]);
  
  const isStrictMode = effectiveEnforcementMode === 'strict';
  
  // Required docs from policy
  const requiredDocs = useMemo(() => {
    return policy?.requiredDocs.filter(d => 
      d.is_required && (d.transaction_type === 'claim' || d.transaction_type === 'both')
    ) || [];
  }, [policy]);
  
  // Estimate reliability
  const estimateReliability = useMemo(() => {
    if (!policy) return { level: 'low' as const, reason: 'No policy found' };
    if (!employeeContext?.grade) return { level: 'low' as const, reason: 'Missing grade data' };
    if (!parsedAmount) return { level: 'low' as const, reason: 'Enter claim amount' };
    
    const hasLimits = policy.limits.annual_cap != null;
    const hasUtilization = utilization >= 0;
    
    if (hasLimits && hasUtilization) {
      return { level: 'high' as const, reason: null };
    }
    if (hasLimits || hasUtilization) {
      return { level: 'medium' as const, reason: null };
    }
    return { level: 'low' as const, reason: 'Missing entitlement data' };
  }, [policy, employeeContext, parsedAmount, utilization]);
  
  // Calculate estimated payable
  const estimatedPayable = useMemo(() => {
    if (!parsedAmount) return null;
    if (!policy?.limits.annual_cap) return parsedAmount;
    
    const remaining = Math.max(0, policy.limits.annual_cap - utilization);
    return Math.min(parsedAmount, remaining);
  }, [parsedAmount, policy, utilization]);
  
  // Step validation
  const canProceedStep1 = formData.claimType && formData.serviceDate && formData.providerName && parsedAmount;
  const canProceedStep2 = isStrictMode ? validation.canSubmit : true;
  const canSubmit = isStrictMode ? validation.blockers.length === 0 : true;
  
  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/employee/requests');
    }
  };
  
  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    try {
      const result = await submitMutation.mutateAsync({
        params: {
          type: 'claim',
          category,
          title: `${CLAIM_TYPES.find(t => t.value === formData.claimType)?.label || 'Health'} - ${formData.providerName}`,
          description: `Service date: ${formData.serviceDate}, Country: ${formData.country}`,
          amount: parsedAmount || undefined,
          priority: 'standard',
        },
        policy: policy || null,
        validation,
        employeeContext,
        enforcementMode: effectiveEnforcementMode,
      });
      
      navigate(`/employee/requests/${result.id}?submitted=true`);
    } catch (error) {
      // Error handling is in the mutation
    }
  };
  
  // Loading skeleton
  if (policyLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Health Claim</h1>
          <p className="text-sm text-muted-foreground">
            Most claims take less than 2 minutes if documents are ready.
          </p>
        </div>
      </div>
      
      {/* Progress */}
      <MultiStepProgress
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        orientation="horizontal"
        allowClickPrevious
        onStepClick={setCurrentStep}
      />
      
      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {/* Step 1: Claim Details */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="text-lg mb-1">What are you claiming?</CardTitle>
                <CardDescription>Enter the details of your health expense.</CardDescription>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claimType">Claim Type *</Label>
                  <Select 
                    value={formData.claimType} 
                    onValueChange={(v) => setFormData(f => ({ ...f, claimType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CLAIM_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serviceDate">Service Date *</Label>
                  <Input
                    id="serviceDate"
                    type="date"
                    value={formData.serviceDate}
                    onChange={(e) => setFormData(f => ({ ...f, serviceDate: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="providerName">Provider Name *</Label>
                  <Input
                    id="providerName"
                    value={formData.providerName}
                    onChange={(e) => setFormData(f => ({ ...f, providerName: e.target.value }))}
                    placeholder="Hospital, clinic, or pharmacy name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select 
                    value={formData.country} 
                    onValueChange={(v) => setFormData(f => ({ ...f, country: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amountPaid">Amount Paid *</Label>
                  <div className="relative">
                    <Input
                      id="amountPaid"
                      type="number"
                      value={formData.amountPaid}
                      onChange={(e) => setFormData(f => ({ ...f, amountPaid: e.target.value }))}
                      placeholder="0"
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      AED
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Policy badge */}
              {policy && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle className="h-3 w-3 text-success" />
                    Policy: {policy.policyRef}
                  </Badge>
                </div>
              )}
            </div>
          )}
          
          {/* Step 2: Eligibility & Estimate */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="text-lg mb-1">Eligibility & Estimate</CardTitle>
                <CardDescription>Review your coverage and estimated reimbursement.</CardDescription>
              </div>
              
              {/* 4 KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="h-full min-h-[100px]">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <span className="text-xs text-muted-foreground">Annual Limit</span>
                    <span className="text-lg font-semibold tabular-nums">
                      {policy?.limits.annual_cap 
                        ? <Currency amount={policy.limits.annual_cap} size="lg" /> 
                        : '—'}
                    </span>
                  </CardContent>
                </Card>
                
                <Card className="h-full min-h-[100px]">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <span className="text-xs text-muted-foreground">Used So Far</span>
                    <span className="text-lg font-semibold tabular-nums">
                      <Currency amount={utilization} size="lg" />
                    </span>
                  </CardContent>
                </Card>
                
                <Card className="h-full min-h-[100px]">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <span className="text-xs text-muted-foreground">Remaining</span>
                    <span className="text-lg font-semibold tabular-nums text-success">
                      {policy?.limits.annual_cap 
                        ? <Currency amount={Math.max(0, policy.limits.annual_cap - utilization)} size="lg" />
                        : '—'}
                    </span>
                  </CardContent>
                </Card>
                
                <Card className="h-full min-h-[100px] border-primary/50 bg-primary/5">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Estimated Payable</span>
                      {estimateReliability.level !== 'low' && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {estimateReliability.level === 'high' ? 'High' : 'Medium'}
                        </Badge>
                      )}
                    </div>
                    {estimateReliability.level === 'low' ? (
                      <span className="text-sm text-muted-foreground">
                        Unavailable — {estimateReliability.reason}
                      </span>
                    ) : (
                      <span className="text-lg font-semibold tabular-nums text-primary">
                        <Currency amount={estimatedPayable || 0} size="lg" />
                      </span>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* What affects estimate */}
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                  What affects this estimate?
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 p-4 rounded-lg bg-muted/50 text-sm space-y-2">
                  <p>• Your grade-based annual limit</p>
                  <p>• Prior approved claims this year</p>
                  <p>• Co-payment rules (if applicable)</p>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    Final payable may change after HR review.
                  </p>
                </CollapsibleContent>
              </Collapsible>
              
              {/* Validation warnings/blockers */}
              {validation.blockers.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cannot submit:</strong> {validation.blockers[0].message}
                    {validation.blockers[0].details && (
                      <span className="block text-sm mt-1">{validation.blockers[0].details}</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              {validation.warnings.length > 0 && !validation.blockers.length && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {validation.warnings[0].message}
                    {isStrictMode && <span className="block text-sm mt-1">This may delay processing.</span>}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          {/* Step 3: Documents */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="text-lg mb-1">Required Documents</CardTitle>
                <CardDescription>
                  Upload the required documents to support your claim.
                </CardDescription>
              </div>
              
              {requiredDocs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No documents required for this claim type.</p>
                  <p className="text-sm">You can submit immediately.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requiredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-lg border flex items-center justify-between gap-4 bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{doc.doc_name}</p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground">{doc.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.is_required ? 'default' : 'outline'} className="text-xs">
                          {doc.is_required ? 'Required' : 'Optional'}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-amber-600 bg-amber-500/10">
                          Missing
                        </Badge>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Upload className="h-3.5 w-3.5" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Soft mode warning */}
              {requiredDocs.length > 0 && !isStrictMode && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You can submit now and upload documents later. However, your claim won't be processed until all required documents are provided.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Strict mode blocker */}
              {requiredDocs.length > 0 && isStrictMode && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    All required documents must be uploaded before submission.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        
        {currentStep < WIZARD_STEPS.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={currentStep === 0 && !canProceedStep1}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitMutation.isPending || (isStrictMode && requiredDocs.length > 0)}
          >
            {submitMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {submitMutation.isPending ? 'Submitting...' : 'Submit Claim'}
          </Button>
        )}
      </div>
    </div>
  );
}

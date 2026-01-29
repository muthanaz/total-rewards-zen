/**
 * Universal Claim/Request Wizard
 * 
 * A single 5-step wizard supporting all benefit categories:
 * 1. Category Selection (pre-filled if coming from benefit page)
 * 2. Details (dynamic fields per policy template)
 * 3. Estimate & Rules (cap/remaining/estimate reliability)
 * 4. Documents (checklist from policy logic_json)
 * 5. Review & Submit
 * 
 * Transaction model rules:
 * - claim_only: Direct claim submission
 * - request_only: Pre-approval request (e.g., housing advance)
 * - request_and_claim: Request first, claim after approval
 * 
 * Enforcement modes:
 * - soft: Allow submit with missing docs
 * - strict: Block submit until required docs uploaded
 * 
 * Route: /employee/requests/new
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MultiStepProgress } from '@/components/ui/multi-step-progress';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BenefitCategoryKey } from '@/lib/benefitCategories';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';
import { useCurrentOrgEnforcementMode } from '@/hooks/useEnforcementMode';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  WizardStepCategory,
  WizardStepDetails,
  WizardStepEstimate,
  WizardStepDocuments,
  WizardStepSubmit,
  type ClaimDetailsData,
} from '@/components/employee/wizard';

// ============================================================================
// CONSTANTS
// ============================================================================

const WIZARD_STEPS = [
  { id: 'category', label: 'Benefit', labelAr: 'المنفعة' },
  { id: 'details', label: 'Details', labelAr: 'التفاصيل' },
  { id: 'estimate', label: 'Estimate', labelAr: 'التقدير' },
  { id: 'documents', label: 'Documents', labelAr: 'المستندات' },
  { id: 'submit', label: 'Submit', labelAr: 'إرسال' },
];

interface UploadedDoc {
  docType: string;
  fileName: string;
  uploaded: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UniversalRequestWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  // Get pre-selected category from URL
  const preSelectedCategory = searchParams.get('category') as BenefitCategoryKey | null;
  const preSelectedType = searchParams.get('type') as 'request' | 'claim' | null;

  // State
  const [currentStep, setCurrentStep] = useState(preSelectedCategory ? 1 : 0);
  const [selectedCategory, setSelectedCategory] = useState<BenefitCategoryKey | null>(
    preSelectedCategory
  );
  const [details, setDetails] = useState<ClaimDetailsData>({
    subType: '',
    serviceDate: '',
    providerName: '',
    country: 'AE',
    amount: '',
    description: '',
  });
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch policy data when category selected
  const { data: policyData, isLoading: policyLoading } = useBenefitPolicy(selectedCategory);
  const { data: orgEnforcementMode = 'soft' } = useCurrentOrgEnforcementMode();

  // Derived values
  const transactionModel = policyData?.transactionModel || 'claim_only';
  const isRequest = 
    preSelectedType === 'request' || 
    transactionModel === 'request_only' ||
    (transactionModel === 'request_and_claim' && !preSelectedType);
  
  const effectiveEnforcementMode = orgEnforcementMode;
  const isStrictMode = effectiveEnforcementMode === 'strict';
  
  const parsedAmount = details.amount ? parseFloat(details.amount) : null;

  // Required docs from policy
  const requiredDocs = useMemo(() => {
    return policyData?.requiredDocs || [];
  }, [policyData]);

  // Validation
  const blockers = useMemo(() => {
    const result: { message: string; details?: string }[] = [];
    
    if (!policyData?.hasPolicyPublished && selectedCategory) {
      result.push({ message: 'No published policy found for this benefit.' });
    }
    
    return result;
  }, [policyData, selectedCategory]);

  const warnings = useMemo(() => {
    const result: { message: string }[] = [];
    
    if (parsedAmount && policyData?.annualCap) {
      const remaining = Math.max(0, policyData.annualCap - (policyData.entitlement?.utilized || 0));
      if (parsedAmount > remaining) {
        result.push({ message: `Claim exceeds remaining allowance (AED ${remaining.toLocaleString()}).` });
      }
    }
    
    return result;
  }, [parsedAmount, policyData]);

  // Estimated payable
  const estimatedPayable = useMemo(() => {
    if (!parsedAmount || isRequest) return null;
    if (!policyData?.annualCap) return parsedAmount;
    
    const remaining = Math.max(0, policyData.annualCap - (policyData.entitlement?.utilized || 0));
    return Math.min(parsedAmount, remaining);
  }, [parsedAmount, policyData, isRequest]);

  // Step validation
  const canProceedStep = useMemo(() => {
    switch (currentStep) {
      case 0: // Category
        return !!selectedCategory;
      case 1: // Details
        return details.serviceDate && (isRequest || details.subType);
      case 2: // Estimate
        return blockers.length === 0;
      case 3: // Documents
        if (!isStrictMode) return true;
        const applicableDocs = requiredDocs.filter(
          (d) => d.transaction_type === (isRequest ? 'request' : 'claim') || d.transaction_type === 'both'
        );
        const requiredMissing = applicableDocs.filter(
          (d) => d.is_required && !uploadedDocs.some((u) => u.docType === d.doc_type && u.uploaded)
        );
        return requiredMissing.length === 0;
      case 4: // Submit
        return true;
      default:
        return false;
    }
  }, [currentStep, selectedCategory, details, blockers, isStrictMode, requiredDocs, uploadedDocs, isRequest]);

  // Navigation
  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Skip category step if pre-selected
      if (currentStep === 1 && preSelectedCategory) {
        navigate(-1);
      } else {
        setCurrentStep(currentStep - 1);
      }
    } else {
      navigate('/employee/requests');
    }
  };

  const handleCategorySelect = (category: BenefitCategoryKey) => {
    setSelectedCategory(category);
    // Auto-advance after selection
    setTimeout(() => setCurrentStep(1), 150);
  };

  const handleDocUpload = (docType: string, fileName: string) => {
    setUploadedDocs((prev) => {
      const existing = prev.findIndex((d) => d.docType === docType);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { docType, fileName, uploaded: true };
        return updated;
      }
      return [...prev, { docType, fileName, uploaded: true }];
    });
  };

  // Submit
  const handleSubmit = async () => {
    if (!selectedCategory || !user?.id) return;
    
    setIsSubmitting(true);
    
    try {
      // Get user's org
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Create request
      const { data: request, error } = await supabase
        .from('requests')
        .insert({
          user_id: user.id,
          organization_id: profile?.organization_id,
          request_type: isRequest ? 'request' : 'claim',
          category: selectedCategory,
          subject: `${isRequest ? 'Request' : 'Claim'} - ${selectedCategory}`,
          description: details.description || `${details.subType} - ${details.serviceDate}`,
          amount: parsedAmount,
          status: 'submitted',
          policy_id: policyData?.policyId,
          sla_hours: 72,
        } as any)
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: isRequest ? 'Request Submitted' : 'Claim Submitted',
        description: `Your ${isRequest ? 'request' : 'claim'} has been submitted successfully.`,
      });

      navigate(`/employee/requests/${request.id}?submitted=true`);
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'An error occurred while submitting.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (policyLoading && selectedCategory) {
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
          <h1 className="text-2xl font-bold tracking-tight">
            {isRequest ? 'New Request' : 'New Claim'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {currentStep === 0 
              ? 'Select a benefit category to get started.'
              : 'Complete all steps to submit your ' + (isRequest ? 'request' : 'claim') + '.'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <MultiStepProgress
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        orientation="horizontal"
        allowClickPrevious
        onStepClick={(step) => {
          // Only allow going back, not forward
          if (step < currentStep) {
            setCurrentStep(step);
          }
        }}
      />

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {/* Step 1: Category */}
          {currentStep === 0 && (
            <WizardStepCategory
              selectedCategory={selectedCategory}
              onSelect={handleCategorySelect}
            />
          )}

          {/* Step 2: Details */}
          {currentStep === 1 && selectedCategory && (
            <WizardStepDetails
              category={selectedCategory}
              transactionModel={transactionModel}
              policyRef={policyData?.policyRef || null}
              data={details}
              onChange={setDetails}
            />
          )}

          {/* Step 3: Estimate */}
          {currentStep === 2 && (
            <WizardStepEstimate
              policyData={policyData || null}
              claimedAmount={parsedAmount}
              isRequest={isRequest}
              blockers={blockers}
              warnings={warnings}
            />
          )}

          {/* Step 4: Documents */}
          {currentStep === 3 && (
            <WizardStepDocuments
              requiredDocs={requiredDocs}
              transactionType={isRequest ? 'request' : 'claim'}
              enforcementMode={effectiveEnforcementMode}
              uploadedDocs={uploadedDocs}
              onUpload={handleDocUpload}
            />
          )}

          {/* Step 5: Submit */}
          {currentStep === 4 && selectedCategory && (
            <WizardStepSubmit
              category={selectedCategory}
              transactionModel={transactionModel}
              policyRef={policyData?.policyRef || null}
              details={details}
              uploadedDocs={uploadedDocs}
              estimatedPayable={estimatedPayable}
              isRequest={isRequest}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep < WIZARD_STEPS.length - 1 ? (
          <Button 
            onClick={handleNext} 
            disabled={!canProceedStep}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || blockers.length > 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit {isRequest ? 'Request' : 'Claim'}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

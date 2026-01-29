/**
 * Wizard Step 2: Claim/Request Details
 * 
 * Dynamic fields vary by category and transaction model.
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BenefitCategoryKey, BENEFIT_CATEGORIES } from '@/lib/benefitCategories';
import { TransactionModel } from '@/lib/policyEngine';
import { CheckCircle } from 'lucide-react';

// Countries for health claims
const COUNTRIES = [
  { value: 'AE', label: 'UAE' },
  { value: 'IN', label: 'India' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'OTHER', label: 'Other' },
];

// Claim sub-types per category
const CLAIM_SUBTYPES: Record<string, { value: string; label: string }[]> = {
  health: [
    { value: 'outpatient', label: 'Outpatient Consultation' },
    { value: 'pharmacy', label: 'Pharmacy / Medication' },
    { value: 'dental', label: 'Dental Treatment' },
    { value: 'vision', label: 'Vision / Optical' },
    { value: 'maternity', label: 'Maternity' },
    { value: 'other', label: 'Other Medical Expense' },
  ],
  wellbeing: [
    { value: 'gym', label: 'Gym Membership' },
    { value: 'fitness', label: 'Fitness Classes' },
    { value: 'mental_health', label: 'Mental Health Services' },
    { value: 'nutrition', label: 'Nutrition Counseling' },
    { value: 'other', label: 'Other Wellbeing Expense' },
  ],
  learning: [
    { value: 'course', label: 'Course / Training' },
    { value: 'certification', label: 'Professional Certification' },
    { value: 'conference', label: 'Conference / Workshop' },
    { value: 'books', label: 'Books & Materials' },
    { value: 'other', label: 'Other L&D Expense' },
  ],
  schooling: [
    { value: 'tuition', label: 'School Tuition' },
    { value: 'registration', label: 'Registration Fees' },
    { value: 'uniforms', label: 'Uniforms & Books' },
    { value: 'transport', label: 'School Transport' },
    { value: 'other', label: 'Other Education Expense' },
  ],
  transport: [
    { value: 'fuel', label: 'Fuel Reimbursement' },
    { value: 'parking', label: 'Parking Pass' },
    { value: 'flight', label: 'Annual Flight Ticket' },
    { value: 'other', label: 'Other Transport Expense' },
  ],
  housing: [
    { value: 'advance', label: 'Housing Advance Request' },
    { value: 'relocation', label: 'Relocation Expense' },
    { value: 'other', label: 'Other Housing Request' },
  ],
  financial: [
    { value: 'information', label: 'Information Request' },
  ],
};

export interface ClaimDetailsData {
  subType: string;
  serviceDate: string;
  providerName: string;
  country: string;
  amount: string;
  description: string;
  dependentName?: string;
}

interface WizardStepDetailsProps {
  category: BenefitCategoryKey;
  transactionModel: TransactionModel;
  policyRef: string | null;
  data: ClaimDetailsData;
  onChange: (data: ClaimDetailsData) => void;
}

export function WizardStepDetails({ 
  category, 
  transactionModel,
  policyRef,
  data, 
  onChange 
}: WizardStepDetailsProps) {
  const categoryInfo = BENEFIT_CATEGORIES[category];
  const subtypes = CLAIM_SUBTYPES[category] || [];
  const isRequest = transactionModel === 'request_only';
  const isHybrid = transactionModel === 'request_and_claim';
  const showAmount = !isRequest || isHybrid;
  const showProvider = ['health', 'wellbeing', 'learning'].includes(category);
  const showCountry = category === 'health';
  const showDependent = ['schooling', 'health'].includes(category);

  const update = (field: keyof ClaimDetailsData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">
          {isRequest ? 'Request Details' : 'Claim Details'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter the details of your {isRequest ? 'request' : 'expense'}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sub-type */}
        {subtypes.length > 0 && (
          <div className="space-y-2">
            <Label>{isRequest ? 'Request Type' : 'Expense Type'} *</Label>
            <Select value={data.subType} onValueChange={(v) => update('subType', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {subtypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Service Date */}
        <div className="space-y-2">
          <Label>{isRequest ? 'Request Date' : 'Service Date'} *</Label>
          <Input
            type="date"
            value={data.serviceDate}
            onChange={(e) => update('serviceDate', e.target.value)}
            max={isRequest ? undefined : new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Provider Name */}
        {showProvider && (
          <div className="space-y-2">
            <Label>Provider Name *</Label>
            <Input
              value={data.providerName}
              onChange={(e) => update('providerName', e.target.value)}
              placeholder={
                category === 'health' ? 'Hospital, clinic, or pharmacy' :
                category === 'learning' ? 'Training provider or institution' :
                'Service provider name'
              }
            />
          </div>
        )}

        {/* Country */}
        {showCountry && (
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={data.country} onValueChange={(v) => update('country', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Dependent Name */}
        {showDependent && (
          <div className="space-y-2">
            <Label>Dependent Name (if applicable)</Label>
            <Input
              value={data.dependentName || ''}
              onChange={(e) => update('dependentName', e.target.value)}
              placeholder="Child or spouse name"
            />
          </div>
        )}

        {/* Amount */}
        {showAmount && (
          <div className="space-y-2">
            <Label>Amount {isHybrid ? '(Estimated)' : '*'}</Label>
            <div className="relative">
              <Input
                type="number"
                value={data.amount}
                onChange={(e) => update('amount', e.target.value)}
                placeholder="0"
                className="pr-16"
                min="0"
                step="0.01"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                AED
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description / Notes</Label>
        <Textarea
          value={data.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder={isRequest 
            ? 'Provide details about your request...' 
            : 'Additional details about the expense...'}
          rows={3}
        />
      </div>

      {/* Policy badge */}
      {policyRef && (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-success" />
            Policy: {policyRef}
          </Badge>
        </div>
      )}
    </div>
  );
}

export default WizardStepDetails;

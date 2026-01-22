/**
 * Missing Data Banner
 * 
 * Shows context-specific banners when key data is missing:
 * - Employee: Friendly banner + "Fix profile" CTA
 * - Employer: Setup checklist + "Complete onboarding" CTA
 * - Executive: Confidence downgrade warning
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  User, 
  Building2, 
  FileText, 
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Missing data field definitions
export interface MissingDataField {
  id: string;
  label: string;
  category: 'profile' | 'entitlement' | 'policy' | 'integration';
  impact: 'high' | 'medium' | 'low';
  impactDescription: string;
  fixPath?: string;
  fixLabel?: string;
}

export const REQUIRED_EMPLOYEE_FIELDS: MissingDataField[] = [
  {
    id: 'grade',
    label: 'Job Grade',
    category: 'profile',
    impact: 'high',
    impactDescription: 'Entitlement calculations may be inaccurate',
    fixPath: '/employee/profile',
    fixLabel: 'Update Profile',
  },
  {
    id: 'dependents',
    label: 'Dependents Count',
    category: 'profile',
    impact: 'high',
    impactDescription: 'Schooling and health benefits cannot be calculated',
    fixPath: '/employee/profile#dependents',
    fixLabel: 'Add Dependents',
  },
  {
    id: 'location',
    label: 'Work Location',
    category: 'profile',
    impact: 'medium',
    impactDescription: 'Transport and housing allowances may use defaults',
    fixPath: '/employee/profile',
    fixLabel: 'Update Location',
  },
  {
    id: 'emirates_id',
    label: 'Emirates ID',
    category: 'profile',
    impact: 'medium',
    impactDescription: 'Some claims may require manual verification',
    fixPath: '/employee/profile#documents',
    fixLabel: 'Upload ID',
  },
  {
    id: 'bank_details',
    label: 'Bank Details',
    category: 'profile',
    impact: 'medium',
    impactDescription: 'Reimbursements may be delayed',
    fixPath: '/employee/profile#bank',
    fixLabel: 'Add Bank Details',
  },
];

export const REQUIRED_EMPLOYER_FIELDS: MissingDataField[] = [
  {
    id: 'policy_config',
    label: 'Policy Configuration',
    category: 'policy',
    impact: 'high',
    impactDescription: 'Eligibility checks may be inaccurate',
    fixPath: '/employer/policies',
    fixLabel: 'Configure Policies',
  },
  {
    id: 'payroll_integration',
    label: 'Payroll Integration',
    category: 'integration',
    impact: 'high',
    impactDescription: 'Salary-based benefits use estimates',
    fixPath: '/employer/integrations',
    fixLabel: 'Connect Payroll',
  },
  {
    id: 'org_structure',
    label: 'Organization Structure',
    category: 'integration',
    impact: 'medium',
    impactDescription: 'Department/grade analytics unavailable',
    fixPath: '/employer/integrations',
    fixLabel: 'Import Structure',
  },
];

interface MissingDataBannerProps {
  /** Which fields are present (by ID) */
  presentFields: string[];
  /** Which fields are required */
  requiredFields?: MissingDataField[];
  /** View context determines messaging style */
  viewContext: 'employee' | 'employer' | 'executive';
  /** Additional className */
  className?: string;
  /** Compact mode for inline use */
  compact?: boolean;
  /** Hide if all fields present */
  hideWhenComplete?: boolean;
}

export function MissingDataBanner({
  presentFields,
  requiredFields,
  viewContext,
  className,
  compact = false,
  hideWhenComplete = true,
}: MissingDataBannerProps) {
  // Use appropriate field set
  const fieldsToCheck = requiredFields || (
    viewContext === 'employee' 
      ? REQUIRED_EMPLOYEE_FIELDS 
      : REQUIRED_EMPLOYER_FIELDS
  );

  // Find missing high-impact fields
  const missingFields = fieldsToCheck.filter(
    field => !presentFields.includes(field.id)
  );
  const highImpactMissing = missingFields.filter(f => f.impact === 'high');
  const mediumImpactMissing = missingFields.filter(f => f.impact === 'medium');

  // Hide if nothing missing
  if (hideWhenComplete && missingFields.length === 0) {
    return null;
  }

  // All complete state
  if (missingFields.length === 0) {
    return (
      <Alert className={cn('border-success/30 bg-success/5', className)}>
        <CheckCircle2 className="h-4 w-4 text-success" />
        <AlertTitle className="text-success">Data Complete</AlertTitle>
        <AlertDescription className="text-success/80">
          All required information is configured. Metrics are fully reliable.
        </AlertDescription>
      </Alert>
    );
  }

  // Employee-specific messaging (friendly)
  if (viewContext === 'employee') {
    return (
      <Alert className={cn(
        highImpactMissing.length > 0 
          ? 'border-warning/30 bg-warning/5' 
          : 'border-info/30 bg-info/5',
        className
      )}>
        <User className={cn(
          'h-4 w-4',
          highImpactMissing.length > 0 ? 'text-warning' : 'text-info'
        )} />
        <AlertTitle>
          {highImpactMissing.length > 0 
            ? 'Complete your profile for accurate benefits' 
            : 'Tip: Add more details'}
        </AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-2">
            {!compact && (
              <p className="text-sm text-muted-foreground">
                {highImpactMissing.length > 0 
                  ? 'Some benefit amounts shown are estimated because key profile information is missing.'
                  : 'Adding these details will improve your benefit recommendations.'}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {missingFields.slice(0, 3).map(field => (
                <Badge 
                  key={field.id} 
                  variant="outline" 
                  className={cn(
                    'text-xs',
                    field.impact === 'high' 
                      ? 'border-warning/40 text-warning' 
                      : 'border-muted-foreground/40'
                  )}
                >
                  {field.label}
                </Badge>
              ))}
              {missingFields.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{missingFields.length - 3} more
                </Badge>
              )}
            </div>
            {highImpactMissing.length > 0 && highImpactMissing[0].fixPath && (
              <Link to={highImpactMissing[0].fixPath}>
                <Button size="sm" variant="outline" className="mt-2 gap-1">
                  {highImpactMissing[0].fixLabel || 'Fix Profile'}
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Employer-specific messaging (setup checklist)
  if (viewContext === 'employer') {
    return (
      <Alert className={cn('border-warning/30 bg-warning/5', className)}>
        <Building2 className="h-4 w-4 text-warning" />
        <AlertTitle>Setup Incomplete</AlertTitle>
        <AlertDescription>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-3">
              Complete these items to ensure accurate analytics:
            </p>
            <div className="space-y-2">
              {missingFields.slice(0, 4).map(field => (
                <div 
                  key={field.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-background/50"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn(
                      'w-3 h-3',
                      field.impact === 'high' ? 'text-warning' : 'text-muted-foreground'
                    )} />
                    <span className="text-sm font-medium">{field.label}</span>
                  </div>
                  {field.fixPath && (
                    <Link to={field.fixPath}>
                      <Button size="sm" variant="ghost" className="h-7 text-xs">
                        {field.fixLabel || 'Configure'}
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Executive view (confidence warning)
  return (
    <Alert className={cn('border-destructive/30 bg-destructive/5', className)}>
      <ShieldAlert className="h-4 w-4 text-destructive" />
      <AlertTitle className="flex items-center gap-2">
        Data Confidence Reduced
        <Badge variant="outline" className="text-xs border-destructive/40 text-destructive">
          {highImpactMissing.length} critical gaps
        </Badge>
      </AlertTitle>
      <AlertDescription>
        <p className="text-sm text-muted-foreground mt-1">
          Some metrics are estimates due to missing data. Recommendations requiring this data are hidden.
        </p>
        {!compact && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {highImpactMissing.map(field => (
              <Badge 
                key={field.id} 
                variant="outline" 
                className="text-xs border-destructive/40 text-destructive"
              >
                {field.label}
              </Badge>
            ))}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Utility to check missing fields from a profile object
export function detectMissingFields(
  profile: Record<string, unknown>,
  fieldsToCheck: MissingDataField[]
): string[] {
  return fieldsToCheck
    .filter(field => !profile[field.id] || profile[field.id] === '')
    .map(field => field.id);
}

// Calculate confidence level based on missing fields
export function calculateConfidenceFromFields(
  presentFields: string[],
  requiredFields: MissingDataField[]
): 'high' | 'medium' | 'low' {
  const missingHigh = requiredFields
    .filter(f => f.impact === 'high' && !presentFields.includes(f.id)).length;
  const missingMedium = requiredFields
    .filter(f => f.impact === 'medium' && !presentFields.includes(f.id)).length;

  if (missingHigh > 0) return 'low';
  if (missingMedium > 1) return 'medium';
  return 'high';
}

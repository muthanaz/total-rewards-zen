/**
 * Employee Directory Types
 * 
 * Privacy-conscious, operational employee directory with benefits focus.
 */

export type EmployeeStatus = 'active' | 'on_leave' | 'probation' | 'offboarding';

export interface DirectoryEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  department: string;
  location: string;
  grade: string;
  status: EmployeeStatus;
  // Operational fields
  openRequestsCount: number;
  missingDocsCount: number;
  eligibilityHighlights: string[];
  // Benefits snapshot data
  utilizationPercent: number;
}

export interface EmployeeEntitlement {
  id: string;
  benefitName: string;
  category: 'health' | 'education' | 'transport' | 'housing' | 'lifestyle' | 'leave';
  annualAllowance: number;
  utilized: number;
  remainingBalance: number;
  utilizationPercent: number;
  expiresAt?: Date;
}

export interface EmployeeRequest {
  id: string;
  type: 'claim' | 'request';
  benefitCategory: string;
  amountAED: number;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'paid';
  submittedAt: Date;
  slaStatus: 'on_track' | 'at_risk' | 'breached';
  missingDocs: string[];
}

export interface EmployeeMissingDoc {
  id: string;
  documentType: string;
  requiredFor: string;
  status: 'not_uploaded' | 'expired' | 'expiring_soon' | 'rejected';
  dueDate?: Date;
}

export interface EmployeeBenefitsSnapshot {
  employee: DirectoryEmployee;
  entitlements: EmployeeEntitlement[];
  openRequests: EmployeeRequest[];
  missingDocs: EmployeeMissingDoc[];
  totalAnnualValue: number;
  totalUtilized: number;
  overallUtilizationPercent: number;
}

// Privacy permission interface
export interface SensitiveDataPermission {
  canViewSalary: boolean;
  reason?: string;
  auditRequired: boolean;
}

export const STATUS_CONFIG: Record<EmployeeStatus, { 
  label: string; 
  className: string;
}> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  on_leave: {
    label: 'On Leave',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  probation: {
    label: 'Probation',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  offboarding: {
    label: 'Offboarding',
    className: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  },
};

export const CATEGORY_ICONS: Record<string, string> = {
  health: 'Heart',
  education: 'GraduationCap',
  transport: 'Car',
  housing: 'Home',
  lifestyle: 'Sparkles',
  leave: 'Calendar',
};

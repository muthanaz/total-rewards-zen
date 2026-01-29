/**
 * Template Definitions for HR Data Imports
 * 
 * Each template includes:
 * - Schema with required/optional fields
 * - Enum values for dropdowns
 * - Format rules
 * - Example data
 */

export interface TemplateField {
  name: string;
  nameAr?: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum' | 'currency';
  format?: string; // e.g., "YYYY-MM-DD", "email"
  enumValues?: string[];
  description: string;
  descriptionAr?: string;
  example: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  category: 'employees' | 'benefits' | 'claims' | 'structure';
  icon: string;
  fields: TemplateField[];
  exampleRows: Record<string, string | number | boolean>[];
  notes: string[];
  notesAr?: string[];
}

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    id: 'employee_master',
    name: 'Employee Master',
    nameAr: 'بيانات الموظفين الرئيسية',
    description: 'Import employee profiles with demographics, grades, and organizational assignments.',
    descriptionAr: 'استيراد ملفات الموظفين مع البيانات الديموغرافية والدرجات والتعيينات التنظيمية.',
    category: 'employees',
    icon: 'Users',
    fields: [
      { name: 'employee_id', required: true, type: 'string', description: 'Unique employee identifier from HRIS', example: 'EMP001' },
      { name: 'first_name', required: true, type: 'string', description: 'Employee first name', example: 'Ahmed' },
      { name: 'last_name', required: true, type: 'string', description: 'Employee last name', example: 'Hassan' },
      { name: 'email', required: true, type: 'string', format: 'email', description: 'Work email address', example: 'ahmed.hassan@company.com' },
      { name: 'department_code', required: true, type: 'string', description: 'Department code (must match org structure)', example: 'ENG' },
      { name: 'grade_code', required: true, type: 'string', description: 'Grade code (must match org grades)', example: 'G5' },
      { name: 'hire_date', required: true, type: 'date', format: 'YYYY-MM-DD', description: 'Employment start date', example: '2022-01-15' },
      { name: 'employment_type', required: true, type: 'enum', enumValues: ['full_time', 'part_time', 'contract', 'intern'], description: 'Type of employment', example: 'full_time' },
      { name: 'location_code', required: false, type: 'string', description: 'Work location code', example: 'DXB-HQ' },
      { name: 'cost_center_code', required: false, type: 'string', description: 'Cost center for budgeting', example: 'CC-ENG-01' },
      { name: 'manager_employee_id', required: false, type: 'string', description: 'Manager\'s employee ID', example: 'EMP100' },
      { name: 'phone', required: false, type: 'string', description: 'Work phone number', example: '+971501234567' },
      { name: 'date_of_birth', required: false, type: 'date', format: 'YYYY-MM-DD', description: 'Birth date for age-based eligibility', example: '1990-05-20' },
      { name: 'nationality', required: false, type: 'string', description: 'Nationality (ISO country code)', example: 'UAE' },
      { name: 'gender', required: false, type: 'enum', enumValues: ['male', 'female', 'other'], description: 'Gender for demographics', example: 'male' },
    ],
    exampleRows: [
      { employee_id: 'EMP001', first_name: 'Ahmed', last_name: 'Hassan', email: 'ahmed.hassan@company.com', department_code: 'ENG', grade_code: 'G5', hire_date: '2022-01-15', employment_type: 'full_time', location_code: 'DXB-HQ', cost_center_code: 'CC-ENG-01', manager_employee_id: 'EMP100', phone: '+971501234567', date_of_birth: '1990-05-20', nationality: 'UAE', gender: 'male' },
      { employee_id: 'EMP002', first_name: 'Sara', last_name: 'Ali', email: 'sara.ali@company.com', department_code: 'HR', grade_code: 'G4', hire_date: '2023-03-20', employment_type: 'full_time', location_code: 'DXB-HQ', cost_center_code: 'CC-HR-01', manager_employee_id: 'EMP101', phone: '+971502345678', date_of_birth: '1992-08-10', nationality: 'UAE', gender: 'female' },
      { employee_id: 'EMP003', first_name: 'Mohammed', last_name: 'Khan', email: 'mohammed.khan@company.com', department_code: 'FIN', grade_code: 'G6', hire_date: '2021-06-01', employment_type: 'full_time', location_code: 'ABU-BR', cost_center_code: 'CC-FIN-01', manager_employee_id: 'EMP100', phone: '+971503456789', date_of_birth: '1988-11-15', nationality: 'PAK', gender: 'male' },
    ],
    notes: [
      'All dates must be in YYYY-MM-DD format (e.g., 2024-01-15)',
      'Department and grade codes must match your configured org structure',
      'Email addresses must be unique across all employees',
      'Employee IDs must be unique and will be used for all future imports',
      'Currency values are in AED unless otherwise specified',
      'Phone numbers should include country code (e.g., +971)',
    ],
  },
  {
    id: 'benefits_catalog',
    name: 'Benefits Catalog',
    nameAr: 'كتالوج المزايا',
    description: 'Define benefit types with eligibility rules by grade.',
    descriptionAr: 'تعريف أنواع المزايا مع قواعد الأهلية حسب الدرجة.',
    category: 'benefits',
    icon: 'Gift',
    fields: [
      { name: 'benefit_code', required: true, type: 'string', description: 'Unique benefit identifier', example: 'MED-001' },
      { name: 'benefit_name', required: true, type: 'string', description: 'Display name for benefit', example: 'Medical Insurance' },
      { name: 'life_area', required: true, type: 'enum', enumValues: ['health', 'housing', 'schooling', 'transport', 'wellbeing', 'learning', 'financial'], description: 'Category of benefit', example: 'health' },
      { name: 'transaction_model', required: true, type: 'enum', enumValues: ['claim_only', 'request_only', 'request_and_claim', 'informational'], description: 'How employees access this benefit', example: 'claim_only' },
      { name: 'grade_code', required: true, type: 'string', description: 'Grade code this rule applies to', example: 'G5' },
      { name: 'is_eligible', required: true, type: 'boolean', description: 'Whether grade is eligible', example: 'true' },
      { name: 'annual_allowance_aed', required: false, type: 'currency', description: 'Annual limit in AED', example: '50000' },
      { name: 'coverage_percent', required: false, type: 'number', description: 'Coverage percentage (0-100)', example: '100' },
      { name: 'max_claim_aed', required: false, type: 'currency', description: 'Maximum per claim in AED', example: '10000' },
      { name: 'waiting_period_days', required: false, type: 'number', description: 'Days before eligible', example: '90' },
      { name: 'requires_approval', required: false, type: 'boolean', description: 'Requires manager approval', example: 'false' },
      { name: 'dependent_coverage', required: false, type: 'enum', enumValues: ['none', 'spouse_only', 'spouse_children', 'full_family'], description: 'Dependent eligibility', example: 'spouse_children' },
    ],
    exampleRows: [
      { benefit_code: 'MED-001', benefit_name: 'Medical Insurance', life_area: 'health', transaction_model: 'claim_only', grade_code: 'G5', is_eligible: true, annual_allowance_aed: 50000, coverage_percent: 100, max_claim_aed: 10000, waiting_period_days: 0, requires_approval: false, dependent_coverage: 'spouse_children' },
      { benefit_code: 'MED-001', benefit_name: 'Medical Insurance', life_area: 'health', transaction_model: 'claim_only', grade_code: 'G4', is_eligible: true, annual_allowance_aed: 40000, coverage_percent: 90, max_claim_aed: 8000, waiting_period_days: 90, requires_approval: false, dependent_coverage: 'spouse_only' },
      { benefit_code: 'EDU-001', benefit_name: 'Education Allowance', life_area: 'schooling', transaction_model: 'request_and_claim', grade_code: 'G5', is_eligible: true, annual_allowance_aed: 30000, coverage_percent: 100, max_claim_aed: 30000, waiting_period_days: 365, requires_approval: true, dependent_coverage: 'none' },
    ],
    notes: [
      'Create one row per grade per benefit to define eligibility matrix',
      'Set is_eligible to "false" if a grade should not receive a benefit',
      'Annual allowance is the maximum claimable per year',
      'Coverage percent applies to claim amounts (100 = full reimbursement)',
      'Transaction model determines how employees interact with the benefit',
      'Waiting period starts from hire date',
    ],
  },
  {
    id: 'entitlements',
    name: 'Employee Entitlements',
    nameAr: 'استحقاقات الموظفين',
    description: 'Import individual employee benefit allocations.',
    descriptionAr: 'استيراد مخصصات المزايا الفردية للموظفين.',
    category: 'benefits',
    icon: 'Wallet',
    fields: [
      { name: 'employee_id', required: true, type: 'string', description: 'Employee identifier', example: 'EMP001' },
      { name: 'benefit_code', required: true, type: 'string', description: 'Benefit identifier', example: 'MED-001' },
      { name: 'fiscal_year', required: true, type: 'number', description: 'Year for this entitlement', example: '2024' },
      { name: 'annual_allowance_aed', required: true, type: 'currency', description: 'Allocated amount in AED', example: '50000' },
      { name: 'utilized_amount_aed', required: false, type: 'currency', description: 'Already used amount', example: '15000' },
      { name: 'effective_from', required: false, type: 'date', format: 'YYYY-MM-DD', description: 'Start date', example: '2024-01-01' },
      { name: 'effective_to', required: false, type: 'date', format: 'YYYY-MM-DD', description: 'End date', example: '2024-12-31' },
      { name: 'notes', required: false, type: 'string', description: 'Additional notes', example: 'Pro-rated for mid-year join' },
    ],
    exampleRows: [
      { employee_id: 'EMP001', benefit_code: 'MED-001', fiscal_year: 2024, annual_allowance_aed: 50000, utilized_amount_aed: 15000, effective_from: '2024-01-01', effective_to: '2024-12-31', notes: '' },
      { employee_id: 'EMP001', benefit_code: 'EDU-001', fiscal_year: 2024, annual_allowance_aed: 30000, utilized_amount_aed: 0, effective_from: '2024-01-01', effective_to: '2024-12-31', notes: '' },
      { employee_id: 'EMP002', benefit_code: 'MED-001', fiscal_year: 2024, annual_allowance_aed: 40000, utilized_amount_aed: 5000, effective_from: '2024-01-01', effective_to: '2024-12-31', notes: 'Pro-rated for mid-year join' },
    ],
    notes: [
      'Employee ID must exist in the employee master',
      'Benefit code must exist in the benefits catalog',
      'Utilized amount is for importing historical data; leave blank for new entitlements',
      'For mid-year hires, adjust annual_allowance_aed to the pro-rated amount',
      'All amounts are in AED',
    ],
  },
  {
    id: 'claims_import',
    name: 'Claims Import',
    nameAr: 'استيراد المطالبات',
    description: 'Import historical claims for migration purposes.',
    descriptionAr: 'استيراد المطالبات التاريخية لأغراض الترحيل.',
    category: 'claims',
    icon: 'FileText',
    fields: [
      { name: 'claim_reference', required: true, type: 'string', description: 'External claim ID', example: 'CLM-2024-001' },
      { name: 'employee_id', required: true, type: 'string', description: 'Employee identifier', example: 'EMP001' },
      { name: 'benefit_code', required: true, type: 'string', description: 'Benefit identifier', example: 'MED-001' },
      { name: 'claim_date', required: true, type: 'date', format: 'YYYY-MM-DD', description: 'Date claim was submitted', example: '2024-02-15' },
      { name: 'amount_claimed_aed', required: true, type: 'currency', description: 'Amount requested in AED', example: '5000' },
      { name: 'amount_approved_aed', required: false, type: 'currency', description: 'Amount approved in AED', example: '4500' },
      { name: 'status', required: true, type: 'enum', enumValues: ['submitted', 'approved', 'rejected', 'paid', 'closed'], description: 'Current claim status', example: 'paid' },
      { name: 'paid_date', required: false, type: 'date', format: 'YYYY-MM-DD', description: 'Date payment was made', example: '2024-02-28' },
      { name: 'vendor_name', required: false, type: 'string', description: 'Service provider name', example: 'City Hospital' },
      { name: 'description', required: false, type: 'string', description: 'Claim description', example: 'Medical consultation' },
    ],
    exampleRows: [
      { claim_reference: 'CLM-2024-001', employee_id: 'EMP001', benefit_code: 'MED-001', claim_date: '2024-02-15', amount_claimed_aed: 5000, amount_approved_aed: 4500, status: 'paid', paid_date: '2024-02-28', vendor_name: 'City Hospital', description: 'Medical consultation' },
      { claim_reference: 'CLM-2024-002', employee_id: 'EMP002', benefit_code: 'MED-001', claim_date: '2024-03-01', amount_claimed_aed: 3000, amount_approved_aed: 3000, status: 'paid', paid_date: '2024-03-15', vendor_name: 'National Clinic', description: 'Lab tests' },
      { claim_reference: 'CLM-2024-003', employee_id: 'EMP001', benefit_code: 'EDU-001', claim_date: '2024-01-10', amount_claimed_aed: 15000, amount_approved_aed: 15000, status: 'approved', paid_date: '', vendor_name: 'Dubai International School', description: 'School tuition Q1' },
    ],
    notes: [
      'Use this template only for migrating historical claims from other systems',
      'Claims marked as "paid" will update employee utilization balances',
      'Claim reference must be unique across all imports',
      'Status values: submitted, approved, rejected, paid, closed',
      'Paid date is required for claims with status "paid"',
    ],
  },
];

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATE_DEFINITIONS.find(t => t.id === id);
}

export function getTemplatesByCategory(category: TemplateDefinition['category']): TemplateDefinition[] {
  return TEMPLATE_DEFINITIONS.filter(t => t.category === category);
}

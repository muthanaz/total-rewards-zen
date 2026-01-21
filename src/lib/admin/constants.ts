/**
 * Admin Portal Constants & Shared Enums
 * Language + Formatting Spec v1.0
 */

// ============= SHARED ENUMS =============

export type RunStatus = 'success' | 'running' | 'partial' | 'failed' | 'pending';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'investigating' | 'snoozed' | 'resolved';
export type ViolationStatus = 'open' | 'acknowledged' | 'snoozed' | 'resolved';
export type LifecycleStage = 'invited' | 'onboarding' | 'active' | 'offboarding' | 'deactivated';
export type OrgStatus = 'active' | 'suspended' | 'trial';
export type InvoiceStatus = 'paid' | 'pending' | 'overdue';
export type PolicyStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

// ============= NORTH STAR DEMO ORGANIZATIONS =============

export const NORTH_STAR_ORGS = [
  { id: 'org_acme', name: 'Acme Corp', plan: 'Enterprise', mrr: 15000, employees: 1250, status: 'active' as OrgStatus },
  { id: 'org_retail', name: 'RetailMax', plan: 'Starter', mrr: 2500, employees: 85, status: 'active' as OrgStatus },
  { id: 'org_global', name: 'GlobalBank', plan: 'Enterprise', mrr: 15000, employees: 2100, status: 'active' as OrgStatus },
  { id: 'org_tech', name: 'TechStart Inc', plan: 'Professional', mrr: 7500, employees: 320, status: 'active' as OrgStatus },
  { id: 'org_health', name: 'HealthCo', plan: 'Professional', mrr: 7500, employees: 450, status: 'trial' as OrgStatus },
] as const;

export const NORTH_STAR_ORG_NAMES = NORTH_STAR_ORGS.map(o => o.name);

// ============= STATUS CONFIGURATIONS =============

import { 
  CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, 
  Loader2, Ban, Eye, Archive, Edit2, Globe, Send, Shield,
  Bell, AlertCircle, Building2, Users
} from 'lucide-react';

export const RUN_STATUS_CONFIG: Record<RunStatus, { 
  label: string; 
  labelAr: string; 
  color: string; 
  icon: typeof CheckCircle 
}> = {
  success: { label: 'Success', labelAr: 'نجاح', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
  running: { label: 'Running', labelAr: 'قيد التشغيل', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: RefreshCw },
  partial: { label: 'Partial', labelAr: 'جزئي', color: 'bg-warning/10 text-warning border-warning/30', icon: AlertTriangle },
  failed: { label: 'Failed', labelAr: 'فشل', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
  pending: { label: 'Pending', labelAr: 'معلق', color: 'bg-muted text-muted-foreground border-border', icon: Clock },
};

export const SEVERITY_CONFIG: Record<Severity, { 
  label: string; 
  labelAr: string; 
  color: string; 
  textColor: string;
  icon: typeof AlertCircle;
  borderColor: string;
}> = {
  critical: { label: 'Critical', labelAr: 'حرج', color: 'bg-destructive text-destructive-foreground', textColor: 'text-destructive', icon: XCircle, borderColor: 'border-l-destructive' },
  high: { label: 'High', labelAr: 'عالي', color: 'bg-warning text-warning-foreground', textColor: 'text-warning', icon: AlertTriangle, borderColor: 'border-l-warning' },
  medium: { label: 'Medium', labelAr: 'متوسط', color: 'bg-primary text-primary-foreground', textColor: 'text-primary', icon: AlertCircle, borderColor: 'border-l-primary' },
  low: { label: 'Low', labelAr: 'منخفض', color: 'bg-muted text-muted-foreground', textColor: 'text-muted-foreground', icon: Bell, borderColor: 'border-l-muted-foreground' },
};

export const ALERT_STATUS_CONFIG: Record<AlertStatus, { 
  label: string; 
  labelAr: string; 
  color: string 
}> = {
  open: { label: 'Open', labelAr: 'مفتوح', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  investigating: { label: 'Investigating', labelAr: 'قيد التحقيق', color: 'bg-warning/10 text-warning border-warning/30' },
  snoozed: { label: 'Snoozed', labelAr: 'مؤجل', color: 'bg-muted text-muted-foreground border-border' },
  resolved: { label: 'Resolved', labelAr: 'محلول', color: 'bg-success/10 text-success border-success/30' },
};

export const LIFECYCLE_CONFIG: Record<LifecycleStage, { 
  label: string; 
  labelAr: string;
  color: string 
}> = {
  invited: { label: 'Invited', labelAr: 'مدعو', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  onboarding: { label: 'Onboarding', labelAr: 'التهيئة', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  active: { label: 'Active', labelAr: 'نشط', color: 'bg-success/10 text-success border-success/30' },
  offboarding: { label: 'Offboarding', labelAr: 'الانتهاء', color: 'bg-warning/10 text-warning border-warning/30' },
  deactivated: { label: 'Deactivated', labelAr: 'معطل', color: 'bg-muted text-muted-foreground border-border' },
};

export const ORG_STATUS_CONFIG: Record<OrgStatus, { 
  label: string; 
  labelAr: string; 
  color: string 
}> = {
  active: { label: 'Active', labelAr: 'نشط', color: 'bg-success/10 text-success border-success/30' },
  suspended: { label: 'Suspended', labelAr: 'معلق', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  trial: { label: 'Trial', labelAr: 'تجريبي', color: 'bg-warning/10 text-warning border-warning/30' },
};

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { 
  label: string; 
  labelAr: string; 
  color: string;
  icon: typeof CheckCircle;
}> = {
  paid: { label: 'Paid', labelAr: 'مدفوع', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
  pending: { label: 'Pending', labelAr: 'معلق', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  overdue: { label: 'Overdue', labelAr: 'متأخر', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: AlertTriangle },
};

export const POLICY_STATUS_CONFIG: Record<PolicyStatus, { 
  label: string; 
  labelAr: string; 
  color: string;
  icon: typeof Edit2;
}> = {
  draft: { label: 'Draft', labelAr: 'مسودة', color: 'bg-muted text-muted-foreground border-border', icon: Edit2 },
  in_review: { label: 'In Review', labelAr: 'قيد المراجعة', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  approved: { label: 'Approved', labelAr: 'موافق عليه', color: 'bg-primary/10 text-primary border-primary/30', icon: CheckCircle },
  published: { label: 'Published', labelAr: 'منشور', color: 'bg-success/10 text-success border-success/30', icon: Globe },
  archived: { label: 'Archived', labelAr: 'مؤرشف', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: Archive },
};

// ============= CONNECTORS =============

export const CONNECTOR_TYPES = [
  { id: 'workday', name: 'Workday', icon: '🔷', category: 'HRIS' },
  { id: 'sap_sf', name: 'SAP SuccessFactors', icon: '🟦', category: 'HRIS' },
  { id: 'oracle_hcm', name: 'Oracle HCM', icon: '🔶', category: 'HRIS' },
  { id: 'bamboohr', name: 'BambooHR', icon: '🌿', category: 'HRIS' },
  { id: 'csv_sftp', name: 'CSV/SFTP', icon: '📁', category: 'Manual' },
] as const;

// ============= PERMISSION SETS =============

export const PERMISSION_SETS = [
  { id: 'hr_ops', name: 'HR Ops', nameAr: 'عمليات الموارد البشرية', permissions: ['view_employees', 'manage_claims', 'view_reports'] },
  { id: 'finance', name: 'Finance', nameAr: 'المالية', permissions: ['view_billing', 'manage_payments', 'view_reports'] },
  { id: 'claims', name: 'Claims', nameAr: 'المطالبات', permissions: ['manage_claims', 'approve_claims', 'view_employees'] },
  { id: 'admin', name: 'Admin', nameAr: 'المسؤول', permissions: ['all'] },
] as const;

// ============= EMPTY STATE MESSAGES =============

export const EMPTY_STATES = {
  noData: {
    title: 'No data available',
    titleAr: 'لا توجد بيانات',
    action: 'Connect a data source to get started',
    actionAr: 'قم بتوصيل مصدر بيانات للبدء',
  },
  noResults: {
    title: 'No results found',
    titleAr: 'لم يتم العثور على نتائج',
    action: 'Try adjusting your filters',
    actionAr: 'حاول تعديل الفلاتر',
  },
  noAlerts: {
    title: 'All clear!',
    titleAr: 'كل شيء على ما يرام!',
    action: 'No alerts require attention',
    actionAr: 'لا توجد تنبيهات تتطلب الانتباه',
  },
  noViolations: {
    title: 'No violations',
    titleAr: 'لا توجد مخالفات',
    action: 'All data quality rules are passing',
    actionAr: 'جميع قواعد جودة البيانات ناجحة',
  },
} as const;

// ============= ERROR PATTERNS =============

export interface ErrorPattern {
  code: string;
  what: string;
  whatAr: string;
  why: string;
  whyAr: string;
  action: string;
  actionAr: string;
}

export const ERROR_PATTERNS: Record<string, ErrorPattern> = {
  API_RATE_LIMIT: {
    code: 'API_RATE_LIMIT',
    what: 'API rate limit exceeded',
    whatAr: 'تم تجاوز حد معدل الطلبات',
    why: 'Too many requests sent to the external API in a short period',
    whyAr: 'تم إرسال طلبات كثيرة جداً للـ API الخارجي في فترة قصيرة',
    action: 'Wait for the rate limit window to reset, then retry',
    actionAr: 'انتظر حتى يتم إعادة ضبط نافذة المعدل، ثم أعد المحاولة',
  },
  SFTP_AUTH_TIMEOUT: {
    code: 'SFTP_AUTH_TIMEOUT',
    what: 'SFTP connection timed out',
    whatAr: 'انتهت مهلة اتصال SFTP',
    why: 'Authentication failed or server is unreachable',
    whyAr: 'فشلت المصادقة أو الخادم غير قابل للوصول',
    action: 'Verify SFTP credentials and check firewall rules',
    actionAr: 'تحقق من بيانات اعتماد SFTP وتحقق من قواعد جدار الحماية',
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    what: 'Data validation failed',
    whatAr: 'فشل التحقق من البيانات',
    why: 'Some records do not meet the required format or constraints',
    whyAr: 'بعض السجلات لا تستوفي التنسيق أو القيود المطلوبة',
    action: 'Review the failed records and correct the data at source',
    actionAr: 'راجع السجلات الفاشلة وصحح البيانات في المصدر',
  },
  CONNECTION_REFUSED: {
    code: 'CONNECTION_REFUSED',
    what: 'Connection refused by remote server',
    whatAr: 'تم رفض الاتصال من الخادم البعيد',
    why: 'The remote server actively refused the connection',
    whyAr: 'رفض الخادم البعيد الاتصال بشكل فعال',
    action: 'Check if the service is running and IP is whitelisted',
    actionAr: 'تحقق مما إذا كانت الخدمة تعمل وأن IP مسموح به',
  },
};

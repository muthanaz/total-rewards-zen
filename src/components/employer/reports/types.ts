/**
 * Reports Module Types
 * 
 * Curated executive and operations report library.
 */

export type ReportCategory = 'executive' | 'operations' | 'finance' | 'compliance';
export type ExportFormat = 'pdf' | 'excel' | 'csv';
export type ReportStatus = 'ready' | 'generating' | 'failed';

export interface ReportDefinition {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  category: ReportCategory;
  icon: string;
  supportedFormats: ExportFormat[];
  defaultFormat: ExportFormat;
  supportsSegmentFilter: boolean;
  supportsTimeRange: boolean;
  estimatedGenerationTime: string; // e.g., "~30 seconds"
  lastGenerated?: Date;
  schedulable: boolean;
}

export interface ReportFilters {
  timeRange: TimeRangeOption;
  customStartDate?: Date;
  customEndDate?: Date;
  segments?: string[];
  departments?: string[];
  grades?: string[];
}

export type TimeRangeOption = 'mtd' | 'qtd' | 'ytd' | 'last_month' | 'last_quarter' | 'custom';

export interface SavedPreset {
  id: string;
  name: string;
  reportId: string;
  filters: ReportFilters;
  createdAt: Date;
  createdBy: string;
  isDefault?: boolean;
}

export interface GeneratedReport {
  id: string;
  reportDefinitionId: string;
  filters: ReportFilters;
  generatedAt: Date;
  generatedBy: string;
  format: ExportFormat;
  status: ReportStatus;
  downloadUrl?: string;
  expiresAt?: Date;
  metadata?: {
    recordCount?: number;
    pageCount?: number;
    fileSize?: string;
  };
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'table' | 'chart' | 'kpi_grid';
  data?: Record<string, unknown>;
}

export const REPORT_CATEGORY_CONFIG: Record<ReportCategory, {
  label: string;
  labelAr: string;
  color: string;
}> = {
  executive: {
    label: 'Executive',
    labelAr: 'تنفيذي',
    color: 'bg-primary/10 text-primary border-primary/20',
  },
  operations: {
    label: 'Operations',
    labelAr: 'العمليات',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  finance: {
    label: 'Finance',
    labelAr: 'المالية',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  compliance: {
    label: 'Compliance',
    labelAr: 'الامتثال',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
};

export const TIME_RANGE_OPTIONS: { value: TimeRangeOption; label: string }[] = [
  { value: 'mtd', label: 'Month to Date' },
  { value: 'qtd', label: 'Quarter to Date' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'custom', label: 'Custom Range' },
];

export const EXPORT_FORMAT_CONFIG: Record<ExportFormat, {
  label: string;
  icon: string;
  mimeType: string;
}> = {
  pdf: {
    label: 'PDF',
    icon: 'FileText',
    mimeType: 'application/pdf',
  },
  excel: {
    label: 'Excel',
    icon: 'FileSpreadsheet',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  csv: {
    label: 'CSV',
    icon: 'FileCode',
    mimeType: 'text/csv',
  },
};

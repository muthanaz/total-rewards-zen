/**
 * Reports Mock Data
 */

import { ReportDefinition, SavedPreset, GeneratedReport } from './types';

export const DEFAULT_REPORTS: ReportDefinition[] = [
  {
    id: 'executive-monthly-brief',
    name: 'Executive Monthly Brief',
    nameAr: 'الموجز التنفيذي الشهري',
    description: 'High-level summary of benefits investment, utilization trends, budget variance, and key actions for C-suite review.',
    category: 'executive',
    icon: 'Briefcase',
    supportedFormats: ['pdf'],
    defaultFormat: 'pdf',
    supportsSegmentFilter: false,
    supportsTimeRange: true,
    estimatedGenerationTime: '~30 seconds',
    lastGenerated: new Date('2026-01-25'),
    schedulable: true,
  },
  {
    id: 'spend-forecast-pack',
    name: 'Spend & Forecast Pack',
    nameAr: 'حزمة الإنفاق والتوقعات',
    description: 'Detailed budget vs. actual analysis, category breakdowns, projected year-end spend, and variance drivers.',
    category: 'finance',
    icon: 'TrendingUp',
    supportedFormats: ['pdf', 'excel'],
    defaultFormat: 'excel',
    supportsSegmentFilter: true,
    supportsTimeRange: true,
    estimatedGenerationTime: '~45 seconds',
    lastGenerated: new Date('2026-01-20'),
    schedulable: true,
  },
  {
    id: 'sla-throughput-ops',
    name: 'SLA & Throughput Ops Report',
    nameAr: 'تقرير مستوى الخدمة والإنتاجية',
    description: 'Claims processing times, SLA compliance rates, queue depth trends, and bottleneck analysis for operations teams.',
    category: 'operations',
    icon: 'Clock',
    supportedFormats: ['pdf', 'excel'],
    defaultFormat: 'pdf',
    supportsSegmentFilter: true,
    supportsTimeRange: true,
    estimatedGenerationTime: '~30 seconds',
    lastGenerated: new Date('2026-01-27'),
    schedulable: true,
  },
  {
    id: 'settlements-reconciliation',
    name: 'Settlements Reconciliation Report',
    nameAr: 'تقرير تسوية المدفوعات',
    description: 'Payroll-ready export of approved claims, settlement batch status, and finance reconciliation data.',
    category: 'finance',
    icon: 'Banknote',
    supportedFormats: ['excel', 'csv'],
    defaultFormat: 'excel',
    supportsSegmentFilter: false,
    supportsTimeRange: true,
    estimatedGenerationTime: '~20 seconds',
    lastGenerated: new Date('2026-01-28'),
    schedulable: false,
  },
  {
    id: 'benchmark-gap-report',
    name: 'Benchmark Gap Report',
    nameAr: 'تقرير فجوة المقارنة المعيارية',
    description: 'Peer comparison analysis showing where your organization stands vs. industry benchmarks with gap drivers.',
    category: 'executive',
    icon: 'BarChart3',
    supportedFormats: ['pdf'],
    defaultFormat: 'pdf',
    supportsSegmentFilter: false,
    supportsTimeRange: false,
    estimatedGenerationTime: '~60 seconds',
    lastGenerated: new Date('2026-01-15'),
    schedulable: true,
  },
];

export const SAVED_PRESETS: SavedPreset[] = [
  {
    id: 'preset-1',
    name: 'Q1 Executive Review',
    reportId: 'executive-monthly-brief',
    filters: {
      timeRange: 'qtd',
    },
    createdAt: new Date('2026-01-10'),
    createdBy: 'Sarah Ahmed',
    isDefault: true,
  },
  {
    id: 'preset-2',
    name: 'Engineering Dept Only',
    reportId: 'spend-forecast-pack',
    filters: {
      timeRange: 'ytd',
      departments: ['engineering'],
    },
    createdAt: new Date('2026-01-15'),
    createdBy: 'Mohammed Ali',
  },
  {
    id: 'preset-3',
    name: 'Weekly SLA Check',
    reportId: 'sla-throughput-ops',
    filters: {
      timeRange: 'mtd',
    },
    createdAt: new Date('2026-01-20'),
    createdBy: 'Fatima Hassan',
    isDefault: true,
  },
];

export const RECENT_REPORTS: GeneratedReport[] = [
  {
    id: 'gen-1',
    reportDefinitionId: 'executive-monthly-brief',
    filters: { timeRange: 'mtd' },
    generatedAt: new Date('2026-01-28T10:30:00'),
    generatedBy: 'Sarah Ahmed',
    format: 'pdf',
    status: 'ready',
    downloadUrl: '#',
    expiresAt: new Date('2026-02-04'),
    metadata: {
      pageCount: 8,
      fileSize: '2.4 MB',
    },
  },
  {
    id: 'gen-2',
    reportDefinitionId: 'sla-throughput-ops',
    filters: { timeRange: 'last_month' },
    generatedAt: new Date('2026-01-27T14:15:00'),
    generatedBy: 'Fatima Hassan',
    format: 'excel',
    status: 'ready',
    downloadUrl: '#',
    expiresAt: new Date('2026-02-03'),
    metadata: {
      recordCount: 1245,
      fileSize: '856 KB',
    },
  },
  {
    id: 'gen-3',
    reportDefinitionId: 'settlements-reconciliation',
    filters: { timeRange: 'mtd' },
    generatedAt: new Date('2026-01-28T09:00:00'),
    generatedBy: 'Mohammed Ali',
    format: 'csv',
    status: 'ready',
    downloadUrl: '#',
    expiresAt: new Date('2026-02-04'),
    metadata: {
      recordCount: 342,
      fileSize: '124 KB',
    },
  },
];

export const MOCK_SEGMENTS = [
  { id: 'engineering', name: 'Engineering' },
  { id: 'sales', name: 'Sales' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'operations', name: 'Operations' },
  { id: 'hr', name: 'Human Resources' },
  { id: 'finance', name: 'Finance' },
];

export const MOCK_GRADES = [
  { id: 'L1', name: 'Grade L1' },
  { id: 'L2', name: 'Grade L2' },
  { id: 'L3', name: 'Grade L3' },
  { id: 'L4', name: 'Grade L4' },
  { id: 'L5', name: 'Grade L5+' },
];

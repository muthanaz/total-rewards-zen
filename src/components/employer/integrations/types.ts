/**
 * Integration Executive Trust Types
 * 
 * Defines types for integration status, coverage, and data-to-dashboard mapping.
 */

export type IntegrationHealthStatus = 'healthy' | 'degraded' | 'disconnected' | 'syncing';

export interface IntegrationSource {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'hris' | 'payroll' | 'claims' | 'benefits' | 'finance' | 'custom';
  status: IntegrationHealthStatus;
  lastSyncAt: Date | null;
  nextSyncAt: Date | null;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  coverage: number; // 0-100
  recordsTotal: number;
  recordsSynced: number;
  recordsFailed: number;
  dataFreshness: 'current' | 'stale' | 'very_stale';
  poweredDashboards: DashboardMapping[];
  issues: IntegrationIssue[];
  connectionDetails?: {
    endpoint?: string;
    lastPingMs?: number;
    certificateExpiry?: Date;
  };
}

export interface DashboardMapping {
  dashboardId: string;
  dashboardName: string;
  dashboardPath: string;
  dataFields: string[];
  confidenceImpact: 'critical' | 'high' | 'medium' | 'low';
  lastDataUpdate: Date;
}

export interface IntegrationIssue {
  id: string;
  type: 'auth' | 'mapping' | 'sync' | 'coverage' | 'quality';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  detectedAt: Date;
  fixAction?: string;
  fixPath?: string;
}

export interface IntegrationStats {
  totalSources: number;
  connectedSources: number;
  healthySources: number;
  degradedSources: number;
  overallCoverage: number;
  dataReadinessScore: number;
  lastGlobalSync: Date | null;
  pendingIssues: number;
}

// Data Quality Types
export interface DataQualityRule {
  id: string;
  name: string;
  description: string;
  category: 'completeness' | 'accuracy' | 'timeliness' | 'consistency' | 'validity';
  severity: 'critical' | 'high' | 'medium' | 'low';
  dataSource: string;
  status: 'passing' | 'failing' | 'warning' | 'disabled';
  lastChecked: Date | null;
  violationCount: number;
  affectedRecords: number;
  impactedKPIs: KPIImpact[];
  fixGuidance: string;
  autoFixAvailable: boolean;
}

export interface KPIImpact {
  kpiId: string;
  kpiName: string;
  impactLevel: 'blocking' | 'degraded' | 'minor';
  confidenceReduction: number; // percentage points
  dashboardPath: string;
}

export interface DataReadinessScore {
  overall: number; // 0-100
  completeness: number;
  accuracy: number;
  timeliness: number;
  consistency: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

// Audit Log Types
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  actor: {
    userId: string;
    name: string;
    role: string;
    email?: string;
  };
  action: AuditAction;
  resource: {
    type: AuditResourceType;
    id: string;
    name: string;
  };
  outcome: 'success' | 'failure' | 'partial';
  details: string;
  metadata?: Record<string, unknown>;
  isPIIAccess: boolean;
  piiFields?: string[];
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export type AuditAction = 
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'login'
  | 'logout'
  | 'approve'
  | 'reject'
  | 'sync'
  | 'pii_access'
  | 'bulk_action'
  | 'permission_change'
  | 'config_change';

export type AuditResourceType =
  | 'employee'
  | 'claim'
  | 'policy'
  | 'integration'
  | 'report'
  | 'workflow'
  | 'user'
  | 'settings'
  | 'budget'
  | 'sensitive_data';

export interface AuditLogFilters {
  searchQuery: string;
  dateRange: { start: Date | null; end: Date | null };
  actors: string[];
  actions: AuditAction[];
  resourceTypes: AuditResourceType[];
  outcomes: ('success' | 'failure' | 'partial')[];
  piiOnly: boolean;
}

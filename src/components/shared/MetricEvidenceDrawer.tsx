/**
 * MetricEvidenceDrawer
 * 
 * A comprehensive evidence drawer for metrics/KPIs showing:
 * - Summary: definition, current value, target, delta, key drivers
 * - Calculation: formula text + inputs list
 * - Data: sources with coverage %, freshness, missing fields
 * - Audit: last calculated, data snapshot, policy version, model tag
 * - Segments: mini table with top 5 impacted by Dept/Grade/Location
 * 
 * CTA footer: "Create action from this insight"
 */

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Database,
  Calculator,
  ClipboardList,
  History,
  Users,
  Building2,
  MapPin,
  Layers,
  ExternalLink,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Info,
} from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent, formatDate, formatRelativeTime } from '@/lib/utils';
import { ConfidenceBadge } from '@/components/shared/ConfidenceBadge';
import type { ConfidenceLevel } from '@/lib/metrics';
import { Link } from 'react-router-dom';

// ============================================================================
// TYPES
// ============================================================================

export interface MetricEvidenceData {
  // Identity
  metricKey: string;
  metricName: string;
  
  // Summary tab
  definition: string;
  currentValue: number | string;
  formattedValue: string;
  target?: number | string;
  formattedTarget?: string;
  deltaToTarget?: number;
  unit: 'currency' | 'percent' | 'number' | 'days' | 'score';
  keyDrivers?: Array<{
    name: string;
    impact: number; // positive = contributes, negative = detracts
    description?: string;
  }>;
  
  // Confidence
  confidence: ConfidenceLevel;
  isEstimated?: boolean;
  estimationReason?: string;
  
  // Calculation tab
  formula?: string;
  formulaInputs?: Array<{
    name: string;
    value: string | number;
    source: string;
  }>;
  
  // Data tab
  dataSources?: Array<{
    name: string;
    coverage: number; // 0-100
    lastSync: Date | string;
    status: 'connected' | 'partial' | 'stale' | 'missing';
    missingFields?: string[];
  }>;
  
  // Audit tab
  lastCalculated?: Date | string;
  dataSnapshotId?: string;
  policyVersion?: string;
  modelVersion?: string;
  calculationNote?: string;
  
  // Segments tab
  segmentBreakdown?: Array<{
    dimension: 'department' | 'grade' | 'location';
    name: string;
    value: number | string;
    delta?: number;
    employeeCount?: number;
  }>;
  fullBreakdownLink?: string;
}

interface MetricEvidenceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: MetricEvidenceData | null;
  onCreateAction?: (data: MetricEvidenceData) => void;
}

// ============================================================================
// SUMMARY TAB
// ============================================================================

function SummaryTab({ data }: { data: MetricEvidenceData }) {
  const isAboveTarget = data.deltaToTarget !== undefined && data.deltaToTarget >= 0;
  
  return (
    <div className="space-y-4">
      {/* Definition */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Definition</p>
        <p className="text-sm">{data.definition}</p>
      </div>
      
      {/* Current vs Target */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">Current</p>
          <p className="text-xl font-bold mt-1">{data.formattedValue}</p>
        </div>
        {data.formattedTarget && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-xl font-bold mt-1">{data.formattedTarget}</p>
          </div>
        )}
        {data.deltaToTarget !== undefined && (
          <div className={cn(
            "p-4 rounded-lg",
            isAboveTarget ? "bg-success/10" : "bg-destructive/10"
          )}>
            <p className="text-xs text-muted-foreground">Delta to Target</p>
            <p className={cn(
              "text-xl font-bold mt-1 flex items-center gap-1",
              isAboveTarget ? "text-success" : "text-destructive"
            )}>
              {isAboveTarget ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {data.deltaToTarget > 0 ? '+' : ''}{data.unit === 'percent' || data.unit === 'score' ? `${data.deltaToTarget}%` : formatCurrencyAED(data.deltaToTarget, { abbreviate: true })}
            </p>
          </div>
        )}
      </div>
      
      {/* Estimation badge */}
      {data.isEstimated && (
        <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning">Estimated Value</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.estimationReason || 'This metric is derived from partial data and may not reflect exact values.'}
            </p>
          </div>
        </div>
      )}
      
      {/* Key Drivers */}
      {data.keyDrivers && data.keyDrivers.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-3">Key Drivers</p>
          <div className="space-y-2">
            {data.keyDrivers.map((driver, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    driver.impact >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}>
                    {driver.impact >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{driver.name}</p>
                    {driver.description && (
                      <p className="text-xs text-muted-foreground">{driver.description}</p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className={cn(
                  "text-xs",
                  driver.impact >= 0 ? "text-success border-success/30" : "text-destructive border-destructive/30"
                )}>
                  {driver.impact > 0 ? '+' : ''}{driver.impact}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CALCULATION TAB
// ============================================================================

function CalculationTab({ data }: { data: MetricEvidenceData }) {
  return (
    <div className="space-y-4">
      {/* Formula */}
      {data.formula && (
        <div className="p-4 bg-muted/50 rounded-lg border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Formula</p>
          <code className="text-sm font-mono">{data.formula}</code>
        </div>
      )}
      
      {/* Inputs List */}
      {data.formulaInputs && data.formulaInputs.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-3">Inputs</p>
          <div className="space-y-2">
            {data.formulaInputs.map((input, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{input.name}</p>
                  <p className="text-xs text-muted-foreground">Source: {input.source}</p>
                </div>
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {typeof input.value === 'number' ? formatCurrencyAED(input.value, { abbreviate: true }) : input.value}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!data.formula && !data.formulaInputs?.length && (
        <div className="text-center py-8 text-muted-foreground">
          <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Calculation details not available for this metric.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DATA TAB
// ============================================================================

function DataTab({ data }: { data: MetricEvidenceData }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'partial': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'stale': return <Clock className="w-4 h-4 text-warning" />;
      case 'missing': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'partial': return 'Partial';
      case 'stale': return 'Stale';
      case 'missing': return 'Missing';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      {data.dataSources && data.dataSources.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.dataSources.map((source, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(source.status)}
                    <p className="font-medium text-sm">{source.name}</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    source.status === 'connected' && "text-success border-success/30",
                    source.status === 'partial' && "text-warning border-warning/30",
                    source.status === 'stale' && "text-warning border-warning/30",
                    source.status === 'missing' && "text-destructive border-destructive/30"
                  )}>
                    {getStatusLabel(source.status)}
                  </Badge>
                </div>
                
                {/* Coverage */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-muted-foreground w-16">Coverage</span>
                  <Progress value={source.coverage} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium w-10 text-right">{source.coverage}%</span>
                </div>
                
                {/* Freshness */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-muted-foreground w-16">Last sync</span>
                  <span className="text-xs">{formatRelativeTime(source.lastSync)}</span>
                </div>
                
                {/* Missing Fields */}
                {source.missingFields && source.missingFields.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Missing fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {source.missingFields.map((field, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <Button variant="outline" size="sm" asChild className="w-full gap-2">
            <Link to="/employer/integrations">
              <Database className="w-4 h-4" />
              Go to Integrations
              <ExternalLink className="w-3 h-3" />
            </Link>
          </Button>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Data source details not available.</p>
          <Button variant="outline" size="sm" asChild className="mt-4 gap-2">
            <Link to="/employer/integrations">
              <Database className="w-4 h-4" />
              Manage Integrations
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// AUDIT TAB
// ============================================================================

function AuditTab({ data }: { data: MetricEvidenceData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {data.lastCalculated && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Last Calculated</p>
            <p className="text-sm font-medium mt-1">{formatDate(data.lastCalculated)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(data.lastCalculated)}</p>
          </div>
        )}
        
        {data.dataSnapshotId && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Data Snapshot ID</p>
            <code className="text-sm font-mono mt-1 block">{data.dataSnapshotId}</code>
          </div>
        )}
        
        {data.policyVersion && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Policy Version</p>
            <p className="text-sm font-medium mt-1">{data.policyVersion}</p>
          </div>
        )}
        
        {data.modelVersion && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Model / Version</p>
            <code className="text-sm font-mono mt-1 block">{data.modelVersion}</code>
          </div>
        )}
      </div>
      
      {data.calculationNote && (
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Calculation Notes</p>
          <p className="text-sm">{data.calculationNote}</p>
        </div>
      )}
      
      {!data.lastCalculated && !data.dataSnapshotId && !data.policyVersion && !data.modelVersion && (
        <div className="text-center py-8 text-muted-foreground">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Audit details not available for this metric.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SEGMENTS TAB
// ============================================================================

function SegmentsTab({ data }: { data: MetricEvidenceData }) {
  const getDimensionIcon = (dimension: string) => {
    switch (dimension) {
      case 'department': return <Building2 className="w-4 h-4" />;
      case 'grade': return <Layers className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  // Group by dimension
  const byDepartment = data.segmentBreakdown?.filter(s => s.dimension === 'department').slice(0, 5) || [];
  const byGrade = data.segmentBreakdown?.filter(s => s.dimension === 'grade').slice(0, 5) || [];
  const byLocation = data.segmentBreakdown?.filter(s => s.dimension === 'location').slice(0, 5) || [];

  const renderSegmentTable = (segments: typeof byDepartment, title: string, icon: React.ReactNode) => {
    if (segments.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm font-medium">{title}</p>
        </div>
        <div className="space-y-1">
          {segments.map((segment, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs font-medium">
                  {idx + 1}
                </span>
                <span>{segment.name}</span>
                {segment.employeeCount && (
                  <span className="text-xs text-muted-foreground">({segment.employeeCount})</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">{segment.value}</span>
                {segment.delta !== undefined && (
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    segment.delta >= 0 ? "text-success border-success/30" : "text-destructive border-destructive/30"
                  )}>
                    {segment.delta > 0 ? '+' : ''}{segment.delta}%
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSegmentTable(byDepartment, 'By Department', getDimensionIcon('department'))}
      {renderSegmentTable(byGrade, 'By Grade', getDimensionIcon('grade'))}
      {renderSegmentTable(byLocation, 'By Location', getDimensionIcon('location'))}
      
      {data.fullBreakdownLink && (
        <Button variant="outline" size="sm" asChild className="w-full gap-2">
          <Link to={data.fullBreakdownLink}>
            View Full Breakdown
            <ExternalLink className="w-3 h-3" />
          </Link>
        </Button>
      )}
      
      {!data.segmentBreakdown?.length && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Segment breakdown not available.</p>
          <Button variant="outline" size="sm" asChild className="mt-4 gap-2">
            <Link to="/employer/segments">
              View Segments
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MetricEvidenceDrawer({
  open,
  onOpenChange,
  data,
  onCreateAction,
}: MetricEvidenceDrawerProps) {
  const [activeTab, setActiveTab] = useState('summary');

  if (!data) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <SheetTitle className="flex items-center gap-2 flex-wrap">
                {data.metricName}
                <ConfidenceBadge level={data.confidence} size="sm" />
                {data.isEstimated && (
                  <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                    Estimated
                  </Badge>
                )}
              </SheetTitle>
              <SheetDescription className="mt-1">
                Metric evidence and calculation details
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-5 shrink-0">
            <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
            <TabsTrigger value="calculation" className="text-xs">Calculation</TabsTrigger>
            <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs">Audit</TabsTrigger>
            <TabsTrigger value="segments" className="text-xs">Segments</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="summary" className="m-0">
              <SummaryTab data={data} />
            </TabsContent>
            <TabsContent value="calculation" className="m-0">
              <CalculationTab data={data} />
            </TabsContent>
            <TabsContent value="data" className="m-0">
              <DataTab data={data} />
            </TabsContent>
            <TabsContent value="audit" className="m-0">
              <AuditTab data={data} />
            </TabsContent>
            <TabsContent value="segments" className="m-0">
              <SegmentsTab data={data} />
            </TabsContent>
          </div>
        </Tabs>
        
        <Separator className="my-4" />
        
        <SheetFooter className="shrink-0">
          <Button
            className="w-full gap-2"
            onClick={() => onCreateAction?.(data)}
            disabled={!onCreateAction}
          >
            <Plus className="w-4 h-4" />
            Create Action from This Insight
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// TRIGGER HELPER
// ============================================================================

interface MetricEvidenceTriggerProps {
  children: React.ReactNode;
  data: MetricEvidenceData;
  onCreateAction?: (data: MetricEvidenceData) => void;
  className?: string;
}

export function MetricEvidenceTrigger({
  children,
  data,
  onCreateAction,
  className,
}: MetricEvidenceTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("cursor-pointer hover:opacity-80 transition-opacity", className)}
      >
        {children}
      </button>
      <MetricEvidenceDrawer
        open={open}
        onOpenChange={setOpen}
        data={data}
        onCreateAction={onCreateAction}
      />
    </>
  );
}

// ============================================================================
// DEMO DATA FACTORY
// ============================================================================

export function createMetricEvidenceData(
  metricKey: string,
  metricName: string,
  overrides: Partial<MetricEvidenceData> = {}
): MetricEvidenceData {
  return {
    metricKey,
    metricName,
    definition: `The ${metricName.toLowerCase()} metric measures the performance and health of this particular aspect of your benefits program.`,
    currentValue: 75000,
    formattedValue: 'AED 75K',
    target: 100000,
    formattedTarget: 'AED 100K',
    deltaToTarget: -25,
    unit: 'currency',
    confidence: 'estimated',
    isEstimated: true,
    estimationReason: 'Based on 79% data coverage from connected integrations.',
    keyDrivers: [
      { name: 'Housing allowance increase', impact: 15, description: 'Grade A housing rates up 12% YoY' },
      { name: 'School fee season', impact: 12, description: 'Annual school fee claims' },
      { name: 'Underutilized wellness', impact: -5, description: 'Wellbeing at 34% utilization' },
    ],
    formula: `(Total Eligible Benefits - Claimed Benefits) / Total Eligible Benefits × 100`,
    formulaInputs: [
      { name: 'Total Eligible Benefits', value: 2500000, source: 'HRIS Integration' },
      { name: 'Claimed Benefits', value: 1875000, source: 'Claims System' },
    ],
    dataSources: [
      { name: 'HRIS (SAP)', coverage: 95, lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), status: 'connected' },
      { name: 'Claims System', coverage: 78, lastSync: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'partial', missingFields: ['provider_id', 'diagnosis_code'] },
    ],
    lastCalculated: new Date(),
    dataSnapshotId: 'snap_2026012114',
    policyVersion: 'v2.3',
    modelVersion: 'benefits-calc-v1.2.0',
    segmentBreakdown: [
      { dimension: 'department', name: 'Engineering', value: 'AED 28K', delta: 8, employeeCount: 45 },
      { dimension: 'department', name: 'Sales', value: 'AED 22K', delta: -3, employeeCount: 38 },
      { dimension: 'grade', name: 'Senior', value: 'AED 35K', delta: 12, employeeCount: 25 },
      { dimension: 'grade', name: 'Mid-Level', value: 'AED 18K', delta: 5, employeeCount: 60 },
      { dimension: 'location', name: 'Dubai', value: 'AED 45K', delta: 10, employeeCount: 80 },
    ],
    fullBreakdownLink: '/employer/segments',
    ...overrides,
  };
}

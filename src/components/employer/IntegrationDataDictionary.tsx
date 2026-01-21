/**
 * IntegrationDataDictionary
 * 
 * Lists bnft fields grouped by domain with definitions, formats, 
 * examples, sensitivity tags, and links to metrics that use them.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  DollarSign,
  FileText,
  ClipboardList,
  ShoppingBag,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Info,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { MetricEvidenceTrigger, createMetricEvidenceData } from '@/components/shared';

// Types
export interface DataDictionaryField {
  id: string;
  fieldName: string;
  displayName: string;
  definition: string;
  format: string;
  example: string;
  sensitivity: 'public' | 'internal' | 'pii' | 'sensitive';
  domain: 'employees' | 'payroll' | 'policies' | 'claims' | 'marketplace' | 'surveys';
  completeness: number;
  usedInMetrics: Array<{ key: string; name: string; path: string }>;
  isRequired: boolean;
  sourceSystem?: string;
}

// Domain configuration
const DOMAINS = [
  { id: 'employees', label: 'Employees', icon: Users, color: 'text-blue-500' },
  { id: 'payroll', label: 'Payroll', icon: DollarSign, color: 'text-green-500' },
  { id: 'policies', label: 'Policies', icon: FileText, color: 'text-purple-500' },
  { id: 'claims', label: 'Claims', icon: ClipboardList, color: 'text-amber-500' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, color: 'text-pink-500' },
  { id: 'surveys', label: 'Surveys', icon: BarChart3, color: 'text-cyan-500' },
] as const;

// Sensitivity badges
const SENSITIVITY_CONFIG = {
  public: { label: 'Public', className: 'bg-muted text-muted-foreground' },
  internal: { label: 'Internal', className: 'bg-blue-500/10 text-blue-600' },
  pii: { label: 'PII', className: 'bg-warning/10 text-warning', icon: Shield },
  sensitive: { label: 'Sensitive', className: 'bg-destructive/10 text-destructive', icon: Shield },
};

// Mock data dictionary
const MOCK_DATA_DICTIONARY: DataDictionaryField[] = [
  // Employees
  { id: 'dd-1', fieldName: 'employee_id', displayName: 'Employee ID', definition: 'Unique identifier for each employee in the system', format: 'String (max 50 chars)', example: 'EMP001', sensitivity: 'internal', domain: 'employees', completeness: 100, usedInMetrics: [{ key: 'headcount', name: 'Headcount', path: '/employer' }], isRequired: true, sourceSystem: 'SAP HRIS' },
  { id: 'dd-2', fieldName: 'first_name', displayName: 'First Name', definition: 'Legal first name of the employee', format: 'String (max 100 chars)', example: 'Ahmed', sensitivity: 'pii', domain: 'employees', completeness: 98, usedInMetrics: [], isRequired: true, sourceSystem: 'SAP HRIS' },
  { id: 'dd-3', fieldName: 'last_name', displayName: 'Last Name', definition: 'Legal last name/family name of the employee', format: 'String (max 100 chars)', example: 'Hassan', sensitivity: 'pii', domain: 'employees', completeness: 98, usedInMetrics: [], isRequired: true, sourceSystem: 'SAP HRIS' },
  { id: 'dd-4', fieldName: 'date_of_birth', displayName: 'Date of Birth', definition: 'Employee date of birth for age calculations and eligibility', format: 'Date (YYYY-MM-DD)', example: '1988-03-15', sensitivity: 'pii', domain: 'employees', completeness: 85, usedInMetrics: [{ key: 'avg_age', name: 'Average Age', path: '/employer/segments' }], isRequired: false, sourceSystem: 'SAP HRIS' },
  { id: 'dd-5', fieldName: 'department', displayName: 'Department', definition: 'Organizational department the employee belongs to', format: 'String (max 100 chars)', example: 'Engineering', sensitivity: 'internal', domain: 'employees', completeness: 92, usedInMetrics: [{ key: 'dept_breakdown', name: 'Department Breakdown', path: '/employer/segments' }], isRequired: true, sourceSystem: 'SAP HRIS' },
  { id: 'dd-6', fieldName: 'grade', displayName: 'Grade', definition: 'Employee grade level determining benefits eligibility', format: 'String (G1-G10)', example: 'G5', sensitivity: 'internal', domain: 'employees', completeness: 0, usedInMetrics: [{ key: 'grade_utilization', name: 'Utilization by Grade', path: '/employer/segments' }, { key: 'entitlements', name: 'Entitlements', path: '/employer/spend' }], isRequired: true },
  { id: 'dd-7', fieldName: 'hire_date', displayName: 'Hire Date', definition: 'Date when the employee joined the organization', format: 'Date (YYYY-MM-DD)', example: '2022-01-15', sensitivity: 'internal', domain: 'employees', completeness: 95, usedInMetrics: [{ key: 'tenure', name: 'Tenure Analysis', path: '/employer/segments' }, { key: 'gratuity', name: 'Gratuity Projection', path: '/employee/financial' }], isRequired: true, sourceSystem: 'SAP HRIS' },
  
  // Payroll
  { id: 'dd-8', fieldName: 'base_salary', displayName: 'Base Salary', definition: 'Monthly base salary in AED before allowances', format: 'Numeric (2 decimals)', example: '25000.00', sensitivity: 'sensitive', domain: 'payroll', completeness: 100, usedInMetrics: [{ key: 'total_compensation', name: 'Total Compensation', path: '/employer/spend' }], isRequired: true, sourceSystem: 'Payroll System' },
  { id: 'dd-9', fieldName: 'housing_allowance', displayName: 'Housing Allowance', definition: 'Monthly housing allowance in AED', format: 'Numeric (2 decimals)', example: '8000.00', sensitivity: 'sensitive', domain: 'payroll', completeness: 78, usedInMetrics: [{ key: 'housing_utilization', name: 'Housing Utilization', path: '/employer/spend' }], isRequired: false, sourceSystem: 'Payroll System' },
  { id: 'dd-10', fieldName: 'transport_allowance', displayName: 'Transport Allowance', definition: 'Monthly transport allowance in AED', format: 'Numeric (2 decimals)', example: '2500.00', sensitivity: 'internal', domain: 'payroll', completeness: 85, usedInMetrics: [], isRequired: false, sourceSystem: 'Payroll System' },
  
  // Policies
  { id: 'dd-11', fieldName: 'benefit_plan_id', displayName: 'Benefit Plan ID', definition: 'Identifier for the benefit plan the employee is enrolled in', format: 'String (max 50 chars)', example: 'HEALTH-A1', sensitivity: 'internal', domain: 'policies', completeness: 95, usedInMetrics: [{ key: 'plan_distribution', name: 'Plan Distribution', path: '/employer/policies' }], isRequired: true, sourceSystem: 'Benefits Platform' },
  { id: 'dd-12', fieldName: 'policy_effective_date', displayName: 'Policy Effective Date', definition: 'Date when the policy version became effective', format: 'Date (YYYY-MM-DD)', example: '2025-01-01', sensitivity: 'public', domain: 'policies', completeness: 100, usedInMetrics: [], isRequired: true },
  
  // Claims
  { id: 'dd-13', fieldName: 'claim_id', displayName: 'Claim ID', definition: 'Unique identifier for each claim submission', format: 'String (CLM-YYYY-NNNN)', example: 'CLM-2026-001', sensitivity: 'internal', domain: 'claims', completeness: 100, usedInMetrics: [{ key: 'claim_volume', name: 'Claim Volume', path: '/employer/claims' }], isRequired: true, sourceSystem: 'Claims System' },
  { id: 'dd-14', fieldName: 'amount', displayName: 'Claim Amount', definition: 'Total amount claimed in AED', format: 'Numeric (2 decimals)', example: '1500.00', sensitivity: 'internal', domain: 'claims', completeness: 100, usedInMetrics: [{ key: 'claims_spend', name: 'Claims Spend', path: '/employer/spend' }, { key: 'utilization', name: 'Utilization Rate', path: '/employer' }], isRequired: true, sourceSystem: 'Claims System' },
  { id: 'dd-15', fieldName: 'provider_id', displayName: 'Provider ID', definition: 'Identifier for the service provider (hospital, clinic, etc.)', format: 'String (max 50 chars)', example: 'PROV-001', sensitivity: 'internal', domain: 'claims', completeness: 0, usedInMetrics: [{ key: 'provider_analysis', name: 'Provider Analysis', path: '/employer/claims' }], isRequired: false },
  { id: 'dd-16', fieldName: 'claim_status', displayName: 'Claim Status', definition: 'Current status of the claim in the workflow', format: 'Enum (pending, approved, rejected, paid)', example: 'approved', sensitivity: 'internal', domain: 'claims', completeness: 100, usedInMetrics: [{ key: 'sla_compliance', name: 'SLA Compliance', path: '/employer/claims' }], isRequired: true, sourceSystem: 'Claims System' },
  
  // Marketplace
  { id: 'dd-17', fieldName: 'offer_id', displayName: 'Offer ID', definition: 'Unique identifier for marketplace offers', format: 'UUID', example: '550e8400-e29b-41d4-a716-446655440000', sensitivity: 'public', domain: 'marketplace', completeness: 100, usedInMetrics: [{ key: 'offer_performance', name: 'Offer Performance', path: '/employer/marketplace' }], isRequired: true },
  { id: 'dd-18', fieldName: 'activation_count', displayName: 'Activation Count', definition: 'Number of times an offer has been activated', format: 'Integer', example: '245', sensitivity: 'public', domain: 'marketplace', completeness: 100, usedInMetrics: [{ key: 'engagement_rate', name: 'Engagement Rate', path: '/employer/marketplace' }], isRequired: true },
  
  // Surveys
  { id: 'dd-19', fieldName: 'satisfaction_score', displayName: 'Satisfaction Score', definition: 'Employee satisfaction rating (1-100 scale)', format: 'Integer (1-100)', example: '85', sensitivity: 'internal', domain: 'surveys', completeness: 65, usedInMetrics: [{ key: 'satisfaction', name: 'Employee Satisfaction', path: '/employer' }], isRequired: false, sourceSystem: 'Survey Tool' },
  { id: 'dd-20', fieldName: 'survey_response_date', displayName: 'Response Date', definition: 'Date when the survey response was submitted', format: 'DateTime (ISO 8601)', example: '2026-01-15T14:30:00Z', sensitivity: 'internal', domain: 'surveys', completeness: 65, usedInMetrics: [], isRequired: false, sourceSystem: 'Survey Tool' },
];

export function IntegrationDataDictionary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [expandedDomains, setExpandedDomains] = useState<string[]>(['employees', 'claims']);
  
  const filteredFields = useMemo(() => {
    return MOCK_DATA_DICTIONARY.filter(field => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!field.fieldName.toLowerCase().includes(query) && 
            !field.displayName.toLowerCase().includes(query) &&
            !field.definition.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (selectedDomain !== 'all' && field.domain !== selectedDomain) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedDomain]);
  
  const fieldsByDomain = useMemo(() => {
    const grouped: Record<string, DataDictionaryField[]> = {};
    DOMAINS.forEach(d => { grouped[d.id] = []; });
    filteredFields.forEach(field => {
      grouped[field.domain].push(field);
    });
    return grouped;
  }, [filteredFields]);
  
  const domainStats = useMemo(() => {
    const stats: Record<string, { total: number; complete: number; incomplete: number; avgCompleteness: number }> = {};
    DOMAINS.forEach(d => {
      const fields = MOCK_DATA_DICTIONARY.filter(f => f.domain === d.id);
      const complete = fields.filter(f => f.completeness >= 90).length;
      const incomplete = fields.filter(f => f.completeness < 70).length;
      const avgCompleteness = Math.round(fields.reduce((sum, f) => sum + f.completeness, 0) / (fields.length || 1));
      stats[d.id] = { total: fields.length, complete, incomplete, avgCompleteness };
    });
    return stats;
  }, []);
  
  const toggleDomain = (domainId: string) => {
    setExpandedDomains(prev => 
      prev.includes(domainId) 
        ? prev.filter(d => d !== domainId)
        : [...prev, domainId]
    );
  };
  
  const getSensitivityBadge = (sensitivity: DataDictionaryField['sensitivity']) => {
    const config = SENSITIVITY_CONFIG[sensitivity];
    const Icon = 'icon' in config ? config.icon : null;
    return (
      <Badge className={cn('text-xs gap-1', config.className)}>
        {Icon && <Icon className="w-3 h-3" />}
        {config.label}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fields by name or definition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              <Button 
                variant={selectedDomain === 'all' ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setSelectedDomain('all')}
              >
                All
              </Button>
              {DOMAINS.map(domain => (
                <Button
                  key={domain.id}
                  variant={selectedDomain === domain.id ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedDomain(domain.id)}
                  className="gap-1"
                >
                  <domain.icon className={cn('w-3.5 h-3.5', domain.color)} />
                  {domain.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Domain Cards */}
      <div className="space-y-4">
        {DOMAINS.map(domain => {
          const fields = fieldsByDomain[domain.id];
          const stats = domainStats[domain.id];
          const isExpanded = expandedDomains.includes(domain.id);
          
          if (selectedDomain !== 'all' && selectedDomain !== domain.id) return null;
          if (fields.length === 0 && searchQuery) return null;
          
          return (
            <Card key={domain.id} className="overflow-hidden">
              <Collapsible open={isExpanded} onOpenChange={() => toggleDomain(domain.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg bg-muted', domain.color)}>
                          <domain.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {domain.label}
                            <Badge variant="outline" className="text-xs font-normal">
                              {stats.total} fields
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-success" />
                              {stats.complete} complete
                            </span>
                            {stats.incomplete > 0 && (
                              <span className="flex items-center gap-1 text-warning">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {stats.incomplete} incomplete
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Progress value={stats.avgCompleteness} className="w-16 h-1.5" />
                              {stats.avgCompleteness}%
                            </span>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="divide-y">
                      {fields.map(field => (
                        <div key={field.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <code className="text-sm font-mono font-medium text-primary">{field.fieldName}</code>
                                {field.isRequired && (
                                  <Badge variant="outline" className="text-xs text-warning border-warning/30">Required</Badge>
                                )}
                                {getSensitivityBadge(field.sensitivity)}
                                {field.sourceSystem && (
                                  <Badge variant="secondary" className="text-xs">{field.sourceSystem}</Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium mb-1">{field.displayName}</p>
                              <p className="text-sm text-muted-foreground mb-2">{field.definition}</p>
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                <span><strong>Format:</strong> {field.format}</span>
                                <span><strong>Example:</strong> <code className="bg-muted px-1 rounded">{field.example}</code></span>
                              </div>
                              
                              {field.usedInMetrics.length > 0 && (
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                  <span className="text-xs text-muted-foreground">Used in:</span>
                              {field.usedInMetrics.map(metric => (
                                    <MetricEvidenceTrigger
                                      key={metric.key}
                                      data={createMetricEvidenceData(metric.key, metric.name, {
                                        definition: `This metric uses the ${field.displayName} field.`,
                                        dataSources: [{ name: field.sourceSystem || 'Manual', coverage: field.completeness, lastSync: new Date(), status: field.completeness >= 90 ? 'connected' : 'partial' }],
                                      })}
                                    >
                                      <Badge 
                                        variant="outline" 
                                        className="text-xs cursor-pointer hover:bg-muted gap-1"
                                      >
                                        <BarChart3 className="w-3 h-3" />
                                        {metric.name}
                                      </Badge>
                                    </MetricEvidenceTrigger>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-2 justify-end mb-1">
                                <Progress 
                                  value={field.completeness} 
                                  className={cn(
                                    "w-16 h-1.5",
                                    field.completeness < 70 && '[&>div]:bg-warning',
                                    field.completeness < 50 && '[&>div]:bg-destructive'
                                  )} 
                                />
                                <span className={cn(
                                  "text-sm font-medium w-10",
                                  field.completeness >= 90 ? 'text-success' : field.completeness >= 70 ? 'text-foreground' : 'text-warning'
                                )}>
                                  {field.completeness}%
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">completeness</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
      
      {filteredFields.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No fields match your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
